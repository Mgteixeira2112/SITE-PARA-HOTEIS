import { useEffect, useState } from 'react';
import { useNovoHotelTenant } from '../../../tenant/NovoHotelTenantContext';
import {
  loadOperationalRevenueSummary,
  type OperationalRevenueSummary,
} from '../../../services/financialReportingService';

const EMPTY_SUMMARY: OperationalRevenueSummary = {
  grossPayments: 0,
  refunds: 0,
  netReceived: 0,
  paymentCount: 0,
  byMethod: {
    pix: 0,
    creditCard: 0,
    debitCard: 0,
    other: 0,
  },
};

export function useOperationalRevenueUi(preferredHotelId?: string | null) {
  const { tenant, loading: tenantLoading } = useNovoHotelTenant();
  const [summary, setSummary] = useState<OperationalRevenueSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const resolvedHotelId = preferredHotelId?.trim() || tenant?.hotelId || null;

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!resolvedHotelId) {
        if (tenantLoading) return;
        if (active) {
          setSummary(EMPTY_SUMMARY);
          setError('OPERATIONAL_REVENUE_TENANT_NOT_FOUND');
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const nextSummary = await loadOperationalRevenueSummary(resolvedHotelId);
        if (active) setSummary(nextSummary);
      } catch (loadError) {
        if (!active) return;
        setSummary(EMPTY_SUMMARY);
        setError(loadError instanceof Error ? loadError.message : 'OPERATIONAL_REVENUE_LOAD_FAILED');
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [resolvedHotelId, tenantLoading]);

  return {
    ...summary,
    loading,
    error,
  };
}
