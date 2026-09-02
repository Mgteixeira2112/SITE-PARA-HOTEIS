import { useCallback, useMemo } from 'react';
import { useHotel } from '../context/HotelContext';
import type { AdminTab } from '../types';
import {
  getCompatibilityTabForNovoHotelRoute,
  getNovoHotelRouteIdFromCompatibilityTab,
  type NovoHotelCompatibilityTab,
} from './novoHotelLegacyNavigationBridge';
import type { NovoHotelRouteId } from './novohotelRoutes';

/**
 * Entrada canônica de navegação do NovoHotel.
 *
 * As telas novas trabalham apenas com NovoHotelRouteId. O espelhamento no
 * estado legado de abas fica confinado aqui enquanto o HotelContext ainda
 * mantiver adminActiveTab/setAdminActiveTab por compatibilidade.
 */
export const useNovoHotelNavigation = () => {
  const { adminActiveTab, setAdminActiveTab } = useHotel();
  const activeCompatibilityTab = adminActiveTab as NovoHotelCompatibilityTab;
  const activeRouteId = useMemo(
    () => getNovoHotelRouteIdFromCompatibilityTab(activeCompatibilityTab),
    [activeCompatibilityTab],
  );

  const navigateToRoute = useCallback((routeId: NovoHotelRouteId) => {
    const compatibilityTab = getCompatibilityTabForNovoHotelRoute(routeId);
    if (!compatibilityTab) return false;
    setAdminActiveTab(compatibilityTab as AdminTab);
    return true;
  }, [setAdminActiveTab]);

  const navigateToCompatibilityTab = useCallback((tab: NovoHotelCompatibilityTab) => {
    setAdminActiveTab(tab as AdminTab);
  }, [setAdminActiveTab]);

  return {
    activeRouteId,
    activeCompatibilityTab,
    navigateToRoute,
    navigateToCompatibilityTab,
  };
};
