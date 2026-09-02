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
import { fetchUserOperationalSectorsState } from './services/userSectorService';
import { OperationalSectorId } from './domain/operationalSectors';
import { getNovoHotelOperationalRouteForSectors } from './navigation/novohotelRoutes';
import { WorkspaceCompatibilityFallback } from './workspace-engine/WorkspaceCompatibilityFallback';

const NovoHotelAuthenticatedRouter: React.FC = () => {
  const { currentUser, hotelConfig, setAdminActiveTab } = useHotel();
  const [sectorIds, setSectorIds] = useState<OperationalSectorId[]>([]);
  const [sectorsLoading, setSectorsLoading] = useState(true);
  const role = currentUser?.tipo_usuario || '';
  const management = role === 'admin' || role === 'gerente';
  const stableOperationalRoute = !management && !sectorsLoading
    ? getNovoHotelOperationalRouteForSectors(sectorIds)
    : null;

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
    if (!stableOperationalRoute?.legacyAdminTab) return;
    setAdminActiveTab(stableOperationalRoute.legacyAdminTab);
  }, [stableOperationalRoute?.legacyAdminTab, setAdminActiveTab]);

  if (management) return <AdminLayout />;
  if (sectorsLoading) return <div className="min-h-screen grid place-items-center bg-slate-100 text-slate-600 text-sm font-bold">Carregando ambiente operacional…</div>;

  // Áreas com tela operacional direta não passam mais pela infraestrutura da
  // Fábrica. Apenas setores ainda sem rota estável chegam ao fallback legado.
  if (stableOperationalRoute?.id === 'governanca') return <GovernancaDirectPage />;
  if (stableOperationalRoute?.id === 'manutencao') return <MaintenanceModule />;
  if (stableOperationalRoute?.legacyAdminTab) return <AdminLayout />;

  return <WorkspaceCompatibilityFallback
    userId={currentUser?.id}
    sectorIds={sectorIds}
    hotelId={hotelConfig?.id}
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
  return <HotelProvider><FrigobarProvider><MainContent /></FrigobarProvider></HotelProvider>;
}
