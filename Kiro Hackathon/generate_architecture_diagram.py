"""
VeriCrop FinBridge Architecture Diagram Generator
Run this script to generate a professional AWS architecture diagram with official icons.

Requirements:
    pip install diagrams

Usage:
    python generate_architecture_diagram.py
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.aws.iot import IotGreengrass
from diagrams.aws.integration import Appsync, SQS, StepFunctions
from diagrams.aws.compute import Lambda
from diagrams.aws.database import Dynamodb
from diagrams.aws.blockchain import QLDB, ManagedBlockchain
from diagrams.aws.ml import Sagemaker, Rekognition, Lex, Polly, AugmentedAi
from diagrams.aws.storage import S3
from diagrams.aws.security import Cognito, KMS
from diagrams.aws.management import Cloudwatch
from diagrams.aws.general import User, MobileClient

graph_attr = {
    "fontsize": "14",
    "bgcolor": "white",
    "pad": "0.5",
    "splines": "ortho",
    "nodesep": "0.8",
    "ranksep": "1.0"
}

with Diagram("VeriCrop FinBridge - Production AWS Architecture", 
             filename="vericrop_finbridge_architecture",
             show=False,
             direction="LR",
             graph_attr=graph_attr,
             outformat="png"):
    
    farmer = User("Farmer\n(Voice/Mobile)")
    
    with Cluster("Edge/Field Zone\n(Offline 72hr Capability)"):
        mobile = MobileClient("Mobile App")
        greengrass = IotGreengrass("Greengrass v2\nLocal AI Inference")
        local_model = Sagemaker("Transfer Learning\nPlantVillage Model")
        
        mobile >> Edge(label="Voice Commands") >> greengrass
        greengrass >> local_model
    
    with Cluster("Voice Interface"):
        lex = Lex("Lex\nHindi/Tamil/Telugu")
        polly = Polly("Polly\nVoice Synthesis")
        
        mobile >> lex
        polly >> mobile
    
    with Cluster("Sync & Orchestration Layer"):
        appsync = Appsync("AppSync\nOffline Sync")
        sqs = SQS("SQS\nClaim Queue")
        step_functions = StepFunctions("Step Functions Express\n60s Orchestration")
        
        greengrass >> Edge(label="Sync when online") >> appsync
        appsync >> sqs
        sqs >> step_functions
    
    with Cluster("Logic & Analysis Zone\n(Forensic Truth Engine)"):
        with Cluster("Forensic Validation"):
            lambda_solar = Lambda("Solar Azimuth\nValidator")
            lambda_weather = Lambda("Weather\nCorrelation")
            rekognition = Rekognition("Rekognition\nVideo Analysis")
            lambda_ai = Lambda("Crop Damage\nClassifier")
        
        s3_lock = S3("S3 Object Lock\nImmutable Evidence\nSHA-256 Hash")
        
        step_functions >> Edge(label="Parallel") >> lambda_solar
        step_functions >> Edge(label="Parallel") >> lambda_weather
        step_functions >> Edge(label="Parallel") >> rekognition
        step_functions >> Edge(label="Parallel") >> lambda_ai
        
        rekognition >> s3_lock
        lambda_solar >> s3_lock
    
    with Cluster("AI Training & HITL"):
        sagemaker_train = Sagemaker("SageMaker Training\nPlantVillage + Kaggle")
        a2i = AugmentedAi("A2I HITL Queue\n5% Random Audit")
        
        step_functions >> Edge(label="Low confidence\n<85%") >> a2i
    
    with Cluster("Core Processing"):
        lambda_core = Lambda("Business Logic\nProvisioned Concurrency")
        dynamodb = Dynamodb("DynamoDB\nClaims Database\nOn-Demand")
        
        step_functions >> lambda_core
        lambda_core >> dynamodb
    
    with Cluster("Trust & Ledger Zone\n(Immutable Financial Records)"):
        qldb = QLDB("QLDB\nLoss Certificates\nCryptographic Proof")
        blockchain = ManagedBlockchain("Managed Blockchain\nHyperledger Fabric\nMulti-Org Network")
        
        lambda_core >> Edge(label="Issue Certificate") >> qldb
        lambda_core >> Edge(label="Smart Contract") >> blockchain
    
    with Cluster("Financial Integration"):
        lambda_loan = Lambda("Bridge Loan Engine\n0% Interest\n70% LTV")
        lambda_payment = Lambda("Payment Gateway\nUPI Integration")
        
        lambda_core >> lambda_loan
        lambda_loan >> lambda_payment
    
    with Cluster("Security & Monitoring"):
        cognito = Cognito("Cognito\nFarmer Auth")
        kms = KMS("KMS\nData Encryption")
        cloudwatch = Cloudwatch("CloudWatch\nMonitoring & Logs")
        
        mobile >> cognito
        lambda_core >> kms
        step_functions >> cloudwatch
    
    farmer >> mobile
    lambda_payment >> Edge(label="60s Disbursement") >> farmer

print("✓ Architecture diagram generated successfully!")
print("✓ File: vericrop_finbridge_architecture.png")
print("✓ Location: Current directory")
