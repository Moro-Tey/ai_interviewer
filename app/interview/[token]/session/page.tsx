'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Play, RotateCcw, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { cn } from '@/lib/utils';


// Fallback (static) content – used if AI fails
const FALLBACK_PROBLEM = `Given an array of integers, write a function that returns the two numbers that add up to a target sum.

Example:
  Input: nums = [2, 7, 11, 15], target = 9
  Output: [0, 1]
  (Because nums[0] + nums[1] = 2 + 7 = 9)

Constraints:
- Each input has exactly one solution.
- You may not use the same element twice.
- Return the indices of the two numbers.`;

const FALLBACK_STARTER: Record<string, string> = {
  JavaScript: `function twoSum(nums, target) {\n  // Your solution here\n}`,
  Python: `def two_sum(nums, target):\n    # Your solution here\n    pass`,
  Java: `public int[] twoSum(int[] nums, int target) {\n    // Your solution here\n    return new int[]{};\n}`,
  Go: `func twoSum(nums []int, target int) []int {\n    // Your solution here\n    return nil\n}`,
  'C++': `vector<int> twoSum(vector<int>& nums, int target) {\n    // Your solution here\n    return {};\n}`,
};

export default function CodingSessionPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  // ── State ──
  const [language, setLanguage] = useState('JavaScript');
  const [code, setCode] = useState(FALLBACK_STARTER['JavaScript']);
  const [output, setOutput] = useState<{ stdout: string; stderr: string; executionTime: number } | null>(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [problemOpen, setProblemOpen] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [session_id, setSessionId] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<{ problem: string; starterCode: string; testCases?: unknown[] } | null>(null);
  const [loading, setLoading] = useState(true);

  // ── 1. Get session ID from sessionStorage ──
  useEffect(() => {
    const storedSessionId = sessionStorage.getItem('interviewSessionId');
    if (!storedSessionId || storedSessionId === 'undefined') {
      alert('Session expired. Please restart the interview.');
      router.push(`/interview/${token}`);
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSessionId(storedSessionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run only once

  // ── 2. Fetch interview + generate AI challenge ──
  // ── 2. Fetch interview + generate AI challenge ──
  useEffect(() => {
    async function loadChallenge() {
      try {
        // 2a. Fetch interview details using the invite token
        const res = await fetch(`/api/v1/interviews/by-token/${token}`);
        if (!res.ok) throw new Error('Failed to fetch interview');
        const data = await res.json();
        const interview = data.data?.interview;
        if (!interview) throw new Error('Interview not found');

        // 2b. Set language from interview (update dropdown)
        if (interview.language && FALLBACK_STARTER[interview.language]) {
          setLanguage(interview.language);
        }

        // 2c. Generate challenge via AI
        const challengeResponse = await api.ai.generateChallenge({
          role: interview.role,
          topics: interview.topics,
          difficulty: interview.difficulty ? interview.difficulty.toLowerCase() : 'medium',
          language: interview.language ? interview.language.toLowerCase() : 'javascript',
        });

        // 🛡️ FIX: Extract payload safely whether it's wrapped in response.data or direct
        const challengeData = (challengeResponse as any)?.data || challengeResponse;

        if (!challengeData || !challengeData.problem) {
          throw new Error('Problem content missing from server response');
        }

        // 🛡️ FIX: Support both snake_case and camelCase fallbacks
        const problemText = challengeData.problem;
        const starter = challengeData.starterCode || challengeData.starter_code || FALLBACK_STARTER[interview.language] || '';
        const testCases = challengeData.testCases || challengeData.test_cases || [];

        // 2d. Store challenge data safely
        setChallenge({
          problem: problemText,
          starterCode: starter,
          testCases: testCases,
        });

        // 2e. Pre‑fill editor with starter code
        setCode(starter);
      } catch (error) {
        console.error('Failed to load challenge:', error);
        // Fallback to static content
        setChallenge({
          problem: FALLBACK_PROBLEM,
          starterCode: FALLBACK_STARTER[language] || '',
          testCases: [],
        });
        setCode(FALLBACK_STARTER[language] || '');
      } finally {
        setLoading(false);
      }
    }
    loadChallenge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Only re-run when token changes

  // ── 3. Timer ──
  useEffect(() => {
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  // ── Helpers ──
  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  // ── Run code ──
  async function handleRunCode() {
    setRunning(true);
    setOutput(null);
    try {
      const result = await api.ai.executeCode(code, language);
      setOutput(result);
    } catch {
      setOutput({ stdout: '', stderr: 'Execution failed. Please try again.', executionTime: 0 });
    } finally {
      setRunning(false);
    }
  }

  // ── Submit final code ──
  async function handleSubmit() {
  if (!session_id) {
    alert('Session not found. Please restart the interview.');
    return;
  }
  setSubmitting(true);
  try {
    const result = await api.submissions.submit({
      session_id,
      code,
      language,
      problem: challenge?.problem || '',
      executionResult: output || { stdout: '', stderr: '', executionTime: 0 },
    });
    // Optionally store score/feedback for the done page
    sessionStorage.setItem('submissionResult', JSON.stringify(result));
    router.push(`/interview/${token}/done`);
  } catch (err: unknown) {
    alert(err instanceof Error ? err.message : 'Submission failed');
  } finally {
    setSubmitting(false);
  }
}

  // ── Language change ──
  function handleLanguageChange(lang: string) {
    setLanguage(lang);
    // Use static fallback for the new language (we don't have AI starter for it)
    setCode(FALLBACK_STARTER[lang] || FALLBACK_STARTER['JavaScript']);
    setOutput(null);
  }

  // ── End session ──
  function handleEndSession() {
    if (confirm('Are you sure you want to end the session? Your progress will be lost.')) {
      router.push(`/interview/${token}/done`);
    }
  }

  // ── Loading state ──
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
        <span className="ml-3 text-gray-600">Loading challenge...</span>
      </div>
    );
  }

  // ── Render ──
  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <header className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-indigo-600 font-bold text-lg">✦</span>
          <span className="font-semibold text-gray-900 text-sm hidden sm:block">Coding Challenge</span>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn('font-mono text-sm font-semibold', timeLeft < 300 ? 'text-red-600' : 'text-gray-700')}>
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={handleEndSession}
            className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
          >
            End Session
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Left panel: Problem description */}
        <div className="w-2/5 min-w-0 border-r border-gray-200 bg-white p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-900">Problem</h2>
            <button
              onClick={() => setProblemOpen(!problemOpen)}
              className="text-gray-500 hover:text-gray-700"
            >
              {problemOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
          {problemOpen && (
            <div className="space-y-4">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed bg-gray-50 p-4 rounded-lg">
                {challenge?.problem || 'No problem loaded.'}
              </pre>
              {challenge?.testCases && challenge.testCases.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-800">Test Cases (for reference)</h3>
                  <pre className="text-xs text-gray-600 bg-gray-100 p-3 rounded-lg overflow-x-auto">
                    {JSON.stringify(challenge.testCases, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right panel: Code editor */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white border-b border-gray-200 shrink-0">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
            >
              {Object.keys(FALLBACK_STARTER).map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <div className="flex-1" />
            <button
              onClick={() => setCode(FALLBACK_STARTER[language] || FALLBACK_STARTER['JavaScript'])}
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
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition-colors"
            >
              {submitting ? <Spinner size="sm" /> : <Send size={14} />}
              Submit
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
              <div className="bg-gray-800 border-t border-gray-700 px-4 py-3 shrink-0 max-h-40 overflow-y-auto">
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
  );
}