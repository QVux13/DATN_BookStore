const axios = require('axios');

async function callSeedApi() {
  try {
    console.log('Đang gọi API để thêm dữ liệu giả...');
    const response = await axios.post('http://localhost:5000/api/v1/seed/all');
    console.log('Kết quả:', response.data);
  } catch (error) {
    console.error('Lỗi khi gọi API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

callSeedApi();
