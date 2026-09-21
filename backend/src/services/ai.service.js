const { GoogleGenAI, Type } = require("@google/genai");
const { z } = require("zod");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

// --- Zod Schemas ---

const questionSchema = z.object({
    question: z.string(),
    intention: z.string(),
    answer: z.string(),
});

const interviewReportSchema = z.object({
    title: z.string(),
    matchScore: z.number().min(0).max(100),
    technicalQuestions: z.array(questionSchema),
    behavioralQuestions: z.array(questionSchema),
    skillGaps: z.array(
        z.object({
            skill: z.string(),
            severity: z.enum(["low", "medium", "high"]),
        })
    ),
    preparationPlan: z.array(
        z.object({
            day: z.number().int().positive(),
            focus: z.string(),
            tasks: z.array(z.string()),
        })
    ),
});

// --- Direct Gemini Native Schema ---

const geminiReportSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "Job title" },
        matchScore: { type: Type.NUMBER, description: "Match score between 0 and 100" },
        technicalQuestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    intention: { type: Type.STRING },
                    answer: { type: Type.STRING },
                },
                required: ["question", "intention", "answer"],
            },
        },
        behavioralQuestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    intention: { type: Type.STRING },
                    answer: { type: Type.STRING },
                },
                required: ["question", "intention", "answer"],
            },
        },
        skillGaps: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    skill: { type: Type.STRING },
                    severity: { type: Type.STRING, enum: ["low", "medium", "high"] },
                },
                required: ["skill", "severity"],
            },
        },
        preparationPlan: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.INTEGER },
                    focus: { type: Type.STRING },
                    tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["day", "focus", "tasks"],
            },
        },
    },
    required: [
        "title",
        "matchScore",
        "technicalQuestions",
        "behavioralQuestions",
        "skillGaps",
        "preparationPlan",
    ],
};

// --- Backoff Helper for 503 Overload Spikes ---

async function callWithRetry(fn, retries = 4, baseDelayMs = 2000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            const errStr = String(error?.message || error);
            const isTransient =
                error?.status === "UNAVAILABLE" ||
                errStr.includes("503") ||
                errStr.includes("high demand") ||
                errStr.includes("RESOURCE_EXHAUSTED");

            if (isTransient && attempt < retries) {
                const delay = baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 500;
                console.warn(`[Gemini API] 503 High Demand spike. Retrying in ${Math.round(delay)}ms (Attempt ${attempt}/${retries})...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
                throw error;
            }
        }
    }
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch();

    try {
        const page = await browser.newPage();

        await page.setContent(htmlContent, {
            waitUntil: "networkidle0",
        });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "15mm",
                bottom: "15mm",
                left: "15mm",
                right: "15mm",
            },
        });

        return pdfBuffer;
    } finally {
        await browser.close();
    }
}

// --- Generator Function ---

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `You are an expert technical interviewer and recruiter. Evaluate the candidate and generate an interview report.

Target Job Description:
${jobDescription || "N/A"}

Candidate Resume:
${resume || "N/A"}

Candidate Self-Description:
${selfDescription || "N/A"}
`;

    const config = {
        responseMimeType: "application/json",
        responseSchema: geminiReportSchema,
    };

    const response = await callWithRetry(async () => {
        return await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt,
            config,
        });
    });

    if (!response?.text) {
        throw new Error("Received empty or invalid response from Gemini API.");
    }

    let cleanText = response.text.trim();
    if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const rawJson = JSON.parse(cleanText);
    const dataToValidate = Array.isArray(rawJson) ? rawJson[0] : rawJson;

    return interviewReportSchema.parse(dataToValidate);
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    const prompt = `You are an expert resume writer and ATS resume specialist.

Generate a professional, ATS-friendly resume for the candidate using the information below.

Target Job Description:
${jobDescription || "N/A"}

Candidate Resume / Existing Resume:
${resume || "N/A"}

Candidate Self-Description:
${selfDescription || "N/A"}

Requirements:
1. Tailor the resume specifically to the target job description.
2. Highlight the candidate's most relevant skills, experience, projects, and achievements.
3. Do not invent companies, job titles, degrees, certifications, skills, dates, achievements, or other facts that are not supported by the candidate's information.
4. You may rewrite and reorganize existing information to make it stronger and more relevant.
5. The content should sound naturally written by a professional resume writer, not AI-generated.
6. Keep the resume concise and ideally suitable for a single page when converted to PDF.
7. Use standard ATS-friendly sections such as:
   - Professional Summary
   - Skills
   - Work Experience
   - Projects
   - Education
   - Certifications
   Only include sections for which relevant information is available.
8. Prioritize relevant information based on the target job description.
9. Use clear headings, bullet points, and concise achievement-oriented language.
10. Avoid tables, columns, graphics, icons, images, text boxes, progress bars, and other elements that can interfere with ATS parsing.
11. The HTML must be self-contained and should not depend on external CSS, JavaScript, images, fonts, or other external resources.
12. Use semantic HTML such as h1, h2, h3, p, ul, li, and section.
13. Include clean inline or internal CSS suitable for conversion to PDF using Puppeteer.
14. Use a simple professional design with good spacing and readable typography.
15. The output must contain ONLY the resume HTML inside the "html" field.
16. Do not include markdown code fences around the HTML.
17. Do not include explanations outside the JSON response.

Generate a complete HTML document that can be directly passed to Puppeteer and converted to PDF.
`;

    const resumePdfSchema = {
        type: Type.OBJECT,
        properties: {
            html: {
                type: Type.STRING,
                description:
                    "Complete self-contained HTML document containing the ATS-friendly resume.",
            },
        },
        required: ["html"],
    };

    const response = await callWithRetry(async () => {
        return await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: resumePdfSchema,
            },
        });
    });

    if (!response?.text) {
        throw new Error("Received empty or invalid response from Gemini API.");
    }

    let cleanText = response.text.trim();

    if (cleanText.startsWith("```")) {
        cleanText = cleanText
            .replace(/^```(?:json)?\s*/, "")
            .replace(/\s*```$/, "");
    }

    let jsonContent;

    try {
        jsonContent = JSON.parse(cleanText);
    } catch (error) {
        throw new Error(
            `Failed to parse Gemini resume response as JSON: ${error.message}`
        );
    }

    if (!jsonContent?.html || typeof jsonContent.html !== "string") {
        throw new Error("Gemini returned an invalid resume HTML response.");
    }

    const html = jsonContent.html.trim();

    if (!html.includes("<html") && !html.includes("<!DOCTYPE html")) {
        throw new Error("Gemini returned invalid or incomplete HTML.");
    }

    const pdfBuffer = await generatePdfFromHtml(html);

    if (!pdfBuffer) {
        throw new Error("Failed to generate PDF from resume HTML.");
    }

    return pdfBuffer;
}

module.exports = {
    generateInterviewReport,
    interviewReportSchema,
    generateResumePdf,
};
