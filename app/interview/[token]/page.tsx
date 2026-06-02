'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Clock, Code, MessageSquare } from 'lucide-react'

export default function CandidateGatePage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.sessions.start(token, { candidateName: name, email })
      router.push(`/interview/${token}/brief`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not verify your details. Please check your link and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-gray-900">
            <span className="text-indigo-600">✦</span>
            InterviewAI
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Welcome to your Technical Interview</h1>
          <p className="mt-2 text-sm text-gray-600">Please verify your identity to begin.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Interview Details</h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-gray-50 rounded-lg">
              <Clock size={18} className="text-indigo-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Duration</p>
              <p className="text-sm font-semibold text-gray-900">60 min</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <Code size={18} className="text-indigo-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Language</p>
              <p className="text-sm font-semibold text-gray-900">JavaScript</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <MessageSquare size={18} className="text-indigo-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Questions</p>
              <p className="text-sm font-semibold text-gray-900">3 coding</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              required
            />
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
            />
            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? <Spinner size="sm" /> : null}
              {loading ? 'Verifying…' : 'Verify & Continue'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
