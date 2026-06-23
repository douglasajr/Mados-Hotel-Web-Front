import api from './axios.api.js'

export const getHotelsApi = async () => {
    const { data } = await api.get('/hotels')
    return data.hotels
}

export const createHotelApi = async (payload) => {
    const { data } = await api.post('/hotels', payload)
    return data.hotel
}

export const updateHotelApi = async (id, payload) => {
    const { data } = await api.put(`/hotels/${id}`, payload)
    return data.hotel
}

export const toggleHotelStatusApi = async (id, active) => {
    const { data } = await api.patch(`/hotels/${id}/status`, { active })
    return data.hotel
}