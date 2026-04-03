const { parseAadharText } = require('../utils/geminiService');

const parseDocument = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ status: false, message: "No text provided" });
        }

        const extractedData = await parseAadharText(text);

        if (extractedData.error) {
            return res.status(500).json({ status: false, message: extractedData.error + (extractedData.details ? ": " + extractedData.details : "") });
        }

        res.json({ status: true, data: extractedData });
    } catch (error) {
        console.error("Document Parse Error:", error);
        res.status(500).json({ status: false, message: "Server Error during parsing" });
    }
};

module.exports = { parseDocument };
