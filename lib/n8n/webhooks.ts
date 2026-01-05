/**
 * Utilidad para enviar webhooks a N8N
 * Integra la aplicación con automatizaciones de N8N
 */

interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
  metadata?: {
    userId?: string;
    userRole?: string;
    userEmail?: string;
  };
}

/**
 * Envía un webhook a N8N de forma asíncrona (no bloquea la ejecución)
 */
export async function sendN8NWebhook(
  event: string,
  data: any,
  metadata?: WebhookPayload["metadata"]
): Promise<void> {
  // Si N8N no está configurado, no hacer nada (modo silencioso)
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
  
  if (!n8nWebhookUrl) {
    // En desarrollo, loguear que N8N no está configurado (opcional)
    if (process.env.NODE_ENV === "development") {
      console.log(`[N8N] Webhook no enviado - N8N_WEBHOOK_URL no configurado. Evento: ${event}`);
    }
    return;
  }

  const payload: WebhookPayload = {
    event,
    data,
    timestamp: new Date().toISOString(),
    metadata,
  };

  // Enviar de forma asíncrona sin esperar respuesta (fire and forget)
  // Esto no bloquea la respuesta de la API
  fetch(n8nWebhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Opcional: token de autenticación si N8N lo requiere
      ...(process.env.N8N_WEBHOOK_TOKEN && {
        Authorization: `Bearer ${process.env.N8N_WEBHOOK_TOKEN}`,
      }),
    },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (!response.ok) {
        console.error(
          `[N8N] Error al enviar webhook: ${response.status} ${response.statusText}`,
          { event, status: response.status }
        );
      } else if (process.env.NODE_ENV === "development") {
        console.log(`[N8N] Webhook enviado exitosamente: ${event}`);
      }
    })
    .catch((error) => {
      // Solo loguear errores, no lanzar excepciones
      console.error(`[N8N] Error al enviar webhook:`, error.message, { event });
    });
}

/**
 * Tipos de eventos disponibles para N8N
 */
export const N8N_EVENTS = {
  USER_CREATED: "user.created",
  LEAD_CREATED: "lead.created",
  DEMO_CREATED: "demo.created",
  DEMO_UPDATED: "demo.updated",
  DEMO_ASSIGNED: "demo.assigned",
  DEMO_STATUS_CHANGED: "demo.status.changed",
} as const;

