import axios from "axios"

const AIService = {
    uploadFileToAI : async(data) => {
        const response = await axios.post('http://3.238.200.66/update_file_data', data,
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