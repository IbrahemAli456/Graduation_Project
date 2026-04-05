import { api } from "../api"

export async function cur_pushdown(payload) {
  const res = await api.post("/api/pose/curl-pushdown",payload)
  return res.data
}

export async function plank_pushup(payload) {
  const res = await api.post("/api/pose/plank-pushup", payload)
  return res.data
}

export async function squats(payload) {
  const res = await api.post("/api/pose/squat", payload)
  return res.data
}

export async function rdl(payload) {
  const res = await api.post("/api/pose/rdl", payload)
  return res.data
}

export async function deadlift(payload) {
  const res = await api.post("/api/pose/deadlift", payload)
  return res.data
}

export async function sumo_deadlift_api(payload) {
  const res = await api.post("/api/pose/sumo-deadlift", payload)
  return res.data
}

export async function front_squat_api(payload) {
  const res = await api.post("/api/pose/front-squat", payload)
  return res.data
}

export async function zercher_squat_api(payload) {
  const res = await api.post("/api/pose/zercher-squat", payload)
  return res.data
}

export async function press_api(payload) {
  const res = await api.post("/api/pose/press", payload)
  return res.data
}