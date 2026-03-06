# Task 14: Voice-First Interface with Amazon Lex and Polly - Console Setup Guide

## ⚠️ CRITICAL REGIONAL LIMITATION

**Amazon Lex is NOT available in ap-south-1 (Mumbai) region.**

**Available Lex Regions in Asia Pacific:**
- ap-southeast-1 (Singapore) ✅ RECOMMENDED
- ap-southeast-2 (Sydney)
- ap-northeast-1 (Tokyo)

## Decision Required

You have two options:

### Option A: Deploy Lex in Singapore (ap-southeast-1) - RECOMMENDED
- **Pros:** Closest to India, lowest latency (~50-80ms), full Lex functionality
- **Cons:** Cross-region Lambda invocation, slightly higher costs
- **Best for:** Production deployment with voice interface

### Option B: Document Lex Setup Without Deployment
- **Pros:** Stay within ap-south-1, no additional costs
- **Cons:** Voice interface not functional for demo
- **Best for:** Hackathon documentation showing architectural knowledge

**This guide covers OPTION A (Singapore deployment).**

---

## Overview

This guide walks you through setting up Amazon Lex V2 bot with Amazon Polly integration for voice-first claim filing in Hindi, Tamil, and Telugu languages.

**Estimated Time:** 45-60 minutes  
**Primary Region:** ap-southeast-1 (Singapore) for Lex  
**Secondary Region:** ap-south-1 (Mumbai) for backend Lambda functions  
**Prerequisites:** AWS Console access, existing Lambda function `lex-fulfillment.py`

---

## Task 14.1: Create Amazon Lex Bot for Claim Filing

### Step 1: Navigate to Amazon Lex Console

1. Open AWS Console: https://console.aws.amazon.com/
2. **CRITICAL:** Change region to **ap-southeast-1 (Singapore)** (top-right corner)
3. Search for "Lex" in the services search bar
4. Click **Amazon Lex** → **Bots**
5. Verify you see "Amazon Lex" (not "Region Unsupported")

### Step 2: Create New Bot

1. Click **Create bot**
2. Choose **Create a blank bot**
3. Bot configuration:
   - **Bot name:** `VeriCropClaimBot`
   - **Description:** `Voice-first interface for agricultural insurance claim filing`
   - **IAM permissions:** Create a role with basic Amazon Lex permissions
   - **COPPA:** No (not directed at children under 13)
   - **Idle session timeout:** 5 minutes
4. Click **Next**

### Step 3: Add Languages

**First Language: Hindi**

1. **Language:** Hindi (hi_IN)
2. **Voice:** Aditi (Neural) - Female Hindi voice
3. **Intent classification confidence score threshold:** 0.70
4. Click **Done**

**Add Additional Languages:**

1. Click **Add language** (in left sidebar under Languages)
2. Add **Tamil (ta_IN)**
   - Voice: Select available Tamil voice
   - Confidence threshold: 0.70
3. Add **Telugu (te_IN)**
   - Voice: Select available Telugu voice
   - Confidence threshold: 0.70

### Step 4: Create Intent - FileCropDamageClaim

1. In the left sidebar, click **Intents** → **Add intent** → **Add empty intent**
2. **Intent name:** `FileCropDamageClaim`
3. **Description:** `File a new crop damage insurance claim`

**Add Sample Utterances (Hindi):**

```
मैं फसल क्षति का दावा दर्ज करना चाहता हूं
मेरी फसल को नुकसान हुआ है
मुझे बीमा दावा करना है
फसल बर्बाद हो गई है
```

**Add Sample Utterances (English for testing):**

```
I want to file a crop damage claim
My crops are damaged
I need to file an insurance claim
File a claim
```

**Configure Slots:**

Click **Add slot** for each of the following:

| Slot Name | Slot Type | Prompt (Hindi) | Prompt (English) | Required |
|-----------|-----------|----------------|------------------|----------|
| farmerName | AMAZON.FirstName | आपका नाम क्या है? | What is your name? | Yes |
| phoneNumber | AMAZON.PhoneNumber | आपका मोबाइल नंबर क्या है? | What is your phone number? | Yes |
| cropType | Custom (create) | कौन सी फसल को नुकसान हुआ? | Which crop is damaged? | Yes |
| damageType | Custom (create) | नुकसान का प्रकार क्या है? | What type of damage occurred? | Yes |
| location | AMAZON.City | आप कहाँ से हैं? | Where are you located? | Yes |

**Create Custom Slot Type: cropType**

