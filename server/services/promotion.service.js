const Promotion = require('../models/promotion.model');

const promotionService = {
  create: async (data) => {
    const promotion = new Promotion(data);
    return await promotion.save();
  },
  getAll: async () => {
    return await Promotion.find()
      .populate('products')
      .populate('genres')
      .populate('authors')
      .populate('publishers');
  },
  getById: async (id) => {
    return await Promotion.findById(id)
      .populate('products')
      .populate('genres')
      .populate('authors')
      .populate('publishers');
  },
  update: async (id, data) => {
    return await Promotion.findByIdAndUpdate(id, data, { new: true });
  },
  delete: async (id) => {
    return await Promotion.findByIdAndDelete(id);
  }
};

module.exports = promotionService;