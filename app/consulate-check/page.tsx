"use client";

import { useState, useEffect } from "react";

interface CheckResult {
  success: boolean;
  check?: {
    url: string;
    status: number;
    contentLength: number;
    titleTexts: string[];
    foundFutureDate: boolean;
    futureDates: string[];
    limitDate: string;
    pageTitle: string;
    pageH1: string;
    timestamp: string;
  };
  confidence?: {
    percentage: number;
    level: string;
    reason: string;
  };
  result?: {
    foundFutureDate: boolean;
    message: string;
  };
  error?: string;
}

export default function ConsulateCheckPage() {
  const [result, setResult] = useState<CheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [emailTestResult, setEmailTestResult] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);

  const checkConsulate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/check-consulate");
      const data = await response.json();
      setResult(data);
      setLastChecked(new Date().toLocaleString("es-ES"));
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      setLoading(false);
    }
  };

  const testEmail = async () => {
    setEmailLoading(true);
    setEmailTestResult(null);
    try {
      console.log("Iniciando envío de email de prueba...");

      // Usar el endpoint del servidor que usa EmailJS del servidor
      const response = await fetch("http://localhost:3000/api/test-email", {
        method: "POST",
      });

      const data = await response.json();
      console.log("Resultado del envío:", data);

      if (data.success) {
        setEmailTestResult(
          "✅ Email de prueba enviado exitosamente desde el servidor"
        );
      } else {
        setEmailTestResult(`❌ Error en el envío: ${data.error}`);
      }
    } catch (error) {
      console.error("Error EmailJS:", error);
      setEmailTestResult(
        `❌ Error: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    } finally {
      setEmailLoading(false);
    }
  };

  useEffect(() => {
    // Verificar automáticamente al cargar la página
    checkConsulate();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Búsqueda de Fechas Posteriores al 31 de Julio
          </h1>
          <p className="text-gray-600 mb-6">
            Esta herramienta busca fechas en títulos que sean posteriores al 31
            de julio de 2025.
          </p>

          <div className="flex gap-4 mb-6">
            <button
              onClick={checkConsulate}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {loading ? "Verificando..." : "Verificar Ahora"}
            </button>

            <button
              onClick={testEmail}
              disabled={emailLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {emailLoading ? "Enviando..." : "📧 Probar Email"}
            </button>

            {lastChecked && (
              <div className="text-sm text-gray-500 self-center">
                Última verificación: {lastChecked}
              </div>
            )}
          </div>

          {emailTestResult && (
            <div
              className={`p-3 rounded-lg mb-4 ${
                emailTestResult.includes("✅")
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              {emailTestResult}
            </div>
          )}
        </div>

        {result && (
          <div className="space-y-6">
            {/* Resultado Principal */}
            <div
              className={`bg-white rounded-lg shadow-lg p-6 border-l-4 ${
                result.success && result.result?.foundFutureDate
                  ? "border-green-500"
                  : "border-red-500"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`text-2xl ${
                    result.success && result.result?.foundFutureDate
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {result.success && result.result?.foundFutureDate
                    ? "✅"
                    : "❌"}
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Fechas Posteriores al 31 de Julio
                </h2>
              </div>

              {result.success ? (
                <div>
                  <p
                    className={`text-lg font-medium mb-2 ${
                      result.result?.foundFutureDate
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {result.result?.message}
                  </p>

                  {result.confidence && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Confianza: {result.confidence.percentage}%
                        </span>
                        <span
                          className={`text-sm font-medium px-2 py-1 rounded ${
                            result.confidence.level === "Alta"
                              ? "bg-green-100 text-green-800"
                              : result.confidence.level === "Media"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {result.confidence.level}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            result.confidence.percentage >= 80
                              ? "bg-green-500"
                              : result.confidence.percentage >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${result.confidence.percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        {result.confidence.reason}
                      </p>
                    </div>
                  )}

                  {result.check && (
                    <div className="mt-4 space-y-2 text-sm text-gray-600">
                      <p>
                        <strong>URL verificada:</strong> {result.check.url}
                      </p>
                      <p>
                        <strong>Estado HTTP:</strong> {result.check.status}
                      </p>
                      {result.check.futureDates.length > 0 && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                          <p className="text-green-800 font-medium mb-2">
                            Fechas posteriores al 31 de julio encontradas:
                          </p>
                          <ul className="text-sm space-y-1">
                            {result.check.futureDates.map((dateInfo, index) => (
                              <li key={index} className="text-green-700">
                                • {dateInfo}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-red-600 font-medium">
                  Error: {result.error}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Información Adicional */}
        <div className="bg-blue-50 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            Información Importante
          </h3>
          <ul className="text-blue-700 space-y-2 text-sm">
            <li>
              • Esta herramienta busca fechas posteriores al 31 de julio de 2025
              en títulos
            </li>
            <li>
              • Analiza títulos (h1, h2, h3, etc.) excluyendo elementos span
            </li>
            <li>
              • Proporciona un porcentaje de confianza basado en los resultados
            </li>
            <li>
              • 100% de confianza si se encuentran fechas posteriores al 31 de
              julio
            </li>
            <li>
              • 10% de confianza si hay títulos pero no se encuentran fechas
              futuras
            </li>
            <li>• 0% de confianza si no hay títulos en la página</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
