import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import Cart from "./Cart";
import { Orders, ShowOrderDetails, OrderDetails } from "./Orders";
import Product from "./Product";
import { Account } from "./Account";
import PrivacyPolicy from "./PrivacyPolicy";
import TermAndCondition from "./TermAndCondition";
import ReturnRefund from "./ReturnRefund";
import OrderAndDelivery from "./OrderAndDelivery";
import { LoginSecurity } from "./Account";
import Address from "./Address";
import OrderPlaced from "./OrderPlaced";
import LoginAndSecurity from "./LoginAndSecurity";
import EditDetails from "./EditDetails";
import ProductDetails from "./ProductDetails";
import Contact from "./Contact";
import FAQs from "./FAQs";
import AboutUs from "./AboutUs";
import CreateReview from "./CreateReview";
import Checkout from "./Checkout";
import {ForgotPassword, ResetPassword} from "./forgotPassword";
import { useMediaQuery } from "@mui/material";
import { useLocation } from "react-router-dom";

const Content = () => {
  const location = useLocation();

  const isMobile = useMediaQuery("(max-width: 768px)");

  let marginTop;

  if (location.pathname === "/") {
    marginTop = isMobile ? "255px" : "100px";
  } else {
    marginTop = isMobile ? "100px" : "100px";
  }

  return (
    <div style={{ width: "100%", margin: "auto", marginTop }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
        <Route path="/createreview/:productId" element={<CreateReview />} />
        <Route path="/orderanddelivery" element={<OrderAndDelivery />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/privacypolicy" element={<PrivacyPolicy />} />
        <Route path="/termsandcondition" element={<TermAndCondition />} />
        <Route path="/returnsandrefunds" element={<ReturnRefund />} />
        <Route path="/contactus" element={<Contact />} />
        <Route
          path="/orders/showorderdetails/:orderId/:productId"
          element={<ShowOrderDetails />}
        />
        <Route
          path="/orders/orderdetails/:orderId"
          element={<OrderDetails />}
        />
        <Route path="/edit" element={<EditDetails />} />
        <Route path="/orderplaced" element={<OrderPlaced />} />
        <Route path="/loginandsecurity" element={<LoginAndSecurity />} />
        <Route path="/loginsecurity" element={<LoginSecurity />} />
        <Route path="/address" element={<Address />} />
        <Route path="/accounts" element={<Account />} />
        <Route path="/:category" element={<Product />} />
        <Route path="/accessories/:subcategory" element={<Product />} />
        <Route path="/:category/:productId" element={<ProductDetails />} />
        <Route path="/searchresults" element={<Product />} />
        <Route
          path="/:category/:subcategory/:productId"
          element={<ProductDetails />}
        />
      </Routes>
    </div>
  );
};

export default Content;
