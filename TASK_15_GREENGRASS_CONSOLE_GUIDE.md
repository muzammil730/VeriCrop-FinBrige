# Task 15: AWS IoT Greengrass v2 for Offline Capability - Console Setup Guide

## Overview

This guide walks you through setting up AWS IoT Greengrass v2 for offline claim processing with local AI inference, 72-hour data persistence, and automatic cloud sync.

**Estimated Time:** 2-3 hours  
**Region:** ap-south-1 (Mumbai)  
**Prerequisites:** 
- Raspberry Pi 4 (4GB RAM) or Android device with Greengrass support
- SageMaker Neo-compiled model (from Task 4.2)
- AWS Console access

---

## Hardware Requirements

### Option 1: Raspberry Pi 4 (Recommended for Demo)
- **Model:** Raspberry Pi 4 Model B
- **RAM:** 4GB minimum
- **Storage:** 32GB microSD card
- **OS:** Raspberry Pi OS (64-bit)
- **Network:** WiFi capability
- **Cost:** ~₹5,000-7,000 in India

### Option 2: Android Device
- **OS:** Android 8.0 or higher
- **RAM:** 4GB minimum
- **Storage:** 16GB free space
- **Processor:** ARM64 architecture

### Option 3: AWS EC2 Instance (For Testing Only)
- **Instance Type:** t3.medium
- **OS:** Ubuntu 22.04 LTS
- **Note:** Not truly "offline" but useful for testing

---

## Part 1: Prepare Edge Device

### For Raspberry Pi:

#### Step 1: Install Raspberry Pi OS

1. Download Raspberry Pi Imager: https://www.raspberrypi.com/software/
2. Flash Raspberry Pi OS (64-bit) to microSD card
3. Enable SSH during setup
4. Boot Raspberry Pi and connect to WiFi
5. Update system:
```bash
sudo apt update && sudo apt upgrade -y
```

#### Step 2: Install Java Runtime (Required for Greengrass)

```bash
sudo apt install default-jdk -y
java -version  # Should show Java 11 or higher
```

#### Step 3: Create Greengrass User and Group

```bash
sudo useradd --system --create-home ggc_user
sudo groupadd --system ggc_group
```

---

## Part 2: Set Up AWS IoT Greengrass Core

### Step 1: Navigate to IoT Greengrass Console

1. Open AWS Console
2. **Region:** ap-south-1 (Mumbai) - Greengrass IS available here
3. Search for "IoT Greengrass"
4. Click **Core devices** → **Set up one core device**

### Step 2: Create Core Device

1. **Core device name:** `vericrop-field-device-01`
2. **Thing name:** `VeriCropFieldDevice01`
3. **Thing group:** Create new → `VeriCropFieldDevices`
4. Click **Next**

### Step 3: Install Greengrass Core Software

The console will provide a command. Run it on your Raspberry Pi:

```bash
curl -s https://d2s8p88vqu9w66.cloudfront.net/releases/greengrass-nucleus-latest.zip > greengrass-nucleus-latest.zip
unzip greengrass-nucleus-latest.zip -d GreengrassInstaller

sudo -E java -Droot="/greengrass/v2" -Dlog.store=FILE \
  -jar ./GreengrassInstaller/lib/Greengrass.jar \
  --aws-region ap-south-1 \
  --thing-name VeriCropFieldDevice01 \
  --thing-group-name VeriCropFieldDevices \
  --component-default-user ggc_user:ggc_group \
  --provision true \
  --setup-system-service true
```

### Step 4: Verify Installation

```bash
sudo systemctl status greengrass.service
# Should show "active (running)"
```

---

## Task 15.1: Create Greengrass Component for Local AI Inference

### Step 1: Package SageMaker Neo Model

1. Download your Neo-compiled model from Task 4.2
2. Create component directory structure:

