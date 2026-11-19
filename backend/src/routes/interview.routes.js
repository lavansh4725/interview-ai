const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const interviewController = require("../controllers/interview.controller");
const upload = require("../middlewares/file.middleware");

const interviewRouter = express.Router();

/**
 * @route POST /api/interview/
 * @description Generate a new interview report based on the user's
 * self-description, resume PDF, and job description.
 * @access Private
 */
interviewRouter.post(
    "/",
    authMiddleware.authUser,
    upload.single("resume"),
    interviewController.generateInterViewReportController
);

/**
 * @route GET /api/interview/report/:interviewId
 * @description Retrieve an interview report by its interview ID.
 * @access Private
 */
interviewRouter.get(
    "/report/:interviewId",
    authMiddleware.authUser,
    interviewController.getInterviewReportByIdController
);

/**
 * @route GET /api/interview/
 * @description Retrieve all interview reports belonging to the logged-in user.
 * @access Private
 */
interviewRouter.get(
    "/",
    authMiddleware.authUser,
    interviewController.getAllInterviewReportsController
);

/**
 * @route POST /api/interview/resume/pdf/:interviewReportId
 * @description Generate a tailored resume PDF based on the interview report.
 * @access Private
 */
interviewRouter.post(
    "/resume/pdf/:interviewReportId",
    authMiddleware.authUser,
    interviewController.generateResumePdfController
);

module.exports = interviewRouter;
