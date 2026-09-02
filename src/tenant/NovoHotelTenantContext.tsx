import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  novoHotelTenantContextService,
  type NovoHotelTenantContext,
} from '../services/novoHotelTenantContextService';

interface NovoHotelTenantContextValue {
  tenant: NovoHotelTenantContext | null;
  loading: boolean;
  error: string | null;
  refreshTenant: () => Promise<NovoHotelTenantContext | null>;
}

const TenantContext = createContext<NovoHotelTenantContextValue | null>(null);

export const NovoHotelTenantProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [tenant, setTenant] = useState<NovoHotelTenantContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTenant = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resolved = await novoHotelTenantContextService.getActiveTenant();
      setTenant(resolved);
      return resolved;
    } catch (err) {
      setTenant(null);
      setError(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshTenant();
  }, [refreshTenant]);

  const value = useMemo<NovoHotelTenantContextValue>(() => ({
    tenant,
    loading,
    error,
    refreshTenant,
  }), [tenant, loading, error, refreshTenant]);

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

export const useNovoHotelTenant = () => {
  const context = useContext(TenantContext);
  if (!context) throw new Error('useNovoHotelTenant must be used within NovoHotelTenantProvider');
  return context;
};
