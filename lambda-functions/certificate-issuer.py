"""
VeriCrop FinBridge - Loss Certificate Issuer
Issues immutable blockchain certificates on Amazon QLDB
"""

import json
import boto3
from datetime import datetime
import hashlib
import uuid

qldb_session = boto3.client('qldb-session')

LEDGER_NAME = 'vericrop-certificates'

def lambda_handler(event, context):
    """
    Input: Validated claim data
    Output: Blockchain certificate with unique ID
    """
    
    try:
        # Extract validated claim data
        claim_id = event['claim_id']
        farmer_id = event['farmer_id']
        damage_amount = float(event['damage_amount'])
        damage_type = event['damage_type']
        validation_score = float(event['validation_score'])
        gps_coordinates = event['gps_coordinates']
        
        # Generate unique certificate ID
        certificate_id = str(uuid.uuid4())
        
        # Create certificate record
        certificate = {
            'certificate_id': certificate_id,
            'claim_id': claim_id,
            'farmer_id': farmer_id,
            'damage_amount': damage_amount,
            'damage_type': damage_type,
            'validation_score': validation_score,
            'gps_coordinates': gps_coordinates,
            'issued_at': datetime.utcnow().isoformat(),
            'status': 'ACTIVE',
            'collateral_status': 'AVAILABLE'
        }
        
        # Calculate cryptographic hash
        certificate_hash = calculate_hash(certificate)
        certificate['certificate_hash'] = certificate_hash
        
        # Insert into QLDB (simplified for MVP)
        # In production, use pyqldb driver for proper QLDB interaction
        block_address = insert_into_qldb(certificate)
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'certificate_id': certificate_id,
                'certificate_hash': certificate_hash,
                'block_address': block_address,
                'damage_amount': damage_amount,
                'loan_eligible_amount': damage_amount * 0.7,  # 70% for bridge loan
                'message': 'Loss Certificate issued successfully'
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 400,
            'body': json.dumps({
                'error': str(e),
                'message': 'Failed to issue certificate'
            })
        }

def calculate_hash(certificate):
    """
    Calculate SHA-256 hash of certificate data
    """
    # Create deterministic string from certificate
    cert_string = json.dumps(certificate, sort_keys=True)
    return hashlib.sha256(cert_string.encode()).hexdigest()

def insert_into_qldb(certificate):
    """
    Insert certificate into QLDB ledger
    For MVP: Simplified simulation
    In production: Use pyqldb driver with proper PartiQL queries
    """
    # Simulate QLDB insertion
    # In production, you would:
    # 1. Create QLDB driver session
    # 2. Execute PartiQL INSERT statement
    # 3. Return document ID and block address
    
    # For demo: Return simulated block address
    return f"block-{uuid.uuid4().hex[:16]}"

# Test locally
if __name__ == "__main__":
    test_event = {
        'claim_id': 'claim-123',
        'farmer_id': 'farmer-456',
        'damage_amount': 50000,
        'damage_type': 'drought',
        'validation_score': 0.95,
        'gps_coordinates': {'lat': 19.0760, 'lon': 72.8777}
    }
    result = lambda_handler(test_event, None)
    print(json.dumps(result, indent=2))
