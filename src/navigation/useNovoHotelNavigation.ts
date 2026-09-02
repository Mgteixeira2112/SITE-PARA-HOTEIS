import { useNovoHotelNavigationContext } from './NovoHotelNavigationContext';

/**
 * Entrada canônica de navegação do NovoHotel.
 *
 * O estado principal vive em NovoHotelNavigationProvider. O HotelContext
 * mantém adminActiveTab somente como espelho de compatibilidade temporário.
 */
export const useNovoHotelNavigation = () => useNovoHotelNavigationContext();
