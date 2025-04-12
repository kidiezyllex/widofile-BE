import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  isPrivate: {
    type: Boolean,
    default: true
  },
  color: {
    type: String,
    default: '#ffffff'
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

const Note = mongoose.model('Note', noteSchema);

export default Note;