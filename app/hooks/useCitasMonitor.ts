import { useState, useEffect, useCallback } from 'react';

interface TimeSlot {
  time: string;
  freeSlots: number;
}

interface AvailableDate {
  date: string;
  timesCount: number;
  totalFreeSlots: number;
  times: Array<{ time: string; freeSlots: number }>;
}

interface AvailabilityData {
  availableDates: AvailableDate[];
  totalAvailableSlots: number;
  totalAvailableDates: number;
  lastUpdated: string;
}

export function useCitasMonitor(autoRefresh = false, refreshInterval = 240000) { // 4 minutos por defecto
  const [availability, setAvailability] = useState<AvailabilityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCheck, setLastCheck] = useState<string | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(autoRefresh);

  const checkCitas = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/citas?start=2025-10-01&end=2025-10-31');
      const data = await response.json();
      
      if (data.success) {
        setAvailability(data.availability);
        setLastCheck(new Date().toLocaleString('es-ES'));
        
        // Notificar si hay citas disponibles
        if (data.availability.totalAvailableSlots > 0) {
          notifyNewCitas(data.availability);
        }
      } else {
        setError(data.error || 'Error al obtener las citas');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const notifyNewCitas = (data: AvailabilityData) => {
    // Notificación del navegador
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🎉 ¡Nuevas Citas Disponibles!', {
        body: `Se encontraron ${data.totalAvailableSlots} citas en ${data.totalAvailableDates} días diferentes`,
        icon: '/favicon.ico',
        tag: 'citas-notification'
      });
    }
    
    // Notificación en consola
    console.log('🎉 ¡Nuevas citas disponibles!', data);
  };

  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled);
  };

  // Efecto para auto-refresh
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(checkCitas, refreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefreshEnabled, refreshInterval, checkCitas]);

  // Solicitar permisos de notificación al montar
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return {
    availability,
    loading,
    error,
    lastCheck,
    autoRefreshEnabled,
    checkCitas,
    toggleAutoRefresh
  };
}
