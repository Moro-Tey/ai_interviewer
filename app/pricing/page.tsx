import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: '$49',
    period: '/mo',
    description: 'Perfect for small teams getting started with AI interviews.',
    features: [
      '10 interviews per month',
      'AI chat interviewer',
      'Basic reports',
      'Email support',
      'Standard templates',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Growth',
    price: '$149',
    period: '/mo',
    description: 'For growing teams that need more interviews and advanced features.',
    features: [
      '50 interviews per month',
      'All AI features',
      'Live monitoring',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
    ],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For organizations that need unlimited scale and dedicated support.',
    features: [
      'Unlimited interviews',
      'Custom integrations',
      'Dedicated support',
      'SSO & SAML',
      'SLA guarantee',
      'On-premise option',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <section className="py-16 px-4 text-center bg-gradient-to-b from-indigo-50/50 to-white">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Choose the plan that fits your team. Upgrade or downgrade at any time.
        </p>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-xl border shadow-sm p-8 flex flex-col ${
                plan.popular ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && <span className="text-gray-500 mb-1">{plan.period}</span>}
                </div>
                <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-gray-700">
                    <Check size={16} className="text-indigo-600 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`block text-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  plan.popular
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 px-4 bg-gray-50 border-t border-gray-200 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Not sure which plan is right for you?</h3>
        <p className="text-gray-600 text-sm mb-6">
          Talk to our team and we will help you find the best fit for your hiring volume.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
        >
          Start for free
        </Link>
      </section>
    </div>
  )
}
