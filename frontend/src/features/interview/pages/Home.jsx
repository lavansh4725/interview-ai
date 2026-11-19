import React, { useState, useRef } from "react";
import "../style/home.scss";
import { useInterview } from "../hooks/useInterview.js";
import { useNavigate } from "react-router";
import { useToast } from "../../../context/toast.context";

const Home = () => {
    const { loading, generateReport, reports } = useInterview();
    const { showToast } = useToast();

    const [jobDescription, setJobDescription] = useState("");
    const [selfDescription, setSelfDescription] = useState("");
    const [selectedResume, setSelectedResume] = useState(null);
    const [formError, setFormError] = useState("");

    const resumeInputRef = useRef();

    const navigate = useNavigate();

    const handleGenerateReport = async () => {
        setFormError("");

        if (!jobDescription.trim()) {
            const msg = "Please provide the Target Job Description before generating a plan.";
            setFormError(msg);
            showToast(msg, "error");
            return;
        }

        const resumeFile = selectedResume || (resumeInputRef.current && resumeInputRef.current.files[0]);

        if (!resumeFile && !selfDescription.trim()) {
            const msg = "Please upload a Resume PDF or enter a Quick Self-Description.";
            setFormError(msg);
            showToast(msg, "error");
            return;
        }

        const result = await generateReport({
            jobDescription,
            selfDescription,
            resumeFile,
        });

        if (result?.success && result.interviewReport?._id) {
            showToast("Interview plan generated successfully!", "success");
            navigate(`/interview/${result.interviewReport._id}`);
        } else {
            const errorMsg = result?.error || "Failed to generate interview strategy. Please try again.";
            setFormError(errorMsg);
            showToast(errorMsg, "error");
        }
    };

    if (loading) {
        return (
            <main className="loading-screen" role="status" aria-live="polite">
                <h1>Loading your interview plan...</h1>
                <p style={{ color: "#7d8590", marginTop: "0.5rem" }}>
                    AI is analyzing requirements and generating your strategy (approx. 30s)...
                </p>
            </main>
        );
    }

    return (
        <div className="home-page">
            {/* Page Header */}
            <header className="page-header">
                <h1>
                    Create Your Custom{" "}
                    <span className="highlight">Interview Plan</span>
                </h1>

                <p>
                    Let our AI analyze the job requirements and your unique
                    profile to build a winning strategy.
                </p>
            </header>

            {/* Main Card */}
            <div className="interview-card">
                <div className="interview-card__body">
                    {/* Left Panel - Job Description */}
                    <div className="panel panel--left">
                        <div className="panel__header">
                            <span className="panel__icon">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect
                                        x="2"
                                        y="7"
                                        width="20"
                                        height="14"
                                        rx="2"
                                        ry="2"
                                    />
                                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                </svg>
                            </span>

                            <h2>Target Job Description</h2>

                            <span className="badge badge--required">
                                Required
                            </span>
                        </div>

                        <label htmlFor="jobDescription" className="sr-only">
                            Target Job Description
                        </label>

                        <textarea
                            id="jobDescription"
                            name="jobDescription"
                            value={jobDescription}
                            onChange={(e) => {
                                setJobDescription(e.target.value);
                            }}
                            className="panel__textarea"
                            placeholder={`Paste the full job description here...
e.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'`}
                            maxLength={5000}
                            aria-describedby="job-char-counter"
                        />

                        <div id="job-char-counter" className="char-counter" aria-live="polite">
                            {jobDescription.length} / 5000 chars
                        </div>
                    </div>

                    {/* Vertical Divider */}
                    <div className="panel-divider" />

                    {/* Right Panel - Profile */}
                    <div className="panel panel--right">
                        <div className="panel__header">
                            <span className="panel__icon">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </span>

                            <h2>Your Profile</h2>
                        </div>

                        {/* Upload Resume */}
                        <div className="upload-section">
                            <label className="section-label">
                                Upload Resume

                                <span className="badge badge--best">
                                    Best Results
                                </span>
                            </label>

                            <label
                                className="dropzone"
                                htmlFor="resume"
                                tabIndex={0}
                                role="button"
                                aria-label={
                                    selectedResume
                                        ? `Selected resume: ${selectedResume.name}. Press enter to replace.`
                                        : "Upload resume PDF, maximum 3 megabytes. Press enter to choose file."
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        resumeInputRef.current?.click();
                                    }
                                }}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                        const file = e.dataTransfer.files[0];
                                        setSelectedResume(file);
                                        if (resumeInputRef.current) {
                                            const dataTransfer = new DataTransfer();
                                            dataTransfer.items.add(file);
                                            resumeInputRef.current.files = dataTransfer.files;
                                        }
                                    }
                                }}
                            >
                                {selectedResume ? (
                                    <>
                                        <span className="dropzone__icon">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="28"
                                                height="28"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                <polyline points="14 2 14 8 20 8" />
                                                <polyline points="9 15 11 17 15 13" />
                                            </svg>
                                        </span>

                                        <p className="dropzone__title">
                                            {selectedResume.name}
                                        </p>

                                        <p className="dropzone__subtitle">
                                            {(selectedResume.size / 1024).toFixed(1)} KB &bull; Click to change
                                        </p>

                                        <span
                                            role="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setSelectedResume(null);
                                                if (resumeInputRef.current) {
                                                    resumeInputRef.current.value = "";
                                                }
                                            }}
                                            style={{
                                                fontSize: "0.75rem",
                                                color: "#ff2d78",
                                                textDecoration: "underline",
                                                cursor: "pointer",
                                                marginTop: "0.25rem",
                                            }}
                                        >
                                            Remove file
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span className="dropzone__icon">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="28"
                                                height="28"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <polyline points="16 16 12 12 8 16" />
                                                <line
                                                    x1="12"
                                                    y1="12"
                                                    x2="12"
                                                    y2="21"
                                                />
                                                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                                            </svg>
                                        </span>

                                        <p className="dropzone__title">
                                            Click to upload or drag &amp; drop
                                        </p>

                                        <p className="dropzone__subtitle">
                                            PDF (Max 3MB)
                                        </p>
                                    </>
                                )}

                                <input
                                    ref={resumeInputRef}
                                    hidden
                                    type="file"
                                    id="resume"
                                    name="resume"
                                    accept=".pdf"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setSelectedResume(e.target.files[0]);
                                        }
                                    }}
                                />
                            </label>
                        </div>

                        {/* OR Divider */}
                        <div className="or-divider">
                            <span>OR</span>
                        </div>

                        {/* Quick Self-Description */}
                        <div className="self-description">
                            <label
                                className="section-label"
                                htmlFor="selfDescription"
                            >
                                Quick Self-Description
                            </label>

                            <textarea
                                onChange={(e) => {
                                    setSelfDescription(e.target.value);
                                }}
                                id="selfDescription"
                                name="selfDescription"
                                className="panel__textarea panel__textarea--short"
                                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                            />
                        </div>

                        {/* Info Box */}
                        <div className="info-box">
                            <span className="info-box__icon">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="10"
                                    />

                                    <line
                                        x1="12"
                                        y1="8"
                                        x2="12"
                                        y2="12"
                                        stroke="#1a1f27"
                                        strokeWidth="2"
                                    />

                                    <line
                                        x1="12"
                                        y1="16"
                                        x2="12.01"
                                        y2="16"
                                        stroke="#1a1f27"
                                        strokeWidth="2"
                                    />
                                </svg>
                            </span>

                            <p>
                                Either a <strong>Resume</strong> or a{" "}
                                <strong>Self Description</strong> is required
                                to generate a personalized plan.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error Banner */}
                {formError && (
                    <div className="form-error-alert" role="alert" aria-live="assertive">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>{formError}</span>
                    </div>
                )}

                {/* Card Footer */}
                <div className="interview-card__footer">
                    <span className="footer-info">
                        AI-Powered Strategy Generation &bull; Approx 30s
                    </span>

                    <button
                        onClick={handleGenerateReport}
                        className="generate-btn"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4z" />
                        </svg>

                        Generate My Interview Strategy
                    </button>
                </div>
            </div>

            {/* Recent Reports List */}
            {reports.length > 0 && (
                <section className="recent-reports">
                    <h2>My Recent Interview Plans</h2>

                    <ul className="reports-list">
                        {reports.map((report) => (
                            <li
                                key={report._id}
                                className="report-item"
                                tabIndex={0}
                                role="button"
                                aria-label={`View plan for ${report.title || "Untitled Position"}, match score ${report.matchScore}%`}
                                onClick={() =>
                                    navigate(`/interview/${report._id}`)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        navigate(`/interview/${report._id}`);
                                    }
                                }}
                            >
                                <h3>
                                    {report.title || "Untitled Position"}
                                </h3>

                                <p className="report-meta">
                                    Generated on{" "}
                                    {new Date(
                                        report.createdAt
                                    ).toLocaleDateString()}
                                </p>

                                <p
                                    className={`match-score ${
                                        report.matchScore >= 80
                                            ? "score--high"
                                            : report.matchScore >= 60
                                            ? "score--mid"
                                            : "score--low"
                                    }`}
                                >
                                    Match Score: {report.matchScore}%
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Page Footer */}
            <footer className="page-footer">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Help Center</a>
            </footer>
        </div>
    );
};

export default Home;
