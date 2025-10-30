import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initial_state = {
    groups: [],
    loading: false,
    error: null
};

export const fetchGroups = createAsyncThunk('groups/fetchGroups', async (_, thunkAPI) => {
    try {
        const res = await fetch('http://localhost:4000/groups', {
            method: 'GET',
            credentials: 'include',
        });
        if (!res.ok) {
            throw new Error('Failed to fetch groups');
        }
        const data = await res.json();
        return data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.message);
    }
});

export const renameGroup = createAsyncThunk('groups/renameGroup', async ({ groupId, name }, thunkAPI) => {
    try {
        const res = await fetch(`http://localhost:4000/groups/${groupId}/rename`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ name }),
        });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to rename group');
        }
        const data = await res.json();
        return data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.message);
    }
});

const groupSlice = createSlice({
    name: 'groups',
    initialState: initial_state,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchGroups.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGroups.fulfilled, (state, action) => {
                state.loading = false;
                state.groups = action.payload;
            })
            .addCase(fetchGroups.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Error fetching groups';
            })
            .addCase(renameGroup.fulfilled, (state, action) => {
                const updatedGroup = action.payload;
                const index = state.groups.findIndex(group => group.id === updatedGroup.id);
                if (index !== -1) {
                    state.groups[index] = updatedGroup;
                }
            });
    }
});

export const selectGroups = (state) => state.groups.groups;
export default groupSlice.reducer;