import api from "./axios.api"

export const getMenuApi = async (params = {}) => {
    const { data } = await api.get("/menu", { params })
    return data
}

export const createMenuApi = async (menuData) => {
    const { data } = await api.post("/menu", menuData)
    return data
}

export const updateMenuApi = async (id, menuData) => {
    const { data } = await api.put(`/menu/${id}`, menuData)
    return data
}

export const toggleMenuStatusApi = async (id, available) => {
    const { data } = await api.patch(`/menu/${id}/availability`, { available })
    return data
}
