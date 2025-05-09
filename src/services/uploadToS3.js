import axios from 'axios';

const uploadToS3 = {
  uploadVideo: async ({ file }) => {
    const formData = new FormData();
    formData.append('file', file);

    return axios.post('http://localhost:9000/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true, // Include credentials if needed
    });
  },
};

export default uploadToS3;