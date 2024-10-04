import React, { useContext, useState, useRef } from "react";
import { UserContext } from "./UserContext";
import { useNavigate } from "react-router-dom";
import Default from "../Assets/default.jpeg";

const LoginAndSecurity = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleEditClick = (field) => {
    navigate("/loginsecurity", { state: { field } });
  };

  return (
    <>
      <h1 className="login-main-h1">My Profile</h1>
      <div className="login-main">
        <div className="userdpdiv">
          <div>
            <img
              src={Default}
              alt="userdp"
            />
            <p>{user.name}</p>
          </div>
        </div>
        <div className="login-main-first">
          <div className="login-main-first-first">
            <label>Name</label>
            <p>{user.name}</p>
          </div>
          <button
            onClick={() => handleEditClick("name")}
            className="login-main-first-second"
          >
            Edit
          </button>
        </div>
        <div className="login-main-first">
          <div className="login-main-first-first">
            <label>Email</label>
            <p>{user.email}</p>
          </div>
        </div>
        <div className="login-main-first" style={{ borderBottom: "none" }}>
          <div className="login-main-first-first">
            <label>Password</label>
            <p>********</p>
          </div>
          <button
            onClick={() => {
              navigate("/forgotpassword");
            }}
            className="login-main-first-second"
          >
            Edit
          </button>
        </div>
      </div>
    </>
  );
};

export default LoginAndSecurity;
