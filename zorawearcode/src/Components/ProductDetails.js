import React, { useState } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import { useMediaQuery } from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ProductCarousel from "./ProductCarousel";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import LoadingOverlay from "./LoadingOverlay";
import { useContext } from "react";
import { UserContext } from "./UserContext";
import StarRating from "./StarRating";
import Default from "../Assets/default.jpeg";
import services from "../Appwrite/Service";
import { copyStringIntoBuffer } from "pdf-lib";

const CustomSelect = ({ options, selectedValue, setSelectedValue }) => {
  const [isActive, setIsActive] = useState(false);

  const handleToggle = () => {
    setIsActive(!isActive);
  };

  const handleSelect = (size) => {
    setSelectedValue(size);
    setIsActive(false);
  };

  const getQuantityClass = (quantity) => {
    if (quantity === 0) {
      return "quantity-out-of-stock";
    } else if (quantity >= 1) {
      return "quantity-high";
    }
  };

  const getQuantityText = (quantity) => {
    if (quantity === 0) {
      return "Out of stock!";
    } else if (quantity >= 1) {
      return `In stock`;
    }
  };

  return (
    <div className={`custom-select ${isActive ? "active" : ""}`}>
      <button
        className="select-button"
        role="combobox"
        aria-label="Select size"
        aria-haspopup="listbox"
        aria-expanded={isActive}
        onClick={handleToggle}
      >
        <span className="selected-value">{selectedValue}</span>
        <span className="arrow"></span>
      </button>
      {isActive && (
        <ul className="select-dropdown" role="listbox" id="select-dropdown">
          {options.map((option, index) => (
            <li
              role="option"
              key={index}
              onClick={() => handleSelect(option.size)}
            >
              <input
                type="radio"
                id={option.id}
                name="size"
                value={option.size}
                checked={selectedValue === option.size}
                onChange={() => handleSelect(option.size)}
              />
              <label htmlFor={option.id}>
                <p>{option.size}</p>
                <p className={getQuantityClass(option.quantity)}>
                  {getQuantityText(option.quantity)}
                </p>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const ProductDetails = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [averageRating, setAverageRating] = useState(0);
  const [globalRatings, setGlobalRatings] = useState(0);
  const { productId } = useParams();
  const [product, setProduct] = useState({}); // State to store product details
  const [options, setOptions] = useState([]);
  // const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await services.fetchProductById(productId);
        setProduct(productData);

        if (productData) {
          let productSizeQuantity = JSON.parse(productData.productSizeQuantity);

          const sizeOrder = ["S", "M", "L", "XL", "XXL", "XXXL"];

          const availableSizes = Object.keys(productSizeQuantity);

          const orderedSizes = sizeOrder.filter((size) =>
            availableSizes.includes(size)
          );

          const updatedOptions = orderedSizes.map((size) => ({
            id: size,
            quantity: productSizeQuantity[size],
            size: size,
          }));
          setOptions(updatedOptions);
        }
      //  setColors(product.colors);
        const brand = productData.productBrand;
        const category = productData.category;

        const similarProductsData = await services.fetchSimilarProductsByBrand(
          brand,
          productId
        );
        setSimilarProducts(similarProductsData);

        const recommendedProductsData =
          await services.fetchRecommendedProductsByCategory(
            category,
            productId
          );
        setRecommendedProducts(recommendedProductsData);
        await services.updateViewedProducts(user.$id, productId);
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    };
    const fetchReviews = async () => {
      try {
        const { ModifiedReviews, Reviews } = await services.fetchReviews(
          productId
        );
        setReviews(ModifiedReviews);
        if (Reviews.length > 0) {
          setGlobalRatings(Reviews.length);
          let totalRatings = 0;
          Reviews.map((el) => {
            totalRatings += el.rating;
          });
          const averageRating = totalRatings / Reviews.length || null;
          setAverageRating(averageRating);
        } else {
          console.log("Some error");
        }
      } catch (error) {
        console.log("Error fetching review!");
      }
    };
    fetchProduct();
    fetchReviews();
  }, [productId]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      if (!user) {
        toast.warn("User is not authenticated. Please log in.", {
          autoClose: 1500,
        });
        return;
      }
      if (product.category == "bags" || product.category == "watches") {
        let userdata = await services.getUserData(user.$id);
        await services.addToCart(userdata, productId, selectedValue);
        return;
      }
      const selectedOption = options.find(
        (option) => option.size === selectedValue
      );
      if (!selectedOption || selectedOption.quantity === 0) {
        toast.warn("Selected size is out of stock!", {
          autoClose: 1500,
        });
        return;
      }
    
     // if (selectedColor == "Choose your color") {
       // toast.warn("Choose a color!", {
     //     autoClose: 1500,
     //   });
   //     return;
    //  }
      // let userdata = await services.getUserData(user.$id);
      // await services.addToCart(
      //   userdata,
      //   productId,
      //   selectedValue,
      //   //selectedColor
      // );
    } catch (error) {
      toast.warn(error.message, { autoClose: 1500 });
    } finally {
      setAddingToCart(false);
    }
  }

  const isMobile = useMediaQuery("(max-width: 768px)");
  const [selectedValue, setSelectedValue] = useState("Choose your size");
  // const [selectedColor, setSelectedColors] = useState("Choose your color");

  const show = !isMobile;
  const currentDate = new Date();
  const deliveryDate = new Date(currentDate);
  deliveryDate.setDate(deliveryDate.getDate() + 7);

  const formattedDeliveryDate = deliveryDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

  const handleWriteReviewClick = () => {
    if (user) {
      navigate(`/createreview/${productId}`);
    } else {
      toast.warn("Please logIn to write a review.", {
        autoClose: 1500,
      });
    }
  };

  useEffect(() => {
    const updateProductRating = async () => {
      try {
        await services.updateProductRatings(
          productId,
          averageRating,
          globalRatings
        );
      } catch (error) {
        throw error;
      }
    };

    if (averageRating !== 0) {
      updateProductRating();
    }
  }, [averageRating, productId]);

  // const handleColorChange = (e) => {
  //   setSelectedColors(e.target.value);
  // };

  if (loading) {
    return <LoadingOverlay visible={loading} />;
  }

  return (
    <div id="productDetailContainer">
      <div id="productDataInfo">
        <div className="productImages">
          <Carousel
            showThumbs={show}
            showArrows={show}
            thumbWidth={60}
            renderArrowPrev={(onClickHandler, hasPrev, label) =>
              hasPrev && (
                <button
                  type="button"
                  onClick={onClickHandler}
                  style={{
                    left: "20px",
                    width: "80px",
                    height: "150px",
                    boxShadow: "none",
                    background: "rgb(245, 245, 245)",
                    cursor: "pointer",
                    borderRadius: "5px",
                    border: "none",
                    outline: "none",
                    zIndex: "999",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ChevronLeftIcon
                    style={{ fontSize: "80px", color: "rgb(166, 166, 166)" }}
                  />
                </button>
              )
            }
            renderArrowNext={(onClickHandler, hasNext, label) =>
              hasNext && (
                <button
                  type="button"
                  onClick={onClickHandler}
                  style={{
                    right: "50px",
                    width: "80px",
                    height: "150px",
                    boxShadow: "none",
                    background: "rgb(245, 245, 245)",
                    cursor: "pointer",
                    borderRadius: "5px",
                    border: "none",
                    outline: "none",
                    zIndex: "999",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: "20px",
                  }}
                >
                  <ChevronRightIcon
                    style={{ fontSize: "80px", color: "rgb(166, 166, 166)" }}
                  />
                </button>
              )
            }
          >
            {product.productImages.map((image, index) => {
              return (
                <div key={index}>
                  <img src={image} alt="Image" />
                </div>
              );
            })}
          </Carousel>
        </div>
        <div className="productInfo">
          <h1 style={{ fontWeight: "lighter" }}> {product.productBrand}</h1>
          <p style={{ fontSize: "15px", marginTop: "5px" }}>
            {product.productName}
          </p>
          <p style={{ margin: "20px 0 4px 0", fontSize: "24px" }}>
            {`₹${Math.round(
              product.productSalePrice -
                (product.productSalePrice * product.productDiscount) / 100
            )}`}
            <span
              style={{
                fontSize: "20px",
                marginLeft: "10px",
                color: "#474747",
              }}
            >
              <s>{`₹${product.productSalePrice}`}</s>
            </span>
          </p>
          <p style={{ fontSize: "12px", color: "grey", marginBottom: "20px" }}>
            Free delivery by
            <span style={{ color: "black" }}>
              {" " + formattedDeliveryDate}
            </span>
          </p>
          {product.category !== "watches" && product.category !== "bags" && (
            <CustomSelect
              options={options}
              selectedValue={selectedValue}
              setSelectedValue={setSelectedValue}
            />
          )}
          <button onClick={handleAddToCart} className="add_To_Cart_Btn">
            <ShoppingCartOutlinedIcon />
            {addingToCart ? "Adding to cart..." : "Add to cart"}
          </button>
          <div className="divider"></div>
          <div className="productDescriptionMainDiv">
            <h3>Description</h3>
            <p style={{ fontSize: "15px", lineHeight: "20px" }}>
              {product.description}
            </p>
          </div>
          <div className="productDetailMainDiv">
            <h3>Product Details</h3>
            <ul>
              {product.fabric && (
                <li>
                  <span className="productDetailKey">Fabric</span>
                  <span className="productDetailValue">{product.fabric}</span>
                </li>
              )}
              {product.salesPackage && (
                <li>
                  <span className="productDetailKey">Sales Package</span>
                  <span className="productDetailValue">
                    {product.salesPackage}
                  </span>
                </li>
              )}
              {product.color && (
                <li>
                  <span className="productDetailKey">Color</span>
                  <span className="productDetailValue">{product.color}</span>
                </li>
              )}
              {product.category && (
                <li>
                  <span className="productDetailKey">Category</span>
                  <span className="productDetailValue">{product.category}</span>
                </li>
              )}
              {product.topType && (
                <li>
                  <span className="productDetailKey">Top type</span>
                  <span className="productDetailValue">{product.topType}</span>
                </li>
              )}
              {product.pattern && (
                <li>
                  <span className="productDetailKey">Pattern</span>
                  <span className="productDetailValue">{product.pattern}</span>
                </li>
              )}
              {product.occasion && (
                <li>
                  <span className="productDetailKey">Occasion</span>
                  <span className="productDetailValue">{product.occasion}</span>
                </li>
              )}
            </ul>
          </div>
          <div className="returnandrefundpolicyinfo">
            <h3>Returns & Exchange Information</h3>
            <ul>
              <li>
                Hassle-free returns within 7 days; specific conditions apply
                based on products and promotions.
              </li>
              <li>
                Issues with defective, incorrect, or damaged products must be
                reported within 24 hours of delivery.
              </li>
              <li>
                Customer must send 360 degree unboxing video of the product.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div id="productReviewMain">
        <div className="productReviewLeft">
          <div className="productStarRating">
            <h3>Customer Reviews</h3>
            {averageRating !== null ? (
              <div>
                <div className="starAndText">
                  <StarRating rating={averageRating} />
                  <p>{averageRating.toFixed(1)} out of 5</p>
                </div>
                <p>{globalRatings} global ratings</p>
              </div>
            ) : (
              <div>
                <div className="starAndText">
                  <StarRating rating={0} />
                  <p>0 out of 5</p>
                </div>
                <p>0 global ratings</p>
              </div>
            )}
          </div>
          <div className="productReviewFormLink">
            <h3>Review this product</h3>
            <p>Share your thoughts with other customers</p>
            <button onClick={handleWriteReviewClick}>
              Write a product review
            </button>
          </div>
        </div>
        <div className="productReviewRight">
          <h2>Reviews</h2>
          <div className="productReviewsMainDiv">
            {reviews ? (
              reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <div key={index} className="productReviewsByPeople">
                    <div className="productReviewsByPeopleTop">
                      <img src={review.userdp || Default} alt="user" />
                      <h4>{review.userName}</h4>
                    </div>
                    <div className="productRatingAndHeadline">
                      <StarRating rating={review.rating} />
                      <p>{review.headline}</p>
                    </div>
                    <p className="reviewDate">
                      Reviewed on {review.reviewedDate}
                    </p>
                    <p className="commentMessage">{review.comment}</p>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    width: "100%",
                    minHeight: "30vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "rgb(225, 0, 0)",
                    fontSize: "18px",
                  }}
                >
                  No reviews yet. Be the first one to write a review!
                </div>
              )
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
      <ProductCarousel title="Similar Products" products={similarProducts} />
      <ProductCarousel
        title="Recommended Products"
        products={recommendedProducts}
      />
    </div>
  );
};

export default ProductDetails;
