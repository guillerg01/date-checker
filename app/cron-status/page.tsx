"use client";

import { useState, useEffect } from "react";

interface CronStatus {
  success: boolean;
  alert: boolean;
  message: string;
  futureDates?: string[];
  titleTexts?: string[];
  emailSent?: boolean;
  timestamp: string;
}

export default function CronStatusPage() {
  const [status, setStatus] = useState<CronStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const checkCronStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/cron-check-dates");
      const data = await response.json();
      setStatus(data);
      setLastChecked(new Date().toLocaleString("es-ES"));
    } catch (error) {
      setStatus({
        success: false,
        alert: false,
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Verificar automáticamente al cargar la página
    checkCronStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            🔄 Estado del Cron Job
          </h1>
          <p className="text-gray-600 mb-6">
            Monitoreo automático de fechas posteriores al 31 de julio de 2025.
            Se ejecuta cada 2 minutos automáticamente.
          </p>

          <div className="flex gap-4 mb-6">
            <button
              onClick={checkCronStatus}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {loading ? "Verificando..." : "Verificar Ahora"}
            </button>

            {lastChecked && (
              <div className="text-sm text-gray-500 self-center">
                Última verificación: {lastChecked}
              </div>
            )}
          </div>
        </div>

        {status && (
          <div className="space-y-6">
            {/* Estado del Cron */}
            <div
              className={`bg-white rounded-lg shadow-lg p-6 border-l-4 ${
                status.success && status.alert
                  ? "border-red-500"
                  : status.success
                  ? "border-green-500"
                  : "border-red-500"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`text-2xl ${
                    status.success && status.alert
                      ? "text-red-500"
                      : status.success
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {status.success && status.alert
                    ? "🚨"
                    : status.success
                    ? "✅"
                    : "❌"}
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Estado del Cron Job
                </h2>
              </div>

              <div>
                <p
                  className={`text-lg font-medium mb-2 ${
                    status.success && status.alert
                      ? "text-red-600"
                      : status.success
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {status.message}
                </p>

                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <p>
                    <strong>Timestamp:</strong>{" "}
                    {new Date(status.timestamp).toLocaleString("es-ES")}
                  </p>
                  {status.emailSent !== undefined && (
                    <p>
                      <strong>Email enviado:</strong>{" "}
                      {status.emailSent ? "✅ Sí" : "❌ No"}
                    </p>
                  )}
                </div>

                {/* Fechas encontradas */}
                {status.futureDates && status.futureDates.length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="text-red-800 font-medium mb-2">
                      🚨 Fechas Posteriores al 31 de Julio Encontradas:
                    </h3>
                    <ul className="text-sm space-y-1">
                      {status.futureDates.map((dateInfo, index) => (
                        <li key={index} className="text-red-700">
                          • {dateInfo}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Títulos analizados */}
                {status.titleTexts && status.titleTexts.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-blue-800 font-medium mb-2">
                      📋 Títulos Analizados ({status.titleTexts.length}):
                    </h3>
                    <div className="max-h-32 overflow-y-auto">
                      <ul className="text-sm space-y-1">
                        {status.titleTexts.map((title, index) => (
                          <li key={index} className="text-blue-700">
                            • {title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Información del Sistema */}
        <div className="bg-purple-50 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-purple-800 mb-3">
            ℹ️ Información del Sistema
          </h3>
          <ul className="text-purple-700 space-y-2 text-sm">
            <li>• El cron job se ejecuta automáticamente cada 2 minutos</li>
            <li>• Verifica la página del consulado español en La Habana</li>
            <li>
              • Busca fechas posteriores al 31 de julio de 2025 en títulos
            </li>
            <li>• Envía email de alerta si encuentra fechas futuras</li>
            <li>• Los logs se pueden ver en el dashboard de Vercel</li>
            <li>• Esta página permite verificar manualmente el estado</li>
          </ul>
        </div>

        {/* Configuración */}
        <div className="bg-yellow-50 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">
            ⚙️ Configuración Requerida
          </h3>
          <ul className="text-yellow-700 space-y-2 text-sm">
            <li>• Configurar variables de entorno en Vercel</li>
            <li>• EMAIL_USER: Email de Gmail para enviar alertas</li>
            <li>• EMAIL_PASS: Contraseña de aplicación de Gmail</li>
            <li>• NOTIFICATION_EMAIL: Email donde recibir notificaciones</li>
            <li>• Ver archivo CRON_SETUP.md para instrucciones detalladas</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
