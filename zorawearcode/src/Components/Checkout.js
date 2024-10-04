import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "./UserContext";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import "../Styles/Checkout.css";
import Rupay from "../Assets/rupay.png";
import Visa from "../Assets/visa.png";
import Mastercard from "../Assets/mastercard.png";
import services from "../Appwrite/Service";
import { v4 as uuidv4 } from "uuid";
import razorpay from "../Assets/razorpay.png";
import LoadingOverlay from "./LoadingOverlay";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserContext);
  const [address, setAddress] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedAddressPhoneNumber, setSelectedAddressPhoneNumber] =
    useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");

  const { total, cartProducts } = location.state || {};

  useEffect(() => {
    const fetchUserAddress = async () => {
      try {
        const addresses = await services.getAddresses(user.$id);
        setAddress(addresses);
      } catch (error) {
        toast.error("Error fetching user address!", { autoClose: 1500 });
      }
    };
    fetchUserAddress();
  }, [user]);

  const handleAddressSelect = (id) => {
    setSelectedAddressId(id);
  };
  const handleUseAddress = () => {
    const addressObj = address.find((addr) => addr.$id === selectedAddressId);
    if (addressObj) {
      setSelectedAddress(addressObj.shippingAddress);
      setSelectedAddressPhoneNumber(addressObj.mobileNumber);
      toast.success("Address selected", { autoClose: 1500 });
    } else {
      toast.warn("Please select address", { autoClose: 1500 });
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const placeYourOrder = async () => {
    if (!selectedAddressId) {
      toast.warn("Please select address", { autoClose: 1500 });
      return;
    } else if (!selectedAddress) {
      toast.warn("Please click on use this address button", {
        autoClose: 1500,
      });
      return;
    }
    if (!paymentMethod) {
      toast.warn("Please select a payment method", { autoClose: 1500 });
      return;
    }
    setPlacingOrder(true);

    if (paymentMethod === "cod") {
      async function orderCreate() {
        let productPromises = cartProducts.map(async (pro) => {
          const updatedProductSizeQuantity = JSON.parse(
            pro.products.productSizeQuantity
          );
          updatedProductSizeQuantity[pro.cartProductSize] -=
            pro.cartProductQuantity;
          let data = {
            productSizeQuantity: JSON.stringify(updatedProductSizeQuantity),
          };
          await services.updateProductQuantity(pro.products.$id, data);

          return JSON.stringify({
            productQuantity: pro.cartProductQuantity,
            productName: pro.products.productName.substring(0, 30) + "...",
            productImage: pro.products.productImages[0],
            productPrice: Math.round(
              pro.products.productSalePrice -
                (pro.products.productSalePrice * pro.products.productDiscount) /
                  100
            ),
            productSize: pro.cartProductSize,
            productColor: pro.selectedColor,
            isCancel: false,
            isReturn: false,
            returnStatus: "Approval Pending",
            productCategory: pro.products.category,
            productId: pro.products.$id,
          });
        });
        let products = await Promise.all(productPromises);
        const res = await services.addOrder({
          userId: user.$id,
          products,
          orderStatus: "Order Placed Pending",
          address: selectedAddress,
          mobileNumber: selectedAddressPhoneNumber,
          orderAmount: Math.ceil(total),
          returnAmount: 0,
          cancelAmount: 0,
          trackingId: "updated soon",
          paymentMethod,
          paymentId: "COD" + uuidv4(),
        });

        if (res === false) {
          setPlacingOrder(false);
          return;
        }

        await services.clearCart(user.$id);
        navigate("/orderplaced", { state: { selectedAddress } });
        toast.success("Order placed.");
        setPlacingOrder(false);
      }
      orderCreate();
      return;
    }

    const isRazorpayLoaded = await loadRazorpayScript();
    if (!isRazorpayLoaded) {
      toast.error("Razorpay SDK failed to load. Are you online?");
      setPlacingOrder(false);
      return;
    }

    try {
      let amount = Math.round(total * 100);

      if (isNaN(amount) || amount < 100) {
        toast.warn("The minimum amount should be ₹1", { autoClose: 1500 });
        setPlacingOrder(false);
        return;
      }
      // Call the Appwrite function to create a Razorpay order
      const response = await services.placeOrder(amount, "INR", "temp");

      const data = JSON.parse(response.responseBody);

      //  const response = await services.placeOrder(amount, "INR", "temp");

      const options = {
        key: process.env.RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "Zorawear",
        description: "Test Transaction",
        order_id: data.id,
        handler: async (response) => {
          try {
            let productPromises = cartProducts.map((pro) => {
              return JSON.stringify({
                productQuantity: pro.cartProductQuantity,
                productName: pro.products.productName.substring(0, 30) + "...",
                productImage: pro.products.productImage[0],
                productPrice: Math.round(
                  pro.products.productSalePrice -
                    (pro.products.productSalePrice *
                      pro.products.productDiscount) /
                      100
                ),
                productSize: pro.cartProductSize,
                productColor: pro.products.color,
                productCategory: pro.products.category,
                isCancel: false,
                isReturn: false,
                returnStatus: "Approval Pending",
                productId: pro.products.$id,
              });
            });
            let products = await Promise.all(productPromises);
            await services.addOrder({
              userId: user.$id,
              products,
              address: selectedAddress,
              orderStatus: "Order Placed Pending",
              mobileNumber: selectedAddressPhoneNumber,
              orderAmount: total,
              cancelAmount: 0,
              returnAmount: 0,
              trackingId: "updated soon",
              paymentMethod,
              paymentId: response.razorpay_payment_id,
            });

            toast.success("Payment successful! Order placed.");

            await services.clearCart(user.$id);
            navigate("/orderplaced", { state: { selectedAddress } });
            toast.success("Order placed.");
            setPlacingOrder(false);
          } catch (error) {
            toast.error("Error storing order.", {
              autoClose: 1500,
            });
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: selectedAddressPhoneNumber,
        },
        notes: {
          address: selectedAddress,
        },
        theme: {
          color: "#3399cc",
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error("Error creating payment order.", error);
    }
  };

  return (
    <div className="checkoutcontainer">
      <h1>Checkout</h1>
      <LoadingOverlay visible={placingOrder} />
      <div className="checkoutMainBody">
        <div className="checkoutLeftMain">
          <div className="checkoutShippingAddressDiv">
            <h2>Select a delivery address</h2>
            {address.map((addr, index) => (
              <div key={index} className="shippingaddress">
                <input
                  type="radio"
                  name="address"
                  value={addr.$id}
                  checked={selectedAddressId === addr.$id}
                  onChange={() => handleAddressSelect(addr.$id)}
                />
                <p>{addr.shippingAddress}</p>
              </div>
            ))}
            <div className="add-sec-third">
              <button onClick={handleUseAddress} className="iAdd-b2">
                Use this address
              </button>
              <Link to={"/address"}>
                <button className="iAdd-b1">Add new address</button>
              </Link>
            </div>
          </div>
          <div className="checkoutPaymentOptions">
            <h2>Select a payment method</h2>
            <div className="paymentMethodOptionsMain">
              <div className="paymentOptionsDiv">
                <div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === "razorpay"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                </div>
                <div className="paymentTitleDiv">
                  <div className="paymentRazorpay">
                    <img src={razorpay} alt="razorpay" />
                    <div className="seperator"></div>
                    <div className="optionsNames">
                      <p>Cards, UPI / QR, Wallets, Netbanking</p>
                    </div>
                  </div>
                  <div className="paymentIconsDiv">
                    <img src={Rupay} alt="rupay" />
                    <img src={Visa} alt="visa" />
                    <img src={Mastercard} alt="mastercard" />
                    <p>and more...</p>
                  </div>
                </div>
              </div>
              <div className="paymentOptionsDiv">
                <div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                </div>
                <div>
                  <p>Cash on delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="checkoutRightMain">
          <h2>Order Summary</h2>
          <div>
            <p>Items:</p>
            <p>₹{total.toFixed(2)}</p>
          </div>
          <div>
            <p>Delivery:</p>
            <p>₹0.00</p>
          </div>
          <hr />
          <div className="orderTotalDiv">
            <h2>Order Total</h2>
            <h2>₹{total.toFixed(2)}</h2>
          </div>
          <button onClick={placeYourOrder}>Place your order</button>
          <p>
            By placing your order, you agree to zorawear's privacy notice and
            conditions of use.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
