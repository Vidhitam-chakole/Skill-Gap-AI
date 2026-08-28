import { useState, useRef, useEffect } from 'react';
import { chatApi, USE_MOCK } from '../../services/api';
import { mockChatResponses } from '../../data/mockData';
import { useAnalysis } from '../../context/AnalysisContext';
import { SectionHeader, Sticker } from '../Decorative/Decorative';
import './ChatBot.css';

function mockReply(userMsg, linkedinResult, githubResult) {
  const lowered = userMsg.toLowerCase();
  if (linkedinResult && (lowered.includes('linkedin') || lowered.includes('gap'))) {
    return `${linkedinResult.name}, your LinkedIn score is ${linkedinResult.overallScore}. Start with ${linkedinResult.skillGaps[0]?.skill}.`;
  }
  if (githubResult && (lowered.includes('github') || lowered.includes('repo'))) {
    return `@${githubResult.username} scores ${githubResult.overallScore}. Next: ${githubResult.skillGaps[0]?.recommendation}`;
  }
  return mockChatResponses[Math.floor(Math.random() * mockChatResponses.length)];
}

export default function ChatBot() {
  const { linkedinResult, githubResult } = useAnalysis();
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hey! I'm SkillGap AI assistant. Analyze a profile, then ask me about gaps, roadmaps, or career moves." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      let botText;
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 600));
        botText = mockReply(userMsg, linkedinResult, githubResult);
      } else {
        const data = await chatApi.sendMessage(userMsg, conversationId, {
          linkedinAnalysisId: linkedinResult?.analysisId,
          githubAnalysisId: githubResult?.analysisId,
        });
        botText = data.reply;
        if (data.conversationId) setConversationId(data.conversationId);
      }
      setMessages((prev) => [...prev, { role: 'bot', text: botText }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'bot', text: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="chat" className="chatbot">
      <Sticker color="lime" rotation={5} className="chatbot__sticker">AI Chat</Sticker>

      <SectionHeader
        tag="// ai_assistant"
        title="SkillGap Chat"
        subtitle="Ask about skill gaps, career paths, and learning recommendations. Chat uses your latest analyses when available."
        rotate={1}
      />

      <div className="chatbot__container brutal-card reveal">
        <div className="chatbot__header">
          <div className="chatbot__avatar">AI</div>
          <div>
            <strong>SkillGap Assistant</strong>
            <span className="chatbot__status">
              {linkedinResult || githubResult ? 'Using your analysis' : 'Online'}
            </span>
          </div>
        </div>

        <div className="chatbot__messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chatbot__message chatbot__message--${msg.role}`}>
              <div className="chatbot__bubble">{msg.text}</div>
            </div>
          ))}
          {loading && (
            <div className="chatbot__message chatbot__message--bot">
              <div className="chatbot__bubble chatbot__typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chatbot__input-area" onSubmit={handleSend}>
          <input
            type="text"
            className="chatbot__input"
            placeholder="Ask about skill gaps, careers, learning paths..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="brutal-btn brutal-btn--dark" disabled={loading || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </section>
  );
}
