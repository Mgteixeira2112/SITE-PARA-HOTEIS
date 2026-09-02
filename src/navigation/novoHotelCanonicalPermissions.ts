import type { NovoHotelRouteId } from './novohotelRoutes';

/**
 * Permissões de visualização já existentes no RBAC canônico do Supabase.
 *
 * O mapa é propositalmente parcial: quando uma rota ainda não possui uma
 * permissão equivalente no catálogo `hotel_permissions`, o acesso continua
 * sendo decidido pela camada de compatibilidade até que o contrato do banco
 * seja ampliado de forma explícita.
 */
export const NOVOHOTEL_CANONICAL_VIEW_PERMISSIONS: Partial<Record<NovoHotelRouteId, string>> = {
  reservas: 'reservations.view',
  recepcao: 'reservations.view',
  governanca: 'housekeeping.view',
  manutencao: 'maintenance.view',
  pdv: 'pos.view',
  financeiro: 'finance.view',
};

export const getNovoHotelCanonicalViewPermission = (routeId: NovoHotelRouteId): string | null =>
  NOVOHOTEL_CANONICAL_VIEW_PERMISSIONS[routeId] || null;
