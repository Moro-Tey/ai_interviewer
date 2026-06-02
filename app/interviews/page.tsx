'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Trash2, Eye } from 'lucide-react'

type Status = 'All' | 'Active' | 'Completed' | 'Draft'

const mockInterviews = [
  { id: '1', title: 'Senior Frontend Engineer', role: 'Engineer', difficulty: 'Hard', status: 'Active', candidates: 8, createdAt: 'Jun 1, 2026' },
  { id: '2', title: 'Backend Developer', role: 'Developer', difficulty: 'Medium', status: 'Completed', candidates: 12, createdAt: 'May 28, 2026' },
  { id: '3', title: 'Data Scientist', role: 'Data', difficulty: 'Hard', status: 'Draft', candidates: 0, createdAt: 'May 25, 2026' },
  { id: '4', title: 'DevOps Engineer', role: 'Engineer', difficulty: 'Medium', status: 'Completed', candidates: 5, createdAt: 'May 20, 2026' },
  { id: '5', title: 'iOS Developer', role: 'Mobile', difficulty: 'Easy', status: 'Active', candidates: 3, createdAt: 'May 18, 2026' },
]

function statusVariant(status: string) {
  if (status === 'Active') return 'success' as const
  if (status === 'Completed') return 'info' as const
  return 'default' as const
}

function difficultyVariant(d: string) {
  if (d === 'Hard') return 'danger' as const
  if (d === 'Medium') return 'warning' as const
  return 'success' as const
}

export default function InterviewsPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Status>('All')

  const filtered = mockInterviews.filter((i) => {
    const matchesSearch = i.title.toLowerCase().includes(search.toLowerCase()) || i.role.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'All' || i.status === filter
    return matchesSearch && matchesFilter
  })

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
            {(['All', 'Active', 'Completed', 'Draft'] as Status[]).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-2 text-sm rounded-lg border font-medium transition-colors ${
                  filter === s
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
                      <td className="px-6 py-4 text-gray-600">{interview.candidates}</td>
                      <td className="px-6 py-4 text-gray-500">{interview.createdAt}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/interviews/${interview.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye size={14} />
                              View
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
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
  )
}
