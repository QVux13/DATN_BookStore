import { Container, Row, Col } from "react-bootstrap";
import bookApi from "../../api/bookApi";
import promotionApi from "../../api/promotionApi";
import { useEffect, useState } from "react";
import styles from './Home.module.css'
import Loading from "../../components/Loading"
import logo from "../../assets/images/logo.png";
import format from "../../helper/format";
import { Link } from "react-router-dom";

function Home() {
  const [books, setBooks] = useState([])
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await bookApi.getAll({page: 1, limit: 6})
        setBooks(data)
      } catch (error) {
        console.log(error)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    // Lấy danh sách khuyến mãi
    const fetchPromotions = async () => {
      try {
        const res = await promotionApi.getAll();
        setPromotions(res.data || res);
      } catch (error) {
        setPromotions([]);
      }
    };
    fetchPromotions();
  }, []);

  const getPromotionForBook = (bookId) => {
    const now = new Date();
    return promotions.find(promo =>
      promo.isActive &&
      new Date(promo.start) <= now &&
      new Date(promo.end) >= now &&
      promo.products?.some(p => (typeof p === "string" ? p : p._id) === bookId)
    );
  };

  const renderBook = (book) => {
  const {
    _id,
    slug,
    name = "Không có tên",
    imageUrl,
    price = 0,
    finalPrice, // lấy finalPrice từ backend nếu có
    author
  } = book;

  // Nếu có finalPrice và nhỏ hơn giá gốc thì hiển thị giảm giá
  let displayPrice = typeof finalPrice === "number" && finalPrice < price ? finalPrice : price;
  let displayDiscount = 0;

  if (typeof finalPrice === "number" && finalPrice < price) {
    displayDiscount = Math.round((1 - finalPrice / price) * 100);
  }

  const detailUrl = slug ? `/chi-tiet-san-pham/${slug}` : `/chi-tiet-san-pham/${_id}`;

  return (
    <Col xl={2} xs={6} key={_id}>
      <Link to={detailUrl} className={styles.bookLink}>
        <div className={styles.bookItem}>
          {displayDiscount > 0 && (
            <div className={styles.discountTag}>-{displayDiscount}%</div>
          )}
          <div className={styles.card}>
            <img
              className={styles.bookImage}
              src={imageUrl || logo}
              alt={name}
              onError={e => { e.target.onerror = null; e.target.src = logo; }}
            />
            <div className={styles.bookInfo}>
              <p className={styles.bookName}>{name}</p>
              {author && (author.name || (Array.isArray(author) && author[0]?.name)) && (
                <p className={styles.bookAuthor}>
                  {author.name || author[0]?.name}
                </p>
              )}
            </div>
            <div className={styles.priceGroup}>
              <span className={styles.price}>{format.formatPrice(displayPrice)}</span>
              {displayDiscount > 0 && (
                <span className={styles.oldPrice}>
                  {format.formatPrice(price)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </Col>
  );
};

  return (
    <div className="main">
      <Container>
        <div className={styles.booksList}>
          <div className={styles.title}>
            <h2 className={styles.titleHeading}>Sản phẩm mới nhất</h2>
          </div>
          <Row className={styles.row}>
            {books && books.length > 0 ? (
              books.map(renderBook)
            ) : <Loading />}
          </Row>
        </div>
      </Container>
    </div>
  );
}

export default Home;
