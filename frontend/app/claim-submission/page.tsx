'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './claim.module.css'

export default function ClaimSubmission() {
  const [formData, setFormData] = useState({
    farmerId: '',
    farmerName: '',
    latitude: '19.0760',
    longitude: '72.8777',
    damageType: 'drought',
    estimatedDamage: '',
    description: '',
  })
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

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
              <label>Latitude (GPS)</label>
              <input
                type="number"
                step="0.0001"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Longitude (GPS)</label>
              <input
                type="number"
                step="0.0001"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              />
            </div>
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

          <button
            className={styles.button}
            onClick={submitClaim}
            disabled={loading || !formData.farmerId || !formData.estimatedDamage}
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
