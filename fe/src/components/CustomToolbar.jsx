import React from 'react';
import { Button, Select, Space, Typography } from 'antd';

const { Title } = Typography;
const { Option } = Select;
const CustomToolbar = (toolbar) => {
  const { label, onNavigate, onView } = toolbar;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '8px' }}>
      <Space>
        <Button onClick={() => onNavigate('PREV')}>Trở lại</Button>
        <Button type="primary" onClick={() => onNavigate('TODAY')}>Hôm nay</Button>
        <Button onClick={() => onNavigate('NEXT')}>Tiếp theo</Button>
      </Space>

      <Title level={4} style={{ margin: 0 }}>
        {label}
      </Title>

      <Select defaultValue="month" onChange={(value) => onView(value)}>
         <Option value="month">Tháng</Option>
         <Option value="week">Tuần</Option>
         <Option value="day">Ngày</Option>
      </Select>
    </div>
  );
};
export default CustomToolbar;