'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import styles from './claim.module.css'

export default function ClaimSubmission() {
  const [formData, setFormData] = useState({
    farmerId: '',
    farmerName: '',
    latitude: '',
    longitude: '',
    damageType: 'drought',
    estimatedDamage: '',
    description: '',
  })
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string>('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [locationStatus, setLocationStatus] = useState<'idle' | 'detecting' | 'success' | 'error'>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-detect location on mount
  useEffect(() => {
    detectLocation()
  }, [])

  const detectLocation = () => {
    setLocationStatus('detecting')
    
    if (!navigator.geolocation) {
      setLocationStatus('error')
      setFormData(prev => ({ ...prev, latitude: '19.0760', longitude: '72.8777' }))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(4),
          longitude: position.coords.longitude.toFixed(4)
        }))
        setLocationStatus('success')
      },
      (error) => {
        setLocationStatus('error')
        setFormData(prev => ({ ...prev, latitude: '19.0760', longitude: '72.8777' }))
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleVideoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVideoFile(file)
      const url = URL.createObjectURL(file)
      setVideoPreview(url)
    }
  }

  const triggerCamera = () => {
    fileInputRef.current?.click()
  }

  const submitClaim = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        'https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod/claims',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
            estimatedDamage: parseFloat(formData.estimatedDamage),
            timestamp: new Date().toISOString(),
          }),
        }
      )
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Error:', error)
      setResult({ error: 'Failed to submit claim. Please try again.' })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="bg-white border-b-2 border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🌾</span>
              <span className="text-xl font-bold text-emerald-900">VeriCrop FinBridge</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-slate-700 hover:text-emerald-900 font-medium transition-colors">
                Home
              </Link>
              <Link href="/claim-submission" className="text-emerald-900 font-semibold border-b-2 border-emerald-600 pb-1">
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
      <section className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">🌾 Submit Crop Damage Claim</h1>
          <p className="text-xl text-emerald-100">60-second validation with instant Loss Certificate</p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-4 border-emerald-600 rounded-3xl p-8 shadow-2xl">
            <div className="space-y-6">
              {/* Farmer Info Row */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-bold text-slate-900 mb-3">Farmer ID</label>
                  <input
                    type="text"
                    value={formData.farmerId}
                    onChange={(e) => setFormData({ ...formData, farmerId: e.target.value })}
                    placeholder="F12345"
                    className="w-full px-6 py-4 text-xl border-3 border-slate-300 rounded-xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-200 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-lg font-bold text-slate-900 mb-3">Farmer Name</label>
                  <input
                    type="text"
                    value={formData.farmerName}
                    onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
                    placeholder="Enter name"
                    className="w-full px-6 py-4 text-xl border-3 border-slate-300 rounded-xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-200 outline-none transition-all"
                  />
                </div>
              </div>

              {/* GPS Coordinates Row */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-bold text-slate-900 mb-3">
                    Latitude (GPS) {locationStatus === 'success' && <span className="text-emerald-600">✓ Auto-detected</span>}
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    readOnly={locationStatus === 'detecting'}
                    className="w-full px-6 py-4 text-xl border-3 border-slate-300 rounded-xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-200 outline-none transition-all"
                    placeholder="Will be auto-detected"
                  />
                  {locationStatus === 'detecting' && (
                    <p className="mt-2 text-sm text-blue-600 flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Detecting your location...
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-lg font-bold text-slate-900 mb-3">
                    Longitude (GPS) {locationStatus === 'success' && <span className="text-emerald-600">✓ Auto-detected</span>}
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    readOnly={locationStatus === 'detecting'}
                    className="w-full px-6 py-4 text-xl border-3 border-slate-300 rounded-xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-200 outline-none transition-all"
                    placeholder="Will be auto-detected"
                  />
                </div>
              </div>

              {/* GPS Auto-Detection Button */}
              <div className="bg-blue-50 border-2 border-blue-500 rounded-xl p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-blue-900 mb-2">📍 Automatic Location Detection</h3>
                  <p className="text-blue-800">No need to enter coordinates manually - we'll detect your location automatically!</p>
                </div>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={locationStatus === 'detecting'}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xl font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {locationStatus === 'detecting' ? (
                    <>
                      <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Detecting Location...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">📍</span>
                      <span>Detect My Location (GPS)</span>
                    </>
                  )}
                </button>
                {locationStatus === 'success' && (
                  <p className="mt-3 text-emerald-700 font-semibold flex items-center gap-2">
                    <span className="text-xl">✅</span>
                    Location detected successfully!
                  </p>
                )}
                {locationStatus === 'error' && (
                  <p className="mt-3 text-amber-700 font-semibold flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    Using default location (Mumbai). Enable GPS for accurate detection.
                  </p>
                )}
              </div>

              {/* Damage Info Row */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-bold text-slate-900 mb-3">Damage Type</label>
                  <select
                    value={formData.damageType}
                    onChange={(e) => setFormData({ ...formData, damageType: e.target.value })}
                    className="w-full px-6 py-4 text-xl border-3 border-slate-300 rounded-xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-200 outline-none transition-all"
                  >
                    <option value="drought">Drought</option>
                    <option value="flood">Flood</option>
                    <option value="hailstorm">Hailstorm</option>
                    <option value="pest">Pest Infestation</option>
                    <option value="disease">Disease</option>
                  </select>
                </div>
                <div>
                  <label className="block text-lg font-bold text-slate-900 mb-3">Estimated Damage (₹)</label>
                  <input
                    type="number"
                    value={formData.estimatedDamage}
                    onChange={(e) => setFormData({ ...formData, estimatedDamage: e.target.value })}
                    placeholder="50000"
                    className="w-full px-6 py-4 text-xl border-3 border-slate-300 rounded-xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-200 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-lg font-bold text-slate-900 mb-3">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the damage..."
                  rows={4}
                  className="w-full px-6 py-4 text-xl border-3 border-slate-300 rounded-xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-200 outline-none transition-all"
                />
              </div>

              {/* Video/Photo Upload - CRITICAL FOR FARMERS */}
              <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-6">
                <label className="block text-xl font-bold text-emerald-900 mb-3 flex items-center gap-2">
                  📹 Record Field Video or Take Photos
                  <span className="text-red-600 text-sm">*Required for fraud detection</span>
                </label>
                
                {/* Hidden file input with camera access */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*,image/*"
                  capture="environment"
                  onChange={handleVideoCapture}
                  style={{ display: 'none' }}
                />
                
                {/* Camera Button */}
                <button
                  type="button"
                  onClick={triggerCamera}
                  className="w-full py-8 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl shadow-lg transition-all transform hover:scale-[1.02] border-2 border-dashed border-white/50"
                >
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-5xl">📸</span>
                    <div className="text-2xl font-bold">Open Camera</div>
                    <div className="text-lg opacity-90">Record video or take photo of damaged field</div>
                  </div>
                </button>

                {/* Video Preview */}
                {videoPreview && (
                  <div className="mt-6 p-4 bg-white rounded-xl border-2 border-emerald-600">
                    <p className="text-emerald-700 font-semibold mb-3 flex items-center gap-2">
                      <span className="text-xl">✅</span>
                      Media captured successfully!
                    </p>
                    <video
                      src={videoPreview}
                      controls
                      className="w-full max-h-96 rounded-lg mb-3"
                    />
                    <p className="text-slate-600 mb-3">
                      📁 {videoFile?.name} ({(videoFile?.size! / 1024 / 1024).toFixed(2)} MB)
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setVideoFile(null)
                        setVideoPreview('')
                      }}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
                    >
                      🗑️ Remove and retake
                    </button>
                  </div>
                )}

                {/* Upload Progress */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-4 h-8 bg-slate-200 rounded-full overflow-hidden relative">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-600 to-emerald-700 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-slate-900 font-bold">
                      {uploadProgress}% uploaded
                    </span>
                  </div>
                )}

                <p className="mt-4 text-sm text-slate-600 italic">
                  💡 <strong>Tip:</strong> Record a 10-30 second video showing the damaged crops. 
                  The video will be analyzed for shadow direction, GPS coordinates, and damage type.
                </p>
              </div>

              {/* Submit Button */}
              <button
                onClick={submitClaim}
                disabled={loading || !formData.farmerId || !formData.estimatedDamage || !videoFile}
                className="w-full py-6 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-2xl font-bold rounded-xl shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Processing via AWS Step Functions...</span>
                  </span>
                ) : (
                  '🚀 Submit Claim'
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {result && (
        <section className="py-12 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`p-8 rounded-2xl border-4 ${
              result.error 
                ? 'bg-red-50 border-red-600' 
                : 'bg-emerald-50 border-emerald-600'
            }`}>
              <h3 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span className="text-4xl">{result.error ? '❌' : '✅'}</span>
                {result.error ? 'Error' : 'Claim Submitted Successfully'}
              </h3>
              {result.error ? (
                <p className="text-xl text-red-900">{result.error}</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-md">
                    <p className="text-sm font-semibold text-slate-600 mb-2">Claim ID</p>
                    <p className="text-2xl font-bold text-emerald-900">{result.claimId}</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-md">
                    <p className="text-sm font-semibold text-slate-600 mb-2">Status</p>
                    <p className="text-2xl font-bold text-blue-900">{result.status}</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-md">
                    <p className="text-sm font-semibold text-slate-600 mb-2">Validation Score</p>
                    <p className="text-2xl font-bold text-slate-900">{result.validationScore}%</p>
                  </div>
                  {result.certificateId && (
                    <div className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-md">
                      <p className="text-sm font-semibold text-slate-600 mb-2">Certificate ID</p>
                      <p className="text-2xl font-bold text-slate-900">{result.certificateId}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

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
          </div>
        </div>
      </footer>
    </div>
  )
}
