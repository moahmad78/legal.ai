import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.warn("RESEND_API_KEY is not set. Email delivery will be mocked or fail.");
}

export const resend = new Resend(apiKey || "re_mock_key");
