import { Link } from "react-router-dom"

export default function Dashboard() {
  const stats = {
    workouts: 8,
    streak: 4,
    avgCalories: 2150,
    sessions: 5,
    lastStatus: "Good",
  }

  return (
    <div className="grid">
      {/* Header */}
      <div className="card">
        <div className="h1">Dashboard</div>
        <div className="muted">Your training overview & recent performance.</div>
      </div>

      {/* Stats */}
      <div
        className="grid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        <div className="card soft">
          <div className="h2">{stats.workouts}</div>
          <div className="muted">Workouts Completed</div>
        </div>

        <div className="card soft">
          <div className="h2">{stats.streak} days</div>
          <div className="muted">Current Streak</div>
        </div>

        <div className="card soft">
          <div className="h2">{stats.avgCalories}</div>
          <div className="muted">Avg Calories</div>
        </div>

        <div className="card soft">
          <div className="h2">{stats.sessions}</div>
          <div className="muted">Live Sessions</div>
        </div>
      </div>

      {/* Recent Status */}
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="h2">Last Session</div>
            <div className="muted">Overall performance summary</div>
          </div>
          <span className={`badge ${stats.lastStatus === "Good" ? "good" : "warn"}`}>
            {stats.lastStatus}
          </span>
        </div>

        <ul style={{ marginTop: 12 }}>
          <li>✔ Good posture on most reps</li>
          <li>⚠ Needs improvement on squat depth</li>
          <li>✔ Consistent tempo</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="card soft">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="h2" style={{ margin: 0 }}>What’s next?</div>
            <div className="muted">Continue training or review your plan.</div>
          </div>

          <div className="row">
            <Link to="/plan" className="btn">View Plan</Link>
            <Link to="/live" className="btn primary">Start Live Session</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
