'use client'

import { useState } from 'react'
import AppShell from '@/app/components/AppShell'

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
    <AppShell>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center space-y-6 animate-slide-up">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Zero-Interest Bridge Loan
            </h1>
            <p className="text-xl text-slate-300">
              Instant liquidity while waiting for insurance payout
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Info Cards */}
          <div className="mb-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">
            {[
              { label: 'Loan Amount', value: '70%', desc: 'of damage amount' },
              { label: 'Interest Rate', value: '0%', desc: 'completely free' },
              { label: 'Disbursement', value: 'UPI', desc: 'instant transfer' },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-6 border border-emerald-200 hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <p className="text-sm font-medium text-emerald-700 mb-2">{item.label}</p>
                <p className="text-3xl font-bold text-emerald-900 mb-1">{item.value}</p>
                <p className="text-xs text-emerald-600">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* How It Works */}
          <div className="mb-12 glass rounded-2xl p-8 shadow-lg animate-scale-in">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">How It Works</h3>
            <div className="space-y-4">
              {[
                'Get 70% of damage amount instantly',
                '0% interest rate',
                'Loss Certificate as collateral',
                'Auto-repaid from insurance payout',
                'Disbursed via UPI in seconds',
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Loan Request Form */}
          <div className="glass rounded-2xl shadow-xl p-8 space-y-6 animate-scale-in">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Loss Certificate ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  placeholder="CERT-2026-XXXXX"
                  className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>

            <button
              onClick={requestLoan}
              disabled={loading || !certificateId}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Request Bridge Loan</span>
                </>
              )}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className={`mt-8 p-8 rounded-2xl shadow-lg animate-scale-in ${
              result.error 
                ? 'bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200' 
                : 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200'
            }`}>
              {result.error ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <h3 className="text-xl font-semibold text-red-900">Loan Request Failed</h3>
                  </div>
                  <p className="text-red-700">{result.error}</p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <h3 className="text-xl font-semibold text-emerald-900">Loan Approved!</h3>
                  </div>

                  {/* Loan Amount Highlight */}
                  <div className="bg-white rounded-xl p-6 shadow-sm mb-6 text-center">
                    <p className="text-sm font-medium text-slate-600 mb-2">Loan Amount</p>
                    <p className="text-5xl font-bold text-emerald-900 mb-2">₹{result.loanAmount?.toLocaleString()}</p>
                    <p className="text-sm text-slate-600">(70% of ₹{result.damageAmount?.toLocaleString()})</p>
                  </div>

                  {/* Loan Details Grid */}
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-xs font-medium text-slate-600 mb-1">Loan ID</p>
                      <p className="text-sm font-semibold text-slate-900">{result.loanId}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-xs font-medium text-slate-600 mb-1">Interest Rate</p>
                      <p className="text-sm font-semibold text-emerald-900">0%</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-xs font-medium text-slate-600 mb-1">Collateral</p>
                      <p className="text-sm font-semibold text-slate-900">{result.certificateId}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-xs font-medium text-slate-600 mb-1">Status</p>
                      <p className="text-sm font-semibold text-emerald-900">{result.status}</p>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4">What Happens Next</h4>
                    <div className="space-y-4">
                      {[
                        'Funds transferred to your UPI account',
                        'Insurance company processes your claim',
                        'Loan auto-repaid from insurance payout',
                        'Remaining amount sent to you',
                      ].map((step, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-semibold text-sm">
                            {index + 1}
                          </div>
                          <p className="text-slate-700 pt-1">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  )
}
