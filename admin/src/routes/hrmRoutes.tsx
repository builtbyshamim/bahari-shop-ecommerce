import AllDesignations from '../features/hrm/designations/AllDesignations';
import AllEmployees from '../features/hrm/employee/AllEmployee';
import AdminOnlyRoute from '../components/providers/AdminOnlyRoute';

const hrmRoutes = [
  {
    path: '/admin/hrm/designations',
    element: <AdminOnlyRoute><AllDesignations /></AdminOnlyRoute>,
  },
  {
    path: '/admin/hrm/employees',
    element: <AdminOnlyRoute><AllEmployees /></AdminOnlyRoute>,
  },
];

export default hrmRoutes;
