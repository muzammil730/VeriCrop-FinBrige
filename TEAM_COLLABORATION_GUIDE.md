# Team Collaboration Guide - VeriCrop FinBridge

## 👥 Team Setup

### Your Role (Developer/Researcher)
- **Name**: Sarafaraz (you)
- **Responsibilities**: 
  - Research and development using Kiro IDE
  - Writing code and specs locally
  - Testing and debugging
  - Documentation

### Team Leader Role (Muzammil - Your Friend)
- **Responsibilities**:
  - AWS Account owner (Account ID: 889168907575)
  - GitHub repository owner
  - Git commits and pushes
  - Final deployment to AWS
  - Hackathon submission

---

## 🔄 Recommended Workflow

### Phase 1: Development (You - Local)

**What you do on your computer**:

1. **Write code in Kiro IDE**
   ```
   D:\Kiro Hackathon\
   ├── .kiro/specs/          ← Your specs (design documents)
   ├── infrastructure/        ← CDK code you write
   ├── lambda-functions/      ← Lambda code you write
   └── README.md             ← Documentation you write
   ```

2. **Test locally**
   - Write CDK code
   - Synthesize templates (`npx cdk synth`)
   - Review CloudFormation output
   - Test Lambda functions locally

3. **Save your work**
   - Keep everything in `D:\Kiro Hackathon\`
   - Document what you built
   - Prepare for handoff to team leader

### Phase 2: Deployment (Team Leader - AWS)

**What your friend does**:

1. **Get your code**
   - You share the folder via USB/Google Drive/OneDrive
   - OR you push to a shared location
   - OR he accesses your computer

2. **Configure his AWS credentials**
   ```bash
   aws configure
   # Uses his IAM user credentials
   # Account: 889168907575
   # Region: ap-south-1
   ```

3. **Deploy to AWS**
   ```bash
   cd infrastructure
   npx cdk deploy
   # This uses HIS AWS credentials
   # Resources created in HIS account
   ```

4. **Commit to GitHub**
   ```bash
   git config user.name "Muzammil"
   git config user.email "muzammil@email.com"
   git add .
   git commit -m "Implemented VeriCrop FinBridge infrastructure"
   git push origin main
   # Shows up under HIS GitHub account
   ```

---

## 🎯 Hackathon Submission Strategy

### What Judges Will See

**GitHub Repository** (Under Muzammil's account):
```
https://github.com/muzammil/vericrop-finbridge

