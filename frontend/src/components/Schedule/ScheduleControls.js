import React from 'react';
import { FaChevronLeft, FaChevronRight, FaCalendarWeek, FaCalendarAlt } from 'react-icons/fa';
import '../../css/Schedule/ScheduleControls.css';

const ScheduleControls = ({ currentDate, viewMode, goToPrevious, goToNext, setViewMode, formatDate, getStartOfWeek, getEndOfWeek, monthNames }) => {
    return (
        <div>
            <div className="schedule-controls">
                <button className="control-btn" onClick={goToPrevious}>
                    <FaChevronLeft /> {viewMode === 'week' ? 'Tuần trước' : 'Tháng trước'}
                </button>
                {viewMode === 'week' ? (
                    <h2>{`${formatDate(getStartOfWeek(currentDate))} - ${formatDate(getEndOfWeek(currentDate))}`}</h2>
                ) : (
                    <h2>{`${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}</h2>
                )}
                <button className="control-btn" onClick={goToNext}>
                    {viewMode === 'week' ? 'Tuần sau' : 'Tháng sau'} <FaChevronRight />
                </button>
            </div>
            <div className="view-toggle">
                <button
                    className={`view-schedule-btn ${viewMode === 'week' ? 'active' : ''}`}
                    onClick={() => setViewMode('week')}
                >
                    <FaCalendarWeek /> Xem theo tuần
                </button>
                <button
                    className={`view-schedule-btn ${viewMode === 'month' ? 'active' : ''}`}
                    onClick={() => setViewMode('month')}
                >
                    <FaCalendarAlt /> Xem theo tháng
                </button>
            </div>
        </div>
    );
};

export default ScheduleControls;