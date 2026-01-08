import axios from "axios";

const api = axios.create({
  baseURL: "https://homefixer.patrixel.com", // LIVE API
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default api;
