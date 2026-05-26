import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { getCurrentAccess } from '@/api/marketplace';
import type { AccessInfo, AccessLevel } from '@/types';

interface AccessContextValue {
  access: AccessInfo | null;
  level: AccessLevel;
  loading: boolean;
  hasSellerAccess: boolean;
  hasAdminAccess: boolean;
  refreshAccess: () => Promise<void>;
}

const AccessContext = createContext<AccessContextValue | null>(null);

export function AccessProvider({ children }: { children: ReactNode }) {
  const [access, setAccess] = useState<AccessInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAccess = async () => {
    setLoading(true);
    try {
      setAccess(await getCurrentAccess());
    } catch {
      setAccess({ telegramUserId: null, level: 'BUYER' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshAccess();
  }, []);

  const value = useMemo<AccessContextValue>(() => {
    const level = access?.level ?? 'BUYER';
    const hasAdminAccess = level === 'ADMIN';
    const hasSellerAccess = level === 'SELLER' || hasAdminAccess;

    return {
      access,
      level,
      loading,
      hasSellerAccess,
      hasAdminAccess,
      refreshAccess,
    };
  }, [access, loading]);

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

export function useAccess() {
  const context = useContext(AccessContext);
  if (!context) {
    throw new Error('useAccess must be used inside AccessProvider');
  }
  return context;
}
