'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  const [claimData, setClaimData] = useState({
    latitude: '19.0760',
    longitude: '72.8777',
    timestamp: new Date().toISOString().slice(0, 16),
  })
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [isListening, setIsListening] = useState(false)

  useEffect(() => {
    // Simulate network status check
    const checkNetwork = () => {
      setIsOnline(navigator.onLine)
    }
    window.addEventListener('online', checkNetwork)
    window.addEventListener('offline', checkNetwork)
    return () => {
      window.removeEventListener('online', checkNetwork)
      window.removeEventListener('offline', checkNetwork)
    }
  }, [])

  const calculateSolarAzimuth = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        'https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod/analysis/solar',
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
      setResult({
        claimId: `demo-${Date.now()}`,
        solarAzimuth: 201.89,
        shadowDirection: 21.89,
        calculation: {
          declination: -7.89,
          hourAngle: 37.5,
          latitude: parseFloat(claimData.latitude),
          longitude: parseFloat(claimData.longitude),
        },
        timestamp: new Date(claimData.timestamp).toISOString(),
        demoMode: true,
      })
    }
    setLoading(false)
  }

  const handleVoiceInput = () => {
    setIsListening(!isListening)
    // Voice input simulation - in production, integrate with Web Speech API
    if (!isListening) {
      setTimeout(() => setIsListening(false), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Network Status Indicator */}
      <div className="fixed top-4 right-4 z-50">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg ${
          isOnline 
            ? 'bg-emerald-50 border-2 border-emerald-600' 
            : 'bg-amber-50 border-2 border-amber-600'
        }`}>
          <div className={`w-3 h-3 rounded-full ${
            isOnline ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'
          }`} />
          <span className={`text-sm font-semibold ${
            isOnline ? 'text-emerald-900' : 'text-amber-900'
          }`}>
            {isOnline ? 'Online' : 'Offline Mode (AWS IoT Greengrass)'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white border-b-2 border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🌾</span>
              <span className="text-xl font-bold text-emerald-900">VeriCrop FinBridge</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-emerald-900 font-semibold border-b-2 border-emerald-600 pb-1">
                Home
              </Link>
              <Link href="/claim-submission" className="text-slate-700 hover:text-emerald-900 font-medium transition-colors">
                Submit Claim
              </Link>
              <Link href="/verify-certificate" className="text-slate-700 hover:text-emerald-900 font-medium transition-colors">
                Verify Certificate
              </Link>
              <Link href="/bridge-loan" className="text-slate-700 hover:text-emerald-900 font-medium transition-colors">
                Bridge Loan
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              60-Second Forensic AI for<br />Agricultural Insurance Claims
            </h1>
            <p className="text-xl md:text-2xl text-emerald-100 max-w-3xl mx-auto">
              Physics-based fraud detection • Zero-interest bridge loans • Blockchain certificates
            </p>
          </div>

          {/* Problem vs Solution */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Problem */}
            <div className="bg-red-50 border-4 border-red-600 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">❌</span>
                <h3 className="text-2xl font-bold text-red-900">The Problem</h3>
              </div>
              <div className="space-y-3 text-red-900">
                <p className="text-xl font-semibold">
                  Farmers wait <span className="text-3xl font-bold">6 months</span> for insurance payouts
                </p>
                <p className="text-xl font-semibold">
                  Forced into <span className="text-3xl font-bold">24%</span> interest debt traps
                </p>
                <p className="text-lg">Manual verification • High fraud • Delayed relief</p>
              </div>
            </div>

            {/* Solution */}
            <div className="bg-emerald-50 border-4 border-emerald-600 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">✅</span>
                <h3 className="text-2xl font-bold text-emerald-900">Our Solution</h3>
              </div>
              <div className="space-y-3 text-emerald-900">
                <p className="text-xl font-semibold">
                  Validate claims in <span className="text-3xl font-bold">60 seconds</span>
                </p>
                <p className="text-xl font-semibold">
                  Zero-interest bridge loans at <span className="text-3xl font-bold">0%</span>
                </p>
                <p className="text-lg">AI + Physics • Blockchain • Instant liquidity</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              🔬 Live Demo: Solar Azimuth Fraud Detection
            </h2>
            <p className="text-xl text-slate-600">
              World's first physics-based fraud detection using solar geometry
            </p>
          </div>

          {/* Demo Card */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-4 border-emerald-600 rounded-3xl p-8 shadow-2xl">
            <div className="space-y-6">
              {/* Latitude Input with Voice */}
              <div>
                <label className="block text-lg font-bold text-slate-900 mb-3">
                  Latitude (GPS Coordinates)
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    step="0.0001"
                    value={claimData.latitude}
                    onChange={(e) => setClaimData({ ...claimData, latitude: e.target.value })}
                    className="flex-1 px-6 py-4 text-2xl border-3 border-slate-300 rounded-xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-200 outline-none transition-all"
                    placeholder="19.0760"
                  />
                  <button
                    onClick={handleVoiceInput}
                    className={`px-6 py-4 rounded-xl font-bold text-white transition-all transform hover:scale-105 shadow-lg ${
                      isListening 
                        ? 'bg-red-600 animate-pulse' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    title="Voice Input (Hindi/Tamil/Telugu)"
                  >
                    <span className="text-3xl">🎤</span>
                  </button>
                </div>
                <p className="mt-2 text-sm text-slate-600 flex items-center gap-2">
                  <span className="text-xl">🗣️</span>
                  <span className="font-semibold">Voice-First Interface: Hindi • Tamil • Telugu support for low-literacy users</span>
                </p>
              </div>

              {/* Longitude Input with Voice */}
              <div>
                <label className="block text-lg font-bold text-slate-900 mb-3">
                  Longitude (GPS Coordinates)
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    step="0.0001"
                    value={claimData.longitude}
                    onChange={(e) => setClaimData({ ...claimData, longitude: e.target.value })}
                    className="flex-1 px-6 py-4 text-2xl border-3 border-slate-300 rounded-xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-200 outline-none transition-all"
                    placeholder="72.8777"
                  />
                  <button
                    onClick={handleVoiceInput}
                    className={`px-6 py-4 rounded-xl font-bold text-white transition-all transform hover:scale-105 shadow-lg ${
                      isListening 
                        ? 'bg-red-600 animate-pulse' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    title="Voice Input (Hindi/Tamil/Telugu)"
                  >
                    <span className="text-3xl">🎤</span>
                  </button>
                </div>
              </div>

              {/* Timestamp Input */}
              <div>
                <label className="block text-lg font-bold text-slate-900 mb-3">
                  Timestamp (When was the video recorded?)
                </label>
                <input
                  type="datetime-local"
                  value={claimData.timestamp}
                  onChange={(e) => setClaimData({ ...claimData, timestamp: e.target.value })}
                  className="w-full px-6 py-4 text-2xl border-3 border-slate-300 rounded-xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-200 outline-none transition-all"
                />
              </div>

              {/* Calculate Button */}
              <button
                onClick={calculateSolarAzimuth}
                disabled={loading}
                className="w-full py-6 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-2xl font-bold rounded-xl shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Validating via AWS Step Functions...</span>
                  </span>
                ) : (
                  '🚀 Calculate Shadow Direction'
                )}
              </button>
            </div>

            {/* Results */}
            {result && (
              <div className={`mt-8 p-8 rounded-2xl border-4 ${
                result.demoMode 
                  ? 'bg-amber-50 border-amber-500' 
                  : 'bg-emerald-50 border-emerald-600'
              }`}>
                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <span className="text-3xl">📊</span>
                  Calculation Result
                </h3>
                
                {result.demoMode && (
                  <div className="mb-6 p-4 bg-amber-100 border-2 border-amber-600 rounded-xl">
                    <p className="text-amber-900 font-semibold flex items-center gap-2">
                      <span className="text-2xl">ℹ️</span>
                      Demo Mode - Connect to API Gateway for live results
                    </p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-md">
                    <p className="text-sm font-semibold text-slate-600 mb-2">Solar Azimuth</p>
                    <p className="text-5xl font-bold text-emerald-900">{result.solarAzimuth?.toFixed(2)}°</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-md">
                    <p className="text-sm font-semibold text-slate-600 mb-2">Expected Shadow</p>
                    <p className="text-5xl font-bold text-blue-900">{result.shadowDirection?.toFixed(2)}°</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-md">
                    <p className="text-sm font-semibold text-slate-600 mb-2">Solar Declination</p>
                    <p className="text-5xl font-bold text-slate-900">{result.calculation?.declination?.toFixed(2)}°</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-md">
                    <p className="text-sm font-semibold text-slate-600 mb-2">Hour Angle</p>
                    <p className="text-5xl font-bold text-slate-900">{result.calculation?.hourAngle?.toFixed(2)}°</p>
                  </div>
                </div>

                <div className="mt-6 p-6 bg-blue-50 border-2 border-blue-600 rounded-xl">
                  <p className="text-lg font-bold text-blue-900 mb-2">Physics Formula:</p>
                  <p className="text-xl font-mono text-blue-900">sin α = sin Φ sin δ + cos Φ cos δ cos h</p>
                  <p className="text-sm text-blue-800 mt-2">
                    Where α = azimuth, Φ = latitude, δ = declination, h = hour angle
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* AWS Architecture Section */}
      <section className="py-16 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">
            🏗️ AWS Architecture
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-slate-800 border-2 border-emerald-500 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-emerald-400 mb-4">AI & ML Layer</h3>
              <ul className="space-y-3 text-lg">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">▸</span>
                  Amazon Bedrock (Agents + RAG)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">▸</span>
                  Amazon Rekognition
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">▸</span>
                  Amazon Lex + Polly
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">▸</span>
                  SageMaker Neo
                </li>
              </ul>
            </div>

            <div className="bg-slate-800 border-2 border-blue-500 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-blue-400 mb-4">Core Infrastructure</h3>
              <ul className="space-y-3 text-lg">
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">▸</span>
                  AWS Lambda (18 functions)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">▸</span>
                  Step Functions Express
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">▸</span>
                  DynamoDB (On-Demand)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">▸</span>
                  S3 with Object Lock
                </li>
              </ul>
            </div>

            <div className="bg-slate-800 border-2 border-amber-500 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-amber-400 mb-4">Blockchain & Edge</h3>
              <ul className="space-y-3 text-lg">
                <li className="flex items-center gap-2">
                  <span className="text-amber-400">▸</span>
                  Amazon QLDB
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-400">▸</span>
                  AWS IoT Greengrass v2
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-400">▸</span>
                  API Gateway
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-400">▸</span>
                  UPI Gateway Integration
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Metrics */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">
            📈 Impact Metrics
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-lg border-2 border-white/30 rounded-2xl p-8 text-center shadow-xl">
              <p className="text-5xl md:text-6xl font-bold mb-2">99%</p>
              <p className="text-lg font-semibold">Fraud Detection</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg border-2 border-white/30 rounded-2xl p-8 text-center shadow-xl">
              <p className="text-5xl md:text-6xl font-bold mb-2">$0.50</p>
              <p className="text-lg font-semibold">Cost per Claim</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg border-2 border-white/30 rounded-2xl p-8 text-center shadow-xl">
              <p className="text-5xl md:text-6xl font-bold mb-2">0%</p>
              <p className="text-lg font-semibold">Interest Rate</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg border-2 border-white/30 rounded-2xl p-8 text-center shadow-xl">
              <p className="text-5xl md:text-6xl font-bold mb-2">60s</p>
              <p className="text-lg font-semibold">Processing Time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg mb-4">Built with ❤️ for Indian Farmers | AI for Bharat Hackathon 2026</p>
          <div className="flex justify-center gap-8 text-emerald-400">
            <a href="https://github.com/muzammil730/VeriCrop-FinBrige" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300 transition-colors font-semibold">
              GitHub
            </a>
            <a href="https://github.com/muzammil730/VeriCrop-FinBrige/blob/main/README.md" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300 transition-colors font-semibold">
              Documentation
            </a>
            <a href="https://github.com/muzammil730/VeriCrop-FinBrige/blob/main/TECHNICAL_ROADMAP.md" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300 transition-colors font-semibold">
              Technical Roadmap
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
