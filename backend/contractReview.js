import express from "express";
import { Configuration, OpenAIApi } from "openai";

const router = express.Router();

const openai = new OpenAIApi(
  new Configuration({
    
  })
);

router.post("/analyze", async (req, res) => {
  const { contractText } = req.body;
  if (!contractText) return res.status(400).json({ error: "No contract text provided" });

  const prompt = `
You are a legal contract analysis assistant.
Given the following contract, extract the following:
- Key clauses: Termination, Payment, Confidentiality.
- List any missing standard clauses (e.g., Dispute Resolution).
- Flag any risky language.

Contract:
"""${contractText}"""

Respond in JSON:
{
  "clauses": {
    "termination": "...",
    "payment": "...",
    "confidentiality": "..."
  },
  "missing_clauses": ["..."],
  "risky_language": ["..."]
}
`;

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });
    const text = completion.data.choices[0].message.content;
    // Extract JSON from the response
    const json = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
    res.json(json);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;