import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Spinner, Modal, Button } from "react-bootstrap";
import { FaEdit, FaTrashAlt } from "react-icons/fa"
import PaginationBookStore from "../../../components/PaginationBookStore";
import publisherApi from "../../../api/publisherApi";
import { toast } from 'react-toastify';

export default function Publisher() {
  const [publishers, setPublishers] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [publisherData, setPublisherData] = useState({
    name: '',
    slug: ''
  });
  const [publisherDelete, setPublisherDelete] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data, pagination } = await publisherApi.getAll({ page: page, limit: 10, sortByDate: "desc" });
        setLoading(false);
        setPublishers(data);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };
    fetchData();
  }, [page]);

  const handleChangePage = (page) => {
    setPage(page);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await publisherApi.delete(id);
      setPublishers(publishers.filter(item => item._id !== id));
      toast.success("Xóa nhà xuất bản thành công!");
      setLoading(false);
    } catch (error) {
      console.error("Failed to delete publisher:", error);
      toast.error("Xóa nhà xuất bản thất bại!");
      setLoading(false);
    }
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    if (!publisherData.name.trim() || !publisherData.slug.trim()) {
      toast.error("Vui lòng nhập đầy đủ tên và slug!");
      return;
    }
    try {
      setLoading(true);
      const response = await publisherApi.create({
        name: publisherData.name.trim(),
        slug: publisherData.slug.trim()
      });
      if (response && response.data) {
        setPublishers(prev => [...prev, response.data]);
        toast.success("Thêm nhà xuất bản thành công!");
        setShowAddModal(false);
        setPublisherData({ name: '', slug: '' });
        // Refresh lại danh sách
        const { data } = await publisherApi.getAll({ page, limit: 10, sortByDate: "desc" });
        setPublishers(data);
      }
      setLoading(false);
    } catch (error) {
      toast.error("Thêm nhà xuất bản thất bại!");
      setLoading(false);
    }
  }

  const handleSubmitUpdate = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await publisherApi.update(selectedId, {
        name: publisherData.name,
        slug: publisherData.slug
      })
      // Cập nhật lại state với dữ liệu từ response
      if (response.data) {
        setPublishers(publishers.map(item => 
          item._id === selectedId ? response.data : item
        ))
        toast.success("Cập nhật nhà xuất bản thành công!")
        setShowUpdateModal(false)
        // Reset form data
        setPublisherData({ name: '', slug: '' })
      }
      setLoading(false)
    } catch (error) {
      setLoading(false) 
      toast.error("Cập nhật nhà xuất bản thất bại!")
      console.log(error)
    }
  }

  return (
    <Row>
      <Modal size="lg" show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
        <Modal.Header closeButton>
        <Modal.Title>Cập nhật nhà xuất bản</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmitUpdate}>
            <Row>
              <Col xl={4}>
                <label>Tên nhà xuất bản</label>
                <input required type="text" value={publisherData?.name || ''} className="form-control"
                  onChange={(e) => setPublisherData((prev) => { return { ...prev, name: e.target.value } })}
                />
              </Col>
              <Col xl={4}>
                <label>Slug</label>
                <input required type="text" value={publisherData?.slug || ''} className="form-control"
                  onChange={(e) => setPublisherData((prev) => { return { ...prev, slug: e.target.value } })}
                />
              </Col>
            </Row>
            <Button disabled={loading} type="submit" variant="danger" className="mt-2">
              Lưu
            </Button>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
            Hủy
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal size="lg" show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
        <Modal.Title>Thêm nhà xuất bản</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmitAdd}>
            <Row>
              <Col xl={6}>
                <label>Tên nhà xuất bản</label>
                <input
                  required
                  type="text"
                  className="form-control"
                  value={publisherData.name}
                  onChange={e => setPublisherData(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                />
              </Col>
              <Col xl={6}>
                <label>Slug</label>
                <input
                  required
                  type="text"
                  className="form-control"
                  value={publisherData.slug}
                  onChange={e => setPublisherData(prev => ({
                    ...prev,
                    slug: e.target.value
                  }))}
                />
              </Col>
            </Row>
            <div className="mt-3">
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !publisherData.name || !publisherData.slug}
              >
                {loading ? 'Đang xử lý...' : 'Thêm mới'}
              </Button>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Hủy
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal size="lg" show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn xóa nhà xuất bản này?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              handleDelete(selectedId);
              setShowDeleteModal(false);
            }}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Xóa'}
          </Button>
        </Modal.Footer>
      </Modal>
      <Col xl={12}>
        <div className="admin-content-wrapper">
          <div className="admin-content-header">Danh sách nhà xuất bản</div>
          <div className="admin-content-action">
            <div className="d-flex">
              <button type="button" className="btn btn-success ms-auto" onClick={() => {
                setPublisherData({ name: '', slug: '' });
                setShowAddModal(true);
              }}>Thêm Nhà xuất bản</button>
            </div>
          </div>
          <div className="admin-content-body">
            <Table hover>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Thể loại</th>
                  <th >Slug</th>
                  <th colSpan="2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3}>
                      <Spinner
                        animation="border"
                        variant="success"
                      />
                    </td>
                  </tr>
                ) : publishers && publishers.length > 0 ? (
                  publishers.map((item, index) => {
                    return (
                      <tr key={item._id}>
                        <td>{(1 && page - 1) * 10 + (index + 1)}</td>
                        <td>
                          {item.name}
                        </td>
                        <td>{item.slug}</td>
                        <td>
                          <Button
                            variant="warning"
                            onClick={() => {
                              setPublisherData(item)
                              setSelectedId(item._id)
                              setShowUpdateModal(true)
                            }}
                          >
                            <FaEdit />
                          </Button>
                        </td>
                        <td>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => {
                              setSelectedId(item._id);
                              setShowDeleteModal(true);
                            }}
                          >
                            <FaTrashAlt />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6}>Không có sản phẩm nào!</td>
                  </tr>
                )}
              </tbody>
            </Table>
            <div className="admin-content-pagination">
              <Row>
                <Col xl={12}>
                  {publishers.length > 1 ? (
                    <PaginationBookStore
                      totalPage={publishers.length}
                      currentPage={page}
                      onChangePage={handleChangePage}
                    />
                  ) : null}
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
}
