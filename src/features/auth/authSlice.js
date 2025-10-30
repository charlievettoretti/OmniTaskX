import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
    user: null,
};

export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, thunkAPI) => {
    try {
        const res = await fetch('http://localhost:4000/auth/me', {
            credentials: 'include',
        })
        if (!res.ok) {
            throw new Error('Failed to fetch user');
        }
        const user = await res.json();
        thunkAPI.dispatch(setUser(user));
        return user;
    } catch (err) {
        thunkAPI.dispatch(clearUser());
        console.warn('User not authenticated');
    }
})

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        clearUser: (state) => {
            state.user = null;
        }
    }
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;