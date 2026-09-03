import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/admin/AdminLayout';
import { OperationalSectorId } from '../domain/operationalSectors';
import { resolveWorkspaceForUserAndSectors } from './registry';
import { WorkspaceRuntime } from './WorkspaceRuntime';
import {
  DEFAULT_WORKSPACE_HOTEL_ID,
  hydrateWorkspaceOverridesFromSupabase,
  subscribeWorkspaceConfig,
} from './workspaceConfigStore';

interface WorkspaceCompatibilityFallbackProps {
  userId?: string;
  sectorIds: OperationalSectorId[];
  hotelId?: string;
}

/**
 * Camada de compatibilidade temporária para áreas operacionais que ainda não
 * possuem uma rota direta do NovoHotel. Toda hidratação, assinatura e resolução
 * pela Fábrica fica confinada aqui para não contaminar o router principal.
 */
export const WorkspaceCompatibilityFallback: React.FC<WorkspaceCompatibilityFallbackProps> = ({
  userId,
  sectorIds,
  hotelId = DEFAULT_WORKSPACE_HOTEL_ID,
}) => {
  const [ready, setReady] = useState(false);
  const [, setRevision] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    void hydrateWorkspaceOverridesFromSupabase(hotelId).then(() => {
      if (!cancelled) setReady(true);
    }).catch(() => {
      if (!cancelled) setReady(true);
    });
    return () => { cancelled = true; };
  }, [hotelId]);

  useEffect(() => subscribeWorkspaceConfig(() => {
    setRevision(current => current + 1);
  }), []);

  if (!ready) {
    return <div className="min-h-screen grid place-items-center bg-slate-100 text-slate-600 text-sm font-bold">Carregando compatibilidade do ambiente…</div>;
  }

  const workspace = resolveWorkspaceForUserAndSectors(userId, sectorIds, hotelId);
  if (workspace) return <WorkspaceRuntime definition={workspace} />;
  return <AdminLayout />;
};
