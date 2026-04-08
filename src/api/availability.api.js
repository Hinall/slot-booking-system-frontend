import api from "./axios";

export const createAvailability = async ({ date, startTime, endTime }) => {
  const res = await api.post("/availability", { date, startTime, endTime });
  return res.data;
};

export const getMyAvailabilities = async () => {
  const res = await api.get("/availability");
  return res.data;
};

