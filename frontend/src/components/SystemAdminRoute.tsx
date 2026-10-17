import { Navigate, Outlet } from 'react-router-dom';

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

export const SystemAdminRoute = () => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const decoded = parseJwt(token);
  const userRole = decoded?.role || decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

  if (userRole !== 'SystemOperator') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
