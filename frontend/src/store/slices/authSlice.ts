import { createSlice,type PayloadAction } from '@reduxjs/toolkit';
import { type User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    login: (state, action: PayloadAction<{ email: string; password: string; name?: string }>) => {
      // Simulate login - in production, this would be an async thunk
      const { email, name } = action.payload;
      state.user = {
        id: crypto.randomUUID(),
        email,
        name: name || email.split('@')[0],
        createdAt: new Date().toISOString(),
      };
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setUser, login, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
