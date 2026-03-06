'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './loan.module.css'

export default function BridgeLoan() {
  const [certificateId, setCertificateId] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const requestLoan = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        'https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod/loans',
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
      setResult({ error: 'Failed to process loan request. Please try again.' })
    }
    setLoading(false)
  }

  return (
    <main className={styles.main}>
      <nav className={styles.nav}>
        <Link href="/">Home</Link>
        <Link href="/claim-submission">Submit Claim</Link>
        <Link href="/verify-certificate">Verify Certificate</Link>
        <Link href="/bridge-loan" className={styles.active}>Bridge Loan</Link>
      </nav>

      <div className={styles.container}>
        <h1>💰 Zero-Interest Bridge Loan</h1>
        <p className={styles.subtitle}>Instant liquidity while waiting for insurance payout</p>

        <div className={styles.infoBox}>
          <h3>How it works:</h3>
          <ul>
            <li>✓ Get 70% of damage amount instantly</li>
            <li>✓ 0% interest rate</li>
            <li>✓ Loss Certificate as collateral</li>
            <li>✓ Auto-repaid from insurance payout</li>
            <li>✓ Disbursed via UPI in seconds</li>
          </ul>
        </div>

        <div className={styles.form}>
          <div className={styles.formGroup}>
            <label>Loss Certificate ID</label>
            <input
              type="text"
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
              placeholder="CERT-2026-XXXXX"
            />
          </div>

          <button
            className={styles.button}
            onClick={requestLoan}
            disabled={loading || !certificateId}
          >
            {loading ? '⏳ Processing...' : '🚀 Request Bridge Loan'}
          </button>
        </div>

        {result && (
          <div className={result.error ? styles.error : styles.result}>
            {result.error ? (
              <>
                <h3>❌ Loan Request Failed</h3>
                <p>{result.error}</p>
              </>
            ) : (
              <>
                <h3>✅ Loan Approved!</h3>
                <div className={styles.loanDetails}>
                  <div className={styles.amountBox}>
                    <span className={styles.amountLabel}>Loan Amount</span>
                    <span className={styles.amount}>₹{result.loanAmount?.toLocaleString()}</span>
                    <span className={styles.calculation}>
                      (70% of ₹{result.damageAmount?.toLocaleString()})
                    </span>
                  </div>
                  
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Loan ID:</span>
                    <span className={styles.value}>{result.loanId}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Interest Rate:</span>
                    <span className={styles.value}>0%</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Collateral:</span>
                    <span className={styles.value}>{result.certificateId}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Status:</span>
                    <span className={`${styles.value} ${styles.status}`}>{result.status}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Disbursement:</span>
                    <span className={styles.value}>UPI Transfer</span>
                  </div>
                </div>
                
                <div className={styles.timeline}>
                  <h4>What happens next:</h4>
                  <div className={styles.step}>
                    <span className={styles.stepNumber}>1</span>
                    <span>Funds transferred to your UPI account</span>
                  </div>
                  <div className={styles.step}>
                    <span className={styles.stepNumber}>2</span>
                    <span>Insurance company processes your claim</span>
                  </div>
                  <div className={styles.step}>
                    <span className={styles.stepNumber}>3</span>
                    <span>Loan auto-repaid from insurance payout</span>
                  </div>
                  <div className={styles.step}>
                    <span className={styles.stepNumber}>4</span>
                    <span>Remaining amount sent to you</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
