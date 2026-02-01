import { Link } from "react-router-dom"

const MOCK_EXERCISES = [
  { id: "squat", name: "Squat", level: "Beginner", duration: "45s" },
  { id: "pushup", name: "Push Up", level: "Beginner", duration: "30s" },
  { id: "plank", name: "Plank", level: "Intermediate", duration: "60s" },
]

export default function Exercises() {
  return (
    <div>
      <h2>Exercises</h2>
      <p>Select an exercise to start real-time feedback.</p>

      <ul style={{ display: "grid", gap: 10, paddingLeft: 18 }}>
        {MOCK_EXERCISES.map((ex) => (
          <li key={ex.id}>
            <Link to={`/exercises/${ex.id}`}>
              <b>{ex.name}</b> — {ex.level} — {ex.duration}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
