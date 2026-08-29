import { useAnalysis } from '../../context/AnalysisContext';
import { SectionHeader, Sticker } from '../Decorative/Decorative';
import SkillPlusChatbot from './SkillPlusChatbot';
import './ChatBot.css';

export default function ChatBot() {
  const { linkedinResult, githubResult } = useAnalysis();

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

        <div className="chatbot__webchat">
          <SkillPlusChatbot />
        </div>
      </div>
    </section>
  );
}
