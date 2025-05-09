import axios from "axios"

const AIService = {
    uploadFileToAI : async(data) => {
        const response = await axios.post('http://localhost:9000/update_file_data', data,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                },
                { withCredentials: true },
                {
                    timeout: 1000000, // 10 giây timeout
                }
        );
        return response.data;
    }
}
export default AIService