import { Navigate } from 'react-router-dom';
import { useFetchMeQuery } from '../../redux/api/authApi';

export default function AdminOnlyRoute({ children }: { children: React.ReactNode }) {
  const { data: meRes, isLoading } = useFetchMeQuery(undefined);

  if (isLoading) return null;

  if (meRes?.data?.role === 'EMPLOYEE') {
    return <Navigate to="/admin/orders" replace />;
  }

  return <>{children}</>;
}
