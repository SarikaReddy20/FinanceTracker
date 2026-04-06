import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useLanguage } from "../context/LanguageContext";

function ChatbotWidget() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  const sendMessage = async (content = input) => {
    if (!content.trim()) {
      return;
    }

    setMessages((current) => [...current, { role: "user", content }]);
    setInput("");
    setLoading(true);

    try {
      const res = await API.post("/chatbot/message", { message: content });
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: res.data.message,
          route: res.data.route,
          quickReplies: res.data.quickReplies || [],
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: "Assistant is unavailable right now." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-shell">
      {open ? (
        <div className="glass-card chatbot-panel">
          <div className="toolbar" style={{ marginBottom: 12 }}>
            <strong>{t("chatTitle")}</strong>
            <button className="button-secondary" onClick={() => setOpen(false)}>X</button>
          </div>

          <div className="chatbot-messages">
            {messages.length ? messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`chat-bubble ${message.role}`}>
                <div>{message.content}</div>
                {message.route ? (
                  <button className="button-secondary" style={{ marginTop: 10 }} onClick={() => navigate(message.route)}>
                    {t("openPage")}
                  </button>
                ) : null}
                {message.quickReplies?.length ? (
                  <div className="quick-replies">
                    {message.quickReplies.map((reply) => (
                      <button key={reply} className="button-secondary" onClick={() => sendMessage(reply)}>
                        {reply}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )) : (
              <div className="chat-bubble assistant">
                <div>{t("chatTitle")}</div>
                <p className="subtle" style={{ marginBottom: 0 }}>
                  {t("askSuggestions")}: Reports, monthly expenses, why did I spend more, unusual transactions, saving suggestions.
                </p>
              </div>
            )}
          </div>

          <div className="chatbot-compose">
            <input
              className="field"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("chatPlaceholder")}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  sendMessage();
                }
              }}
            />
            <button className="button-primary" onClick={() => sendMessage()} disabled={loading}>
              {loading ? "..." : t("send")}
            </button>
          </div>
        </div>
      ) : null}

      <button className="button-primary chatbot-toggle" onClick={() => setOpen((current) => !current)}>
        {t("chatTitle")}
      </button>
    </div>
  );
}

export default ChatbotWidget;