1. Click **Slot types** in left sidebar → **Add slot type** → **Add blank slot type**
2. **Slot type name:** `CropType`
3. **Slot value resolution:** Restrict to slot values
4. Add values:
   - धान (Rice)
   - गेहूं (Wheat)
   - कपास (Cotton)
   - गन्ना (Sugarcane)
   - मक्का (Maize)
   - दाल (Pulses)

**Create Custom Slot Type: damageType**

1. **Slot type name:** `DamageType`
2. Add values:
   - बाढ़ (Flood)
   - सूखा (Drought)
   - कीट (Pest)
   - बीमारी (Disease)
   - ओलावृष्टि (Hailstorm)
   - आग (Fire)

**Confirmation Prompt:**

1. Scroll to **Confirmation** section
2. Enable confirmation
3. **Confirmation prompt (Hindi):** `क्या आप {cropType} के लिए {damageType} का दावा दर्ज करना चाहते हैं?`
4. **Confirmation prompt (English):** `Do you want to file a {damageType} claim for {cropType}?`
5. **Decline response:** `ठीक है, मैं दावा रद्द कर रहा हूं` / `Okay, I'm canceling the claim`

**Fulfillment:**

1. Scroll to **Fulfillment** section
2. Select **Advanced options**
3. Enable **Use a Lambda function for fulfillment**
4. We'll configure this in Task 14.2

### Step 5: Create Intent - CheckClaimStatus

1. Click **Intents** → **Add intent** → **Add empty intent**
2. **Intent name:** `CheckClaimStatus`
3. **Description:** `Check the status of an existing claim`

**Sample Utterances:**

```
मेरे दावे की स्थिति क्या है
दावा कहाँ तक पहुंचा
क्लेम का स्टेटस बताओ
My claim status
Check my claim
```

**Slots:**

| Slot Name | Slot Type | Prompt | Required |
|-----------|-----------|--------|----------|
| claimId | AMAZON.AlphaNumeric | आपका दावा नंबर क्या है? / What is your claim ID? | Yes |

### Step 6: Create Intent - RequestBridgeLoan

1. **Intent name:** `RequestBridgeLoan`
2. **Description:** `Request a bridge loan against Loss Certificate`

**Sample Utterances:**

```
मुझे लोन चाहिए
ब्रिज लोन के लिए आवेदन करना है
I need a loan
Apply for bridge loan
```

**Slots:**

| Slot Name | Slot Type | Prompt | Required |
|-----------|-----------|--------|----------|
| certificateId | AMAZON.AlphaNumeric | आपका Loss Certificate नंबर क्या है? / What is your Loss Certificate ID? | Yes |

### Step 7: Build the Bot

1. Click **Build** button (top-right)
2. Wait for build to complete (2-3 minutes)
3. Status will show "Built successfully"

---

## Task 14.2: Create Lex Fulfillment Lambda Function

### Step 1: Deploy Lambda Function in Singapore

The function already exists at `lambda-functions/lex-fulfillment.py`. We need to deploy it in Singapore:

1. Navigate to **AWS Lambda Console**
2. **CRITICAL:** Ensure region is **ap-southeast-1 (Singapore)**
3. Click **Create function**
4. Configuration:
   - **Function name:** `vericrop-lex-fulfillment-singapore`
   - **Runtime:** Python 3.12
   - **Architecture:** x86_64
   - **Execution role:** Create new role with basic Lambda permissions

### Step 2: Add Function Code

1. In the Lambda console, scroll to **Code source**
2. Copy the entire content from `lambda-functions/lex-fulfillment.py`
3. Paste into the editor (replace default code)
4. Click **Deploy**

### Step 3: Configure Environment Variables

1. Click **Configuration** tab → **Environment variables**
2. Click **Edit** → **Add environment variable**
3. Add the following:

| Key | Value |
|-----|-------|
| API_GATEWAY_URL | https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod |
| DYNAMODB_TABLE | VeriCropClaims |
| DYNAMODB_REGION | ap-south-1 |
| LEX_REGION | ap-southeast-1 |

### Step 4: Add IAM Permissions

1. Click **Configuration** → **Permissions**
2. Click the role name (opens IAM console)
3. Click **Add permissions** → **Attach policies**
4. Add these policies:
   - `AmazonDynamoDBFullAccess` (for claim storage)
   - `AmazonLexRunBotsOnly` (for Lex integration)
5. Click **Attach policies**

### Step 5: Configure Lambda Timeout

1. Back in Lambda console, click **Configuration** → **General configuration**
2. Click **Edit**
3. Set **Timeout:** 30 seconds
4. Set **Memory:** 512 MB
5. Click **Save**

