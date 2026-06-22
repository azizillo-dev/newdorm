-- TATU Yotoqxona Davomat Tizimi - Database Schema

-- Foydalanuvchilar jadvali
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('superadmin', 'sardor', 'viewer')),
  floor_number INTEGER, -- sardor uchun qaysi qavat
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Qavatlar jadvali
CREATE TABLE IF NOT EXISTS floors (
  id SERIAL PRIMARY KEY,
  floor_number INTEGER UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  sardor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Xonalar jadvali
CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  room_number VARCHAR(10) UNIQUE NOT NULL,
  floor_id INTEGER REFERENCES floors(id) ON DELETE CASCADE,
  capacity INTEGER DEFAULT 4,
  created_at TIMESTAMP DEFAULT NOW()
);

-- O'quvchilar jadvali
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL,
  floor_id INTEGER REFERENCES floors(id) ON DELETE SET NULL,
  faculty VARCHAR(100),
  region VARCHAR(100),
  student_id VARCHAR(20) UNIQUE,
  is_active BOOLEAN DEFAULT true,
  photo_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Davomat jadvali
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('bor', 'yoq', 'sababli', 'sababsiz')),
  reason TEXT,
  note TEXT,
  marked_by INTEGER REFERENCES users(id),
  marked_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- Bayram/dam olish kunlari
CREATE TABLE IF NOT EXISTS holidays (
  id SERIAL PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Login tarixi
CREATE TABLE IF NOT EXISTS login_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  ip_address VARCHAR(50),
  user_agent TEXT,
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bildirishnomalar
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(200),
  message TEXT,
  type VARCHAR(50),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indekslar (tezlik uchun)
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_students_floor ON students(floor_id);
CREATE INDEX IF NOT EXISTS idx_students_room ON students(room_id);

-- Default superadmin yaratish
INSERT INTO users (username, password, full_name, role, phone)
VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Blok Hokimi', 'superadmin', '+998901234567')
ON CONFLICT (username) DO NOTHING;

-- Default qavatlar yaratish (1-9)
INSERT INTO floors (floor_number, name) VALUES
(1, '1-Qavat'), (2, '2-Qavat'), (3, '3-Qavat'),
(4, '4-Qavat'), (5, '5-Qavat'), (6, '6-Qavat'),
(7, '7-Qavat'), (8, '8-Qavat'), (9, '9-Qavat')
ON CONFLICT (floor_number) DO NOTHING;
