# VeriCrop FinBridge - Frontend Application

## Overview

This is the frontend web application for VeriCrop FinBridge, built with Next.js 14 and React 18. It provides an interactive demo of the Solar Azimuth fraud detection system and showcases the complete solution.

---

## Features

### 🔬 Interactive Solar Azimuth Calculator
- Input GPS coordinates (latitude/longitude)
- Select timestamp
- Calculate expected shadow direction using physics
- Visualize fraud detection results

### 📊 Feature Showcase
- Problem statement and solution overview
- Key features with descriptions
- AWS architecture visualization
- Impact metrics and statistics

### 🎨 Modern UI/UX
- Responsive design (mobile, tablet, desktop)
- Gradient backgrounds and smooth animations
- Interactive form elements
- Real-time calculation results

---

## Technology Stack

- **Framework:** Next.js 14 (React 18)
- **Language:** TypeScript
- **Styling:** CSS Modules
- **Build:** Static Site Generation (SSG)
- **Hosting:** AWS Amplify

---

## Local Development

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
```

This creates an optimized static export in the `out/` directory.

---

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx              # Main page component
│   ├── page.module.css       # Page-specific styles
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── public/                   # Static assets (if any)
├── package.json              # Dependencies
├── next.config.js            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
└── amplify.yml               # AWS Amplify build configuration
```

---

## Key Components

### Main Page (`app/page.tsx`)

**Sections:**
1. **Header:** Project title and tagline
2. **Hero:** Problem vs Solution comparison
3. **Demo:** Interactive Solar Azimuth calculator
4. **Features:** 6 key features with descriptions
5. **Architecture:** AWS services overview
6. **Impact:** Statistics and metrics
7. **Footer:** Links and credits

**State Management:**
- `claimData`: Stores GPS coordinates and timestamp
- `result`: Stores calculation results
- `loading`: Tracks calculation state

**API Integration:**
- Calls Solar Azimuth Lambda via API Gateway (when configured)
- Falls back to demo mode with sample calculations

---

## Configuration

### Next.js Config (`next.config.js`)

```javascript
const nextConfig = {
  output: 'export',        // Static site generation
  images: {
    unoptimized: true,     // Required for static export
  },
  trailingSlash: true,     // Adds trailing slash to URLs
}
```

### Amplify Build Config (`amplify.yml`)

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: out
    files:
      - '**/*'
```

---

## Connecting to Backend

### Current State: Demo Mode

The frontend currently runs in demo mode with sample calculations. To connect to the real Lambda function:

### Step 1: Create API Gateway

1. Go to AWS Console → API Gateway
2. Create REST API
3. Create resource: `/solar-azimuth`
4. Create POST method
5. Integrate with Lambda: `vericrop-solar-azimuth-validator`
6. Deploy API
7. Copy the Invoke URL

### Step 2: Update Frontend

Edit `app/page.tsx`:

```typescript
const calculateSolarAzimuth = async () => {
  setLoading(true)
  try {
    const response = await fetch(
      'https://YOUR_API_GATEWAY_ID.execute-api.ap-south-1.amazonaws.com/prod/solar-azimuth',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimId: `demo-${Date.now()}`,
          latitude: parseFloat(claimData.latitude),
          longitude: parseFloat(claimData.longitude),
          timestamp: new Date(claimData.timestamp).toISOString(),
        }),
      }
    )
    const data = await response.json()
    setResult(data)
  } catch (error) {
    console.error('Error:', error)
  }
  setLoading(false)
}
```

### Step 3: Enable CORS

Add CORS headers to Lambda response:

```typescript
return {
  statusCode: 200,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  },
  body: JSON.stringify(result),
}
```

---

## Deployment

### AWS Amplify (Recommended)

**Automatic deployment from GitHub:**

1. Connect GitHub repository to Amplify
2. Configure build settings (use `amplify.yml`)
3. Deploy automatically on every push to `main`

**Manual deployment:**

```bash
npm run build
# Upload contents of out/ folder to Amplify
```

### Alternative: S3 + CloudFront

```bash
npm run build
aws s3 sync out/ s3://your-bucket-name
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

---

## Styling

### CSS Modules

Each component has its own CSS module for scoped styling:

```typescript
import styles from './page.module.css'

<div className={styles.container}>
  <h1 className={styles.header}>Title</h1>
</div>
```

### Global Styles

Global styles in `app/globals.css`:
- CSS reset
- Font families
- Background gradients
- Base element styles

### Color Scheme

**Primary Colors:**
- Purple gradient: `#667eea` to `#764ba2`
- Success green: `#68d391`
- Error red: `#fc8181`

**Neutral Colors:**
- Dark text: `#2d3748`
- Medium text: `#4a5568`
- Light text: `#718096`
- Background: `#f8f9fa`

---

## Responsive Design

### Breakpoints

```css
@media (max-width: 768px) {
  /* Mobile styles */
}

@media (min-width: 769px) and (max-width: 1024px) {
  /* Tablet styles */
}

@media (min-width: 1025px) {
  /* Desktop styles */
}
```

### Grid Layouts

```css
.featureGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}
```

---

## Performance Optimization

### Static Site Generation
- All pages pre-rendered at build time
- No server-side rendering overhead
- Fast page loads

### Image Optimization
- Images unoptimized for static export
- Consider using next/image with custom loader for production

### Code Splitting
- Automatic code splitting by Next.js
- Only load necessary JavaScript

### Caching
- Static assets cached by CDN
- Long cache times for immutable assets

---

## Testing

### Manual Testing Checklist

- [ ] Calculator accepts valid GPS coordinates
- [ ] Calculator accepts valid timestamps
- [ ] Calculation button triggers API call
- [ ] Results display correctly
- [ ] All sections render properly
- [ ] Links work correctly
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop

### Browser Compatibility

Tested on:
- Chrome 120+
- Firefox 120+
- Safari 17+
- Edge 120+

---

## Future Enhancements

### Phase 1 (Current)
- ✅ Solar Azimuth calculator demo
- ✅ Feature showcase
- ✅ Static site deployment

### Phase 2 (Next)
- [ ] Connect to real Lambda via API Gateway
- [ ] Add video upload for shadow analysis
- [ ] Show fraud detection results
- [ ] Add claim submission form

### Phase 3 (Future)
- [ ] User authentication (Cognito)
- [ ] Claim history dashboard
- [ ] Real-time status updates
- [ ] Voice interface integration

---

## Troubleshooting

### Build Errors

**Error:** `Module not found`
```bash
# Solution: Install dependencies
npm ci
```

**Error:** `Type error in page.tsx`
```bash
# Solution: Check TypeScript types
npm run build
```

### Runtime Errors

**Error:** API call fails
```
# Check:
1. API Gateway URL is correct
2. CORS is enabled on Lambda
3. Lambda is deployed and active
```

**Error:** Styles not loading
```
# Check:
1. CSS module imports are correct
2. Class names match CSS file
3. Build completed successfully
```

---

## Contributing

### Code Style

- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Keep components small and focused

### Commit Messages

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
```

---

## Support

**Documentation:**
- Main README: `../README.md`
- Deployment Guide: `../AMPLIFY_CODEPIPELINE_SETUP.md`
- Technical Roadmap: `../TECHNICAL_ROADMAP.md`

**Issues:**
- Check build logs in Amplify Console
- Check browser console for errors
- Review Next.js documentation

---

## License

This project is developed for the AI for Bharat Hackathon 2026.

---

**Built with ❤️ for Indian Farmers**
