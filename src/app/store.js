import { configureStore } from '@reduxjs/toolkit';
/*import counterReducer from '../features/counter/counterSlice';*/
import tasksReducer from '../features/tasks/taskSlice';
import catagoryReducer from '../features/catagories/catagorySlice';
import eventsReducer from '../features/events/eventSlice';
import groupsReducer from '../features/groups/groupSlice';
import authReducer from '../features/auth/authSlice';
import groupTasksReducer from '../features/groups/groupTasks/groupTasksSlice';

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    catagories: catagoryReducer,
    events: eventsReducer,
    groups: groupsReducer,
    auth: authReducer,
    groupTasks: groupTasksReducer
  },
});
