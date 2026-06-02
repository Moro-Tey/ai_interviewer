'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
        checked ? 'bg-indigo-600' : 'bg-gray-200'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  )
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [company, setCompany] = useState(user?.company || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [notifications, setNotifications] = useState({ email: true, reports: true, sessions: false })
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [saved, setSaved] = useState(false)

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account and preferences.</p>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-5">Profile</h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <Input
                label="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
              <Input
                label="Email address"
                value={user?.email || ''}
                readOnly
                helperText="Contact support to change your email."
              />
              <Button type="submit" variant="primary" size="sm">
                {saved ? 'Saved!' : 'Save changes'}
              </Button>
            </form>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-5">Company</h2>
            <div className="space-y-4">
              <Input
                label="Company name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Your company"
              />
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Company logo</p>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-sm text-gray-500">
                  Click to upload logo (PNG, JPG up to 2 MB)
                </div>
              </div>
              <Button variant="primary" size="sm">Save company</Button>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-5">Change Password</h2>
            <div className="space-y-4">
              <Input
                label="Current password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
              <Input
                label="New password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
              />
              <Button variant="primary" size="sm">Update password</Button>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-5">Notifications</h2>
            <div className="space-y-4">
              {[
                { key: 'email' as const, label: 'Email notifications', description: 'Receive updates via email.' },
                { key: 'reports' as const, label: 'Interview reports', description: 'Get notified when a report is ready.' },
                { key: 'sessions' as const, label: 'Live session alerts', description: 'Alert when a candidate starts an interview.' },
              ].map(({ key, label, description }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                  </div>
                  <Toggle
                    checked={notifications[key]}
                    onChange={() => setNotifications((n) => ({ ...n, [key]: !n[key] }))}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-2">Billing</h2>
            <p className="text-sm text-gray-600 mb-4">
              Current plan: <span className="font-semibold text-gray-900">Growth</span>
            </p>
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Interviews used</span>
                <span>32 / 50</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '64%' }} />
              </div>
            </div>
            <Button variant="secondary" size="sm">Upgrade plan</Button>
          </section>

          <section className="bg-white rounded-xl border border-red-200 shadow-sm p-6">
            <h2 className="font-semibold text-red-700 mb-2">Danger Zone</h2>
            <p className="text-sm text-gray-600 mb-4">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
            <Input
              label='Type "DELETE" to confirm'
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
            />
            <div className="mt-3">
              <Button
                variant="danger"
                size="sm"
                disabled={deleteConfirm !== 'DELETE'}
              >
                Delete account
              </Button>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}
