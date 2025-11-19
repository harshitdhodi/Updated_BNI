import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, Loader2, Edit, Trash2, CheckCircle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isSameDay, startOfDay } from 'date-fns';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2'; // Import SweetAlert2
import { useParams } from 'react-router-dom';

export default function SmartCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventMessage, setEventMessage] = useState('');
  const [eventTime, setEventTime] = useState('09:00');
  const [editingEvent, setEditingEvent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { id: userId } = useParams();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  // Fetch events — only when userId changes
  const fetchEvents = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const token = getCookie('token');
      const res = await axios.get(`/api/calendar/byUser?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      const rawEvents = res.data?.data || [];
      const eventsArray = Array.isArray(rawEvents) ? rawEvents : rawEvents ? [rawEvents] : [];

      const formattedEvents = eventsArray.map(event => {
        const eventDate = new Date(event.date);
        const colorKey = ['bg-blue-500', 'bg-red-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500'][
          event._id.slice(-1).charCodeAt(0) % 5
        ];
        const borderColor = colorKey.replace('bg-', ''); // e.g., blue-500

        return {
          id: event._id,
          date: startOfDay(eventDate), // Normalize to start of day (prevents timezone bugs)
          message: event.message || 'Untitled Event',
          time: event.time || '00:00',
          color: colorKey,
          borderColor: borderColor,
        };
      });

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Only load events when userId changes (not on month navigation)
  useEffect(() => {
    fetchEvents();
  }, [userId]);

  const previousMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  const nextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowEventForm(false);
  };

  const addEvent = async (e) => {
    e.preventDefault();
    if (!eventMessage.trim()) return toast.error('Event name is required');

    setSubmitting(true);
    try {
      const token = getCookie('token');
      const res = await axios.post(
        `/api/calendar?userId=${userId}`,
        {
          date: format(startOfDay(selectedDate), 'yyyy-MM-dd'),
          time: eventTime,
          message: eventMessage.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      const newEventData = res.data.data;
      const colorKey = ['bg-blue-500', 'bg-red-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500'][
        newEventData._id.slice(-1).charCodeAt(0) % 5
      ];

      const newEvent = {
        id: newEventData._id,
        date: startOfDay(new Date(newEventData.date)),
        message: newEventData.message,
        status: newEventData.status,
        time: newEventData.time,
        color: colorKey,
        borderColor: colorKey.replace('bg-', ''),
      };

      setEvents(prev => [...prev, newEvent]);
      setEventMessage('');
      setEventTime('09:00');
      setShowEventForm(false);
      toast.success('Event created!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteEvent = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this event!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      const loadingToast = toast.loading('Deleting event...');
      try {
        const token = getCookie('token');
        await axios.delete(`/api/calendar/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        setEvents(prev => prev.filter(e => e.id !== id));
        toast.success('Event deleted successfully!', { id: loadingToast });
      } catch (error) {
        console.error("Error deleting event:", error);
        toast.error('Failed to delete event', { id: loadingToast });
      }
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    if (!editingEvent?.message.trim()) return toast.error('Event name is required');

    setSubmitting(true);
    const loadingToast = toast.loading('Updating event...');

    try {
      const token = getCookie('token');
      const res = await axios.put(
        `/api/calendar/${editingEvent.id}?userId=${userId}`,
        {
          date: format(startOfDay(editingEvent.date), 'yyyy-MM-dd'),
          time: editingEvent.time,
          status: editingEvent.status,
          message: editingEvent.message.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      const updated = res.data.data;
      console.log("updated", updated)
      const colorKey = ['bg-blue-500', 'bg-red-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500'][
        updated._id.slice(-1).charCodeAt(0) % 5
      ];

      setEvents(prev =>
        prev.map(event =>
          event.id === updated._id
            ? {
                ...event,
                date: startOfDay(new Date(updated.date)),
                message: updated.message,
                time: updated.time,
                status: updated.status,
                color: colorKey,
                borderColor: colorKey.replace('bg-', ''),
              }
            : event
        )
      );

      setIsEditModalOpen(false);
      setEditingEvent(null);
      toast.success('Event updated!', { id: loadingToast });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update event', { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleComplete = async (event) => {
    setSubmitting(true);
    try {
      const token = getCookie('token');
      const res = await axios.put(
        `/api/calendar/${event.id}?userId=${userId}`,
        {
          status: !event.status,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setEvents(prev => prev.map(e => e.id === event.id ? { ...e, status: !e.status } : e));
      toast.success(`Event ${!event.status ? 'completed' : 'uncompleted'}!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update event status');
    } finally {
      setSubmitting(false);
    }
  };


  const getEventsForDate = (date) => events.filter(e => isSameDay(e.date, date));

  const getCalendarDays = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    const startDay = getDay(start);
    return [...Array(startDay).fill(null), ...days];
  };

  const calendarDays = getCalendarDays();

  return (
    <>
      <Toaster position="top-right" />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 flex items-center gap-3">
              <Calendar className="w-10 h-10 text-blue-600" />
              My Calendar
            </h1>
            <p className="text-slate-600 mt-2">Stay organized, stay productive</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar Grid */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
                <div className="flex gap-2">
                  <button onClick={previousMonth} className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <ChevronLeft />
                  </button>
                  <button onClick={goToToday} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Today
                  </button>
                  <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <ChevronRight />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center font-bold text-sm text-slate-600 mb-2">
                {dayNames.map(d => <div key={d}>{d}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {loading ? (
                  <div className="col-span-7 py-20 text-center">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600" />
                  </div>
                ) : (
                  calendarDays.map((day, i) => (
                    <div key={i} className="aspect-square">
                      {day ? (
                        <button
                          onClick={() => handleDateClick(day)}
                          className={`
                            w-full h-full rounded-xl text-sm font-medium relative group transition-all
                            ${isToday(day) ? 'bg-blue-600 text-white shadow-lg scale-105' : ''}
                            ${isSameDay(day, selectedDate) && !isToday(day) ? 'bg-blue-100 ring-2 ring-blue-500' : 'hover:bg-gray-100'}
                          `}
                        >
                          <span className="relative z-10">{format(day, 'd')}</span>

                          {/* Event Indicators */}
                          {getEventsForDate(day).length > 0 && (
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                              {getEventsForDate(day).length > 3 ? (
                                <span className="text-xs font-bold text-gray-600 bg-white px-1 rounded">
                                  +{getEventsForDate(day).length}
                                </span>
                              ) : (
                                getEventsForDate(day).map((_, idx) => (
                                  <div key={idx} className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                ))
                              )}
                            </div>
                          )}
                        </button>
                      ) : <div className="border border-dashed border-gray-200 rounded-xl opacity-0" />}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold mb-4">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </h3>

                <div className="space-y-3 mb-6 min-h-48">
                  {getEventsForDate(selectedDate).length > 0 ? (
                    getEventsForDate(selectedDate).map(event => (
                      <div
                        key={event.id}
                        className={`${event.color} bg-opacity-10 border-l-4 border-${event.borderColor} rounded-r-lg p-4 relative group hover:shadow-md transition-shadow`}
                      >
                         <button
                            onClick={() => toggleComplete(event)}
                            className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 bg-white shadow-md text-green-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-green-50 transition"
                          >
                            {event.status ? (
                              <CheckCircle className="w-5 h-5" fill="currentColor" />
                            ) : <CheckCircle className="w-5 h-5" />}
                          </button>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingEvent({ ...event });
                              setIsEditModalOpen(true);
                            }}
                            className="bg-white shadow-md text-blue-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-50 transition"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => deleteEvent(event.id)}
                            className="bg-white shadow-md text-red-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="font-semibold pr-10">{event.message}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                          <Clock className="w-4 h-4" />
                          {event.time}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-500 py-12">No events scheduled</p>
                  )}
                </div>

                <button
                  onClick={() => setShowEventForm(!showEventForm)}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition shadow-md"
                >
                  {showEventForm ? 'Cancel' : '+ Add New Event'}
                </button>

                {showEventForm && (
                  <form onSubmit={addEvent} className="mt-6 space-y-4">
                    <input
                      type="text"
                      value={eventMessage}
                      onChange={e => setEventMessage(e.target.value)}
                      placeholder="Event title..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                    <input
                      type="time"
                      value={eventTime}
                      onChange={e => setEventTime(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-70 transition"
                    >
                      {submitting ? 'Creating...' : 'Create Event'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Event Modal */}
        {isEditModalOpen && editingEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-in fade-in zoom-in duration-200">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">Edit Event</h2>
              <form onSubmit={handleUpdateEvent} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Name</label>
                  <input
                    type="text"
                    value={editingEvent.message}
                    onChange={e => setEditingEvent({ ...editingEvent, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={editingEvent.date ? format(editingEvent.date, 'yyyy-MM-dd') : ''}
                    onChange={e => setEditingEvent({ ...editingEvent, date: new Date(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={editingEvent.time}
                    onChange={e => setEditingEvent({ ...editingEvent, time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <input
                    type="checkbox"
                    value={editingEvent.status}
                    onChange={e => setEditingEvent({ ...editingEvent, status: e.target.checked })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingEvent(null);
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-70 transition"
                  >
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}