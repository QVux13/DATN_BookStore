const Supplier = require('../models/supplier.model');

const supplierService = {
    getAll: async () => {
        return await Supplier.find();
    },
    getById: async (id) => {
        return await Supplier.findById(id);
    },
    create: async (data) => {
        const newSupplier = new Supplier(data);
        return await newSupplier.save();
    },
    updateById: async (id, data) => {
        return await Supplier.findByIdAndUpdate(id, data, { new: true });
    },
    deleteById: async (id) => {
        return await Supplier.findByIdAndDelete(id);
    }
};

module.exports = supplierService;