import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
/*
const initial_state = {
    catagories: []
};
*/
const initial_state = {
    catagories: [],
    loading: false,
    error: null
};

export const fetchCategories = createAsyncThunk('categories/fetchCategories', async (_, thunkAPI) => {
    try {
        const res = await fetch('http://localhost:4000/categories', {
            method: 'GET',
            credentials: 'include',
        });

        if (!res.ok) {
            throw new Error('Failed to fetch categories');
        }
        const data = await res.json();
        return data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.message);
    }
});

const catagorySlice = createSlice({
    name: 'catagories',
    initialState: initial_state,
    reducers: {
        addCatagory: (state, action) => {
            state.catagories.push({
                id: crypto.randomUUID(),
                name: action.payload.catagoryName,
                color: action.payload.catagoryColor
            });
        },
        updateCatagory: (state, action) => {
            const index = state.catagories.findIndex(catagory => catagory.id === action.payload.id);
            if (index != -1) {
                state.catagories[index] = action.payload;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.catagories = action.payload.map(catagory => ({
                    id: catagory.id,
                    name: catagory.name,
                    color: catagory.color
                }));
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Error fetching categories';
            });
    }
});

export const selectCatagory = (state) => state.catagories.catagories;

export const { addCatagory, updateCatagory } = catagorySlice.actions;

export default catagorySlice.reducer;