```bash
mkdir -p ~/greengrass-components/crop-damage-classifier/1.0.0
cd ~/greengrass-components/crop-damage-classifier/1.0.0
```

### Step 2: Create Component Recipe

Create `recipe.json`:

```json
{
  "RecipeFormatVersion": "2020-01-25",
  "ComponentName": "com.vericrop.CropDamageClassifier",
  "ComponentVersion": "1.0.0",
  "ComponentDescription": "Local AI inference for crop damage classification",
  "ComponentPublisher": "VeriCrop",
  "ComponentConfiguration": {
    "DefaultConfiguration": {
      "ModelPath": "/greengrass/v2/packages/artifacts/com.vericrop.CropDamageClassifier/1.0.0/model",
      "InferenceTimeout": 2000,
      "ConfidenceThreshold": 0.85
    }
  },
  "Manifests": [
    {
      "Platform": {
        "os": "linux",
        "architecture": "arm"
      },
      "Lifecycle": {
        "Install": "pip3 install numpy pillow tensorflow-lite",
        "Run": "python3 {artifacts:path}/inference_handler.py"
      },
      "Artifacts": [
        {
          "URI": "s3://YOUR_BUCKET/greengrass-components/crop-classifier-model.tar.gz",
          "Unarchive": "ZIP"
        }
      ]
    }
  ]
}
```

### Step 3: Create Inference Handler

Create `inference_handler.py`:

```python
import json
import time
import sqlite3
from pathlib import Path
import tensorflow.lite as tflite

MODEL_PATH = "/greengrass/v2/packages/artifacts/com.vericrop.CropDamageClassifier/1.0.0/model/model.tflite"
DB_PATH = "/greengrass/v2/work/offline_cache.db"

# Load TFLite model
interpreter = tflite.Interpreter(model_path=MODEL_PATH)
interpreter.allocate_tensors()

def classify_damage(image_path):
    """Run local inference on crop damage image"""
    start_time = time.time()
    
    # Load and preprocess image
    # ... (preprocessing code)
    
    # Run inference
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    
    interpreter.set_tensor(input_details[0]['index'], input_data)
    interpreter.invoke()
    output_data = interpreter.get_tensor(output_details[0]['index'])
    
    inference_time = time.time() - start_time
    
    return {
        'damageType': get_damage_type(output_data),
        'confidence': float(max(output_data[0])),
        'inferenceTime': inference_time
    }

def store_offline_claim(claim_data):
    """Store claim in local SQLite database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO offline_claims 
        (claim_id, farmer_id, damage_type, confidence, timestamp, synced)
        VALUES (?, ?, ?, ?, ?, 0)
    ''', (
        claim_data['claimId'],
        claim_data['farmerId'],
        claim_data['damageType'],
        claim_data['confidence'],
        int(time.time())
    ))
    
    conn.commit()
    conn.close()

# Main loop
while True:
    # Process incoming claims
    # ... (IPC communication with other components)
    time.sleep(1)
```

### Step 4: Deploy Component

1. Upload artifacts to S3:
```bash
aws s3 cp model.tflite s3://YOUR_BUCKET/greengrass-components/
aws s3 cp inference_handler.py s3://YOUR_BUCKET/greengrass-components/
```

2. Create component in AWS Console:
   - Go to IoT Greengrass → Components → Create component
   - Upload `recipe.json`
   - Click Create

3. Deploy to device:
   - Go to Deployments → Create
   - Select `VeriCropFieldDevices` group
   - Add `com.vericrop.CropDamageClassifier` component
   - Deploy

---

## Task 15.2: Create Offline Cache Component

### Create SQLite Database Schema

Create `offline_cache_setup.py`:

