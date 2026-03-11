import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import ThemeToggle from "../components/ThemeToggle"
import { registerUser } from "../services/auth"

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

  async function onSubmit(e) {
    e.preventDefault()

    if (!form.name.trim()) return alert("Please enter your name.")
    if (!form.email.includes("@")) return alert("Please enter a valid email.")
    if (form.password.length < 6) return alert("Password must be at least 6 characters.")
    if (form.password !== form.confirmPassword) return alert("Passwords do not match.")

    try {
      // backend expects: username, email, password
      const data = await registerUser({
        username: form.name,
        email: form.email,
        password: form.password,
      })

      // backend returns tokens
      localStorage.setItem("access_token", data.access_token)
      localStorage.setItem("refresh_token", data.refresh_token)

      navigate("/")
    } catch (err) {
      alert(err?.response?.data?.message || "Register failed")
      console.log(err)
    }
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
