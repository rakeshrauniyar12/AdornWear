import AddIcon from "@mui/icons-material/Add";
import { toast } from "react-toastify";
import RemoveIcon from "@mui/icons-material/Remove";
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "./UserContext";
import LoadingOverlay from "./LoadingOverlay";
import { useNavigate } from "react-router-dom";
import services from "../Appwrite/Service";

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [cartProducts, setCartProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingProduct, setRemovingProduct] = useState(null);

  useEffect(() => {
    let fetchCartItems = async () => {
      try {
        let userData = await services.getUserData(user.$id);

        let carts = await services.fetchCartProducts(userData);
        let productPromises = carts.cartProduct_Id.map(async (pro) => {
          let product = await services.fetchProductById(pro.product_id);
          return {
            cartProductId: pro.$id,
            cartProductQuantity: pro.cartProductQuantity,
            cartProductSize: pro.cartProductSize,
            selectedColor: pro.selectedColor,
            products: product,
          };
        });

        let productsArray = await Promise.all(productPromises);
        setCartProducts(productsArray);
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    };
    fetchCartItems();
  }, [user]);

  const handleRemoveProduct = async (cartProductId) => {
    setRemovingProduct(cartProductId);
    let userData = await services.getUserData(user.$id);
    try {
      await services.removeCartProduct(userData.carts_id.$id, cartProductId);
      setCartProducts(
        cartProducts.filter(
          (product) => product.cartProductId !== cartProductId
        )
      );
      toast.success("Product has been removed.", { autoClose: 1500 });
    } catch (error) {
      toast.error("Error removing product: " + error.message, {
        autoClose: 1500,
      });
    } finally {
      setRemovingProduct(null);
    }
  };

  const handleQuantityChange = async (cartProductId, change) => {
    const product = cartProducts.find((p) => p.cartProductId === cartProductId);
    const newQuantity = product.cartProductQuantity + change;
    if (newQuantity < 1) {
      toast.warn("Quantity can not be less than 1.", { autoClose: 1500 });
      return;
    }
    let checkQuantity = JSON.parse(product.products.productSizeQuantity)[
      product.cartProductSize
    ];
    if (newQuantity > checkQuantity) {
      toast.warn("Quantity exceeds limit");
      return;
    }
    try {
      await services.updateCartProductQuantity(cartProductId, newQuantity);
      setCartProducts(
        cartProducts.map((product) =>
          product.cartProductId === cartProductId
            ? { ...product, cartProductQuantity: newQuantity }
            : product
        )
      );
    } catch (error) {
      toast.error("Error updating product quantity: " + error.message, {
        autoClose: 1500,
      });
    }
  };

  const calculateSubtotal = () => {
    let subtotal = 0;
    cartProducts.forEach((product) => {
      const discountedPrice =
        Math.round(
          product.products.productSalePrice -
            (product.products.productSalePrice *
              product.products.productDiscount) /
              100
        ) -
        0.12 *
          Math.round(
            product.products.productSalePrice -
              (product.products.productSalePrice *
                product.products.productDiscount) /
                100
          );
      subtotal += discountedPrice * product.cartProductQuantity;
    });
    return subtotal;
  };

  const calculateSGST = () => {
    let sgst = 0;
    cartProducts.forEach((product) => {
      sgst +=
        0.06 *
        Math.round(
          product.products.productSalePrice -
            (product.products.productSalePrice *
              product.products.productDiscount) /
              100
        ) *
        product.cartProductQuantity;
    });
    return sgst;
  };

  const calculateCGST = () => {
    let cgst = 0;
    cartProducts.forEach((product) => {
      cgst +=
        0.06 *
        Math.round(
          product.products.productSalePrice -
            (product.products.productSalePrice *
              product.products.productDiscount) /
              100
        ) *
        product.cartProductQuantity;
    });
    return cgst;
  };

  const subtotal = calculateSubtotal();
  const sgst = calculateSGST();
  const cgst = calculateCGST();
  const total = subtotal + sgst + cgst;

  const handleCheckout = () => {
    if (cartProducts.length === 0) {
      toast.warn("Cart is empty", { autoClose: 1500 });
      return;
    }
    navigate("/checkout", { state: { total, cartProducts } });
  };

  return (
    <>
      <LoadingOverlay visible={loading || !!removingProduct} />
      <h1 className="cart-h1">My Cart</h1>
      {loading ? null : (
        <div className="cart-main">
          {cartProducts.length === 0 ? (
            <div className="cfirst">
              <div className="cartemptytext">
                <h2>Your cart is empty!</h2>
              </div>
            </div>
          ) : (
            <div className="cfirst">
              {cartProducts.map((product, index) => (
                <div key={index} className="childDiv">
                  <div className="cartImg">
                    <img
                      src={product.products.productImages[0]}
                      alt={product.products.productName}
                    />
                  </div>
                  <div className="cDiv">
                    <div className="cdiv-first">
                      <p className="cTitle">
                        {product.products.productName.substring(0, 34) + "..."}
                      </p>
                      <p className="cColor">Color: {product.selectedColor}</p>
                      <p style={{ fontSize: "13px", color: "grey" }}>
                        Size: {product.cartProductSize}
                      </p>
                      <p className="smallDevicePrice">
                        {`₹${Math.round(
                          product.products.productSalePrice * 0.95
                        )}`}
                        <span style={{ fontSize: "12px", marginLeft: "5px" }}>
                          <s>{`₹${product.products.productSalePrice}`}</s>
                        </span>
                      </p>
                    </div>
                    <div className="currency">
                      <label className="currency-label">Price</label>
                      <div className="currency-dvi">
                        <p>
                          {`₹${Math.round(
                            product.products.productSalePrice * 0.95
                          )}`}
                          <span style={{ fontSize: "12px", marginLeft: "5px" }}>
                            <s>{`₹${product.products.productSalePrice}`}</s>
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="remove">
                      <div className="removeTop">
                        <label
                          style={{ fontSize: "12px", color: "grey" }}
                          className="remove-label"
                        >
                          Quantity
                        </label>
                        <div>
                          <RemoveIcon
                            className="remove-sec"
                            sx={{
                              border: "1px solid transparent",
                              borderRadius: "2px",
                              backgroundColor: "#AF682E",
                              color: "white",
                              fontSize: "19px",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              handleQuantityChange(product.cartProductId, -1)
                            }
                          />
                          <p className="remove-sec">
                            {product.cartProductQuantity}
                          </p>
                          <AddIcon
                            className="remove-sec"
                            sx={{
                              border: "1px solid transparent",
                              borderRadius: "2px",
                              backgroundColor: "#AF682E",
                              color: "white",
                              fontSize: "19px",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              handleQuantityChange(product.cartProductId, 1)
                            }
                          />
                        </div>
                      </div>
                      <div className="removeBottom">
                        <p
                          className="remove-button"
                          onClick={() =>
                            handleRemoveProduct(product.cartProductId)
                          }
                        >
                          Remove
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="sec_cart">
            <div className="sec-cart-p">
              <p>Summary</p>
            </div>
            <div className="u1">
              <div>
                <p>Subtotal</p>
                <p>{subtotal.toFixed(2)}</p>
              </div>
              <div>
                <p>SGST 6%</p>
                <p>{sgst.toFixed(2)}</p>
              </div>
              <div>
                <p>CGST 6%</p>
                <p>{cgst.toFixed(2)}</p>
              </div>
              <div className="order_border"></div>
              <div className="total-price">
                <h3>Total:</h3>
                <p>{total.toFixed(2)}</p>
              </div>
              <button className="checkout" onClick={handleCheckout}>
                Go To Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Cart;
