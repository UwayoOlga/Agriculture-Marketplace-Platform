// frontend/src/components/Sidebar.jsx (or your navigation component)
import { Menu } from 'antd';
import {
  HomeOutlined,
  ShoppingOutlined,
  CalendarOutlined,
  PlusCircleOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';

const Sidebar = () => {
  return (
    <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
      {/* Existing menu items */}
      
      <Menu.SubMenu key="agriculture" icon={<CalendarOutlined />} title="Agriculture">
        <Menu.Item key="plans" icon={<UnorderedListOutlined />}>
          <Link to="/agriculture/plans">My Season Plans</Link>
        </Menu.Item>
        <Menu.Item key="new-plan" icon={<PlusCircleOutlined />}>
          <Link to="/agriculture/plans/new">New Season Plan</Link>
        </Menu.Item>
        <Menu.Item key="calendar" icon={<CalendarOutlined />}>
          <Link to="/agriculture/calendar">Season Calendar</Link>
        </Menu.Item>
      </Menu.SubMenu>
    </Menu>
  );
};

export default Sidebar;