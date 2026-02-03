import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import ThemeToggle from "../components/ThemeToggle"

export default function SignUp() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  function onChange(e) {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  function onSubmit(e) {
    e.preventDefault()

    if (!form.name.trim()) {
      alert("Please enter your name.")
      return
    }
    if (!form.email.includes("@")) {
      alert("Please enter a valid email.")
      return
    }
    if (form.password.length < 6) {
      alert("Password must be at least 6 characters.")
      return
    }
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match.")
      return
    }

    // Mock register (بدون API)
    localStorage.setItem("isAuth", "true")
    navigate("/")
  }

  return (
    <div className="container" style={{ maxWidth: 460 }}>
      <div className="row" style={{ justifyContent: "flex-end", marginBottom: 12 }}>
        <ThemeToggle />
      </div>

      <div className="card">
        <div className="h1">Create Account</div>
        <div className="muted" style={{ marginBottom: 14 }}>
          Start your personalized fitness journey.
        </div>

        <form onSubmit={onSubmit} className="grid">
          <label className="label">
            Name
            <input
              className="input"
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Your name"
            />
          </label>

          <label className="label">
            Email
            <input
              className="input"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="you@example.com"
            />
          </label>

          <label className="label">
            Password
            <input
              className="input"
              name="password"
              value={form.password}
              onChange={onChange}
              type="password"
              placeholder="At least 6 characters"
            />
          </label>

          <label className="label">
            Confirm Password
            <input
              className="input"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={onChange}
              type="password"
              placeholder="Repeat password"
            />
          </label>

          <button className="btn primary" type="submit">
            Create Account
          </button>

          <div className="muted">
            Already have an account? <Link to="/signin">Sign In</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
