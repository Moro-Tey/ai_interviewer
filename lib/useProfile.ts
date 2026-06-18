// lib/useProfile.ts
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

// Base URL points directly to your Render backend backend (or localhost during development)
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function useProfile(redirectIfMissing = true) {
  const { getToken, isSignedIn } = useAuth();
  const router = useRouter();
  
  const [hasName, setHasName] = useState<boolean | null>(null);
  const [hasCompany, setHasCompany] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isMounted = useRef<boolean>(true);

  // Keep track of component mount state to prevent updates on unmounted components
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    async function checkProfile() {
      // If user isn't logged into Clerk, skip request and mark as missing profile details
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
        // 1. Fetch user data directly from Render backend
        const userRes = await fetch(`${API_BASE}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userRes.ok) {
          console.error(`useProfile: /api/users/me returned ${userRes.status}`);
          throw new Error(`HTTP ${userRes.status}`);
        }
        const userData = await userRes.json();
        const hasNameValue = !!userData.user?.name;
        setHasName(hasNameValue);

        // 2. Fetch company data directly from Render backend
        const companyRes = await fetch(`${API_BASE}/api/companies/me`, {
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
        // Fallback state on network/server errors
        if (isMounted.current) {
          setHasName(false);
          setHasCompany(false);
          setLoading(false);
        }
      }
    }

    checkProfile();
  }, [isSignedIn, getToken]);

  // Handle automatic routing if profile details are missing
  useEffect(() => {
    if (redirectIfMissing && !loading && (!hasName || !hasCompany)) {
      router.push('/settings');
    }
  }, [hasName, hasCompany, loading, redirectIfMissing, router]);

  return { hasName, hasCompany, loading };
}