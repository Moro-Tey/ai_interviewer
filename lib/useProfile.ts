// lib/useProfile.ts
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export function useProfile(redirectIfMissing = true) {
  const { getToken, isSignedIn } = useAuth();
  const router = useRouter();
  const [hasName, setHasName] = useState<boolean | null>(null);
  const [hasCompany, setHasCompany] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    async function checkProfile() {
      if (!isSignedIn) {
        if (isMounted.current) {
          setHasName(false);
          setHasCompany(false);
          setLoading(false);
        }
        return;
      }

      const token = await getToken();
      if (!token) {
        console.warn('useProfile: no token available');
        if (isMounted.current) setLoading(false);
        return;
      }

      try {
        // Fetch user
        const userRes = await fetch(`/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userRes.ok) {
          console.error(`useProfile: /api/users/me returned ${userRes.status}`);
          throw new Error(`HTTP ${userRes.status}`);
        }
        const userData = await userRes.json();
        const hasNameValue = !!userData.user?.name;
        setHasName(hasNameValue);

        // Fetch company
        const companyRes = await fetch(`/api/companies/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!companyRes.ok) {
          console.error(`useProfile: /api/companies/me returned ${companyRes.status}`);
          throw new Error(`HTTP ${companyRes.status}`);
        }
        const companyData = await companyRes.json();
        const hasCompanyValue = !!companyData.company;
        setHasCompany(hasCompanyValue);

        if (isMounted.current) setLoading(false);
      } catch (err) {
        console.error('useProfile fetch error:', err);
        // Do not set false on temporary errors – instead, keep loading true and retry?
        // For simplicity, set false but log clearly.
        if (isMounted.current) {
          setHasName(false);
          setHasCompany(false);
          setLoading(false);
        }
      }
    }

    checkProfile();
  }, [isSignedIn, getToken]);

  useEffect(() => {
    if (redirectIfMissing && !loading && (!hasName || !hasCompany)) {
      router.push('/settings');
    }
  }, [hasName, hasCompany, loading, redirectIfMissing, router]);

  return { hasName, hasCompany, loading };
}