import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Table, Tag, Space, message, Popconfirm, Input, Select, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;

const SeasonPlanList = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [filters, setFilters] = useState({});
  const navigate = useNavigate();

  const fetchPlans = async (params = {}) => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/farm-plans/', {
        params: {
          page: params.pagination?.current || 1,
          pageSize: params.pagination?.pageSize || 10,
          ...filters,
          ...params.filters,
        },
      });
      setPlans(data.results);
      setPagination({
        ...params.pagination,
        total: data.count,
      });
    } catch (error) {
      message.error('Failed to fetch season plans');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans({ pagination });
  }, [filters]);

  const handleTableChange = (newPagination, filters, sorter) => {
    fetchPlans({
      sortField: sorter.field,
      sortOrder: sorter.order,
      pagination: newPagination,
      ...filters,
    });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/farm-plans/${id}/`);
      message.success('Plan deleted successfully');
      fetchPlans({ pagination });
    } catch (error) {
      message.error('Failed to delete plan');
      console.error(error);
    }
  };

  const columns = [
    {
      title: 'Crop',
      dataIndex: 'crop_display',
      key: 'crop',
      sorter: true,
    },
    {
      title: 'Season',
      dataIndex: 'season_name',
      key: 'season',
      sorter: true,
    },
    {
      title: 'Planted On',
      dataIndex: 'planned_planting_date',
      key: 'planting_date',
      render: (date) => date ? dayjs(date).format('MMM D, YYYY') : '-',
      sorter: true,
    },
    {
      title: 'Area (ha)',
      dataIndex: 'plot_size',
      key: 'plot_size',
      sorter: true,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        if (record.actual_harvest_date) {
          return <Tag color="green">Harvested</Tag>;
        }
        if (record.actual_planting_date) {
          return <Tag color="blue">Planted</Tag>;
        }
        return <Tag>Planned</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<CalendarOutlined />}
            onClick={() => navigate(`/agriculture/plans/${record.id}/calendar`)}
            title="View Calendar"
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/agriculture/plans/${record.id}/edit`)}
            title="Edit"
          />
          <Popconfirm
            title="Are you sure you want to delete this plan?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} title="Delete" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="season-plans">
      <Card
        title="My Seasonal Plans"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/agriculture/plans/new')}
          >
            New Plan
          </Button>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Search
              placeholder="Search plans..."
              onSearch={(value) => setFilters({ ...filters, search: value })}
              style={{ width: 300 }}
              allowClear
            />
            <Select
              placeholder="Filter by Status"
              style={{ width: 200 }}
              allowClear
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Option value="planned">Planned</Option>
              <Option value="planted">Planted</Option>
              <Option value="harvested">Harvested</Option>
            </Select>
            <Select
              placeholder="Filter by Season"
              style={{ width: 200 }}
              allowClear
              onChange={(value) => setFilters({ ...filters, season: value })}
            >
              <Option value="A">Season A (Sep-Feb)</Option>
              <Option value="B">Season B (Mar-Jun)</Option>
              <Option value="C">Season C (Jul-Sep)</Option>
            </Select>
          </Space>
        </div>
        <Table
          columns={columns}
          rowKey="id"
          dataSource={plans}
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
};

export default SeasonPlanList;