```python
import sqlite3
from datetime import datetime, timedelta

DB_PATH = "/greengrass/v2/work/offline_cache.db"

def setup_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Claims table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS offline_claims (
            claim_id TEXT PRIMARY KEY,
            farmer_id TEXT NOT NULL,
            damage_type TEXT NOT NULL,
            confidence REAL NOT NULL,
            timestamp INTEGER NOT NULL,
            synced INTEGER DEFAULT 0,
            evidence_path TEXT
        )
    ''')
    
    # Provisional certificates table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS provisional_certificates (
            certificate_id TEXT PRIMARY KEY,
            claim_id TEXT NOT NULL,
            farmer_id TEXT NOT NULL,
            damage_amount REAL NOT NULL,
            issued_timestamp INTEGER NOT NULL,
            status TEXT DEFAULT 'PENDING',
            FOREIGN KEY (claim_id) REFERENCES offline_claims(claim_id)
        )
    ''')
    
    conn.commit()
    conn.close()

def cleanup_old_data():
    """Remove data older than 72 hours"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cutoff_time = int((datetime.now() - timedelta(hours=72)).timestamp())
    
    cursor.execute('DELETE FROM offline_claims WHERE timestamp < ? AND synced = 1', (cutoff_time,))
    cursor.execute('DELETE FROM provisional_certificates WHERE issued_timestamp < ?', (cutoff_time,))
    
    conn.commit()
    conn.close()

if __name__ == '__main__':
    setup_database()
    print("✅ Offline cache database initialized")
```

---

## Task 15.3: Create Provisional Certificate Component

Create `provisional_certificate_generator.py`:

```python
import sqlite3
import uuid
import time
from datetime import datetime

DB_PATH = "/greengrass/v2/work/offline_cache.db"

def generate_provisional_certificate(claim_id, farmer_id, damage_amount):
    """Generate provisional Loss Certificate offline"""
    
    certificate_id = f"PROV-{uuid.uuid4().hex[:12].upper()}"
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO provisional_certificates
        (certificate_id, claim_id, farmer_id, damage_amount, issued_timestamp, status)
        VALUES (?, ?, ?, ?, ?, 'PENDING')
    ''', (certificate_id, claim_id, farmer_id, damage_amount, int(time.time())))
    
    conn.commit()
    conn.close()
    
    return {
        'certificateId': certificate_id,
        'claimId': claim_id,
        'farmerId': farmer_id,
        'damageAmount': damage_amount,
        'issuedAt': datetime.now().isoformat(),
        'status': 'PROVISIONAL',
        'note': 'This certificate will be validated when connectivity is restored'
    }

def get_certificate(certificate_id):
    """Retrieve provisional certificate"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT certificate_id, claim_id, farmer_id, damage_amount, issued_timestamp, status
        FROM provisional_certificates
        WHERE certificate_id = ?
    ''', (certificate_id,))
    
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            'certificateId': row[0],
            'claimId': row[1],
            'farmerId': row[2],
            'damageAmount': row[3],
            'issuedAt': datetime.fromtimestamp(row[4]).isoformat(),
            'status': row[5]
        }
    return None
```

---

## Task 15.4: Create AWS AppSync Integration for Sync

### Step 1: Create AppSync API

1. Navigate to AWS AppSync console (ap-south-1)
2. Click **Create API** → **Build from scratch**
3. **API name:** `VeriCropOfflineSync`
4. Click **Create**

### Step 2: Define GraphQL Schema

```graphql
type Claim {
  claimId: ID!
  farmerId: String!
  damageType: String!
  confidence: Float!
  timestamp: Int!
  synced: Boolean!
}

type Certificate {
  certificateId: ID!
  claimId: String!
  farmerId: String!
  damageAmount: Float!
  status: String!
}

type Mutation {
  syncClaim(input: ClaimInput!): Claim
  syncCertificate(input: CertificateInput!): Certificate
}

type Query {
  getClaim(claimId: ID!): Claim
  getCertificate(certificateId: ID!): Certificate
}

input ClaimInput {
  claimId: ID!
  farmerId: String!
  damageType: String!
  confidence: Float!
  timestamp: Int!
}

input CertificateInput {
  certificateId: ID!
  claimId: String!
  farmerId: String!
  damageAmount: Float!
}
```

