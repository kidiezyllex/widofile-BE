/**
 * Response middleware để chuẩn hóa tất cả các response theo định dạng yêu cầu
 * {
 *   status: boolean
 *   message: string
 *   data: {}
 *   errors: {}
 *   timestamp: Date
 * }
 */

const responseMiddleware = (req, res, next) => {
  // Lưu trữ phương thức json gốc
  const originalJson = res.json;
  
  // Ghi đè phương thức json
  res.json = function(obj) {
    let statusCode = res.statusCode || 200;
    let isSuccess = statusCode < 400;
    
    // Chuẩn hóa response
    const standardResponse = {
      status: Object.prototype.hasOwnProperty.call(obj, 'success') ? obj.success : isSuccess,
      message: obj.message || (isSuccess ? 'Success' : 'Error'),
      data: isSuccess ? (obj.data || (obj.message ? {} : obj)) : {},
      errors: isSuccess ? {} : (obj.errors || obj.error ? { error: obj.error } : (obj.message ? {} : obj)),
      timestamp: new Date()
    };
    
    // Gọi phương thức json gốc với response đã chuẩn hóa
    return originalJson.call(this, standardResponse);
  };
  
  next();
};

export default responseMiddleware; 