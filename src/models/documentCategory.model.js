import mongoose from 'mongoose';

const documentCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String
  },
  icon: {
    type: String
  }
}, {
  timestamps: true
});

// Virtual for documents in this category
documentCategorySchema.virtual('documents', {
  ref: 'Document',
  localField: '_id',
  foreignField: 'category'
});

const DocumentCategory = mongoose.model('DocumentCategory', documentCategorySchema);

export default DocumentCategory;