# VeriCrop FinBridge - Mermaid Architecture Diagram

## Instructions
1. Copy the Mermaid code below
2. Go to https://mermaid.live/
3. Paste the code and export as PNG
4. Save the PNG file in this diagrams folder

## Mermaid Code

```mermaid
graph TB
    subgraph "🌾 VeriCrop FinBridge - Sensor Fusion Architecture"
        direction TB
        
        subgraph "Edge Layer - Rural Devices"
            direction LR
            Farmer["👨‍🌾 Micro Farmer<br/>Crop Damage Incident"]
            Mobile["📱 Mobile App<br/>Android/iOS<br/>Evidence Capture"]
            IoTEdge["🔧 AWS IoT Greengrass v2<br/>Edge Computing Gateway<br/>Local Processing"]
            LocalAI["🧠 Local AI Models<br/>Crop Damage Detection<br/>Preliminary Validation"]
            Cache[("💾 SQLite Cache<br/>Offline Claims Storage<br/>Encrypted Data")]
        end
        
        subgraph "Sync & Queue Layer"
            direction LR
            AppSync["🔄 AWS AppSync<br/>GraphQL API<br/>Offline Synchronization"]
            SQS["📬 Amazon SQS<br/>Claim Processing Queue<br/>FIFO Ordering"]
            EventBridge["⚡ Amazon EventBridge<br/>Event Orchestration<br/>Real-time Routing"]
            CloudWatch["📊 CloudWatch<br/>Performance Monitoring<br/>Alert Management"]
        end
        
        subgraph "Truth Engine - Forensic Validation"
            direction TB
            Rekognition["👁️ Amazon Rekognition<br/>Video/Image Analysis<br/>Computer Vision"]
            S3Vault["🔒 S3 Object Lock<br/>Immutable Evidence Vault<br/>Tamper-Proof Storage"]
            Weather["🌦️ Weather Service<br/>IMD Real-time Data<br/>Historical Patterns"]
            GeoValidator["🗺️ Geospatial Validator<br/>GPS Verification<br/>Shadow Angle Analysis"]
            FraudEngine["🚨 Fraud Detection<br/>ML Risk Scoring<br/>Anomaly Detection"]
        end
        
        subgraph "Core Processing Engine"
            direction LR
            StepFunctions["🔄 AWS Step Functions<br/>Truth Engine Orchestrator<br/>Parallel Processing"]
            CoreLambda["⚡ AWS Lambda<br/>Business Logic<br/>Serverless Compute"]
            DynamoDB[("🗃️ DynamoDB<br/>Claims Database<br/>NoSQL Performance")]
            ElastiCache[("⚡ ElastiCache<br/>Session Management<br/>High-Speed Cache")]
        end
        
        subgraph "Blockchain Infrastructure"
            direction TB
            Blockchain["⛓️ Amazon Managed Blockchain<br/>Hyperledger Fabric Network<br/>Private Consortium"]
            SmartContracts["📜 Smart Contracts<br/>Loss Certificate Logic<br/>Multi-Party Validation"]
        end
        
        subgraph "Financial Services Layer"
            direction TB
            LoanEngine["💰 Bridge Loan Engine<br/>Risk Assessment<br/>Instant Disbursement"]
            PaymentGateway["💳 Payment Gateway<br/>UPI Integration<br/>Multi-Bank Support"]
            BankingAPIs["🏦 Banking APIs<br/>Account Validation<br/>Fund Transfers"]
            InsuranceAPI["🛡️ Insurance Integration<br/>Claim Processing<br/>Payout Automation"]
        end
        
        subgraph "User Interface Layer"
            direction LR
            VoiceUI["🎤 Amazon Lex<br/>Multi-language Voice<br/>Regional Dialects"]
            WebDashboard["💻 Web Dashboard<br/>Admin Portal<br/>Analytics"]
            MobileUI["📱 Mobile Interface<br/>Farmer App<br/>Touch & Voice"]
            Notifications["📢 SNS Notifications<br/>Push Alerts<br/>SMS Updates"]
        end
        
        subgraph "Security & Compliance"
            direction LR
            IAM["🔐 AWS IAM<br/>Identity Management<br/>Role-Based Access"]
            KMS["🔑 AWS KMS<br/>Encryption Keys<br/>Data Protection"]
            CloudTrail["📝 CloudTrail<br/>Audit Logging<br/>Compliance Tracking"]
            WAF["🛡️ AWS WAF<br/>Attack Protection<br/>Web Security"]
        end
    end
    
    %% Data Flow Connections
    Farmer --> Mobile
    Mobile --> IoTEdge
    IoTEdge --> LocalAI
    IoTEdge --> Cache
    IoTEdge --> AppSync
    
    AppSync --> SQS
    SQS --> EventBridge
    EventBridge --> StepFunctions
    
    StepFunctions --> Rekognition
    StepFunctions --> Weather
    StepFunctions --> GeoValidator
    StepFunctions --> FraudEngine
    Rekognition --> S3Vault
    
    StepFunctions --> CoreLambda
    CoreLambda --> DynamoDB
    CoreLambda --> ElastiCache
    
    CoreLambda --> Blockchain
    Blockchain --> SmartContracts
    
    CoreLambda --> LoanEngine
    LoanEngine --> PaymentGateway
    PaymentGateway --> BankingAPIs
    CoreLambda --> InsuranceAPI
    
    Mobile --> VoiceUI
    Mobile --> MobileUI
    WebDashboard --> AppSync
    CoreLambda --> Notifications
    
    %% Security Connections (dotted)
    IAM -.-> CoreLambda
    IAM -.-> Blockchain
    KMS -.-> S3Vault
    CloudTrail -.-> CoreLambda
    WAF -.-> WebDashboard
    
    %% Monitoring Connections (dotted)
    CloudWatch -.-> SQS
    CloudWatch -.-> CoreLambda
    CloudWatch -.-> StepFunctions
    
    %% Styling
    classDef edgeLayer fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef syncLayer fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef truthEngine fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef coreEngine fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef blockchain fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef financial fill:#f1f8e9,stroke:#33691e,stroke-width:2px
    classDef ui fill:#e3f2fd,stroke:#0d47a1,stroke-width:2px
    classDef security fill:#ffebee,stroke:#b71c1c,stroke-width:2px
    
    class Farmer,Mobile,IoTEdge,LocalAI,Cache edgeLayer
    class AppSync,SQS,EventBridge,CloudWatch syncLayer
    class Rekognition,S3Vault,Weather,GeoValidator,FraudEngine truthEngine
    class StepFunctions,CoreLambda,DynamoDB,ElastiCache coreEngine
    class Blockchain,SmartContracts blockchain
    class LoanEngine,PaymentGateway,BankingAPIs,InsuranceAPI financial
    class VoiceUI,WebDashboard,MobileUI,Notifications ui
    class IAM,KMS,CloudTrail,WAF security
```

