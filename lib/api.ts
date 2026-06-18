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
    // Inside the `interviews` object:
    getSessions: async (id: string, token?: string): Promise<SessionWithSubmission[]> => {
      const response = await request<ApiResponse<{ sessions: SessionWithSubmission[] }>>(
        'GET',
        `/api/v1/interviews/${id}/sessions`,
        undefined,
        token
      );
      return response.data?.sessions || [];
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
    delete: async (id: string, token?: string): Promise<void> => {
      await request('DELETE', `/api/v1/interviews/${id}`, undefined, token);
    },
  },

  sessions: {
    async start(inviteToken: string, data: { candidateName: string; email: string }) {
      const response = await request<ApiResponse<{ sessionId: string }>>(
        'POST',
        '/api/v1/session/start',
        { ...data, token: inviteToken },
        undefined
      );
      console.log('📦 Full response:', response); // 👈 Add this

      const sessionId = response.data?.sessionId;
      if (!sessionId) {
        throw new Error('No session ID returned from server');
      }
      return response.data?.sessionId; // ✅

    },
    async complete(inviteToken: string, data: { session_id: string; answers: unknown[] }) {
      const response = await request<ApiResponse<{ success: boolean }>>(
        'POST',
        '/api/v1/session/complete',
        { ...data, token: inviteToken },
        undefined
      );
      return response.data?.success ?? false;
    },
  },
  submissions: {
  async submit(data: {
    session_id: string;
    code: string;
    language: string;
    problem: string;
    executionResult: unknown;
  }) {
    return request<{ submissionId: string; score?: number; feedback?: string }>(
      'POST',
      '/ai/code/review',
      data
    );
  },
},

  ai: {
    async chat(sessionId: string, message: string) {
      return request<{ reply: string }>('POST', '/api/ai/interview/chat', { sessionId, message });
    },
    // In api.ts, inside the `ai` object:
    async generateChallenge(config: {
      role: string;
      topics: string[];
      difficulty: string;
      language: string;
    }) {
      // The actual response from the AI service includes `starter_code` and `test_cases`
      return request<{
        problem: string;
        starter_code: string;   // note underscore
        test_cases?: unknown[];
      }>('POST', '/api/ai/challenge/generate', config);
    },
    async executeCode(code: string, language: string) {
      const response = await request<ApiResponse<{ stdout: string; stderr: string; executionTime: number }>>(
      'POST',
      '/api/ai/code/execute',
    { code, language }
  );
  // Unwrap the data field so the frontend receives { stdout, stderr, executionTime }
    return response.data ?? { stdout: '', stderr: '', executionTime: 0 };
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
export interface SessionWithSubmission {
  id: string;
  candidateName: string;
  candidateEmail: string;
  status: string;               // e.g. 'pending', 'active', 'completed'
  interviewTokenId?: string;    // link to the token
  submission?: {
    id: string;
    status: 'pending' | 'grading' | 'graded';
    score?: number | null;
    feedback?: string | null;
  } | null;
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
