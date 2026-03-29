import imagekit from "../configs/imageKit.js";
import Resume from "../models/Resume.js";
import fs from "fs";

// POST: /api/resumes/create
export const createResume = async (req, res) => {
    try {
        const userId = req.userId;
        const { title } = req.body;

        const newResume = await Resume.create({ userId, title });

        return res.status(201).json({
            message: "Resume created successfully",
            resume: newResume
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// DELETE: /api/resumes/delete/:resumeId
export const deleteResume = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId } = req.params;

        await Resume.findOneAndDelete({ userId, _id: resumeId });

        return res.status(200).json({
            message: "Resume deleted successfully"
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// GET: /api/resumes/get/:resumeId
export const getResumeById = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId } = req.params;

        const resume = await Resume.findOne({ userId, _id: resumeId });

        if (!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }

        // Remove unwanted fields
        const cleanedResume = resume.toObject();
        delete cleanedResume.__v;
        delete cleanedResume.createdAt;
        delete cleanedResume.updatedAt;

        return res.status(200).json({ resume: cleanedResume });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// GET: /api/resumes/public/:resumeId
export const getPublicResumeById = async (req, res) => {
    try {
        const { resumeId } = req.params;

        const resume = await Resume.findOne({
            public: true,
            _id: resumeId
        });

        if (!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }

        return res.status(200).json({ resume });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// PUT: /api/resumes/update
export const updateResume = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId, resumeData, removeBackground } = req.body;
        const image = req.file;

        // ✅ Safe parsing
        let parsedData = {};
        if (resumeData) {
            parsedData = JSON.parse(resumeData);
        }

        // ✅ Ensure required structures exist
        if (!parsedData.projects || !Array.isArray(parsedData.projects)) {
            parsedData.projects = [];
        }

        if (!parsedData.personal_info) {
            parsedData.personal_info = {};
        }

        // ✅ Handle image upload
        if (image) {
            const imageBufferData = fs.createReadStream(image.path);

            const response = await imagekit.upload({
                file: imageBufferData,
                fileName: "resume.png",
                folder: "user-resumes",
                transformation: {
                    pre:
                        "w-300, h-300, fo-face, z-0.75" +
                        (removeBackground ? ",e-bgremove" : "")
                }
            });

            parsedData.personal_info.image = response.url;
        }

        // ✅ CRITICAL FIX: Use $set (prevents overwrite)
        const updatedResume = await Resume.findOneAndUpdate(
            { userId, _id: resumeId },
            { $set: parsedData },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedResume) {
            return res.status(404).json({
                message: "Resume not found or unauthorized"
            });
        }

        return res.status(200).json({
            message: "Saved Successfully",
            resume: updatedResume
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};