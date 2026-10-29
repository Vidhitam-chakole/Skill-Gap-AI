import MascotCoach from '../Mascot/MascotCoach';

// Re-export MascotCoach as ChatBot for backwards compatibility
export default function ChatBot(props) {
  return <MascotCoach {...props} />;
}
