import React from 'react';
import { CertifiedFinancialOverviewWidget } from '../../workspace-engine/widgets/CertifiedFinancialOverviewWidget';
import { FinancialSummaryWidget } from '../../workspace-engine/widgets/FinancialSummaryWidget';
import { FinancialReceivablesWidget, FinancialPayablesWidget } from '../../workspace-engine/widgets/AdministrativeFinanceAccountWidgets';
import { FinancialTransactionsWidget } from '../../workspace-engine/widgets/FinancialTransactionsWidget';
import type { WorkspaceDefinition, WorkspaceWidgetDefinition } from '../../workspace-engine/types';

/**
 * Contexto estático de compatibilidade para os renderers financeiros existentes.
 *
 * A tela financeira do NovoHotel não carrega registry, Factory, overrides ou
 * WorkspaceRuntime. O objeto abaixo apenas preserva a assinatura temporária dos
 * renderers enquanto os componentes financeiros ainda recebem
 * WorkspaceWidgetRuntimeContext.
 */
const FINANCIAL_SCREEN_CONTEXT: WorkspaceDefinition = {
  id: 'novohotel-financeiro',
  name: 'Financeiro',
  description: 'Gestão financeira oficial do NovoHotel',
  sectors: [],
  layout: 'management',
  defaultScope: 'mine',
  widgets: [],
};

const widget = (id: string, type: WorkspaceWidgetDefinition['type'], title: string): WorkspaceWidgetDefinition => ({
  id,
  type,
  title,
  enabled: true,
  dataSource: 'finance',
});

const OVERVIEW = widget('novohotel-finance-overview', 'financial-overview', 'Visão Financeira Certificada');
const SUMMARY = widget('novohotel-finance-summary', 'financial-summary', 'Resumo Financeiro');
const RECEIVABLES = widget('novohotel-finance-receivables', 'financial-receivables', 'Contas a Receber');
const PAYABLES = widget('novohotel-finance-payables', 'financial-payables', 'Contas a Pagar');
const TRANSACTIONS = widget('novohotel-finance-transactions', 'financial-transactions', 'Transações Financeiras');

export const FinancialModule: React.FC = () => (
  <section className="space-y-4" data-novohotel-financial-module>
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">NovoHotel • Financeiro</p>
      <h2 className="mt-1 text-2xl font-black text-slate-950">Financeiro</h2>
      <p className="mt-1 text-xs text-slate-500">Receitas, contas e transações a partir das fontes financeiras oficiais do hotel.</p>
    </div>

    <CertifiedFinancialOverviewWidget workspace={FINANCIAL_SCREEN_CONTEXT} widget={OVERVIEW} />
    <FinancialSummaryWidget workspace={FINANCIAL_SCREEN_CONTEXT} widget={SUMMARY} />

    <div className="grid gap-4 xl:grid-cols-2">
      <FinancialReceivablesWidget workspace={FINANCIAL_SCREEN_CONTEXT} widget={RECEIVABLES} />
      <FinancialPayablesWidget workspace={FINANCIAL_SCREEN_CONTEXT} widget={PAYABLES} />
    </div>

    <FinancialTransactionsWidget workspace={FINANCIAL_SCREEN_CONTEXT} widget={TRANSACTIONS} />
  </section>
);
