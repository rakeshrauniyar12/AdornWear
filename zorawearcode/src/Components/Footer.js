import React from "react";
import "../Styles/Footer.css";
import { useNavigate } from "react-router-dom";

import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

const Footer = () => {
  const navigate = useNavigate();

  const handleInstagramClick = () => {
    window.open("https://www.instagram.com/zorawear.zw/", "_blank");
  };

  const handleFacebookClick = () => {
    window.open("https://www.facebook.com/your_facebook_page", "_blank");
  };

  const handleLinkedInClick = () => {
    window.open("https://www.linkedin.com/company/zorawear/", "_blank");
  };

  const handleWhatsappClick = () => {
    window.open("https://wa.me/9082846069", "_blank");
  };

  return (
    <div id="footerContainer">
      <div className="footerTopInfo">
        <div>
          <h4>Customer Service</h4>
          <ul>
            <li onClick={() => navigate("/contactus")}>Contact us</li>
            <li onClick={() => navigate("/faqs")}>FAQs</li>
            <li onClick={() => navigate("/orderanddelivery")}>
              Orders and delivery
            </li>
            <li onClick={() => navigate("/returnsandrefunds")}>
              Returns and refunds
            </li>
          </ul>
        </div>
        <div>
          <h4>About ZORAWEAR</h4>
          <ul>
            <li onClick={() => navigate("/aboutus")}>About us</li>
          </ul>
        </div>
        <div>
          <h4>Follow us</h4>
          <ul>
            <li onClick={handleInstagramClick}>
              <InstagramIcon />
            </li>
            <li onClick={handleFacebookClick}>
              <FacebookIcon />
            </li>
            <li onClick={handleLinkedInClick}>
              <LinkedInIcon />
            </li>
            <li onClick={handleWhatsappClick}>
              <WhatsAppIcon />
            </li>
          </ul>
        </div>
      </div>
      <div id="footerDivider" />
      <div className="footerBottomInfo">
        <ul>
          <li onClick={() => navigate("/privacypolicy")}>Privacy policy</li>
          <li onClick={() => navigate("/termsandcondition")}>
            Terms and conditions
          </li>
        </ul>
        <p>&#169; Copyright 2024 ZORAWEAR India Limited. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Footer;
