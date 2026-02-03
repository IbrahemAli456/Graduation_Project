import { Link } from "react-router-dom"

export default function Landing() {
  return (
    <div className="grid">
      {/* Hero */}
      <div className="card">
        <div className="h1">AI-Powered Personal Fitness Trainer</div>
        <p className="muted">
          Train smarter with real-time posture feedback, personalized workout
          plans, and progress tracking — all powered by AI.
        </p>

        <div className="row" style={{ marginTop: 14 }}>
          <Link to="/profile" className="btn primary">
            Get Started
          </Link>
          <Link to="/live" className="btn">
            Live Training
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        <div className="card soft">
          <div className="h2">Personalized Plans</div>
          <p className="muted">
            Workout and nutrition plans generated based on your body data and goals.
          </p>
        </div>

        <div className="card soft">
          <div className="h2">Real-Time Feedback</div>
          <p className="muted">
            Live camera analysis with instant corrections to improve your form.
          </p>
        </div>

        <div className="card soft">
          <div className="h2">Progress Tracking</div>
          <p className="muted">
            Track workouts, streaks, and performance over time in one dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}
