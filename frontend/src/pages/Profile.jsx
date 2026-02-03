import { useNavigate } from "react-router-dom"
import { useApp } from "../app/AppContext"

export default function Profile() {
  const { profile, setProfile } = useApp()
  const navigate = useNavigate()

  function onChange(e) {
    const { name, value } = e.target
    setProfile((p) => ({ ...p, [name]: value }))
  }

  function onNext() {
    if (!profile.age || !profile.height || !profile.weight) {
      alert("Please fill age, height, and weight.")
      return
    }
    navigate("/goals")
  }

  return (
    <div className="grid">
      {/* Header */}
      <div className="card">
        <div className="h1">Your Profile</div>
        <div className="muted">
          Enter your body data to generate a personalized workout & nutrition plan.
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <div className="h2" style={{ marginBottom: 12 }}>
          Body Data Input
        </div>

        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            alignItems: "start",
          }}
        >
          <label className="label">
            Name
            <input
              className="input"
              name="name"
              value={profile.name}
              onChange={onChange}
              placeholder="Your name"
            />
          </label>

          <label className="label">
            Age
            <input
              className="input"
              name="age"
              value={profile.age}
              onChange={onChange}
              type="number"
              placeholder="e.g. 22"
            />
          </label>

          <label className="label">
            Height (cm)
            <input
              className="input"
              name="height"
              value={profile.height}
              onChange={onChange}
              type="number"
              placeholder="e.g. 175"
            />
          </label>

          <label className="label">
            Weight (kg)
            <input
              className="input"
              name="weight"
              value={profile.weight}
              onChange={onChange}
              type="number"
              placeholder="e.g. 75"
            />
          </label>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginTop: 14,
            flexWrap: "wrap",
          }}
        >
          <div className="muted">
            Tip: You can edit this later anytime.
          </div>

          <button className="btn primary" onClick={onNext}>
            Next: Goals →
          </button>
        </div>
      </div>

      {/* Quick Preview */}
      <div className="card soft">
        <div className="h2">Preview</div>
        <div className="muted" style={{ marginTop: 6 }}>
          <div>
            <b>Name:</b> {profile.name || "-"}
          </div>
          <div>
            <b>Age:</b> {profile.age || "-"}
          </div>
          <div>
            <b>Height:</b> {profile.height ? `${profile.height} cm` : "-"}
          </div>
          <div>
            <b>Weight:</b> {profile.weight ? `${profile.weight} kg` : "-"}
          </div>
        </div>
      </div>
    </div>
  )
}
