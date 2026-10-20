import { useState } from "react";
import { Bot, ChevronDown, LoaderCircle, Sparkles, X } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useChatStore } from "../store/useChatStore";

const actions = [
  { id: "summarize", label: "Summarize chat", description: "Key points and action items" },
  { id: "suggest_reply", label: "Suggest reply", description: "Draft a natural response" },
  { id: "translate", label: "Translate", description: "Translate the latest message" },
  { id: "rewrite", label: "Rewrite message", description: "Change your draft's tone" },
  { id: "answer", label: "Ask about chat", description: "Answer using this conversation" },
];

const AIAssistant = ({ draft, onUseResult }) => {
  const { selectedUser } = useChatStore();
  const [isOpen, setIsOpen] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [question, setQuestion] = useState("");
  const [language, setLanguage] = useState("English");
  const [tone, setTone] = useState("Friendly");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const runAction = async (action) => {
    if (!selectedUser) return;
    if (action === "rewrite" && !draft.trim()) {
      toast.error("Write a message first, then choose a tone.");
      return;
    }
    if (action === "answer" && !question.trim()) {
      toast.error("Enter a question about this chat.");
      return;
    }

    setIsLoading(true);
    setResult("");
    try {
      const res = await axiosInstance.post(`/ai/conversations/${selectedUser._id}`, {
        action,
        prompt: action === "rewrite" ? draft : question,
        language,
        tone,
      });
      setResult(res.data.result);
      if (["suggest_reply", "translate", "rewrite"].includes(action)) onUseResult(res.data.result);
    } catch (error) {
      toast.error(error.response?.data?.error || "AI assistant could not complete that request.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectAction = (id) => {
    setActiveAction(id);
    setResult("");
    if (["summarize", "suggest_reply"].includes(id)) runAction(id);
  };

  return (
    <div className="relative">
      <button type="button" className="btn btn-sm gap-1 text-primary" onClick={() => setIsOpen((open) => !open)} aria-label="Open AI assistant">
        <Sparkles size={16} /> AI <ChevronDown size={14} />
      </button>
      {isOpen && (
        <div className="absolute bottom-12 right-0 z-30 w-80 rounded-xl border border-base-300 bg-base-100 p-3 shadow-2xl">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold"><Bot size={18} className="text-primary" /> Chat assistant</div>
            <button type="button" className="btn btn-ghost btn-xs btn-circle" onClick={() => setIsOpen(false)}><X size={16} /></button>
          </div>
          {!activeAction && actions.map((action) => (
            <button key={action.id} type="button" onClick={() => selectAction(action.id)} className="w-full rounded-lg px-3 py-2 text-left hover:bg-base-200">
              <div className="text-sm font-medium">{action.label}</div><div className="text-xs opacity-60">{action.description}</div>
            </button>
          ))}
          {activeAction && (
            <div className="space-y-3">
              <button type="button" className="text-xs opacity-60 hover:underline" onClick={() => { setActiveAction(null); setResult(""); }}>← All AI tools</button>
              <div className="font-medium text-sm">{actions.find((action) => action.id === activeAction)?.label}</div>
              {activeAction === "translate" && <input className="input input-bordered input-sm w-full" value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="Language" />}
              {activeAction === "rewrite" && <select className="select select-bordered select-sm w-full" value={tone} onChange={(e) => setTone(e.target.value)}><option>Friendly</option><option>Professional</option><option>Confident</option><option>Concise</option><option>Empathetic</option></select>}
              {activeAction === "answer" && <textarea className="textarea textarea-bordered textarea-sm w-full" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What did we agree about the deadline?" />}
              {!result && <button type="button" className="btn btn-primary btn-sm w-full" disabled={isLoading} onClick={() => runAction(activeAction)}>{isLoading ? <LoaderCircle className="animate-spin" size={16} /> : "Generate"}</button>}
              {isLoading && <div className="text-center text-sm opacity-60">Thinking…</div>}
              {result && <div className="rounded-lg bg-base-200 p-3 text-sm whitespace-pre-wrap"><div className="mb-1 flex items-center gap-1 font-medium text-primary"><Sparkles size={14} /> AI result</div>{result}</div>}
              {result && <button type="button" className="btn btn-ghost btn-sm w-full" onClick={() => runAction(activeAction)}>Try again</button>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
