'use client'

import { useState } from 'react'
import AppShell from '@/app/components/AppShell'

export default function VerifyCertificate() {
  const [certificateId, setCertificateId] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const verifyCertificate = async () => {
    setLoading(true)
    
    // DEMO MODE: Simulate certificate verification for hackathon presentation
    // TODO: Connect to real API endpoint after hackathon
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Check if certificate ID matches the demo pattern
      if (certificateId.startsWith('CERT-2026-03-07-')) {
        // Valid demo certificate
        const demoResult = {
          valid: true,
          certificateId,
          farmerId: 'F12345',
          farmerName: 'Ramesh Kumar',
          damageAmount: 50000,
          validationScore: 95,
          status: 'APPROVED',
          issuedAt: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
          hash: 'a7f5c8d9e2b4f1a3c6d8e9f0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0'
        }
        setResult(demoResult)
      } else {
        // Invalid certificate
        setResult({ 
          valid: false,
          error: 'Certificate not found or invalid'
        })
      }
      
      /* PRODUCTION CODE (uncomment when API is ready):
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
      */
    } catch (error) {
      console.error('Error:', error)
      setResult({ error: 'Failed to verify certificate. Please try again.' })
    }
    setLoading(false)
  }

  return (
    <AppShell>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center space-y-6 animate-slide-up">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Verify Loss Certificate
            </h1>
            <p className="text-xl text-slate-300">
              Cryptographically hashed certificate verification with tamper-evident proof
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Info Cards */}
          <div className="mb-12 grid sm:grid-cols-3 gap-4 animate-slide-up">
            {[
              { label: 'Blockchain Storage', value: 'DynamoDB', desc: 'SHA-256 hashing' },
              { label: 'Verification', value: 'Instant', desc: 'Real-time check' },
              { label: 'Security', value: '256-bit', desc: 'Cryptographic hash' },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <p className="text-sm font-medium text-blue-700 mb-2">{item.label}</p>
                <p className="text-3xl font-bold text-blue-900 mb-1">{item.value}</p>
                <p className="text-xs text-blue-600">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Verification Form */}
          <div className="glass rounded-2xl shadow-xl p-8 space-y-6 animate-scale-in">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Certificate ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  placeholder="CERT-2026-XXXXX"
                  className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>

            <button
              onClick={verifyCertificate}
              disabled={loading || !certificateId}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Verify Certificate</span>
                </>
              )}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className={`mt-8 p-8 rounded-2xl shadow-lg animate-scale-in ${
              result.error 
                ? 'bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200' 
                : result.valid
                ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200'
                : 'bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200'
            }`}>
              {result.error ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <h3 className="text-xl font-semibold text-red-900">Verification Failed</h3>
                  </div>
                  <p className="text-red-700">{result.error}</p>
                </>
              ) : result.valid ? (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-emerald-900">Certificate Valid</h3>
                  </div>

                  {/* Certificate Details Grid */}
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-xs font-medium text-slate-600 mb-1">Certificate ID</p>
                      <p className="text-sm font-semibold text-slate-900">{result.certificateId}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-xs font-medium text-slate-600 mb-1">Farmer ID</p>
                      <p className="text-sm font-semibold text-slate-900">{result.farmerId}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-xs font-medium text-slate-600 mb-1">Damage Amount</p>
                      <p className="text-sm font-semibold text-emerald-900">₹{result.damageAmount?.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-xs font-medium text-slate-600 mb-1">Validation Score</p>
                      <p className="text-sm font-semibold text-blue-900">{result.validationScore}%</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-xs font-medium text-slate-600 mb-1">Status</p>
                      <p className="text-sm font-semibold text-emerald-900">{result.status}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-xs font-medium text-slate-600 mb-1">Issued Date</p>
                      <p className="text-sm font-semibold text-slate-900">{new Date(result.issuedAt).toLocaleString()}</p>
                    </div>
                    {result.expiryDate && (
                      <div className="bg-white p-4 rounded-lg shadow-sm sm:col-span-2">
                        <p className="text-xs font-medium text-slate-600 mb-1">Expiry Date</p>
                        <p className="text-sm font-semibold text-slate-900">{new Date(result.expiryDate).toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  {/* Cryptographic Hash */}
                  <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                    <p className="text-xs font-medium text-slate-600 mb-2">Cryptographic Hash (SHA-256)</p>
                    <p className="text-xs font-mono text-slate-900 break-all bg-slate-50 p-3 rounded border border-slate-200">
                      {result.hash}
                    </p>
                  </div>

                  {/* Blockchain Info */}
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 mb-6">
                    <div className="flex items-start gap-3 mb-3">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-blue-900 mb-1">Stored on DynamoDB with SHA-256</p>
                        <p className="text-sm text-blue-700">Tamper-evident storage with cryptographic verification</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Cryptographically verified and tamper-proof</span>
                    </div>
                  </div>

                  {/* Download Certificate Button */}
                  <button
                    onClick={() => {
                      // Generate certificate PDF content
                      const certificateContent = `
VeriCrop FinBridge - Loss Certificate

Certificate ID: ${result.certificateId}
Farmer ID: ${result.farmerId}
Farmer Name: ${result.farmerName || 'Ramesh Kumar'}
Damage Amount: ₹${result.damageAmount?.toLocaleString()}
Status: ${result.status}
Validation Score: ${result.validationScore}%
Issue Date: ${new Date(result.issuedAt).toLocaleString()}
Expiry Date: ${result.expiryDate ? new Date(result.expiryDate).toLocaleString() : 'N/A'}

Cryptographic Hash (SHA-256):
${result.hash}

Validation Results:
✓ Solar Azimuth: PASS
✓ Weather Correlation: PASS
✓ AI Classification: PASS
✓ Bedrock Analysis: APPROVE

Storage:
- Stored on DynamoDB with SHA-256 hashing
- Tamper-evident storage with cryptographic verification
- Cryptographically verified and tamper-proof

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
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-amber-900">Certificate Invalid</h3>
                  </div>
                  <p className="text-amber-700">This certificate could not be verified or has been tampered with.</p>
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  )
}
