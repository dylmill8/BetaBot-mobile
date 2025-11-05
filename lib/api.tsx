// lib/api.tsx
import axios from "axios";

// Expo embeds EXPO_PUBLIC_* at build-time. Use it directly.
const baseURL = (process.env.EXPO_PUBLIC_API_URL as string) || "";

if (__DEV__) {
  if (!baseURL) {
    console.warn(
      "EXPO_PUBLIC_API_URL is not set. Set it to something like http://192.168.1.23:8000/api so the app can reach your Django server."
    );
  } else {
    console.log("API baseURL:", baseURL);
  }
}

export const api = axios.create({
  baseURL: baseURL || "http://127.0.0.1:8000/api", // safe-ish fallback for web preview
  timeout: 10000,
});

// Endpoints
export const fetchClimbs = async () => (await api.get("/climbs/")).data;
export const listLogs   = async (q: any = {}) => (await api.get("/logs/", { params: q })).data;
export const createLog  = async (payload: any) => (await api.post("/logs/", payload)).data;
export const updateLog  = async (id: number, payload: any) => (await api.put(`/logs/${id}/`, payload)).data;
export const deleteLog  = async (id: number) => (await api.delete(`/logs/${id}/`)).status === 204;
export const runReport  = async (q: any = {}) => (await api.get("/logs/report/", { params: q })).data;
