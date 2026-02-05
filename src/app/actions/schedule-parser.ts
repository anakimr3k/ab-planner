"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import pdf from "pdf-parse-fork";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

// Récupérer les clés API depuis .env
function getApiKey(index: number): string {
  const keys = [
    process.env.MISTRAL_API_KEY,
    process.env.MISTRAL_API_KEY_2,
    process.env.MISTRAL_API_KEY_3,
    process.env.MISTRAL_API_KEY_4,
  ];
  return keys[index] || keys[0] || "";
}

function cleanTime(timeStr: string): string {
  let cleaned = timeStr.toLowerCase().replace(/[^0-9h:]/g, "").replace(/:/g, "h");
  if (!cleaned.includes("h") && cleaned.length >= 3) {
    cleaned = cleaned.slice(0, -2) + "h" + cleaned.slice(-2);
  }
  const match = cleaned.match(/(\d{1,2})h(\d{0,2})/);
  if (match) {
    return `${match[1].padStart(2, "0")}h${(match[2] || "00").padStart(2, "0").substring(0, 2)}`;
  }
  return "08h00";
}

function normalizeWeekType(weekStr: string): string {
  const lower = weekStr.toLowerCase().trim();
  if (lower === "a" || lower.includes("semaine a") || lower.includes("impaire")) return "A";
  if (lower === "b" || lower.includes("semaine b") || lower.includes("paire")) return "B";
  return "BOTH";
}

// ═══════════════════════════════════════════════════════════════
// API 1: Extraction des HORAIRES et JOURS
// ═══════════════════════════════════════════════════════════════
async function extractTimesAndDays(text: string, apiKey: string): Promise<Array<{day: string, startTime: string, endTime: string, context: string}>> {
  const prompt = `Extrais UNIQUEMENT les créneaux horaires et jours.

Pour chaque cours:
{
  "slots": [
    {"day": "Mardi", "startTime": "08h00", "endTime": "10h00", "context": "Mathématiques"}
  ]
}

RÈGLES:
- Horaire: HHhmm (08h00, 14h30)
- Fin > Début
- Jours: Lundi à Samedi
- TOUS les créneaux!

TEXTE:
${text.substring(0, 6000)}

JSON:`;

  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "mistral-small-latest", messages: [{ role: "user", content: prompt }], response_format: { type: "json_object" }, temperature: 0.01, max_tokens: 1500 })
  });

  if (!response.ok) return [];
  const result = await response.json();
  try {
    return JSON.parse(result.choices[0].message.content).slots || [];
  } catch { return []; }
}

// ═══════════════════════════════════════════════════════════════
// API 2: Extraction des MATIÈRES
// ═══════════════════════════════════════════════════════════════
async function extractSubjects(text: string, apiKey: string): Promise<Array<{title: string, details: string, context: string}>> {
  const prompt = `Extrais UNIQUEMENT les matières et détails.

Pour chaque cours:
{
  "subjects": [
    {"title": "Mathématiques", "details": "Salle C201", "context": "Mathématiques"}
  ]
}

RÈGLES:
- Matière: nom COMPLET
- Détails: salle, professeur
- TOUTES les matières!

TEXTE:
${text.substring(0, 6000)}

JSON:`;

  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "mistral-small-latest", messages: [{ role: "user", content: prompt }], response_format: { type: "json_object" }, temperature: 0.01, max_tokens: 1500 })
  });

  if (!response.ok) return [];
  const result = await response.json();
  try {
    return JSON.parse(result.choices[0].message.content).subjects || [];
  } catch { return []; }
}

// ═══════════════════════════════════════════════════════════════
// API 3: Validation des HORAIRES
// ═══════════════════════════════════════════════════════════════
async function validateTimes(times: Array<any>, apiKey: string): Promise<Array<{day: string, startTime: string, endTime: string}>> {
  const prompt = `Valide et corrige ces horaires:

${JSON.stringify(times, null, 2)}

Retourne:
{"validated": [{"day": "Mardi", "startTime": "08h00", "endTime": "10h00"}]}

RÈGLES:
- Fin > Début
- Format HHhmm
- Jours valides: Lundi-Samedi`;

  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "mistral-small-latest", messages: [{ role: "user", content: prompt }], response_format: { type: "json_object" }, temperature: 0.01, max_tokens: 500 })
  });

  if (!response.ok) return times;
  const result = await response.json();
  try {
    return result.validated || times;
  } catch { return times; }
}

// ═══════════════════════════════════════════════════════════════
// API 4: Attribution des SEMAINES
// ═══════════════════════════════════════════════════════════════
async function assignWeeks(subjects: Array<any>, apiKey: string): Promise<Array<{title: string, weekType: string}>> {
  const prompt = `Détermine la semaine pour chaque matière:

${JSON.stringify(subjects.map(s => s.title), null, 2)}

Retourne:
{"assignments": [{"title": "Mathématiques", "weekType": "A"}]}

RÈGLES:
- Semaine A / impaire → "A"
- Semaine B / paire → "B"
- Sinon → "BOTH"`;

  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "mistral-small-latest", messages: [{ role: "user", content: prompt }], response_format: { type: "json_object" }, temperature: 0.01, max_tokens: 500 })
  });

  if (!response.ok) return subjects.map(s => ({ title: s.title, weekType: "BOTH" }));
  const result = await response.json();
  try {
    return result.assignments || subjects.map(s => ({ title: s.title, weekType: "BOTH" }));
  } catch { return subjects.map(s => ({ title: s.title, weekType: "BOTH" })); }
}

