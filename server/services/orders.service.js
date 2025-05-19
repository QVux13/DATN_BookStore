const Order = require('../models/orders.model')

const orderService = {
    getAll: async({query, page, limit, sort}) => {
        const skip = (page - 1) * limit

        return await Promise.all([
            Order.countDocuments(query), 
            Order.find(query).skip(skip).limit(limit).sort(sort)])

    },
    getById: async(id) => {
        return await Order.findById(id).populate("user voucher").populate("products.product").populate("tracking.user", "fullName")
    },
    create: async({ userId, products, delivery, voucherId, cost, method, paymentId }) => {
        const newOrder = new Order({
            user: userId, 
            products,
            delivery, 
            voucher: voucherId, 
            cost, 
            method, 
            paymentId
        })
        return await newOrder.save()
    },
    updatePaymentStatusByPaymentId: async(paymentId, { paymentStatus, method }) => {
        return await Order.findOneAndUpdate({ paymentId: paymentId },  { paymentStatus, method }, {new: true})
    },
    updateStatus: async(id, { orderStatus, paymentStatus }) => {
        return await Order.findByIdAndUpdate(id, {
            orderStatus,
            paymentStatus
        }, {new: true})
       
    },
    updatePaymentId: async(orderId, { paymentId }) => {
        return await Order.findByIdAndUpdate(orderId,  { paymentId }, {new: true})
    },
    addTracking: async (orderId, { status, time, userId }) =>{
        return await Order.findByIdAndUpdate(orderId, {
            $push: {
                tracking: { status, time, user: userId }
            }
        }, { new: true })
    },
    // Thong ke
    getTotalRevenue: async() => {
        return await Order.aggregate([
            {
                $project: {
                    createdAt: 1,
                    totalCost: { $subtract: ["$cost.total", "$cost.shippingFee"] }
                }
            },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: "$totalCost" },
                },
               
            },
        ])
    },
    getRevenueWeek: async(query) => {
        const { start, end } = query
        return await Order.aggregate([
            {
                $project: {
                    createdAt: 1,
                    totalCost: { $subtract: ["$cost.total", "$cost.shippingFee"] }
                }
            },
            {
                $match: {
                    createdAt: {
                        $gte: new Date(start),
                        $lte: new Date(end),
                    },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$totalCost" },
                },
            },
            { $sort: { _id: 1 } },
        ])
    },
    getRevenueLifeTime: async() => {
        return await Order.aggregate([
            {
                $project: {
                    createdAt: 1,
                    totalCost: { $subtract: ["$cost.total", "$cost.shippingFee"] }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$totalCost" },
                },
            },
            { $sort: { _id: 1 } },
        ])
    },
    getOrderCountLifeTime: async() => {
        return await Order.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    total: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ])
       
    },
    getBestSeller: async() => {
        return await Order.aggregate([
            { $unwind: "$products" },
            {
                $group: {
                    _id: "$products.product", 
                    count: { $sum: "$products.quantity" }
                }
            },
            {
                $lookup: {
                    from: "books", 
                    localField: "_id",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
            
        ])
    },

    getSummaryByRange: async ({ from, to }) => {
        const fromDate = new Date(from);
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);

        const orders = await Order.find({
            createdAt: { $gte: fromDate, $lte: toDate }
        });
        // Gom nhóm sản phẩm
        const productsMap = {};
        let totalOrders = 0, totalRevenue = 0, totalProfit = 0;
        orders.forEach(order => {
            totalOrders += 1;
            totalRevenue += order.total;
            totalProfit += order.profit || 0;
            order.products.forEach(item => {
                if (!productsMap[item.productName]) {
                    productsMap[item.productName] = {
                        name: item.productName,
                        quantity: 0,
                        price: item.price,
                        total: 0,
                        profit: 0
                    };
                }
                productsMap[item.productName].quantity += item.quantity;
                productsMap[item.productName].total += item.price * item.quantity;
                productsMap[item.productName].profit += item.profit || 0;
            });
        });

        // Tạo dữ liệu chart group by ngày
        const chart = [];
        const groupBy = {};
        orders.forEach(order => {
            const date = order.createdAt.toISOString().slice(0, 10); // yyyy-mm-dd
            if (!groupBy[date]) groupBy[date] = 0;
            groupBy[date] += order.total;
        });
        Object.keys(groupBy).sort().forEach(date => {
            chart.push({ _id: date, revenue: groupBy[date] });
        });

        return {
            orders: totalOrders,
            revenue: totalRevenue,
            profit: totalProfit,
            products: Object.values(productsMap),
            chart // <-- thêm trường này!
        };
    }
}


module.exports = orderService
