import axiosClient from "./axiosClient"

const genreApi = {
    getAll: ({page, limit}) => {
        const url = 'genres/'
        return axiosClient.get(url, { params: {page, limit}})
    },
    create: (data) => {
        const url = 'genres/'
        return axiosClient.post(url, data)
    },
    update: (id, data) => {
        const url = `genres/${id}`
        return axiosClient.put(url, data)
    },
    delete: (id) => {
        const url = `genres/${id}`
        return axiosClient.delete(url)
    },
    getBySlug: (slug) => {
        const url = `genres/slug/${slug}`
        return axiosClient.get(url)
    },
}

export default genreApi