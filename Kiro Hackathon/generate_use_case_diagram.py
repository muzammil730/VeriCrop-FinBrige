"""
VeriCrop FinBridge Use Case Diagram - 16:9
Shows all actors and their use cases in the system

Requirements:
    pip install diagrams

Usage:
    python3 generate_use_case_diagram.py
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.onprem.client import User, Users
from diagrams.aws.ml import Lex, Polly, AugmentedAi
from diagrams.aws.integration import StepFunctions
from diagrams.aws.compute import Lambda
from diagrams.aws.blockchain import QLDB, ManagedBlockchain
from diagrams.aws.database import Dynamodb
from diagrams.aws.security import Cognito

graph_attr = {
    "fontsize": "12",
    "bgcolor": "white",
    "pad": "0.4",
    "splines": "ortho",
    "nodesep": "1.0",
    "ranksep": "2.0",
    "ratio": "0.5625"  # 16:9 aspect ratio
}

with Diagram("VeriCrop FinBridge - Use Case Diagram (All Actors & Interactions)", 
             filename="vericrop_use_case_16x9",
             show=False,
             direction="LR",
             graph_attr=graph_attr,
             outformat="png"):
    
    # Actors
    with Cluster("Actors"):
        farmer = User("Farmer\n(Primary)")
        reviewer = Users("Human\nReviewer")
        insurer = User("Insurance\nCompany")
        lender = User("Financial\nInstitution")
        auditor = User("Regulatory\nAuditor")
    
    # Farmer Use Cases
    with Cluster("Farmer Use Cases"):
        auth = Cognito("Authenticate\n(Cognito + DID)")
        file_claim = Lex("File Claim\n(Voice Input)")
        upload_evidence = Lambda("Upload Video\nEvidence")
        check_status = Lambda("Check Claim\nStatus")
        receive_loan = Lambda("Receive Bridge\nLoan (0%)")
        view_certificate = QLDB("View Loss\nCertificate")
        
        farmer >> auth
        farmer >> file_claim
        farmer >> upload_evidence
        farmer >> check_status
        farmer >> receive_loan
        farmer >> view_certificate
    
    # System Use Cases
    with Cluster("System Use Cases (Automated)"):
        validate = StepFunctions("Validate Claim\n(60s Process)")
        solar_check = Lambda("Solar Azimuth\nFraud Check")
        weather_check = Lambda("Weather\nCorrelation")
        ai_analysis = Lambda("AI Crop\nDamage Analysis")
        issue_cert = QLDB("Issue Loss\nCertificate")
        calculate_loan = Lambda("Calculate\nLoan Amount")
        
        file_claim >> validate
        upload_evidence >> validate
        validate >> solar_check
        validate >> weather_check
        validate >> ai_analysis
        validate >> issue_cert
        issue_cert >> calculate_loan
        calculate_loan >> receive_loan
    
    # Human Reviewer Use Cases
    with Cluster("Reviewer Use Cases"):
        review_queue = AugmentedAi("Review Low\nConfidence Claims")
        approve_reject = Lambda("Approve/Reject\nClaim")
        provide_feedback = Lambda("Provide\nFeedback")
        
        reviewer >> review_queue
        reviewer >> approve_reject
        reviewer >> provide_feedback
        
        validate >> Edge(label="<85% confidence\nOR 5% random") >> review_queue
        approve_reject >> issue_cert
    
    # Insurer Use Cases
    with Cluster("Insurer Use Cases"):
        verify_cert = QLDB("Verify Loss\nCertificate")
        process_payout = Lambda("Process\nInsurance Payout")
        view_claims = Dynamodb("View Claims\nHistory")
        
        insurer >> verify_cert
        insurer >> process_payout
        insurer >> view_claims
        
        process_payout >> Edge(label="Auto-repay") >> calculate_loan
    
    # Lender Use Cases
    with Cluster("Lender Use Cases"):
        verify_blockchain = ManagedBlockchain("Verify Certificate\n(Blockchain)")
        offer_loan = Lambda("Offer Bridge\nLoan")
        track_repayment = Lambda("Track Loan\nRepayment")
        
        lender >> verify_blockchain
        lender >> offer_loan
        lender >> track_repayment
        
        verify_blockchain >> offer_loan
        offer_loan >> receive_loan
    
    # Auditor Use Cases
    with Cluster("Auditor Use Cases"):
        audit_trail = Dynamodb("View Audit\nTrail")
        verify_immutable = QLDB("Verify\nImmutability")
        review_compliance = Lambda("Review\nCompliance")
        
        auditor >> audit_trail
        auditor >> verify_immutable
        auditor >> review_compliance

print("✓ Use case diagram generated successfully!")
print("✓ File: vericrop_use_case_16x9.png")
print("✓ Shows: All actors (Farmer, Reviewer, Insurer, Lender, Auditor) and their use cases")
print("✓ Aspect Ratio: 16:9 (PowerPoint optimized)")
