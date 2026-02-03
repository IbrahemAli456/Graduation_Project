import { Link } from "react-router-dom"
import { useApp } from "../app/AppContext"

function buildPlan(goal) {
  if (goal === "Fat Loss") {
    return {
      workout: [
        "Full Body + HIIT",
        "Lower Body + Core",
        "Upper Body + Cardio",
      ],
      nutrition: [
        "Calories: 1800 - 2000",
        "Protein: High",
        "Carbs: Moderate",
        "Fats: Moderate",
      ],
    }
  }

  if (goal === "Muscle Gain") {
    return {
      workout: [
        "Push (Chest/Shoulders/Triceps)",
        "Pull (Back/Biceps)",
        "Legs (Quads/Hamstrings/Glutes)",
      ],
      nutrition: [
        "Calories: 2400 - 2800",
        "Protein: Very High",
        "Carbs: High",
        "Fats: Moderate",
      ],
    }
  }

  return {
    workout: [
      "Upper Body",
      "Lower Body",
      "Cardio + Mobility",
    ],
    nutrition: [
      "Calories: 2100 - 2300",
      "Protein: Moderate-High",
      "Carbs: Moderate",
      "Fats: Moderate",
    ],
  }
}

export default function Plan() {
  const { profile, goal } = useApp()
  const plan = buildPlan(goal)

  return (
    <div className="grid">
      {/* Header */}
      <div className="card">
        <div className="h1">Your Plan</div>
        <div className="muted">
          Plan for <b>{profile.name || "User"}</b> — Goal: <b>{goal}</b>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-2">
        {/* Workout */}
        <div className="card">
          <div className="h2">Workout Plan</div>
          <ul style={{ marginTop: 10 }}>
            {plan.workout.map((w) => (
              <li key={w} style={{ marginBottom: 6 }}>{w}</li>
            ))}
          </ul>
        </div>

        {/* Nutrition */}
        <div className="card">
          <div className="h2">Nutrition Plan</div>
          <ul style={{ marginTop: 10 }}>
            {plan.nutrition.map((n) => (
              <li key={n} style={{ marginBottom: 6 }}>{n}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* CTA */}
      <div className="card soft">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="h2" style={{ margin: 0 }}>Ready to train?</div>
            <div className="muted">
              Start your live session and get real-time feedback.
            </div>
          </div>

          <Link to="/live" className="btn primary">
            Start Live Session →
          </Link>
        </div>
      </div>
    </div>
  )
}
