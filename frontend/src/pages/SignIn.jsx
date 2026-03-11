import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import ThemeToggle from "../components/ThemeToggle"
import { loginUser } from "../services/auth"
import { getCurrentUser } from "../services/users"

export default function SignIn() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: "", password: "" })

  function onChange(e) {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()

    if (!form.email.includes("@")) return alert("Please enter a valid email.")
    if (form.password.length < 6) return alert("Password must be at least 6 characters.")

    try {
      const data = await loginUser({
        email: form.email,
        password: form.password,
      })

      localStorage.setItem("access_token", data.access_token)
      localStorage.setItem("refresh_token", data.refresh_token)
      // ✅ هات بيانات اليوزر الحالي
      const me = await getCurrentUser()

       // خزّنها (مؤقتًا) في localStorage
      localStorage.setItem("current_user", JSON.stringify(me))
      navigate("/")
    } catch (err) {
      alert(err?.response?.data?.message || "Login failed")
      console.log(err)
    }
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
