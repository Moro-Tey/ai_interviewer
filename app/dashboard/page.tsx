'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {useAuth} from '@clerk/nextjs'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, FileText, Activity, TrendingUp, Plus, ArrowRight } from 'lucide-react'

const stats = [
  { label: 'Total Interviews', value: '24', icon: FileText, change: '+3 this week' },
  { label: 'Active Sessions', value: '3', icon: Activity, change: 'Live now' },
  { label: 'Candidates Evaluated', value: '87', icon: Users, change: '+12 this month' },
  { label: 'Avg Score', value: '76%', icon: TrendingUp, change: '+4% vs last month' },
]

const recentInterviews = [
  { id: '1', title: 'Senior Frontend Engineer', role: 'Engineer', status: 'Active', candidates: 8, date: 'Jun 1, 2026' },
  { id: '2', title: 'Backend Developer', role: 'Developer', status: 'Completed', candidates: 12, date: 'May 28, 2026' },
  { id: '3', title: 'Data Scientist', role: 'Data', status: 'Draft', candidates: 0, date: 'May 25, 2026' },
  { id: '4', title: 'DevOps Engineer', role: 'Engineer', status: 'Completed', candidates: 5, date: 'May 20, 2026' },
]

function statusVariant(status: string) {
  if (status === 'Active') return 'success'
  if (status === 'Completed') return 'info'
  return 'default'
}

export default function DashboardPage() {
  const router = useRouter()
  const { isSignedIn } = useAuth()

  useEffect(() => {
    if (isSignedIn === false) {
      router.push('/login')
    }
  }, [isSignedIn, router])

  if (!isSignedIn) return null

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
                      <Badge variant={statusVariant(interview.status)}>{interview.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{interview.candidates}</td>
                    <td className="px-6 py-4 text-gray-500">{interview.date}</td>
                    <td className="px-6 py-4">
                      <Link href={`/interviews/${interview.id}`} className="text-indigo-600 hover:text-indigo-700">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
