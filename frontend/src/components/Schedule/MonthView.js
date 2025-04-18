import React from 'react';
import { FaPlus } from 'react-icons/fa';
import '../../css/Schedule/MonthView.css';

const MonthView = ({ monthDays, daysOfWeek, role, handleAddEvent, getEventsForDate, isCurrentMonth, handleEditEvent }) => {
    return (
        <div className="schedule-month-view">
            <div className="month-header">
                {daysOfWeek.map((day, index) => (
                    <div key={index} className="month-header-day">{day}</div>
                ))}
            </div>
            <div className="month-grid">
                {monthDays.map((date, index) => (
                    <div
                        key={index}
                        className={`month-day ${!isCurrentMonth(date) ? 'other-month' : ''} ${date.toDateString() === new Date().toDateString() ? 'today' : ''}`}
                    >
                        <div className="month-day-header">
                            <span className="month-day-number">{date.getDate()}</span>
                            {role === 'teacher' && isCurrentMonth(date) && (
                                <button className="month-add-btn" onClick={() => handleAddEvent(date)}>
                                    <FaPlus />
                                </button>
                            )}
                        </div>
                        <div className="month-day-events">
                            {getEventsForDate(date).map((event) => (
                                <div
                                    key={event._id || event.id}
                                    className="month-event"
                                    onClick={() => handleEditEvent(event)}
                                    title={`${event.title} (${event.start} - ${event.end})`}
                                >
                                    <div className="month-event-time">{event.start}</div>
                                    <div className="month-event-title">{event.title}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MonthView;