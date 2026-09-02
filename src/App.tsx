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
import { GovernancaWorkspace } from './modules/governanca/GovernancaWorkspace';
import { fetchUserOperationalSectorsState } from './services/userSectorService';
import { OperationalSectorId } from './domain/operationalSectors';
import { getNovoHotelOperationalRouteForSectors } from './navigation/novohotelRoutes';
import { resolveWorkspaceForUserAndSectors } from './workspace-engine/registry';
import { WorkspaceRuntime } from './workspace-engine/WorkspaceRuntime';
import { createOfficialWorkspaceDefinition } from './workspace-engine/workspaceOfficialFactory';
import { DEFAULT_WORKSPACE_HOTEL_ID, hydrateWorkspaceOverridesFromSupabase, subscribeWorkspaceConfig } from './workspace-engine/workspaceConfigStore';

const governanceDirectDefinition = createOfficialWorkspaceDefinition('workspace-governanca');

const AuthenticatedWorkspaceRouter: React.FC = () => {
  const { currentUser, hotelConfig, setAdminActiveTab } = useHotel();
  const [sectorIds, setSectorIds] = useState<OperationalSectorId[]>([]);
  const [sectorsLoading, setSectorsLoading] = useState(true);
  const [workspaceReady, setWorkspaceReady] = useState(false);
  const [, setWorkspaceRevision] = useState(0);
  const role = currentUser?.tipo_usuario || '';
  const management = role === 'admin' || role === 'gerente';
  const hotelId = hotelConfig?.id || DEFAULT_WORKSPACE_HOTEL_ID;
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

  useEffect(() => {
    let cancelled = false;
    if (management || sectorsLoading || stableOperationalRoute) {
      setWorkspaceReady(true);
      return () => { cancelled = true; };
    }

    setWorkspaceReady(false);
    void hydrateWorkspaceOverridesFromSupabase(hotelId).then(() => {
      if (!cancelled) setWorkspaceReady(true);
    }).catch(() => {
      if (!cancelled) setWorkspaceReady(true);
    });
    return () => { cancelled = true; };
  }, [management, sectorsLoading, stableOperationalRoute?.id, hotelId]);

  // A configuração dinâmica da Fábrica só precisa invalidar o runtime quando
  // este router realmente caiu no caminho legado de compatibilidade. Áreas que
  // já possuem rota estável não assinam mais eventos globais de Workspace.
  useEffect(() => {
    if (management || sectorsLoading || stableOperationalRoute) return;
    return subscribeWorkspaceConfig(() => {
      setWorkspaceRevision(current => current + 1);
    });
  }, [management, sectorsLoading, stableOperationalRoute?.id]);

  if (management) return <AdminLayout />;
  if (sectorsLoading) return <div className="min-h-screen grid place-items-center bg-slate-100 text-slate-600 text-sm font-bold">Carregando ambiente operacional…</div>;

  // Áreas com tela operacional direta não precisam hidratar a Fábrica de
  // Workspaces para iniciar a sessão. Recepção/Cozinha usam módulos do
  // AdminLayout; Governança e Manutenção usam telas operacionais dedicadas.
  if (stableOperationalRoute?.id === 'governanca') return <GovernancaWorkspace definition={governanceDirectDefinition} />;
  if (stableOperationalRoute?.id === 'manutencao') return <MaintenanceModule />;
  if (stableOperationalRoute?.legacyAdminTab) return <AdminLayout />;

  if (!workspaceReady) return <div className="min-h-screen grid place-items-center bg-slate-100 text-slate-600 text-sm font-bold">Carregando compatibilidade do ambiente…</div>;
  const workspace = resolveWorkspaceForUserAndSectors(currentUser?.id, sectorIds, hotelId);
  if (workspace) return <WorkspaceRuntime definition={workspace} />;
  return <AdminLayout />;
};

const MainContent: React.FC = () => {
  const { currentView, isAuthenticated } = useHotel();
  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 selection:bg-amber-500 selection:text-stone-950 font-sans">
      {currentView === 'landing' ? (
        <div className="flex flex-col min-h-screen relative">
          <Navbar /><main className="flex-1"><HeroSection /><RoomsShowcase /><AmenitiesSection /><AboutSection /><LocationSection /><TestimonialsSection /><FaqSection /><ContactSection /></main><Footer /><FloatingWhatsapp />
        </div>
      ) : !isAuthenticated ? <AdminLogin /> : <AuthenticatedWorkspaceRouter />}
      <BookingModal />
      <SecurityVerificationModal />
      <ConnectionStatus />
    </div>
  );
};

export default function App() {
  return <HotelProvider><FrigobarProvider><MainContent /></FrigobarProvider></HotelProvider>;
}
