"""
VeriCrop FinBridge User Flow Diagram Generator - 16:9
Shows the farmer's journey through the system

Requirements:
    pip install diagrams

Usage:
    python3 generate_user_flow_diagram.py
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.custom import Custom
from diagrams.onprem.client import User
from diagrams.aws.ml import Lex, Polly
from diagrams.aws.iot import IotGreengrass
from diagrams.aws.integration import StepFunctions
from diagrams.aws.blockchain import QLDB
from diagrams.aws.compute import Lambda

graph_attr = {
    "fontsize": "14",
    "bgcolor": "white",
    "pad": "0.4",
    "splines": "ortho",
    "nodesep": "0.8",
    "ranksep": "1.5",
    "ratio": "0.5625"  # 16:9 aspect ratio
}

with Diagram("VeriCrop FinBridge - Farmer User Journey (Voice-First Experience)", 
             filename="vericrop_user_flow_16x9",
             show=False,
             direction="LR",
             graph_attr=graph_attr,
             outformat="png"):
    
    farmer = User("Farmer\n(Illiterate)")
    
    with Cluster("Step 1: Voice Claim Filing\n(Regional Language)"):
        voice_input = Lex("Voice Input\n'Meri fasal barbaad ho gayi'\n(Hindi)")
        voice_guide = Polly("Voice Guide\n'Kripya video upload karein'")
        
        farmer >> Edge(label="Speaks in\nHindi/Tamil/Telugu") >> voice_input
        voice_input >> voice_guide
    
    with Cluster("Step 2: Evidence Capture\n(Mobile Camera)"):
        camera = IotGreengrass("Mobile Camera\nCapture Video\nwith GPS & Timestamp")
        upload = IotGreengrass("Upload Evidence\n(Works Offline)")
        
        voice_guide >> Edge(label="Farmer records\ncrop damage") >> camera
        camera >> upload
    
    with Cluster("Step 3: 60-Second Validation\n(Forensic Truth Engine)"):
        validation = StepFunctions("Parallel Validation\n• Solar Azimuth\n• Weather Check\n• AI Analysis\n• Video Forensics")
        
        upload >> Edge(label="Automatic\nprocessing") >> validation
    
    with Cluster("Step 4: Loss Certificate\n(Blockchain)"):
        certificate = QLDB("Loss Certificate\nIssued\nImmutable Record")
        
        validation >> Edge(label="Approved\nin 60 seconds") >> certificate
    
    with Cluster("Step 5: Bridge Loan\n(0% Interest)"):
        loan = Lambda("Bridge Loan\n70% of Damage\n0% Interest")
        payment = Lambda("UPI Payment\nInstant Transfer")
        
        certificate >> Edge(label="Auto-calculate\nloan amount") >> loan
        loan >> payment
    
    with Cluster("Step 6: Confirmation\n(Voice Notification)"):
        notification = Polly("Voice Call\n'Aapka loan approve ho gaya'\n'₹50,000 credited'")
        sms = Lambda("SMS\n'Loan disbursed\nCheck UPI'")
        
        payment >> notification
        payment >> sms
    
    notification >> Edge(label="60 seconds\ntotal time", color="green", style="bold") >> farmer
    sms >> farmer

print("✓ User flow diagram generated successfully!")
print("✓ File: vericrop_user_flow_16x9.png")
print("✓ Shows: Complete farmer journey from voice input to loan disbursement")
print("✓ Aspect Ratio: 16:9 (PowerPoint optimized)")
