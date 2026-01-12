/**
 * =====================================================
 *  API /api/chat
 * -----------------------------------------------------
 *  Asistente virtual para FullOps Group
 *
 *  Funciones:
 *  - Recibe mensajes desde el frontend (POST)
 *  - Se comunica con OpenAI
 *  - Devuelve la respuesta del asistente
 *
 *  IMPORTANTE:
 *  - Incluye headers CORS (obligatorio para navegador)
 *  - No expone la API Key
 * =====================================================
 */

export default async function handler(req, res) {

  /* =========================
     CORS HEADERS
     Permite llamadas desde GitHub Pages u otros dominios
  ========================= */
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Respuesta automática a preflight (navegador)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  /* =========================
     VALIDACIÓN DE MÉTODO
  ========================= */
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  /* =========================
     VALIDACIÓN DE BODY
  ========================= */
  const { message } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "Empty message" });
  }

  /* =========================
     PROMPT DEL SISTEMA
     Aquí luego podemos meter info real del negocio
  ========================= */
  const systemPrompt = `
Eres el asistente virtual del sitio web FullOps Group.
Ayudas a los usuarios a entender los servicios de la empresa.
Responde de forma clara, corta, profesional y amigable.
Si no sabes algo, dilo honestamente.
Sugiere secciones del sitio cuando sea relevante.
`;

  try {
    /* =========================
       LLAMADA A OPENAI
    ========================= */
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
          max_tokens: 200
        })
      }
    );

    const data = await response.json();

    /* =========================
       VALIDACIÓN DE RESPUESTA
    ========================= */
    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({
        error: "Invalid response from OpenAI"
      });
    }

    /* =========================
       RESPUESTA FINAL AL FRONTEND
    ========================= */
    return res.status(200).json({
      reply: data.choices[0].message.content
    });

  } catch (error) {
    console.error("Error en /api/chat:", error);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
}