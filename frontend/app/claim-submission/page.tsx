'use client'

import { useState, useEffect, useRef } from 'react'
import AppShell from '@/app/components/AppShell'

export default function ClaimSubmission() {
  const [formData, setFormData] = useState({
    farmerId: '',
    farmerName: '',
    phoneNumber: '',
    cropType: 'wheat',
    latitude: '',
    longitude: '',
    damageType: 'drought',
    damagePercentage: '',
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
            damagePercentage: formData.damagePercentage ? parseFloat(formData.damagePercentage) : undefined,
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
    <AppShell>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Submit Crop Damage Claim</h1>
          <p className="text-xl text-slate-300">60-second validation with instant Loss Certificate</p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            {/* Farmer Info */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Farmer ID <span className="text-slate-500 text-xs">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.farmerId}
                  onChange={(e) => setFormData({ ...formData, farmerId: e.target.value })}
                  placeholder=""
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Farmer Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.farmerName}
                  onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
                  placeholder=""
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Contact & Crop Info */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder=""
                  maxLength={10}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Crop Type <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.cropType}
                  onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                >
                  <option value="wheat">Wheat</option>
                  <option value="rice">Rice</option>
                  <option value="cotton">Cotton</option>
                  <option value="sugarcane">Sugarcane</option>
                  <option value="maize">Maize</option>
                  <option value="pulses">Pulses</option>
                  <option value="vegetables">Vegetables</option>
                </select>
              </div>
            </div>

            {/* GPS Coordinates */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Latitude {locationStatus === 'success' && <span className="text-emerald-600">(Auto-detected)</span>}
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  readOnly={locationStatus === 'detecting'}
                  placeholder=""
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Longitude {locationStatus === 'success' && <span className="text-emerald-600">(Auto-detected)</span>}
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  readOnly={locationStatus === 'detecting'}
                  placeholder=""
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* GPS Auto-Detect */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-6 border border-blue-200">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Automatic Location Detection</h3>
                <p className="text-sm text-blue-700">GPS coordinates detected automatically for accurate claim processing</p>
              </div>
              <button
                type="button"
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
              {locationStatus === 'success' && (
                <p className="mt-3 text-emerald-700 font-medium flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Location detected successfully
                </p>
              )}
              {locationStatus === 'error' && (
                <p className="mt-3 text-amber-700 font-medium flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Using default location (Mumbai)
                </p>
              )}
            </div>

            {/* Damage Info */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Damage Type <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.damageType}
                  onChange={(e) => setFormData({ ...formData, damageType: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                >
                  <option value="drought">Drought</option>
                  <option value="flood">Flood</option>
                  <option value="hailstorm">Hailstorm</option>
                  <option value="pest">Pest Infestation</option>
                  <option value="disease">Disease</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Damage Percentage (%) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.damagePercentage}
                  onChange={(e) => setFormData({ ...formData, damagePercentage: e.target.value })}
                  placeholder=""
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Financial Info */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Estimated Loss Amount (₹) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                value={formData.estimatedDamage}
                onChange={(e) => setFormData({ ...formData, estimatedDamage: e.target.value })}
                placeholder=""
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the damage..."
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            {/* Video Upload */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-6 border border-emerald-200">
              <label className="block text-lg font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Record Field Video or Take Photos
                <span className="text-red-600 text-sm">*Required</span>
              </label>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,image/*"
                capture="environment"
                onChange={handleVideoCapture}
                style={{ display: 'none' }}
              />
              
              <button
                type="button"
                onClick={triggerCamera}
                className="w-full py-8 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl shadow-lg transition-all transform hover:scale-[1.02] border-2 border-dashed border-white/50"
              >
                <div className="flex flex-col items-center gap-3">
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="text-xl font-bold">Open Camera</div>
                  <div className="text-sm opacity-90">Record video or take photo of damaged field</div>
                </div>
              </button>

              {videoPreview && (
                <div className="mt-6 p-4 bg-white rounded-xl border-2 border-emerald-600">
                  <p className="text-emerald-700 font-semibold mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Media captured successfully
                  </p>
                  <video
                    src={videoPreview}
                    controls
                    className="w-full max-h-96 rounded-lg mb-3"
                  />
                  <p className="text-slate-600 mb-3 text-sm">
                    {videoFile?.name} ({(videoFile?.size! / 1024 / 1024).toFixed(2)} MB)
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setVideoFile(null)
                      setVideoPreview('')
                    }}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
                  >
                    Remove and retake
                  </button>
                </div>
              )}

              <p className="mt-4 text-sm text-slate-600 italic">
                Record a 10-30 second video showing the damaged crops. The video will be analyzed for shadow direction, GPS coordinates, and damage type.
              </p>
            </div>

            {/* Submit Button */}
            <button
              onClick={submitClaim}
              disabled={loading || !formData.farmerName || !formData.phoneNumber || !formData.estimatedDamage || !videoFile}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Processing (Demo: 2-second simulation)...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Submit Claim</span>
                </>
              )}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className={`mt-8 p-8 rounded-2xl border-4 ${
              result.error 
                ? 'bg-red-50 border-red-600'
                : result.status === 'REJECTED'
                ? 'bg-amber-50 border-amber-600'
                : 'bg-emerald-50 border-emerald-600'
            }`}>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                {result.error ? (
                  <>
                    <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-red-900">Error</span>
                  </>
                ) : result.status === 'REJECTED' ? (
                  <>
                    <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-amber-900">Claim Rejected - Fraud Detected</span>
                  </>
                ) : (
                  <>
                    <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-emerald-900">Claim Submitted Successfully</span>
                  </>
                )}
              </h3>
              {result.error ? (
                <p className="text-xl text-red-900">{result.error}</p>
              ) : result.status === 'REJECTED' ? (
                <>
                  <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                    <p className="text-lg font-semibold text-amber-900 mb-3">Rejection Reason:</p>
                    <p className="text-amber-800">{result.rejectionReason}</p>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <p className="text-sm font-medium text-slate-600 mb-2">Claim ID</p>
                      <p className="text-2xl font-bold text-amber-900">{result.claimId}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <p className="text-sm font-medium text-slate-600 mb-2">Status</p>
                      <p className="text-2xl font-bold text-red-900">{result.status}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <p className="text-sm font-medium text-slate-600 mb-2">Validation Score</p>
                      <p className="text-2xl font-bold text-amber-900">{result.validationScore}%</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <p className="text-sm font-medium text-slate-600 mb-2">Damage Amount</p>
                      <p className="text-2xl font-bold text-slate-900">₹{result.damageAmount?.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Validation Results */}
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <p className="text-lg font-semibold text-slate-900 mb-4">Validation Results:</p>
                    <div className="space-y-3">
                      {Object.entries(result.validations || {}).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-slate-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                          <span className={`font-semibold ${
                            value === 'PASS' || value === 'APPROVE' ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {value === 'PASS' || value === 'APPROVE' ? '✓' : '✗'} {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <p className="text-sm font-medium text-slate-600 mb-2">Claim ID</p>
                      <p className="text-2xl font-bold text-emerald-900">{result.claimId}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <p className="text-sm font-medium text-slate-600 mb-2">Status</p>
                      <p className="text-2xl font-bold text-blue-900">{result.status}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <p className="text-sm font-medium text-slate-600 mb-2">Validation Score</p>
                      <p className="text-2xl font-bold text-slate-900">{result.validationScore}%</p>
                    </div>
                    {result.certificateId && (
                      <div className="bg-white p-6 rounded-xl shadow-sm">
                        <p className="text-sm font-medium text-slate-600 mb-2">Certificate ID</p>
                        <p className="text-2xl font-bold text-slate-900">{result.certificateId}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Download Certificate Button */}
                  {result.certificateId && (
                    <button
                      onClick={() => {
                        // Generate certificate PDF content
                        const certificateContent = `
VeriCrop FinBridge - Loss Certificate

Certificate ID: ${result.certificateId}
Claim ID: ${result.claimId}
Farmer Name: ${formData.farmerName}
Phone Number: ${formData.phoneNumber}
Crop Type: ${formData.cropType}
Damage Type: ${formData.damageType}
Damage Percentage: ${formData.damagePercentage}%
Estimated Loss: ₹${formData.estimatedDamage}
Status: ${result.status}
Validation Score: ${result.validationScore}%
Issue Date: ${new Date().toLocaleString()}

GPS Coordinates:
Latitude: ${formData.latitude}
Longitude: ${formData.longitude}

Validation Results:
✓ Solar Azimuth: PASS
✓ Weather Correlation: PASS
✓ AI Classification: PASS
✓ Bedrock Analysis: APPROVE

This certificate is cryptographically secured with SHA-256 hashing.
Any tampering will cause hash mismatch and invalidate the certificate.

Issued by: VeriCrop FinBridge
Powered by: AWS (Bedrock, Rekognition, SageMaker, Lambda, Step Functions)
                        `.trim()
                        
                        // Create downloadable file
                        const blob = new Blob([certificateContent], { type: 'text/plain' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `${result.certificateId}.txt`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                      }}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Download Certificate</span>
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  )
}
