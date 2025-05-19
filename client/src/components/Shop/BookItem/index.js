import styles from "./BookItem.module.css";
import format from "../../../helper/format";
import { Link } from "react-router-dom";

function BookItem({ data, promotion, boxShadow }) {
  const { price, discount, discountType, slug, imageUrl, name, author } = data;

  // Tính giá và badge giảm giá
  let displayPrice = price;
  let displayDiscount = discount;
  let displayDiscountType = discountType;

  if (promotion) {
    displayDiscount = promotion.value;
    displayDiscountType = promotion.discountType;
    if (promotion.discountType === "percent") {
      displayPrice = price - price * promotion.value / 100;
    } else if (promotion.discountType === "amount") {
      displayPrice = price - promotion.value;
    } else if (promotion.discountType === "fixed") {
      displayPrice = promotion.value;
    }
  } else if (discount > 0) {
    if (discountType === "percent" || !discountType) {
      displayPrice = price - price * discount / 100;
    } else if (discountType === "amount") {
      displayPrice = price - discount;
    } else if (discountType === "fixed") {
      displayPrice = discount;
    }
  }

  return (
    <div className={`${styles.bookItem} ${boxShadow && styles.shadow}`}>
      {(promotion || (discount && discount > 0)) && (
        <div className={styles.discount}>
          {displayDiscountType === "percent" && `-${displayDiscount}%`}
          {displayDiscountType === "amount" && `-${format.formatPrice(displayDiscount)}`}
          {displayDiscountType === "fixed" && "Đồng giá"}
        </div>
      )}
      <div className={styles.card}>
        <Link to={`/chi-tiet-san-pham/${slug}`} className={styles.bookInfo}>
          <img variant="top" src={imageUrl} alt={name} />
          <p className={styles.name}>
            {name} - {author?.name || (Array.isArray(author) && author[0]?.name)}
          </p>
        </Link>
       <div className={styles.cardFooter}>
          <span className={styles.price} style={{ color: "#ff424e", fontWeight: 600 }}>
            {format.formatPrice(displayPrice)}
          </span>
          {(promotion || (discount > 0)) && (
            <span className={styles.oldPrice}>{format.formatPrice(price)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookItem;