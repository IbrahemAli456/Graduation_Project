import { Route, Routes, Link } from "react-router-dom"
import Exercises from "./pages/Exercises"
import ExercisePlayer from "./pages/ExercisePlayer"
import LiveSession from "./pages/LiveSession"



import Landing from "./pages/Landing"
import Profile from "./pages/Profile"
import Goals from "./pages/Goals"
import Plan from "./pages/Plan"
import Video from "./pages/Video"
import Feedback from "./pages/Feedback"
import Dashboard from "./pages/Dashboard"

export default function App() {
  return (
    <div style={{ padding: 16 }}>
      <h1>Main App</h1>

      <nav style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <Link to="/">Landing</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/goals">Goals</Link>
        <Link to="/plan">Plan</Link>
        <Link to="/video">Video</Link>
        <Link to="/feedback">Feedback</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/exercises">Exercises</Link>
        <Link to="/live">Live</Link>


      </nav>

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/video" element={<Video />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/exercises" element={<Exercises />} />
        <Route path="/exercises/:id" element={<ExercisePlayer />} />
        <Route path="/live" element={<LiveSession />} />


      </Routes>
    </div>
  )
}
