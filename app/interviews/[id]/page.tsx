'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SessionWithSubmission } from '@/lib/api';



type Tab = 'overview' | 'candidates';

interface Interview {
  id: string;
  title: string;
  role: string;
  difficulty: string;
  duration: number;
  topics: string[];
  language: string;
  numQuestions: number;
  status: string;
  createdAt: string;
}

interface Token {
  id: string;
  token: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
  candidateName: string;
  candidateEmail: string;
}
function submissionStatusVariant(status: string) {
  switch (status) {
    case 'graded': return 'success';
    case 'grading': return 'warning';
    case 'pending': return 'default';
    default: return 'default';
  }
}
export default function InterviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getToken, isSignedIn } = useAuth();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [generating, setGenerating] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');
  const [sessions, setSessions] = useState<SessionWithSubmission[]>([]);
  // Create a map for quick session lookup by token ID
  const sessionMap = sessions.reduce<Record<string, SessionWithSubmission>>((acc, s) => {
    if (s.interviewTokenId) acc[s.interviewTokenId] = s;
    return acc;
  }, {});

  const loadData = async () => {
    if (!isSignedIn) return;
    const token = await getToken();
    if (!token) return;

    try {
      // 1. Destructure the results from Promise.all
      const [interviewRes, tokensRes, sessionsRes] = await Promise.all([
        fetch(`/api/v1/interviews/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/v1/interviews/${id}/tokens`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/v1/interviews/${id}/sessions`, { // This is now a fetch call
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // 2. Handle Interview Response
      if (interviewRes.ok) {
        const data = await interviewRes.json();
        setInterview(data.data?.interview || null);
      }

      // 3. Handle Tokens Response
      if (tokensRes.ok) {
        const data = await tokensRes.json();
        setTokens(data.data?.tokens || []);
      }

      // 4. Handle Sessions Response
      if (sessionsRes.ok) {
        const result = await sessionsRes.json();
        // Adjust this based on your backend structure:
        // The router in interview.routes.ts returns { data: { sessions: [...] } }
        setSessions(result.data?.sessions || []);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isSignedIn]);

  const generateToken = async () => {
    if (!candidateName || !candidateEmail) {
      setError('Please fill in candidate name and email');
      return;
    }
    setGenerating(true);
    setError('');
    const token = await getToken();
    try {
      const res = await fetch(`/api/v1/interviews/${id}/tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ candidateName, candidateEmail, expiresInDays: 7 }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate link');
      }
      const data = await res.json();
      setInviteUrl(data.data?.inviteUrl || '');
      await loadData(); // refresh list
      setCandidateName('');
      setCandidateEmail('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate link');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">Loading...</div>
      </DashboardLayout>
    );
  }

  if (!interview) {
    return (
      <DashboardLayout>
        <div className="p-6">Interview not found.</div>
      </DashboardLayout>
    );
  }

  const shareLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/interview/${interview.id}`;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto w-full">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{interview.title}</h1>
              <Badge variant={interview.status === 'Active' ? 'success' : 'default'}>
                {interview.status || 'Active'}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              {interview.role} · {interview.difficulty} · {interview.duration} min · Created {new Date(interview.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {(['overview', 'candidates'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium capitalize border-b-2 -mb-px transition-colors',
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle>Interview Configuration</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Topics</p>
                  <p className="font-medium mt-0.5">{interview.topics?.join(', ') || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Language</p>
                  <p className="font-medium mt-0.5">{interview.language}</p>
                </div>
                <div>
                  <p className="text-gray-500">Coding Questions</p>
                  <p className="font-medium mt-0.5">{interview.numQuestions}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Share Interview Link</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={shareLink}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm bg-gray-50"
                  />
                  <Button variant="secondary" onClick={() => copyToClipboard(shareLink, 'main')}>
                    {copiedId === 'main' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'candidates' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invite a Candidate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Candidate name"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="John Doe"
                  />
                  <Input
                    label="Candidate email"
                    type="email"
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button onClick={generateToken} disabled={generating}>
                  {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Generate Invite Link
                </Button>
                {inviteUrl && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800">Invite Link Generated!</p>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        readOnly
                        value={inviteUrl}
                        className="flex-1 border rounded-lg px-3 py-1.5 text-sm bg-white"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => copyToClipboard(inviteUrl, 'new-link')}
                      >
                        {copiedId === 'new-link' ? <Check size={14} /> : <Copy size={14} />}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invited Candidates</CardTitle>
              </CardHeader>
              <CardContent>
                {tokens.length === 0 ? (
                  <p className="text-gray-500 text-sm">No invites sent yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Candidate</th>
                          <th className="text-left py-2">Email</th>
                          <th className="text-left py-2">Invite Link</th>
                          <th className="text-left py-2">Expires</th>
                          <th className="text-left py-2">Used</th>
                          <th className="text-left py-2">Submission Status</th>
                          <th className="text-left py-2">Score</th>
                          <th className="text-left py-2">Feedback</th> 
                        </tr>
                      </thead>
                      <tbody>
                        {tokens.map((t) => {
                          const session = sessionMap[t.id];
                          const submission = session?.submission;
                          const status = submission?.status || (session ? 'No submission' : 'Not started');
                          const score = submission?.score ?? '—';
                          const feedback = submission?.feedback || '—';

                          const link = `${window.location.origin}/interview/${t.token}`;

                          return (
                            <tr key={t.id} className="border-b">
                              <td className="py-2">{t.candidateName || '—'}</td>
                              <td className="py-2">{t.candidateEmail || '—'}</td>
                              <td className="py-2">
                                <div className="flex items-center gap-1">
                                  <code className="text-xs bg-gray-100 px-1 py-0.5 rounded truncate max-w-[150px]">
                                    {link}
                                  </code>
                                  <button
                                    onClick={() => copyToClipboard(link, t.id)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                  >
                                    {copiedId === t.id ? <Check size={14} /> : <Copy size={14} />}
                                  </button>
                                </div>
                              </td>
                              <td className="py-2">{new Date(t.expiresAt).toLocaleDateString()}</td>
                              <td className="py-2">{t.used ? '✅ Yes' : '❌ No'}</td>
                              <td className="py-2">
                                {session ? (
                                  <Badge variant={submissionStatusVariant(status)}>
                                    {status}
                                  </Badge>
                                ) : (
                                  <span className="text-gray-400 text-xs">Not started</span>
                                )}
                              </td>
                              <td className="py-2">{score}</td>
                              <td className="py-2 text-sm max-w-md break-words whitespace-normal">
                                {feedback}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}