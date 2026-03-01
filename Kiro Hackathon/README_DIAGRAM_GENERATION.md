# VeriCrop FinBridge Architecture Diagram

## Option 1: Generate Using Python (Recommended)

### Prerequisites
```bash
pip install diagrams
```

### Generate Diagram
```bash
python generate_architecture_diagram.py
```

This will create `vericrop_finbridge_architecture.png` with official AWS icons.

## Option 2: View Mermaid Diagram

The design document (`.kiro/specs/vericrop-finbridge/design.md`) contains a Mermaid diagram that can be viewed in:
- GitHub (renders automatically)
- VS Code with Mermaid extension
- Any Markdown viewer with Mermaid support

## Option 3: Online Diagram Tools

Use the Mermaid code from the design document in:
- https://mermaid.live/
- https://www.diagrams.net/ (import Mermaid)

## Architecture Overview

The diagram shows three logical zones:

1. **Edge/Field Zone**: 
   - AWS IoT Greengrass v2 for 72-hour offline operation
   - Transfer Learning model (PlantVillage + Kaggle datasets)
   - Voice interface (Amazon Lex & Polly)

2. **Logic & Analysis Zone**:
   - AWS Step Functions Express (60-second orchestration)
   - Forensic validation (Solar Azimuth, Weather, Rekognition)
   - Amazon A2I for human-in-the-loop (5% random audit)

3. **Trust & Ledger Zone**:
   - Amazon QLDB for immutable Loss Certificates
   - Amazon Managed Blockchain (Hyperledger Fabric)
   - Bridge Loan Engine (0% interest, 70% LTV)

## Key Features Highlighted

- **60-second end-to-end processing** (Step Functions Express)
- **Solar Azimuth fraud detection** (sin α = sin Φ sin δ + cos Φ cos δ cos h)
- **72-hour offline capability** (Greengrass v2)
- **Voice-first UX** (Hindi/Tamil/Telugu via Lex & Polly)
- **Immutable evidence** (S3 Object Lock with SHA-256)
- **Blockchain certificates** (QLDB + Managed Blockchain)
- **Human oversight** (A2I with 5% random audit)
