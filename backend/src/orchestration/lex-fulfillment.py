"""
VeriCrop FinBridge - Lex Fulfillment Handler
Processes voice bot requests and triggers claim workflow
"""

import json
import boto3

stepfunctions = boto3.client('stepfunctions')

STEP_FUNCTION_ARN = 'arn:aws:states:ap-south-1:ACCOUNT_ID:stateMachine:vericrop-claim-processing'

def lambda_handler(event, context):
    """
    Lex bot fulfillment handler
    """
    
    intent_name = event['sessionState']['intent']['name']
    
    if intent_name == 'FileCropDamageClaim':
        return handle_file_claim(event)
    elif intent_name == 'CheckClaimStatus':
        return handle_check_status(event)
    else:
        return close(event, 'Fulfilled', 'मुझे समझ नहीं आया। कृपया फिर से कोशिश करें।')

def handle_file_claim(event):
    """
    Handle crop damage claim filing
    """
    slots = event['sessionState']['intent']['slots']
    
    # Extract slot values
    farmer_id = get_slot_value(slots, 'farmer_id')
    damage_type = get_slot_value(slots, 'damage_type')
    location = get_slot_value(slots, 'location')
    
    if not all([farmer_id, damage_type, location]):
        # Elicit missing slots
        return elicit_slot(event, get_missing_slot(slots))
    
    # All slots filled - start claim processing
    try:
        # Trigger Step Functions workflow
        response = stepfunctions.start_execution(
            stateMachineArn=STEP_FUNCTION_ARN,
            input=json.dumps({
                'farmer_id': farmer_id,
                'damage_type': damage_type,
                'location': location
            })
        )
        
        execution_arn = response['executionArn']
        
        message = f"धन्यवाद {farmer_id}! आपका {damage_type} दावा दर्ज हो गया है। हम 60 सेकंड में आपके दावे की जांच करेंगे।"
        
        return close(event, 'Fulfilled', message)
        
    except Exception as e:
        return close(event, 'Failed', f'क्षमा करें, त्रुटि हुई: {str(e)}')

def handle_check_status(event):
    """
    Handle claim status check
    """
    slots = event['sessionState']['intent']['slots']
    claim_id = get_slot_value(slots, 'claim_id')
    
    if not claim_id:
        return elicit_slot(event, 'claim_id')
    
    # Check claim status (simplified for MVP)
    message = f"आपका दावा {claim_id} प्रक्रिया में है। कृपया कुछ समय बाद जांचें।"
    
    return close(event, 'Fulfilled', message)

def get_slot_value(slots, slot_name):
    """
    Extract slot value from Lex event
    """
    if slot_name in slots and slots[slot_name]:
        return slots[slot_name]['value']['interpretedValue']
    return None

def get_missing_slot(slots):
    """
    Find first missing required slot
    """
    required_slots = ['farmer_id', 'damage_type', 'location']
    for slot in required_slots:
        if not get_slot_value(slots, slot):
            return slot
    return None

def elicit_slot(event, slot_name):
    """
    Ask user to provide missing slot
    """
    prompts = {
        'farmer_id': 'आपका किसान आईडी क्या है?',
        'damage_type': 'क्या नुकसान हुआ है? (सूखा, बाढ़, कीट, बीमारी)',
        'location': 'आप कहाँ से हैं?'
    }
    
    return {
        'sessionState': {
            'dialogAction': {
                'type': 'ElicitSlot',
                'slotToElicit': slot_name
            },
            'intent': event['sessionState']['intent']
        },
        'messages': [
            {
                'contentType': 'PlainText',
                'content': prompts.get(slot_name, 'कृपया जानकारी दें')
            }
        ]
    }

def close(event, fulfillment_state, message):
    """
    Close the conversation
    """
    return {
        'sessionState': {
            'dialogAction': {
                'type': 'Close'
            },
            'intent': {
                'name': event['sessionState']['intent']['name'],
                'state': fulfillment_state
            }
        },
        'messages': [
            {
                'contentType': 'PlainText',
                'content': message
            }
        ]
    }
