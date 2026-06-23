import api from "./axios.api"

export const getReservationChargesApi = async (reservationId) => {
  const { data } = await api.get("/reservation-charges", { params: { reservationId } })
  return data
}

export const addReservationChargeApi = async (body) => {
  const { data } = await api.post("/reservation-charges", body)
  return data
}

export const updateReservationChargeApi = async (id, body) => {
  const { data } = await api.put(`/reservation-charges/${id}`, body)
  return data
}

export const deleteReservationChargeApi = async (id) => {
  const { data } = await api.delete(`/reservation-charges/${id}`)
  return data
}
