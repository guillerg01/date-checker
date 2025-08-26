import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET(request: NextRequest) {
  try {
    const targetUrl =
      "https://www.exteriores.gob.es/Consulados/lahabana/es/Comunicacion/Noticias/Paginas/Articulos/Solicitud-de-pasaportes.aspx";

    console.log("Checking consulate page:", targetUrl);

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

    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const htmlContent = await response.text();
    console.log("HTML content length:", htmlContent.length);

    // Cargar el HTML con Cheerio
    const $ = cheerio.load(htmlContent);

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

    // Buscar fechas en títulos
    const titleElements = $(
      'h1, h2, h3, h4, h5, h6, .title, .titulo, [class*="title"], [class*="titulo"]'
    ).not("span, span *");

    const titleTexts: string[] = [];
    let foundFutureDate = false;
    let confidencePercentage = 0;
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

    // Calcular porcentaje de confianza
    if (foundFutureDate) {
      confidencePercentage = 100;
    } else if (titleTexts.length > 0) {
      // Si hay títulos pero no se encontraron fechas futuras, dar confianza baja
      confidencePercentage = 10;
    } else {
      // Si no hay títulos, confianza 0
      confidencePercentage = 0;
    }

    console.log("Títulos encontrados:", titleTexts);
    console.log(
      "¿Se encontraron fechas posteriores al 31 de julio?",
      foundFutureDate
    );
    console.log("Fechas futuras encontradas:", futureDates);
    console.log("Porcentaje de confianza:", confidencePercentage);

    // Extraer información adicional usando Cheerio
    const title = $("title").text().trim() || "No title found";
    const h1 = $("h1").first().text().trim() || "No H1 found";

    return NextResponse.json({
      success: true,
      check: {
        url: targetUrl,
        status: response.status,
        contentLength: htmlContent.length,
        titleTexts: titleTexts,
        foundFutureDate: foundFutureDate,
        futureDates: futureDates,
        limitDate: limitDate.toLocaleDateString("es-ES"),
        pageTitle: title,
        pageH1: h1,
        timestamp: new Date().toISOString(),
      },
      confidence: {
        percentage: confidencePercentage,
        level:
          confidencePercentage >= 80
            ? "Alta"
            : confidencePercentage >= 50
            ? "Media"
            : "Baja",
        reason: foundFutureDate
          ? "Se encontraron fechas posteriores al 31 de julio"
          : titleTexts.length > 0
          ? "Se encontraron títulos pero no fechas futuras"
          : "No se encontraron títulos",
      },
      result: {
        foundFutureDate: foundFutureDate,
        message: foundFutureDate
          ? "✅ Se encontraron fechas posteriores al 31 de julio en títulos"
          : "❌ No se encontraron fechas posteriores al 31 de julio en títulos",
      },
    });
  } catch (error) {
    console.error("Error checking consulate page:", error);
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