### Step 3: Create Sync Component for Greengrass

Create `sync_handler.py`:

```python
import sqlite3
import requests
import time

DB_PATH = "/greengrass/v2/work/offline_cache.db"
APPSYNC_ENDPOINT = "https://YOUR_APPSYNC_ENDPOINT.appsync-api.ap-south-1.amazonaws.com/graphql"
API_KEY = "YOUR_API_KEY"

def check_connectivity():
    """Check if cloud connectivity is available"""
    try:
        response = requests.get("https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod/health", timeout=5)
        return response.status_code == 200
    except:
        return False

def sync_offline_claims():
    """Sync offline claims to cloud when connectivity returns"""
    if not check_connectivity():
        print("⚠️  No connectivity - skipping sync")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get unsynced claims
    cursor.execute('SELECT * FROM offline_claims WHERE synced = 0')
    claims = cursor.fetchall()
    
    for claim in claims:
        claim_id, farmer_id, damage_type, confidence, timestamp, _, evidence_path = claim
        
        # Sync to cloud via AppSync
        mutation = '''
        mutation SyncClaim($input: ClaimInput!) {
          syncClaim(input: $input) {
            claimId
            synced
          }
        }
        '''
        
        variables = {
            'input': {
                'claimId': claim_id,
                'farmerId': farmer_id,
                'damageType': damage_type,
                'confidence': confidence,
                'timestamp': timestamp
            }
        }
        
        try:
            response = requests.post(
                APPSYNC_ENDPOINT,
                json={'query': mutation, 'variables': variables},
                headers={'x-api-key': API_KEY}
            )
            
            if response.status_code == 200:
                # Mark as synced
                cursor.execute('UPDATE offline_claims SET synced = 1 WHERE claim_id = ?', (claim_id,))
                conn.commit()
                print(f"✅ Synced claim {claim_id}")
        except Exception as e:
            print(f"❌ Failed to sync claim {claim_id}: {e}")
    
    conn.close()

# Run sync every 60 seconds
while True:
    sync_offline_claims()
    time.sleep(60)
```

---

## Testing Offline Capability

### Test Scenario: 72-Hour Offline Operation

1. **Disconnect from network:**
```bash
sudo ifconfig wlan0 down
```

2. **Process claims offline:**
   - Submit test claims via local interface
   - Verify claims stored in SQLite
   - Generate provisional certificates
   - Verify data persists

3. **Wait or simulate time passage**

4. **Reconnect to network:**
```bash
sudo ifconfig wlan0 up
```

5. **Verify automatic sync:**
   - Check sync_handler logs
   - Verify claims appear in DynamoDB
   - Verify certificates validated in cloud

---

## Verification Checklist

- [ ] Greengrass Core installed on edge device
- [ ] AI inference component deployed
- [ ] Offline cache database created
- [ ] Provisional certificate generator working
- [ ] AppSync API configured
- [ ] Sync component deployed
- [ ] 72-hour offline test passed
- [ ] Automatic sync verified

---

## Cost Estimate

**Hardware:**
- Raspberry Pi 4 (4GB): ₹5,000-7,000

**AWS Services (Monthly):**
- IoT Greengrass: First 3 devices FREE
- AppSync: $4 per million requests (first 250k free)
- Data transfer: ~$0.09/GB

**Estimated monthly cost:** $0-5 (within free tier for demo)

---

## Alternative: Document Without Physical Device

If you don't have a Raspberry Pi, create comprehensive documentation showing:
1. Architecture diagrams
2. Component recipes
3. Code for all components
4. Test scenarios and expected results

This demonstrates technical understanding without physical deployment.

---

## Conclusion

Task 15 provides true offline capability with local AI inference, 72-hour data persistence, and automatic cloud sync. This is critical for rural India where connectivity is unreliable.
