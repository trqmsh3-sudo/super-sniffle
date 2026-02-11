// Simple authentication system
const ADMIN_PASSWORD = 'ClearPick2025!'; // שנה את הסיסמה הזו למשהו שרק אתה יודע

export const isAuthenticated = () => {
  return localStorage.getItem('isAdmin') === 'true';
};

export const login = (password) => {
  if (password === ADMIN_PASSWORD) {
    localStorage.setItem('isAdmin', 'true');
    return true;
  }
  return false;
};

export const logout = () => {
  localStorage.removeItem('isAdmin');
};
