import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initial_state = {
    events: [],
    loading: false,
    error: null
};

export const fetchEvents = createAsyncThunk('events/fetchEvents', async (_, thunkAPI) => {
    try {
        const res = await fetch('http://localhost:4000/events', {
            method: 'GET',
            credentials: 'include',
        });

        if (!res.ok) {
            throw new Error('Failed to fetch events');
        }
        const data = await res.json();
        return data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.message);
    }
})

const eventSlice = createSlice({
    name: 'events',
    initialState: initial_state,
    reducers: {
        addEvent: (state, action) => {
            state.events.push({
                id: crypto.randomUUID(),
                name: action.payload.eventName,
                category_id: action.payload.category_id,
                startTime: action.payload.startTime,
                endTime: action.payload.endTime,
                description: action.payload.description,
                status: 'Not Completed', // Default status
                category: {
                    id: action.payload.category_id,
                    name: action.payload.category_name,
                    color: action.payload.category_color
                }
            });
        },
        updateEventStatus: (state, action) => {
            const { id, status, category_id, category_name, category_color } = action.payload;
            const event = state.events.find(event => event.id === id);
            if (event) {
                event.status = status;
                if (category_id && category_name && category_color) {
                    event.category_id = category_id;
                    event.category = {
                        id: category_id,
                        name: category_name,
                        color: category_color
                    };
                }
            }
        },
        editEvent: (state, action) => {
            const updatedEvent = action.payload;
            const index = state.events.findIndex(event => event.id === updatedEvent.id);
            if (index !== -1) {
                state.events[index] = {
                    id: updatedEvent.id,
                    name: updatedEvent.name,
                    startTime: updatedEvent.start_time,
                    endTime: updatedEvent.end_time,
                    description: updatedEvent.description,
                    status: updatedEvent.status || 'Not Completed',
                    category_id: updatedEvent.category_id,
                    category: {
                        id: updatedEvent.category_id,
                        name: updatedEvent.category_name,
                        color: updatedEvent.category_color
                    }
                };
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchEvents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEvents.fulfilled, (state, action) => {
                state.loading = false;
                state.events = action.payload.map(event => ({
                    id: event.id,
                    name: event.name,
                    startTime: event.start_time,
                    endTime: event.end_time,
                    description: event.description,
                    status: event.status || 'Not Completed',
                    category_id: event.category_id,
                    category: {
                        id: event.category_id,
                        name: event.category_name,
                        color: event.category_color
                    }
                }));
            })
            .addCase(fetchEvents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Error fetching events';
            })
    }  
});

export const selectEvent = (state) => state.events.events;

export const { addEvent, updateEventStatus, editEvent } = eventSlice.actions;

export default eventSlice.reducer;