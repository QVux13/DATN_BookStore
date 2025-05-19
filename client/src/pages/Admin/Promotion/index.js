import React, { useEffect, useState } from "react";
import { Row, Col, Table, Button, Modal, Spinner, Form } from "react-bootstrap";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import promotionApi from "../../../api/promotionApi"; // Bạn cần tạo file này giống các api khác
import productApi from "../../../api/bookApi"; // Giả sử bạn đã có api cho sản phẩm
import genreApi from "../../../api/genreApi";
import authorApi from "../../../api/authorApi";
import publisherApi from "../../../api/publisherApi";

export default function PromotionList() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [promotionData, setPromotionData] = useState({
    name: "",
    description: "",
    discountType: "percent", // Mặc định là giảm theo phần trăm
    value: 0,
    start: "",
    end: "",
    products: [],
    genres: [],
    authors: [],
    publishers: [],
    isActive: true,
  });
  const [products, setProducts] = useState([]);
  const [genres, setGenres] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);

  useEffect(() => {
    fetchPromotions();
    fetchProducts();
    fetchGenres();
    fetchAuthors();
    fetchPublishers();
  }, []);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await promotionApi.getAll();
      console.log("Promotion list API result:", res);
      // Nếu res.data là mảng:
      setPromotions(res);
      // Nếu res là mảng:
      // setPromotions(res);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách khuyến mãi!");
    }
    setLoading(false);
  };

  const getAllProductIdsFromSelections = () => {
    let productIds = [...promotionData.products];

    // Thêm sản phẩm từ thể loại
    if (promotionData.genres.length > 0) {
      products.forEach(product => {
        // genre có thể là mảng hoặc 1 id
        if (product.genre) {
          if (Array.isArray(product.genre)) {
            if (product.genre.some(gid => promotionData.genres.includes(gid) || promotionData.genres.includes(gid._id))) {
              if (!productIds.includes(product._id)) productIds.push(product._id);
            }
          } else if (
            promotionData.genres.includes(product.genre) ||
            (typeof product.genre === "object" && promotionData.genres.includes(product.genre._id))
          ) {
            if (!productIds.includes(product._id)) productIds.push(product._id);
          }
        }
      });
    }

    // Thêm sản phẩm từ tác giả
    if (promotionData.authors.length > 0) {
      products.forEach(product => {
        if (product.author) {
          if (Array.isArray(product.author)) {
            if (product.author.some(aid => promotionData.authors.includes(aid) || promotionData.authors.includes(aid._id))) {
              if (!productIds.includes(product._id)) productIds.push(product._id);
            }
          } else if (
            promotionData.authors.includes(product.author) ||
            (typeof product.author === "object" && promotionData.authors.includes(product.author._id))
          ) {
            if (!productIds.includes(product._id)) productIds.push(product._id);
          }
        }
      });
    }

    // Thêm sản phẩm từ nhà xuất bản
    if (promotionData.publishers.length > 0) {
      products.forEach(product => {
        if (product.publisher) {
          if (
            promotionData.publishers.includes(product.publisher) ||
            (typeof product.publisher === "object" && promotionData.publishers.includes(product.publisher._id))
          ) {
            if (!productIds.includes(product._id)) productIds.push(product._id);
          }
        }
      });
    }

    return productIds;
  };

  const fetchProducts = async () => {
    try {
      const res = await productApi.getAll({ page: 1, limit: 1000 });
      setProducts(res.data || res); // tuỳ theo API trả về
    } catch (error) {
      setProducts([]);
    }
  };

  const fetchGenres = async () => {
    try {
      const res = await genreApi.getAll({ page: 1, limit: 1000 });
      setGenres(res.data || res); // tuỳ theo API trả về
    } catch (error) {
      setGenres([]);
    }
  };

  const fetchAuthors = async () => {
    try {
      const res = await authorApi.getAll({ page: 1, limit: 1000 });
      setAuthors(res.data || res);
    } catch (error) {
      setAuthors([]);
    }
  };

  const fetchPublishers = async () => {
    try {
      const res = await publisherApi.getAll({ page: 1, limit: 1000 });
      setPublishers(res.data || res);
    } catch (error) {
      setPublishers([]);
    }
  };

  const handleSubmitAdd = async (e) => {
  e.preventDefault();
  // Kiểm tra phải chọn ít nhất 1 đối tượng áp dụng
  if (
    promotionData.products.length === 0 &&
    promotionData.genres.length === 0 &&
    promotionData.authors.length === 0 &&
    promotionData.publishers.length === 0
  ) {
    toast.error("Bạn phải chọn ít nhất một sản phẩm, thể loại, tác giả hoặc nhà xuất bản để áp dụng!");
    return;
  }
  try {
    setLoading(true);
    const allProductIds = getAllProductIdsFromSelections();
    const dataToSend = {
      ...promotionData,
      products: allProductIds,
    };
    console.log("Sản phẩm gửi lên:", dataToSend.products);
    await promotionApi.create(dataToSend);
    toast.success("Thêm chương trình thành công!");
    setShowAddModal(false);
    setPromotionData({
      name: "",
      description: "",
      discountType: "percent",
      value: 0,
      start: "",
      end: "",
      products: [],
      genres: [],
      authors: [],
      publishers: [],
      isActive: true,
    });
    fetchPromotions();
  } catch (error) {
    // Log chi tiết lỗi trả về từ backend
    if (error.response) {
      console.error("Promotion add error:", error.response.data);
      toast.error(error.response.data?.message || "Thêm chương trình thất bại!");
    } else {
      console.error("Promotion add error:", error.message);
      toast.error("Thêm chương trình thất bại!");
    }
  }
  setLoading(false);
};

