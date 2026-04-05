import { Route, Routes } from "react-router-dom"
import Chat from "./pages/Chat"


import Landing from "./pages/Landing"
import Profile from "./pages/Profile"
import Goals from "./pages/Goals"
import Plan from "./pages/Plan"
import Dashboard from "./pages/Dashboard"
import ExercisePlayer from "./pages/ExercisePlayer"

import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"
import ProtectedRoute from "./components/ProtectedRoute"
import TopBar from "./components/TopBar"
import Mediapipe_player from "./pages/mediepipe_player"

export default function App() {
  return (
    <div className="container">
      <TopBar />

      <Routes>
        {/* Public */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected */}
        <Route path="/" element={<ProtectedRoute><Landing /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
        <Route path="/plan" element={<ProtectedRoute><Plan /></ProtectedRoute>} />
        {/* <Route path="/live" element={<ProtectedRoute><ExercisePlayer /></ProtectedRoute>} /> */}
        <Route path="/live" element={<ProtectedRoute><Mediapipe_player /></ProtectedRoute>} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />

      </Routes>
    </div>
  )
}
