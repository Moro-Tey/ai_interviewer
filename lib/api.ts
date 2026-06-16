const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }
  return res.json();
}

// Response wrapper from backend
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface Interview {
  id: string;
  title: string;
  role: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: number;
  topics: string[];
  language: string;
  numQuestions: number;
  status: 'Draft' | 'Active' | 'Completed';
  candidatesCount?: number;
  createdAt: string;
  shareToken?: string;
}

export const api = {
  interviews: {
    list: async (token?: string): Promise<Interview[]> => {
      const response = await request<unknown>('GET', '/api/v1/interviews', undefined, token);

      // Try to extract the interviews array from various response shapes
      if (Array.isArray(response)) return response as Interview[];
      if (response && typeof response === 'object') {
        const obj = response as Record<string, unknown>;
        if (obj.data && typeof obj.data === 'object') {
          const dataObj = obj.data as Record<string, unknown>;
          if (Array.isArray(dataObj.interviews)) return dataObj.interviews as Interview[];
          if (Array.isArray(obj.data)) return obj.data as Interview[];
        }
        if (Array.isArray(obj.interviews)) return obj.interviews as Interview[];
      }
      console.warn('Unexpected response format from /api/v1/interviews', response);
      return [];
    },

    get: async (id: string, token?: string): Promise<Interview> => {
      const response = await request<ApiResponse<{ interview: Interview }>>(
        'GET',
        `/api/v1/interviews/${id}`,
        undefined,
        token
      );
      return response.data?.interview as Interview;
    },

    create: async (
      data: {
        title: string;
        role: string;
        difficulty: string;
        duration: number;
        topics: string[];
        language: string;
        questionCount: number;
      },
      token?: string
    ): Promise<Interview> => {
      const payload = {
        title: data.title,
        role: data.role,
        difficulty: data.difficulty.toLowerCase(),
        duration: data.duration,
        numQuestions: data.questionCount,
        topics: data.topics,
        language: data.language.toLowerCase(),
      };
      const response = await request<ApiResponse<{ interview: Interview }>>(
        'POST',
        '/api/v1/interviews',
        payload,
        token
      );
      return response.data?.interview as Interview;
    },
  },

  sessions: {
    async start(token: string, data: { candidateName: string; email: string }) {
      return request<{ sessionId: string }>('POST', '/api/session/start', data, token);
    },
    async complete(token: string, data: { sessionId: string; answers: unknown[] }) {
      return request<{ success: boolean }>('POST', '/api/session/complete', data, token);
    },
  },

  ai: {
    async chat(sessionId: string, message: string) {
      return request<{ reply: string }>('POST', '/api/ai/interview/chat', { sessionId, message });
    },
    async generateChallenge(config: { topics: string[]; difficulty: string; language: string }) {
      return request<{ problem: string; starterCode: string }>('POST', '/api/ai/challenge/generate', config);
    },
    async executeCode(code: string, language: string) {
      return request<{ stdout: string; stderr: string; executionTime: number }>(
        'POST',
        '/api/ai/code/execute',
        { code, language }
      );
    },
    async reviewCode(data: { code: string; language: string; problem: string }) {
      return request<{ score: number; feedback: string; issues: string[] }>(
        'POST',
        '/api/ai/code/review',
        data
      );
    },
  },

  results: {
    async get(id: string, token?: string) {
      return request<Result>('GET', `/api/results/${id}`, undefined, token);
    },
  },
};

export interface Result {
  id: string;
  candidateName: string;
  email: string;
  score: number;
  status: 'Passed' | 'Failed' | 'Review';
  recommendation: string;
  confidence: number;
  transcript: { role: string; content: string }[];
  codeReview: { score: number; feedback: string; issues: string[] };
  metrics: { timeSpent: number; questionsAnswered: number; codingChallenges: number };
  createdAt: string;
}

export async function fetchMyCompany() {
  const res = await fetch('/api/companies/me');
  if (!res.ok) throw new Error('Failed to fetch company');
  const data = await res.json();
  return data.company;
}

export async function createCompany(name: string) {
  const res = await fetch('/api/companies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ companyName: name }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create company');
  }
  const data = await res.json();
  return data.company;
}