import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Schedule/Schedule.css';
import Navbar from '../components/Navbar';
import Loading from '../components/Loading';
import ScheduleHeader from '../components/Schedule/ScheduleHeader';
import ScheduleControls from '../components/Schedule/ScheduleControls';
import WeekView from '../components/Schedule/WeekView';
import MonthView from '../components/Schedule/MonthView';
import AddEventModal from '../components/Schedule/AddEventModal';
import EditEventModal from '../components/Schedule/EditEventModal';
import DeleteConfirmationModal from '../components/Schedule/DeleteConfirmationModal';

const Schedule = () => {
    const [role, setRole] = useState('');
    const [classes, setClasses] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);
    const [viewMode, setViewMode] = useState('week');
    const [newEvent, setNewEvent] = useState({
        title: '',
        class: '',
        start: '',
        end: '',
        location: '',
        description: ''
    });
    const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

    // Scroll the page to top when load page
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Get user role from localStorage
    useEffect(() => {
        const user = localStorage.getItem("user");
        if (user) {
            try {
                const userObject = JSON.parse(user);
                setRole(userObject?.user?.role || "");
            } catch (err) {
                console.error("Error parsing user data:", err);
                setError("Invalid user data format");
            }
        } else {
            setError("No user data found");
        }
        setLoading(false);
    }, []);

    // Fetch classes (for teachers)
    const fetchClasses = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No authentication token found");
            }
            const endpoint = role === "teacher" ? "http://localhost:5000/class/teacher" : "http://localhost:5000/class/student";
            const response = await axios.get(endpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setClasses(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching classes:', error);
            setError("Failed to fetch classes: " + (error.response?.data?.message || error.message));
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, [role]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEvent({
            ...newEvent,
            [name]: value
        });
    };

    // Helper to format date for API
    const formatDateForAPI = (date) => {
        return date.toISOString().split('T')[0];
    };

    // Fetch schedule data
    const fetchSchedule = async () => {
        if (!role) return;
        setLoading(true);
        setError('');
        try {
            let startDate, endDate;
            if (viewMode === 'week') {
                startDate = getStartOfWeek(currentDate);
                endDate = getEndOfWeek(currentDate);
            } else {
                startDate = getStartOfMonth(currentDate);
                endDate = getEndOfMonth(currentDate);
            }
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("No authentication token found");
            }
            const endpoint = role === 'teacher'
                ? `http://localhost:5000/schedule/teacher/schedule?start=${formatDateForAPI(startDate)}&end=${formatDateForAPI(endDate)}`
                : `http://localhost:5000/schedule/student/schedule?start=${formatDateForAPI(startDate)}&end=${formatDateForAPI(endDate)}`;
            const response = await axios.get(endpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setSchedule(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching schedule:", err);
            setError(err.response?.data?.message || 'Failed to fetch schedule: ' + err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, [currentDate, role, viewMode]);

    // Navigate to previous period (week or month)
    const goToPrevious = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'week') {
            newDate.setDate(currentDate.getDate() - 7);
        } else {
            newDate.setMonth(currentDate.getMonth() - 1);
        }
        setCurrentDate(newDate);
    };

    // Navigate to next period (week or month)
    const goToNext = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'week') {
            newDate.setDate(currentDate.getDate() + 7);
        } else {
            newDate.setMonth(currentDate.getMonth() + 1);
        }
        setCurrentDate(newDate);
    };

    // Get start of week (Monday)
    const getStartOfWeek = (date) => {
        const result = new Date(date);
        const day = result.getDay();
        const diff = result.getDate() - day + (day === 0 ? -6 : 1);
        result.setDate(diff);
        return result;
    };

    // Get end of week (Sunday)
    const getEndOfWeek = (date) => {
        const result = new Date(getStartOfWeek(date));
        result.setDate(result.getDate() + 6);
        return result;
    };

    // Get start of month
    const getStartOfMonth = (date) => {
        const result = new Date(date);
        result.setDate(1);
        return result;
    };

    // Get end of month
    const getEndOfMonth = (date) => {
        const result = new Date(date);
        result.setMonth(result.getMonth() + 1);
        result.setDate(0);
        return result;
    };

    // Get days in month for calendar grid
    const getDaysInMonthGrid = (date) => {
        const firstDay = getStartOfMonth(date);
        const lastDay = getEndOfMonth(date);
        const firstDayOfGrid = new Date(firstDay);
        const firstDayWeekday = firstDayOfGrid.getDay();
        firstDayOfGrid.setDate(firstDayOfGrid.getDate() - (firstDayWeekday === 0 ? 6 : firstDayWeekday - 1));
        const lastDayOfGrid = new Date(lastDay);
        const lastDayWeekday = lastDayOfGrid.getDay();
        lastDayOfGrid.setDate(lastDayOfGrid.getDate() + (lastDayWeekday === 0 ? 0 : 7 - lastDayWeekday));
        const days = [];
        let currentDay = new Date(firstDayOfGrid);
        while (currentDay <= lastDayOfGrid) {
            days.push(new Date(currentDay));
            currentDay.setDate(currentDay.getDate() + 1);
        }
        return days;
    };

    // Format date as DD/MM
    const formatDate = (date) => {
        return `${date.getDate()}/${date.getMonth() + 1}`;
    };

    // Generate week dates
    const generateWeekDates = () => {
        const dates = [];
        const startOfWeek = getStartOfWeek(currentDate);
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    // Get events for a specific date
    const getEventsForDate = (date) => {
        const formattedDate = formatDateForAPI(date);
        return schedule.filter(event => event.date === formattedDate);
    };

    // Handle opening add event modal
    const handleAddEvent = (date) => {
        setError('');
        setNewEvent({
            title: '',
            class: '',
            start: '',
            end: '',
            location: '',
            description: '',
            date: formatDateForAPI(date)
        });
        setShowAddModal(true);
    };

    // Handle opening edit event modal
    const handleEditEvent = (event) => {
        setError('');
        setCurrentEvent(event);
        setNewEvent({
            title: event.title,
            class: event.class,
            start: event.start,
            end: event.end,
            location: event.location,
            description: event.description || '',
            date: event.date
        });
        setShowEditModal(true);
    };

    // Handle saving new event
    const handleSaveEvent = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("No authentication token found");
            }
            const response = await axios.post(`http://localhost:5000/schedule/teacher/schedule`, newEvent, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setSchedule([...schedule, response.data]);
            setShowAddModal(false);
            setNewEvent({
                title: '',
                class: '',
                start: '',
                end: '',
                location: '',
                description: ''
            });
            fetchSchedule();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save event: ' + err.message);
            console.error("Error saving event:", err);
        }
    };

    // Handle updating event
    const handleUpdateEvent = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("No authentication token found");
            }
            const eventId = currentEvent._id || currentEvent.id;
            const updatedEvent = {
                ...currentEvent,
                title: newEvent.title,
                class: newEvent.class,
                start: newEvent.start,
                end: newEvent.end,
                location: newEvent.location,
                description: newEvent.description
            };
            await axios.put(`http://localhost:5000/schedule/teacher/schedule/${eventId}`, updatedEvent, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setShowEditModal(false);
            fetchSchedule();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update event: ' + err.message);
            console.error("Error updating event:", err);
        }
    };

    const openDeleteModal = (event) => {
        setCurrentEvent(event);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
    };

    // Handle deleting event
    const handleDeleteEvent = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("No authentication token found");
            }
            const eventId = currentEvent._id || currentEvent.id;
            await axios.delete(`http://localhost:5000/schedule/teacher/schedule/${eventId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            closeDeleteModal();
            setShowEditModal(false);
            fetchSchedule();
        } catch (error) {
            console.error("Delete error:", error);
            setError(error.response?.data?.message || 'Failed to delete event: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const weekDates = generateWeekDates();
    const monthDays = viewMode === 'month' ? getDaysInMonthGrid(currentDate) : [];

    const getClassName = (classId) => {
        const foundClass = classes.find(cls => cls._id === classId);
        return foundClass ? foundClass.name : classId;
    };

    // Check if a date is in the current month
    const isCurrentMonth = (date) => {
        return date.getMonth() === currentDate.getMonth();
    };

    // Render loading state
    if (loading) {
        return (
            <>
                <Navbar />
                <Loading />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="schedule-container">
                <ScheduleHeader role={role} />
                <ScheduleControls
                    currentDate={currentDate}
                    viewMode={viewMode}
                    goToPrevious={goToPrevious}
                    goToNext={goToNext}
                    setViewMode={setViewMode}
                    formatDate={formatDate}
                    getStartOfWeek={getStartOfWeek}
                    getEndOfWeek={getEndOfWeek}
                    monthNames={monthNames}
                />
                {viewMode === 'week' ? (
                    <WeekView
                        weekDates={weekDates}
                        role={role}
                        handleAddEvent={handleAddEvent}
                        getEventsForDate={getEventsForDate}
                        formatDate={formatDate}
                        daysOfWeek={daysOfWeek}
                        getClassName={getClassName}
                    />
                ) : (
                    <MonthView
                        monthDays={monthDays}
                        daysOfWeek={daysOfWeek}
                        role={role}
                        handleAddEvent={handleAddEvent}
                        getEventsForDate={getEventsForDate}
                        isCurrentMonth={isCurrentMonth}
                        handleEditEvent={handleEditEvent}
                    />
                )}
                <AddEventModal
                    showAddModal={showAddModal && role === "teacher"}
                    setShowAddModal={setShowAddModal}
                    newEvent={newEvent}
                    handleInputChange={handleInputChange}
                    handleSaveEvent={handleSaveEvent}
                    classes={classes}
                    error={error}
                />
                <EditEventModal
                    showEditModal={showEditModal}
                    setShowEditModal={setShowEditModal}
                    newEvent={newEvent}
                    handleInputChange={handleInputChange}
                    handleUpdateEvent={handleUpdateEvent}
                    openDeleteModal={openDeleteModal}
                    classes={classes}
                    role={role}
                    error={error}
                    currentEvent={currentEvent}
                />
                <DeleteConfirmationModal
                    showDeleteModal={showDeleteModal && role === "teacher"}
                    closeDeleteModal={closeDeleteModal}
                    handleDeleteEvent={handleDeleteEvent}
                    currentEvent={currentEvent}
                    loading={loading}
                />
            </div>
        </>
    );
};

export default Schedule;