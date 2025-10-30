import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initial_state = {
    groupTasks: [],
    loading: false,
    error: null
};

export const fetchAllGroupTasks = createAsyncThunk('groupTasks/fetchAllGroupTasks', async (_, thunkAPI) => {
    try {
        const res = await fetch('http://localhost:4000/group-tasks/user/all', {
            method: 'GET',
            credentials: 'include',
        });
        if (!res.ok) {
            throw new Error('Failed to fetch all group tasks');
        }
        return await res.json();
    } catch (err) {
        return thunkAPI.rejectWithValue(err.message);
    }
});

export const fetchGroupTasks = createAsyncThunk('groupTasks/fetchGroupTasks', async (group_id, thunkAPI) => {
    try {
        const res = await fetch(`http://localhost:4000/group-tasks/${group_id}`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!res.ok) {
            throw new Error('Failed to fetch group tasks');
        }
        return await res.json();
    } catch (err) {
        return thunkAPI.rejectWithValue(err.message);
    }
});

export const addGroupTask = createAsyncThunk('groupTasks/addGroupTask', async ({ group_id, taskData }, thunkAPI) => {
    try {
        const res = await fetch(`http://localhost:4000/group-tasks/${group_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(taskData),
        });
        if (!res.ok) {
            throw new Error('Failed to add group task');
        }
        return await res.json();
    } catch (err) {
        return thunkAPI.rejectWithValue(err.message);
    }
});

const groupTasksSlice = createSlice({
    name: 'groupTasks',
    initialState: initial_state,
    reducers: {
        updateGroupTaskStatus: (state, action) => {
            const { id, status } = action.payload;
            const task = state.groupTasks.find(task => task.id === id);
            if (task) {
                task.status = status;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllGroupTasks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllGroupTasks.fulfilled, (state, action) => {
                state.loading = false;
                state.groupTasks = action.payload;
            })
            .addCase(fetchAllGroupTasks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchGroupTasks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGroupTasks.fulfilled, (state, action) => {
                state.loading = false;
                state.groupTasks = action.payload;
            })
            .addCase(fetchGroupTasks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(addGroupTask.fulfilled, (state, action) => {
                state.groupTasks.push(action.payload);
            })
    }
});

export const selectGroupTasks = (state) => state.groupTasks.groupTasks;
export const { updateGroupTaskStatus } = groupTasksSlice.actions;
export default groupTasksSlice.reducer;