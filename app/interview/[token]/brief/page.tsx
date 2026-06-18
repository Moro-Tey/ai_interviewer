import Link from 'next/link';
import { Clock, Code, ShieldCheck, ListChecks, Cpu } from 'lucide-react';

export default function InterviewBriefPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 font-bold text-xl text-gray-900 mb-4">
            <span className="text-indigo-600">✦</span>
            InterviewAI
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Technical Interview</h1>
          <p className="text-gray-500 mt-2">Please read the instructions carefully before you begin.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ListChecks size={18} className="text-indigo-500" />
            The Interview Process
          </h2>
          <ol className="space-y-3">
            {[
              'You will have a conversation with our AI interviewer about your experience and problem-solving approach.',
              'You will be given coding challenges to solve in the built-in code editor.',
              'The AI may ask follow-up questions based on your answers.',
              'When finished, your responses will be reviewed and you will receive feedback.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Cpu size={18} className="text-indigo-500" />
            Tools Available
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <Clock size={18} className="text-indigo-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">60 minute limit</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <Code size={18} className="text-indigo-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Code editor</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <ShieldCheck size={18} className="text-indigo-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Code execution</p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
          <h2 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
            <ShieldCheck size={18} />
            Rules
          </h2>
          <ul className="space-y-2 text-sm text-amber-800">
            <li className="flex items-start gap-2"><span>•</span> Do not copy code from external sources or AI tools.</li>
            <li className="flex items-start gap-2"><span>•</span> Complete the interview in one sitting — do not close the tab.</li>
            <li className="flex items-start gap-2"><span>•</span> Your session may be monitored for quality assurance.</li>
            <li className="flex items-start gap-2"><span>•</span> Ensure you are in a quiet environment with stable internet.</li>
          </ul>
        </div>

        <div className="text-center">
          <Link
            href="session"
            className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-8 py-3 font-medium transition-colors"
          >
            I Understand, Begin Interview
          </Link>
          <p className="text-xs text-gray-400 mt-3">By clicking above you agree to the interview rules.</p>
        </div>
      </div>
    </div>
  );
}