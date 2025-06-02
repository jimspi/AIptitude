// api/score.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const answers = req.body.answers;
  const q3 = answers.q3;
  const formattedAnswers = Object.entries(answers).map(([key, value]) => {
    return `${key}: ${Array.isArray(value) ? value.join(", ") : value}`;
  }).join("\n");

  const prompt = `You are an expert AI career advisor. A user has completed a 10-question AI readiness quiz. Based on their responses, give them:
- An AI readiness score from 0 to 100
- A 1-word tier (e.g., Novice, Explorer, Builder, Strategist)
- 2 bullet-point blind spots
- 1 action-based next step

Responses:
${formattedAnswers}

Now respond in strict JSON format like:
{
  "score": 82,
  "tier": "Builder",
  "blind_spots": ["Doesn't trust AI-generated content", "Lacks long-term AI learning plan"],
  "next_step": "Follow 3 AI creators on LinkedIn and subscribe to an AI trend newsletter."
}`;

  try {
    const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const gptData = await gptRes.json();
    const rawText = gptData.choices[0]?.message?.content || "{}";
    const json = JSON.parse(rawText);
    return res.status(200).json(json);
  } catch (err) {
    console.error("GPT error:", err);
    return res.status(500).json({ message: "Error generating score" });
  }
}

