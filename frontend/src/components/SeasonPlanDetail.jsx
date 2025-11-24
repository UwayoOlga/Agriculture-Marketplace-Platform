// frontend/src/components/SeasonPlanDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Descriptions, Tag, message, Popconfirm, Spin } from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  ArrowLeftOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { seasonPlansApi } from '../services/api';
import dayjs from 'dayjs';

const SeasonPlanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true);
        const res = await seasonPlansApi.getById(id);
        setPlan(res.data);
      } catch (error) {
        message.error('Failed to load plan details');
        console.error(error);
        navigate('/agriculture/plans');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPlan();
    }
  }, [id, navigate]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await seasonPlansApi.delete(id);
      message.success('Plan deleted successfully');
      navigate('/agriculture/plans');
    } catch (error) {
      message.error('Failed to delete plan');
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const getStatus = () => {
    if (!plan) return null;
    
    if (plan.actual_harvest_date) {
      return <Tag color="green">Harvested on {dayjs(plan.actual_harvest_date).format('MMM D, YYYY')}</Tag>;
    }
    if (plan.actual_planting_date) {
      return <Tag color="blue">Planted on {dayjs(plan.actual_planting_date).format('MMM D, YYYY')}</Tag>;
    }
    return <Tag>Planned</Tag>;
  };

  if (loading) {
    return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }} />;
  }

  if (!plan) {
    return <div>Plan not found</div>;
  }

  return (
    <div>
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/agriculture/plans')}
        style={{ marginBottom: 16 }}
      >
        Back to Plans
      </Button>

      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{plan.crop_display} - {plan.season_name}</span>
            <div>
              <Button
                type="primary"
                icon={<CalendarOutlined />}
                onClick={() => navigate(`/agriculture/plans/${id}/calendar`)}
                style={{ marginRight: 8 }}
              >
                View Calendar
              </Button>
              <Button
                type="default"
                icon={<EditOutlined />}
                onClick={() => navigate(`/agriculture/plans/${id}/edit`)}
                style={{ marginRight: 8 }}
              >
                Edit
              </Button>
              <Popconfirm
                title="Are you sure you want to delete this plan?"
                onConfirm={handleDelete}
                okText="Yes"
                cancelText="No"
                okButtonProps={{ loading: deleting }}
              >
                <Button danger icon={<DeleteOutlined />}>
                  Delete
                </Button>
              </Popconfirm>
            </div>
          </div>
        }
      >
        <Descriptions bordered column={1} size="middle">
          <Descriptions.Item label="Status">{getStatus()}</Descriptions.Item>
          <Descriptions.Item label="Season">{plan.season_name}</Descriptions.Item>
          <Descriptions.Item label="Crop">{plan.crop_display}</Descriptions.Item>
          <Descriptions.Item label="Plot Size">{plan.plot_size} hectares</Descriptions.Item>
          
          <Descriptions.Item label="Planned Planting Date">
            {plan.planned_planting_date ? dayjs(plan.planned_planting_date).format('MMMM D, YYYY') : 'Not set'}
          </Descriptions.Item>
          
          <Descriptions.Item label="Actual Planting Date">
            {plan.actual_planting_date 
              ? dayjs(plan.actual_planting_date).format('MMMM D, YYYY') 
              : 'Not planted yet'}
          </Descriptions.Item>
          
          <Descriptions.Item label="Planned Harvest Date">
            {plan.planned_harvest_date ? dayjs(plan.planned_harvest_date).format('MMMM D, YYYY') : 'Not set'}
          </Descriptions.Item>
          
          <Descriptions.Item label="Actual Harvest Date">
            {plan.actual_harvest_date 
              ? dayjs(plan.actual_harvest_date).format('MMMM D, YYYY') 
              : 'Not harvested yet'}
          </Descriptions.Item>
          
          <Descriptions.Item label="Expected Yield">
            {plan.expected_yield} kg
          </Descriptions.Item>
          
          <Descriptions.Item label="Actual Yield">
            {plan.actual_yield ? `${plan.actual_yield} kg` : 'Not available'}
          </Descriptions.Item>
          
          {plan.notes && (
            <Descriptions.Item label="Notes">
              {plan.notes}
            </Descriptions.Item>
          )}
          
          <Descriptions.Item label="Created">
            {dayjs(plan.created_at).format('MMMM D, YYYY [at] h:mm A')}
          </Descriptions.Item>
          
          <Descriptions.Item label="Last Updated">
            {dayjs(plan.updated_at).format('MMMM D, YYYY [at] h:mm A')}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default SeasonPlanDetail;