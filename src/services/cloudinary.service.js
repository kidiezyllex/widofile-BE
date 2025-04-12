import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Cấu hình Cloudinary từ biến môi trường
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload file lên Cloudinary
 * @param {Buffer} fileBuffer - Buffer của file
 * @param {string} fileName - Tên file (sẽ được sử dụng để tạo public_id)
 * @param {string} folderPath - Đường dẫn thư mục trên Cloudinary
 * @param {string} resourceType - Loại tài nguyên (image, video, raw, auto)
 * @returns {Promise<Object>} Kết quả upload
 */
export const uploadFileToCloudinary = async (
  fileBuffer,
  fileName,
  folderPath,
  resourceType = 'auto'
) => {
  try {
    // Tạo public_id từ fileName và folderPath
    const publicId = `${folderPath}/${fileName.split('.')[0]}`;
    
    // Tạo stream từ buffer
    const bufferStream = new Readable();
    bufferStream.push(fileBuffer);
    bufferStream.push(null);
    
    // Upload lên Cloudinary sử dụng stream
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          public_id: publicId,
          folder: folderPath,
          overwrite: true,
          use_filename: true,
          unique_filename: false
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            publicId: result.public_id,
            url: result.secure_url,
            format: result.format,
            resourceType: result.resource_type,
            size: result.bytes,
            path: result.public_id,
            fullPath: result.public_id
          });
        }
      );
      
      bufferStream.pipe(uploadStream);
    });
  } catch (error) {
    console.error('Lỗi khi upload file lên Cloudinary:', error);
    throw error;
  }
};

/**
 * Xóa file từ Cloudinary
 * @param {string} publicId - Public ID của file cần xóa
 * @param {string} resourceType - Loại tài nguyên (image, video, raw)
 * @returns {Promise<Object>} Kết quả xóa
 */
export const deleteFileFromCloudinary = async (publicId, resourceType = 'auto') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    
    return { 
      success: result === 'ok',
      result
    };
  } catch (error) {
    console.error('Lỗi khi xóa file từ Cloudinary:', error);
    throw error;
  }
};

/**
 * Tạo URL ký cho việc download file từ Cloudinary
 * @param {string} publicId - Public ID của file
 * @param {number} expiresAt - Thời gian hết hạn của URL (mặc định: 1 giờ)
 * @returns {string} Signed URL
 */
export const getSignedUrl = (publicId, expiresAt = Math.floor(Date.now() / 1000) + 3600) => {
  return cloudinary.url(publicId, {
    secure: true,
    sign_url: true,
    expires_at: expiresAt
  });
};

export default cloudinary; 