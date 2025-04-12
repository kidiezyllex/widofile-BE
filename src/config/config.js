import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/student-info',
  jwtSecret: process.env.JWT_SECRET || 'studentinfosecret',
  env: process.env.NODE_ENV || 'development',
};

export default config; 