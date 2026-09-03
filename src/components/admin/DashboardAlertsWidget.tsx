import React, { useEffect, useState } from 'react';
import { AlertTriangle, BellRing, CircleAlert } from 'lucide-react';
import { metricService, type DashboardAlert } from '../../services/metricService';
import { tenantService } from '../../services/tenantService';
import { Badge, Card, SectionTitle } from '../common/DesignSystem';

export const DashboardAlertsWidget: React.FC = () => {
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);

  useEffect(() => {
    let active = true;
    tenantService.getSnapshot().then(async snapshot => {
      if (!snapshot) return;
      const results = await Promise.all(snapshot.hotels.map(async hotel => {
        try { await metricService.refreshAlerts(hotel.id); return metricService.alerts(hotel.id); } catch { return []; }
      }));
      if (active) setAlerts(results.flat().sort((a,b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 12));
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  return (
    <Card padding="md" className="mt-4">
      <SectionTitle
        title="Alertas gerenciais"
        description="Alertas derivados dos dados operacionais oficiais."
        actions={<Badge>{alerts.length} ativos</Badge>}
      />

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {alerts.length === 0 ? (
          <Card tone="muted" padding="sm" className="text-xs text-stone-500">
            Nenhum alerta ativo no escopo autorizado.
          </Card>
        ) : alerts.map(alert => (
          <Card key={alert.id} tone="muted" padding="sm" className="flex gap-3 shadow-none">
            <span className={alert.severity === 'CRITICAL' ? 'text-rose-600' : 'text-amber-600'}>
              {alert.severity === 'CRITICAL'
                ? <CircleAlert className="h-4 w-4" aria-hidden="true" />
                : <AlertTriangle className="h-4 w-4" aria-hidden="true" />}
            </span>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                <BellRing className="h-3.5 w-3.5 text-stone-400" aria-hidden="true" />
                {alert.title}
              </div>
              <div className="mt-1 text-[11px] text-stone-500">{alert.description}</div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
};
