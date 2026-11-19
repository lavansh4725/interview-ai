<div align="center">

# 🤖 RoleReady AI
### Full-Stack GenAI Mock Interview & Career Preparation Platform

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini_API-3.6--Flash-8E75B2?style=flat&logo=google&logoColor=white)](https://ai.google.dev/)
[![Puppeteer](https://img.shields.io/badge/Puppeteer-Headless%20PDF-40B5A4?style=flat&logo=puppeteer&logoColor=white)](https://pptr.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat)](LICENSE)

<p align="center">
  <b>RoleReady AI bridges the candidate-to-job gap by analyzing resume PDFs, personal narratives, and job descriptions to generate role-specific interview strategies and dynamic ATS-friendly resumes.</b>
</p>

</div>

---

## 📖 Overview

Standard interview preparation platforms often present generic questions that do not reflect a candidate's actual background or target role requirements. **RoleReady AI** solves this with an end-to-end full-stack platform that ingests:
1. **Candidate Resume (PDF text extraction)**
2. **Personal Narrative / Self-Description**
3. **Target Job Description (JD)**

Using Google's **`gemini-3.6-flash`** model with strict native schema enforcement, the platform produces a tailored preparation strategy: role match scoring, technical and behavioral questions with interviewer intentions and model answers, classified skill gaps, and a multi-day study plan. In addition, it dynamically compiles an **ATS-optimized single-page PDF resume** on demand using headless **Puppeteer**.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│        React 19 Frontend        │           │       Express 5 REST API        │
│   Vite • SCSS • React Router    │ ◄───────► │    JWT in HTTP-only Cookies     │
└────────────────┬────────────────┘   JSON    └────────────────┬────────────────┘
                 │                                             │
                 ▼                                             ▼
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│     Resume Ingestion & Parse    │           │       MongoDB Atlas Storage     │
│   Multer Buffer • pdf-parse     │           │ Users • Reports • Token Block   │
└────────────────┬────────────────┘           └────────────────┬────────────────┘
                 │                                             │
                 ▼                                             ▼
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│      Google GenAI Service       │           │     Headless PDF Generator      │
│  gemini-3.6-flash • Zod Schemas │ ────────► │     Puppeteer A4 Compilation    │
└─────────────────────────────────┘           └─────────────────────────────────┘
```

---

## ✨ Key Features

- 🔐 **Secure Authentication:** JWT authentication via HTTP-only cookies with token blacklisting in MongoDB upon logout (automatic TTL expiration).
- 📄 **Automated Resume Parsing:** In-memory PDF upload and text extraction (up to 3MB) via `multer` and `pdf-parse`.
- 🎯 **Targeted Question Synthesis:** Custom technical and behavioral questions tailored directly to the JD, complete with underlying interview intentions and model STAR answers.
- 📊 **Match Scoring & Gap Analysis:** Algorithmic role compatibility rating (0–100%) and severity-ranked skill gaps (`low`, `medium`, `high`).
- 🗓️ **Personalized Preparation Roadmap:** Day-by-day structured milestone timeline focusing on high-priority review topics.
- 🖨️ **Dynamic ATS Resume Export:** Generates semantic HTML optimized for ATS screening and compiles a downloadable A4 PDF using Puppeteer.
- ⚡ **High-Demand Resilience:** Exponential backoff retry handler (`callWithRetry`) mitigating transient 503 high-load spikes.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, React Router 8, SCSS / Sass, Axios |
| **Backend** | Node.js (v20+), Express 5, Multer, pdf-parse, Cookie-Parser |
| **Database** | MongoDB, Mongoose 9 (Users, Reports, Blacklisted Tokens) |
| **AI & Automation** | `@google/genai` (model: `gemini-3.6-flash`), Zod, Puppeteer 25 |
| **Security** | JSON Web Tokens (JWT), Bcrypt.js, CORS with credentials |

---

## 🔬 Core Engineering Highlights

### 1. Gemini Native Structured Schema Validation
Uses Google GenAI's native schema definition to enforce strict JSON contract compliance directly from `gemini-3.6-flash`:

```javascript
const geminiReportSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        matchScore: { type: Type.NUMBER, description: "Score between 0 and 100" },
        technicalQuestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    intention: { type: Type.STRING },
                    answer: { type: Type.STRING }
                },
                required: ["question", "intention", "answer"]
            }
        },
        skillGaps: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    skill: { type: Type.STRING },
                    severity: { type: Type.STRING, enum: ["low", "medium", "high"] }
                },
                required: ["skill", "severity"]
            }
        },
        preparationPlan: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.INTEGER },
                    focus: { type: Type.STRING },
                    tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["day", "focus", "tasks"]
            }
        }
    },
    required: ["title", "matchScore", "technicalQuestions", "skillGaps", "preparationPlan"]
};
```

### 2. Headless ATS Resume PDF Compilation (Puppeteer)
Instead of static client-side canvas snapshots, the server compiles clean HTML into an ATS-friendly A4 document:

```javascript
async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch();
    try {
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: "networkidle0" });
        return await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: "15mm", bottom: "15mm", left: "15mm", right: "15mm" }
        });
    } finally {
        await browser.close();
    }
}
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Payload |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account | `{ username, email, password }` |
| `POST` | `/api/auth/login` | Log in and receive HTTP-only JWT | `{ email, password }` |
| `GET` | `/api/auth/logout` | Invalidate token and clear cookie | Header Cookie |
| `POST` | `/api/interview/generate` | Generate interview preparation report | `multipart/form-data`: `resume` (PDF), `selfDescription`, `jobDescription` |
| `GET` | `/api/interview/reports` | List all reports for logged-in user | Header Cookie |
| `GET` | `/api/interview/report/:id` | Fetch specific interview report | URL Parameter |
| `GET` | `/api/interview/report/:id/resume-pdf` | Download tailored ATS-friendly PDF resume | URL Parameter (Streams PDF) |

