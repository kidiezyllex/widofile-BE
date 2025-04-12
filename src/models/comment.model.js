import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // The comment can be related to one of these entities
  forumPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumPost'
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // For nested comments/replies
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }
}, {
  timestamps: true
});

// Virtual for replies to this comment
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment'
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;