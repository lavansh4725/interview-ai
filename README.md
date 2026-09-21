# RoleReady AI

RoleReady AI is a full-stack GenAI interview preparation platform that analyzes a candidate's resume, self-description, and target job description to generate a personalized interview strategy.

## Overview

RoleReady AI helps job seekers prepare for specific roles by generating structured interview preparation reports. Users can register, log in, upload a resume PDF, add a self-description, paste a target job description, and receive an AI-generated report containing technical questions, behavioral questions, skill gaps, a match score, and a preparation roadmap.

The application also supports generating a tailored resume PDF from the saved interview report data.

## Key Features

- User registration and login with JWT-based cookie authentication
- Protected interview preparation dashboard
- Resume PDF upload with a 3 MB file limit
- Resume text extraction from uploaded PDFs
- AI-generated interview preparation reports
- Match score based on candidate profile and job description
- Technical interview questions with intentions and model answers
- Behavioral interview questions with intentions and model answers
- Skill gap analysis with severity levels
- Multi-day preparation roadmap
- Recent interview report history
- Detailed interview report view
- AI-generated ATS-friendly resume PDF download
- MongoDB persistence for users, reports, and blacklisted tokens

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- SCSS / Sass

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcryptjs
- cookie-parser
- cors
- multer
- pdf-parse
- Puppeteer
- Zod
- Google GenAI SDK

## How the Project Works

1. A user registers or logs in.
2. The frontend stores authentication state and communicates with the backend using credentials-enabled Axios requests.
3. The user enters a target job description, uploads a resume PDF, and optionally adds a self-description.
4. The backend extracts text from the uploaded resume using `pdf-parse`.
5. The extracted resume text, job description, and self-description are sent to Google GenAI.
6. The AI service requests a structured JSON response containing:
   - Job title
   - Match score
   - Technical questions
   - Behavioral questions
   - Skill gaps
   - Preparation plan
7. The backend validates the AI response with Zod.
8. The validated report is saved in MongoDB and returned to the frontend.
9. The frontend displays the report in separate sections for questions, roadmap, match score, and skill gaps.
10. The user can generate and download a tailored resume PDF based on the saved report data.

## Project Structure

```text
backend/
  server.js
  package.json
  src/
    app.js
    config/
      database.js
    controllers/
      auth.controller.js
      interview.controller.js
    middlewares/
      auth.middleware.js
      file.middleware.js
    models/
      blacklist.model.js
      interviewReport.model.js
      user.model.js
    routes/
      auth.routes.js
      interview.routes.js
    services/
      ai.service.js

frontend/
  index.html
  package.json
  vite.config.js
  src/
    main.jsx
    App.jsx
    app.routes.jsx
    style.scss
    style/
      button.scss
    features/
      auth/
        auth.context.jsx
        auth.form.scss
        components/
          Protected.jsx
        hooks/
          useAuth.js
        pages/
          Login.jsx
          Register.jsx
        services/
          auth.api.js
      interview/
        interview.context.jsx
        hooks/
          useInterview.js
        pages/
          Home.jsx
          Interview.jsx
        services/
          interview.api.js
        style/
          home.scss
          interview.scss
```

## Installation and Setup

### Prerequisites

- Node.js and npm
- MongoDB connection string
- Google GenAI API key

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_GENAI_API_KEY=your_google_genai_api_key
```

Start the backend server:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:3000
```

### Frontend Setup

```bash
cd frontend
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The frontend runs on the default Vite development URL:

```text
http://localhost:5173
```

## Environment Variables

The backend requires the following environment variables:

| Variable | Description |
| --- | --- |
| `MONGODB_URI` | MongoDB database connection string |
| `JWT_SECRET` | Secret key used to sign and verify JWT tokens |
| `GOOGLE_GENAI_API_KEY` | API key used by the Google GenAI SDK |

The frontend does not currently define separate environment variables. Its API calls are configured to use `http://localhost:3000`.

## How to Run the Project

Run the backend:

```bash
cd backend
npm run dev
```

Run the frontend in a separate terminal:

```bash
cd frontend
npm run dev
```

Then open:

```text
http://localhost:5173
```

## Usage

1. Register a new account or log in with an existing account.
2. Paste the target job description.
3. Upload a resume PDF.
4. Add a short self-description if helpful.
5. Generate the interview strategy.
6. Review the generated report, including:
   - Technical questions
   - Behavioral questions
   - Match score
   - Skill gaps
   - Preparation roadmap
7. Open previous reports from the recent interview plans list.
8. Download an AI-generated resume PDF from the interview report page.

## GenAI Implementation Details

The AI functionality is implemented in the backend service layer using the Google GenAI SDK.

### Interview Report Generation

The backend sends the following information to the AI model:

- Target job description
- Extracted resume text
- Candidate self-description

The response is requested as structured JSON using a Gemini response schema. The generated data is then validated with Zod before being saved to MongoDB.

The report includes:

- Job title
- Match score from 0 to 100
- Technical interview questions
- Behavioral interview questions
- Intentions behind each question
- Model answers
- Skill gaps with severity levels
- Preparation plan with daily tasks

The service also includes retry logic for transient AI API errors such as overload or resource exhaustion.

### Resume PDF Generation

The resume generation flow asks the AI model to create a complete, self-contained HTML resume tailored to the target job description. The backend validates that HTML was returned, then converts it into a PDF using Puppeteer.

The generated PDF is returned to the frontend as a downloadable file.

## Future Improvements

- Add stronger frontend validation for required inputs and file upload state
- Add user-facing error messages for failed login, upload, or AI generation requests
- Add loading progress states during report and resume generation
- Add automated backend and frontend tests
- Add report deletion or update functionality
- Add configurable frontend API URL through environment variables
- Add token expiration cleanup for blacklisted tokens
- Improve mobile responsiveness for the report dashboard
- Add export options for interview reports
- Add root-level deployment documentation

## License

ISC
