import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { useApp } from "../app/AppContext"
import { generateNutritionPlan } from "../services/nutrition"

const GOALS = [
  {
    id: "Fat Loss",
    title: "Fat Loss",
    desc: "Burn fat, boost cardio, and improve overall fitness.",
  },
  {
    id: "Muscle Gain",
    title: "Muscle Gain",
    desc: "Build strength & size with progressive overload workouts.",
  },
  {
    id: "Maintain",
    title: "Maintain",
    desc: "Stay fit, balanced plan, and healthy lifestyle routine.",
  },
]

export default function Goals() {
  const { goal, setGoal, profile } = useApp()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function onGenerate() {
    if (!goal) {
      alert("Choose a goal first.")
      return
    }

    setLoading(true)
    setError("")

    try {
      // 👈 بنبعت الهدف بس (ممكن تزود بيانات بعدين)
      const plan = await generateNutritionPlan({
        goal,
        weight: profile.weight,
        height: profile.height,
        age: profile.age,
        gender: profile.gender,
      })

      // خزّن الخطة (مؤقتًا)
      localStorage.setItem(
        "nutrition_plan",
        JSON.stringify(plan.data ?? plan)
      )

      // روح على الداشبورد
      navigate("/dashboard")
    } catch (err) {
      console.log(err)
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to generate nutrition plan."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid">
      {/* Header */}
      <div className="card">
        <div className="h1">Choose Your Goal</div>
        <div className="muted">
          {profile.name ? (
            <>
              Hey <b>{profile.name}</b> — pick a goal to generate your plan.
            </>
          ) : (
            "Pick a goal to generate your plan."
          )}
        </div>
      </div>

      {/* Goal Cards */}
      <div
        className="grid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}
      >
        {GOALS.map((g) => {
          const selected = goal === g.id
          return (
            <button
              key={g.id}
              onClick={() => setGoal(g.id)}
              className="card"
              style={{
                textAlign: "left",
                cursor: "pointer",
                outline: "none",
                border: selected
                  ? "1px solid rgba(110,231,255,0.6)"
                  : "1px solid var(--border)",
                boxShadow: selected
                  ? "0 0 0 4px rgba(110,231,255,0.12)"
                  : "var(--shadow)",
              }}
            >
              <div
                className="row"
                style={{ justifyContent: "space-between", alignItems: "center" }}
              >
                <div className="h2" style={{ margin: 0 }}>
                  {g.title}
                </div>
                {selected && <span className="badge good">Selected</span>}
              </div>
              <div className="muted" style={{ marginTop: 8 }}>
                {g.desc}
              </div>
            </button>
          )
        })}
      </div>

      {/* Actions */}
      <div className="card soft">
        <div
          className="row"
          style={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <div>
            <div className="h2" style={{ margin: 0 }}>
              Ready?
            </div>
            <div className="muted">
              Selected goal: <b>{goal || "-"}</b>
            </div>
            {error && <div className="muted">❌ {error}</div>}
          </div>

          <button
            className="btn primary"
            onClick={onGenerate}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Plan →"}
          </button>
        </div>
      </div>
    </div>
  )
}
