import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { ClipboardList, UserCheck, Bot, FileText } from 'lucide-react'

const steps = [
  {
    icon: ClipboardList,
    step: '01',
    title: 'Create Interview',
    description:
      'Set up your interview in minutes. Choose topics, difficulty, programming language, and duration.',
  },
  {
    icon: UserCheck,
    step: '02',
    title: 'Invite Candidate',
    description:
      'Share a unique interview link with your candidate. They can start when ready from any device.',
  },
  {
    icon: Bot,
    step: '03',
    title: 'AI Conducts',
    description:
      'Our AI interviewer conducts a dynamic, adaptive interview — asking follow-ups and live code challenges.',
  },
  {
    icon: FileText,
    step: '04',
    title: 'Get Report',
    description:
      'Receive a detailed evaluation report with scores, transcript, code review, and a hiring recommendation.',
  },
]

const team = [
  { name: 'Alex Chen', role: 'Co-founder & CEO' },
  { name: 'Jamie Rivera', role: 'Co-founder & CTO' },
  { name: 'Morgan Lee', role: 'Head of Product' },
  { name: 'Taylor Kim', role: 'Head of AI Research' },
]

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <section className="py-20 px-4 text-center bg-gradient-to-b from-indigo-50/50 to-white">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Mission</h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
          We believe hiring great engineers should not require weeks of scheduling and subjective bias.
          InterviewAI was built to give every company access to fair, consistent, and scalable technical hiring.
        </p>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map(({ icon: Icon, step, title, description }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4 relative">
                  <Icon size={24} className="text-indigo-600" />
                  <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {step.replace('0', '')}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Meet the team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map(({ name, role }) => (
              <div key={name} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-indigo-600">
                  {name[0]}
                </div>
                <h3 className="font-semibold text-gray-900">{name}</h3>
                <p className="text-sm text-gray-500 mt-1">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 text-center border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to transform your hiring?</h2>
        <p className="text-gray-600 mb-8">Join hundreds of companies using InterviewAI to hire smarter.</p>
        <Link
          href="/register"
          className="inline-flex bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 py-3 text-sm font-medium transition-colors"
        >
          Start Free Trial
        </Link>
      </section>
    </div>
  )
}
