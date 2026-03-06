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
    <main className={styles.main}>
      <nav className={styles.nav}>
        <Link href="/">Home</Link>
        <Link href="/claim-submission" className={styles.active}>Submit Claim</Link>
        <Link href="/verify-certificate">Verify Certificate</Link>
        <Link href="/bridge-loan">Bridge Loan</Link>
      </nav>

      <div className={styles.container}>
        <h1>🌾 Submit Crop Damage Claim</h1>
        <p className={styles.subtitle}>60-second validation with instant Loss Certificate</p>

        <div className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Farmer ID</label>
              <input
                type="text"
                value={formData.farmerId}
                onChange={(e) => setFormData({ ...formData, farmerId: e.target.value })}
                placeholder="F12345"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Farmer Name</label>
              <input
                type="text"
                value={formData.farmerName}
                onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
                placeholder="Enter name"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Latitude (GPS) {locationStatus === 'success' && <span className={styles.successText}>✓ Auto-detected</span>}</label>
              <input
                type="number"
                step="0.0001"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                readOnly={locationStatus === 'detecting'}
              />
              {locationStatus === 'detecting' && (
                <p className={styles.helpText}>📍 Detecting your location...</p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Longitude (GPS) {locationStatus === 'success' && <span className={styles.successText}>✓ Auto-detected</span>}</label>
              <input
                type="number"
                step="0.0001"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                readOnly={locationStatus === 'detecting'}
              />
            </div>
          </div>

          {/* GPS Auto-Detection Button */}
          <div className={styles.formGroup}>
            <button
              type="button"
              onClick={detectLocation}
              disabled={locationStatus === 'detecting'}
              className={styles.gpsButton}
            >
              {locationStatus === 'detecting' ? '📍 Detecting Location...' : '📍 Detect My Location (GPS)'}
            </button>
            {locationStatus === 'success' && (
              <p className={styles.successText}>✅ Location detected successfully!</p>
            )}
            {locationStatus === 'error' && (
              <p className={styles.errorText}>⚠️ Using default location (Mumbai). Enable GPS for accurate detection.</p>
            )}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Damage Type</label>
              <select
                value={formData.damageType}
                onChange={(e) => setFormData({ ...formData, damageType: e.target.value })}
              >
                <option value="drought">Drought</option>
                <option value="flood">Flood</option>
                <option value="hailstorm">Hailstorm</option>
                <option value="pest">Pest Infestation</option>
                <option value="disease">Disease</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Estimated Damage (₹)</label>
              <input
                type="number"
                value={formData.estimatedDamage}
                onChange={(e) => setFormData({ ...formData, estimatedDamage: e.target.value })}
                placeholder="50000"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the damage..."
              rows={4}
            />
          </div>

          {/* Video/Photo Upload - CRITICAL FOR FARMERS */}
          <div className={styles.formGroup}>
            <label className={styles.cameraLabel}>
              📹 Record Field Video or Take Photos
              <span className={styles.required}>*Required for fraud detection</span>
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
              className={styles.cameraButton}
            >
              <span className={styles.cameraIcon}>📸</span>
              <div>
                <div className={styles.cameraButtonText}>Open Camera</div>
                <div className={styles.cameraButtonSubtext}>Record video or take photo of damaged field</div>
              </div>
            </button>

            {/* Video Preview */}
            {videoPreview && (
              <div className={styles.videoPreview}>
                <p className={styles.successText}>✅ Media captured successfully!</p>
                <video
                  src={videoPreview}
                  controls
                  className={styles.videoPlayer}
                />
                <p className={styles.videoInfo}>
                  📁 {videoFile?.name} ({(videoFile?.size! / 1024 / 1024).toFixed(2)} MB)
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setVideoFile(null)
                    setVideoPreview('')
                  }}
                  className={styles.removeButton}
                >
                  🗑️ Remove and retake
                </button>
              </div>
            )}

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }} />
                <span className={styles.progressText}>{uploadProgress}% uploaded</span>
              </div>
            )}

            <p className={styles.helpText}>
              💡 <strong>Tip:</strong> Record a 10-30 second video showing the damaged crops. 
              The video will be analyzed for shadow direction, GPS coordinates, and damage type.
            </p>
          </div>

          <button
            className={styles.button}
            onClick={submitClaim}
            disabled={loading || !formData.farmerId || !formData.estimatedDamage || !videoFile}
          >
            {loading ? '⏳ Processing...' : '🚀 Submit Claim'}
          </button>
        </div>

        {result && (
          <div className={result.error ? styles.error : styles.result}>
            <h3>{result.error ? '❌ Error' : '✅ Claim Submitted'}</h3>
            {result.error ? (
              <p>{result.error}</p>
            ) : (
              <>
                <p><strong>Claim ID:</strong> {result.claimId}</p>
                <p><strong>Status:</strong> {result.status}</p>
                <p><strong>Validation Score:</strong> {result.validationScore}%</p>
                {result.certificateId && (
                  <p><strong>Certificate ID:</strong> {result.certificateId}</p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
