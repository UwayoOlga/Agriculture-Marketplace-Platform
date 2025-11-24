// frontend/src/components/SeasonPlanForm.jsx
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, DatePicker, Select, InputNumber, message, Card, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { seasonPlansApi, seasonsApi, cropCalendarsApi } from '../services/api';

const { TextArea } = Input;
const { Option } = Select;

const SeasonPlanForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [seasons, setSeasons] = useState([]);
  const [crops, setCrops] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const seasonsRes = await seasonsApi.getAll();
        setSeasons(seasonsRes.data);

        if (id) {
          const planRes = await seasonPlansApi.getById(id);
          const plan = planRes.data;
          form.setFieldsValue({
            ...plan,
            planned_planting_date: plan.planned_planting_date ? dayjs(plan.planned_planting_date) : null,
            actual_planting_date: plan.actual_planting_date ? dayjs(plan.actual_planting_date) : null,
            planned_harvest_date: plan.planned_harvest_date ? dayjs(plan.planned_harvest_date) : null,
            actual_harvest_date: plan.actual_harvest_date ? dayjs(plan.actual_harvest_date) : null,
          });
          setSelectedSeason(plan.season);
          await fetchCropCalendars(plan.season);
        }
      } catch (error) {
        message.error('Failed to load form data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, form]);

  const fetchCropCalendars = async (seasonId) => {
    try {
      const res = await cropCalendarsApi.getBySeason(seasonId);
      setCrops(res.data);
    } catch (error) {
      message.error('Failed to load crop data');
      console.error(error);
    }
  };

  const handleSeasonChange = async (value) => {
    setSelectedSeason(value);
    setCrops([]);
    form.setFieldsValue({ crop: undefined });
    if (value) {
      await fetchCropCalendars(value);
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const formattedValues = {
        ...values,
        planned_planting_date: values.planned_planting_date?.format('YYYY-MM-DD'),
        actual_planting_date: values.actual_planting_date?.format('YYYY-MM-DD'),
        planned_harvest_date: values.planned_harvest_date?.format('YYYY-MM-DD'),
        actual_harvest_date: values.actual_harvest_date?.format('YYYY-MM-DD'),
      };

      if (id) {
        await seasonPlansApi.update(id, formattedValues);
        message.success('Plan updated successfully');
      } else {
        await seasonPlansApi.create(formattedValues);
        message.success('Plan created successfully');
      }
      navigate('/agriculture/plans');
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to save plan');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={id ? 'Edit Season Plan' : 'New Season Plan'}
      style={{ maxWidth: 800, margin: '0 auto' }}
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            plot_size: 0.1,
            expected_yield: 0,
          }}
        >
          <Form.Item
            name="season"
            label="Season"
            rules={[{ required: true, message: 'Please select a season' }]}
          >
            <Select
              placeholder="Select a season"
              onChange={handleSeasonChange}
              disabled={!!id}
            >
              {seasons.map((season) => (
                <Option key={season.id} value={season.id}>
                  {season.name} ({dayjs(season.start_date).format('MMM YYYY')} - {dayjs(season.end_date).format('MMM YYYY')})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="crop"
            label="Crop"
            rules={[{ required: true, message: 'Please select a crop' }]}
          >
            <Select
              placeholder="Select a crop"
              disabled={!selectedSeason || !!id}
            >
              {crops.map((crop) => (
                <Option key={crop.id} value={crop.crop}>
                  {crop.get_crop_display}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="plot_size"
            label="Plot Size (hectares)"
            rules={[{ required: true, message: 'Please enter plot size' }]}
          >
            <InputNumber
              min={0.01}
              step={0.01}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="planned_planting_date"
            label="Planned Planting Date"
            rules={[{ required: true, message: 'Please select planned planting date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="actual_planting_date"
            label="Actual Planting Date (leave blank if not planted yet)"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="planned_harvest_date"
            label="Planned Harvest Date"
            rules={[{ required: true, message: 'Please select planned harvest date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="actual_harvest_date"
            label="Actual Harvest Date (leave blank if not harvested yet)"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="expected_yield"
            label="Expected Yield (kg)"
            rules={[{ required: true, message: 'Please enter expected yield' }]}
          >
            <InputNumber
              min={0}
              step={0.1}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="actual_yield"
            label="Actual Yield (kg, leave blank if not harvested yet)"
          >
            <InputNumber
              min={0}
              step={0.1}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {id ? 'Update Plan' : 'Create Plan'}
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => navigate('/agriculture/plans')}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </Card>
  );
};

export default SeasonPlanForm;