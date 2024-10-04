import React from "react";
import { Link } from "react-router-dom";

const ProductCarousel = ({ title, products }) => {


  console.log("Products",products);
  return (
    <div
      className="newArrivalsMain"
      style={{ marginTop: title !== "New arrivals" ? "5px" : "25px" }}
    >
      <h2>{title}</h2>
      <div className="newArrivalsClothes">
        {products.map((product, index) => (
          <Link
            key={index}
            to={`/${product.category}/${product.productId}`}
            className="newArrivalEachDiv"
          >
            {/* <div key={index} className="newArrivalEachDiv"> */}
            <div className="newClotheImgDiv">
              <img src={product.productImages.length>0?product.productImages[0]:"Image not found"} alt={product.productName} />
            </div>
            <div className="newClotheInfoDiv">
              <p className="newClotheBrand">{product.productBrand}</p>
              <p className="newClotheTitle">{product.productName}</p>
              {title !== "You might also like" && (
                <h2 className="newClothePrice">
                  {`₹${product.productSalePrice}`}
                  <span>Onwards</span>
                </h2>
              )}
            </div>
            {/* </div> */}
          </Link>
        
        ))}
      </div>
    </div>
  );
};

export default ProductCarousel;