// ═══════════════════════════════════════════════════════════════
// FONCTION PRINCIPALE
// ═══════════════════════════════════════════════════════════════
export async function parseAndUploadSchedule(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");

  const file = formData.get("file") as File;
  if (!file) throw new Error("Aucun fichier fourni");

  const bytes = await file.arrayBuffer();
  const data = pdf(Buffer.from(bytes));
  const rawText = (await data).text;

  // Vérifier les clés API
  const keys = [getApiKey(0), getApiKey(1), getApiKey(2), getApiKey(3)];
  if (!keys[0]) throw new Error("MISTRAL_API_KEY non configurée dans .env");

  try {
    console.log("🚀 === 4 API EN PARALLÈLE ===");
    
    // Utiliser des clés différentes si disponibles
    const key1 = keys[0];
    const key2 = keys[1] || key1;
    const key3 = keys[2] || key1;
    const key4 = keys[3] || key1;
    
    console.log(`📡 API 1 (horaires) avec clé #1...`);
    console.log(`📡 API 2 (matières) avec clé #${keys[1] ? "2" : "1"}...`);
    console.log(`📡 API 3 (validation) avec clé #${keys[2] ? "3" : "1"}...`);
    console.log(`📡 API 4 (semaines) avec clé #${keys[3] ? "4" : "1"}...`);

    // Appels parallèles - on stocke les promises
    const promise1 = extractTimesAndDays(rawText, key1);
    const promise2 = extractSubjects(rawText, key2);
    const promise3 = validateTimes([], key3); // Sera appelé après
    const promise4 = assignWeeks([], key4); // Sera appelé après

    // Attendre les 2 premiers
    const [times, subjects] = await Promise.all([promise1, promise2]);
    
    console.log(`✅ API 1: ${times.length} créneaux`);
    console.log(`✅ API 2: ${subjects.length} matières`);

    // Appeler les API 3 et 4 avec les résultats
    const [validatedTimes, weekAssignments] = await Promise.all([
      validateTimes(times, key3),
      assignWeeks(subjects, key4)
    ]);

    console.log(`✅ API 3: ${validatedTimes.length} validés`);
    console.log(`✅ API 4: ${weekAssignments.length} semaines attribuées`);

    // Fusion
    const events = fuseData(validatedTimes, subjects, weekAssignments);
    console.log(`📊 Fusion: ${events.length} événements`);

    // Filtrage
    const validEvents = events.filter(e => {
      if (!e.title || !e.day || !e.startTime || !e.endTime) return false;
      if (!DAYS.includes(e.day)) return false;
      
      e.startTime = cleanTime(e.startTime);
      e.endTime = cleanTime(e.endTime);
      if (!/^\d{2}h\d{2}$/.test(e.startTime) || !/^\d{2}h\d{2}$/.test(e.endTime)) return false;
      
      const start = parseInt(e.startTime.replace("h", ""));
      const end = parseInt(e.endTime.replace("h", ""));
      if (end <= start) return false;

      e.weekType = normalizeWeekType(e.weekType);
      e.details = e.details || "";
      e.color = "Gris";
      return true;
    });

    // Dédoublonnage
    const seen = new Set<string>();
    const uniqueEvents = validEvents.filter(e => {
      const key = `${e.day}-${e.startTime}-${e.title}-${e.weekType}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    console.log(`✅ ${uniqueEvents.length} événements finaux`);

    if (uniqueEvents.length > 0) {
      await db.event.deleteMany({ where: { userId } });
      await db.event.createMany({
        data: uniqueEvents.map(e => ({
          userId,
          title: e.title,
          day: e.day,
          startTime: e.startTime,
          endTime: e.endTime,
          weekType: e.weekType,
          details: e.details,
          color: e.color
        }))
      });
    }

    revalidatePath("/dashboard/schedule");
    return { success: true, count: uniqueEvents.length };
  } catch (error) {
    console.error("Erreur:", error);
    throw new Error(error instanceof Error ? error.message : "Erreur d'importation");
  }
}

function fuseData(times: Array<any>, subjects: Array<any>, weeks: Array<any>): Array<any> {
  const events: Array<any> = [];
  const weekMap = new Map<string, string>();
  weeks.forEach(w => weekMap.set(w.title, w.weekType));

  times.forEach((time, tIdx) => {
    let bestSubject = subjects[0] || { title: "Cours", details: "" };
    let bestScore = 0;

    subjects.forEach((subj: any, sIdx: number) => {
      const orderScore = 1 / (Math.abs(tIdx - sIdx) + 1);
      const score = orderScore * 10;
      if (score > bestScore) {
        bestScore = score;
        bestSubject = subj;
      }
    });

    events.push({
      title: bestSubject.title || "Cours",
      day: time.day,
      startTime: time.startTime,
      endTime: time.endTime,
      weekType: weekMap.get(bestSubject.title) || "BOTH",
      details: bestSubject.details || "",
      color: "Gris"
    });
  });

  return events;
}
