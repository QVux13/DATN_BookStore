import React, {useEffect, useState} from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { AiOutlineMinus, AiOutlinePlus, AiOutlineShoppingCart } from 'react-icons/ai'
import { toast } from 'react-toastify';

import DetailedBookInfo from '../../components/Shop/DetailedBookInfo'
import Loading from "../../components/Loading"

import { useNavigate, useParams } from 'react-router-dom';
import bookApi from "../../api/bookApi";
import userApi from "../../api/userApi";
import promotionApi from '../../api/promotionApi';
import { addToCart } from "../../redux/actions/cart"
import { useDispatch, useSelector } from "react-redux"
import format from "../../helper/format";
import styles from './ProductDetail.module.css'
import logo from "../../assets/images/logo.png";

export default function ProductDetail() {

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const params = useParams()
  const { slug } = params

  const cartData = useSelector((state) => state.cart);
  const currentUser = useSelector((state) => state.auth);

  const [bookData, setBookData] = useState({})
  const [loading, setLoading] = useState(false)
  const [quantity, setQuantity] = useState(1);
  const [promotion, setPromotion] = useState(null);

  useEffect(() => {
    const addToCart = async() => {
      try {
        const { list } = cartData
        const newList = list.map(item => {
          return { product: item.product._id, quantity: item.quantity }
        })
        await userApi.updateCart(currentUser.userId, {cart: newList})
      } catch (error) {
        console.log(error)
      }
    }
    if (currentUser && currentUser.userId) {
      addToCart()
    }
  }, [cartData, currentUser])

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true)
        const res = await bookApi.getBySlug(slug);
        setBookData(res.data)
        setLoading(false)
      } catch (error) {
        setLoading(false)
        console.log(error);
      }
    };
    fetchBook();
  }, [slug]);

    // Lấy promotion cho sản phẩm này
  useEffect(() => {
    const fetchPromotion = async () => {
      if (!bookData._id) return;
      try {
        const res = await promotionApi.getAll();
        const now = new Date();
        const promo = (res.data || res).find(p =>
          p.isActive &&
          new Date(p.start) <= now &&
          new Date(p.end) >= now &&
          p.products?.some(pr => (typeof pr === "string" ? pr : pr._id) === bookData._id)
        );
        setPromotion(promo || null);
      } catch (error) {
        setPromotion(null);
      }
    };
    fetchPromotion();
  }, [bookData._id]);

  // Sử dụng promotion nếu có
  const renderPrice = () => {
    let discountType = bookData.discountType;
    let discountValue = bookData.discount;
    let price = bookData.price;
    let finalPrice = price;

    if (promotion) {
      discountType = promotion.discountType;
      discountValue = promotion.value;
      if (discountType === "percent") {
        finalPrice = price - price * discountValue / 100;
      } else if (discountType === "amount") {
        finalPrice = price - discountValue;
      } else if (discountType === "fixed") {
        finalPrice = discountValue;
      }
    } else if (discountValue > 0) {
      if (discountType === "percent") {
        finalPrice = price - price * discountValue / 100;
      } else if (discountType === "amount") {
        finalPrice = price - discountValue;
      } else if (discountType === "fixed") {
        finalPrice = discountValue;
      }
    }

    if (discountValue > 0 || promotion) {
      return (
        <div className={styles.priceBox}>
          <span className={styles.finalPrice}>{format.formatPrice(finalPrice)}</span>
          <span className={styles.oldPrice}>{format.formatPrice(price)}</span>
          <span className={styles.discountTag}>
            {discountType === "percent" && `-${discountValue}%`}
            {discountType === "amount" && `-${format.formatPrice(discountValue)}`}
            {discountType === "fixed" && "Đồng giá"}
          </span>
        </div>
      );
    }
    return <span className={styles.finalPrice}>{format.formatPrice(price)}</span>;
  };

  const decQuantity = () => {
    if(quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const incQuantity = () => {
    setQuantity(parseInt(quantity + 1))
  }

  const handleChange = (e) => {
    const newQuantity = parseInt(e.target.value)
    if(newQuantity){
      setQuantity(newQuantity)
    }
    else {
      setQuantity('')
    }
  }

  const handleAddToCart = () => {
  if (currentUser && currentUser.userId) {
    const { _id: productId, name, imageUrl, slug, price, discount, discountType } = bookData;
    // Lưu giá gốc và thông tin giảm giá, KHÔNG lưu giá đã giảm
    const action = addToCart({
      quantity,
      productId,
      name,
      imageUrl,
      slug,
      price,           // giá gốc
      discount,        // giá trị giảm giá
      discountType     // kiểu giảm giá
    });
    dispatch(action);
    toast.success('Thêm sản phẩm vào giỏ hàng thành công!', {autoClose: 2000});
  } else {
    toast.info('Vui lòng đăng nhập để thực hiện!', {autoClose: 2000});
  }
}

const handleBuyNow = () => {
  if (currentUser && currentUser.userId) {
    const { _id: productId, name, imageUrl, slug, price, discount, discountType } = bookData;
    const action = addToCart({
      quantity,
      productId,
      name,
      imageUrl,
      slug,
      price,
      discount,
      discountType
    });
    dispatch(action);
    navigate({ pathname: "/gio-hang" });
  } else {
    toast.info('Vui lòng đăng nhập để thực hiện!', {autoClose: 2000});
  }
}

  return (
    <div className="main">
      <Container>
        {!loading ?
        <Row className={styles.productBriefing}>
          <Col xl={5} xs={12}>
            <div className={styles.imgBriefing}>
              <img
                src={bookData.imageUrl || logo}
                alt={bookData.name}
                className={styles.productImage}
                onError={e => { e.target.onerror = null; e.target.src = logo; }}
              />
              {(promotion || bookData.discount > 0) && (
                <div className={styles.discountBadge}>
                  {promotion
                    ? (
                        promotion.discountType === "percent"
                          ? `-${promotion.value}%`
                          : promotion.discountType === "amount"
                            ? `-${format.formatPrice(promotion.value)}`
                            : promotion.discountType === "fixed"
                              ? "Đồng giá"
                              : ""
                      )
                    : (
                        bookData.discountType === "percent"
                          ? `-${bookData.discount}%`
                          : bookData.discountType === "amount"
                            ? `-${format.formatPrice(bookData.discount)}`
                            : bookData.discountType === "fixed"
                              ? "Đồng giá"
                              : ""
                      )
                  }
                </div>
              )}
            </div>
          </Col>
          <Col xl={7}>
            <div className={styles.infoBriefing}>
              <h2 className={styles.productName}>{bookData.name}</h2>
              {renderPrice()}
              <div className={styles.itemBriefing}>
                <span className={styles.textBold}>Tác giả:</span>
                <span className={styles.author}>{format.arrayToString(bookData?.author || [])}</span>
              </div>
              <div className={styles.itemBriefing}>
                <span className={styles.textBold}>Nhà xuất bản:</span>
                <span className={styles.author}>
                  {bookData.publisher?.name} {bookData.year && `- ${bookData.year}`}
                </span>
              </div>
              <div className={styles.itemBriefing}>
                <span className={styles.textBold}>Mô tả:</span>
                <span dangerouslySetInnerHTML={{__html:bookData?.description}} />
              </div>
              <div className={styles.itemBriefing}>
                <span className={styles.textBold}>Số lượng:</span>
                <div className={styles.quantityGroup}>
                  <button className={styles.descreaseBtn} onClick={decQuantity}>
                    <AiOutlineMinus />
                  </button>
                  <input type="text" className={styles.quantityInput} value={quantity} onChange={handleChange} />
                  <button className={styles.increaseBtn} onClick={incQuantity}>
                    <AiOutlinePlus />
                  </button>
                </div>
              </div>
              <div className={styles.actions}>
                <button className={styles.addToCartBtn} onClick={handleAddToCart}>
                  <AiOutlineShoppingCart className={styles.addToCartIcon} />
                  Thêm vào giỏ hàng
                </button>
                <button className={styles.buyBtn} onClick={handleBuyNow}>Mua ngay</button>
              </div>
            </div>
          </Col>
          <DetailedBookInfo data={bookData} />
        </Row> : <Loading />}
      </Container>
    </div>
  )
}