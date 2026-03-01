#!/usr/bin/env python3
"""
VeriCrop FinBridge Architecture Diagram
Generate using: python vericrop_architecture.py
Requires: pip install diagrams
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import Lambda, EC2
from diagrams.aws.database import Dynamodb, Elasticache
from diagrams.aws.integration import Appsync, SQS, Eventbridge, StepFunctions, SNS
from diagrams.aws.ml import Rekognition, Lex
from diagrams.aws.storage import S3
from diagrams.aws.blockchain import ManagedBlockchain
from diagrams.aws.iot import IotCore
from diagrams.aws.management import Cloudwatch, Cloudtrail
from diagrams.aws.security import IAM, KMS, WAF
from diagrams.aws.general import User, MobileClient, GenericDatabase

def create_vericrop_architecture():
    with Diagram("VeriCrop FinBridge - Sensor Fusion Architecture", 
                 show=False, 
                 direction="TB",
                 filename="vericrop_finbridge_architecture"):
        
        # Edge Layer
        with Cluster("Rural Edge Layer - Disaster Resilient"):
            farmer = User("Micro Farmer")
            mobile = MobileClient("Mobile App\n(Android/iOS)")
            iot_edge = IotCore("AWS IoT Greengrass v2\nEdge Gateway")
            local_ai = Lambda("Local AI Models\nCrop Damage Detection")
            cache = GenericDatabase("SQLite Cache\nOffline Storage")
        
        # Sync Layer
        with Cluster("Connectivity & Sync Layer"):
            appsync = Appsync("AWS AppSync\nGraphQL + Offline Sync")
            sqs = SQS("Amazon SQS\nClaim Processing Queue")
            events = Eventbridge("Amazon EventBridge\nEvent Orchestration")
            monitoring = Cloudwatch("CloudWatch\nMonitoring & Alerts")
        
        # Truth Engine
        with Cluster("Truth Engine - Forensic Validation"):
            rekognition = Rekognition("Amazon Rekognition\nVideo/Image Analysis")
            s3_vault = S3("S3 Object Lock\nImmutable Evidence Vault")
            weather = Lambda("Weather Service\nIMD Integration")
            geo_validator = Lambda("Geospatial Validator\nGPS & Shadow Analysis")
            fraud_detector = Lambda("Fraud Detection\nML Risk Scoring")
        
        # Core Processing
        with Cluster("Core Processing Engine"):
            step_functions = StepFunctions("AWS Step Functions\nTruth Engine Orchestrator")
            core_lambda = Lambda("AWS Lambda\nBusiness Logic")
            dynamodb = Dynamodb("DynamoDB\nClaims Database")
            elasticache = Elasticache("ElastiCache\nSession Cache")
        
        # Blockchain
        with Cluster("Blockchain Infrastructure"):
            blockchain = ManagedBlockchain("Amazon Managed Blockchain\nHyperledger Fabric")
            smart_contracts = Lambda("Smart Contracts\nLoss Certificate Logic")
        
        # Financial Services
        with Cluster("Financial Services Layer"):
            loan_engine = Lambda("Bridge Loan Engine\nRisk Assessment")
            payment_gateway = Lambda("Payment Gateway\nUPI Integration")
            banking_apis = Lambda("Banking APIs\nAccount Validation")
            insurance_api = Lambda("Insurance Integration\nClaim Processing")
        
        # User Interface
        with Cluster("User Interface Layer"):
            voice_ui = Lex("Amazon Lex\nMulti-language Voice")
            web_dashboard = Lambda("Web Dashboard\nAdmin Portal")
            mobile_ui = MobileClient("Mobile Interface\nFarmer App")
            notifications = SNS("SNS Notifications\nSMS/Push Alerts")
        
        # Security
        with Cluster("Security & Compliance"):
            iam = IAM("AWS IAM\nIdentity & Access")
            kms = KMS("AWS KMS\nEncryption Keys")
            cloudtrail = Cloudtrail("CloudTrail\nAudit Logging")
            waf = WAF("AWS WAF\nWeb Security")
        
        # Data Flow Connections
        farmer >> Edge(label="Submit Claims") >> mobile
        mobile >> Edge(label="Capture Evidence") >> iot_edge
        iot_edge >> Edge(label="Local Processing") >> local_ai
        iot_edge >> Edge(label="Cache Data") >> cache
        iot_edge >> Edge(label="Sync When Online") >> appsync
        
        appsync >> Edge(label="Queue Claims") >> sqs
        sqs >> Edge(label="Trigger Events") >> events
        events >> Edge(label="Start Validation") >> step_functions
        
        # Parallel Forensic Analysis
        step_functions >> Edge(label="Analyze Video", style="dashed") >> rekognition
        step_functions >> Edge(label="Check Weather", style="dashed") >> weather
        step_functions >> Edge(label="Validate GPS", style="dashed") >> geo_validator
        step_functions >> Edge(label="Detect Fraud", style="dashed") >> fraud_detector
        
        rekognition >> Edge(label="Store Evidence") >> s3_vault
        
        step_functions >> Edge(label="Process Results") >> core_lambda
        core_lambda >> Edge(label="Store Claims") >> dynamodb
        core_lambda >> Edge(label="Cache Sessions") >> elasticache
        
        core_lambda >> Edge(label="Issue Certificate") >> blockchain
        blockchain >> Edge(label="Execute Contract") >> smart_contracts
        
        core_lambda >> Edge(label="Assess Risk") >> loan_engine
        loan_engine >> Edge(label="Process Payment") >> payment_gateway
        payment_gateway >> Edge(label="Transfer Funds") >> banking_apis
        core_lambda >> Edge(label="Process Insurance") >> insurance_api
        
        # User Interfaces
        mobile >> Edge(label="Voice Commands") >> voice_ui
        mobile >> Edge(label="Touch Interface") >> mobile_ui
        web_dashboard >> Edge(label="Admin Access") >> appsync
        core_lambda >> Edge(label="Send Alerts") >> notifications
        
        # Security connections (dotted)
        iam >> Edge(style="dotted", color="red") >> core_lambda
        iam >> Edge(style="dotted", color="red") >> blockchain
        kms >> Edge(style="dotted", color="red") >> s3_vault
        cloudtrail >> Edge(style="dotted", color="red") >> core_lambda
        waf >> Edge(style="dotted", color="red") >> web_dashboard
        
        # Monitoring (dotted)
        monitoring >> Edge(style="dotted", color="blue") >> sqs
        monitoring >> Edge(style="dotted", color="blue") >> core_lambda
        monitoring >> Edge(style="dotted", color="blue") >> step_functions

if __name__ == "__main__":
    create_vericrop_architecture()
    print("VeriCrop FinBridge architecture diagram generated successfully!")
    print("Files created:")
    print("- vericrop_finbridge_architecture.png")
    print("- vericrop_finbridge_architecture.dot")