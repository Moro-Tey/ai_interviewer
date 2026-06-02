'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { Spinner } from '@/components/ui/spinner'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const topicOptions = ['Arrays', 'Algorithms', 'System Design', 'SQL', 'OOP', 'Trees & Graphs', 'Dynamic Programming', 'Networking']
const languageOptions = ['JavaScript', 'Python', 'Java', 'Go', 'C++']

type Difficulty = 'Easy' | 'Medium' | 'Hard'

interface FormData {
  title: string
  role: string
  difficulty: Difficulty
  duration: number
  topics: string[]
  language: string
  questionCount: number
}

const steps = ['Basic Info', 'Configuration', 'Review & Create']

export default function CreateInterviewPage() {
  const router = useRouter()
  const { token } = useAuth()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<FormData>({
    title: '',
    role: '',
    difficulty: 'Medium',
    duration: 60,
    topics: [],
    language: 'JavaScript',
    questionCount: 2,
  })

  function toggleTopic(topic: string) {
    setForm((f) => ({
      ...f,
      topics: f.topics.includes(topic) ? f.topics.filter((t) => t !== topic) : [...f.topics, topic],
    }))
  }

  async function handleCreate() {
    setError('')
    setLoading(true)
    try {
      await api.interviews.create(form, token || undefined)
      router.push('/interviews')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create interview.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create Interview</h1>
          <p className="text-sm text-gray-500 mt-1">Configure your AI-powered technical interview.</p>
        </div>

        <div className="flex items-center gap-0 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors',
                    i < step
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : i === step
                      ? 'border-indigo-600 text-indigo-600 bg-white'
                      : 'border-gray-300 text-gray-400 bg-white'
                  )}
                >
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span className={cn('text-sm font-medium hidden sm:block', i === step ? 'text-gray-900' : 'text-gray-500')}>
                  {s}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={cn('flex-1 h-0.5 mx-3', i < step ? 'bg-indigo-600' : 'bg-gray-200')} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              <Input
                label="Interview title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Senior Frontend Engineer"
                required
              />
              <Input
                label="Role"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                placeholder="e.g. Engineer"
                required
              />
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Difficulty</p>
                <div className="flex gap-3">
                  {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, difficulty: d }))}
                      className={cn(
                        'px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
                        form.difficulty === d
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <Input
                label="Duration (minutes)"
                type="number"
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: Number(e.target.value) }))}
                min={15}
                max={180}
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Configuration</h2>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Topics</p>
                <div className="grid grid-cols-2 gap-2">
                  {topicOptions.map((topic) => (
                    <label key={topic} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={form.topics.includes(topic)}
                        onChange={() => toggleTopic(topic)}
                        className="accent-indigo-600 w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">{topic}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Programming Language</label>
                <select
                  value={form.language}
                  onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  {languageOptions.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Number of coding questions (1–5)</label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={form.questionCount}
                  onChange={(e) => setForm((f) => ({ ...f, questionCount: Number(e.target.value) }))}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className={form.questionCount === n ? 'text-indigo-600 font-semibold' : ''}>{n}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Review & Create</h2>
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
              )}
              <div className="bg-gray-50 rounded-lg p-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Title</span>
                  <span className="font-medium text-gray-900">{form.title || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Role</span>
                  <span className="font-medium text-gray-900">{form.role || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Difficulty</span>
                  <span className="font-medium text-gray-900">{form.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-medium text-gray-900">{form.duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Topics</span>
                  <span className="font-medium text-gray-900">{form.topics.length > 0 ? form.topics.join(', ') : 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Language</span>
                  <span className="font-medium text-gray-900">{form.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Coding Questions</span>
                  <span className="font-medium text-gray-900">{form.questionCount}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <Button
            variant="secondary"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
          >
            Back
          </Button>
          {step < 2 ? (
            <Button variant="primary" onClick={() => setStep((s) => s + 1)}>
              Continue
            </Button>
          ) : (
            <Button variant="primary" onClick={handleCreate} disabled={loading}>
              {loading ? <Spinner size="sm" /> : null}
              {loading ? 'Creating…' : 'Create Interview'}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
