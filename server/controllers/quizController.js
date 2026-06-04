const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ─── Shared helper ───────────────────────────────────────────────────────────

const LETTER_MAP = { A: 0, B: 1, C: 2, D: 3 };

function normalizeQuiz(quizData) {
  return quizData.map(q => {
    let correctAnswer = q.correctAnswer;
    const key = correctAnswer?.trim()?.toUpperCase();
    if (LETTER_MAP[key] !== undefined) {
      correctAnswer = q.options[LETTER_MAP[key]] ?? correctAnswer;
    }
    return { ...q, correctAnswer };
  });
}

async function generateFromPDF(fullPath) {
  const dataBuffer = fs.readFileSync(fullPath);
  const pdfData = await pdfParse(dataBuffer);
  const limitedText = pdfData.text.substring(0, 100000);

  const prompt = `
    You are an expert tutor. Based on the following material text, generate a 10-question multiple choice quiz.
    Return ONLY a raw JSON array with no markdown formatting, no code blocks, no additional text.

    STRICT RULES:
    1. Each "options" array must contain EXACTLY 4 full-text answer strings (NOT letter labels like A, B, C, D).
    2. The "correctAnswer" field must be the EXACT same string as one of the items in the "options" array. They must match character-for-character.
    3. Do NOT use letter labels (A, B, C, D) anywhere in the JSON values.

    Example of CORRECT format:
    [
      {
        "question": "What is the powerhouse of the cell?",
        "options": ["Nucleus", "Mitochondria", "Ribosome", "Cell Wall"],
        "correctAnswer": "Mitochondria",
        "explanation": "Mitochondria produce ATP through cellular respiration, which is why they are called the powerhouse of the cell. The nucleus stores DNA, ribosomes synthesize proteins, and cell walls provide structural support in plant cells."
      }
    ]

    Material Text:
    "${limitedText}"
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  let jsonText = response.text;
  // Strip markdown code fences if present
  jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();

  return normalizeQuiz(JSON.parse(jsonText));
}

// ─── GET /quiz/:materialId ────────────────────────────────────────────────────
// Returns cached quiz if available, otherwise generates, saves, and returns it.

const getOrGenerateQuiz = async (req, res) => {
  const { materialId } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT title, file_path, quiz_cache FROM Materials WHERE id = ? AND user_id = ?',
      [materialId, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Material not found or access denied.' });
    }

    const material = rows[0];

    // ── Cache hit ──────────────────────────────────────────────────────────
    if (material.quiz_cache) {
      const cached = typeof material.quiz_cache === 'string'
        ? JSON.parse(material.quiz_cache)
        : material.quiz_cache;
      return res.status(200).json({ quiz: cached, title: material.title, cached: true });
    }

    // ── Cache miss: generate ───────────────────────────────────────────────
    const fullPath = path.join(__dirname, '../uploads', material.file_path);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: 'PDF file not found on server.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const quiz = await generateFromPDF(fullPath);

    // Persist to DB
    await db.query(
      'UPDATE Materials SET quiz_cache = ? WHERE id = ?',
      [JSON.stringify(quiz), materialId]
    );

    return res.status(200).json({ quiz, title: material.title, cached: false });

  } catch (err) {
    console.error('[getOrGenerateQuiz]', err);
    return res.status(500).json({ message: 'Failed to generate quiz from PDF.' });
  }
};

// ─── POST /quiz/:materialId/regenerate ───────────────────────────────────────
// Forces a fresh quiz generation, overwriting the cache.

const regenerateQuiz = async (req, res) => {
  const { materialId } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT title, file_path FROM Materials WHERE id = ? AND user_id = ?',
      [materialId, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Material not found or access denied.' });
    }

    const material = rows[0];
    const fullPath = path.join(__dirname, '../uploads', material.file_path);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: 'PDF file not found on server.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const quiz = await generateFromPDF(fullPath);

    await db.query(
      'UPDATE Materials SET quiz_cache = ? WHERE id = ?',
      [JSON.stringify(quiz), materialId]
    );

    return res.status(200).json({ quiz, title: material.title, cached: false });

  } catch (err) {
    console.error('[regenerateQuiz]', err);
    return res.status(500).json({ message: 'Failed to regenerate quiz.' });
  }
};

module.exports = { getOrGenerateQuiz, regenerateQuiz };
