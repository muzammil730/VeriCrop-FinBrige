"""
VeriCrop FinBridge Process Flow Diagram - 16:9
Shows the complete end-to-end process flow with decision points

Requirements:
    pip install diagrams

Usage:
    python3 generate_process_flow_diagram.py
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.aws.ml import Lex, Polly, Rekognition, Sagemaker, AugmentedAi
from diagrams.aws.integration import StepFunctions
from diagrams.aws.compute import Lambda
from diagrams.aws.blockchain import QLDB
from diagrams.aws.storage import S3
from diagrams.aws.database import Dynamodb

graph_attr = {
    "fontsize": "12",
    "bgcolor": "white",
    "pad": "0.3",
    "splines": "ortho",
    "nodesep": "0.7",
    "ranksep": "1.3",
    "ratio": "0.5625"  # 16:9 aspect ratio
}

with Diagram("VeriCrop FinBridge - End-to-End Process Flow (60-Second Claim Processing)", 
             filename="vericrop_process_flow_16x9",
             show=False,
             direction="LR",
             graph_attr=graph_attr,
             outformat="png"):
    
    # Start
    start = Lex("START\nFarmer Voice Input\n(Hindi/Tamil/Telugu)")
    
    # Evidence Collection
    with Cluster("Evidence Collection"):
        video = Rekognition("Capture Video\n• GPS coordinates\n• Timestamp\n• Device info")
        store = S3("Store Evidence\nS3 Object Lock\nSHA-256 Hash")
        
        start >> video >> store
    
    # Orchestration
    orchestrator = StepFunctions("Step Functions\nExpress Workflow\n60s Timeout")
    store >> orchestrator
    
    # Parallel Validation
    with Cluster("Parallel Forensic Validation (45s)"):
        solar = Lambda("Solar Azimuth\nValidation\nFormula Check")
        weather = Lambda("Weather\nCorrelation\nIMD API")
        ai = Sagemaker("AI Crop\nDamage\nClassifier")
        video_analysis = Rekognition("Video\nForensics\nMetadata")
        
        orchestrator >> solar
        orchestrator >> weather
        orchestrator >> ai
        orchestrator >> video_analysis
    
    # Consolidation
    consolidate = Lambda("Consolidate\nResults\nCalculate Score")
    solar >> consolidate
    weather >> consolidate
    ai >> consolidate
    video_analysis >> consolidate
    
    # Decision Point
    with Cluster("Decision Logic"):
        decision = Lambda("Check\nConfidence\n& Fraud Risk")
        consolidate >> decision
    
    # HITL Path
    with Cluster("Low Confidence Path"):
        hitl = AugmentedAi("Human Review\nA2I Queue\n<85% confidence\nOR 5% random")
        hitl_decision = Lambda("Human\nDecision")
        
        decision >> Edge(label="<85% OR\nHigh Fraud", color="orange") >> hitl
        hitl >> hitl_decision
    
    # Approval Path
    with Cluster("Approval Path"):
        certificate = QLDB("Issue Loss\nCertificate\nBlockchain")
        loan = Lambda("Calculate\nBridge Loan\n70% LTV, 0%")
        payment = Lambda("Disburse\nUPI Payment\nInstant")
        
        decision >> Edge(label="Approved\n>85%", color="green") >> certificate
        hitl_decision >> Edge(label="Human\nApproved", color="green") >> certificate
        certificate >> loan >> payment
    
    # Rejection Path
    reject = Lambda("Reject Claim\nProvide Reason\nVoice Feedback")
    decision >> Edge(label="Rejected", color="red") >> reject
    hitl_decision >> Edge(label="Human\nRejected", color="red") >> reject
    
    # Notification
    notify = Polly("Voice + SMS\nNotification\n(Regional Language)")
    payment >> Edge(label="Success\n60s total", color="green", style="bold") >> notify
    reject >> Edge(label="Feedback", color="red") >> notify
    
    # Store Records
    db = Dynamodb("Store Records\nClaim History\nAudit Trail")
    notify >> db

print("✓ Process flow diagram generated successfully!")
print("✓ File: vericrop_process_flow_16x9.png")
print("✓ Shows: Complete process with decision points, parallel validation, and multiple paths")
print("✓ Aspect Ratio: 16:9 (PowerPoint optimized)")
