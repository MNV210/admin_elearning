import apiClient from "./api";

const lessonService = { 
    deleteLesson: async (lessonId) => {
        try {
            const response = await apiClient.delete(`/lessons/${lessonId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    createLesson: async (data) => {
        try {
            const response = await apiClient.post(`/lessons`,data);
            return response.data
        } catch(error)
        {
            throw error
        }
    },
    updateLesson: async(data) => {
        try {
            const response = await apiClient.put(`/lessons/${data.id}`,data);
            return response.data
        } catch (error) {
            throw error
        }
    }
}

export default lessonService;   