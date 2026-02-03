import { NavLink, useNavigate } from "react-router-dom"
import ThemeToggle from "./ThemeToggle"

export default function TopBar() {
  const navigate = useNavigate()
  const isAuth = localStorage.getItem("isAuth") === "true"

  function logout() {
    localStorage.removeItem("isAuth")
    navigate("/signin")
  }

  if (!isAuth) return null

  return (
    <div className="nav card soft">
      <div>
        <div className="h2">Gym AI Trainer</div>
        <div className="muted">Train • Track • Improve</div>
      </div>

      <div className="navlinks">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
          Home
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => (isActive ? "active" : "")}>
          Profile
        </NavLink>
        <NavLink to="/goals" className={({ isActive }) => (isActive ? "active" : "")}>
          Goals
        </NavLink>
        <NavLink to="/plan" className={({ isActive }) => (isActive ? "active" : "")}>
          Plan
        </NavLink>
        <NavLink to="/live" className={({ isActive }) => (isActive ? "active" : "")}>
          Live
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
          Dashboard
        </NavLink>
        <NavLink to="/chat" className={({ isActive }) => (isActive ? "active" : "")}>
          Chat
        </NavLink>

        <ThemeToggle />

        <button className="btn" onClick={logout}>Logout</button>
      </div>
    </div>
  )
}
