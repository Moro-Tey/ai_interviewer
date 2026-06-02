'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Spinner } from '@/components/ui/spinner'
import { Send, Play, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  role: 'ai' | 'candidate'
  content: string
}

const SESSION_ID = 'session_mock_001'

const initialMessages: Message[] = [
  {
    role: 'ai',
    content:
      "Hello! I'm your AI interviewer. Let's get started. Can you tell me a bit about your experience with frontend development?",
  },
]

const PROBLEM = `Given an array of integers, write a function that returns the two numbers that add up to a target sum.

Example:
  Input: nums = [2, 7, 11, 15], target = 9
  Output: [0, 1]
  (Because nums[0] + nums[1] = 2 + 7 = 9)

Constraints:
- Each input has exactly one solution.
- You may not use the same element twice.
- Return the indices of the two numbers.`

const STARTER_CODE: Record<string, string> = {
  JavaScript: `function twoSum(nums, target) {\n  // Your solution here\n}`,
  Python: `def two_sum(nums, target):\n    # Your solution here\n    pass`,
  Java: `public int[] twoSum(int[] nums, int target) {\n    // Your solution here\n    return new int[]{};\n}`,
  Go: `func twoSum(nums []int, target int) []int {\n    // Your solution here\n    return nil\n}`,
  'C++': `vector<int> twoSum(vector<int>& nums, int target) {\n    // Your solution here\n    return {};\n}`,
}

export default function InterviewSessionPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [aiTyping, setAiTyping] = useState(false)
  const [language, setLanguage] = useState('JavaScript')
  const [code, setCode] = useState(STARTER_CODE['JavaScript'])
  const [output, setOutput] = useState<{ stdout: string; stderr: string; executionTime: number } | null>(null)
  const [running, setRunning] = useState(false)
  const [problemOpen, setProblemOpen] = useState(true)
  const [timeLeft, setTimeLeft] = useState(60 * 60)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, aiTyping])

  useEffect(() => {
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000)
    return () => clearInterval(id)
  }, [])

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  async function handleSend() {
    if (!input.trim()) return
    const userMsg: Message = { role: 'candidate', content: input.trim() }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setAiTyping(true)
    try {
      const { reply } = await api.ai.chat(SESSION_ID, userMsg.content)
      setMessages((m) => [...m, { role: 'ai', content: reply }])
    } catch {
      setMessages((m) => [...m, { role: 'ai', content: 'I encountered an issue. Please continue.' }])
    } finally {
      setAiTyping(false)
    }
  }

  async function handleRunCode() {
    setRunning(true)
    setOutput(null)
    try {
      const result = await api.ai.executeCode(code, language)
      setOutput(result)
    } catch {
      setOutput({ stdout: '', stderr: 'Execution failed. Please try again.', executionTime: 0 })
    } finally {
      setRunning(false)
    }
  }

  function handleLanguageChange(lang: string) {
    setLanguage(lang)
    setCode(STARTER_CODE[lang] || STARTER_CODE['JavaScript'])
    setOutput(null)
  }

  function handleEndInterview() {
    router.push(`/interview/${token}/done`)
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <header className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-indigo-600 font-bold text-lg">✦</span>
          <span className="font-semibold text-gray-900 text-sm hidden sm:block">Senior Frontend Engineer</span>
          <span className="hidden sm:flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full">
            Step 1 / 3
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className={cn('font-mono text-sm font-semibold', timeLeft < 300 ? 'text-red-600' : 'text-gray-700')}>
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={handleEndInterview}
            className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
          >
            End Interview
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <div className="flex flex-col w-2/5 min-w-0 border-r border-gray-200 bg-white">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="font-semibold text-sm text-gray-900">AI Interviewer</span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={cn('flex', msg.role === 'candidate' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed',
                    msg.role === 'candidate'
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {aiTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-xl rounded-bl-sm px-4 py-2.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 flex-shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type your answer…"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              disabled={aiTyping}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || aiTyping}
              className="w-9 h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center px-4 py-2.5 bg-white border-b border-gray-200 flex-shrink-0">
            <span className="text-sm font-semibold text-gray-900">Coding Challenge</span>
          </div>

          <div className="flex flex-col flex-1 min-h-0">
            <div className="border-b border-gray-200 bg-white flex-shrink-0">
              <button
                onClick={() => setProblemOpen((o) => !o)}
                className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <span>Problem Description</span>
                {problemOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {problemOpen && (
                <div className="px-4 pb-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">{PROBLEM}</pre>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 px-4 py-2.5 bg-white border-b border-gray-200 flex-shrink-0">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
              >
                {Object.keys(STARTER_CODE).map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <div className="flex-1" />
              <button
                onClick={() => setCode(STARTER_CODE[language] || STARTER_CODE['JavaScript'])}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RotateCcw size={14} />
                Reset
              </button>
              <button
                onClick={handleRunCode}
                disabled={running}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 transition-colors"
              >
                {running ? <Spinner size="sm" /> : <Play size={14} />}
                Run Code
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="flex-1 resize-none bg-gray-900 text-green-400 font-mono text-sm p-4 focus:outline-none leading-relaxed"
                style={{ minHeight: 0 }}
              />
              {output !== null && (
                <div className="bg-gray-800 border-t border-gray-700 px-4 py-3 flex-shrink-0 max-h-40 overflow-y-auto">
                  {output.stdout && (
                    <pre className="text-green-300 text-xs font-mono whitespace-pre-wrap">{output.stdout}</pre>
                  )}
                  {output.stderr && (
                    <pre className="text-red-400 text-xs font-mono whitespace-pre-wrap">{output.stderr}</pre>
                  )}
                  {!output.stdout && !output.stderr && (
                    <p className="text-gray-400 text-xs">No output</p>
                  )}
                  {output.executionTime > 0 && (
                    <p className="text-gray-500 text-xs mt-1">Execution time: {output.executionTime}ms</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
