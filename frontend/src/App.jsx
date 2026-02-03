import { Route, Routes } from "react-router-dom"
import Chat from "./pages/Chat"


import Landing from "./pages/Landing"
import Profile from "./pages/Profile"
import Goals from "./pages/Goals"
import Plan from "./pages/Plan"
import Dashboard from "./pages/Dashboard"
import LiveSession from "./pages/LiveSession"

import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"
import ProtectedRoute from "./components/ProtectedRoute"
import TopBar from "./components/TopBar"

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
        <Route path="/live" element={<ProtectedRoute><LiveSession /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />

      </Routes>
    </div>
  )
}
