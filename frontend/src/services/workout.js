import { api } from "./api"

// Generate workout plan from backend model
export async function generateWorkoutPlan(payload) {
  const res = await api.post("/api/workout/workout_plan_gen", payload)
  return res.data
}