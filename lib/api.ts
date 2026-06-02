const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || 'Request failed')
  }
  return res.json()
}

export const api = {
  auth: {
    async register(data: {
      companyName: string
      email: string
      password: string
      plan: string
    }) {
      return request<{ token: string; user: { id: string; name: string; email: string; company: string } }>(
        'POST',
        '/api/auth/register',
        data
      )
    },
    async login(data: { email: string; password: string }) {
      return request<{ token: string; user: { id: string; name: string; email: string; company: string } }>(
        'POST',
        '/api/auth/login',
        data
      )
    },
  },

  interviews: {
    async list(token?: string) {
      return request<Interview[]>('GET', '/api/interviews', undefined, token)
    },
    async get(id: string, token?: string) {
      return request<Interview>('GET', `/api/interviews/${id}`, undefined, token)
    },
    async create(
      data: {
        title: string
        role: string
        difficulty: string
        duration: number
        topics: string[]
        language: string
        questionCount: number
      },
      token?: string
    ) {
      return request<Interview>('POST', '/api/interviews', data, token)
    },
  },

  sessions: {
    async start(token: string, data: { candidateName: string; email: string }) {
      return request<{ sessionId: string }>('POST', '/api/session/start', data, token)
    },
    async complete(token: string, data: { sessionId: string; answers: unknown[] }) {
      return request<{ success: boolean }>('POST', '/api/session/complete', data, token)
    },
  },

  ai: {
    async chat(sessionId: string, message: string) {
      return request<{ reply: string }>('POST', '/api/ai/interview/chat', { sessionId, message })
    },
    async generateChallenge(config: { topics: string[]; difficulty: string; language: string }) {
      return request<{ problem: string; starterCode: string }>('POST', '/api/ai/challenge/generate', config)
    },
    async executeCode(code: string, language: string) {
      return request<{ stdout: string; stderr: string; executionTime: number }>(
        'POST',
        '/api/ai/code/execute',
        { code, language }
      )
    },
    async reviewCode(data: { code: string; language: string; problem: string }) {
      return request<{ score: number; feedback: string; issues: string[] }>(
        'POST',
        '/api/ai/code/review',
        data
      )
    },
  },

  results: {
    async get(id: string, token?: string) {
      return request<Result>('GET', `/api/results/${id}`, undefined, token)
    },
  },
}

export interface Interview {
  id: string
  title: string
  role: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  duration: number
  topics: string[]
  language: string
  questionCount: number
  status: 'Draft' | 'Active' | 'Completed'
  candidatesCount: number
  createdAt: string
  shareToken?: string
}

export interface Result {
  id: string
  candidateName: string
  email: string
  score: number
  status: 'Passed' | 'Failed' | 'Review'
  recommendation: string
  confidence: number
  transcript: { role: string; content: string }[]
  codeReview: { score: number; feedback: string; issues: string[] }
  metrics: { timeSpent: number; questionsAnswered: number; codingChallenges: number }
  createdAt: string
}
