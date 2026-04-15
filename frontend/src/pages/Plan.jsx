import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useApp } from "../app/AppContext";
import { generateWorkoutPlan } from "../services/workout";
import { getCurrentUser } from "../services/users";

export default function WorkoutGenerator() {
  const { profile, setProfile } = useApp();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedPlan, setGeneratedPlan] = useState(null); // To store the result

  useEffect(() => {
    async function checkData() {
      try {
        const res = await getCurrentUser();
        if (res.success) setProfile(res.data);
      } catch (err) { console.error(err); }
    }
    checkData();
  }, [setProfile]);

  const isReady = !!(profile.age && profile.experience && profile.days_per_week);

  async function handleGenerate() {
    setLoading(true);
    setError("");
    try {
      const res = await generateWorkoutPlan({});
      if (res.success) {
        // res.workout_plan is the object from your backend to_dict()
        setGeneratedPlan(res.workout_plan.workout_plan);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate workout plan.");
    } finally {
      setLoading(false);
    }
  }

  // --- 1. PREVIEW STATE ---
  if (generatedPlan) {
    return (
      <div className="grid" style={{ gap: "20px", maxWidth: "800px", margin: "20px auto" }}>
        <div className="card" style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid #334155" }}>
          <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
             <div className="h2" style={{ color: "#8b5cf6", margin: 0 }}>✨ Your New AI Workout</div>
             <button className="btn" onClick={() => setGeneratedPlan(null)} style={{ background: "transparent", color: "#94a3b8" }}>
               Regenerate
             </button>
          </div>

          {/* The Actual Text Preview */}
          <div style={previewBoxStyle}>
            {generatedPlan}
          </div>

          <div style={{ marginTop: "30px", display: "flex", gap: "10px" }}>
            <button className="btn primary" onClick={() => navigate("/plan")} style={{ flex: 1, background: "linear-gradient(90deg, #8b5cf6 0%, #06b6d4 100%)" }}>
              Save & View All Plans
            </button>
            <button className="btn" onClick={() => navigate("/dashboard")} style={{ flex: 1, background: "#1e293b" }}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. GENERATION STATE ---
  return (
    <div className="grid" style={{ gap: "20px", maxWidth: "600px", margin: "40px auto" }}>
      <div className="card" style={{ textAlign: "center", border: "1px solid #334155", background: "rgba(30, 41, 59, 0.5)" }}>
        <div style={{ fontSize: "3rem", marginBottom: "15px" }}>🏋️‍♂️</div>
        <div className="h1">AI Workout Plan</div>
        <p className="muted">Our Llama-3 AI will build a custom routine based on your level.</p>

        {isReady ? (
          <div style={{ marginTop: "30px" }}>
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
              <div style={statItemStyle}><b>Level:</b> {profile.experience}</div>
              <div style={statItemStyle}><b>Schedule:</b> {profile.days_per_week} days</div>
            </div>
            
            <button className="btn primary" onClick={handleGenerate} disabled={loading} style={genBtnStyle}>
              {loading ? "AI is analyzing exercises..." : "Generate Workout Plan →"}
            </button>
          </div>
        ) : (
          <div style={{ marginTop: "30px" }}>
            <p style={{ color: "#f87171", marginBottom: "20px" }}>⚠️ Profile details missing.</p>
            <button className="btn" onClick={() => navigate("/profile")} style={{ background: "#334155", width: "100%" }}>
              Update Profile Settings
            </button>
          </div>
        )}
        {error && <p style={{ color: "#f87171", marginTop: "15px" }}>{error}</p>}
      </div>
    </div>
  );
}

// --- Internal Styles ---

const previewBoxStyle = {
  whiteSpace: "pre-wrap",      // Keeps the backend line breaks
  fontFamily: "'Courier New', Courier, monospace", // Aligns the "=" and "-" lines
  fontSize: "13px",
  lineHeight: "1.5",
  background: "#0f172a",
  padding: "20px",
  borderRadius: "8px",
  color: "#e2e8f0",
  maxHeight: "500px",
  overflowY: "auto",
  border: "1px solid #1e293b"
};

const genBtnStyle = {
  background: "linear-gradient(90deg, #8b5cf6 0%, #06b6d4 100%)",
  padding: "16px 30px",
  borderRadius: "10px",
  fontWeight: "bold",
  width: "100%",
};

const statItemStyle = {
  background: "#0f172a",
  padding: "10px",
  borderRadius: "6px",
  fontSize: "0.85rem",
  color: "#94a3b8",
  textAlign: "left"
};