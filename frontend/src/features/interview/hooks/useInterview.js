import {
    getAllInterviewReports,
    generateInterviewReport,
    getInterviewReportById,
    generateResumePdf,
} from "../services/interview.api";
import { useContext, useEffect } from "react";
import { InterviewContext } from "../interview.context";
import { useParams } from "react-router";

export const useInterview = () => {
    const context = useContext(InterviewContext);
    const { interviewId } = useParams();

    if (!context) {
        throw new Error(
            "useInterview must be used within an InterviewProvider"
        );
    }

    const {
        loading,
        setLoading,
        report,
        setReport,
        reports,
        setReports,
    } = context;

    const generateReport = async ({
        jobDescription,
        selfDescription,
        resumeFile,
    }) => {
        setLoading(true);

        try {
            const response = await generateInterviewReport({
                jobDescription,
                selfDescription,
                resumeFile,
            });

            if (response?.interviewReport) {
                setReport(response.interviewReport);
                return { success: true, interviewReport: response.interviewReport };
            } else {
                throw new Error("Invalid response received from server.");
            }
        } catch (error) {
            console.error("generateReport error:", error);
            const message = error.response?.data?.message || error.message || "Failed to generate interview strategy. Please try again.";
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const getReportById = async (interviewId) => {
        setLoading(true);

        try {
            const response = await getInterviewReportById(interviewId);
            if (response?.interviewReport) {
                setReport(response.interviewReport);
                return { success: true, interviewReport: response.interviewReport };
            } else {
                throw new Error("Report not found.");
            }
        } catch (error) {
            console.error("getReportById error:", error);
            const message = error.response?.data?.message || error.message || "Failed to load interview report.";
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const getReports = async () => {
        setLoading(true);

        try {
            const response = await getAllInterviewReports();
            if (response?.interviewReports) {
                setReports(response.interviewReports);
                return { success: true, interviewReports: response.interviewReports };
            }
        } catch (error) {
            console.error("getReports error:", error);
        } finally {
            setLoading(false);
        }
    };

    const getResumePdf = async (interviewReportId) => {
        setLoading(true);

        try {
            const response = await generateResumePdf({ interviewReportId });

            const url = window.URL.createObjectURL(
                new Blob([response], {
                    type: "application/pdf",
                })
            );

            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `resume_${interviewReportId}.pdf`
            );

            document.body.appendChild(link);
            link.click();
            link.remove();
            return { success: true };
        } catch (error) {
            console.error("getResumePdf error:", error);
            const message = error.response?.data?.message || error.message || "Failed to download tailored resume PDF.";
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId);
        } else {
            getReports();
        }
    }, [interviewId]);

    return {
        loading,
        report,
        reports,
        generateReport,
        getReportById,
        getReports,
        getResumePdf,
    };
};