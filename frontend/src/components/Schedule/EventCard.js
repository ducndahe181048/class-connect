import React from 'react';
import '../../css/Schedule/EventCard.css';

const EventCard = ({ event, getClassName }) => {
    return (
        <div className="event-card">
            <div className="event-class">{getClassName(event.class)}</div>
            <div className="event-title">{event.title}</div>
            <div className="event-time">{`${event.start} - ${event.end}`}</div>
            {event.description && <div className="event-description">{event.description}</div>}
        </div>
    );
};

export default EventCard;