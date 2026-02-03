import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import ThemeToggle from "../components/ThemeToggle"

export default function SignIn() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: "", password: "" })

  function onChange(e) {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  function onSubmit(e) {
    e.preventDefault()

    if (!form.email.includes("@")) {
      alert("Please enter a valid email.")
      return
    }
    if (form.password.length < 6) {
      alert("Password must be at least 6 characters.")
      return
    }

    // Mock auth (بدون API)
    localStorage.setItem("isAuth", "true")
    navigate("/")
  }

  return (
    <div className="container" style={{ maxWidth: 460 }}>
      <div className="row" style={{ justifyContent: "flex-end", marginBottom: 12 }}>
        <ThemeToggle />
      </div>

      <div className="card">
        <div className="h1">Sign In</div>
        <div className="muted" style={{ marginBottom: 14 }}>
          Welcome back. Continue your training.
        </div>

        <form onSubmit={onSubmit} className="grid">
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
              placeholder="••••••••"
            />
          </label>

          <button className="btn primary" type="submit">
            Sign In
          </button>

          <div className="muted">
            Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
