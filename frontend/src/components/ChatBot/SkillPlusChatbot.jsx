import { useMemo } from 'react';
import { Webchat } from '@botpress/webchat';

const CLIENT_ID = import.meta.env.VITE_BOTPRESS_CLIENT_ID;

export default function SkillPlusChatbot() {
  const chatStyle = useMemo(
    () => ({
      width: '100%',
      height: '100%',
      border: 'none',
      borderRadius: 0,
    }),
    []
  );

  if (!CLIENT_ID) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
        <p>Chatbot is not configured. Set <code>VITE_BOTPRESS_CLIENT_ID</code> in your .env file.</p>
      </div>
    );
  }

  return <Webchat clientId={CLIENT_ID} style={chatStyle} />;
}
