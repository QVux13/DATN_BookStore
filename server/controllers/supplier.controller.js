const supplierService = require('../services/supplier.service');

exports.getAll = async (req, res) => {
  try {
    const suppliers = await supplierService.getAll();
    res.json({ data: suppliers });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const supplier = await supplierService.create(req.body);
    res.status(201).json(supplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const supplier = await supplierService.updateById(req.params.id, req.body);
    if (!supplier) return res.status(404).json({ message: "Không tìm thấy nhà cung cấp!" });
    res.json(supplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const supplier = await supplierService.deleteById(req.params.id);
    if (!supplier) return res.status(404).json({ message: "Không tìm thấy nhà cung cấp!" });
    res.json({ message: "Đã xóa thành công!" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};