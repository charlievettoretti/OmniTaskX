import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

/*const initial_state = {
    tasks: []
};*/

const initial_state = {
    tasks: [],
    loading: false,
    error: null
};

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (_, thunkAPI) => {
    try {
        const res = await fetch('http://localhost:4000/tasks', {
            method: 'GET',
            credentials: 'include',
        });

        if (!res.ok) {
            throw new Error('Failed to fetch tasks');
        }
        const data = await res.json();
        return data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.message);
    }
})

const taskSlice = createSlice({
    name: 'tasks',
    initialState: initial_state,
    reducers: {
        /*
        addTask: (state, action) => {
            state.tasks.push({
                id: action.payload.id,
                name: action.payload.taskName,
                catagory: action.payload.taskCatagory,
                description: action.payload.description,
                dateTime: action.payload.dateTime,
                urgency: action.payload.urgency,
                status: 'Not Started' // Default status
            });
        },*/
        addTask: (state, action) => {
            state.tasks.push({
                id: action.payload.id,
                name: action.payload.taskName,
                description: action.payload.description,
                dateTime: action.payload.dateTime,
                urgency: action.payload.urgency,
                status: 'Not Started',
                category_id: action.payload.category_id,
                category: {
                    id: action.payload.category_id,
                    name: action.payload.categoryName,
                    color: action.payload.categoryColor
                },

                estimated_duration_minutes: action.payload.estimated_duration_minutes ?? null,
                energy_level: action.payload.energy_level ?? null,
                location_type: action.payload.location_type ?? null,
                flexibility: action.payload.flexibility ?? null, 
                is_habit: action.payload.is_habit ?? false,
            });
        },

        updateTaskStatus: (state, action) => {
            const { id, status, category_id, category_name, category_color } = action.payload;
            const task = state.tasks.find(tsk => tsk.id === id);
            if (task) {
                task.status = status;
                if (category_id && category_name && category_color) {
                    task.category_id = category_id;
                    task.category = {
                        id: category_id,
                        name: category_name,
                        color: category_color
                    };
                }
            }
        },
        setTasks: (state, action) => {
            state.tasks = action.payload;
        },
        editTask: (state, action) => {
            const updatedTask = action.payload;
            const index = state.tasks.findIndex(task => task.id === updatedTask.id);
            if (index !== -1) {
                state.tasks[index] = {
                    user_id: updatedTask.user_id,
                    id: updatedTask.id,
                    name: updatedTask.name,
                    description: updatedTask.description,
                    dateTime: updatedTask.due_date,
                    urgency: updatedTask.urgency,
                    status: updatedTask.status || 'Not Started',
                    category_id: updatedTask.category_id,
                    category: {
                        id: updatedTask.category_id,
                        name: updatedTask.category_name,
                        color: updatedTask.category_color
                    },

                    estimated_duration_minutes: updatedTask.estimated_duration_minutes ?? null,
                    energy_level: updatedTask.energy_level ?? null,
                    location_type: updatedTask.location_type ?? null,
                    flexibility: updatedTask.flexibility ?? null, 
                    is_habit: updatedTask.is_habit ?? false,
                };
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTasks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            /*
            .addCase(fetchTasks.fulfilled, (state, action) => {
                console.log('Tasks fetched from backend', action.payload);
                state.loading = false;
                state.tasks = action.payload.map(task => ({
                    user_id: task.user_id,
                    id: task.id,
                    name: task.name,
                    catagory: task.catagory,
                    description: task.description,
                    dateTime: task.due_date,
                    urgency: task.urgency,
                    status: task.status || 'Not Started'
                }));
            })*/
            .addCase(fetchTasks.fulfilled, (state, action) => {
                //console.log('Tasks fetched from backend', action.payload);

                state.loading = false;
                
                state.tasks = action.payload.map(task => ({
                    user_id: task.user_id,
                    id: task.id,
                    name: task.name,
                    description: task.description,
                    dateTime: task.due_date,
                    urgency: task.urgency,
                    status: task.status || 'Not Started',
                    category_id: task.category_id,
                    category: {
                        id: task.category_id,
                        name: task.category_name,
                        color: task.category_color
                    },
                    estimated_duration_minutes: task.estimated_duration_minutes,
                    energy_level: task.energy_level,
                    location_type: task.location_type,
                    flexibility: task.flexibility,
                    is_habit: task.is_habit
                }));
                
                /*
                const mapped = action.payload.map(task => {
                    const mappedTask = {
                        user_id: task.user_id,
                        id: task.id,
                        name: task.name,
                        description: task.description,
                        dateTime: task.due_date,
                        urgency: task.urgency,
                        status: task.status || 'Not Started',
                        category_id: task.category_id,
                        category: {
                            id: task.category_id,
                            name: task.category_name,
                            color: task.category_color
                        },
                        estimated_duration_minutes: task.estimated_duration_minutes,
                        energy_level: task.energy_level,
                        location_type: task.location_type,
                        flexibility: task.flexibility,
                        is_habit: task.is_habit
                    };

                    console.log('Mapped Single Task:', mappedTask);
                    return mappedTask;
                });

                //console.log('Mapped Single Task:', )
                state.tasks = mapped;*/
            })

            .addCase(fetchTasks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Error fetching tasks';
            });
    }
});

export const selectTask = (state) => state.tasks.tasks;

export const { addTask, updateTaskStatus, setTasks, editTask } = taskSlice.actions;

export default taskSlice.reducer;