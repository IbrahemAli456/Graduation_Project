import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../app/AppContext";
import { user_data, getCurrentUser, update_macros } from "../services/users";

export default function Profile() {
  const { profile, setProfile } = useApp();
  const [serverUser, setServerUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [otherCondition, setOtherCondition] = useState("");
  const [injuryInput, setInjuryInput] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);

  const commonConditions = ["Diabetes", "Hypertension", "Asthma", "Heart Disease", "Thyroid"];
  const goalOptions = ["Weight Loss", "Muscle Gain", "Cutting", "Endurance", "Strength Training"];

  useEffect(() => {
    fetchLatestData();
  }, []);

  async function fetchLatestData() {
    try {
      const res = await getCurrentUser();
      if (res.success) {
        setServerUser(res.data);
        setProfile((p) => ({ ...p, ...res.data }));
      }
    } catch (err) {
      console.error("Failed to fetch user data", err);
    }
  }

  function onChange(e) {
    const { name, value } = e.target;
    const val = name === "days_per_week" ? (parseInt(value) || 0) : value;
    setProfile((p) => ({ ...p, [name]: val }));
  }

  const addItem = (field, value, setter) => {
    if (!value.trim()) return;
    if (profile[field]?.includes(value.trim())) return;
    setProfile((p) => ({ ...p, [field]: [...(p[field] || []), value.trim()] }));
    if (setter) setter("");
  };

  const removeItem = (field, index) => {
    setProfile((p) => ({ ...p, [field]: p[field].filter((_, i) => i !== index) }));
  };

  async function handleUpdateProfile() {
    setLoading(true);
    try {
      const res = await user_data(profile); 
      if (res.success) {
        alert("Profile updated!");
        fetchLatestData();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await update_macros(file);
      if (res.success) {
        alert("InBody analysis complete!");
        fetchLatestData();
      }
    } catch (err) {
      alert(err.message || "Error analyzing PDF");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid" style={{ gap: "20px", color: "white", padding: "20px" }}>
      <div className="card" style={{ background: "transparent", border: "none" }}>
        <div className="h1" style={{ fontSize: "2rem", fontWeight: "bold" }}>Gym AI Trainer</div>
        <p className="muted" style={{ color: "#94a3b8" }}>Train • Track • Improve</p>
      </div>

      <div className="card" style={{ background: "rgba(30, 41, 59, 0.5)", padding: "24px", borderRadius: "12px" }}>
        <div className="h2" style={{ fontSize: "1.5rem", marginBottom: "8px" }}>Workout Requirements</div>
        <p className="muted" style={{ color: "#94a3b8", marginBottom: "24px" }}>
          Upload your InBody report to auto-calculate macros.
        </p>

        <div className="grid" style={{ gridTemplateColumns: "1fr 380px", gap: "30px", alignItems: "start" }}>
          
          {/* LEFT COLUMN: FORM */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <label className="label" style={labelStyle}>
                Experience
                <select className="input" name="experience" value={profile.experience || ""} onChange={onChange} style={inputStyle}>
                  <option value="">Select...</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </label>
              <label className="label" style={labelStyle}>
                Days/Week
                <input className="input" type="number" name="days_per_week" value={profile.days_per_week || ""} onChange={onChange} min="1" max="7" style={inputStyle} />
              </label>
            </div>

            <label className="label" style={labelStyle}>
              Primary Goal
              <select className="input" name="goals" value={profile.goals || ""} onChange={onChange} style={inputStyle}>
                <option value="">Select Goal...</option>
                {goalOptions.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>

            <label className="label" style={labelStyle}>
              Health Conditions
              <select className="input" style={inputStyle} onChange={(e) => e.target.value === 'other' ? setShowOtherInput(true) : addItem('health_conditions', e.target.value)} value="">
                <option value="">Add condition...</option>
                {commonConditions.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="other">+ Add custom...</option>
              </select>
            </label>

            {showOtherInput && (
              <div style={{ display: "flex", gap: "8px" }}>
                <input className="input" placeholder="Type condition..." value={otherCondition} onChange={e => setOtherCondition(e.target.value)} style={inputStyle} />
                <button className="btn" onClick={() => { addItem('health_conditions', otherCondition, setOtherCondition); setShowOtherInput(false); }} style={btnSecondaryStyle}>Add</button>
              </div>
            )}

            <label className="label" style={labelStyle}>
              Injuries
              <div style={{ display: "flex", gap: "8px" }}>
                <input className="input" placeholder="e.g. Knee pain, back injury" value={injuryInput} onChange={e => setInjuryInput(e.target.value)} style={inputStyle} />
                <button className="btn" onClick={() => addItem('injuries', injuryInput, setInjuryInput)} style={btnSecondaryStyle}>Add</button>
              </div>
            </label>

            {/* List Pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {(profile.health_conditions || []).map((c, i) => (
                <div key={i} style={pillStyle}>{c} <span style={{ cursor: "pointer", marginLeft: "5px", color: "#f87171" }} onClick={() => removeItem('health_conditions', i)}>×</span></div>
              ))}
              {(profile.injuries || []).map((inj, i) => (
                <div key={i} style={{ ...pillStyle, border: "1px solid #ef4444", color: "#f87171" }}>⚠️ {inj} <span style={{ cursor: "pointer", marginLeft: "5px" }} onClick={() => removeItem('injuries', i)}>×</span></div>
              ))}
            </div>

            <div style={dashedBoxStyle}>
              <div style={{ fontWeight: "600", marginBottom: "4px" }}>InBody Report</div>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "12px" }}>Upload PDF to sync Age and Macros</p>
              <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileUpload} style={{ display: "none" }} />
              <button className="btn" onClick={() => fileInputRef.current.click()} disabled={uploading} style={btnSecondaryStyle}>
                {uploading ? "Analyzing PDF..." : "Choose InBody PDF"}
              </button>
            </div>

            <button className="btn primary" onClick={handleUpdateProfile} disabled={loading} style={btnPrimaryStyle}>
              {loading ? "Updating..." : "Save Profile Settings"}
            </button>
          </div>

          {/* RIGHT COLUMN: COMPLETE PREVIEW */}
          <div style={previewCardStyle}>
            <div className="h2" style={{ fontSize: "1.25rem", marginBottom: "16px", borderBottom: "1px solid #1e293b", paddingBottom: "10px" }}>Current Profile</div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Core Stats Group */}
              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.9rem" }}>
                <div><span style={labelMuted}>Age:</span> <br/> <b>{serverUser?.age || "—"}</b></div>
                <div><span style={labelMuted}>Goal:</span> <br/> <b>{serverUser?.goals || "—"}</b></div>
                <div><span style={labelMuted}>Experience:</span> <br/> <b>{serverUser?.experience || "—"}</b></div>
                <div><span style={labelMuted}>Frequency:</span> <br/> <b>{serverUser?.days_per_week ? `${serverUser.days_per_week} Days` : "—"}</b></div>
              </div>

              {/* Macros Box */}
              <div style={macroBoxStyle}>
                <div style={{ fontWeight: "bold", marginBottom: "10px", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Targeted Macros</div>
                <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ color: "#2563eb" }}>🔥 <b>{Math.round(serverUser?.target_calories || 0)}</b> kcal</div>
                  <div style={{ color: "#059669" }}>🍗 <b>{Math.round(serverUser?.target_protein || 0)}g</b> Prot</div>
                  <div style={{ color: "#d97706" }}>🍞 <b>{Math.round(serverUser?.target_carbs || 0)}g</b> Carb</div>
                  <div style={{ color: "#7c3aed" }}>🥑 <b>{Math.round(serverUser?.target_fat || 0)}g</b> Fat</div>
                </div>
              </div>

              {/* Health and Injuries lists */}
              <div style={listContainerStyle}>
                <span style={labelMuted}>Health Conditions:</span>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.9rem" }}>
                  {serverUser?.health_conditions?.length > 0 ? serverUser.health_conditions.join(", ") : "None reported"}
                </p>
              </div>

              <div style={listContainerStyle}>
                <span style={{...labelMuted, color: "#f87171"}}>Reported Injuries:</span>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.9rem", color: "#fca5a5" }}>
                  {serverUser?.injuries?.length > 0 ? serverUser.injuries.join(", ") : "No current injuries"}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- Styles ---
const labelStyle = { display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.9rem", fontWeight: "500" };
const labelMuted = { color: "#94a3b8", fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase" };
const inputStyle = { background: "#0f172a", border: "1px solid #334155", color: "white", padding: "10px 14px", borderRadius: "8px", outline: "none" };
const pillStyle = { background: "rgba(255, 255, 255, 0.05)", border: "1px solid #334155", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", display: "flex", alignItems: "center" };
const dashedBoxStyle = { border: "2px dashed #334155", borderRadius: "12px", padding: "20px", textAlign: "center", background: "rgba(15, 23, 42, 0.3)" };
const btnPrimaryStyle = { background: "linear-gradient(90deg, #8b5cf6 0%, #06b6d4 100%)", color: "white", border: "none", padding: "14px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer" };
const btnSecondaryStyle = { background: "#334155", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "14px" };
const previewCardStyle = { background: "#0f172a", padding: "24px", borderRadius: "12px", border: "1px solid #1e293b", position: "sticky", top: "20px" };
const macroBoxStyle = { background: "white", color: "#0f172a", padding: "15px", borderRadius: "10px" };
const listContainerStyle = { borderTop: "1px solid #1e293b", paddingTop: "10px" };