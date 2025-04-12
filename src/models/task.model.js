import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  phase: {
    type: String,
    required: true,
    enum: ['concept', 'pre-production', 'production', 'testing', 'post-production']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  completedDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'review', 'completed'],
    default: 'not-started'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, {
  timestamps: true
});

taskSchema.virtual('documents', {
  ref: 'Document',
  localField: '_id',
  foreignField: 'task'
});

taskSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'task'
});

taskSchema.virtual('notes', {
  ref: 'Note',
  localField: '_id',
  foreignField: 'task'
});

taskSchema.virtual('schedules', {
  ref: 'Schedule',
  localField: '_id',
  foreignField: 'task'
});

const Task = mongoose.model('Task', taskSchema);

export default Task;