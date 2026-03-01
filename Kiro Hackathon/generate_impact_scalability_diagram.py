"""
VeriCrop FinBridge Impact & Scalability Diagram - 16:9
Shows geographic scalability and social impact metrics

Requirements:
    pip install diagrams

Usage:
    python3 generate_impact_scalability_diagram.py
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.aws.iot import IotGreengrass
from diagrams.aws.network import CloudFront, Route53
from diagrams.aws.compute import Lambda
from diagrams.aws.database import Dynamodb
from diagrams.aws.integration import StepFunctions
from diagrams.onprem.client import Users

graph_attr = {
    "fontsize": "13",
    "bgcolor": "white",
    "pad": "0.4",
    "splines": "ortho",
    "nodesep": "1.0",
    "ranksep": "1.8",
    "ratio": "0.5625"  # 16:9 aspect ratio
}

with Diagram("VeriCrop FinBridge - Impact & Scalability (Pan-India Deployment)", 
             filename="vericrop_impact_scalability_16x9",
             show=False,
             direction="LR",
             graph_attr=graph_attr,
             outformat="png"):
    
    # Geographic Regions
    with Cluster("Phase 1: Pilot\n(3 States - 6 months)"):
        pilot_farmers = Users("10,000 Farmers\nMaharashtra\nAndhra Pradesh\nTamil Nadu")
        pilot_greengrass = IotGreengrass("100 Edge\nDevices")
        pilot_claims = Lambda("1,000 Claims\n/month")
        
        pilot_farmers >> pilot_greengrass >> pilot_claims
    
    with Cluster("Phase 2: Regional\n(10 States - 1 year)"):
        regional_farmers = Users("100,000 Farmers\nAll Major\nAgri States")
        regional_greengrass = IotGreengrass("1,000 Edge\nDevices")
        regional_claims = Lambda("10,000 Claims\n/month")
        
        regional_farmers >> regional_greengrass >> regional_claims
    
    with Cluster("Phase 3: National\n(All India - 2 years)"):
        national_farmers = Users("1M+ Farmers\n28 States\n8 Union Territories")
        national_greengrass = IotGreengrass("10,000+ Edge\nDevices")
        national_claims = Lambda("100,000 Claims\n/month")
        
        national_farmers >> national_greengrass >> national_claims
    
    # Central Infrastructure
    with Cluster("AWS Mumbai Region (ap-south-1)"):
        cdn = CloudFront("CloudFront\nGlobal CDN")
        dns = Route53("Route53\nDNS")
        orchestrator = StepFunctions("Step Functions\nAuto-Scaling")
        database = Dynamodb("DynamoDB\nGlobal Tables")
        
        pilot_claims >> orchestrator
        regional_claims >> orchestrator
        national_claims >> orchestrator
        
        orchestrator >> database
        cdn >> orchestrator
        dns >> cdn
    
    # Impact Metrics
    with Cluster("Social Impact Metrics"):
        time_saved = Lambda("Time Saved\n6 months → 60s\n99.99% reduction")
        fraud_prevented = Lambda("Fraud Prevention\n99% accuracy\nSolar Azimuth")
        financial_inclusion = Lambda("Financial Inclusion\n0% interest loans\nImmediate liquidity")
        accessibility = Lambda("Accessibility\nVoice-first\n3 languages\nIlliterate-friendly")
        
        database >> time_saved
        database >> fraud_prevented
        database >> financial_inclusion
        database >> accessibility
    
    # Scalability Metrics
    with Cluster("Technical Scalability"):
        auto_scale = Lambda("Auto-Scaling\nServerless\n0 to 100K claims")
        disaster_ready = IotGreengrass("Disaster Ready\n72hr offline\nCyclone/Flood")
        cost_efficient = Lambda("Cost Efficient\n$13-15 per claim\nPay-per-use")
        
        orchestrator >> auto_scale
        orchestrator >> disaster_ready
        orchestrator >> cost_efficient

print("✓ Impact & scalability diagram generated successfully!")
print("✓ File: vericrop_impact_scalability_16x9.png")
print("✓ Shows: Geographic scalability (3 phases) and social impact metrics")
print("✓ Aspect Ratio: 16:9 (PowerPoint optimized)")
