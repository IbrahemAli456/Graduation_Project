import axios from "axios"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// يحط التوكن تلقائيًا في أي request بعد اللوجين
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