Repository shows:
✅ Commits by: Muzammil (team leader)
✅ Code: Written by you, committed by him
✅ Specs: Your research and design
✅ README: Your documentation
```

**AWS Account** (Muzammil's account 889168907575):
```
✅ All resources deployed under his account
✅ CloudFormation stacks show his IAM user
✅ Lambda functions, DynamoDB, S3 all in his account
```

**Presentation**:
```
Team Leader (Muzammil): Presents the project
You (Sarafaraz): Can be mentioned as team member
Both: Share credit for the work
```

---

## 🔧 Practical Setup Options

### Option 1: Sequential Workflow (Recommended for Beginners)

**Step-by-step process**:

1. **You develop locally** (on your computer)
   - Write all code in Kiro IDE
   - Test with `npx cdk synth` (doesn't deploy)
   - Document everything

2. **Transfer code to team leader**
   - Copy entire `D:\Kiro Hackathon\` folder
   - Share via USB drive, Google Drive, or OneDrive
   - OR: Push to a private GitHub repo you both access

3. **Team leader deploys**
   - He opens the folder on his computer
   - Runs `aws configure` with his credentials
   - Runs `npx cdk deploy` (deploys to his AWS account)
   - Commits to his GitHub

**Pros**: 
- ✅ Simple and clear separation
- ✅ No credential confusion
- ✅ You focus on development, he focuses on deployment

**Cons**:
- ❌ Manual transfer needed
- ❌ Can't deploy immediately for testing

---

### Option 2: Shared GitHub Repository

**Setup**:

1. **Team leader creates GitHub repo**
   ```bash
   # On his computer
   git init
   git remote add origin https://github.com/muzammil/vericrop-finbridge.git
   ```

2. **He adds you as collaborator**
   - GitHub → Repository → Settings → Collaborators
   - Adds your GitHub username

3. **You clone and work**
   ```bash
   # On your computer
   git clone https://github.com/muzammil/vericrop-finbridge.git
   cd vericrop-finbridge
   
   # Configure git with YOUR name (for transparency)
   git config user.name "Sarafaraz"
   git config user.email "sarafaraz@email.com"
   
   # Work and commit
   git add .
   git commit -m "Added Solar Azimuth validator"
   git push origin main
   ```

4. **Team leader deploys**
   ```bash
   # On his computer
   git pull origin main
   cd infrastructure
   npx cdk deploy  # Uses his AWS credentials
   ```

**Pros**:
- ✅ Real-time collaboration
- ✅ Git history shows both contributors
- ✅ Easy to sync changes

**Cons**:
- ❌ Need GitHub account
- ❌ Need to learn git commands

---

### Option 3: AWS IAM User for You (Advanced)

**Setup** (Team leader does this):

1. **Create IAM user for you**
   ```
   AWS Console → IAM → Users → Create user
   Username: Sarafaraz
   Permissions: AdministratorAccess (for development)
   ```

2. **Generate access keys**
   ```
   Security credentials → Create access key
   Download: Access Key ID + Secret Access Key
   ```

3. **You configure AWS CLI**
   ```bash
   # On your computer
   aws configure
   AWS Access Key ID: [Your access key]
   AWS Secret Access Key: [Your secret key]
   Default region: ap-south-1
   ```

4. **You can deploy directly**
   ```bash
   cd infrastructure
   npx cdk deploy  # Deploys to his account using your IAM user
   ```

**Pros**:
- ✅ You can deploy and test immediately
- ✅ Faster development cycle
- ✅ Both can work independently

**Cons**:
- ❌ Need to manage credentials securely
- ❌ Risk of accidental changes to production

---

## 📋 Current Git Configuration Issue

### Problem

Your git is configured with Muzammil's credentials:
```bash
git config --global user.name  # Shows: Muzammil
git config --global user.email # Shows: muzammil@email.com
```

### Solution Options

**Option A: Keep it as-is (Simplest)**
- All commits show as Muzammil
- Fine for hackathon (he's team leader)
- Judges see unified project under his name

**Option B: Change to your name**
```bash
git config --global user.name "Sarafaraz"
git config --global user.email "sarafaraz@email.com"
```
- Your commits show your name
- Shows collaboration in git history
- More transparent

**Option C: Use per-repository config**
```bash
# In the project folder
cd "D:\Kiro Hackathon"
git config user.name "Sarafaraz"
git config user.email "sarafaraz@email.com"

# This only affects this project
# Other projects still use Muzammil's credentials
```

### My Recommendation

**For Hackathon**: Use **Option A** (keep as Muzammil)

**Why**:
- Simpler for judges to evaluate
- Shows unified team under one leader
- Avoids confusion about who owns the project
- Common practice in team projects

---

## 🎯 Recommended Workflow for Your Situation

### Daily Development Process

**Morning** (You - Development):
```bash
# 1. Open Kiro IDE
# 2. Work on code in D:\Kiro Hackathon\
# 3. Test locally with:
npx cdk synth  # Generate CloudFormation (doesn't deploy)
npm test       # Run tests

# 4. Document what you built
# 5. Save everything
```

**Evening** (Team Leader - Deployment):
```bash
# 1. Get your code (USB/shared folder/git pull)
# 2. Review changes
# 3. Deploy to AWS:
cd infrastructure
npx cdk deploy  # Uses his AWS credentials

