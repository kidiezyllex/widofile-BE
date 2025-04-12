import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'completed', 'on-hold'],
    default: 'planning'
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['lead', 'member'],
      default: 'member'
    },
    joinDate: {
      type: Date,
      default: Date.now
    }
  }],
  gameGenre: {
    type: String
  },
  gamePlatform: {
    type: String
  },
  thumbnail: {
    type: String
  }
}, {
  timestamps: true
});

projectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project'
});

projectSchema.virtual('documents', {
  ref: 'Document',
  localField: '_id',
  foreignField: 'project'
});

projectSchema.virtual('forumPosts', {
  ref: 'ForumPost',
  localField: '_id',
  foreignField: 'project'
});

const Project = mongoose.model('Project', projectSchema);

export default Project;