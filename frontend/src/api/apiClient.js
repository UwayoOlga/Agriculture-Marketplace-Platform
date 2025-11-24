import api from '../services/api';

// Attach a lightweight response interceptor to normalize application-level
// error payloads (e.g. { code: 403 }) coming from our API into rejected Errors.
// This avoids treating extension or third-party responses as app errors.
const attachAppLevelInterceptor = () => {
  api.interceptors.response.use(
    (response) => {
      try {
        const respUrl = response?.config?.url || '';
        const respBase = response?.config?.baseURL || '';
        const apiBase = api.defaults.baseURL || '';

        // Only inspect responses that originate from our configured API base URL
        const isOwnApi = apiBase && ((respBase && respBase.includes(apiBase)) || (respUrl && respUrl.startsWith('/')));
        if (!isOwnApi) return response;

        const data = response?.data;
        if (data && (data.code === 403 || data.status_code === 403)) {
          try {
            console.error('Application-level 403 detected', {
              url: response.config?.url,
              status: response.status,
              body: data,
            });
          } catch (e) {}

          const err = new Error(data.message || data.detail || 'Forbidden');
          err.name = data.name || 'ApplicationError';
          err.httpError = false;
          err.httpStatus = response.status;
          err.code = 403;
          err.response = { data, status: 403 };
          return Promise.reject(err);
        }
      } catch (e) {
        // ignore parsing errors
      }
      return response;
    },
    (error) => Promise.reject(error)
  );
};

attachAppLevelInterceptor();

export default api;
