# 🤖 Integración con Mistral AI - Rubi Assistant

## 📦 Instalación

Primero, instala el SDK de Mistral AI:

```bash
npm install @mistralai/mistralai
```

O si usas yarn:

```bash
yarn add @mistralai/mistralai
```

## 🔑 Obtener tu API Key de Mistral

1. Ve a [https://console.mistral.ai](https://console.mistral.ai)
2. Crea una cuenta o inicia sesión
3. Ve a **API Keys** en el menú lateral
4. Haz clic en **Create new key**
5. Copia tu API key (empieza con algo como `xxx...`)

## ⚙️ Configuración en Render

Ve a tu servicio en Render → **Environment** y agrega:

```bash
MISTRAL_API_KEY=tu_api_key_de_mistral_aqui
MISTRAL_MODEL=mistral-large-latest
```

## 🎯 Modelos Disponibles

Mistral ofrece varios modelos según tus necesidades:

| Modelo | Descripción | Uso recomendado | Costo |
|--------|-------------|-----------------|-------|
| `mistral-large-latest` | El más potente | Tareas complejas, razonamiento | $$$ |
| `mistral-medium-latest` | Equilibrado | Uso general | $$ |
| `mistral-small-latest` | Rápido y económico | Tareas simples | $ |
| `mistral-tiny` | Ultra rápido | Respuestas cortas | ¢ |
| `codestral-latest` | Especializado en código | Generación de código | $$ |

## 💻 Uso Básico

### Ejemplo 1: Chat Simple

```typescript
import { mistralChatService } from './mistralChatService';

const response = await mistralChatService.generateChatCompletion([
  {
    role: 'system',
    content: 'Eres Rubi, una asistente personal amigable y servicial.'
  },
  {
    role: 'user',
    content: '¿Qué tareas tengo pendientes hoy?'
  }
]);

console.log(response.content);
```

### Ejemplo 2: Streaming (Respuesta en tiempo real)

```typescript
import { mistralChatService } from './mistralChatService';

const stream = mistralChatService.streamChatCompletion([
  {
    role: 'system',
    content: 'Eres Rubi, una asistente personal.'
  },
  {
    role: 'user',
    content: 'Escribe un email profesional para mi jefe.'
  }
]);

for await (const chunk of stream) {
  process.stdout.write(chunk); // Imprime en tiempo real
}
```

### Ejemplo 3: Con Opciones Personalizadas

```typescript
const response = await mistralChatService.generateChatCompletion(
  [
    { role: 'system', content: 'Eres un asistente técnico experto.' },
    { role: 'user', content: 'Explica qué es TypeScript' }
  ],
  {
    temperature: 0.3,  // Más determinístico (0-1)
    maxTokens: 500,    // Límite de tokens
    model: 'mistral-large-latest'
  }
);
```

## 🔧 Integración en tus Rutas

### En `chatRoutes.ts`:

```typescript
import { mistralChatService } from './mistralChatService';
import { storage } from './storage';

app.post("/api/chat", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { message, conversationId } = req.body;

    // Obtener preferencias del usuario
    const prefs = await storage.getUserPreferences(userId);
    
    // Personalizar sistema según preferencias
    const systemPrompt = `Eres Rubi, una asistente personal ${prefs?.communicationStyle || 'amigable'}. 
    Modo de respuesta: ${prefs?.responseMode || 'balanced'}.
    ${prefs?.userContext ? `Contexto del usuario: ${prefs.userContext}` : ''}`;

    // Obtener historial de conversación
    const history = await storage.getConversationHistory(conversationId);
    
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message }
    ];

    // Generar respuesta
    const response = await mistralChatService.generateChatCompletion(
      messages,
      {
        temperature: 0.7,
        maxTokens: 1000,
        model: prefs?.isPremium ? 'mistral-large-latest' : 'mistral-small-latest'
      }
    );

    // Guardar en base de datos
    await storage.saveMessage(conversationId, 'user', message);
    await storage.saveMessage(conversationId, 'assistant', response.content);

    res.json({ 
      message: response.content,
      usage: response.usage
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat' });
  }
});
```

## 🎨 Personalización según Usuario

```typescript
// Adaptar la personalidad de Rubi según preferencias premium
const getSystemPrompt = (prefs: UserPreferences) => {
  const baseName = prefs.customRubiName || 'Rubi';
  const personality = prefs.customRubiPersonality || 
    'Soy una asistente personal inteligente y empática';
  const tone = prefs.customRubiTone || 'friendly';
  
  const toneInstructions = {
    friendly: 'Usa un tono cálido y cercano',
    professional: 'Mantén un tono profesional y formal',
    playful: 'Usa humor y emoticones ocasionalmente',
    motivational: 'Sé inspiradora y motivadora',
    sarcastic: 'Usa sarcasmo ligero cuando sea apropiado',
    serious: 'Sé directa y concisa'
  };

  return `Eres ${baseName}. ${personality}. ${toneInstructions[tone]}.`;
};
```

## 📊 Costos Estimados

Precios aproximados (verificar en [mistral.ai/pricing](https://mistral.ai/pricing)):

- **mistral-large**: ~$8 / 1M tokens
- **mistral-medium**: ~$2.5 / 1M tokens
- **mistral-small**: ~$1 / 1M tokens
- **mistral-tiny**: ~$0.25 / 1M tokens

Ejemplo: Una conversación típica (100 tokens prompt + 200 tokens respuesta):
- Con `mistral-large`: ~$0.0024
- Con `mistral-small`: ~$0.0003

## 🔒 Límites y Rate Limiting

Para evitar abusos, implementa rate limiting:

```typescript
import rateLimit from 'express-rate-limit';

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // 50 requests por ventana (usuarios gratis)
  message: 'Demasiadas peticiones, intenta de nuevo más tarde'
});

// Usuarios premium: límite más alto
const premiumChatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // 200 requests para premium
  message: 'Límite alcanzado, intenta de nuevo más tarde'
});

app.post("/api/chat", isAuthenticated, async (req: any, res) => {
  const prefs = await storage.getUserPreferences(req.user.claims.sub);
  const limiter = prefs?.isPremium ? premiumChatLimiter : chatLimiter;
  
  limiter(req, res, async () => {
    // Tu lógica de chat aquí
  });
});
```

## 🐛 Manejo de Errores

```typescript
try {
  const response = await mistralChatService.generateChatCompletion(messages);
  return response;
} catch (error: any) {
  if (error.message?.includes('rate limit')) {
    throw new Error('Has alcanzado el límite de peticiones. Intenta más tarde.');
  } else if (error.message?.includes('API key')) {
    console.error('Invalid Mistral API key');
    throw new Error('Error de configuración del servidor');
  } else if (error.message?.includes('content policy')) {
    throw new Error('Tu mensaje viola las políticas de contenido');
  } else {
    console.error('Mistral error:', error);
    throw new Error('Error al procesar tu mensaje');
  }
}
```

## 📝 Mejores Prácticas

1. **Cache**: Guarda respuestas comunes para reducir costos
2. **Streaming**: Usa streaming para mejor UX en respuestas largas
3. **Fallback**: Ten un mensaje por defecto si Mistral falla
4. **Logs**: Registra el uso de tokens para monitorear costos
5. **Context**: Limita el historial de conversación a últimos 10 mensajes

## 🚀 Despliegue

Asegúrate de tener en tu `package.json`:

```json
{
  "dependencies": {
    "@mistralai/mistralai": "^1.0.0"
  }
}
```

Y en tus variables de entorno en Render:

```bash
MISTRAL_API_KEY=tu_clave_aqui
MISTRAL_MODEL=mistral-large-latest
```

¡Listo! Ahora Rubi usará Mistral AI para generar respuestas inteligentes. 🎉
