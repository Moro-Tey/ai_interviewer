import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Brain, Code, BarChart3, FileCheck, Radio, Users } from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI Interviewer',
    description: 'Intelligent conversational AI that adapts to candidate responses in real time.',
  },
  {
    icon: Code,
    title: 'Code Evaluation',
    description: 'Automated code execution and review with detailed feedback on quality and correctness.',
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    description: 'Deep insights into candidate performance across technical skills and problem solving.',
  },
  {
    icon: FileCheck,
    title: 'Instant Reports',
    description: 'Detailed hiring recommendations generated the moment the interview concludes.',
  },
  {
    icon: Radio,
    title: 'Live Monitoring',
    description: 'Watch sessions in real time and intervene if needed from your dashboard.',
  },
  {
    icon: Users,
    title: 'Scalable Hiring',
    description: 'Run hundreds of interviews simultaneously without adding headcount to your team.',
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 bg-gradient-to-b from-indigo-50/60 to-white">
        <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
          <span className="text-indigo-500">✦</span>
          AI-Powered Technical Hiring
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 max-w-3xl leading-tight tracking-tight mb-6">
          AI-Powered Technical Interviews at Scale
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mb-10">
          Automate your hiring process with intelligent AI interviews, real-time code evaluation, and instant hiring recommendations.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/register"
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 py-3 text-sm font-medium transition-colors"
          >
            Start Free Trial
          </Link>
          <Link
            href="/about"
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg px-6 py-3 text-sm font-medium transition-colors"
          >
            See How It Works
          </Link>
        </div>
      </section>

      <section className="py-8 bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-around gap-6 text-center">
          {[
            { value: '500+', label: 'Companies' },
            { value: '10,000+', label: 'Interviews Conducted' },
            { value: '85%', label: 'Time Saved' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-bold text-white">{value}</p>
              <p className="text-sm text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to hire better</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              One platform to create, run, and analyze technical interviews — end to end.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon size={20} className="text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-bold text-gray-900">
            <span className="text-indigo-600">✦</span>
            InterviewAI
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-gray-500">
            <Link href="/about" className="hover:text-gray-900">About</Link>
            <Link href="/pricing" className="hover:text-gray-900">Pricing</Link>
            <Link href="/login" className="hover:text-gray-900">Login</Link>
            <Link href="/register" className="hover:text-gray-900">Sign Up</Link>
          </div>
          <p className="text-sm text-gray-400">© 2026 InterviewAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
