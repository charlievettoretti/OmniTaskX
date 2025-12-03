import React from 'react';
import logo from './logo.svg';
import { Counter } from './features/counter/Counter';
import './App.css';


import NavBar from "./components/NavBar";

import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import DashboardPage from "./pages/Dashboard"
import ProfilePage from "./pages/ProfilePage";
import GroupPage from "./pages/GroupPage";
import ToDoPage from "./pages/ToDoPage";
import CalendarPage from "./pages/CalendarPage";
import AiPage from "./pages/AiPage";
import Settings from './pages/SettingsPage';
import RequireAuth from './RequireAuth';

import WeeklyPage from './pages/WeeklyPage';
import LandingPage from './pages/LandingPage';



const router = createBrowserRouter( createRoutesFromElements(
  <>
  {/*<Route path='/' element={<Navigate to='/dashboard' replace />} />*/}
  <Route path ='/' element = { <LandingPage /> } />
  <Route path='/login' element = { <LoginPage /> } />

  <Route element = { <RequireAuth /> } >
  {/*<Route path="/" element = { <NavBar /> }>*/}
  <Route element = { <NavBar /> } >
    <Route path='/dashboard' element={ <DashboardPage />} />
    <Route path="/profile" element={ <ProfilePage /> } />
    <Route path='/group' element={ <GroupPage /> } />
    <Route path='/to-do' element={ <ToDoPage /> } />
    <Route path='/calendar' element={ <CalendarPage /> } />
    <Route path='/weekly' element={ <WeeklyPage /> } />
    <Route path='/ai' element= { <AiPage /> } />
    <Route path='/settings' element = { <Settings /> } />
  </Route>
  </Route>
  </>
));

function App() {
  return (
    <RouterProvider router={router} />
  );
}



/*
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Counter />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <span>
          <span>Learn </span>
          <a
            className="App-link"
            href="https://reactjs.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            React
          </a>
          <span>, </span>
          <a
            className="App-link"
            href="https://redux.js.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Redux
          </a>
          <span>, </span>
          <a
            className="App-link"
            href="https://redux-toolkit.js.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Redux Toolkit
          </a>
          ,<span> and </span>
          <a
            className="App-link"
            href="https://react-redux.js.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            React Redux
          </a>
        </span>
      </header>
    </div>
  );
}
*/

export default App;
