"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              🏠 Agentic Flow
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              Inicio
            </Link>

            <Link
              href="/citas"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/citas"
                  ? "bg-green-100 text-green-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              📅 Monitor de Citas
            </Link>

            <Link
              href="/consulate-check"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/consulate-check"
                  ? "bg-purple-100 text-purple-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              🏛️ Verificar Consulado
            </Link>

            <Link
              href="/cron-status"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/cron-status"
                  ? "bg-orange-100 text-orange-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              🔄 Estado del Cron
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
