import React, { useState, useEffect } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate, useParams } from 'react-router'
import { useToast } from '../../../context/toast.context'
import { useSpeech } from '../hooks/useSpeech'


// ── Navigation Items ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
    {
        id: 'technical',
        label: 'Technical Questions',
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
            </svg>
        )
    },
    {
        id: 'behavioral',
        label: 'Behavioral Questions',
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        )
    },
    {
        id: 'roadmap',
        label: 'Road Map',
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
        )
    }
]


// ── Sub-components ───────────────────────────────────────────────────────────
const QuestionCard = ({ item, index, speech }) => {
    const [open, setOpen] = useState(false)
    const bodyId = `q-body-${index}`

    const isSpeakingQuestion = speech?.speakingId === `q-${index}`
    const isSpeakingAnswer = speech?.speakingId === `a-${index}`

    return (
        <div className='q-card'>
            <div className='q-card__header-wrapper'>
                <button
                    type="button"
                    className='q-card__header'
                    onClick={() => setOpen(o => !o)}
                    aria-expanded={open}
                    aria-controls={bodyId}
                >
                    <span className='q-card__index' aria-hidden="true">
                        Q{index + 1}
                    </span>

                    <p className='q-card__question'>
                        {item.question}
                    </p>

                    <span
                        className={`q-card__chevron ${
                            open ? 'q-card__chevron--open' : ''
                        }`}
                        aria-hidden="true"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </span>
                </button>

                {speech?.isSupported && (
                    <button
                        type="button"
                        className={`speech-btn ${isSpeakingQuestion ? 'speech-btn--active' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation()
                            speech.speak(item.question, `q-${index}`)
                        }}
                        aria-label={isSpeakingQuestion ? `Stop reading question ${index + 1}` : `Listen to question ${index + 1}`}
                        title={isSpeakingQuestion ? "Stop audio" : "Listen to question"}
                    >
                        {isSpeakingQuestion ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <rect x="6" y="4" width="4" height="16" rx="1" />
                                <rect x="14" y="4" width="4" height="16" rx="1" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                            </svg>
                        )}
                        <span>{isSpeakingQuestion ? "Stop" : "Listen"}</span>
                    </button>
                )}
            </div>

            {open && (
                <div
                    className='q-card__body'
                    id={bodyId}
                    role="region"
                    aria-label={`Details for question ${index + 1}`}
                >
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--intention'>
                            Intention
                        </span>

                        <p>
                            {item.intention}
                        </p>
                    </div>

                    <div className='q-card__section'>
                        <div className='q-card__section-header'>
                            <span className='q-card__tag q-card__tag--answer'>
                                Model Answer
                            </span>

                            {speech?.isSupported && (
                                <button
                                    type="button"
                                    className={`speech-btn speech-btn--text ${isSpeakingAnswer ? 'speech-btn--active' : ''}`}
                                    onClick={() => speech.speak(item.answer, `a-${index}`)}
                                    aria-label={isSpeakingAnswer ? `Stop reading answer ${index + 1}` : `Listen to model answer ${index + 1}`}
                                    title={isSpeakingAnswer ? "Stop audio" : "Listen to answer"}
                                >
                                    {isSpeakingAnswer ? (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <rect x="6" y="4" width="4" height="16" rx="1" />
                                                <rect x="14" y="4" width="4" height="16" rx="1" />
                                            </svg>
                                            <span>Stop</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                            </svg>
                                            <span>Listen Answer</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        <p>
                            {item.answer}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}


const RoadMapDay = ({ day, speech }) => {
    const isSpeakingDay = speech?.speakingId === `day-${day.day}`

    return (
        <div className='roadmap-day'>
            <div className='roadmap-day__header'>
                <span className='roadmap-day__badge'>
                    Day {day.day}
                </span>

                <h3 className='roadmap-day__focus'>
                    {day.focus}
                </h3>

                {speech?.isSupported && (
                    <button
                        type="button"
                        className={`speech-btn speech-btn--text ${isSpeakingDay ? 'speech-btn--active' : ''}`}
                        onClick={() => {
                            const planText = `Day ${day.day}: ${day.focus}. Today's preparation tasks: ${day.tasks.join('. ')}`
                            speech.speak(planText, `day-${day.day}`)
                        }}
                        aria-label={isSpeakingDay ? `Stop day ${day.day} audio` : `Listen to day ${day.day} plan`}
                        title={isSpeakingDay ? "Stop audio" : "Listen to day plan"}
                    >
                        {isSpeakingDay ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <rect x="6" y="4" width="4" height="16" rx="1" />
                                    <rect x="14" y="4" width="4" height="16" rx="1" />
                                </svg>
                                <span>Stop</span>
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                </svg>
                                <span>Listen</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            <ul className='roadmap-day__tasks'>
                {day.tasks.map((task, i) => (
                    <li key={i}>
                        <span className='roadmap-day__bullet' />
                        {task}
                    </li>
                ))}
            </ul>
        </div>
    )
}


// ── Main Component ────────────────────────────────────────────────────────────
const Interview = () => {
    const [activeNav, setActiveNav] = useState('technical')
    const {
        report,
        getReportById,
        loading,
        getResumePdf
    } = useInterview()
    const { showToast } = useToast()
    const speech = useSpeech()

    const { interviewId } = useParams()

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId).then((res) => {
                if (res && !res.success) {
                    showToast(res.error || "Failed to load report.", "error");
                }
            })
        }
    }, [interviewId])


    if (loading || !report) {
        return (
            <main className='loading-screen' role="status" aria-live="polite">
                <h1>Loading your interview plan...</h1>
            </main>
        )
    }

    const scoreColor =
        report.matchScore >= 80
            ? 'score--high'
            : report.matchScore >= 60
                ? 'score--mid'
                : 'score--low'

    const scoreLabel =
        report.matchScore >= 80
            ? 'Strong match for this role'
            : report.matchScore >= 60
                ? 'Moderate match for this role'
                : 'Significant skill gaps identified'

    return (
        <div className='interview-page'>
            <div className='interview-layout'>

                {/* ── Left Nav ── */}
                <nav className='interview-nav' aria-label="Interview Navigation">
                    <div className="nav-content" role="tablist" aria-label="Report Sections">
                        <p className='interview-nav__label'>
                            Sections
                        </p>

                        {NAV_ITEMS.map(item => (
                            <button
                                key={item.id}
                                role="tab"
                                id={`tab-${item.id}`}
                                aria-selected={activeNav === item.id}
                                aria-controls={`panel-${item.id}`}
                                className={`interview-nav__item ${
                                    activeNav === item.id
                                        ? 'interview-nav__item--active'
                                        : ''
                                }`}
                                onClick={() => setActiveNav(item.id)}
                            >
                                <span className='interview-nav__icon' aria-hidden="true">
                                    {item.icon}
                                </span>

                                {item.label}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={async () => {
                            const res = await getResumePdf(interviewId)
                            if (res?.success) {
                                showToast("Resume PDF downloaded successfully!", "success")
                            } else {
                                showToast(res?.error || "Failed to download tailored resume PDF.", "error")
                            }
                        }}
                        className='button primary-button'
                        aria-label="Download AI-generated tailored resume as PDF"
                    >
                        <svg
                            height={"0.8rem"}
                            style={{ marginRight: "0.8rem" }}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path d="M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 12.5726 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956ZM19.4014 22.6899 19.6482 22.1242C20.0882 21.1156 20.8807 20.3125 21.8695 19.8732L22.6299 19.5353C23.0412 19.3526 23.0412 18.7549 22.6299 18.5722L21.9121 18.2532C20.8978 17.8026 20.0911 16.9698 19.6586 15.9269L19.4052 15.3156C19.2285 14.8896 18.6395 14.8896 18.4628 15.3156L18.2094 15.9269C17.777 16.9698 16.9703 17.8026 15.956 18.2532L15.2381 18.5722C14.8269 18.7549 14.8269 19.3526 15.2381 19.5353L15.9985 19.8732C16.9874 20.3125 17.7798 21.1156 18.2198 22.1242L18.4667 22.6899C18.6473 23.104 19.2207 23.104 19.4014 22.6899Z"></path>
                        </svg>

                        Download Resume
                    </button>
                </nav>


                <div className='interview-divider' />


                {/* ── Center Content ── */}
                <main className='interview-content'>

                    {activeNav === 'technical' && (
                        <section
                            id="panel-technical"
                            role="tabpanel"
                            aria-labelledby="tab-technical"
                            tabIndex={0}
                        >
                            <div className='content-header'>
                                <h2>Technical Questions</h2>

                                <span className='content-header__count'>
                                    {report.technicalQuestions.length} questions
                                </span>
                            </div>

                            <div className='q-list'>
                                {report.technicalQuestions.map((q, i) => (
                                    <QuestionCard
                                        key={i}
                                        item={q}
                                        index={i}
                                        speech={speech}
                                    />
                                ))}
                            </div>
                        </section>
                    )}


                    {activeNav === 'behavioral' && (
                        <section
                            id="panel-behavioral"
                            role="tabpanel"
                            aria-labelledby="tab-behavioral"
                            tabIndex={0}
                        >
                            <div className='content-header'>
                                <h2>Behavioral Questions</h2>

                                <span className='content-header__count'>
                                    {report.behavioralQuestions.length} questions
                                </span>
                            </div>

                            <div className='q-list'>
                                {report.behavioralQuestions.map((q, i) => (
                                    <QuestionCard
                                        key={i}
                                        item={q}
                                        index={i}
                                        speech={speech}
                                    />
                                ))}
                            </div>
                        </section>
                    )}


                    {activeNav === 'roadmap' && (
                        <section
                            id="panel-roadmap"
                            role="tabpanel"
                            aria-labelledby="tab-roadmap"
                            tabIndex={0}
                        >
                            <div className='content-header'>
                                <h2>Preparation Road Map</h2>

                                <span className='content-header__count'>
                                    {report.preparationPlan.length}-day plan
                                </span>
                            </div>

                            <div className='roadmap-list'>
                                {report.preparationPlan.map((day) => (
                                    <RoadMapDay
                                        key={day.day}
                                        day={day}
                                        speech={speech}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                </main>


                <div className='interview-divider' />


                {/* ── Right Sidebar ── */}
                <aside className='interview-sidebar' aria-label="Candidate Evaluation">

                    {/* Match Score */}
                    <div className='match-score'>
                        <p className='match-score__label'>
                            Match Score
                        </p>

                        <div
                            className={`match-score__ring ${scoreColor}`}
                            role="status"
                            aria-label={`Match Score: ${report.matchScore} percent. ${scoreLabel}`}
                        >
                            <span className='match-score__value'>
                                {report.matchScore}
                            </span>

                            <span className='match-score__pct'>
                                %
                            </span>
                        </div>

                        <p className='match-score__sub'>
                            {scoreLabel}
                        </p>
                    </div>


                    <div className='sidebar-divider' />


                    {/* Skill Gaps */}
                    <div className='skill-gaps'>
                        <p className='skill-gaps__label'>
                            Skill Gaps
                        </p>

                        <div className='skill-gaps__list'>
                            {report.skillGaps.map((gap, i) => (
                                <span
                                    key={i}
                                    className={`skill-tag skill-tag--${gap.severity}`}
                                >
                                    {gap.skill}
                                </span>
                            ))}
                        </div>
                    </div>

                </aside>

            </div>
        </div>
    )
}

export default Interview