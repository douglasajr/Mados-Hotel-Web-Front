import api from "./axios.api"

export const getRoomChargesApi = async (params = {}) => {
  const { data } = await api.get("/room-charges", { params })
  return data
}

export const updateRoomChargeApi = async (id, body) => {
  const { data } = await api.put(`/room-charges/${id}`, body)
  return data
}
