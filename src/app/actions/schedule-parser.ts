"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import pdf from "pdf-parse-fork";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

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
// EXTRACTION COMPLÈTE EN UN SEUL APPEL API
// ═══════════════════════════════════════════════════════════════
async function extractSchedule(text: string): Promise<Array<{
  title: string;
  day: string;
  startTime: string;
  endTime: string;
  weekType: string;
  details: string;
}>> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error("MISTRAL_API_KEY non configurée dans .env");

  const prompt = `Tu es un expert en analyse d'emplois du temps universitaires. Extrais TOUS les cours de cet emploi du temps.

Pour chaque cours, retourne un objet JSON avec:
- title: nom complet de la matière (ex: "Mathématiques", "Physique")
- day: jour de la semaine (Lundi, Mardi, Mercredi, Jeudi, Vendredi, Samedi)
- startTime: heure de début au format HHhmm (ex: "08h00", "14h30")
- endTime: heure de fin au format HHhmm (ex: "10h00", "16h00")
- weekType: "A" si semaine A/impaire, "B" si semaine B/paire, "BOTH" si toutes les semaines
- details: salle, professeur, type de cours (TD/TP/CM) séparés par " - "

RÈGLES STRICTES:
1. L'heure de fin DOIT être supérieure à l'heure de début
2. Format horaire: HHhmm (08h00, 14h30, etc.)
3. Jours valides: Lundi, Mardi, Mercredi, Jeudi, Vendredi, Samedi
4. Extrais TOUS les cours, même s'ils se répètent
5. Si une information manque, utilise des valeurs par défaut raisonnables

Retourne un JSON avec cette structure:
{
  "courses": [
    {
      "title": "Mathématiques",
      "day": "Lundi",
      "startTime": "08h00",
      "endTime": "10h00",
      "weekType": "BOTH",
      "details": "Salle C201 - Prof. Dupont - CM"
    }
  ]
}

TEXTE DE L'EMPLOI DU TEMPS:
${text.substring(0, 8000)}

Retourne UNIQUEMENT le JSON, sans texte avant ou après:`;

  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "mistral-small-latest",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 3000
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Mistral: ${error}`);
  }

  const result = await response.json();
  try {
    const parsed = JSON.parse(result.choices[0].message.content);
    return parsed.courses || [];
  } catch (error) {
    console.error("Erreur parsing JSON:", error);
    return [];
  }
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

  try {
    console.log("🚀 Extraction de l'emploi du temps...");
    
    // Un seul appel API pour tout extraire
    const courses = await extractSchedule(rawText);
    console.log(`✅ ${courses.length} cours extraits`);

    // Validation et nettoyage
    const validEvents = courses.filter(course => {
      // Vérifier les champs obligatoires
      if (!course.title || !course.day || !course.startTime || !course.endTime) {
        console.log(`❌ Cours ignoré (champs manquants):`, course);
        return false;
      }

      // Vérifier que le jour est valide
      if (!DAYS.includes(course.day)) {
        console.log(`❌ Cours ignoré (jour invalide: ${course.day}):`, course);
        return false;
      }

      // Nettoyer les horaires
      course.startTime = cleanTime(course.startTime);
      course.endTime = cleanTime(course.endTime);

      // Vérifier le format des horaires
      if (!/^\d{2}h\d{2}$/.test(course.startTime) || !/^\d{2}h\d{2}$/.test(course.endTime)) {
        console.log(`❌ Cours ignoré (format horaire invalide):`, course);
        return false;
      }

      // Vérifier que l'heure de fin est après l'heure de début
      const start = parseInt(course.startTime.replace("h", ""));
      const end = parseInt(course.endTime.replace("h", ""));
      if (end <= start) {
        console.log(`❌ Cours ignoré (fin <= début):`, course);
        return false;
      }

      // Normaliser le type de semaine
      course.weekType = normalizeWeekType(course.weekType || "BOTH");
      
      // Assurer que details existe
      course.details = course.details || "";

      return true;
    });

    console.log(`✅ ${validEvents.length} cours valides après filtrage`);

    // Dédoublonnage (garder les cours uniques)
    const seen = new Set<string>();
    const uniqueEvents = validEvents.filter(course => {
      const key = `${course.day}-${course.startTime}-${course.endTime}-${course.title}-${course.weekType}`;
      if (seen.has(key)) {
        console.log(`⚠️ Doublon ignoré:`, course);
        return false;
      }
      seen.add(key);
      return true;
    });

    console.log(`✅ ${uniqueEvents.length} cours uniques finaux`);

    // Sauvegarder dans la base de données
    if (uniqueEvents.length > 0) {
      // Supprimer l'ancien emploi du temps
      await db.event.deleteMany({ where: { userId } });
      
      // Créer les nouveaux événements
      await db.event.createMany({
        data: uniqueEvents.map(course => ({
          userId,
          title: course.title,
          day: course.day,
          startTime: course.startTime,
          endTime: course.endTime,
          weekType: course.weekType,
          details: course.details,
          color: "Gris"
        }))
      });

      console.log(`💾 ${uniqueEvents.length} cours sauvegardés en base de données`);
    }

    revalidatePath("/dashboard/schedule");
    return { success: true, count: uniqueEvents.length };
  } catch (error) {
    console.error("❌ Erreur lors de l'analyse:", error);
    throw new Error(error instanceof Error ? error.message : "Erreur d'importation");
  }
}
