# 📧 Configuración de Web3Forms

## 🚀 ¿Qué es Web3Forms?

Web3Forms es un servicio **gratuito** para enviar emails desde formularios web y APIs. Es perfecto para aplicaciones de servidor.

## ⚡ Configuración Rápida

### 1. Obtener Access Key
1. Ve a [https://web3forms.com/](https://web3forms.com/)
2. Haz clic en "Get Access Key"
3. Copia tu access key

### 2. Configurar en el Código
Reemplaza `YOUR-ACCESS-KEY-HERE` en estos archivos:
- `app/api/test-email/route.ts`
- `app/api/cron-check-dates/route.ts`

### 3. Variables de Entorno (Opcional)
Crea un archivo `.env.local`:
```env
WEB3FORMS_ACCESS_KEY=tu-access-key-aqui
```

## 📊 Límites Gratuitos
- ✅ 250 emails por mes
- ✅ Sin registro requerido
- ✅ Funciona desde servidor
- ✅ Sin configuración compleja

## 🔧 Uso
El sistema ya está configurado para usar Web3Forms. Solo necesitas:
1. Obtener tu access key
2. Reemplazar `YOUR-ACCESS-KEY-HERE` en el código
3. ¡Listo!

## 🎯 Ventajas
- ✅ Gratuito
- ✅ Fácil de configurar
- ✅ Funciona desde servidor
- ✅ Sin restricciones de navegador
- ✅ API simple
