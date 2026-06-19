'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
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
  );
}

export default function SettingsPage() {
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  // Form states
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [hasCompany, setHasCompany] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [message, setMessage] = useState('');


  // Mock notification settings (you can implement later)
  const [notifications, setNotifications] = useState({
    email: true,
    reports: true,
    sessions: false,
  });

  const [deleteConfirm, setDeleteConfirm] = useState('');

  const loadData = async () => {
    try {
      if (!isSignedIn) {
        setLoading(false);
        return;
      }
      const token = await getToken();
      if (!token) {
        console.warn('No token available');
        setLoading(false);
        return;
      }

      // Fetch user name
      const userRes = await fetch(`${API_BASE}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userRes.ok) {
        const data = await userRes.json();
        setName(data.user.name || '');
      }

      // Fetch company
      const companyRes = await fetch(`${API_BASE}/api/companies/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (companyRes.ok) {
        const data = await companyRes.json();
        if (data.company) {
          setCompanyName(data.company.name);
          setHasCompany(true);
        } else {
          setHasCompany(false);
        }
      } else {
        setHasCompany(false);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);   // ← ALWAYS called
    }
  };

  // Load existing user name and company
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [isSignedIn, getToken]);

  // Save name to backend
  async function handleSaveName() {
    if (!name.trim()) return;
    setSavingName(true);
    const token = await getToken();
    if (!token) {
      setMessage('You must be logged in.');
      setSavingName(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/users/me/name`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to update name');
      await loadData();
      setMessage('Name saved!');


    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setSavingName(false);
      setTimeout(() => setMessage(''), 2000);
    }
  }

  // Create company (and link to user)
  async function handleCreateCompany() {
    if (!companyName.trim()) return;
    setSavingCompany(true);
    const token = await getToken();
    if (!token) {
      setMessage('You must be logged in.');
      setSavingCompany(false);
      return;
    }
    try {
      // 1. Create the company (POST /api/companies)
      const res = await fetch(`${API_BASE}/api/companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ companyName }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create company');
      }

      // 2. Immediately refetch the company to confirm the link was made
      const companyRes = await fetch(`/api/companies/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (companyRes.ok) {
        const data = await companyRes.json();
        if (data.company) {
          setCompanyName(data.company.name);
          setHasCompany(true);
        } else {
          setHasCompany(false);
        }
      } else {
        // If the fetch fails, we still assume creation succeeded but force a reload later
        setHasCompany(true);
      }
      await loadData();
      setMessage('Company created!');
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setSavingCompany(false);
      setTimeout(() => setMessage(''), 2000);
    }
  }

  // Redirect to dashboard if both name and company exist (optional, but nice)
  const isNameFilled = name.trim().length > 0;
  const isCompanyFilled = hasCompany === true;
  const ready = isNameFilled && isCompanyFilled;


  if (!userLoaded || loading) {
    return <DashboardLayout><div className="p-6">Loading...</div></DashboardLayout>;
  }


  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account and preferences.</p>
        </div>

        <div className="space-y-6">
          {/* Profile Section – Name Editing */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-5">Profile</h2>
            <div className="space-y-4">
              <Input
                label="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
              <Input
                label="Email address"
                value={user?.primaryEmailAddress?.emailAddress || ''}
                readOnly
                helperText="Managed by Clerk. Contact support to change your email."
              />
              <Button onClick={handleSaveName} disabled={savingName} variant="primary" size="sm">
                {savingName ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </section>

          {/* Company Section – Create or Show */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-5">Company</h2>
            {hasCompany ? (
              <div>
                <p className="text-sm text-gray-700">
                  Your company: <span className="font-medium">{companyName}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">Contact support to change company name.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Input
                  label="Company name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Inc."
                  required
                />
                <Button onClick={handleCreateCompany} disabled={savingCompany} variant="primary" size="sm">
                  {savingCompany ? 'Creating...' : 'Create Company'}
                </Button>
              </div>
            )}
          </section>
          {ready && (
            <div className="flex justify-center mt-6">
              <Button variant="primary" onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          )}

          {/* Change Password – Placeholder (use Clerk's built-in flows) */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-5">Change Password</h2>
            <p className="text-sm text-gray-500 mb-4">
              To change your password, use the Clerk account management page.
            </p>
            <Button variant="secondary" size="sm" onClick={() => window.open('https://accounts.clerk.com', '_blank')}>
              Manage Account
            </Button>
          </section>

          {/* Notifications (mock) */}
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

          {/* Billing (mock) */}
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

          {/* Danger Zone */}
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
        {message && <div className="mt-4 text-sm text-center text-green-600">{message}</div>}
        {ready && <div className="mt-4 text-center text-green-600">✅ All set! Redirecting to dashboard...</div>}
      </div>
    </DashboardLayout>
  );
}