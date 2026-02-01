import { Link } from "react-router-dom"

export default function Dashboard() {
  return (
    <div>
      <h2>Dashboard (Mock)</h2>
      <ul>
        <li>Workouts completed: 6</li>
        <li>Streak: 3 days</li>
        <li>Avg calories: 2100</li>
      </ul>

      <Link to="/plan">Back to Plan</Link>
    </div>
  )
}
