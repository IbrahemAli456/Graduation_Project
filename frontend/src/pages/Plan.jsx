import { Link } from "react-router-dom"
import { useApp } from "../app/AppContext"

function buildPlan(goal) {
  if (goal === "Fat Loss") {
    return {
      workout: [
        "Day 1: Full Body + HIIT",
        "Day 2: Lower Body + Core",
        "Day 3: Upper Body + Cardio",
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
        "Day 1: Push (Chest/Shoulders/Triceps)",
        "Day 2: Pull (Back/Biceps)",
        "Day 3: Legs (Quads/Hamstrings/Glutes)",
      ],
      nutrition: [
        "Calories: 2400 - 2800",
        "Protein: Very High",
        "Carbs: High",
        "Fats: Moderate",
      ],
    }
  }

  // Maintain (default)
  return {
    workout: [
      "Day 1: Upper Body",
      "Day 2: Lower Body",
      "Day 3: Cardio + Mobility",
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
    <div>
      <h2>Your Plan</h2>

      <p>
        Plan for: <b>{profile.name || "User"}</b> | Goal:{" "}
        <b>{goal || "Not selected"}</b>
      </p>

      <h3>Workout Plan (Mock)</h3>
      <ul>
        {plan.workout.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>

      <h3>Nutrition Plan (Mock)</h3>
      <ul>
        {plan.nutrition.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>

      <Link to="/live">Start Live Session</Link>


    </div>
  )
}
