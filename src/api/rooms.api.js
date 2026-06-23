import api from './axios.api'


export const getRoomsApi = async (params = {}) => {
  const { data } = await api.get('/rooms', { params })
  return data
}

export const createRoomApi = async (roomData) => {
    const { data } = await api.post('/rooms', roomData)
    return data
}

export const updateRoomApi = async (id, roomData) => {
    const { data } = await api.put(`/rooms/${id}`, roomData)
    return data
}

export const toggleRoomStatusApi = async (id, status) => {
    const { data } = await api.patch(`/rooms/${id}/status`, { status })
    return data
}
