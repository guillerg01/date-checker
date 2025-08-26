"use client";

import { useCitasMonitor } from "../hooks/useCitasMonitor";
import { useState } from "react";

export default function CitasPage() {
  const {
    availability,
    loading,
    error,
    lastCheck,
    autoRefreshEnabled,
    checkCitas,
    toggleAutoRefresh,
  } = useCitasMonitor();

  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const testAPI = async () => {
    setTesting(true);
    try {
      const response = await fetch("/api/test-citas");
      const data = await response.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({ success: false, error: "Error testing API" });
    } finally {
      setTesting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            📅 Monitor de Citas Consulares - Octubre 2025
          </h1>

          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <button
              onClick={checkCitas}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {loading ? "🔄 Verificando..." : "🔍 Verificar Citas"}
            </button>

            <button
              onClick={toggleAutoRefresh}
              className={`px-4 py-3 rounded-lg font-semibold transition-colors ${
                autoRefreshEnabled
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-600 hover:bg-gray-700 text-white"
              }`}
            >
              {autoRefreshEnabled
                ? "⏸️ Pausar Auto-refresh"
                : "▶️ Activar Auto-refresh"}
            </button>

            <button
              onClick={testAPI}
              disabled={testing}
              className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
            >
              {testing ? "🧪 Probando..." : "🧪 Probar API"}
            </button>

            {lastCheck && (
              <span className="text-gray-600">
                Última verificación: {lastCheck}
              </span>
            )}
          </div>

          {autoRefreshEnabled && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              ✅ Auto-refresh activado - Verificando cada 4 minutos
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              ❌ {error}
            </div>
          )}

          {testResult && (
            <div
              className={`border rounded-lg p-4 mb-4 ${
                testResult.success
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <h3 className="font-semibold mb-2">🧪 Resultado de Prueba API</h3>
              <div className="text-sm space-y-2">
                <p>
                  <strong>Estado:</strong>{" "}
                  {testResult.success ? "✅ Éxito" : "❌ Error"}
                </p>
                {testResult.test && (
                  <>
                    <p>
                      <strong>Método de parsing:</strong>{" "}
                      {testResult.test.parseMethod}
                    </p>
                    <p>
                      <strong>Patrón callback:</strong>{" "}
                      {testResult.test.callbackPattern}
                    </p>
                    <p>
                      <strong>Longitud respuesta:</strong>{" "}
                      {testResult.test.responseLength}
                    </p>
                    <details className="mt-2">
                      <summary className="cursor-pointer font-medium">
                        Ver respuesta completa
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                        {testResult.test.rawResponse}
                      </pre>
                    </details>
                  </>
                )}
                {testResult.error && (
                  <p className="text-red-600">
                    <strong>Error:</strong> {testResult.error}
                  </p>
                )}
              </div>
            </div>
          )}

          {availability && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-800">
                  {availability.totalAvailableDates}
                </div>
                <div className="text-green-600">Días Disponibles</div>
              </div>

              <div className="bg-blue-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-800">
                  {availability.totalAvailableSlots}
                </div>
                <div className="text-blue-600">Citas Totales</div>
              </div>

              <div className="bg-purple-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-800">
                  {availability.availableDates.reduce(
                    (sum, date) => sum + date.timesCount,
                    0
                  )}
                </div>
                <div className="text-purple-600">Horarios Disponibles</div>
              </div>
            </div>
          )}
        </div>

        {availability && availability.availableDates.length > 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              📋 Fechas con Citas Disponibles
            </h2>

            <div className="space-y-4">
              {availability.availableDates.map((dateInfo) => (
                <div
                  key={dateInfo.date}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {formatDate(dateInfo.date)}
                    </h3>
                    <div className="flex items-center gap-4">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {dateInfo.timesCount} horarios
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {dateInfo.totalFreeSlots} citas
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {dateInfo.times.map((time, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-2 rounded text-center"
                      >
                        <div className="font-medium text-gray-900">
                          {time.time}
                        </div>
                        <div className="text-sm text-gray-600">
                          {time.freeSlots} disponibles
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : availability ? (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No hay citas disponibles
            </h2>
            <p className="text-gray-600">
              No se encontraron citas disponibles para octubre 2025.
            </p>
          </div>
        ) : null}

        {availability && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              📊 Información del Sistema
            </h2>
            <div className="text-sm text-gray-600">
              <p>
                Última actualización:{" "}
                {new Date(availability.lastUpdated).toLocaleString("es-ES")}
              </p>
              <p>Total de días monitoreados: 31 (octubre completo)</p>
              <p>
                Estado:{" "}
                {availability.totalAvailableSlots > 0
                  ? "🟢 Citas disponibles"
                  : "🔴 Sin citas"}
              </p>
              <p>
                Auto-refresh:{" "}
                {autoRefreshEnabled
                  ? "🟢 Activado (cada 4 min)"
                  : "🔴 Desactivado"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