## Performance Metrics Diagram

```mermaid
graph LR
    subgraph "⏱️ Key Performance Indicators"
        A["📊 < 60 seconds<br/>End-to-end Processing"]
        B["🎯 99.9% Accuracy<br/>Fraud Detection"]
        C["⚡ 72 hours<br/>Offline Operation"]
        D["🔄 < 5 minutes<br/>Data Sync Time"]
        E["📈 99.95% Uptime<br/>System Availability"]
        F["💰 0% Interest<br/>Bridge Loans"]
    end
    
    classDef metrics fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    class A,B,C,D,E,F metrics
```

## Data Flow Sequence Diagram

```mermaid
sequenceDiagram
    participant F as 👨‍🌾 Farmer
    participant M as 📱 Mobile App
    participant E as 🔧 Edge Device
    participant T as 🧠 Truth Engine
    participant B as ⛓️ Blockchain
    participant L as 💰 Loan Engine
    participant P as 💳 Payment
    
    F->>M: Submit Damage Evidence
    M->>E: Capture Video + GPS Data
    E->>E: Local AI Validation
    E->>T: Sync to Cloud (when online)
    
    par Parallel Forensic Analysis
        T->>T: Video Analysis (Rekognition)
        T->>T: Weather Correlation Check
        T->>T: GPS & Shadow Validation
        T->>T: Fraud Risk Assessment
    end
    
    alt Validation Approved (Score > 0.7)
        T->>B: Issue Loss Certificate
        B-->>T: Certificate Created & Stored
        T->>L: Calculate Loan Eligibility
        L->>P: Process Bridge Loan (0% interest)
        P-->>F: Funds Disbursed (< 60 seconds)
        T-->>F: Success Notification + Certificate
    else Validation Rejected
        T-->>F: Rejection with Specific Feedback
    end
    
    Note over F,P: Total Process Time: < 60 seconds
    Note over E: Offline Capability: 72 hours
    Note over B: Immutable Certificate Storage
    Note over L: 0% Interest Bridge Loans
```