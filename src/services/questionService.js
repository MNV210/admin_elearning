import apiClient from "./api";

const questionService = { 
    getAllQuestions: async (quizId) => {
        try {
            const response = await apiClient.get(`/questions?quiz_id=${quizId}`);
            return response.data;
        } catch (error) {
            throw error;    
        }
    },
    createQuestion: async (questionData) => {
        try {
            const response = await apiClient.post('/questions', questionData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    updateQuestion: async (questionId, questionData) => {
        try {
            const response = await apiClient.put(`/questions/${questionId}`, questionData); 
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    deleteQuestion: async (questionId) => { 
        try {
            const response = await apiClient.delete(`/questions/${questionId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }   
}

export default questionService;
