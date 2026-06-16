'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, FileText, Activity, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { useProfile } from '@/lib/useProfile';

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
  _count?: {
    tokens: number;
    sessions: number;
  };
}

function statusVariant(status: string) {
  if (status === 'Active') return 'success';
  if (status === 'Completed') return 'info';
  return 'default';
}

export default function DashboardPage() {
  const router = useRouter();
  const { isSignedIn, getToken } = useAuth();
  const { loading: profileLoading } = useProfile(true);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInterviews() {
      if (!isSignedIn) return;
      const token = await getToken();
      if (!token) return;

      try {
        const res = await fetch('/api/v1/interviews', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setInterviews(data.interviews || []);
        }
      } catch (err) {
        console.error('Failed to fetch interviews:', err);
      } finally {
        setLoading(false);
      }
    }

    if (isSignedIn) {
      fetchInterviews();
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
    }
  }, [isSignedIn, getToken]);

  useEffect(() => {
    if (isSignedIn === false) {
      router.push('/login');
    }
  }, [isSignedIn, router]);

  if (!isSignedIn || profileLoading || loading) return null;

  // Calculate stats from real data
  const totalInterviews = interviews.length;
  const activeSessions = interviews.reduce((sum, i) => sum + (i._count?.sessions || 0), 0);
  const totalCandidates = interviews.reduce((sum, i) => sum + (i._count?.tokens || 0), 0);
  const avgScore = 76; // You'll calculate this from results later

  const stats = [
    { label: 'Total Interviews', value: totalInterviews.toString(), icon: FileText, change: `${totalInterviews} total` },
    { label: 'Active Sessions', value: activeSessions.toString(), icon: Activity, change: 'Live now' },
    { label: 'Candidates Evaluated', value: totalCandidates.toString(), icon: Users, change: `${totalCandidates} invited` },
    { label: 'Avg Score', value: `${avgScore}%`, icon: TrendingUp, change: 'Coming soon' },
  ];

  // Use real interviews, sorted by creation date
  const recentInterviews = interviews
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Welcome back. Here&apos;s what&apos;s happening.</p>
          </div>
          <Link href="/interviews/create">
            <Button variant="primary">
              <Plus size={16} />
              New Interview
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {stats.map(({ label, value, icon: Icon, change }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-600">{label}</p>
                <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <Icon size={18} className="text-indigo-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{change}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Recent Interviews</h2>
            <Link href="/interviews" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            {recentInterviews.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No interviews yet.</p>
                <Link href="/interviews/create" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">
                  Create your first interview
                </Link>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left font-medium text-gray-500 px-6 py-3">Title</th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">Role</th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">Status</th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">Candidates</th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">Date</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {recentInterviews.map((interview) => (
                    <tr key={interview.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{interview.title}</td>
                      <td className="px-6 py-4 text-gray-600">{interview.role}</td>
                      <td className="px-6 py-4">
                        <Badge variant={statusVariant(interview.status || 'Draft')}>
                          {interview.status || 'Draft'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{interview._count?.tokens || 0}</td>
                      <td className="px-6 py-4 text-gray-500">{new Date(interview.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <Link href={`/interviews/${interview.id}`} className="text-indigo-600 hover:text-indigo-700">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}