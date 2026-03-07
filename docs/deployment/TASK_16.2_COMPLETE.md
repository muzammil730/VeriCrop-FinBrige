# Task 16.2 Complete: Amazon Cognito Authentication

## Status: ✅ DEPLOYED

## Overview
Configured Amazon Cognito User Pool for farmer authentication with SMS-based MFA and phone number sign-in.

## Cognito Configuration

### User Pool Details
- **Name:** `vericrop-farmers`
- **User Pool ID:** `ap-south-1_wSboA3SPd`
- **ARN:** `arn:aws:cognito-idp:ap-south-1:889168907575:userpool/ap-south-1_wSboA3SPd`
- **Region:** ap-south-1 (Mumbai, India)

### Authentication Features

**Sign-In Method:**
- ✅ Phone number (primary) - SMS-based authentication
- ❌ Email (disabled) - Not required for low-literacy farmers
- ✅ Auto-verify phone via SMS OTP

**Multi-Factor Authentication (MFA):**
- Type: OPTIONAL (user can enable)
- Method: SMS-based
- No TOTP/authenticator app (simpler for farmers)

**Password Policy:**
- Minimum length: 6 characters (simple for low-literacy users)
- No uppercase requirement
- No lowercase requirement
- Digits required: Yes
- Symbols required: No

**Account Recovery:**
- Method: Phone number only (no MFA required for recovery)
- SMS-based password reset

### User Attributes

**Standard Attributes:**
- `phoneNumber` (required, immutable) - Primary identifier
- `givenName` (required, mutable) - First name
- `familyName` (optional, mutable) - Last name

**Custom Attributes:**
- `farmerDID` (10-100 chars, immutable) - Decentralized Identifier for privacy
- `village` (2-100 chars, mutable) - Village name
- `district` (2-100 chars, mutable) - District name
- `state` (2-100 chars, mutable) - State name

### User Pool Client

**Client Details:**
- **Name:** `vericrop-app-client`
- **Client ID:** `13tj7nd7kfm56hgfqerpu5ts8q`
- **Type:** Public client (no secret) - for mobile/web apps

**Authentication Flows:**
- ✅ USER_PASSWORD_AUTH - Username/password authentication
- ✅ USER_SRP_AUTH - Secure Remote Password (more secure)
- ✅ CUSTOM_AUTH - For voice-based auth via Amazon Lex

**Token Validity:**
- Access Token: 1 hour
- ID Token: 1 hour
- Refresh Token: 30 days

**Security:**
- Prevent user existence errors: Enabled (prevents enumeration attacks)

## Integration Points

### Frontend Integration
To integrate with the frontend, add AWS Amplify:

```typescript
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    region: 'ap-south-1',
    userPoolId: 'ap-south-1_wSboA3SPd',
    userPoolWebClientId: '13tj7nd7kfm56hgfqerpu5ts8q',
  }
});
```

### API Gateway Integration (Future)
To protect API endpoints with Cognito:

```typescript
const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'Authorizer', {
  cognitoUserPools: [userPool],
});

// Add to API methods
resource.addMethod('POST', integration, {
  authorizer,
  authorizationType: apigateway.AuthorizationType.COGNITO,
});
```

### Lambda Integration
Lambda functions can verify JWT tokens:

```typescript
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const verifier = CognitoJwtVerifier.create({
  userPoolId: 'ap-south-1_wSboA3SPd',
  tokenUse: 'access',
  clientId: '13tj7nd7kfm56hgfqerpu5ts8q',
});

// In Lambda handler
const payload = await verifier.verify(token);
console.log('User authenticated:', payload.sub);
```

## User Registration Flow

1. **Sign Up:**
   ```
   User provides: Phone number (+91XXXXXXXXXX), Password, Name
   → Cognito sends SMS OTP
   → User enters OTP to verify phone
   → Account created
   ```

