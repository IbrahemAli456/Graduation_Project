import { api } from "./api"

export async function getCurrentUser() {
  const res = await api.get("/api/users/me")
  return res.data
}

export async function user_data(payload) {
  try {
    const res = await api.put("/api/users/me/workout_req", payload);
    return res.data; // This will return { success: true, data: ..., message: ... }
  } catch (error) {
    // If the backend returns a 400 or 500, it will land here
    const message = error.response?.data?.message || "An unexpected error occurred";
    console.error("Workout Update Failed:", message);
    throw error; 
  }
}
export async function update_macros(file) {
  const formData = new FormData();
  formData.append('inbody_pdf', file); // 'inbody_pdf' must match backend request.files key

  try {
    const res = await api.put("/api/users/me/update_macros", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || "Error uploading PDF";
    throw new Error(message);
  }
}