const handleSubmitUpdate = async (e) => {
  e.preventDefault();
  // Kiểm tra phải chọn ít nhất 1 đối tượng áp dụng
  if (
    promotionData.products.length === 0 &&
    promotionData.genres.length === 0 &&
    promotionData.authors.length === 0 &&
    promotionData.publishers.length === 0
  ) {
    toast.error("Bạn phải chọn ít nhất một sản phẩm, thể loại, tác giả hoặc nhà xuất bản để áp dụng!");
    return;
  }
  try {
    setLoading(true);
    const allProductIds = getAllProductIdsFromSelections();
    const dataToSend = {
      ...promotionData,
      products: allProductIds,
    };
    console.log("Sản phẩm gửi lên:", dataToSend.products);
    await promotionApi.update(selectedId, dataToSend);
    toast.success("Cập nhật thành công!");
    setShowUpdateModal(false);
    fetchPromotions();
  } catch (error) {
    toast.error("Cập nhật thất bại!");
  }
  setLoading(false);
};

  const handleDelete = async () => {
    try {
      setLoading(true);
      await promotionApi.delete(selectedId);
      toast.success("Xóa thành công!");
      setShowDeleteModal(false);
      fetchPromotions();
    } catch (error) {
      if (error.response) {
        console.error("Promotion delete error:", error.response.data);
        toast.error(error.response.data?.message || "Xóa thất bại!");
      } else {
        console.error("Promotion delete error:", error.message);
        toast.error("Xóa thất bại!");
      }
    }
    setLoading(false);
  };

  return (
    <Row>
      {/* Modal Thêm */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Thêm chương trình khuyến mãi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitAdd}>
            <Row>
              <Col xl={6}>
                <Form.Group>
                  <Form.Label>Tên chương trình</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={promotionData.name}
                    onChange={e => setPromotionData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col xl={3}>
                <Form.Group>
                  <Form.Label>Loại giảm giá</Form.Label>
                  <Form.Select
                    value={promotionData.discountType}
                    onChange={e => setPromotionData(prev => ({ 
                      ...prev, 
                      discountType: e.target.value,
                      value: 0 // Reset giá trị khi đổi loại
                    }))}
                  >
                    <option value="percent">Giảm theo phần trăm (%)</option>
                    <option value="amount">Giảm giá trực tiếp (VNĐ)</option>
                    <option value="fixed">Đồng giá tất cả sản phẩm (VNĐ)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xl={3}>
                <Form.Group>
                  <Form.Label>
                    {promotionData.discountType === "percent" && "Phần trăm giảm (%)"}
                    {promotionData.discountType === "amount" && "Số tiền giảm (VNĐ)"}
                    {promotionData.discountType === "fixed" && "Giá đồng giá (VNĐ)"}
                  </Form.Label>
                  <Form.Control
                    required
                    type="number"
                    min={0}
                    max={promotionData.discountType === "percent" ? 100 : undefined}
                    value={promotionData.value}
                    onChange={e => setPromotionData(prev => ({ 
                      ...prev, 
                      value: Math.max(0, Number(e.target.value))
                    }))}
                  />
                </Form.Group>
              </Col>
              <Col xl={6}>
                <Form.Group>
                  <Form.Label>Thời gian áp dụng</Form.Label>
                  <div className="d-flex">
                    <Form.Control
                      required
                      type="date"
                      value={promotionData.start}
                      onChange={e => setPromotionData(prev => ({ ...prev, start: e.target.value }))}
                    />
                    <span className="mx-2">-</span>
                    <Form.Control
                      required
                      type="date"
                      value={promotionData.end}
                      onChange={e => setPromotionData(prev => ({ ...prev, end: e.target.value }))}
                    />
                  </div>
                </Form.Group>
              </Col>
              <Col xl={6}>
                <Form.Group>
                  <Form.Label>Mô tả</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={promotionData.description}
                    onChange={e => setPromotionData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col xl={6}>
                <Form.Group>
                  <Form.Label>Áp dụng cho sản phẩm</Form.Label>
                  <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid #eee", padding: 8 }}>
                    {products.map(product => (
                      <Form.Check
                        key={product._id}
                        type="checkbox"
                        label={product.name}
                        value={product._id}
                        checked={promotionData.products.includes(product._id)}
                        onChange={e => {
                          const checked = e.target.checked;
                          setPromotionData(prev => ({
                            ...prev,
                            products: checked
                              ? [...prev.products, product._id]
                              : prev.products.filter(id => id !== product._id)
                          }));
                        }}
                      />
                    ))}
                  </div>
                </Form.Group>
              </Col>
              <Col xl={6}>
                <Form.Group>
                  <Form.Label>Áp dụng cho thể loại</Form.Label>
                  <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid #eee", padding: 8 }}>
                    {genres.map(genre => (
                      <Form.Check
                        key={genre._id}
                        type="checkbox"
                        label={genre.name}
                        value={genre._id}
                        checked={promotionData.genres.includes(genre._id)}
                        onChange={e => {
                          const checked = e.target.checked;
                          setPromotionData(prev => ({
                            ...prev,
                            genres: checked
                              ? [...prev.genres, genre._id]
                              : prev.genres.filter(id => id !== genre._id)
                          }));
                        }}
                      />
                    ))}
                  </div>
                </Form.Group>
              </Col>
              <Col xl={6}>
                <Form.Group>
                  <Form.Label>Áp dụng cho tác giả</Form.Label>
                  <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid #eee", padding: 8 }}>
                    {authors.map(author => (
                      <Form.Check
                        key={author._id}
                        type="checkbox"
                        label={author.name}
                        value={author._id}
                        checked={promotionData.authors.includes(author._id)}
                        onChange={e => {
                          const checked = e.target.checked;
                          setPromotionData(prev => ({
                            ...prev,
                            authors: checked
                              ? [...prev.authors, author._id]
                              : prev.authors.filter(id => id !== author._id)
                          }));
                        }}
                      />
                    ))}
                  </div>
                </Form.Group>
              </Col>
              <Col xl={6}>
                <Form.Group>
                  <Form.Label>Áp dụng cho nhà xuất bản</Form.Label>
                  <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid #eee", padding: 8 }}>
                    {publishers.map(pub => (
                      <Form.Check
                        key={pub._id}
                        type="checkbox"
                        label={pub.name}
                        value={pub._id}
                        checked={promotionData.publishers.includes(pub._id)}
                        onChange={e => {
                          const checked = e.target.checked;
                          setPromotionData(prev => ({
                            ...prev,
                            publishers: checked
                              ? [...prev.publishers, pub._id]
                              : prev.publishers.filter(id => id !== pub._id)
                          }));
                        }}
                      />
                    ))}
                  </div>
                </Form.Group>
              </Col>
            </Row>
            <Button type="submit" variant="primary" className="mt-3" disabled={loading}>
              {loading ? "Đang xử lý..." : "Thêm mới"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal Sửa */}
      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật chương trình khuyến mãi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitUpdate}>
            <Row>
              <Col xl={6}>
                <Form.Group>
                  <Form.Label>Tên chương trình</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={promotionData.name}
                    onChange={e => setPromotionData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col xl={3}>
                <Form.Group>
                  <Form.Label>Loại giảm giá</Form.Label>
                  <Form.Select
                    value={promotionData.discountType}
                    onChange={e => setPromotionData(prev => ({ 
                      ...prev, 
                      discountType: e.target.value,
                      value: 0 // Reset giá trị khi đổi loại
                    }))}
                  >
                    <option value="percent">Giảm theo phần trăm (%)</option>
                    <option value="amount">Giảm giá trực tiếp (VNĐ)</option>
                    <option value="fixed">Đồng giá tất cả sản phẩm (VNĐ)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xl={3}>
                <Form.Group>
                  <Form.Label>
                    {promotionData.discountType === "percent" && "Phần trăm giảm (%)"}
                    {promotionData.discountType === "amount" && "Số tiền giảm (VNĐ)"}
                    {promotionData.discountType === "fixed" && "Giá đồng giá (VNĐ)"}
                  </Form.Label>
                  <Form.Control
                    required
                    type="number"
                    min={0}
                    max={promotionData.discountType === "percent" ? 100 : undefined}
                    value={promotionData.value}
                    onChange={e => setPromotionData(prev => ({ 
                      ...prev, 
                      value: Math.max(0, Number(e.target.value))
                    }))}
                  />
                </Form.Group>
              </Col>
              <Col xl={6}>
                <Form.Group>
                  <Form.Label>Thời gian áp dụng</Form.Label>
                  <div className="d-flex">
                    <Form.Control
                      required
                      type="date"
                      value={promotionData.start}
                      onChange={e => setPromotionData(prev => ({ ...prev, start: e.target.value }))}
                    />
                    <span className="mx-2">-</span>
                    <Form.Control
                      required
                      type="date"
                      value={promotionData.end}
                      onChange={e => setPromotionData(prev => ({ ...prev, end: e.target.value }))}
                    />
                  </div>
                </Form.Group>
              </Col>
              <Col xl={6}>
                <Form.Group>
                  <Form.Label>Mô tả</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={promotionData.description}
                    onChange={e => setPromotionData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col xl={6}>
                <Form.Group>
                  <Form.Label>Áp dụng cho sản phẩm</Form.Label>
                  <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid #eee", padding: 8 }}>
                    {products.map(product => (
                      <Form.Check
                        key={product._id}
                        type="checkbox"
                        label={product.name}
                        value={product._id}
                        checked={promotionData.products.includes(product._id)}
                        onChange={e => {
                          const checked = e.target.checked;
                          setPromotionData(prev => ({
                            ...prev,
                            products: checked
                              ? [...prev.products, product._id]
                              : prev.products.filter(id => id !== product._id)
                          }));
                        }}
                      />
                    ))}
                  </div>
                </Form.Group>
              </Col>
              <Col xl={6}>
                <Form.Group>
                  <Form.Label>Áp dụng cho thể loại</Form.Label>
                  <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid #eee", padding: 8 }}>
                    {genres.map(genre => (
                      <Form.Check
                        key={genre._id}
                        type="checkbox"
                        label={genre.name}
                        value={genre._id}
                        checked={promotionData.genres.includes(genre._id)}
                        onChange={e => {
                          const checked = e.target.checked;
                          setPromotionData(prev => ({
                            ...prev,
                            genres: checked
                              ? [...prev.genres, genre._id]
                              : prev.genres.filter(id => id !== genre._id)
                          }));
                        }}
                      />
                    ))}
                  </div>
                </Form.Group>
              </Col>
              <Col xl={6}>
                <Form.Group>
                  <Form.Label>Áp dụng cho tác giả</Form.Label>
                  <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid #eee", padding: 8 }}>
                    {authors.map(author => (
                      <Form.Check
                        key={author._id}
                        type="checkbox"
                        label={author.name}
                        value={author._id}
                        checked={promotionData.authors.includes(author._id)}
                        onChange={e => {
                          const checked = e.target.checked;
                          setPromotionData(prev => ({
                            ...prev,
                            authors: checked
                              ? [...prev.authors, author._id]
                              : prev.authors.filter(id => id !== author._id)
                          }));
                        }}
                      />
                    ))}
                  </div>
                </Form.Group>
              </Col>
              <Col xl={6}>
                <Form.Group>
                  <Form.Label>Áp dụng cho nhà xuất bản</Form.Label>
                  <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid #eee", padding: 8 }}>
                    {publishers.map(pub => (
                      <Form.Check
                        key={pub._id}
                        type="checkbox"
                        label={pub.name}
                        value={pub._id}
                        checked={promotionData.publishers.includes(pub._id)}
                        onChange={e => {
                          const checked = e.target.checked;
                          setPromotionData(prev => ({
                            ...prev,
                            publishers: checked
                              ? [...prev.publishers, pub._id]
                              : prev.publishers.filter(id => id !== pub._id)
                          }));
                        }}
                      />
                    ))}
                  </div>
                </Form.Group>
              </Col>
            </Row>
            <Button type="submit" variant="danger" className="mt-3" disabled={loading}>
              {loading ? "Đang xử lý..." : "Lưu"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal Xóa */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có chắc chắn muốn xóa chương trình này?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {loading ? "Đang xử lý..." : "Xóa"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Col xl={12}>
        <div className="admin-content-wrapper">
          <div className="admin-content-header">Danh sách chương trình khuyến mãi</div>
          <div className="admin-content-action">
            <div className="d-flex">
              <button
                type="button"
                className="btn btn-success ms-auto"
                onClick={() => {
                  setPromotionData({
                    name: "",
                    description: "",
                    discountType: "percent",
                    value: 0,
                    start: "",
                    end: "",
                    products: [],
                    genres: [],
                    authors: [],
                    publishers: [],
                    isActive: true,
                  });
                  setShowAddModal(true);
                }}
              >
                Thêm chương trình
              </button>
            </div>
          </div>
          <div className="admin-content-body">
            <Table hover>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên chương trình</th>
                  <th>Loại</th>
                  <th>Giá trị</th>
                  <th>Thời gian</th>
                  <th>Áp dụng cho</th>
                  <th colSpan={2}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7}>
                      <Spinner animation="border" variant="success" />
                    </td>
                  </tr>
                ) : promotions && promotions.length > 0 ? (
                  promotions.map((item, index) => (
                    <tr key={item._id}>
                      <td>{index + 1}</td>
                      <td>{item.name}</td>
                      <td>
                        {item.discountType === "percent" ? "Giảm phần trăm" : 
                         item.discountType === "amount" ? "Giảm giá trực tiếp" : 
                         "Đồng giá"}
                      </td>
                      <td>
                        {item.discountType === "percent" ? `${item.value}%` :
                         item.discountType === "amount" ? `${item.value.toLocaleString()}₫` :
                         `${item.value.toLocaleString()}₫ (Đồng giá)`}
                      </td>
                      <td>
                        {item.start?.slice(0, 10)} - {item.end?.slice(0, 10)}
                      </td>
                      <td>
                        {item.products?.length > 0 && item.products.map(p => p.name).join(', ')}
                        {item.genres?.length > 0 && item.genres.map(g => g.name).join(', ')}
                      </td>
                      <td>
                        <Button
                          variant="warning"
                          onClick={() => {
                            setPromotionData({
                              ...item,
                              products: item.products?.map(p => typeof p === "string" ? p : p._id),
                              genres: item.genres?.map(g => typeof g === "string" ? g : g._id),
                              authors: item.authors?.map(a => typeof a === "string" ? a : a._id),
                              publishers: item.publishers?.map(pu => typeof pu === "string" ? pu : pu._id),
                              start: item.start ? item.start.slice(0, 10) : "",
                              end: item.end ? item.end.slice(0, 10) : "",
                            });
                            setSelectedId(item._id);
                            setShowUpdateModal(true);
                          }}
                        >
                          <FaEdit />
                        </Button>
                      </td>
                      <td>
                        <Button
                          variant="danger"
                          onClick={() => {
                            setSelectedId(item._id);
                            setShowDeleteModal(true);
                          }}
                        >
                          <FaTrashAlt />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>Không có chương trình nào!</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>
      </Col>
    </Row>
  );
}