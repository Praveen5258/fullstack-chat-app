import Message from "../models/message.model.js";

const ACTIONS = {
  summarize: "Summarize the conversation in concise bullet points. Include decisions, action items, and open questions when present.",
  suggest_reply: "Suggest one natural, helpful reply to the last message. Return only the reply, with no quotation marks or explanation.",
  translate: "Translate the requested message or the latest text message into the requested language. Preserve its meaning and tone. Return only the translation.",
  rewrite: "Rewrite the requested draft in the requested tone. Preserve its meaning and return only the rewritten message.",
  answer: "Answer the user's question using only the conversation context. If the context does not contain the answer, say that clearly.",
};

const createTranscript = (messages, currentUserId) =>
  messages
    .map((message) => {
      const author = message.senderId.toString() === currentUserId.toString() ? "You" : "Contact";
      return `${author}: ${message.text?.trim() || "[Image attachment]"}`;
    })
    .join("\n");

export const runConversationAssistant = async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: "AI assistant is not configured. Add OPENAI_API_KEY to the server environment." });
    }

    const { action, prompt = "", language = "English", tone = "friendly" } = req.body;
    if (!ACTIONS[action]) return res.status(400).json({ error: "Unsupported AI action." });
    if ((action === "answer" || action === "rewrite") && !prompt.trim()) {
      return res.status(400).json({ error: "Please enter a question or draft first." });
    }

    const conversationId = req.params.id;
    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId: conversationId },
        { senderId: conversationId, receiverId: req.user._id },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(80)
      .lean();

    const transcript = createTranscript(messages.reverse(), req.user._id);
    const requestDetail = [
      action === "translate" && `Target language: ${language}.`,
      action === "rewrite" && `Tone: ${tone}. Draft: ${prompt.trim()}`,
      action === "answer" && `Question: ${prompt.trim()}`,
    ]
      .filter(Boolean)
      .join("\n");

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        max_output_tokens: 500,
        input: `You are a private chat assistant. ${ACTIONS[action]}\n\n${requestDetail}\n\nConversation:\n${transcript || "No messages yet."}`,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("OpenAI API error:", data);
      return res.status(response.status).json({ error: data.error?.message || "The AI request failed." });
    }

    const result = data.output_text?.trim();
    if (!result) return res.status(502).json({ error: "The AI assistant returned no text." });
    res.status(200).json({ result });
  } catch (error) {
    console.error("AI assistant error:", error.message);
    res.status(500).json({ error: "Unable to run the AI assistant right now." });
  }
};
