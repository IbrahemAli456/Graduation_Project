import { api } from "./api"

// Generate nutrition plan from backend model
export async function generateNutritionPlan(payload) {
  const res = await api.post("/api/nutrition/nutrition_plan_gen", payload)
  return res.data
}
