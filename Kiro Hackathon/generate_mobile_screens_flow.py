"""
VeriCrop FinBridge Mobile App Screens Flow - 16:9
Shows the mobile app interface flow

Requirements:
    pip install diagrams

Usage:
    python3 generate_mobile_screens_flow.py
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.onprem.client import User
from diagrams.programming.framework import React

graph_attr = {
    "fontsize": "13",
    "bgcolor": "white",
    "pad": "0.4",
    "splines": "ortho",
    "nodesep": "1.0",
    "ranksep": "1.8",
    "ratio": "0.5625"  # 16:9 aspect ratio
}

with Diagram("VeriCrop FinBridge - Mobile App Screen Flow (Voice-First UI)", 
             filename="vericrop_mobile_screens_16x9",
             show=False,
             direction="LR",
             graph_attr=graph_attr,
             outformat="png"):
    
    farmer = User("Farmer")
    
    with Cluster("Screen 1\nWelcome"):
        welcome = React("Voice Welcome\n🎤\n'Namaste'\n'Press mic to start'\n\n[Hindi] [Tamil] [Telugu]")
    
    with Cluster("Screen 2\nVoice Menu"):
        menu = React("Voice Menu\n🎤\n'Say your choice:'\n1. File New Claim\n2. Check Status\n3. Request Loan")
    
    with Cluster("Screen 3\nClaim Filing"):
        claim = React("Claim Filing\n📹\n'Record crop damage'\n[Start Recording]\n\nGPS: Auto-detected\nTime: Auto-captured")
    
    with Cluster("Screen 4\nUploading"):
        upload = React("Uploading\n⏳\n'Uploading video...'\n'Works offline'\n\nProgress: 85%")
    
    with Cluster("Screen 5\nValidation"):
        validation = React("Validation\n🔍\n'Validating claim...'\n• Solar check ✓\n• Weather check ✓\n• AI analysis ✓\n\nTime: 45s")
    
    with Cluster("Screen 6\nApproved"):
        approved = React("Approved! ✅\n💳\n'Loss Certificate Issued'\n'Loan: ₹50,000'\n'0% Interest'\n\n[View Certificate]")
    
    with Cluster("Screen 7\nDisbursed"):
        disbursed = React("Disbursed! 🎉\n💰\n'₹50,000 credited'\n'UPI: farmer@upi'\n\nTotal Time: 60s\n\n[View Details]")
    
    farmer >> Edge(label="Opens app") >> welcome
    welcome >> Edge(label="Speaks") >> menu
    menu >> Edge(label="'File claim'") >> claim
    claim >> Edge(label="Records video") >> upload
    upload >> Edge(label="Auto-upload") >> validation
    validation >> Edge(label="60s later") >> approved
    approved >> Edge(label="Auto-disburse") >> disbursed
    disbursed >> Edge(label="Voice confirmation", color="green") >> farmer

print("✓ Mobile screens flow diagram generated successfully!")
print("✓ File: vericrop_mobile_screens_16x9.png")
print("✓ Shows: Complete mobile app screen-by-screen flow")
print("✓ Aspect Ratio: 16:9 (PowerPoint optimized)")