# 4. Commit to GitHub:
git add .
git commit -m "Implemented [feature]"
git push origin main
```

---

## 🔐 Security Best Practices

### What NOT to Do

❌ **Don't share AWS credentials via**:
- WhatsApp/Telegram messages
- Email
- Screenshots
- Unencrypted files

❌ **Don't commit credentials to git**:
- No AWS access keys in code
- No passwords in files
- Use `.gitignore` for sensitive files

### What TO Do

✅ **Secure credential sharing**:
- In-person handoff
- Encrypted USB drive
- AWS IAM user (separate credentials)
- Password manager (1Password, LastPass)

✅ **Use environment variables**:
```bash
# Instead of hardcoding
const apiKey = "abc123";  # ❌ Bad

# Use environment variables
const apiKey = process.env.API_KEY;  # ✅ Good
```

---

## 📊 Hackathon Submission Checklist

### GitHub Repository (Muzammil's account)

- [ ] Repository is public
- [ ] README.md explains the project
- [ ] `.kiro/specs/` folder shows design process
- [ ] `infrastructure/` folder has CDK code
- [ ] `lambda-functions/` folder has Lambda code
- [ ] Commits show development history
- [ ] Repository URL submitted to hackathon

### AWS Account (Muzammil's account)

- [ ] All resources deployed in ap-south-1
- [ ] CloudFormation stack exists
- [ ] Lambda functions are deployed
- [ ] DynamoDB table has data
- [ ] S3 bucket has evidence files
- [ ] Can demonstrate live in presentation

### Team Credits

- [ ] README mentions both team members
- [ ] Presentation slides credit both
- [ ] Demo shows collaborative work
- [ ] Both understand the architecture

---

## 🎤 Presentation Strategy

### Who Presents What

**Team Leader (Muzammil)**:
- Project overview
- Business problem
- AWS architecture
- Live demo

**You (Sarafaraz)**:
- Technical deep-dive
- Solar Azimuth formula explanation
- Code walkthrough
- Q&A on implementation

**Both**:
- Share credit equally
- Support each other during Q&A
- Show teamwork

---

## 💡 My Recommendation for You

### Best Approach for Your Situation

**Use Option 1: Sequential Workflow**

**Why**:
1. ✅ You focus on what you're good at (development, research)
2. ✅ He focuses on what he owns (AWS, GitHub)
3. ✅ No credential confusion
4. ✅ Clear separation of responsibilities
5. ✅ Simpler for hackathon judges to understand

**How**:
1. **You**: Develop everything in Kiro IDE on your computer
2. **You**: Test locally with `npx cdk synth`
3. **You**: Document everything thoroughly
4. **You**: Share folder with team leader (USB/Google Drive)
5. **He**: Reviews your code
6. **He**: Deploys to his AWS account
7. **He**: Commits to his GitHub
8. **Both**: Present together

---

## 🚀 Next Steps

### Immediate Actions

1. **Decide on workflow** (I recommend Option 1)
2. **Keep current git config** (as Muzammil)
3. **Focus on development** (write code in Kiro)
4. **Document everything** (for handoff)
5. **Coordinate with team leader** (for deployment)

### For This Session

**You do**:
- Write CDK code (I'll guide you)
- Test with `npx cdk synth`
- Understand the architecture
- Document decisions

**Team leader does later**:
- Run `npx cdk deploy` (with his AWS credentials)
- Commit to GitHub (with his git credentials)
- Verify deployment in AWS Console

---

## ✅ Summary

**Your Setup**:
- Computer: Your laptop
- IDE: Kiro
- Work: Development, research, specs
- Git: Configured as Muzammil (keep it)
- AWS: No credentials needed (team leader deploys)

**Team Leader Setup**:
- AWS Account: 889168907575
- GitHub: His account
- Work: Deployment, commits, submission
- Git: His credentials
- AWS: His IAM user credentials

**Workflow**:
1. You develop → 2. Share code → 3. He deploys → 4. He commits

**Result**:
- GitHub shows his account ✅
- AWS shows his account ✅
- Both get credit ✅
- Hackathon requirements met ✅

---

**Ready to proceed with development?** 

Say "Let's start Task 1 development" and I'll guide you through writing the CDK code that your team leader will deploy later!
