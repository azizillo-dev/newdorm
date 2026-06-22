# 🚀 TATU B-Blok Yotoqxona — Server Joylash Qo'llanmasi
# Server: 45.148.29.33 (Ubuntu 22.04)

## ══════════════════════════════════════
## 1-QADAM: Serverga ulaning (SSH)
## ══════════════════════════════════════
ssh root@45.148.29.33

## ══════════════════════════════════════
## 2-QADAM: Kerakli dasturlarni o'rnating
## ══════════════════════════════════════
apt update && apt upgrade -y

# Node.js 20 o'rnatish
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# PostgreSQL o'rnatish
apt install -y postgresql postgresql-contrib

# Nginx o'rnatish
apt install -y nginx

# PM2 o'rnatish (global)
npm install -g pm2

# Unzip (ZIP fayl ochish uchun)
apt install -y unzip

node --version   # v20.x ko'rinishi kerak
npm --version    # 10.x ko'rinishi kerak
psql --version   # 14.x ko'rinishi kerak

## ══════════════════════════════════════
## 3-QADAM: PostgreSQL sozlash
## ══════════════════════════════════════
# PostgreSQL'ni ishga tushirish
systemctl start postgresql
systemctl enable postgresql

# Database yaratish
su - postgres -c "psql -c \"CREATE DATABASE tatu_yotoqxona;\""
su - postgres -c "psql -c \"CREATE USER tatu_admin WITH PASSWORD 'TatuSecure2024!';\""
su - postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE tatu_yotoqxona TO tatu_admin;\""
su - postgres -c "psql -c \"ALTER USER tatu_admin CREATEDB;\""

## ══════════════════════════════════════
## 4-QADAM: Loyihani serverga yuklash
## ══════════════════════════════════════
# Papka yaratish
mkdir -p /var/www/tatu-yotoqxona
mkdir -p /var/log/tatu-yotoqxona

# ZIP faylni yuklash (local kompyuterdan)
# Bu buyruqni LOCAL kompyuteringizda bajaring:
scp tatu-yotoqxona.zip root@45.148.29.33:/var/www/

# Serverda ZIP'ni ochish
cd /var/www
unzip tatu-yotoqxona.zip -d tatu-yotoqxona
cd tatu-yotoqxona

## ══════════════════════════════════════
## 5-QADAM: Backend sozlash
## ══════════════════════════════════════
cd /var/www/tatu-yotoqxona/backend

# Dependencylarni o'rnatish
npm install --production

# .env faylini tekshirish/tahrirlash
nano .env
# Quyidagilar to'g'ri bo'lishi kerak:
# DB_HOST=
# DB_PORT=
# DB_NAME=
# DB_USER=
# DB_PASSWORD=
# JWT_SECRET=
# PORT

## ══════════════════════════════════════
## 6-QADAM: Frontend build qilish
## ══════════════════════════════════════
cd /var/www/tatu-yotoqxona/frontend

# Dependencylarni o'rnatish
npm install

# Production build
npm run build

# dist papkasi yaratilganligini tekshirish
ls dist/

## ══════════════════════════════════════
## 7-QADAM: PM2 bilan backendni ishga tushirish
## ══════════════════════════════════════
cd /var/www/tatu-yotoqxona/backend

# Ishga tushirish
pm2 start ecosystem.config.js

# Server restart bo'lganda avtomatik ishga tushish
pm2 startup
pm2 save

# Holat tekshirish
pm2 status
pm2 logs tatu-yotoqxona --lines 20

## ══════════════════════════════════════
## 8-QADAM: Nginx sozlash
## ══════════════════════════════════════
# Config faylini nusxalash
cp /var/www/tatu-yotoqxona/nginx/tatu-yotoqxona.conf /etc/nginx/sites-available/tatu-yotoqxona

# Symlink yaratish
ln -sf /etc/nginx/sites-available/tatu-yotoqxona /etc/nginx/sites-enabled/

# Default config'ni o'chirish
rm -f /etc/nginx/sites-enabled/default

# Config to'g'riligini tekshirish
nginx -t

# Nginx'ni qayta ishga tushirish
systemctl restart nginx
systemctl enable nginx

## ══════════════════════════════════════
## 9-QADAM: Firewall sozlash
## ══════════════════════════════════════
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS (keyinroq kerak bo'lishi mumkin)
ufw enable
ufw status

## ══════════════════════════════════════
## 10-QADAM: Test qilish
## ══════════════════════════════════════
# Backend ishlayaptimi?
curl http://localhost:5000/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Sayt ishlayaptimi?
# Brauzerda oching: http://45.148.29.33

## ══════════════════════════════════════
## DEFAULT LOGIN MA'LUMOTLARI
## ══════════════════════════════════════
# Admin:  login = admin    | parol = admin123
# !! BIRINCHI KIRISHDA PAROLNI O'ZGARTIRING !!

## ══════════════════════════════════════
## FOYDALI BUYRUQLAR
## ══════════════════════════════════════

# Loglarni ko'rish
pm2 logs tatu-yotoqxona

# Serverni qayta ishga tushirish
pm2 restart tatu-yotoqxona

# Nginx loglar
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Database'ga kirish
su - postgres -c "psql -d tatu_yotoqxona"

# PM2 holati
pm2 monit

## ══════════════════════════════════════
## YANGILASH (Keyingi versiyalar uchun)
## ══════════════════════════════════════
# Yangi ZIP'ni yuklang va:
cd /var/www/tatu-yotoqxona
# Eski backup
cp -r backend/src backend/src.bak

# Yangi fayllarni ko'chiring
# Frontend rebuild:
cd frontend && npm install && npm run build

# Backend restart:
cd ../backend && npm install --production
pm2 restart tatu-yotoqxona
