import { useNavigate } from "react-router-dom"
import { useApp } from "../app/AppContext"

export default function Goals() {
  const { goal, setGoal, profile } = useApp()
  const navigate = useNavigate()

  function onGenerate() {
    if (!goal) {
      alert("Choose a goal first.")
      return
    }
    navigate("/plan")
  }

  return (
    <div>
      <h2>Choose Your Goal</h2>
      <p>
        User: {profile.name || "User"} | Age: {profile.age || "-"}
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        {["Fat Loss", "Muscle Gain", "Maintain"].map((g) => (
          <button
            key={g}
            onClick={() => setGoal(g)}
            style={{
              padding: "8px 12px",
              border: "1px solid #999",
              cursor: "pointer",
              fontWeight: goal === g ? "700" : "400",
            }}
          >
            {g}
          </button>
        ))}
      </div>

      <button onClick={onGenerate}>Generate Plan</button>
    </div>
  )
}
