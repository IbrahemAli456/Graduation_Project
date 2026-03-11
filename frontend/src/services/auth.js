import { api } from "./api"

export async function registerUser({ username, email, password }) {
  const res = await api.post("/auth/register", { username, email, password })
  return res.data
}

export async function loginUser({ email, password }) {
  const res = await api.post("/auth/login", { email, password })
  return res.data
}

export async function getCurrentUser() {
  const res = await api.get("/api/users/me")
  return res.data
}