2. **Sign In:**
   ```
   User provides: Phone number, Password
   → Cognito validates credentials
   → Returns: Access Token, ID Token, Refresh Token
   → Frontend stores tokens securely
   ```

3. **MFA (Optional):**
   ```
   User enables MFA in settings
   → Every sign-in requires SMS OTP
   → Enhanced security for sensitive operations
   ```

## Security Features

✅ **SMS-based authentication** - No password memorization needed
✅ **JWT tokens** - Stateless authentication with 1-hour expiry
✅ **Refresh tokens** - 30-day validity for seamless re-authentication
✅ **Phone verification** - Prevents fake accounts
✅ **Custom attributes** - Farmer-specific data (DID, village, district)
✅ **Account recovery** - SMS-based password reset
✅ **User existence protection** - Prevents enumeration attacks

## Cost Considerations

**Cognito Pricing (ap-south-1):**
- First 50,000 MAUs (Monthly Active Users): FREE
- 50,001 - 100,000 MAUs: $0.0055 per MAU
- SMS costs: ~$0.00645 per SMS (India)

**Estimated Cost for 10,000 farmers:**
- User Pool: FREE (under 50k MAUs)
- SMS OTPs: ~$0.065 per farmer per month (10 SMS)
- Total: ~$650/month for 10,000 active farmers

## Production Recommendations

1. **Enable MFA by default** for all users (currently optional)
2. **Add Cognito Identity Pool** for temporary AWS credentials
3. **Configure Cognito Triggers** (Lambda) for:
   - Pre-signup validation
   - Post-confirmation actions
   - Custom authentication challenges
4. **Add email as backup** for account recovery
5. **Implement rate limiting** to prevent SMS abuse
6. **Add CAPTCHA** for sign-up to prevent bots
7. **Configure advanced security** (compromised credentials check)

## Testing

### Manual Testing via AWS Console
1. Go to Cognito → User Pools → vericrop-farmers
2. Click "Create user" to add test user
3. Provide phone number (+91XXXXXXXXXX) and temporary password
4. User will receive SMS OTP to verify phone

### Testing via AWS CLI
```bash
# Sign up a new user
aws cognito-idp sign-up \
  --client-id 13tj7nd7kfm56hgfqerpu5ts8q \
  --username +919876543210 \
  --password Test@123 \
  --user-attributes Name=phone_number,Value=+919876543210 Name=given_name,Value=TestFarmer

# Confirm sign-up with OTP
aws cognito-idp confirm-sign-up \
  --client-id 13tj7nd7kfm56hgfqerpu5ts8q \
  --username +919876543210 \
  --confirmation-code 123456

# Sign in
aws cognito-idp initiate-auth \
  --client-id 13tj7nd7kfm56hgfqerpu5ts8q \
  --auth-flow USER_PASSWORD_AUTH \
  --auth-parameters USERNAME=+919876543210,PASSWORD=Test@123
```

## Next Steps

1. ✅ Cognito User Pool deployed
2. ⏳ Integrate with frontend (add AWS Amplify)
3. ⏳ Add Cognito authorizer to API Gateway
4. ⏳ Implement sign-up/sign-in UI
5. ⏳ Add voice-based authentication via Lex (Task 14)

## CloudFormation Outputs

```
UserPoolId: ap-south-1_wSboA3SPd
UserPoolArn: arn:aws:cognito-idp:ap-south-1:889168907575:userpool/ap-south-1_wSboA3SPd
UserPoolClientId: 13tj7nd7kfm56hgfqerpu5ts8q
```

## Conclusion

✅ **Amazon Cognito User Pool successfully deployed and configured for farmer authentication.**

The system now has:
- SMS-based phone authentication
- Optional MFA for enhanced security
- Custom farmer attributes (DID, village, district)
- JWT token-based authorization
- Simple password policy for low-literacy users
- Account recovery via SMS

Ready for frontend integration and API Gateway protection!
