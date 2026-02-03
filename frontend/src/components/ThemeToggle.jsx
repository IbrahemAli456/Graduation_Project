import { useState } from "react"
import useTheme from "../hooks/useTheme"

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [pulse, setPulse] = useState(false)

  function onClick() {
    setPulse(true)
    toggleTheme()
    // remove class after animation
    setTimeout(() => setPulse(false), 450)
  }

  return (
    <button
      className={`themeToggle ${pulse ? "pulse" : ""}`}
      onClick={onClick}
      type="button"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <span className="icon" aria-hidden="true">
        {theme === "dark" ? "☀️" : "🌙"}
      </span>
      <span className="label">
        {theme === "dark" ? "Light" : "Dark"}
      </span>
    </button>
  )
}
