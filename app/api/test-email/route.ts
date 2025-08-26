import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Usar Web3Forms (gratuito y funciona desde servidor)
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_key: "dc38a519-3533-4133-8d0e-0c0fc8ba7598", // Reemplazar con tu access key
        from_name: "Sistema de Monitoreo",
        from_email: "noreply@tuapp.com",
        subject: "🧪 PRUEBA: Sistema de Alertas por Email",
        message: `
          Hola Guillermo,
          
          El sistema de monitoreo de fechas posteriores al 31 de julio está funcionando correctamente.
          
          Hora de la prueba: ${new Date().toLocaleString("es-ES")}
          
          Saludos,
          Sistema de Monitoreo
        `,
        to: "guillerg0101@gmail.com",
      }),
    });

    const result = await response.json();
    console.log("Resultado del envío:", result);

    if (response.ok && result.success) {
      return NextResponse.json({
        success: true,
        message: "Email de prueba enviado exitosamente con Web3Forms",
        result: result,
        timestamp: new Date().toISOString(),
      });
    } else {
      throw new Error(`Web3Forms error: ${result.message || "Unknown error"}`);
    }
  } catch (error) {
    console.error("Error enviando email:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
