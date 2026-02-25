const { Langfuse } = require("langfuse-node");
const dotenv = require("dotenv");

dotenv.config();

const isLangfuseEnabled = process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY;

const langfuse = isLangfuseEnabled ? new Langfuse({
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    secretKey: process.env.LANGFUSE_SECRET_KEY,
    baseUrl: process.env.LANGFUSE_BASE_URL || "https://cloud.langfuse.com",
}) : null;

module.exports = langfuse;
