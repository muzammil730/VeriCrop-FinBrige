'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/app/components/AppShell'

export default function Home() {
  const [claimData, setClaimData] = useState({
    latitude: '',
    longitude: '',
    timestamp: new Date().toISOString().slice(0, 16),
  })
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [locationStatus, setLocationStatus] = useState<'idle' | 'detecting' | 'success' | 'error'>('idle')
  const [locationError, setLocationError] = useState('')

  useEffect(() => {
    detectLocation()
  }, [])

  const detectLocation = () => {
    setLocationStatus('detecting')
    setLocationError('')
    
    if (!navigator.geolocation) {
      setLocationStatus('error')
      setLocationError('GPS not supported')
      setClaimData(prev => ({ ...prev, latitude: '19.0760', longitude: '72.8777' }))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setClaimData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(4),
          longitude: position.coords.longitude.toFixed(4)
        }))
        setLocationStatus('success')
      },
      (error) => {
        setLocationStatus('error')
        setLocationError('Location unavailable')
        setClaimData(prev => ({ ...prev, latitude: '19.0760', longitude: '72.8777' }))
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

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

  return (
    <AppShell>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-slide-up">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                60-Second Forensic AI for Agricultural Insurance
              </h1>
              <p className="text-xl text-slate-300">
                Physics-based fraud detection. Zero-interest bridge loans. Blockchain certificates.
              </p>

              {/* Comparison Cards */}
              <div className="grid sm:grid-cols-2 gap-4 mt-8">
                {/* Old Way */}
                <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl p-6 space-y-3">
                  <div className="flex items-center gap-2 text-red-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="font-semibold">Old Way</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">6</span>
                      <span className="text-slate-300">months wait</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">24%</span>
                      <span className="text-slate-300">interest debt</span>
                    </div>
                  </div>
                </div>

                {/* New Way */}
                <div className="bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-semibold">New Way</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">60</span>
                      <span className="text-slate-300">seconds</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">0%</span>
                      <span className="text-slate-300">interest</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Floating SVG */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
                <svg className="relative w-full h-auto animate-float" viewBox="0 0 400 400" fill="none">
                  <circle cx="200" cy="200" r="150" stroke="url(#gradient)" strokeWidth="2" strokeDasharray="4 4" opacity="0.3" />
                  <circle cx="200" cy="200" r="100" fill="url(#gradient)" opacity="0.1" />
                  <circle cx="200" cy="200" r="60" fill="url(#gradient)" opacity="0.2" />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solar Azimuth Engine */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              The Engine: Solar Azimuth Fraud Detection
            </h2>
            <p className="text-lg text-slate-600">
              World's first physics-based fraud detection using solar geometry
            </p>
          </div>

          {/* Glassmorphism Dashboard */}
          <div className="glass rounded-2xl shadow-xl p-8 space-y-6 animate-scale-in">
            {/* Location Status */}
            {locationStatus !== 'idle' && (
              <div className={`p-4 rounded-xl border ${
                locationStatus === 'detecting' 
                  ? 'bg-blue-50 border-blue-200' 
                  : locationStatus === 'success'
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-center gap-3">
                  {locationStatus === 'detecting' && (
                    <>
                      <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-blue-900 font-medium">Detecting your location...</span>
                    </>
                  )}
                  {locationStatus === 'success' && (
                    <>
                      <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-emerald-900 font-medium">Location detected successfully</span>
                    </>
                  )}
                  {locationStatus === 'error' && (
                    <>
                      <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="text-amber-900 font-medium">{locationError}</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* GPS Auto-Detect Button */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-6 border border-blue-200">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Automatic Location Detection</h3>
                <p className="text-sm text-blue-700">GPS coordinates detected automatically for accurate analysis</p>
              </div>
              <button
                onClick={detectLocation}
                disabled={locationStatus === 'detecting'}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {locationStatus === 'detecting' ? 'Detecting Location...' : 'Detect My Location'}
              </button>
            </div>

            {/* Input Fields */}
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Latitude */}
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Latitude {locationStatus === 'success' && <span className="text-emerald-600">(Auto-detected)</span>}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.0001"
                    value={claimData.latitude}
                    onChange={(e) => setClaimData({ ...claimData, latitude: e.target.value })}
                    readOnly={locationStatus === 'detecting'}
                    className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="19.0760"
                  />
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
              </div>

              {/* Longitude */}
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Longitude {locationStatus === 'success' && <span className="text-emerald-600">(Auto-detected)</span>}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.0001"
                    value={claimData.longitude}
                    onChange={(e) => setClaimData({ ...claimData, longitude: e.target.value })}
                    readOnly={locationStatus === 'detecting'}
                    className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="72.8777"
                  />
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Timestamp */}
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Timestamp
              </label>
              <input
                type="datetime-local"
                value={claimData.timestamp}
                onChange={(e) => setClaimData({ ...claimData, timestamp: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            {/* Calculate Button */}
            <button
              onClick={calculateSolarAzimuth}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Calculating...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Calculate Shadow Direction</span>
                </>
              )}
            </button>

            {/* Results */}
            {result && (
              <div className="mt-6 p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200 animate-scale-in">
                <h3 className="text-lg font-semibold text-emerald-900 mb-4">Calculation Result</h3>
                
                {result.demoMode && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-900 font-medium">Demo Mode - Connect to API for live results</p>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs font-medium text-slate-600 mb-1">Solar Azimuth</p>
                    <p className="text-3xl font-bold text-emerald-900">{result.solarAzimuth?.toFixed(2)}°</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs font-medium text-slate-600 mb-1">Shadow Direction</p>
                    <p className="text-3xl font-bold text-blue-900">{result.shadowDirection?.toFixed(2)}°</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs font-medium text-slate-600 mb-1">Declination</p>
                    <p className="text-3xl font-bold text-slate-900">{result.calculation?.declination?.toFixed(2)}°</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs font-medium text-slate-600 mb-1">Hour Angle</p>
                    <p className="text-3xl font-bold text-slate-900">{result.calculation?.hourAngle?.toFixed(2)}°</p>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 mb-1">Physics Formula:</p>
                  <p className="text-sm font-mono text-blue-900">sin α = sin Φ sin δ + cos Φ cos δ cos h</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Impact Metrics */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Impact Metrics</h2>
            <p className="text-lg text-slate-300">Transforming agricultural insurance at scale</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: '99%', label: 'Fraud Detection' },
              { value: '$0.50', label: 'Cost per Claim' },
              { value: '0%', label: 'Interest Rate' },
              { value: '60s', label: 'Processing Time' },
            ].map((metric, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <p className="text-4xl font-bold text-emerald-400 mb-2">{metric.value}</p>
                <p className="text-sm text-slate-300">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AWS Architecture */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">AWS Architecture</h2>
            <p className="text-lg text-slate-600">Enterprise-grade serverless infrastructure</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'AI & ML Layer',
                services: ['Amazon Bedrock', 'Amazon Rekognition', 'Amazon Lex + Polly', 'SageMaker Neo'],
              },
              {
                title: 'Core Infrastructure',
                services: ['AWS Lambda (18 functions)', 'Step Functions Express', 'DynamoDB (On-Demand)', 'S3 with Object Lock'],
              },
              {
                title: 'Blockchain & Edge',
                services: ['Amazon QLDB', 'AWS IoT Greengrass v2', 'API Gateway', 'UPI Gateway Integration'],
              },
            ].map((layer, index) => (
              <div
                key={index}
                className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-4">{layer.title}</h3>
                <ul className="space-y-2">
                  {layer.services.map((service, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                      <svg className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{service}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  )
}
