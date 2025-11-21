const Calendar = require('../model/calendar');
const mongoose = require('mongoose');

// Helper: Send JSON response
const sendResponse = (res, status, success, message, data = null) => {
  res.status(status).json({
    success,
    message,
    data,
  });
};

// @desc    Create a new calendar event
// @route   POST /api/calendar
// @access  Private (User must be logged in)
const createEvent = async (req, res) => {
  try {
    const { userId } = req.query; // or req.user.id if using auth middleware
    const { date, time, message } = req.body;

    // === Required fields ===
    if (!userId) {
      return sendResponse(res, 400, false, "User ID is required.");
    }
    if (!date || !time || !message) {
      return sendResponse(res, 400, false, "Date, time, and message are required.");
    }

    // === Date validation ===
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return sendResponse(res, 400, false, "Invalid date format.");
    }

    // === Time validation ===
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](\s?[APap][Mm])?$/;
    if (!timeRegex.test(time.trim())) {
      return sendResponse(res, 400, false, "Invalid time format (use HH:MM or 2:30 PM).");
    }

    // === Message validation ===
    const trimmedMessage = message.trim();
    if (trimmedMessage.length < 3) {
      return sendResponse(res, 400, false, "Message must be at least 3 characters.");
    }

    // === CHECK: Does this user already have an event with the same message? ===
    const existingEvent = await Calendar.findOne({
      userId: userId, 
      date: parsedDate,
      time: time.trim(),         // ← Only for this user
      message: trimmedMessage   // ← Exact same message text
    });
console.log(existingEvent);
    if (existingEvent) {
      return sendResponse(res, 409, false, "You already have an event with this message.");
    }

    // === Create the new event ===
    const event = await Calendar.create({
      userId,
      date: parsedDate,
      time: time.trim(),
      message: trimmedMessage,
    });

    return sendResponse(res, 201, true, "Event created successfully.", event);

  } catch (error) {
    // This catches MongoDB duplicate key error (if you add the index below)
    if (error.code === 11000) {
      return sendResponse(res, 409, false, "You already have an event with this message.");
    }

    console.error("Create Event Error:", error);
    return sendResponse(res, 500, false, "Server error. Could not create event.");
  }
};

// @desc    Get all events for logged-in user
// @route   GET /api/calendar
// @access  Private
const getEvents = async (req, res) => {
  try {
    const { userId } = req.query; // Get userId from query parameters

    const events = await Calendar.find({ userId: userId })
      .sort({ date: 1, time: 1 })
      .select('-__v');

    sendResponse(res, 200, true, "Events retrieved successfully.", events);
  } catch (error) {
    console.error("Get Events Error:", error);
    sendResponse(res, 500, false, "Server error.");
  }
};

// @desc    Get single event by ID (only if belongs to user)
// @route   GET /api/calendar/:id
// @access  Private
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendResponse(res, 400, false, "Invalid event ID.");
    }

    const event = await Calendar.findOne({
      _id: id,
      userId: req.query.userId,
    });

    if (!event) {
      return sendResponse(res, 404, false, "Event not found or access denied.");
    }

    sendResponse(res, 200, true, "Event retrieved successfully.", event);
  } catch (error) {
    console.error("Get Event By ID Error:", error);
    sendResponse(res, 500, false, "Server error.");
  }
};

// @desc    Update an event
// @route   PUT /api/calendar/:id
// @access  Private
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, message, status } = req.body;

    console.log("Update Event Req Body:", req.body);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendResponse(res, 400, false, "Invalid event ID.");
    }

    // Validate date
    if (date && isNaN(Date.parse(date))) {
      return sendResponse(res, 400, false, "Invalid date format.");
    }

    // Validate time
    if (time) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](\s?[APap][Mm])?$/;
      if (!timeRegex.test(String(time).trim())) {
        return sendResponse(res, 400, false, "Invalid time format.");
      }
    }

    // Validate message
    if (message && String(message).trim().length < 3) {
      return sendResponse(res, 400, false, "Message must be at least 3 characters.");
    }

    // Define allowed statuses
    const validStatuses = ["pending", "confirmed", "cancelled", "completed"];

    // Safely validate and normalize status
    let normalizedStatus = null;
    if (status !== undefined && status !== null && status !== "") {
      if (typeof status !== "string") {
        return sendResponse(res, 400, false, "Status must be a valid string.");
      }
      normalizedStatus = status.trim().toLowerCase();

      if (!validStatuses.includes(normalizedStatus)) {
        return sendResponse(
          res,
          400,
          false,
          `Invalid status. Allowed values: ${validStatuses.join(", ")}`
        );
      }
    }

    // Build update object safely
    const updateData = {
      ...(date && { date: new Date(date) }),
      ...(time && { time: String(time).trim() }),
      ...(message && { message: String(message).trim() }),
      ...(normalizedStatus && { status: normalizedStatus }),
    };

    const event = await Calendar.findOneAndUpdate(
      { _id: id, userId: req.query.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!event) {
      return sendResponse(res, 404, false, "Event not found or access denied.");
    }

    sendResponse(res, 200, true, "Event updated successfully.", event);
  } catch (error) {
    console.log("Update Event Error:", error);
    sendResponse(res, 500, false, "Server error.");
  }
};
// @desc    Delete an event
// @route   DELETE /api/calendar/:id
// @access  Private
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendResponse(res, 400, false, "Invalid event ID.");
    }

    const event = await Calendar.findOneAndDelete({
      _id: id,
    });

    if (!event) {
      return sendResponse(res, 404, false, "Event not found or access denied.");
    }

    sendResponse(res, 200, true, "Event deleted successfully.", null);
  } catch (error) {
    console.error("Delete Event Error:", error);
    sendResponse(res, 500, false, "Server error.");
  }
};


// @desc    Get single event by ID (only if belongs to user)
// @route   GET /api/calendar/:userId
// @access  Private
const getEventByUserId = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return sendResponse(res, 400, false, "Invalid event ID.");
    }

    const event = await Calendar.findOne({
      userId: userId,
    });

    if (!event) {
      return sendResponse(res, 404, false, "Event not found or access denied.");
    }

    sendResponse(res, 200, true, "Event retrieved successfully.", event);
  } catch (error) {
    console.error("Get Event By ID Error:", error);
    sendResponse(res, 500, false, "Server error.");
  }
};
module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventByUserId,
};