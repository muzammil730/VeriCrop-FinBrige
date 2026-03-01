"""
VeriCrop FinBridge Architecture Diagram Generator - Landscape (16:9)
Optimized for PowerPoint presentations

Requirements:
    pip install diagrams

Usage:
    python3 generate_architecture_diagram_landscape.py
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
    "fontsize": "13",
    "bgcolor": "white",
    "pad": "0.3",
    "splines": "ortho",
    "nodesep": "0.6",
    "ranksep": "1.2",
    "ratio": "0.5625"  # 16:9 aspect ratio
}

with Diagram("VeriCrop FinBridge - AWS Architecture (60s Forensic Truth Engine)", 
             filename="vericrop_finbridge_architecture_16x9",
             show=False,
             direction="LR",  # Left to Right for landscape
             graph_attr=graph_attr,
             outformat="png"):
    
    farmer = User("Farmer")
    
    with Cluster("Edge Layer\n(72hr Offline)"):
        mobile = MobileClient("Mobile App")
        lex = Lex("Lex\nHindi/Tamil/Telugu")
        polly = Polly("Polly")
        greengrass = IotGreengrass("Greengrass v2")
        local_model = Sagemaker("PlantVillage\nModel")
        
        mobile >> lex
        polly >> mobile
        mobile >> greengrass
        greengrass >> local_model
    
    with Cluster("Sync & Orchestration"):
        appsync = Appsync("AppSync\nSync")
        sqs = SQS("SQS\nQueue")
        step_functions = StepFunctions("Step Functions\nExpress 60s")
        
        greengrass >> appsync >> sqs >> step_functions
    
    with Cluster("Forensic Truth Engine"):
        lambda_solar = Lambda("Solar Azimuth\nValidator")
        lambda_weather = Lambda("Weather\nCorrelation")
        rekognition = Rekognition("Rekognition\nVideo")
        lambda_ai = Lambda("AI Crop\nClassifier")
        s3_lock = S3("S3 Lock\nSHA-256")
        a2i = AugmentedAi("A2I HITL\n5% Audit")
        
        step_functions >> lambda_solar >> s3_lock
        step_functions >> lambda_weather
        step_functions >> rekognition >> s3_lock
        step_functions >> lambda_ai
        step_functions >> Edge(label="<85%") >> a2i
    
    with Cluster("Core & Data"):
        lambda_core = Lambda("Business\nLogic")
        dynamodb = Dynamodb("DynamoDB\nClaims")
        cognito = Cognito("Cognito\nAuth")
        kms = KMS("KMS")
        cloudwatch = Cloudwatch("CloudWatch")
        
        lambda_solar >> lambda_core
        lambda_weather >> lambda_core
        lambda_ai >> lambda_core
        rekognition >> lambda_core
        a2i >> lambda_core
        lambda_core >> dynamodb
        mobile >> cognito
        lambda_core >> kms
        step_functions >> cloudwatch
    
    with Cluster("Blockchain & Finance"):
        qldb = QLDB("QLDB\nLoss Cert")
        blockchain = ManagedBlockchain("Blockchain\nHyperledger")
        lambda_loan = Lambda("Bridge Loan\n0% Interest")
        lambda_payment = Lambda("UPI\nPayment")
        
        lambda_core >> qldb
        lambda_core >> blockchain
        lambda_core >> lambda_loan >> lambda_payment
    
    farmer >> mobile
    lambda_payment >> Edge(label="60s") >> farmer

print("✓ Landscape architecture diagram generated successfully!")
print("✓ File: vericrop_finbridge_architecture_16x9.png")
print("✓ Aspect Ratio: 16:9 (PowerPoint optimized)")
print("✓ Location: Current directory")
