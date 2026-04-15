import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { useApp } from "../app/AppContext"
import { generateNutritionPlan } from "../services/nutrition"
import { getCurrentUser } from "../services/users"

export default function Goals() {
  const { profile, setProfile } = useApp()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isReady, setIsReady] = useState(false)

  // 1. Check user data on mount
  useEffect(() => {
    async function checkUserData() {
      try {
        const res = await getCurrentUser()
        if (res.success) {
          setProfile(res.data)
          
          // Verify if the critical InBody data exists
          const hasMacros = res.data.target_calories && res.data.target_protein
          setIsReady(!!hasMacros)
          
          if (!hasMacros) {
            setError("Your InBody data is missing. We need your macros to generate a safe plan.")
          }
        }
      } catch (err) {
        setError("Could not verify user data. Please try again.")
      }
    }
    checkUserData()
  }, [setProfile])

  async function onGenerate() {
    setLoading(true)
    setError("")

    try {
      // Backend handles fetching macros/health conditions via JWT
      const res = await generateNutritionPlan({})

      if (res.success) {
        localStorage.setItem("nutrition_plan", JSON.stringify(res.meal_plan))
        navigate("/dashboard")
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to generate nutrition plan."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid" style={{ gap: "20px", maxWidth: "800px", margin: "0 auto" }}>
      {/* Header */}
      <div className="card" style={{ textAlign: "center", background: "transparent", border: "none" }}>
        <div className="h1" style={{ fontSize: "2.5rem", marginBottom: "10px" }}>Generate Your Plan</div>
        <p className="muted" style={{ fontSize: "1.1rem" }}>
          Our AI will create a personalized nutrition and workout strategy based on your profile.
        </p>
      </div>

      <div className="card" style={{ 
        background: "rgba(30, 41, 59, 0.5)", 
        padding: "40px", 
        borderRadius: "16px",
        textAlign: "center",
        border: "1px solid #334155"
      }}>
        
        {isReady ? (
          /* SUCCESS STATE: Ready to generate */
          <div>
            <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🤖</div>
            <div className="h2" style={{ marginBottom: "12px" }}>Everything is Set!</div>
            <p className="muted" style={{ marginBottom: "30px", maxWidth: "500px", margin: "0 auto 30px" }}>
              We've detected your InBody macros and health profile. Your plan will be tailored to your 
              <b> {profile.goals || "fitness"}</b> goal.
            </p>

            {error && <div style={{ color: "#f87171", marginBottom: "20px" }}>❌ {error}</div>}

            <button
              className="btn primary"
              onClick={onGenerate}
              disabled={loading}
              style={{ 
                background: "linear-gradient(90deg, #8b5cf6 0%, #06b6d4 100%)",
                padding: "16px 40px",
                fontSize: "1.1rem",
                borderRadius: "12px",
                fontWeight: "bold",
                width: "100%",
                maxWidth: "300px"
              }}
            >
              {loading ? "AI is thinking..." : "Generate AI Plan →"}
            </button>
          </div>
        ) : (
          /* WARNING STATE: Data missing */
          <div>
            <div style={{ fontSize: "4rem", marginBottom: "20px" }}>📋</div>
            <div className="h2" style={{ marginBottom: "12px", color: "#f87171" }}>Missing Information</div>
            <p className="muted" style={{ marginBottom: "30px" }}>
              {error || "We couldn't find your InBody data or macro targets."}
            </p>

            <button
              className="btn"
              onClick={() => navigate("/profile")}
              style={{ 
                background: "#334155",
                padding: "14px 30px",
                borderRadius: "10px",
                color: "white"
              }}
            >
              Go to Profile & Upload PDF
            </button>
          </div>
        )}
      </div>

      {/* Summary of what we are using */}
      {isReady && (
        <div style={{ display: "flex", justifyContent: "center", gap: "20px", opacity: 0.7 }}>
          <div style={tagStyle}>📊 {profile.target_calories} kcal</div>
          <div style={tagStyle}>🎯 {profile.goals}</div>
          <div style={tagStyle}>⚖️ {profile.experience}</div>
        </div>
      )}
    </div>
  )
}

const tagStyle = {
  background: "#1e293b",
  padding: "6px 14px",
  borderRadius: "20px",
  fontSize: "0.85rem",
  border: "1px solid #334155"
}