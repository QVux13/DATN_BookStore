# BookStore MERN Stack

Đây là dự án website bán sách trực tuyến được xây dựng bằng MERN Stack (MongoDB, Express.js, React.js, Node.js).

## Tính năng

- Đăng ký, đăng nhập tài khoản
- Xem danh sách sách theo thể loại, tác giả, nhà xuất bản
- Tìm kiếm sách
- Xem chi tiết sách
- Thêm sách vào giỏ hàng
- Thanh toán đơn hàng qua PayPal
- Áp dụng mã giảm giá
- Dashboard quản trị cho admin
- Quản lý đơn hàng, sách, tác giả, thể loại, nhà xuất bản, người dùng, mã giảm giá
- Phân tích doanh số bán hàng

## Yêu cầu hệ thống

- Node.js (phiên bản 14.x trở lên)
- npm hoặc yarn
- MongoDB
- Redis (tùy chọn)

## Cài đặt và chạy dự án

### Bước 1: Clone dự án

```bash
git clone <link-repository>
cd bookstore-v2
```

### Bước 2: Cấu hình môi trường

Tạo file `.env` trong thư mục `server` với nội dung sau:

```
PORT=5000
MONGODB_CONNECT_URI=<đường-dẫn-kết-nối-mongodb>
JWT_SECRET=<khóa-bí-mật-jwt>
MAIL_USERNAME=<email-của-bạn>
MAIL_PASSWORD=<mật-khẩu-ứng-dụng-email>
CLIENT_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=<tên-cloud-của-bạn>
CLOUDINARY_API_KEY=<api-key-cloudinary>
CLOUDINARY_API_SECRET=<api-secret-cloudinary>
```

### Bước 3: Cài đặt thư viện

Cài đặt thư viện cho server:

```bash
cd server
npm install
```

Cài đặt thư viện cho client:

```bash
cd ../client
npm install
```

### Bước 4: Chạy dự án

Chạy server:

```bash
cd ../server
npm start
```

Trong một terminal khác, chạy client:

```bash
cd ../client
npm start
```

Sau khi chạy thành công, bạn có thể truy cập:
- Client: http://localhost:3000
- Server API: http://localhost:5000

### Bước 5: Khởi tạo dữ liệu (tùy chọn)

Để khởi tạo dữ liệu mẫu, bạn có thể chạy script sau:

```bash
cd ../server
node manualSeed.js
```

## Cấu trúc dự án

### Client

```
client/
  ├── public/               # Tài nguyên tĩnh
  └── src/
      ├── api/              # Các API call đến server
      ├── assets/           # Hình ảnh, icon
      ├── components/       # Các component tái sử dụng
      ├── helper/           # Hàm hỗ trợ
      ├── hooks/            # Custom React hooks
      ├── layouts/          # Các layout của trang
      ├── pages/            # Các trang của ứng dụng
      └── redux/            # Redux store, actions, reducers
```

### Server

```
server/
  ├── config/               # Cấu hình (cloudinary, nodemailer...)
  ├── controllers/          # Xử lý logic từ routes
  ├── middlewares/          # Middleware (auth, upload...)
  ├── models/               # Mongoose models
  ├── routes/               # API routes
  ├── services/             # Business logic
  └── utils/                # Tiện ích
```

## Công nghệ sử dụng

### Frontend
- React.js
- Redux
- React Router
- Axios
- React Bootstrap
- Formik & Yup
- Chart.js
- CKEditor
- React Icons

### Backend
- Node.js
- Express.js
- MongoDB & Mongoose
- JWT Authentication
- Bcrypt
- Multer
- Cloudinary
- Nodemailer
- Redis