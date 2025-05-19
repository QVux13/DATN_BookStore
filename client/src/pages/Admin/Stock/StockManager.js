import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Row, Col, Spinner, Badge, Card } from "react-bootstrap";
import bookApi from "../../../api/bookApi";
import supplierApi from "../../../api/supplierApi";
import stockReceiptApi from "../../../api/stockReceiptApi";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function StockManager() {
  const [books, setBooks] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    book: "",
    supplier: "",
    quantity: 1,
    importPrice: 0,
  });
  const [selectedBook, setSelectedBook] = useState(null);

  // Thống kê
  const totalBooks = books.length;
  const totalStock = books.reduce((sum, b) => sum + (b.stock || 0), 0);
  const lowStock = books.filter((b) => b.stock > 0 && b.stock <= 5).length;
  const outOfStock = books.filter((b) => b.stock === 0).length;

  const [filterType, setFilterType] = useState("all");

  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const filteredReceipts = receipts.filter((item) => {
    if (!dateRange.from && !dateRange.to) return true;
    const date = new Date(item.importDate);
    if (dateRange.from && date < new Date(dateRange.from)) return false;
    if (dateRange.to && date > new Date(dateRange.to + "T23:59:59")) return false;
    return true;
  });

  // Hàm lọc sản phẩm theo filterType
  const filteredBooks = books.filter((b) => {
    if (filterType === "all") return true;
    if (filterType === "low") return b.stock > 0 && b.stock <= 5;
    if (filterType === "out") return b.stock === 0;
    return true;
  });
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookRes = await bookApi.getAll({ page: 1, limit: 1000 });
        setBooks(bookRes.data || bookRes);
        const supplierRes = await supplierApi.getAll({ page: 1, limit: 1000 });
        setSuppliers(supplierRes.data || supplierRes);
        const receiptRes = await stockReceiptApi.getAll({ page: 1, limit: 100 });
        setReceipts(receiptRes.data || receiptRes);
      } catch (error) {
        toast.error("Không thể tải dữ liệu kho!");
      }
    };
    fetchData();
  }, [showModal]);

  // Mở modal nhập kho cho sản phẩm cụ thể
  const handleOpenModal = (book) => {
    setSelectedBook(book);
    setForm({
      book: book._id,
      supplier: "",
      quantity: 1,
      importPrice: 0,
    });
    setShowModal(true);
  };

  const handleExportExcel = () => {
    const data = filteredReceipts.map((item) => ({
      "Sách": item.book?.name,
      "Nhà cung cấp": item.supplier?.name,
      "Số lượng nhập": item.quantity,
      "Giá nhập": item.importPrice,
      "Ngày nhập": new Date(item.importDate).toLocaleDateString(),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LichSuNhapKho");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "lich_su_nhap_kho.xlsx");
  };

  // Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await stockReceiptApi.create(form);
      toast.success("Nhập kho thành công!");
      setShowModal(false);
    } catch (error) {
      toast.error("Nhập kho thất bại!");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="mb-4">Quản lý kho</h2>
      <Row className="mb-4 g-3">
        <Col>
          <Card
            bg="primary"
            text="white"
            className="text-center shadow py-4 card-stat"
            style={{ minHeight: 140, cursor: "pointer" }}
            onClick={() => setFilterType("all")}
            border={filterType === "all" ? "light" : ""}
          >
            <Card.Body>
              <Card.Title className="fs-4 mb-3">Tổng số sản phẩm</Card.Title>
              <Card.Text style={{ fontSize: 38, fontWeight: 800 }}>
                <i className="bi bi-box me-2"></i> {totalBooks} <span className="fs-5">sản phẩm</span>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card
            bg="success"
            text="white"
            className="text-center shadow py-4 card-stat"
            style={{ minHeight: 140, cursor: "pointer" }}
            onClick={() => setFilterType("all")}
            border={filterType === "all" ? "light" : ""}
          >
            <Card.Body>
              <Card.Title className="fs-4 mb-3">Tổng số hàng</Card.Title>
              <Card.Text style={{ fontSize: 38, fontWeight: 800 }}>
                <i className="bi bi-archive me-2"></i> {totalStock} <span className="fs-5">quyển</span>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card
            bg="warning"
            text="dark"
            className="text-center shadow py-4 card-stat"
            style={{ minHeight: 140, cursor: "pointer" }}
            onClick={() => setFilterType("low")}
            border={filterType === "low" ? "dark" : ""}
          >
            <Card.Body>
              <Card.Title className="fs-4 mb-3">Sản phẩm sắp hết</Card.Title>
              <Card.Text style={{ fontSize: 38, fontWeight: 800 }}>
                <i className="bi bi-exclamation-triangle me-2"></i> {lowStock} <span className="fs-5">sản phẩm</span>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card
            bg="danger"
            text="white"
            className="text-center shadow py-4 card-stat"
            style={{ minHeight: 140, cursor: "pointer" }}
            onClick={() => setFilterType("out")}
            border={filterType === "out" ? "light" : ""}
          >
            <Card.Body>
              <Card.Title className="fs-4 mb-3">Hết hàng</Card.Title>
              <Card.Text style={{ fontSize: 38, fontWeight: 800 }}>
                <i className="bi bi-x-circle me-2"></i> {outOfStock} <span className="fs-5">sản phẩm</span>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Table striped bordered hover responsive className="align-middle shadow-sm">
        <thead className="table-light">
          <tr>
            <th>Tên sản phẩm</th>
            <th>Số lượng trong kho</th>
            <th>Giá niêm yết</th>
            <th>Giá Nhập TB</th>
            <th>Giá Khuyến Mãi</th>
            <th style={{ width: 120 }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book._id} className={book.stock === 0 ? "table-danger" : book.stock <= 5 ? "table-warning" : ""}>
              <td>
                <b>{book.name}</b>
                {book.stock === 0 && <Badge bg="danger" className="ms-2">Hết hàng</Badge>}
                {book.stock > 0 && book.stock <= 5 && <Badge bg="warning" text="dark" className="ms-2">Sắp hết</Badge>}
              </td>
              <td>
                <Badge bg={book.stock === 0 ? "danger" : book.stock <= 5 ? "warning" : "success"} text={book.stock <= 5 ? "dark" : "white"}>
                  {book.stock}
                </Badge>
              </td>
              <td>{book.price?.toLocaleString()} VND</td>
              <td>
                {(() => {
                  const receiptsOfBook = receipts.filter(r => r.book?._id === book._id);
                  if (!receiptsOfBook.length) return "—";
                  const total = receiptsOfBook.reduce((sum, r) => sum + (r.importPrice * r.quantity), 0);
                  const qty = receiptsOfBook.reduce((sum, r) => sum + r.quantity, 0);
                  return (total / qty).toLocaleString(undefined, {maximumFractionDigits: 2}) + " VND";
                })()}
              </td>
              <td>{book.promotionPrice ? book.promotionPrice.toLocaleString() + " VND" : (book.price?.toLocaleString() + " VND")}</td>
              <td>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenModal(book)}
                  className="w-100"
                >
                  + Nhập hàng
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <h4 className="mt-5 mb-3 d-flex align-items-center justify-content-between">
        <span>Lịch sử nhập kho</span>
        <div className="d-flex align-items-center gap-2">
          <Form.Control
            type="date"
            size="sm"
            value={dateRange.from}
            onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))}
            style={{ maxWidth: 150 }}
            placeholder="Từ ngày"
          />
          <span className="mx-1">-</span>
          <Form.Control
            type="date"
            size="sm"
            value={dateRange.to}
            onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))}
            style={{ maxWidth: 150 }}
            placeholder="Đến ngày"
          />
          <Button variant="success" size="sm" onClick={handleExportExcel}>
            <i className="bi bi-file-earmark-excel me-1"></i> Xuất Excel
          </Button>
        </div>
      </h4>
      <Table striped bordered hover responsive className="shadow-sm">
        <thead className="table-light">
          <tr>
            <th>Sách</th>
            <th>Nhà cung cấp</th>
            <th>Số lượng nhập</th>
            <th>Giá nhập</th>
            <th>Ngày nhập</th>
          </tr>
        </thead>
        <tbody>
          {filteredReceipts.map((item) => (
            <tr key={item._id}>
              <td>{item.book?.name}</td>
              <td>{item.supplier?.name}</td>
              <td>{item.quantity}</td>
              <td>{item.importPrice.toLocaleString()} VND</td>
              <td>{new Date(item.importDate).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <span role="img" aria-label="import" style={{ marginRight: 8 }}>📦</span>
            Nhập kho cho sản phẩm: <span className="text-primary">{selectedBook?.name}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>
                    <i className="bi bi-truck" style={{ marginRight: 6 }}></i>
                    Nhà cung cấp
                  </Form.Label>
                  <Form.Select
                    name="supplier"
                    value={form.supplier}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Chọn nhà cung cấp</option>
                    {suppliers.map((s) => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col xs={6}>
                <Form.Group>
                  <Form.Label>
                    <i className="bi bi-123" style={{ marginRight: 6 }}></i>
                    Số lượng nhập
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity"
                    min={1}
                    value={form.quantity}
                    onChange={handleChange}
                    required
                    placeholder="Nhập số lượng"
                  />
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group>
                  <Form.Label>
                    <i className="bi bi-cash-stack" style={{ marginRight: 6 }}></i>
                    Giá nhập (VNĐ)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="importPrice"
                    min={0}
                    value={form.importPrice}
                    onChange={handleChange}
                    required
                    placeholder="Nhập giá nhập"
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-grid gap-2 mt-3">
              <Button type="submit" variant="success" disabled={loading} size="lg">
                {loading ? <Spinner size="sm" /> : <><i className="bi bi-plus-circle me-2"></i>Nhập kho</>}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}