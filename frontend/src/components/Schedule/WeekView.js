import React from 'react';
import { FaPlus } from 'react-icons/fa';
import EventCard from './EventCard';
import '../../css/Schedule/WeekView.css'

const WeekView = ({ weekDates, role, handleAddEvent, getEventsForDate, formatDate, daysOfWeek, getClassName }) => {
    return (
        <div className="schedule-grid">
            {weekDates.map((date, index) => (
                <div key={index} className={`schedule-day ${date.toDateString() === new Date().toDateString() ? 'today' : ''}`}>
                    <div className="day-header">
                        <span className="day-name">{daysOfWeek[date.getDay()]}</span>
                        <span className="day-date">{formatDate(date)}</span>
                        {role === 'teacher' && (
                            <button className="add-event-btn" onClick={() => handleAddEvent(date)}>
                                <FaPlus /> Thêm
                            </button>
                        )}
                    </div>
                    <div className="day-events">
                        {getEventsForDate(date).map((event) => (
                            <EventCard key={event._id || event.id} event={event} getClassName={getClassName} />
                        ))}
                        {getEventsForDate(date).length === 0 && (
                            <div className="no-events">Không có lịch</div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default WeekView;