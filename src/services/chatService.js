import apiClient from './api';

const chatService = {
    getAllMessage : async(data) => {
        try {
            const response = await apiClient.post('/chatbot/conversation-thread',data)
            console.log(response.data)
            return response.data
        } catch (error) {
            
        }
    }
}
export default chatService
