import { createContext, useContext, useMemo, useState } from "react"

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [profile, setProfile] = useState({
    name: "",
    age: "",
    height: "",
    weight: "",
  })

  const [goal, setGoal] = useState("")

  const value = useMemo(
    () => ({ profile, setProfile, goal, setGoal }),
    [profile, goal]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used inside AppProvider")
  return ctx
}
