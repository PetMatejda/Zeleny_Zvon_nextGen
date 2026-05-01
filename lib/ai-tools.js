// Tyto objekty lze přímo vložit do definice tools pro OpenAI, n8n nebo Gemini agenta.

export const aiTools = [
  {
    type: "function",
    function: {
      name: "getAvailableSlots",
      description: "Získá dostupné rezervační termíny (časy) pro zadané datum. Vrací pole volných časů ve formátu HH:MM. Tuto funkci použij před samotnou žádostí o rezervaci, abys zjistil, jaké termíny nabídnout uživateli.",
      parameters: {
        type: "object",
        properties: {
          dateStr: {
            type: "string",
            description: "Datum, pro které chceme zjistit volné termíny. Formát: YYYY-MM-DD (např. '2024-05-15').",
          },
        },
        required: ["dateStr"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "requestBooking",
      description: "Vytvoří novou žádost o rezervaci na základě zadaných údajů. Uloží ji s čekajícím (pending) stavem a pošle e-mail adminovi ke schválení. Funkce vrací objekt obsahující 'success' (boolean) a 'error' (string v případě selhání).",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Celé jméno zákazníka (např. 'Jan Novák').",
          },
          email: {
            type: "string",
            description: "E-mailová adresa zákazníka.",
          },
          date: {
            type: "string",
            description: "Vybrané datum rezervace ve formátu YYYY-MM-DD.",
          },
          timeSlot: {
            type: "string",
            description: "Vybraný čas rezervace ve formátu HH:MM.",
          },
        },
        required: ["name", "email", "date", "timeSlot"],
      },
    },
  }
];

// Obalující funkce pro spuštění na straně serveru/agenta
// V n8n nebo vašem AI routeru namapujete tyto funkce na server actions:
// - getAvailableSlots(dateStr)
// - requestBooking({ name, email, date, timeSlot })
