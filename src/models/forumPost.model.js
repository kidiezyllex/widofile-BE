import mongoose from 'mongoose';

const forumPostSchema = new mongoose.Schema({
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
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  tags: [{
    type: String
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual for comments on this post
forumPostSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'forumPost'
});

const ForumPost = mongoose.model('ForumPost', forumPostSchema);

export default ForumPost;