---

## 📂 Project Structure

```text
interview-ai/
├── backend/
│   ├── src/
│   │   ├── config/database.js         # Mongoose connection setup
│   │   ├── controllers/               # Auth & Interview controllers
│   │   ├── middlewares/               # JWT validation & Multer upload limits
│   │   ├── models/                    # User, InterviewReport & Blacklist schemas
│   │   ├── routes/                    # Auth & Interview route endpoints
│   │   ├── services/ai.service.js     # Gemini API integration & Puppeteer PDF generator
│   │   └── app.js                     # Express app configuration
│   ├── server.js                      # Application server entrypoint
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── features/auth/             # Login, Register, Auth Context & Hooks
│   │   ├── features/interview/        # Dashboard, Report Views, Context & API
│   │   ├── style/                     # Modular SCSS stylesheets
│   │   ├── App.jsx                    # Root component & Route definitions
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
├── README.md
└── LICENSE
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v20+`
- Local MongoDB or MongoDB Atlas URI
- Google Gemini API Key ([Google AI Studio](https://aistudio.google.com/))

### 1. Backend Setup
```bash
cd backend
npm install

# Create .env file
cat <<EOF > .env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/roleready_ai
JWT_SECRET=your_jwt_secret_key
GOOGLE_GENAI_API_KEY=your_gemini_api_key
EOF

npm run dev
# Server runs on http://localhost:3000
```

### 2. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
# App launches on http://localhost:5173
```

---

<div align="center">

### 👨‍💻 Connect with the Author

**Lavansh Jindal**  
*Data Analyst | Software Developer | Full-Stack Developer | Business Intelligence Analyst*

[![Portfolio](https://img.shields.io/badge/Portfolio-lavansh--jindal.vercel.app-000000?style=flat&logo=vercel&logoColor=white)](https://lavansh-jindal.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-lavansh4725-181717?style=flat&logo=github&logoColor=white)](https://github.com/lavansh4725)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Lavansh%20Jindal-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/lavansh-jindal/)
[![LeetCode](https://img.shields.io/badge/LeetCode-lavansh__0395-FFA116?style=flat&logo=leetcode&logoColor=white)](https://leetcode.com/u/lavansh_0395/)
[![Email](https://img.shields.io/badge/Email-lavansh4725jindal%40gmail.com-D14836?style=flat&logo=gmail&logoColor=white)](mailto:lavansh4725jindal@gmail.com)

<sub>*"Bridging full-stack software development and data analytics — architecting resilient dimensional data warehouses, intelligent GenAI platforms, and high-impact business intelligence."*</sub>

</div>
