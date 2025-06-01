export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const answers = req.body.answers;

  const prompt = `
You are AIptitude, an AI fluency assessment tool. Based on the following user answers, return a JSON with:
1. An "AIptitude Score" from 0–100.
2. A tier name: AI Newcomer, AI Explorer, Prompt Pro, or AI Native.
3. 2–3 blind spots about the user's AI usage.
4. A next step they should take to level up.

User Answers:
${JSON.stringify(answers)}
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    })
  });

  const data = await response.json();
  const output = data.choices[0].message.content;

  try {
    const json = JSON.parse(output);
    res.status(200).json(json);
  } catch (err) {
    res.status(500).json({ error: "Failed to parse GPT response" });
  }
}
