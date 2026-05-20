# Sử dụng Node.js Alpine siêu nhẹ làm nền tảng
FROM node:20-alpine

# Cài đặt công cụ giải nén unzip và các thư viện biên dịch cần thiết cho SQLite
RUN apk add --no-cache unzip make gcc g++ python3

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy các file package.json của root
COPY package*.json ./

# Cài đặt thư viện root (bỏ qua chạy postinstall script lúc này)
RUN npm install --ignore-scripts

# Copy toàn bộ mã nguồn bao gồm các file zip
COPY . .

# Giải nén backend.zip
RUN if [ -f backend.zip ]; then \
      (unzip -o backend.zip -d . || true) && rm -f backend.zip; \
    fi

# Giải nén css.zip
RUN if [ -f css.zip ]; then \
      (unzip -o css.zip -d . || true) && rm -f css.zip; \
    fi

# Giải nén js.zip
RUN if [ -f js.zip ]; then \
      (unzip -o js.zip -d . || true) && rm -f js.zip; \
    fi

# Giải nén images.zip
RUN if [ -f images.zip ]; then \
      (unzip -o images.zip -d . || true) && rm -f images.zip; \
    fi

# Xóa bỏ hoàn toàn thư mục node_modules cũ từ máy cá nhân (nếu bị dính trong file zip) để tránh lỗi xung đột hệ điều hành
RUN rm -rf backend/node_modules

# Cài đặt toàn bộ thư viện backend (biên dịch SQLite tương thích với Linux Alpine)
RUN cd backend && npm install

# Expose cổng 7860
EXPOSE 7860

# Thiết lập cổng chạy qua biến môi trường của Hugging Face
ENV PORT=7860
ENV NODE_ENV=production

# Chạy máy chủ Node.js
CMD ["npm", "start"]
