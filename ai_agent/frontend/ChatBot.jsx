import { useState, useRef, useEffect } from 'react';
import { chatApi, USE_MOCK } from '../../services/api';
import { mockChatResponses } from '../../data/mockData';
import { useAnalysis } from '../../context/AnalysisContext';
import { SectionHeader, Sticker } from '../Decorative/Decorative';
import './ChatBot.css';

function localMockReply(userMsg, linkedinResult, githubResult) {
  const lowered = userMsg.toLowerCase();
  const name = linkedinResult?.name || githubResult?.name || 'Developer';

  if (lowered.includes('github') && githubResult) {
    const langs = githubResult.topLanguages?.map((l) => `${l.name} (${l.percentage}%)`).join(', ');
    return `GitHub Review for @${githubResult.username}: Score ${githubResult.overallScore}/100. Top languages: ${langs}. Primary recommendation: ${githubResult.skillGaps[0]?.recommendation}`;
  }

  if (lowered.includes('linkedin') && linkedinResult) {
    return `LinkedIn Review for ${linkedinResult.name}: Aligned to ${linkedinResult.headline} (Score: ${linkedinResult.overallScore}/100). Focus on closing: ${linkedinResult.skillGaps[0]?.skill} - ${linkedinResult.skillGaps[0]?.recommendation}`;
  }

  if (lowered.includes('roadmap') || lowered.includes('week') || lowered.includes('next')) {
    const topGap = linkedinResult?.skillGaps[0]?.skill || githubResult?.skillGaps[0]?.skill || 'System Design';
    return `${name}, in Week 1 focus on "${topGap}". Build a public working repository, write automated tests, and document the architecture.`;
  }

  if (lowered.includes('review') || lowered.includes('summary')) {
    if (linkedinResult && githubResult) {
      return `Overall Review for ${name}: LinkedIn score is ${linkedinResult.overallScore}/100, GitHub score is ${githubResult.overallScore}/100. Your main strengths are ${linkedinResult.strengths?.slice(0, 2).join(', ')}. Top gap to tackle is ${githubResult.skillGaps[0]?.skill || linkedinResult.skillGaps[0]?.skill}.`;
    }
  }

  return mockChatResponses[Math.floor(Math.random() * mockChatResponses.length)];
}

export default function ChatBot() {
  const { linkedinResult, githubResult } = useAnalysis();
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Hey! I'm your Local AI Career Agent. Run your LinkedIn or GitHub review above, then ask me about your gaps, roadmap, or technical growth!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (messageToSend) => {
    const userMsg = (messageToSend || input).trim();
    if (!userMsg || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      let botText;
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 500));
        botText = localMockReply(userMsg, linkedinResult, githubResult);
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
      // Graceful fallback to local mock engine if backend encounters network issues
      const localReply = localMockReply(userMsg, linkedinResult, githubResult);
      setMessages((prev) => [...prev, { role: 'bot', text: localReply }]);
    } finally {
      setLoading(false);
    }
  };

  const hasAnalysis = Boolean(linkedinResult || githubResult);

  const suggestions = hasAnalysis
    ? [
        'Review my overall profile',
        'How is my GitHub profile?',
        'What are my LinkedIn strengths?',
        'Explain my 4-week roadmap',
        'What should I build first?',
      ]
    : [
        'How does SkillGap AI work?',
        'Why is System Design important?',
        'What skills have highest market demand?',
        'How can I improve my GitHub score?',
      ];

  return (
    <section id="chat" className="chatbot">
      <Sticker color="lime" rotation={5} className="chatbot__sticker">Local AI Agent</Sticker>

      <SectionHeader
        tag="// local_ai_agent"
        title="Local AI Career Assistant"
        subtitle="Ask questions about your profile review, skill gaps, code quality, and learning roadmap. Primed with your personal profile analyses."
        rotate={1}
      />

      <div className="chatbot__container brutal-card reveal">
        <div className="chatbot__header">
          <div className="chatbot__header-left">
            <div className="chatbot__avatar">AI</div>
            <div>
              <strong>SkillGap Local AI Agent</strong>
              <span className="chatbot__status">
                {hasAnalysis ? '● Primed with your analysis' : '● Ready to analyze'}
              </span>
            </div>
          </div>
          {hasAnalysis && (
            <div className="chatbot__context-tag">
              {linkedinResult && githubResult
                ? `${linkedinResult.name} & @${githubResult.username}`
                : linkedinResult
                ? linkedinResult.name
                : `@${githubResult?.username}`}
            </div>
          )}
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

        <div className="chatbot__suggestions">
          {suggestions.map((prompt, i) => (
            <button
              key={i}
              type="button"
              className="chatbot__chip"
              onClick={() => handleSend(prompt)}
              disabled={loading}
            >
              {prompt}
            </button>
          ))}
        </div>

        <form
          className="chatbot__input-area"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            type="text"
            className="chatbot__input"
            placeholder="Ask anything about your skill gaps, review, or roadmap..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="brutal-btn brutal-btn--dark" disabled={loading || !input.trim()}>
            {loading ? 'Thinking...' : 'Send'}
          </button>
        </form>
      </div>
    </section>
  );
}
