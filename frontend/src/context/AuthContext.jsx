// Re-export the canonical AuthContext from ../contexts/AuthContext
export { AuthProvider, useAuth } from '../contexts/AuthContext';

// Also export the default context in case some modules import default
export { default } from '../contexts/AuthContext';
