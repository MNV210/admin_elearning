import apiClient from "./api"

const userRegisterCourse = {
    registerCourse : async(data) => {
        const response = await apiClient.post('/user_register_course',data)

        return response.data
    }
}

export default userRegisterCourse; 