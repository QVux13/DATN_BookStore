const Redis = require("ioredis")

// Tạo một Redis Mock khi không thể kết nối được
const createRedisMock = () => {
    return {
        get: async () => null,
        setex: async () => null,
        keys: async () => [],
        del: async () => null
    };
};

let redisClient;

// Luôn sử dụng Redis Mock để tránh lỗi kết nối
console.log("Using Redis Mock for seeding data");
redisClient = createRedisMock();

module.exports = redisClient