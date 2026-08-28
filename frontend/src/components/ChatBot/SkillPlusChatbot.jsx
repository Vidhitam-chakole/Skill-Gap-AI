import { useState, useCallback, useMemo } from 'react';
import { Fab, Webchat } from '@botpress/webchat';

const CLIENT_ID = import.meta.env.VITE_BOTPRESS_CLIENT_ID;

export default function SkillPlusChatbot() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const chatStyle = useMemo(
    () => ({
      width: '400px',
      height: '600px',
      display: isOpen ? 'flex' : 'none',
      position: 'fixed',
      bottom: '90px',
      right: '20px',
      zIndex: 10000,
      borderRadius: '12px',
      overflow: 'hidden',
    }),
    [isOpen]
  );

  const fabStyle = useMemo(
    () => ({
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '64px',
      height: '64px',
      zIndex: 10001,
    }),
    []
  );

  if (!CLIENT_ID) {
    console.warn(
      '[Skill+] VITE_BOTPRESS_CLIENT_ID is not set. Chatbot will not render.'
    );
    return null;
  }

  return (
    <>
      <Webchat clientId={CLIENT_ID} style={chatStyle} />
      <Fab onClick={toggleChat} style={fabStyle} />
    </>
  );
}
