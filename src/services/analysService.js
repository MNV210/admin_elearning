import apiClient from './api';

const AnalysisService = {
    getActionHistory: async () => {
        const response = await apiClient.get('/action-history');
        return response.data;
    },
    getUserAndCourseInMonth: async () => {
        const response = await apiClient.get('/analys');
        return response.data;
    },
    getUserIn6Month: async () => {
        const response = await apiClient.get('/user_in_6_month');
        return response.data;
    },

}

export default AnalysisService;
