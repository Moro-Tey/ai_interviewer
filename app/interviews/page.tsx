'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { Plus, Search, Trash2, Eye } from 'lucide-react';
import { api, Interview } from '@/lib/api';

type Status = 'All' | 'Draft' | 'Active' | 'Completed';

function statusVariant(status: string) {
  if (status === 'Active') return 'success' as const;
  if (status === 'Completed') return 'info' as const;
  return 'default' as const; // for Draft
}

function difficultyVariant(d: string) {
  if (d === 'Hard') return 'danger' as const;
  if (d === 'Medium') return 'warning' as const;
  return 'success' as const;
}

export default function InterviewsPage() {
  const { getToken } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Status>('All');
  const loadData = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const data = await api.interviews.list(token);
      setInterviews(Array.isArray(data) ? data : []);
    } catch (err) {
      setError((err as Error).message || 'Failed to load interviews');
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  }, [getToken]);
  useEffect(() => {
    async function load() {
      try {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');
        const data = await api.interviews.list(token);
        // ✅ Ensure it's always an array
        setInterviews(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        setError((err as Error).message || 'Failed to load interviews');
        setInterviews([]); // fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getToken]);

  const filtered = interviews.filter((i) => {
    const matchesSearch = i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.role.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || i.status === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) return <DashboardLayout><div className="p-6">Loading interviews…</div></DashboardLayout>;
  if (error) return <DashboardLayout><div className="p-6 text-red-600">Error: {error}</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
            <p className="text-sm text-gray-500 mt-1">Manage all your interview templates.</p>
          </div>
          <Link href="/interviews/create">
            <Button variant="primary">
              <Plus size={16} />
              New Interview
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search interviews…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="flex gap-2">
            {(['All', 'Draft', 'Active', 'Completed'] as Status[]).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-2 text-sm rounded-lg border font-medium transition-colors ${filter === s
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center">
            <p className="text-gray-500 mb-4">No interviews found.</p>
            <Link href="/interviews/create">
              <Button variant="primary">
                <Plus size={16} />
                Create your first interview
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left font-medium text-gray-500 px-6 py-3">Title</th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">Role</th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">Difficulty</th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">Status</th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">Candidates</th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">Created</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((interview) => (
                    <tr key={interview.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{interview.title}</td>
                      <td className="px-6 py-4 text-gray-600">{interview.role}</td>
                      <td className="px-6 py-4">
                        <Badge variant={difficultyVariant(interview.difficulty)}>{interview.difficulty}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={statusVariant(interview.status)}>{interview.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{interview.candidatesCount ?? 0}</td>
                      <td className="px-6 py-4 text-gray-500">{new Date(interview.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/interviews/${interview.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye size={14} />
                              View
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={async () => {
                              if (!confirm('Are you sure you want to delete this interview?')) return;
                              try {
                                const token = await getToken();
                                if (!token) throw new Error('Not authenticated');
                                await api.interviews.delete(interview.id, token);
                                loadData(); // refresh the list
                              } catch (err) {
                                console.error('Delete error:', err);
                                alert('Failed to delete interview');
                              }
                            }}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}