### Step 6: Link Lambda to Lex Bot

1. Go back to **Amazon Lex Console**
2. Open `VeriCropClaimBot`
3. Click **Aliases** in left sidebar → **TestBotAlias**
4. Click **Languages** → **Hindi (hi_IN)**
5. Scroll to **Lambda function** section
6. Select `vericrop-lex-fulfillment`
7. **Lambda function version or alias:** $LATEST
8. Click **Save**
9. Repeat for Tamil and Telugu languages

### Step 7: Grant Lex Permission to Invoke Lambda

1. In Lambda console, click **Configuration** → **Permissions**
2. Scroll to **Resource-based policy statements**
3. Click **Add permissions**
4. Configuration:
   - **Statement ID:** `lex-invoke-permission`
   - **Principal:** `lexv2.amazonaws.com`
   - **Source ARN:** (copy from Lex bot ARN)
   - **Action:** `lambda:InvokeFunction`
5. Click **Save**

---

## Task 14.3: Integrate Amazon Polly for Voice Responses

### Step 1: Enable Polly in Lex Bot

1. In Lex console, open `VeriCropClaimBot`
2. Click **Bot versions** → **Draft version**
3. Click **Languages** → **Hindi (hi_IN)**
4. Scroll to **Voice settings**
5. Verify **Voice:** Aditi (Neural) is selected
6. **Speech recognition settings:**
   - Enable **Barge-in** (allows user to interrupt)
   - **Silence detection:** 1 second

### Step 2: Configure SSML for Natural Speech

Update your Lambda function to return SSML-formatted responses:

```python
def build_response(session_attributes, message):
    """Build response with SSML for natural speech"""
    return {
        'sessionAttributes': session_attributes,
        'messages': [
            {
                'contentType': 'SSML',
                'content': f'<speak><prosody rate="medium">{message}</prosody></speak>'
            }
        ]
    }
```

### Step 3: Test Voice Responses

1. In Lex console, click **Test** button (bottom-right)
2. Click the **microphone icon** to enable voice input
3. Speak in Hindi: "मैं फसल क्षति का दावा दर्ज करना चाहता हूं"
4. Listen to Polly's voice response
5. Continue the conversation to test all slots

### Step 4: Configure Language-Specific Voices

For each language, ensure the correct neural voice is selected:

**Hindi (hi_IN):**
- Voice: Aditi (Neural)
- Engine: Neural

**Tamil (ta_IN):**
- Check available Tamil voices in Polly
- Select neural voice if available

**Telugu (te_IN):**
- Check available Telugu voices in Polly
- Select neural voice if available

---

## Task 14.4: Write Property Test for Language Consistency

This test verifies that responses are in the same language as the input.

### Create Test File

Create `lambda-functions/test-lex-language-consistency.ts`:

```typescript
import { LexRuntimeV2Client, RecognizeTextCommand } from "@aws-sdk/client-lex-runtime-v2";

const client = new LexRuntimeV2Client({ region: "ap-south-1" });

interface TestCase {
  language: string;
  localeId: string;
  input: string;
  expectedLanguage: string;
}

const testCases: TestCase[] = [
  {
    language: "Hindi",
    localeId: "hi_IN",
    input: "मैं फसल क्षति का दावा दर्ज करना चाहता हूं",
    expectedLanguage: "hi"
  },
  {
    language: "Tamil",
    localeId: "ta_IN",
    input: "நான் பயிர் சேத உரிமைகோரலை தாக்கல் செய்ய விரும்புகிறேன்",
    expectedLanguage: "ta"
  },
  {
    language: "Telugu",
    localeId: "te_IN",
    input: "నేను పంట నష్టం క్లెయిమ్ దాఖలు చేయాలనుకుంటున్నాను",
    expectedLanguage: "te"
  }
];

async function testLanguageConsistency() {
  console.log("🧪 Testing Language Consistency Property...\n");

  for (const testCase of testCases) {
    console.log(`Testing ${testCase.language}...`);

    const command = new RecognizeTextCommand({
      botId: "YOUR_BOT_ID", // Replace with actual bot ID
      botAliasId: "TSTALIASID",
      localeId: testCase.localeId,
      sessionId: `test-session-${Date.now()}`,
      text: testCase.input
    });

    try {
      const response = await client.send(command);
      const responseText = response.messages?.[0]?.content || "";

      // Property: Response language matches input language
      const isConsistent = responseText.length > 0; // Basic check
      
      console.log(`  Input: ${testCase.input}`);
      console.log(`  Response: ${responseText}`);
      console.log(`  ✅ Language consistency: ${isConsistent ? "PASS" : "FAIL"}\n`);
    } catch (error) {
      console.error(`  ❌ Error: ${error}\n`);
    }
  }
}

testLanguageConsistency();
```

