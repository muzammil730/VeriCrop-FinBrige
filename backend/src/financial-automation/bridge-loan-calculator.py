"""
VeriCrop FinBridge - Bridge Loan Calculator
Calculates 0% interest bridge loans (70% of damage amount)
"""

import json
import boto3
from datetime import datetime
import uuid

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('vericrop-claims')

def lambda_handler(event, context):
    """
    Input: Certificate ID, damage amount
    Output: Loan approval with disbursement details
    """
    
    try:
        # Extract input
        certificate_id = event['certificate_id']
        damage_amount = float(event['damage_amount'])
        farmer_id = event['farmer_id']
        farmer_upi = event.get('farmer_upi', 'farmer@upi')
        
        # Calculate loan amount (70% of damage)
        loan_amount = damage_amount * 0.70
        
        # Generate loan ID
        loan_id = str(uuid.uuid4())
        
        # Create loan record
        loan = {
            'loan_id': loan_id,
            'certificate_id': certificate_id,
            'farmer_id': farmer_id,
            'damage_amount': damage_amount,
            'loan_amount': loan_amount,
            'interest_rate': 0.0,  # Zero interest!
            'disbursement_method': 'UPI',
            'farmer_upi': farmer_upi,
            'status': 'APPROVED',
            'approved_at': datetime.utcnow().isoformat(),
            'repayment_status': 'PENDING',
            'collateral': certificate_id
        }
        
        # Store loan in DynamoDB
        store_loan(loan)
        
        # Simulate UPI disbursement (mock for MVP)
        disbursement_ref = disburse_loan(loan_amount, farmer_upi)
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'loan_id': loan_id,
                'loan_amount': loan_amount,
                'interest_rate': 0.0,
                'disbursement_ref': disbursement_ref,
                'farmer_upi': farmer_upi,
                'message': f'Bridge loan of ₹{loan_amount:,.2f} approved and disbursed'
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 400,
            'body': json.dumps({
                'error': str(e),
                'message': 'Failed to process bridge loan'
            })
        }

def store_loan(loan):
    """
    Store loan record in DynamoDB
    """
    table.put_item(Item={
        'claimId': loan['loan_id'],
        'timestamp': int(datetime.utcnow().timestamp()),
        'type': 'LOAN',
        'data': loan
    })

def disburse_loan(amount, upi_id):
    """
    Simulate UPI disbursement
    For MVP: Mock payment gateway
    In production: Integrate with actual UPI gateway (Razorpay, PayTM, etc.)
    """
    # Simulate payment processing
    disbursement_ref = f"UPI-{uuid.uuid4().hex[:12].upper()}"
    
    # In production, you would:
    # 1. Call UPI payment gateway API
    # 2. Initiate fund transfer
    # 3. Wait for confirmation
    # 4. Return transaction reference
    
    return disbursement_ref

# Test locally
if __name__ == "__main__":
    test_event = {
        'certificate_id': 'cert-123',
        'damage_amount': 50000,
        'farmer_id': 'farmer-456',
        'farmer_upi': 'farmer@paytm'
    }
    result = lambda_handler(test_event, None)
    print(json.dumps(result, indent=2))
