import apiClient from "./api";

const quizResultService = {
    submitQuiz: async(data) => {
        try {
            const response = await apiClient.post(`/quiz-results`,data)
            return response.data
        } catch (error) {
            throw error
        }
    }
}

export default quizResultService