import React, { useState } from "react";
import SignupModal from "./SignupModel";
import "../Styles/Model.css";


import { useMediaQuery } from "@mui/material";

function SignUpButton() {
  const [showModal, setShowModal] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const fontSize = isMobile ? "22px" : "13px";
  const backgroundColor = isMobile ? "black" : "transparent";
  const color = isMobile ? "white" : "black";

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  return (
    <>
     <button
        onClick ={toggleModal}
        id="toggleButton"
        style={{
          fontSize: fontSize,
          backgroundColor: backgroundColor,
          color: color,
        }}
      >
        Sign In
      </button>
      {showModal && <SignupModal onClose={toggleModal} />}
    </>
  );
}

export default SignUpButton;
