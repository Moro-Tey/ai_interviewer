import { CheckCircle2 } from 'lucide-react'

export default function InterviewDonePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <CheckCircle2 size={72} className="text-green-500" strokeWidth={1.5} />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">Interview Complete!</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Thank you. Your interview has been submitted successfully.
          Our team will review your responses and coding solutions.
        </p>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-8 text-left space-y-3">
          <h2 className="font-semibold text-gray-900 text-sm mb-3">Your Summary</h2>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Time taken</span>
            <span className="font-medium text-gray-900">47 minutes</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Questions answered</span>
            <span className="font-medium text-gray-900">5</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Coding challenges completed</span>
            <span className="font-medium text-gray-900">2 / 3</span>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 text-sm text-indigo-800 leading-relaxed">
          Your results will be reviewed and you&apos;ll hear back within{' '}
          <strong>2–3 business days</strong>. Keep an eye on your inbox.
        </div>
      </div>
    </div>
  )
}
