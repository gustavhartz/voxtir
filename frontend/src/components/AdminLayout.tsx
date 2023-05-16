import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AdminLayout: React.FC = () => {
  return (
    <div className="flex">
      <Sidebar />
      <Outlet />
    </div>
  );
};

export default AdminLayout;
