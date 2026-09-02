import React, { useEffect, useState } from 'react';
import { HotelProvider, useHotel } from './context/HotelContext';
import { FrigobarProvider } from './context/FrigobarContext';
import { Navbar } from './components/navigation/Navbar';
import { HeroSection } from './components/landing/HeroSection';
import { RoomsShowcase } from './components/landing/RoomsShowcase';
import { AmenitiesSection } from './components/landing/AmenitiesSection';
import { AboutSection } from './components/landing/AboutSection';
import { LocationSection } from './components/landing/LocationSection';
import { TestimonialsSection } from './components/landing/TestimonialsSection';
import { FaqSection } from './components/landing/FaqSection';
import { ContactSection } from './components/landing/ContactSection';
import { Footer } from './components/landing/Footer';
import { FloatingWhatsapp } from './components/landing/FloatingWhatsapp';
import { BookingModal } from './components/booking/BookingModal';
import { AdminLayout } from './components/admin/AdminLayout';
import { MaintenanceModule } from './components/admin/MaintenanceModule';
import { AdminLogin } from './components/auth/AdminLogin';
import { SecurityVerificationModal } from './components/security/SecurityVerificationModal';
import { ConnectionStatus } from './components/device/ConnectionStatus';
import { GovernancaDirectPage } from './modules/governanca/GovernancaDirectPage';
import { OperacaoGeralDirectPage } from './modules/operacao/OperacaoGeralDirectPage';
import { fetchUserOperationalSectorsState } from './services/userSectorService';
import { OperationalSectorId } from './domain/operationalSectors';
import { getNovoHotelOperationalRouteForSectors } from './navigation/novohotelRoutes';
import { NovoHotelNavigationProvider } from './navigation/NovoHotelNavigationContext';
import { resolveNovoHotelRouteAccess } from './navigation/resolveNovoHotelRouteAccess';
import { useNovoHotelCanonicalRouteAccess } from './navigation/useNovoHotelCanonicalRouteAccess';
import { useNovoHotelNavigation } from './navigation/useNovoHotelNavigation';
import { NovoHotelTenantProvider, useNovoHotelTenant } from './tenant/NovoHotelTenantContext';
import { WorkspaceCompatibilityFallback } from './workspace-engine/WorkspaceCompatibilityFallback';

const NovoHotelAuthenticatedRouter: React.FC = () => {
  const { currentUser, hotelConfig, hasTabAccess } = useHotel();
  const { tenant } = useNovoHotelTenant();
  const { navigateToRoute } = useNovoHotelNavigation();
  const { getCanonicalDecision, loading: canonicalAccessLoading } = useNovoHotelCanonicalRouteAccess();
  const [sectorIds, setSectorIds] = useState<OperationalSectorId[]>([]);
  const [sectorsLoading, setSectorsLoading] = useState(true);
  const role = currentUser?.tipo_usuario || 'recepcionista';
  const management = role === 'admin' || role === 'gerente';
  const stableOperationalRoute = !management && !sectorsLoading
    ? getNovoHotelOperationalRouteForSectors(sectorIds)
    : null;
  const stableRouteAccess = stableOperationalRoute
    ? resolveNovoHotelRouteAccess(
        stableOperationalRoute.id,
        role,
        hasTabAccess,
        getCanonicalDecision(stableOperationalRoute.id),
        canonicalAccessLoading,
      )
    : 'allowed';

  useEffect(() => {
    let cancelled = false;
    if (!currentUser?.id || management) {
      setSectorIds([]);
      setSectorsLoading(false);
      return () => { cancelled = true; };
    }

    setSectorsLoading(true);
    void fetchUserOperationalSectorsState(currentUser.id).then(state => {
      if (cancelled) return;
      setSectorIds(state.available ? state.assignment.sectorIds : []);
      setSectorsLoading(false);
    }).catch(() => {
      if (cancelled) return;
      setSectorIds([]);
      setSectorsLoading(false);
    });
    return () => { cancelled = true; };
  }, [currentUser?.id, management]);

  useEffect(() => {
    if (!stableOperationalRoute) return;
    navigateToRoute(stableOperationalRoute.id);
  }, [stableOperationalRoute?.id, navigateToRoute]);

  if (management) return <AdminLayout />;
  if (sectorsLoading || stableRouteAccess === 'loading') {
    return <div className="min-h-screen grid place-items-center bg-slate-100 text-slate-600 text-sm font-bold">Validando ambiente operacional…</div>;
  }
  if (stableOperationalRoute && stableRouteAccess === 'denied') {
    return <div className="min-h-screen grid place-items-center bg-slate-100 text-slate-700 text-sm font-bold">Acesso não autorizado para esta área operacional.</div>;
  }

  // Todas as áreas operacionais oficiais já possuem uma superfície direta.
  // O fallback permanece apenas como ponte defensiva para vínculos legados ou
  // dados incompletos que ainda não resolvam uma rota estável do NovoHotel.
  if (stableOperationalRoute?.id === 'dashboard') return <OperacaoGeralDirectPage />;
  if (stableOperationalRoute?.id === 'governanca') return <GovernancaDirectPage />;
  if (stableOperationalRoute?.id === 'manutencao') return <MaintenanceModule />;
  if (stableOperationalRoute?.legacyAdminTab) return <AdminLayout />;

  return <WorkspaceCompatibilityFallback
    userId={currentUser?.id}
    sectorIds={sectorIds}
    hotelId={tenant?.hotelId || hotelConfig?.id}
  />;
};

const MainContent: React.FC = () => {
  const { currentView, isAuthenticated } = useHotel();
  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 selection:bg-amber-500 selection:text-stone-950 font-sans">
      {currentView === 'landing' ? (
        <div className="flex flex-col min-h-screen relative">
          <Navbar /><main className="flex-1"><HeroSection /><RoomsShowcase /><AmenitiesSection /><AboutSection /><LocationSection /><TestimonialsSection /><FaqSection /><ContactSection /></main><Footer /><FloatingWhatsapp />
        </div>
      ) : !isAuthenticated ? <AdminLogin /> : <NovoHotelAuthenticatedRouter />}
      <BookingModal />
      <SecurityVerificationModal />
      <ConnectionStatus />
    </div>
  );
};

export default function App() {
  return (
    <HotelProvider>
      <NovoHotelTenantProvider>
        <NovoHotelNavigationProvider>
          <FrigobarProvider>
            <MainContent />
          </FrigobarProvider>
        </NovoHotelNavigationProvider>
      </NovoHotelTenantProvider>
    </HotelProvider>
  );
}
