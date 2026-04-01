import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    console.log("Headers: ", req.headers);
    console.log(req.file);
    console.log(req.user);
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;
