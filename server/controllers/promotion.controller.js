const promotionService = require('../services/promotion.service');
const Book = require('../models/books.model');
const redis = require('../config/redis');

const Promotion = require('../models/promotion.model'); // Thêm nếu chưa có

const applyPromotionToBooks = async (promotion) => {
  if (!promotion.products || !promotion.value) return;

  // 1. Lấy tất cả promotion còn hiệu lực (trừ promotion hiện tại nếu cần)
  const now = new Date();
  const activePromotions = await Promotion.find({
    start: { $lte: now },
    end: { $gte: now }
  });

  // 2. Tổng hợp tất cả productId đang được áp dụng khuyến mãi
  let allActiveProductIds = [];
  activePromotions.forEach(promo => {
    if (Array.isArray(promo.products)) {
      allActiveProductIds.push(...promo.products.map(id => id.toString()));
    }
  });

  // 3. Reset các sản phẩm không thuộc bất kỳ chương trình nào về mặc định
  await Book.updateMany(
    {
      _id: { $nin: allActiveProductIds }
    },
    {
      $set: {
        discount: 0,
        discountType: null,
        finalPrice: null,
        promotionId: null,
        promotionEnd: null
      }
    }
  );

  // 4. Áp dụng khuyến mãi cho các sản phẩm của promotion hiện tại (giữ nguyên như cũ)
  const startDate = new Date(promotion.start);
  const endDate = new Date(promotion.end);

  if (now < startDate || now > endDate) {
    return;
  }

  for (const bookId of promotion.products) {
    const book = await Book.findById(bookId);
    if (!book) continue;

    let discount = 0;
    let finalPrice = book.price;

    switch (promotion.discountType) {
      case "percent":
        discount = book.price * promotion.value / 100;
        finalPrice = book.price - discount;
        break;
      case "amount":
        discount = promotion.value;
        finalPrice = book.price - discount;
        break;
      case "fixed":
        finalPrice = promotion.value;
        discount = book.price - finalPrice;
        break;
    }

    discount = Math.max(0, Math.min(discount, book.price));
    finalPrice = Math.max(0, finalPrice);

    await Book.findByIdAndUpdate(bookId, {
      discount,
      discountType: promotion.discountType,
      finalPrice,
      promotionId: promotion._id,
      promotionEnd: promotion.end
    });
  }
  const keys = await redis.keys('Book::*');
  if (keys.length > 0) await redis.del(keys);
};

const promotionController = {
  create: async (req, res) => {
    try {
      const newPromotion = await promotionService.create(req.body);
      await applyPromotionToBooks(newPromotion); // Áp dụng khuyến mãi cho sách
      res.status(201).json(newPromotion);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getAll: async (req, res) => {
    try {
      const promotions = await promotionService.getAll();
      res.status(200).json(promotions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getById: async (req, res) => {
    try {
      const promotion = await promotionService.getById(req.params.id);
      if (!promotion) return res.status(404).json({ message: 'Promotion not found' });
      res.status(200).json(promotion);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedPromotion = await promotionService.update(id, req.body);
      await applyPromotionToBooks(updatedPromotion); // Áp dụng khuyến mãi cho sách
      res.status(200).json(updatedPromotion);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  delete: async (req, res) => {
    try {
      const promotion = await promotionService.delete(req.params.id);
      if (!promotion) return res.status(404).json({ message: 'Promotion not found' });

      // 1. Lấy tất cả promotion còn hiệu lực
      const now = new Date();
      const activePromotions = await Promotion.find({
        start: { $lte: now },
        end: { $gte: now }
      });

      // 2. Tổng hợp tất cả productId đang được áp dụng khuyến mãi
      let allActiveProductIds = [];
      activePromotions.forEach(promo => {
        if (Array.isArray(promo.products)) {
          allActiveProductIds.push(...promo.products.map(id => id.toString()));
        }
      });

      // 3. Reset tất cả sách về mặc định trước
      await Book.updateMany(
        {},
        {
          $set: {
            discount: 0,
            discountType: null,
            finalPrice: null,
            promotionId: null,
            promotionEnd: null
          }
        }
      );

      // 4. Áp dụng lại khuyến mãi cho tất cả promotion còn hiệu lực
      for (const promo of activePromotions) {
        await applyPromotionToBooks(promo);
      }

      res.status(200).json({ message: 'Deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = promotionController;