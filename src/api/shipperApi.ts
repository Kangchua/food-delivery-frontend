import axios from 'axios';

const API_URL = 'https://localhost:xxxx/api/shipper'; // Thay xxxx bằng port BE của anh

export const shipperApi = {
    
    assignRole: (userId: string) => axios.post(`${API_URL}/assign-role`, { userId }),

   
    getDashboard: async () => {
        const response = await axios.get(`${API_URL}/dashboard`);
        return response.data;
    },

    getAssignedOrders: async () => {
        const response = await axios.get(`${API_URL}/assigned-orders`);
        return response.data;
    },
    
    
    getAll: () => axios.get(API_URL),
    toggleStatus: (id: string, status: boolean) => axios.put(`${API_URL}/${id}/status`, { isActive: status }),
};

export default shipperApi;