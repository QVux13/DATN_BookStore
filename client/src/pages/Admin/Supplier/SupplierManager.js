import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Spinner, Collapse, Card } from "react-bootstrap";
import supplierApi from "../../../api/supplierApi";
import stockReceiptApi from "../../../api/stockReceiptApi";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function SupplierManager() {
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [receiptDateRange, setReceiptDateRange] = useState({ from: "", to: "" });
  const [form, setForm] = useState({
    name: "",
    contact: "",
    address: "",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    contact: "",
    address: "",
  });
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [loadingReceipts, setLoadingReceipts] = useState(false);

  const handleExportExcel = () => {
    const data = filteredReceipts.map((item) => ({
      "Ngày nhập": new Date(item.importDate).toLocaleDateString(),
      "Sách": item.book?.name,
      "Số lượng nhập": item.quantity,
      "Giá nhập": item.importPrice,
      "Tổng tiền": item.importPrice * item.quantity,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LichSuNhapHang");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "lich_su_nhap_hang.xlsx");
  };

  const fetchSuppliers = async () => {
    try {
      const res = await supplierApi.getAll();
      if (Array.isArray(res.data)) {
        setSuppliers(res.data);
      } else {
        setSuppliers([]);
      }
    } catch (error) {
      toast.error("Không lấy được danh sách nhà cung cấp!");
      setSuppliers([]);
    }
  };

  // Lấy lịch sử nhập hàng của nhà cung cấp
  const fetchReceipts = async (supplierId) => {
    setLoadingReceipts(true);
    try {
      // Đảm bảo truyền đúng tham số id cho API
      const res = await stockReceiptApi.getAll({ supplier: supplierId });
      setReceipts(res.data?.filter(r => r.supplier === supplierId || r.supplier?._id === supplierId) || []);
    } catch {
      setReceipts([]);
    }
    setLoadingReceipts(false);
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle edit form change
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Thêm nhà cung cấp
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supplierApi.create(form);
      toast.success("Thêm nhà cung cấp thành công!");
      setShowModal(false);
      setForm({ name: "", contact: "", address: "" });
      fetchSuppliers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Thêm nhà cung cấp thất bại!");
    }
    setLoading(false);
  };

  // Sửa nhà cung cấp
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supplierApi.update(selectedSupplier._id, editForm);
      toast.success("Cập nhật nhà cung cấp thành công!");
      setShowEditModal(false);
      fetchSuppliers();
      // Nếu đang xem lịch sử của nhà cung cấp này thì cập nhật lại tên
      if (selectedSupplier && selectedSupplier._id === editForm._id) {
        setSelectedSupplier({ ...selectedSupplier, ...editForm });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật thất bại!");
    }
    setLoading(false);
  };

  // Khi click vào nhà cung cấp
  const handleSupplierClick = (supplier) => {
    if (selectedSupplier && selectedSupplier._id === supplier._id) {
      setSelectedSupplier(null);
      setReceipts([]);
    } else {
      setSelectedSupplier(supplier);
      setReceipts([]); // Xóa receipts cũ ngay lập tức
      fetchReceipts(supplier._id);
    }
  };

  // Khi click sửa
  const handleEditSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setEditForm({
      name: supplier.name,
      contact: supplier.contact,
      address: supplier.address,
    });
    setShowEditModal(true);
  };

  const filteredReceipts = receipts.filter((item) => {
    if (!receiptDateRange.from && !receiptDateRange.to) return true;
    const date = new Date(item.importDate);
    if (receiptDateRange.from && date < new Date(receiptDateRange.from)) return false;
    if (receiptDateRange.to && date > new Date(receiptDateRange.to + "T23:59:59")) return false;
    return true;
  });

   return (
    <div>
      <h2 className="d-flex align-items-center justify-content-between">
        Quản lý nhà cung cấp
        <Button
          className="mb-3"
          variant="success"
          onClick={() => setShowModal(true)}
        >
          Thêm nhà cung cấp
        </Button>
      </h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Tên nhà cung cấp</th>
            <th>Liên hệ</th>
            <th>Địa chỉ</th>
            <th style={{ width: 90 }}>Sửa</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((item) => (
            <React.Fragment key={item._id}>
              <tr
                style={{ cursor: "pointer", background: selectedSupplier && selectedSupplier._id === item._id ? "#e9ecef" : undefined }}
                onClick={() => handleSupplierClick(item)}
              >
                <td>{item.name}</td>
                <td>{item.contact}</td>
                <td>{item.address}</td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={e => {
                      e.stopPropagation();
                      handleEditSupplier(item);
                    }}
                  >
                    Sửa
                  </Button>
                </td>
              </tr>
              <tr>
                <td colSpan={4} style={{ padding: 0, border: "none" }}>
                  <Collapse in={selectedSupplier && selectedSupplier._id === item._id}>
                    <div>
                      {loadingReceipts ? (
                        <div className="text-center py-3"><Spinner animation="border" size="sm" /> Đang tải lịch sử nhập hàng...</div>
                      ) : (
                        receipts.length > 0 ? (
                          <Card className="m-2 shadow-sm">
                            <Card.Body>
                              <b>Lịch sử nhập hàng của <span className="text-primary">{item.name}</span>:</b>
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <Form.Control
                                  type="date"
                                  size="sm"
                                  value={receiptDateRange.from}
                                  onChange={e => setReceiptDateRange(r => ({ ...r, from: e.target.value }))}
                                  style={{ maxWidth: 150 }}
                                  placeholder="Từ ngày"
                                />
                                <span className="mx-1">-</span>
                                <Form.Control
                                  type="date"
                                  size="sm"
                                  value={receiptDateRange.to}
                                  onChange={e => setReceiptDateRange(r => ({ ...r, to: e.target.value }))}
                                  style={{ maxWidth: 150 }}
                                  placeholder="Đến ngày"
                                />
                                <Button variant="success" size="sm" onClick={handleExportExcel}>
                                  <i className="bi bi-file-earmark-excel me-1"></i> Xuất Excel
                                </Button>
                              </div>
                              <Table size="sm" className="mt-2">
                                <thead>
                                  <tr>
                                    <th>Ngày nhập</th>
                                    <th>Sách</th>
                                    <th>Số lượng nhập</th>
                                    <th>Giá nhập</th>
                                    <th>Tổng tiền</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {filteredReceipts.map((r) => (
                                    <tr key={r._id}>
                                      <td>{new Date(r.importDate).toLocaleDateString()}</td>
                                      <td>{r.book?.name}</td>
                                      <td>{r.quantity}</td>
                                      <td>{r.importPrice?.toLocaleString()} VND</td>
                                      <td className="fw-bold text-primary">
                                        {(r.importPrice * r.quantity).toLocaleString()} VND
                                      </td>
                                    </tr>
                                  ))}
                                  <tr>
                                    <td colSpan={4}><b>Tổng tiền</b></td>
                                    <td className="fw-bold text-success">
                                      {filteredReceipts.reduce((sum, r) => sum + (r.importPrice * r.quantity), 0).toLocaleString()} VND
                                    </td>
                                  </tr>
                                </tbody>
                              </Table>
                            </Card.Body>
                          </Card>
                        ) : (
                          <div className="text-center text-muted py-3">Không có lịch sử nhập hàng.</div>
                        )
                      )}
                    </div>
                  </Collapse>
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </Table>

      {/* Modal thêm */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Thêm nhà cung cấp</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Tên nhà cung cấp</Form.Label>
              <Form.Control
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Liên hệ</Form.Label>
              <Form.Control
                name="contact"
                value={form.contact}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Địa chỉ</Form.Label>
              <Form.Control
                name="address"
                value={form.address}
                onChange={handleChange}
              />
            </Form.Group>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? <Spinner size="sm" /> : "Thêm mới"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal sửa */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Sửa nhà cung cấp</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Tên nhà cung cấp</Form.Label>
              <Form.Control
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Liên hệ</Form.Label>
              <Form.Control
                name="contact"
                value={editForm.contact}
                onChange={handleEditChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Địa chỉ</Form.Label>
              <Form.Control
                name="address"
                value={editForm.address}
                onChange={handleEditChange}
              />
            </Form.Group>
            <Button type="submit" variant="warning" disabled={loading}>
              {loading ? <Spinner size="sm" /> : "Lưu thay đổi"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}