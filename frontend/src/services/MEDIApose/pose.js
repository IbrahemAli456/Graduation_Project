import { api } from "../api"

export async function cur_pushdown(payload) {
  const res = await api.post("/api/Mediapose/curl-pushdown",payload)
  return res.data
}

export async function plank_pushup(payload) {
  const res = await api.post("/api/Mediapose/plank-pushup", payload)
  return res.data
}

export async function squats(payload) {
  const res = await api.post("/api/Mediapose/squat", payload)
  return res.data
}

export async function rdl(payload) {
  const res = await api.post("/api/Mediapose/rdl", payload)
  return res.data
}

export async function deadlift(payload) {
  const res = await api.post("/api/Mediapose/deadlift", payload)
  return res.data
}

export async function sumo_deadlift_api(payload) {
  const res = await api.post("/api/Mediapose/sumo-deadlift", payload)
  return res.data
}

export async function front_squat_api(payload) {
  const res = await api.post("/api/Mediapose/front-squat", payload)
  return res.data
}

export async function zercher_squat_api(payload) {
  const res = await api.post("/api/Mediapose/zercher-squat", payload)
  return res.data
}

export async function press_api(payload) {
  const res = await api.post("/api/Mediapose/press", payload)
  return res.data
}


export async function view_correction(blob, selectedId) {
  const formData = new FormData();
  formData.append("frame", blob, "frame.jpg");
  formData.append("exercise", selectedId);

  try {
    const res = await api.post("/api/Mediapose/detect-orientation", formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || "Orientation check failed";
    throw new Error(message);
  }
}