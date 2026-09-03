import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useHotel } from '../context/HotelContext';
import type { AdminTab } from '../types';
import {
  getCompatibilityTabForNovoHotelRoute,
  getNovoHotelRouteIdFromCompatibilityTab,
  type NovoHotelCompatibilityTab,
} from './novoHotelLegacyNavigationBridge';
import type { NovoHotelRouteId } from './novohotelRoutes';

interface NovoHotelNavigationContextValue {
  activeRouteId: NovoHotelRouteId | null;
  activeCompatibilityTab: NovoHotelCompatibilityTab;
  navigateToRoute: (routeId: NovoHotelRouteId) => boolean;
  navigateToCompatibilityTab: (tab: NovoHotelCompatibilityTab) => void;
}

const NovoHotelNavigationContext = createContext<NovoHotelNavigationContextValue | undefined>(undefined);

/**
 * Estado canônico de navegação do NovoHotel.
 *
 * NovoHotelRouteId é a identidade principal. adminActiveTab permanece apenas
 * como espelho temporário para telas legadas que ainda dependem do HotelContext.
 */
export const NovoHotelNavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { adminActiveTab, setAdminActiveTab } = useHotel();
  const activeCompatibilityTab = adminActiveTab as NovoHotelCompatibilityTab;
  const [activeRouteId, setActiveRouteId] = useState<NovoHotelRouteId | null>(() =>
    getNovoHotelRouteIdFromCompatibilityTab(activeCompatibilityTab),
  );

  useEffect(() => {
    const routeId = getNovoHotelRouteIdFromCompatibilityTab(activeCompatibilityTab);
    setActiveRouteId(current => current === routeId ? current : routeId);
  }, [activeCompatibilityTab]);

  const navigateToRoute = useCallback((routeId: NovoHotelRouteId) => {
    const compatibilityTab = getCompatibilityTabForNovoHotelRoute(routeId);

    setActiveRouteId(routeId);

    if (compatibilityTab) {
      setAdminActiveTab(compatibilityTab as AdminTab);
    }

    return true;
  }, [setAdminActiveTab]);

  const navigateToCompatibilityTab = useCallback((tab: NovoHotelCompatibilityTab) => {
    setActiveRouteId(getNovoHotelRouteIdFromCompatibilityTab(tab));
    setAdminActiveTab(tab as AdminTab);
  }, [setAdminActiveTab]);

  return (
    <NovoHotelNavigationContext.Provider value={{
      activeRouteId,
      activeCompatibilityTab,
      navigateToRoute,
      navigateToCompatibilityTab,
    }}>
      {children}
    </NovoHotelNavigationContext.Provider>
  );
};

export const useNovoHotelNavigationContext = (): NovoHotelNavigationContextValue => {
  const context = useContext(NovoHotelNavigationContext);
  if (!context) {
    throw new Error('useNovoHotelNavigationContext deve ser usado dentro de NovoHotelNavigationProvider');
  }
  return context;
};
