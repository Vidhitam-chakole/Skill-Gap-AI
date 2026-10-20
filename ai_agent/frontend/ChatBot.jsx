import { useState, useRef, useEffect } from 'react';
import { chatApi } from '../../services/api';
import { useAnalysis } from '../../context/AnalysisContext';
import { SectionHeader, Sticker } from '../Decorative/Decorative';
import './ChatBot.css';

export default function ChatBot() {
  const { linkedinResult, githubResult } = useAnalysis();
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Hey! I'm your AI Career Assistant. Click any predefined question below for instant profile reviews and roadmap guidance, or ask me any custom question about system design, code quality, or engineering careers!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [backendConfig, setBackendConfig] = useState({ groqConfigured: false, model: 'llama-3.3-70b-versatile' });
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem('groq_api_key') || '');
  const [keyInput, setKeyInput] = useState(customApiKey);
  const [showSettings, setShowSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch backend Groq configuration on mount
  useEffect(() => {
    chatApi
      .getConfig()
      .then((cfg) => {
        if (cfg) setBackendConfig(cfg);
      })
      .catch(() => {
        // Backend offline or fallback
      });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const hasGroqActive = Boolean(customApiKey.trim() || backendConfig.groqConfigured);

  const handleSaveKey = (e) => {
    e.preventDefault();
    const trimmed = keyInput.trim();
    setCustomApiKey(trimmed);
    if (trimmed) {
      localStorage.setItem('groq_api_key', trimmed);
    } else {
      localStorage.removeItem('groq_api_key');
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSend = async (messageToSend) => {
    const userMsg = (messageToSend || input).trim();
    if (!userMsg || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const data = await chatApi.sendMessage(userMsg, conversationId, {
        linkedinAnalysisId: linkedinResult?.analysisId,
        githubAnalysisId: githubResult?.analysisId,
        apiKey: customApiKey.trim() || null,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: data.reply,
        },
      ]);
      if (data.conversationId) setConversationId(data.conversationId);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: `Error connecting to AI Assistant: ${err.message || 'Please ensure backend is running.'}`,
        },
      ]);
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
        'Explain my dynamic roadmap',
        'What should I build first?',
      ]
    : [
        'How does SkillGap AI work?',
        'Why is System Design important?',
        'What skills have highest market demand?',
        'How can I improve my GitHub score?',
        'What is the Code Verifier?',
      ];

  return (
    <section id="chat" className="chatbot">
      <Sticker color="lime" rotation={5} className="chatbot__sticker">
        ⚡ AI Assistant
      </Sticker>

      <SectionHeader
        tag="// ai_career_assistant"
        title="AI Career & Skill Assistant"
        subtitle="Instant answers for your profile review, skill gaps, and dynamic roadmap — plus Groq AI intelligence for any custom questions."
        rotate={1}
      />

      <div className="chatbot__container brutal-card reveal">
        <div className="chatbot__header">
          <div className="chatbot__header-left">
            <div className="chatbot__avatar">AI</div>
            <div>
              <div className="chatbot__title-row">
                <strong>SkillGap AI Assistant</strong>
                <span className="chatbot__engine-badge">
                  {hasGroqActive ? '⚡ Groq Connected' : '⚡ AI Active'}
                </span>
              </div>
              <span className="chatbot__status">
                {hasAnalysis ? '● Primed with your live profile' : '● Ready to assist'}
              </span>
            </div>
          </div>

          <div className="chatbot__header-actions">
            {hasAnalysis && (
              <div className="chatbot__context-tag">
                {linkedinResult && githubResult
                  ? `${linkedinResult.name} & @${githubResult.username}`
                  : linkedinResult
                  ? linkedinResult.name
                  : `@${githubResult?.username}`}
              </div>
            )}
            <button
              type="button"
              className="chatbot__settings-btn"
              onClick={() => setShowSettings(!showSettings)}
              title="Configure Groq API Key"
            >
              ⚙️ Settings
            </button>
          </div>
        </div>

        {/* Expandable Groq Configuration Panel */}
        {showSettings && (
          <div className="chatbot__settings-panel">
            <div className="chatbot__settings-header">
              <h4>⚙️ AI Assistant Settings</h4>
              <button
                type="button"
                className="chatbot__close-btn"
                onClick={() => setShowSettings(false)}
              >
                ✕
              </button>
            </div>

            <p className="chatbot__settings-desc">
              SkillGap AI Assistant answers predefined career and profile questions instantly, and uses Groq LPU inference (
              <code>{backendConfig.model || 'llama-3.3-70b-versatile'}</code>) to answer any custom engineering or career question you ask.
            </p>

            <div className="chatbot__settings-status">
              <span>AI Engine Status:</span>
              <strong className={hasGroqActive ? 'status--active' : 'status--ready'}>
                {hasGroqActive ? '● Groq AI Connected & Active' : '● Predefined Intelligence Active'}
              </strong>
            </div>

            <form onSubmit={handleSaveKey} className="chatbot__key-form">
              <label htmlFor="groq-key-input">
                <strong>Enter your Groq API Key (starts with <code>gsk_...</code>):</strong>
              </label>
              <div className="chatbot__key-row">
                <input
                  id="groq-key-input"
                  type="password"
                  placeholder="gsk_..."
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className="chatbot__key-input"
                />
                <button type="submit" className="brutal-btn brutal-btn--yellow">
                  Save Key
                </button>
                {customApiKey && (
                  <button
                    type="button"
                    className="brutal-btn"
                    onClick={() => {
                      setCustomApiKey('');
                      setKeyInput('');
                      localStorage.removeItem('groq_api_key');
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
              {saveSuccess && <span className="chatbot__saved-msg">✓ Groq API Key saved successfully!</span>}
              <small className="chatbot__help-text">
                Don&apos;t have a key? Get one free at{' '}
                <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer">
                  console.groq.com/keys
                </a>
                . Groq powers unlimited custom technical questions beyond the predefined topics.
              </small>
            </form>
          </div>
        )}

        <div className="chatbot__messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chatbot__message chatbot__message--${msg.role}`}>
              <div className="chatbot__bubble">
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="chatbot__message chatbot__message--bot">
              <div className="chatbot__bubble chatbot__typing">
                <span /><span /><span />
                <span className="chatbot__typing-text">AI is thinking...</span>
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
            placeholder="Ask any question or pick a predefined topic above..."
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
