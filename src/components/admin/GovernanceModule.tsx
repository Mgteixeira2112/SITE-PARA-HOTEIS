import React from 'react';
import { WorkspaceRuntime } from '../../workspace-engine/WorkspaceRuntime';
import { createOfficialWorkspaceDefinition } from '../../workspace-engine/workspaceOfficialFactory';
import { SectionTitle } from '../common/DesignSystem';

const governanceWorkspace = createOfficialWorkspaceDefinition('workspace-governanca');

/**
 * Tela operacional direta de Governança do NovoHotel.
 * Mantém a composição oficial existente (métricas, kanban, alertas e ações)
 * enquanto a Fábrica de Workspaces continua disponível como fallback técnico.
 */
export const GovernanceModule: React.FC = () => (
  <section className="space-y-4" data-novohotel-governance-module>
    <SectionTitle
      title="Governança"
      description="Operação de quartos, limpeza, vistoria e tarefas do setor."
    />

    <WorkspaceRuntime definition={governanceWorkspace} />
  </section>
);