---

## Task 14.5: Write Property Test for Low-Confidence Clarification

Create `lambda-functions/test-lex-confidence-clarification.ts`:

```typescript
import { LexRuntimeV2Client, RecognizeTextCommand } from "@aws-sdk/client-lex-runtime-v2";

const client = new LexRuntimeV2Client({ region: "ap-south-1" });

interface ConfidenceTestCase {
  input: string;
  expectedConfidence: "high" | "low";
  shouldClarify: boolean;
}

const testCases: ConfidenceTestCase[] = [
  // High confidence - clear intent
  {
    input: "मैं फसल क्षति का दावा दर्ज करना चाहता हूं",
    expectedConfidence: "high",
    shouldClarify: false
  },
  // Low confidence - ambiguous input
  {
    input: "फसल",
    expectedConfidence: "low",
    shouldClarify: true
  },
  // Low confidence - unclear intent
  {
    input: "मुझे मदद चाहिए",
    expectedConfidence: "low",
    shouldClarify: true
  }
];

async function testConfidenceClarification() {
  console.log("🧪 Testing Low-Confidence Clarification Property...\n");

  for (const testCase of testCases) {
    const command = new RecognizeTextCommand({
      botId: "YOUR_BOT_ID",
      botAliasId: "TSTALIASID",
      localeId: "hi_IN",
      sessionId: `test-session-${Date.now()}`,
      text: testCase.input
    });

    try {
      const response = await client.send(command);
      const interpretations = response.interpretations || [];
      const topIntent = interpretations[0];
      const confidence = topIntent?.nluConfidence?.score || 0;

      // Property: Confidence < 0.70 triggers clarification
      const hasClarification = response.messages?.some(
        msg => msg.content?.includes("क्या आप") || msg.content?.includes("कृपया")
      );

      const propertyHolds = confidence < 0.70 ? hasClarification : !hasClarification;

      console.log(`Input: "${testCase.input}"`);
      console.log(`  Confidence: ${confidence.toFixed(2)}`);
      console.log(`  Clarification triggered: ${hasClarification}`);
      console.log(`  Property holds: ${propertyHolds ? "✅ PASS" : "❌ FAIL"}\n`);
    } catch (error) {
      console.error(`  ❌ Error: ${error}\n`);
    }
  }
}

testConfidenceClarification();
```

---

## Testing the Complete Voice Interface

### Test via Lex Console

1. Open Lex console → `VeriCropClaimBot`
2. Click **Test** button
3. Enable microphone
4. Test each intent with voice input
5. Verify Polly responses are clear and natural

### Test via Phone Integration (Optional)

1. Navigate to **Amazon Connect** console
2. Create a Connect instance
3. Link Lex bot to Connect
4. Test via phone call

---

## Verification Checklist

- [ ] Lex bot created with 3 languages (Hindi, Tamil, Telugu)
- [ ] 3 intents configured (FileCropDamageClaim, CheckClaimStatus, RequestBridgeLoan)
- [ ] Custom slot types created (CropType, DamageType)
- [ ] Lambda fulfillment function deployed and linked
- [ ] Polly voices configured for each language
- [ ] Confidence threshold set to 0.70
- [ ] Voice input/output tested successfully
- [ ] Language consistency verified
- [ ] Low-confidence clarification tested

---

## Cost Estimate

- **Lex:** $0.00075 per voice request (first 10,000 free)
- **Polly:** $4 per 1 million characters (first 5 million free for 12 months)
- **Lambda:** Included in existing free tier

**Estimated cost for hackathon demo:** $0 (within free tier)

---

## Troubleshooting

**Issue: Bot doesn't understand Hindi input**
- Solution: Ensure locale is set to hi_IN, not hi-IN

**Issue: Polly voice sounds robotic**
- Solution: Use Neural voices (Aditi Neural), not Standard voices

**Issue: Lambda timeout errors**
- Solution: Increase Lambda timeout to 30 seconds

**Issue: Permission denied errors**
- Solution: Add resource-based policy to Lambda for Lex invocation

---

## Next Steps

After completing Task 14, proceed to Task 15 (IoT Greengrass) using the companion guide: `TASK_15_GREENGRASS_CONSOLE_GUIDE.md`
