import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

// Función para extraer fechas del texto
const extractDates = (text: string) => {
  const datePatterns = [
    // Patrones para fechas en español
    /(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/gi,
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/g,
    /(\d{1,2})-(\d{1,2})-(\d{4})/g,
    // Patrones para fechas con números
    /(\d{1,2})\s+de\s+(\d{1,2})/gi,
  ];

  const dates: Date[] = [];
  const monthNames = {
    enero: 0,
    febrero: 1,
    marzo: 2,
    abril: 3,
    mayo: 4,
    junio: 5,
    julio: 6,
    agosto: 7,
    septiembre: 8,
    octubre: 9,
    noviembre: 10,
    diciembre: 11,
  };

  datePatterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      try {
        let date: Date;

        if (
          pattern.source.includes("de") &&
          pattern.source.includes("enero|febrero")
        ) {
          // Formato: "4 de agosto"
          const day = parseInt(match[1]);
          const monthName = match[2].toLowerCase();
          const month = monthNames[monthName as keyof typeof monthNames];
          const currentYear = new Date().getFullYear();
          date = new Date(currentYear, month, day);
        } else if (pattern.source.includes("/")) {
          // Formato: "4/8/2025"
          const day = parseInt(match[1]);
          const month = parseInt(match[2]) - 1;
          const year = parseInt(match[3]);
          date = new Date(year, month, day);
        } else if (pattern.source.includes("-")) {
          // Formato: "4-8-2025"
          const day = parseInt(match[1]);
          const month = parseInt(match[2]) - 1;
          const year = parseInt(match[3]);
          date = new Date(year, month, day);
        } else {
          // Formato: "4 de 8"
          const day = parseInt(match[1]);
          const month = parseInt(match[2]) - 1;
          const currentYear = new Date().getFullYear();
          date = new Date(currentYear, month, day);
        }

        if (!isNaN(date.getTime())) {
          dates.push(date);
        }
      } catch (error) {
        console.log("Error parsing date:", match[0]);
      }
    }
  });

  return dates;
};

// Función para enviar email con Web3Forms
const sendEmail = async (futureDates: string[], titleTexts: string[]) => {
  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_key: "dc38a519-3533-4133-8d0e-0c0fc8ba7598", // Reemplazar con tu access key
        from_name: "Sistema de Monitoreo",
        from_email: "noreply@tuapp.com",
        subject: "🚨 ALERTA: Fechas posteriores al 31 de julio encontradas",
        message: `
          🚨 ALERTA IMPORTANTE
          
          Se encontraron ${
            futureDates.length
          } fechas posteriores al 31 de julio de 2025.
          
          FECHAS ENCONTRADAS:
          ${futureDates.map((date) => `• ${date}`).join("\n")}
          
          TÍTULOS ANALIZADOS:
          ${titleTexts
            .slice(0, 3)
            .map((title) => `• ${title}`)
            .join("\n")}
          
          Hora de la alerta: ${new Date().toLocaleString("es-ES")}
          
          Sistema de Monitoreo Automático
        `,
        to: "guillerg0101@gmail.com",
      }),
    });

    const result = await response.json();
    console.log("Resultado del envío:", result);

    if (response.ok && result.success) {
      console.log("Email de alerta enviado exitosamente con Web3Forms");
      return true;
    } else {
      console.error("Error en el envío de email:", result.message);
      return false;
    }
  } catch (error) {
    console.error("Error enviando email con Web3Forms:", error);
    return false;
  }
};

export async function GET(request: NextRequest) {
  try {
    const targetUrl =
      "https://www.exteriores.gob.es/Consulados/lahabana/es/Comunicacion/Noticias/Paginas/Articulos/Solicitud-de-pasaportes.aspx";

    console.log(
      "Cron job ejecutándose - Verificando fechas:",
      new Date().toISOString()
    );

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const htmlContent = await response.text();
    const $ = cheerio.load(htmlContent);

    // Buscar fechas en títulos
    const titleElements = $(
      'h1, h2, h3, h4, h5, h6, .title, .titulo, [class*="title"], [class*="titulo"]'
    ).not("span, span *");

    const titleTexts: string[] = [];
    let foundFutureDate = false;
    const futureDates: string[] = [];
    const limitDate = new Date(2025, 6, 31); // 31 de julio de 2025

    titleElements.each((index, element) => {
      const titleText = $(element).text().trim();
      if (titleText) {
        titleTexts.push(titleText);

        // Extraer fechas del título
        const datesInTitle = extractDates(titleText);
        datesInTitle.forEach((date) => {
          if (date > limitDate) {
            foundFutureDate = true;
            futureDates.push(
              `${date.toLocaleDateString("es-ES")} (en: "${titleText.substring(
                0,
                50
              )}...")`
            );
          }
        });
      }
    });

    console.log("Verificación completada:");
    console.log("- Títulos encontrados:", titleTexts.length);
    console.log("- Fechas futuras encontradas:", futureDates.length);
    console.log("- ¿Se encontraron fechas futuras?", foundFutureDate);

    // Si se encontraron fechas futuras, enviar email
    if (foundFutureDate) {
      console.log("🚨 Enviando email de alerta...");
      const emailSent = await sendEmail(futureDates, titleTexts);

      return NextResponse.json({
        success: true,
        alert: true,
        message:
          "Se encontraron fechas posteriores al 31 de julio. Email de alerta enviado.",
        futureDates: futureDates,
        titleTexts: titleTexts,
        emailSent: emailSent,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.log("✅ No se encontraron fechas futuras. No se envía alerta.");

      return NextResponse.json({
        success: true,
        alert: false,
        message: "No se encontraron fechas posteriores al 31 de julio.",
        titleTexts: titleTexts,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error en cron job:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
