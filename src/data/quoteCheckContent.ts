export const quoteCheckContent = {
  brand: 'RenoPilot',
  landing: {
    headline: 'Revisa un presupuesto de obra antes de decir que sí.',
    subcopy:
      'Sube o pega un presupuesto, mensaje del contratista, captura o factura. RenoPilot te muestra qué falta, qué podría costar extra y qué preguntar antes de aceptar.',
    cta: 'Empezar revisión',
  },
  startCheck: {
    title: 'Empecemos con lo que te han enviado',
    decisionLabel: '¿Qué estás intentando decidir?',
    decisionPlaceholder:
      'Ejemplo: Quiero saber si este presupuesto para reformar el baño es claro antes de pagar la señal.',
    uploadLabel: 'Subir presupuesto, mensaje o captura',
    uploadHint: 'Placeholder visual: todavía no analizamos archivos reales.',
    pasteLabel: 'O pega aquí el presupuesto o mensaje',
    pastePlaceholder:
      'Pega el texto del presupuesto, WhatsApp, email o factura que quieres revisar.',
    emailLabel: 'Email opcional',
    emailPlaceholder: 'tu@email.com',
    cta: 'Revisar presupuesto',
  },
  checking: {
    title: 'RenoPilot está revisando:',
    items: [
      'detalles que faltan',
      'posibles costes extra',
      'condiciones de pago poco claras',
      'supuestos arriesgados',
      'preguntas que hacer antes de aceptar',
    ],
    cta: 'Ver resultado',
  },
  result: {
    status: '🟡 Buena pinta, pero pregunta antes de firmar',
    explanation:
      'Este presupuesto no presenta señales importantes de alarma, pero hemos encontrado 4 puntos que merece la pena revisar antes de firmar.',
    biggestRiskTitle: 'Mayor riesgo',
    biggestRisk:
      'El IVA no está incluido y parte de la instalación eléctrica está pendiente de estudio.',
    nextActionTitle: 'Siguiente paso',
    nextAction: 'Envía estas preguntas antes de firmar o pagar la señal.',
    cta: 'Ver qué revisar',
  },
  review: {
    title: 'Qué revisar antes de aceptar',
    items: [
      'El IVA no está incluido.',
      'No aparece un plazo de ejecución.',
      'Parte de la instalación eléctrica está pendiente de estudio.',
      'El pago del 45% “a mitad de obra” no está definido.',
    ],
    cta: 'Ver preguntas para el contratista',
  },
  questions: {
    title: 'Mensaje para copiar y enviar',
    message: `Hola, gracias por el presupuesto. Antes de aceptar, ¿podéis confirmarme estos puntos por escrito?\n\n1. ¿Cuál será el precio final con IVA incluido?\n2. ¿Cuánto durará la obra?\n3. ¿Puede cambiar el precio de la instalación eléctrica?\n4. ¿Qué significa exactamente ‘mitad de obra’ para el segundo pago?\n\nGracias.`,
    copyCta: 'Copiar mensaje',
    copiedLabel: 'Mensaje copiado',
    cta: 'Ya lo he enviado / tengo respuesta',
  },
  vendorReply: {
    title: 'Añade la respuesta del contratista',
    label: 'Pega aquí la respuesta del contratista',
    placeholder:
      'Pega la respuesta que te han enviado para actualizar la recomendación.',
    cta: 'Actualizar recomendación',
  },
  updatedRecommendation: {
    status: '🟡 Todavía faltan puntos por cerrar',
    explanation:
      'Buena respuesta, pero aún falta confirmar por escrito el precio final con IVA y el criterio exacto del segundo pago.',
    nextActionTitle: 'Siguiente paso',
    nextAction: 'Pide confirmación escrita antes de pagar la señal.',
  },
};
