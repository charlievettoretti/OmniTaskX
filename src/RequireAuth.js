import { Navigate, Outlet } from 'react-router-dom';
/*
const RequireAuth = () => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
        return <Navigate to='/login' replace />
    }
    return <Outlet />
}*/

function RequireAuth() {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
        return <Navigate to='/login' replace />
    }
    return <Outlet />
}

export default RequireAuth;