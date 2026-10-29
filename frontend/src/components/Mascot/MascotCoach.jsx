import { useState, useRef, useEffect } from 'react';
import { chatApi } from '../../services/api';
import { useAnalysis } from '../../context/AnalysisContext';
import { useRouter } from '../../router/Router';
import './MascotCoach.css';

const IDLE_TIPS = [
  "Hey! I'm skillplus ai , your AI Assistant!",
  "Tip: Upload your LinkedIn PDF to uncover hidden skill gaps!",
  "Curious about your GitHub repo quality? Run a free review!",
  "Need help planning your learning sprints? Tap me!",
  "Test your technical skills in our AI Code Verifier!",
];

export default function MascotCoach() {
  const { linkedinResult, githubResult } = useAnalysis();
  const { route, navigate } = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mascotMood, setMascotMood] = useState('idle'); // 'idle' | 'happy' | 'thinking' | 'wink'
  const [speechBubbleText, setSpeechBubbleText] = useState(IDLE_TIPS[0]);
  const [showSpeechBubble, setShowSpeechBubble] = useState(true);
  const [hasUnread, setHasUnread] = useState(true);
  const [visibleOnHome, setVisibleOnHome] = useState(false);

  // Chatbot state with user-specified greeting message
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Hey! I'm skillplus ai , your AI Assistant. Click any suggestion below for instant profile reviews and roadmap guidance, or ask me anything!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [customApiKey] = useState(() => localStorage.getItem('groq_api_key') || '');

  const messagesEndRef = useRef(null);
  const speechTimerRef = useRef(null);
  const drawerRef = useRef(null);
  const mascotBtnRef = useRef(null);
  const lastOpenedAtRef = useRef(0);

  // Visibility logic:
  // On home page: appear ONLY when "AI career analyzer and profile review tool" (BentoGrid section) comes into view.
  // On all other pages: appear immediately from the start.
  useEffect(() => {
    if (route !== 'home') {
      setVisibleOnHome(true);
      return;
    }

    setVisibleOnHome(false);

    const checkBentoVisibility = () => {
      const bentoEl = document.getElementById('bento-tools') || document.querySelector('.bento');
      if (!bentoEl) return;
      const rect = bentoEl.getBoundingClientRect();
      // Appears as soon as the bento section enters the viewport
      if (rect.top <= window.innerHeight * 0.85) {
        setVisibleOnHome(true);
      } else {
        setVisibleOnHome(false);
      }
    };

    window.addEventListener('scroll', checkBentoVisibility, { passive: true });
    checkBentoVisibility();

    return () => {
      window.removeEventListener('scroll', checkBentoVisibility);
    };
  }, [route]);

  // Cycle idle speech bubble tips every 11 seconds
  useEffect(() => {
    if (isOpen) {
      setShowSpeechBubble(false);
      return;
    }

    let tipIndex = 0;
    speechTimerRef.current = setInterval(() => {
      tipIndex = (tipIndex + 1) % IDLE_TIPS.length;
      setSpeechBubbleText(IDLE_TIPS[tipIndex]);
      setShowSpeechBubble(true);
      setMascotMood('happy');
      setTimeout(() => setMascotMood('idle'), 2500);
    }, 11000);

    return () => {
      if (speechTimerRef.current) clearInterval(speechTimerRef.current);
    };
  }, [isOpen]);

  // Scroll messages to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  // Handle external open event (from Navbar, BentoGrid, Roadmap buttons, etc.)
  useEffect(() => {
    const handleOpenEvent = (e) => {
      lastOpenedAtRef.current = Date.now();
      setIsOpen(true);
      setHasUnread(false);
      const prompt = e.detail?.prompt;
      if (prompt) {
        setTimeout(() => {
          handleSend(prompt);
        }, 150);
      }
    };

    window.addEventListener('open-mascot-chat', handleOpenEvent);
    return () => window.removeEventListener('open-mascot-chat', handleOpenEvent);
  }, [conversationId, linkedinResult, githubResult, customApiKey]);

  // Close chatbot when clicking anywhere on screen outside the bot or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event) => {
      if (Date.now() - lastOpenedAtRef.current < 150) return;

      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target) &&
        (!mascotBtnRef.current || !mascotBtnRef.current.contains(event.target))
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSend = async (messageToSend) => {
    const userMsg = (messageToSend || input).trim();
    if (!userMsg || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    setMascotMood('thinking');

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
      setMascotMood('happy');
      setTimeout(() => setMascotMood('idle'), 3000);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: `Error connecting to AI Assistant: ${err.message || 'Please ensure backend is running.'}`,
        },
      ]);
      setMascotMood('idle');
    } finally {
      setLoading(false);
    }
  };

  const hasAnalysis = Boolean(linkedinResult || githubResult);

  // Predefined suggestions with target navigation tabs
  const suggestions = hasAnalysis
    ? [
        { text: 'Review my overall profile', tab: '/roadmap' },
        { text: 'How is my GitHub profile?', tab: '/github' },
        { text: 'What are my LinkedIn strengths?', tab: '/linkedin' },
        { text: 'Explain my dynamic roadmap', tab: '/roadmap' },
        { text: 'What should I build first?', tab: '/roadmap' },
        { text: 'Verify my technical code skills', tab: '/verifier' },
      ]
    : [
        { text: 'Analyze my LinkedIn Profile', tab: '/linkedin' },
        { text: 'Review my GitHub repositories', tab: '/github' },
        { text: 'Generate dynamic Career Roadmap', tab: '/roadmap' },
        { text: 'Take AI Code Verification test', tab: '/verifier' },
        { text: 'How does SkillPulse AI work?', tab: '/' },
      ];

  const getTabForText = (text) => {
    const t = text.toLowerCase();
    if (t.includes('github') || t.includes('repo')) return '/github';
    if (t.includes('linkedin') || t.includes('resume')) return '/linkedin';
    if (t.includes('roadmap') || t.includes('sprint') || t.includes('build first')) return '/roadmap';
    if (t.includes('verifier') || t.includes('code') || t.includes('test')) return '/verifier';
    return null;
  };

  // Automatically navigate to the corresponding tab when a suggestion is clicked
  const handleSuggestionClick = (suggestion) => {
    const promptText = typeof suggestion === 'string' ? suggestion : suggestion.text;
    const targetTab = typeof suggestion === 'object' && suggestion.tab ? suggestion.tab : getTabForText(promptText);

    if (targetTab) {
      navigate(targetTab);
    }
    handleSend(promptText);
  };

  const toggleOpen = () => {
    lastOpenedAtRef.current = Date.now();
    setIsOpen((prev) => !prev);
    setHasUnread(false);
    if (!isOpen) {
      setMascotMood('happy');
      setTimeout(() => setMascotMood('idle'), 2000);
    }
  };

  const shouldShowMascot = route !== 'home' || visibleOnHome || isOpen;

  return (
    <>
      {/* Click-outside backdrop overlay to close chat bot on external click */}
      {isOpen && (
        <div
          className="mascot-backdrop"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`mascot-root ${!shouldShowMascot ? 'mascot-root--hidden' : ''} ${!isOpen ? 'mascot-root--roaming' : ''} ${isOpen ? 'mascot-root--open' : ''}`}
        aria-label="SkillPulse AI Career Mascot"
      >
        {/* Speech / Thought Bubble (When closed) */}
        {!isOpen && showSpeechBubble && (
          <div
            className="mascot-bubble brutal-card"
            onClick={toggleOpen}
            role="status"
            aria-live="polite"
          >
            <span className="mascot-bubble__text">{speechBubbleText}</span>
            <button
              type="button"
              className="mascot-bubble__close"
              onClick={(e) => {
                e.stopPropagation();
                setShowSpeechBubble(false);
              }}
              aria-label="Dismiss message"
            >
              ×
            </button>
            <div className="mascot-bubble__tail" />
          </div>
        )}

        {/* Floating Roving Mascot Figure */}
        <div
          ref={mascotBtnRef}
          className={`mascot-avatar-btn ${isOpen ? 'mascot-avatar-btn--docked' : ''}`}
          onClick={toggleOpen}
          title="Chat with skillplus ai — AI Assistant"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleOpen();
            }
          }}
        >
          {/* Unread Alert Dot */}
          {hasUnread && !isOpen && (
            <span className="mascot-badge" aria-label="1 new message">
              1
            </span>
          )}

          {/* Mascot Robot Figure with Bamboo Copter */}
          <div className={`mascot-figure mascot-figure--${mascotMood}`}>
            {/* Spinning Bamboo Copter */}
            <div className="mascot-bamboo-copter" title="Bamboo Copter Flight Unit">
              <div className={`mascot-copter-blades ${loading ? 'mascot-copter-blades--fast' : ''}`}>
                <span className="copter-blade copter-blade--left" />
                <span className="copter-center-hub" />
                <span className="copter-blade copter-blade--right" />
              </div>
              <span className="mascot-copter-shaft" />
              <span className="mascot-copter-suction" />
            </div>

            {/* Robot Head Display Screen */}
            <div className="mascot-figure__head">
              <div className="mascot-figure__screen">
                {/* Animated Eyes */}
                <div className="mascot-figure__eyes">
                  {mascotMood === 'thinking' ? (
                    <>
                      <span className="mascot-eye mascot-eye--thinking" />
                      <span className="mascot-eye mascot-eye--thinking" />
                    </>
                  ) : mascotMood === 'happy' ? (
                    <>
                      <span className="mascot-eye mascot-eye--happy">^</span>
                      <span className="mascot-eye mascot-eye--happy">^</span>
                    </>
                  ) : mascotMood === 'wink' ? (
                    <>
                      <span className="mascot-eye mascot-eye--open" />
                      <span className="mascot-eye mascot-eye--wink">~</span>
                    </>
                  ) : (
                    <>
                      <span className="mascot-eye mascot-eye--open" />
                      <span className="mascot-eye mascot-eye--open" />
                    </>
                  )}
                </div>

                {/* Digital Wave Smile */}
                <div className="mascot-figure__mouth">
                  <span className="mascot-mouth-wave" />
                </div>
              </div>
            </div>

            {/* Robot Torso with Pulse Core */}
            <div className="mascot-figure__body">
              <span className="mascot-figure__core" />
              <div className="mascot-figure__arms">
                <span className="mascot-arm mascot-arm--left" />
                <span className="mascot-arm mascot-arm--right" />
              </div>
            </div>

            {/* Hover Jet Propulsion Glow */}
            <div className="mascot-figure__thruster" />
          </div>
        </div>

        {/* Expanded Neo-Brutalist Career Coach Chat Drawer */}
        {isOpen && (
          <section
            ref={drawerRef}
            className="mascot-chat-drawer brutal-card"
            aria-label="AI Career Coach Window"
          >
            {/* Header */}
            <header className="mascot-chat__header">
              <div className="mascot-chat__header-left">
                <div className="mascot-chat__mini-avatar">
                  <span>AI</span>
                </div>
                <div className="mascot-chat__info">
                  <h3 className="mascot-chat__title">skillplus ai</h3>
                  <span className="mascot-chat__status">
                    <span className="mascot-status-dot" />
                    Career Intelligence Assistant
                  </span>
                </div>
              </div>

              <div className="mascot-chat__header-actions">
                {hasAnalysis && (
                  <div className="mascot-chat__context-tag" title="Loaded Profile Context">
                    {linkedinResult && githubResult
                      ? `${linkedinResult.name} & @${githubResult.username}`
                      : linkedinResult
                      ? linkedinResult.name
                      : `@${githubResult?.username}`}
                  </div>
                )}

                <button
                  type="button"
                  className="mascot-chat__action-btn mascot-chat__action-btn--close"
                  onClick={toggleOpen}
                  title="Minimize Assistant"
                  aria-label="Close Chat"
                >
                  ✕
                </button>
              </div>
            </header>

            {/* Messages Container */}
            <div className="mascot-chat__messages" role="log" aria-live="polite">
              {hasAnalysis && (
                <div className="mascot-msg__context-badge" title="Loaded Profile Context">
                  <span>[CONTEXT] Active Profile: </span>
                  <strong>
                    {linkedinResult && githubResult
                      ? `${linkedinResult.name} & @${githubResult.username}`
                      : linkedinResult
                      ? linkedinResult.name
                      : `@${githubResult?.username}`}
                  </strong>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div key={idx} className={`mascot-msg mascot-msg--${msg.role}`}>
                  <div className="mascot-msg__bubble">
                    {msg.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="mascot-msg mascot-msg--bot">
                  <div className="mascot-msg__bubble mascot-msg__typing">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                    <span className="mascot-typing-label">skillplus ai is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Predefined Topic Suggestions (Navigates to tab on click) */}
            <div className="mascot-chat__suggestions" aria-label="Suggested Career Topics">
              {suggestions.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  className="mascot-chat__chip"
                  onClick={() => handleSuggestionClick(item)}
                  disabled={loading}
                >
                  {item.text}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <form
              className="mascot-chat__input-area"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <input
                type="text"
                className="mascot-chat__input"
                placeholder="Ask skillplus ai about interview prep, system design, or gaps..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                aria-label="Your question to AI Assistant"
              />
              <button
                type="submit"
                className="brutal-btn brutal-btn--primary mascot-chat__send-btn"
                disabled={loading || !input.trim()}
              >
                {loading ? 'Thinking...' : 'Send →'}
              </button>
            </form>
          </section>
        )}
      </aside>
    </>
  );
}
