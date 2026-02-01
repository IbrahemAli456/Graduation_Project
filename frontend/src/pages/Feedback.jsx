import { Link } from "react-router-dom"

export default function Feedback() {
  return (
    <div>
      <h2>AI Feedback (Mock)</h2>
      <ul>
        <li>Lower your hips during squat.</li>
        <li>Keep your back neutral.</li>
        <li>Knees should track over toes.</li>
      </ul>

      <Link to="/dashboard">Go to Dashboard</Link>
    </div>
  )
}
