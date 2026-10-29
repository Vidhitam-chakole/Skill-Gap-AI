import { useState } from 'react';
import { SectionHeader, Sticker } from '../Decorative/Decorative';
import './FAQ.css';

export const FAQ_DATA = [
  {
    q: 'Do I need to sign in, create an account, or enter a credit card to use SkillPulse AI?',
    a: 'No sign-in or account registration is required! SkillPulse AI is 100% free with zero signup friction. You do not need to provide an email, password, or credit card. You can immediately analyze LinkedIn profile PDFs, audit GitHub repositories, take interactive coding assessments, and generate career roadmaps.',
    tag: 'Free • No Sign-In',
  },
  {
    q: 'Is SkillPulse AI completely free to use?',
    a: 'Yes, SkillPulse AI is 100% free forever. There are no paywalls, hidden fees, monthly subscriptions, or usage credits required. All features across LinkedIn parsing, GitHub review, adaptive learning sprints, and PulseBot AI career chat are fully unlocked for everyone.',
    tag: '100% Free',
  },
  {
    q: 'Is my LinkedIn PDF or personal information kept private without a login?',
    a: 'Yes. SkillPulse AI is designed privacy-first. Since no sign-in or account registration is required, your uploaded resume or LinkedIn PDF data is processed securely in-session and is never stored permanently, sold to recruiters, or shared with third parties.',
    tag: 'Privacy & Security',
  },
  {
    q: 'What is SkillPulse AI and how does the AI skill gap analyzer work?',
    a: 'SkillPulse AI is an AI-powered career intelligence platform designed for software engineers, students, and tech professionals. It cross-examines your LinkedIn profile or resume PDF against your public GitHub code repositories to detect missing technical skills, benchmark engineering practices, and generate an adaptive learning roadmap to close critical career gaps.',
    tag: 'Platform Overview',
  },
  {
    q: 'How do I get a free LinkedIn profile analysis online?',
    a: 'You can analyze your LinkedIn profile online in seconds with SkillPulse AI completely free with no account needed. In your LinkedIn account, navigate to your profile, click "More" in the header card, and select "Save to PDF". Upload the downloaded PDF to SkillPulse AI to parse your work history, verified skills, and identify missing competencies for developer roles.',
    tag: 'LinkedIn Analysis',
  },
  {
    q: 'How does the GitHub profile analyzer review developer repositories?',
    a: 'Enter your GitHub username or profile link into our GitHub profile review tool — no sign-in or GitHub account connection required. SkillPulse AI fetches your public repositories via the GitHub REST API to measure byte-weighted language percentages, repository star metrics, commit velocity, and key engineering signals such as unit test coverage, CI/CD pipelines, and open-source contributions.',
    tag: 'GitHub Code Audit',
  },
  {
    q: 'Can SkillPulse AI identify skill gaps for software developer jobs and internships?',
    a: 'Yes. SkillPulse AI is purpose-built for developer profile analysis for internships and full-time software engineering jobs. It benchmarks your profile against current industry hiring demands, highlighting missing qualifications such as containerization (Docker, Kubernetes), automated testing, system design, and backend microservices.',
    tag: 'Internships & Jobs',
  },
  {
    q: 'What is the AI Code & Skill Verifier and how does it test skills?',
    a: 'The AI Code & Skill Verifier offers interactive, timed technical coding challenges calibrated to the programming languages found in your GitHub repositories. It tests practical engineering concepts such as concurrency, memory management, and language quirks with instant automated scoring and detailed question reviews.',
    tag: 'Skill Verification',
  },
  {
    q: 'How does the AI career roadmap help improve developer profiles?',
    a: 'The AI career analyzer synthesizes gaps from both your LinkedIn resume and GitHub repositories to generate a personalized sprint-based learning roadmap. Instead of generic tutorials, each sprint provides concrete project deliverables, testing frameworks, and milestone goals tailored to your target programming language and job role.',
    tag: 'Career Roadmaps',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section id="faq" className="faq-section" aria-labelledby="faq-heading">
      <Sticker color="yellow" rotation={-3} className="faq__sticker">
        AEO &amp; Knowledge Base
      </Sticker>

      <SectionHeader
        title="Frequently Asked Questions"
        subtitle="Concise, factual answers about our LinkedIn profile analyzer, GitHub code review tool, and AI skill gap analysis platform."
        rotate={1}
      />

      <div className="faq__container brutal-card reveal">
        <div className="faq__list" role="region" aria-label="FAQ Questions">
          {FAQ_DATA.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`faq__item ${isOpen ? 'faq__item--open' : ''}`}
              >
                <button
                  type="button"
                  className="faq__question"
                  onClick={() => toggleFAQ(idx)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  id={`faq-question-${idx}`}
                >
                  <span className="faq__question-tag">{item.tag}</span>
                  <span className="faq__question-text">{item.q}</span>
                  <span className="faq__toggle-icon" aria-hidden="true">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                <div
                  id={`faq-answer-${idx}`}
                  role="region"
                  aria-labelledby={`faq-question-${idx}`}
                  className="faq__answer-wrap"
                  style={{ display: isOpen ? 'block' : 'none' }}
                >
                  <p className="faq__answer">{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
