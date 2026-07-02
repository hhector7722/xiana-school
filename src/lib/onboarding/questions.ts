import type { BlockDef } from '@/types'

export const blocks: BlockDef[] = [
  {
    id: 'activity',
    title: 'Tu actividad',
    subtitle: 'Cuéntame sobre tu trabajo como profesora de idiomas.',
    questions: [
      { id: 'fulltime', text: '¿Enseñas idiomas a tiempo completo?' },
      { id: 'more_than_ten', text: '¿Tienes más de 10 alumnos?' },
      { id: 'more_than_five_years', text: '¿Llevas más de 5 años dando clases?' },
    ],
    audioPrompt:
      'Cuéntame cómo es tu día a día como profesora. ¿Cómo empiezas y terminas tu jornada?',
  },
  {
    id: 'new_students',
    title: 'Nuevos alumnos',
    subtitle: '¿Cómo llegan los alumnos a ti?',
    questions: [
      { id: 'referrals', text: '¿Tus alumnos te encuentran por recomendación de otros alumnos?' },
      { id: 'trial_class', text: '¿Ofreces una clase de prueba gratuita?' },
    ],
    audioPrompt:
      'Descríbeme el proceso completo desde que un alumno te contacta por primera vez hasta que se convierte en alumno regular.',
  },
  {
    id: 'organization',
    title: 'Organización',
    subtitle: '¿Cómo organizas tu trabajo?',
    questions: [
      { id: 'digital_calendar', text: '¿Usas un calendario digital (Google Calendar, iCal, etc.)?' },
      { id: 'fixed_schedule', text: '¿Tienes alumnos con horario fijo cada semana?' },
      { id: 'variable_schedule', text: '¿Tienes alumnos con horario variable?' },
    ],
    audioPrompt:
      '¿Cómo organizas tu semana actualmente? ¿Qué herramienta usas para gestionar tus clases y horarios?',
  },
  {
    id: 'online_classes',
    title: 'Clases online',
    subtitle: '¿Cómo son tus clases por videollamada?',
    questions: [
      { id: 'uses_zoom', text: '¿Usas Zoom para tus clases online?' },
      { id: 'screen_sharing', text: '¿Compartes pantalla en las clases?' },
      { id: 'digital_whiteboard', text: '¿Usas pizarra digital o herramientas interactivas?' },
    ],
    audioPrompt:
      'Cuéntame cómo es una clase típica desde que te conectas hasta que terminas. ¿Qué herramientas usas durante la clase?',
  },
  {
    id: 'communication',
    title: 'Comunicación',
    subtitle: '¿Cómo te comunicas con tus alumnos fuera de clase?',
    questions: [
      { id: 'uses_whatsapp', text: '¿Usas WhatsApp para comunicarte con tus alumnos?' },
      { id: 'uses_email', text: '¿Usas email para comunicarte con tus alumnos?' },
    ],
    audioPrompt:
      '¿Cómo gestionas la comunicación con tus alumnos entre clase y clase? ¿Te escriben mucho? ¿Cómo prefieres que te contacten?',
  },
  {
    id: 'tracking',
    title: 'Seguimiento del alumno',
    subtitle: '¿Cómo realizas el seguimiento de cada alumno?',
    questions: [
      { id: 'progress_tracking', text: '¿Llevas un registro del progreso de cada alumno?' },
      { id: 'homework', text: '¿Envías deberes o taras para hacer?' },
      { id: 'exams', text: '¿Haces exámenes o pruebas de nivel?' },
    ],
    audioPrompt:
      '¿Cómo sabes si un alumno está progresando? ¿Qué información guardas de cada alumno y cómo la organizas?',
  },
  {
    id: 'materials',
    title: 'Materiales',
    subtitle: '¿Qué materiales utilizas en tus clases?',
    questions: [
      { id: 'textbooks', text: '¿Usas libros de texto físicos?' },
      { id: 'digital_docs', text: '¿Compartes PDFs o documentos digitales con tus alumnos?' },
      { id: 'custom_material', text: '¿Creas tu propio material didáctico?' },
    ],
    audioPrompt:
      '¿Qué materiales usas en tus clases? ¿Cómo los preparas y cómo se los compartes a tus alumnos?',
  },
  {
    id: 'payments',
    title: 'Cobros',
    subtitle: '¿Cómo gestionas los pagos de tus clases?',
    questions: [
      { id: 'per_class', text: '¿Cobras por clase individual?' },
      { id: 'monthly', text: '¿Cobras por mes o paquete de clases?' },
      { id: 'bank_transfer', text: '¿Usas transferencia bancaria como método de cobro?' },
    ],
    audioPrompt:
      '¿Cómo gestionas los cobros actualmente? ¿Te resulta fácil o es algo que te gustaría simplificar?',
  },
  {
    id: 'tools',
    title: 'Herramientas',
    subtitle: '¿Qué herramientas utilizas en tu día a día?',
    questions: [
      { id: 'google_calendar', text: '¿Usas Google Calendar para gestionar tus clases?' },
      { id: 'uses_zoom_again', text: '¿Usas Zoom para videollamadas?' },
      { id: 'specialized_tool', text: '¿Usas alguna herramienta específica para profesores de idiomas?' },
    ],
    audioPrompt:
      'Háblame de todas las herramientas que usas en tu día a día como profesora. ¿Cuáles te gustan y cuáles no?',
  },
  {
    id: 'improvements',
    title: 'Mejoras',
    subtitle: '¿Qué te gustaría mejorar de tu forma de trabajar?',
    questions: [
      { id: 'admin_time', text: '¿Sientes que pierdes tiempo en tareas administrativas?' },
      { id: 'wants_automation', text: '¿Te gustaría automatizar alguna parte de tu trabajo?' },
    ],
    audioPrompt:
      '¿Qué es lo que más te frustra de tu flujo de trabajo actual? Si pudieras cambiar una cosa, ¿qué sería?',
  },
  {
    id: 'open_ended',
    title: 'Pregunta abierta final',
    subtitle: 'Para terminar, cuéntame todo lo que consideres importante.',
    questions: [
      { id: 'something_else', text: '¿Hay algún aspecto de tu trabajo del que no hayamos hablado?' },
    ],
    audioPrompt:
      'Este es tu momento para contarme todo lo que no hayas podido expresar antes. ¿Hay algo más que deba saber para entender completamente tu negocio?',
  },
]
