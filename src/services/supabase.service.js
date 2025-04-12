import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Khởi tạo Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Thiếu thông tin cấu hình Supabase trong file .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Upload file lên Supabase Storage
 * @param {Buffer} fileBuffer - Buffer của file
 * @param {string} fileName - Tên file
 * @param {string} filePath - Đường dẫn lưu trữ trong bucket
 * @param {string} contentType - MIME type của file
 * @param {string} bucketName - Tên bucket (mặc định: 'documents')
 * @returns {Promise<Object>} Kết quả upload
 */
export const uploadFileToSupabase = async (
  fileBuffer,
  fileName,
  filePath,
  contentType,
  bucketName = 'documents'
) => {
  try {
    // Đảm bảo bucket tồn tại
    const { error: bucketError } = await supabase.storage.getBucket(bucketName);
    
    if (bucketError && bucketError.message.includes('not found')) {
      // Tạo bucket nếu chưa tồn tại
      await supabase.storage.createBucket(bucketName, {
        public: false, // Bucket private
        fileSizeLimit: 50 * 1024 * 1024, // Giới hạn 50MB mỗi file
      });
    } else if (bucketError) {
      throw bucketError;
    }
    
    // Upload file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(`${filePath}/${fileName}`, fileBuffer, {
        contentType,
        upsert: true // Ghi đè nếu file đã tồn tại
      });
    
    if (error) throw error;
    
    // Tạo URL public cho file (nếu cần)
    const { data: urlData } = await supabase.storage
      .from(bucketName)
      .getPublicUrl(`${filePath}/${fileName}`);
    
    return {
      path: data.path,
      fullPath: `${bucketName}/${filePath}/${fileName}`,
      publicUrl: urlData.publicUrl
    };
  } catch (error) {
    console.error('Lỗi khi upload file lên Supabase:', error);
    throw error;
  }
};

/**
 * Xóa file từ Supabase Storage
 * @param {string} filePath - Đường dẫn đầy đủ của file cần xóa
 * @param {string} bucketName - Tên bucket (mặc định: 'documents')
 * @returns {Promise<Object>} Kết quả xóa
 */
export const deleteFileFromSupabase = async (filePath, bucketName = 'documents') => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Lỗi khi xóa file từ Supabase:', error);
    throw error;
  }
};

export default supabase; 