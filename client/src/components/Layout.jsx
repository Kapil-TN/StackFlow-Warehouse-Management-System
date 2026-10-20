import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        marginLeft: 'var(--sidebar-width)',
        overflow: 'auto',
        minHeight: '100vh',
        transition: 'margin-left 0.2s ease',
      }}>
        <div style={{ padding: '28px 36px', minHeight: '100vh' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
