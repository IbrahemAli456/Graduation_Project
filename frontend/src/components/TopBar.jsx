import { Link, NavLink, useNavigate } from "react-router-dom"

export default function TopBar() {
  const navigate = useNavigate()

  const token = localStorage.getItem("access_token")
  const user = JSON.parse(localStorage.getItem("current_user") || "null")

  function logout() {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("current_user")
    navigate("/signin")
  }

  if (!token) return null

  return (
    <div className="nav card soft">
      <div>
        <div className="h2">Gym AI Trainer</div>

        <div className="muted">
          {user?.username ? `Welcome, ${user.username} 👋` : "Train • Track • Improve"}
        </div>
      </div>

      <div className="navlinks">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
          Home
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
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

        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Dashboard
        </NavLink>

        <button className="btn" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  )
}
