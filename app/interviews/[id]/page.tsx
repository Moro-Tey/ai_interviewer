'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = 'overview' | 'candidates' | 'results'

const mockInterview = {
  id: '1',
  title: 'Senior Frontend Engineer',
  role: 'Engineer',
  difficulty: 'Hard',
  duration: 60,
  topics: ['Arrays', 'Algorithms', 'System Design'],
  language: 'JavaScript',
  questionCount: 3,
  status: 'Active',
  shareToken: 'tok_abc123',
  createdAt: 'Jun 1, 2026',
}

const mockCandidates = [
  { name: 'Alice Johnson', email: 'alice@example.com', score: 88, status: 'Passed', date: 'Jun 2, 2026', resultId: 'r1' },
  { name: 'Bob Smith', email: 'bob@example.com', score: 54, status: 'Failed', date: 'Jun 2, 2026', resultId: 'r2' },
  { name: 'Carol White', email: 'carol@example.com', score: 73, status: 'Review', date: 'Jun 1, 2026', resultId: 'r3' },
]

const mockResult = {
  recommendation: 'Strong Hire',
  confidence: 92,
  transcript: [
    { role: 'ai', content: 'Tell me about a challenging technical problem you solved recently.' },
    { role: 'candidate', content: 'I optimized a slow React rendering pipeline by introducing memoization and virtualization.' },
    { role: 'ai', content: 'How did you identify the bottleneck?' },
    { role: 'candidate', content: 'I used React DevTools profiler to find components re-rendering unnecessarily.' },
  ],
  codeReview: {
    score: 85,
    feedback: 'Good use of data structures. Could improve time complexity in the sorting step.',
    issues: ['O(n²) sort could be replaced with O(n log n)', 'Missing edge case for empty arrays'],
  },
  metrics: { timeSpent: 52, questionsAnswered: 5, codingChallenges: 3 },
}

function resultStatusVariant(s: string) {
  if (s === 'Passed') return 'success' as const
  if (s === 'Failed') return 'danger' as const
  return 'warning' as const
}

export default function InterviewDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [tab, setTab] = useState<Tab>('overview')
  const [copied, setCopied] = useState(false)

  const shareLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://app.interviewai.com'}/interview/${mockInterview.shareToken}`

  function copyLink() {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto w-full">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{mockInterview.title}</h1>
              <Badge variant={mockInterview.status === 'Active' ? 'success' : 'default'}>{mockInterview.status}</Badge>
            </div>
            <p className="text-sm text-gray-500">
              {mockInterview.role} · {mockInterview.difficulty} · {mockInterview.duration} min · Created {mockInterview.createdAt}
            </p>
          </div>
        </div>

        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {(['overview', 'candidates', 'results'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium capitalize border-b-2 -mb-px transition-colors',
                tab === t
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Interview Configuration</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Topics</p>
                  <p className="font-medium text-gray-900 mt-0.5">{mockInterview.topics.join(', ')}</p>
                </div>
                <div>
                  <p className="text-gray-500">Language</p>
                  <p className="font-medium text-gray-900 mt-0.5">{mockInterview.language}</p>
                </div>
                <div>
                  <p className="text-gray-500">Coding Questions</p>
                  <p className="font-medium text-gray-900 mt-0.5">{mockInterview.questionCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Share Link</h2>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={shareLink}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700 focus:outline-none"
                />
                <Button variant="secondary" onClick={copyLink}>
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">QR Code</h2>
              <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                QR placeholder
              </div>
            </div>
          </div>
        )}

        {tab === 'candidates' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left font-medium text-gray-500 px-6 py-3">Name</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-3">Email</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-3">Score</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-3">Status</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-3">Date</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {mockCandidates.map((c) => (
                  <tr key={c.email} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
                    <td className="px-6 py-4 text-gray-600">{c.email}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{c.score}%</td>
                    <td className="px-6 py-4">
                      <Badge variant={resultStatusVariant(c.status)}>{c.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{c.date}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setTab('results')}
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'results' && (
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Recommendation</p>
                  <Badge variant="success" className="text-sm px-3 py-1">{mockResult.recommendation}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Confidence</p>
                  <p className="text-2xl font-bold text-gray-900">{mockResult.confidence}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Time Spent</p>
                  <p className="text-lg font-semibold text-gray-900">{mockResult.metrics.timeSpent} min</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Questions</p>
                  <p className="text-lg font-semibold text-gray-900">{mockResult.metrics.questionsAnswered}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Transcript</h2>
              <div className="space-y-3">
                {mockResult.transcript.map((msg, i) => (
                  <div key={i} className={cn('flex', msg.role === 'candidate' ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cn(
                        'max-w-md rounded-xl px-4 py-2.5 text-sm',
                        msg.role === 'candidate'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-2">Code Review</h2>
              <p className="text-sm text-gray-600 mb-3">{mockResult.codeReview.feedback}</p>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Issues found</p>
              <ul className="space-y-1.5">
                {mockResult.codeReview.issues.map((issue, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span> {issue}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
