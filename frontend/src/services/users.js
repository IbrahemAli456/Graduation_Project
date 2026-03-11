import { api } from "./api"

export async function getCurrentUser() {
  const res = await api.get("/api/users/me")
  return res.data
}
