import { Link } from "react-router-dom"

export default function Landing() {
  return (
    <div>
      <h2>AI-Powered Personal Fitness Trainer</h2>
      <p>Personalized workout & nutrition plans + video feedback.</p>
      <Link to="/profile">Start</Link>
    </div>
  )
}
