// frontend/src/components/SeasonCalendar.jsx
import React, { useState, useEffect } from 'react';
import { Card, Select, Spin, message } from 'antd';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { seasonPlansApi, seasonsApi } from '../services/api';

const localizer = momentLocalizer(moment);

const SeasonCalendar = () => {
  const [events, setEvents] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const res = await seasonsApi.getAll();
        setSeasons(res.data);
        if (res.data.length > 0) {
          setSelectedSeason(res.data[0].id);
        }
      } catch (error) {
        message.error('Failed to load seasons');
        console.error(error);
      }
    };

    fetchSeasons();
  }, []);

  useEffect(() => {
    const fetchPlans = async () => {
      if (!selectedSeason) return;

      try {
        setLoading(true);
        const res = await seasonPlansApi.getAll({ season: selectedSeason });
        const plans = res.data.results || [];

        const calendarEvents = plans.flatMap(plan => {
          const events = [];
          
          // Planting event
          if (plan.planned_planting_date) {
            events.push({
              id: `${plan.id}-planting`,
              title: `🌱 Plant ${plan.crop_display}`,
              start: new Date(plan.planned_planting_date),
              end: new Date(plan.planned_planting_date),
              allDay: true,
              resource: plan,
              type: 'planting',
              color: '#52c41a', // green
            });
          }

          // Harvest event
          if (plan.planned_harvest_date) {
            events.push({
              id: `${plan.id}-harvest`,
              title: `🔄 Harvest ${plan.crop_display}`,
              start: new Date(plan.planned_harvest_date),
              end: new Date(plan.planned_harvest_date),
              allDay: true,
              resource: plan,
              type: 'harvest',
              color: '#fa8c16', // orange
            });
          }

          return events;
        });

        setEvents(calendarEvents);
      } catch (error) {
        message.error('Failed to load calendar data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedSeason) {
      fetchPlans();
    }
  }, [selectedSeason]);

  const eventStyleGetter = (event) => {
    const backgroundColor = event.color || '#1890ff';
    const style = {
      backgroundColor,
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
    };
    return { style };
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Seasonal Calendar</span>
          <Select
            value={selectedSeason}
            onChange={setSelectedSeason}
            style={{ width: 200 }}
            loading={!selectedSeason && seasons.length === 0}
          >
            {seasons.map(season => (
              <Select.Option key={season.id} value={season.id}>
                {season.name} ({moment(season.start_date).format('MMM YYYY')} - {moment(season.end_date).format('MMM YYYY')})
              </Select.Option>
            ))}
          </Select>
        </div>
      }
    >
      <Spin spinning={loading}>
        <div style={{ height: 700 }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day', 'agenda']}
            defaultView="month"
            popup
            selectable
          />
        </div>
      </Spin>
    </Card>
  );
};

export default SeasonCalendar;