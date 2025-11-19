const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
    getEventByUserId
} = require('../controller/calender');

router.route('/')
  .post( createEvent)
  .get( getEvents);
router.get('/byUser', getEventByUserId);
router.route('/:id')
  .get( getEventById)
  .put( updateEvent)
  .delete( deleteEvent);

module.exports = router;