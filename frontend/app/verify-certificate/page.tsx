'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './verify.module.css'

export default function VerifyCertificate() {
  const [certificateId, setCertificateId] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const verifyCertificate = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        'https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod/certificates/verify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ certificateId }),
        }
      )
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Error:', error)
      setResult({ error: 'Failed to verify certificate. Please try again.' })
    }
    setLoading(false)
  }

  return (
    <main className={styles.main}>
      <nav className={styles.nav}>
        <Link href="/">Home</Link>
        <Link href="/claim-submission">Submit Claim</Link>
        <Link href="/verify-certificate" className={styles.active}>Verify Certificate</Link>
        <Link href="/bridge-loan">Bridge Loan</Link>
      </nav>

      <div className={styles.container}>
        <h1>🔍 Verify Loss Certificate</h1>
        <p className={styles.subtitle}>Blockchain-backed certificate verification</p>

        <div className={styles.form}>
          <div className={styles.formGroup}>
            <label>Certificate ID</label>
            <input
              type="text"
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
              placeholder="CERT-2026-XXXXX"
            />
          </div>

          <button
            className={styles.button}
            onClick={verifyCertificate}
            disabled={loading || !certificateId}
          >
            {loading ? '⏳ Verifying...' : '🔐 Verify Certificate'}
          </button>
        </div>

        {result && (
          <div className={result.error ? styles.error : styles.result}>
            {result.error ? (
              <>
                <h3>❌ Verification Failed</h3>
                <p>{result.error}</p>
              </>
            ) : result.valid ? (
              <>
                <h3>✅ Certificate Valid</h3>
                <div className={styles.certDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Certificate ID:</span>
                    <span className={styles.value}>{result.certificateId}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Farmer ID:</span>
                    <span className={styles.value}>{result.farmerId}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Damage Amount:</span>
                    <span className={styles.value}>₹{result.damageAmount?.toLocaleString()}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Validation Score:</span>
                    <span className={styles.value}>{result.validationScore}%</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Status:</span>
                    <span className={`${styles.value} ${styles.status}`}>{result.status}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Issued Date:</span>
                    <span className={styles.value}>{new Date(result.issuedAt).toLocaleString()}</span>
                  </div>
                  {result.expiryDate && (
                    <div className={styles.detailRow}>
                      <span className={styles.label}>Expiry Date:</span>
                      <span className={styles.value}>{new Date(result.expiryDate).toLocaleString()}</span>
                    </div>
                  )}
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Cryptographic Hash:</span>
                    <span className={styles.value} style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>
                      {result.hash}
                    </span>
                  </div>
                </div>
                <div className={styles.blockchain}>
                  <p>🔗 Stored on Amazon QLDB (Quantum Ledger Database)</p>
                  <p>✓ Cryptographically verified and immutable</p>
                </div>
              </>
            ) : (
              <>
                <h3>⚠️ Certificate Invalid</h3>
                <p>This certificate could not be verified or has been tampered with.</p>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
