import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    type: String
  },
  location: {
    type: String
  },
  color: {
    type: String,
    default: '#3498db'
  },
  reminder: {
    type: Boolean,
    default: false
  },
  reminderTime: {
    type: Number // minutes before event
  }
}, {
  timestamps: true
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

export default Schedule;