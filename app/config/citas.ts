export const CITAS_CONFIG = {
  // Configuración de la API
  API_BASE_URL: 'https://www.citaconsular.es/onlinebookings/datetime/',
  PUBLIC_KEY: '22091b5b8d43b89fb226cabb272a844f9',
  SERVICE_ID: 'bkt932613',
  AGENDA_ID: 'bkt322861',
  
  // Configuración de fechas
  DEFAULT_START_DATE: '2025-10-01',
  DEFAULT_END_DATE: '2025-10-31',
  
  // Configuración del monitoreo
  AUTO_REFRESH_INTERVAL: 240000, // 4 minutos en milisegundos
  DEFAULT_AUTO_REFRESH: false, // No activar por defecto
  
  // Configuración de notificaciones
  ENABLE_BROWSER_NOTIFICATIONS: true,
  NOTIFICATION_ICON: '/favicon.ico',
  
  // Headers para la API
  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  
  // Parámetros de la API
  API_PARAMS: {
    type: 'default',
    lang: 'es',
    version: '5',
    selectedPeople: '1'
  }
} as const;

export const getApiUrl = (startDate: string, endDate: string) => {
  // Generar un callback único para cada request
  const timestamp = Date.now();
  const callback = `jQuery${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
  
  const params = new URLSearchParams({
    ...CITAS_CONFIG.API_PARAMS,
    callback,
    publickey: CITAS_CONFIG.PUBLIC_KEY,
    'services[]': CITAS_CONFIG.SERVICE_ID,
    'agendas[]': CITAS_CONFIG.AGENDA_ID,
    start: startDate,
    end: endDate,
    src: 'https://www.citaconsular.es/es/hosteds/widgetdefault/22091b5b8d43b89fb226cabb272a844f9/',
    srvsrc: 'https://citaconsular.es',
    _: timestamp.toString() // Timestamp para evitar cache
  });
  
  return `${CITAS_CONFIG.API_BASE_URL}?${params.toString()}`;
};
