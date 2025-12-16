import apiClient from '../api/apiClient';

export const analyticsAPI = {
    getSalesAnalytics: async (period = '30d') => {
        const response = await apiClient.get(`/analytics/sales/?period=${period}`);
        return response.data;
    },
    getUserAnalytics: async () => {
        const response = await apiClient.get('/analytics/users/');
        return response.data;
    },
    getProductAnalytics: async () => {
        const response = await apiClient.get('/analytics/products/');
        return response.data;
    },
    getCustomReport: async (filters) => {
        const response = await apiClient.post('/analytics/custom-report/', filters);
        return response.data;
    }
};

export default analyticsAPI;
