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
    <div>
      <h2>Body Data Input</h2>

      <div style={{ display: "grid", gap: 10, maxWidth: 320 }}>
        <label>
          Name
          <input name="name" value={profile.name} onChange={onChange} />
        </label>

        <label>
          Age
          <input name="age" value={profile.age} onChange={onChange} type="number" />
        </label>

        <label>
          Height (cm)
          <input name="height" value={profile.height} onChange={onChange} type="number" />
        </label>

        <label>
          Weight (kg)
          <input name="weight" value={profile.weight} onChange={onChange} type="number" />
        </label>

        <button onClick={onNext}>Next: Goals</button>
      </div>
    </div>
  )
}
