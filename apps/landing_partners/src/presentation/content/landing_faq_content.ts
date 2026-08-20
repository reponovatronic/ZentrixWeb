export type LandingFaqItem = {
  id: string;
  question: string;
  answer: string;
};

/** Preguntas frecuentes oficiales (contenido de producto). */
export const LANDING_FAQ_ITEMS: readonly LandingFaqItem[] = [
  {
    id: "Inicio",
    question: "Tecnología, experiencia y soluciones",
    answer:
      "Nuestro servicio conecta a usuarios con restaurantes, panaderías y tiendas que tienen excedentes de comida al final del día. Puedes comprar una “Happy Bag” a un precio reducido y recogerla en el horario indicado.",
  },
  {
    id: "bolsa-sorpresa",
    question: "¿Qué es una “Bolsa Sorpresa”?",
    answer:
      "Es un paquete con productos que no se vendieron durante el día pero que siguen en perfecto estado para consumo. El contenido varía según el negocio y la disponibilidad del momento.",
  },
  
] as const;
