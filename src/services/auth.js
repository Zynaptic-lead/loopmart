export const AuthService = {
  setToken: (token, rememberMe = true) => {
    if (rememberMe) {
      localStorage.setItem('loopmart_token', token);
    } else {
      sessionStorage.setItem('loopmart_token', token);
    }
  },
  
  getToken: () => {
    return localStorage.getItem('loopmart_token') || sessionStorage.getItem('loopmart_token');
  },
  
  clearToken: () => {
    localStorage.removeItem('loopmart_token');
    sessionStorage.removeItem('loopmart_token');
  }
};