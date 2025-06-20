
# class-connect

## 📘 Mô tả dự án

**Class Connect** là một dự án quản lý lớp học được xây dựng bằng các công nghệ hiện đại: **ReactJS** cho frontend, **ExpressJS** cho backend, và **MongoDB** cho cơ sở dữ liệu. Dự án hỗ trợ giáo viên và học sinh trong việc quản lý bài học, bài tập và tài liệu một cách thuận tiện.

---

## ⚙️ Cách cài đặt

1. **Clone repository về máy:**

   ```bash
   git clone https://github.com/ducndahe181048/class-connect.git
   cd class-connect
   ```

2. **Cài đặt thư viện cho frontend và backend:**

   - **Frontend:**
     ```bash
     cd frontend
     npm install
     ```

   - **Backend:**
     ```bash
     cd backend
     npm install
     ```

---

## 🚀 Cách chạy project

- **Frontend:**

  Di chuyển vào thư mục `frontend` và chạy:
  ```bash
  npm start
  ```

- **Backend:**

  Di chuyển vào thư mục `backend` và chạy:
  ```bash
  nodemon index.js --ignore uploads/
  ```

---

## 📌 Ghi chú

- Đảm bảo file .env có những thông tin cần thiết cho backend.
- Đảm bảo đã kết nối tới database.
- Đảm bảo đã cài đặt **Node.js** và **MongoDB** trên máy.
- Nếu chưa cài `nodemon`, bạn có thể cài bằng lệnh:
  ```bash
  npm install -g nodemon
  ```

---
