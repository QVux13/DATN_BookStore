import React from 'react';
import styles from './Product.module.css'

const formatPrice = (price) => {
  return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

const Product = ({item}) => {
  const { price, discount = 0 } = item;
  const newPrice = discount > 0 ? price - (price * discount / 100) : price;

  return (
    <div className={styles.container}>
      <img className={styles.Image} alt="" src={item.image} />
      <p className={styles.name}>{item.name}</p>
      <p className={styles.price}>
        {formatPrice(newPrice)}
        {discount > 0 && (
          <span className={styles.oldPrice} style={{ textDecoration: 'line-through', marginLeft: 8 }}>
            {formatPrice(price)}
          </span>
        )}
      </p>
    </div>
  )
}
export default Product
