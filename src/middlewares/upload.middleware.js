import multer from 'multer';

// Cấu hình lưu trữ file trong memory để xử lý trước khi upload lên Cloudinary
const storage = multer.memoryStorage();

// Cấu hình giới hạn file
const fileFilter = (req, file, cb) => {
  // Kiểm tra loại file được phép upload
  const allowedMimeTypes = [
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
    'text/plain',
    'text/csv',
    
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/svg+xml',
    'image/webp',
    
    // Videos
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/webm',
    
    // Audio
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    
    // Archives
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    
    // Others
    'application/json',
    'text/markdown'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Định dạng file không được hỗ trợ. Vui lòng sử dụng file hợp lệ.'), false);
  }
};

// Khởi tạo multer với cấu hình
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // Giới hạn 50MB
  },
  fileFilter
});

// Middleware xử lý lỗi của multer
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Dung lượng file vượt quá giới hạn cho phép (50MB)'
      });
    }
    
    return res.status(400).json({
      success: false,
      message: `Lỗi upload: ${err.message}`
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next();
};

export default upload; 