// lib/useCompany.ts
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export function useCompany(redirectIfMissing = true) {
  const { getToken, isSignedIn } = useAuth();
  const router = useRouter();
  const [hasCompany, setHasCompany] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    async function checkCompany() {
      if (!isSignedIn) {
        if (isMounted.current) {
          setHasCompany(false);
          setLoading(false);
        }
        return;
      }

      try {
        const token = await getToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/companies/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!isMounted.current) return;

        if (res.ok) {
          const data = await res.json();
          setHasCompany(!!data.company);
        } else {
          setHasCompany(false);
        }
      } catch (err) {
        console.error(err);
        if (isMounted.current) setHasCompany(false);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    }

    checkCompany();
  }, [isSignedIn, getToken]);

  useEffect(() => {
    if (redirectIfMissing && hasCompany === false && !loading) {
      router.push('/settings');
    }
  }, [hasCompany, loading, redirectIfMissing, router]);

  return { hasCompany, loading };
}