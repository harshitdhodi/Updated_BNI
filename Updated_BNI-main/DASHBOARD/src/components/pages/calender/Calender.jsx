import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';

export default function SmartCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 14)); // November 14, 2025
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 10, 14));
  const [events, setEvents] = useState([
    { id: 1, date: new Date(2025, 10, 14), title: 'Team Meeting', time: '10:00 AM', color: 'bg-blue-500' },
    { id: 2, date: new Date(2025, 10, 20), title: 'Project Deadline', time: '05:00 PM', color: 'bg-red-500' },
    { id: 3, date: new Date(2025, 10, 25), title: 'Client Presentation', time: '02:00 PM', color: 'bg-purple-500' },
  ]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventTime, setEventTime] = useState('09:00');

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleDateClick = (day) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
  };

  const addEvent = (e) => {
    e.preventDefault();
    if (eventTitle.trim()) {
      const newEvent = {
        id: events.length + 1,
        date: selectedDate,
        title: eventTitle,
        time: eventTime,
        color: ['bg-blue-500', 'bg-red-500', 'bg-purple-500', 'bg-green-500'][Math.floor(Math.random() * 4)],
      };
      setEvents([...events, newEvent]);
      setEventTitle('');
      setEventTime('09:00');
      setShowEventForm(false);
    }
  };

  const deleteEvent = (id) => {
    setEvents(events.filter(event => event.id !== id));
  };

  const getDaysArray = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const daysArray = [];

    for (let i = 0; i < firstDay; i++) {
      daysArray.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push(i);
    }

    return daysArray;
  };

  const getEventsForDate = (day) => {
    return events.filter(event => 
      event.date.getDate() === day &&
      event.date.getMonth() === currentDate.getMonth() &&
      event.date.getFullYear() === currentDate.getFullYear()
    );
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();
  };

  const isSelected = (day) => {
    return day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear();
  };

  const days = getDaysArray();
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 flex items-center gap-3">
            <Calendar className="w-10 h-10 text-blue-600" />
            Todo Calendar
          </h1>
          <p className="text-slate-600 mt-2">Organize your time, manage your life</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={previousMonth}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="w-6 h-6 text-slate-600" />
                  </button>
                  <button
                    onClick={goToToday}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    Today
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    aria-label="Next month"
                  >
                    <ChevronRight className="w-6 h-6 text-slate-600" />
                  </button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-slate-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => (
                  <div key={index}>
                    {day ? (
                      <button
                        onClick={() => handleDateClick(day)}
                        className={`w-full aspect-square rounded-xl font-semibold transition-all relative overflow-hidden group
                          ${isToday(day) 
                            ? 'bg-blue-600 text-white shadow-lg scale-105' 
                            : isSelected(day)
                            ? 'bg-blue-100 text-blue-900 ring-2 ring-blue-300'
                            : 'bg-slate-50 text-slate-900 hover:bg-slate-100'
                          }`}
                      >
                        <span className="relative z-10">{day}</span>
                        {getEventsForDate(day).length > 0 && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                            {getEventsForDate(day).slice(0, 3).map((_, i) => (
                              <div key={i} className="w-1 h-1 bg-red-400 rounded-full"></div>
                            ))}
                          </div>
                        )}
                      </button>
                    ) : (
                      <div></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Date Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </h3>
              
              {/* Events for Selected Date */}
              <div className="space-y-3 mb-6">
                {getEventsForDate(selectedDate.getDate()).length > 0 ? (
                  getEventsForDate(selectedDate.getDate()).map(event => (
                    <div key={event.id} className={`${event.color} bg-opacity-10 border border-opacity-20 rounded-lg p-3 relative group`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 text-sm">{event.title}</p>
                          <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
                            <Clock className="w-3 h-3" />
                            {event.time}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteEvent(event.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity text-sm font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm text-center py-4">No events scheduled</p>
                )}
              </div>

              {/* Add Event Button */}
              <button
                onClick={() => setShowEventForm(!showEventForm)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold text-sm"
              >
                {showEventForm ? 'Cancel' : '+ Add Event'}
              </button>

              {/* Event Form */}
              {showEventForm && (
                <form onSubmit={addEvent} className="mt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">Event Title</label>
                    <input
                      type="text"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      placeholder="Enter event title"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">Time</label>
                    <input
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors font-semibold text-sm"
                  >
                    Create Event
                  </button>
                </form>
              )}
            </div>

            {/* Calendar Legend */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Legend</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  <span className="text-slate-600">Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <span className="text-slate-600">Event indicator</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-300"></div>
                  <span className="text-slate-600">Selected date</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
