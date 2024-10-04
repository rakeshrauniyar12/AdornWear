import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "./UserContext";
import address from "../Assets/address.png";
import profile from "../Assets/profile.png";
import orders from "../Assets/orders.png";
import contactus from "../Assets/contactus.png";
import logoutlogo from "../Assets/logout.png";
import { useNavigate, useLocation } from "react-router-dom";
import "../Styles/Account.css";
import LoadingOverlay from "./LoadingOverlay";
import services from "../Appwrite/Service";
import { toast } from "react-toastify";

const Account = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await services.logout();
      setUser(null);
      toast.success("Logout successfully");
      navigate("/");
    } catch (error) {
      alert("Error occurred during logout:", error);
    }
  };

  return (
    <div className="account-main">
      <h1
        style={{
          fontWeight: "lighter",
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        My Account
      </h1>
      <div className="accountOptions">
        <div
          className="accountOptionsDiv"
          onClick={() => navigate("/loginandsecurity")}
        >
          <div className="optionDivImage">
            <img src={profile} alt="profile" />
          </div>
          <div className="optionDivInfo">
            <h3>Profile</h3>
            <p>Edit name, password and phone number</p>
          </div>
        </div>
        <div className="accountOptionsDiv" onClick={() => navigate("/orders")}>
          <div className="optionDivImage">
            <img src={orders} alt="orders" />
          </div>
          <div className="optionDivInfo">
            <h3>Orders</h3>
            <p>Track, return, or buy again</p>
          </div>
        </div>
        <div className="accountOptionsDiv" onClick={() => navigate("/address")}>
          <div className="optionDivImage">
            <img src={address} alt="address" />
          </div>
          <div className="optionDivInfo">
            <h3>Addresses</h3>
            <p>Edit and add new address</p>
          </div>
        </div>
        <div
          className="accountOptionsDiv"
          onClick={() => navigate("/contactus")}
        >
          <div className="optionDivImage">
            <img src={contactus} alt="contactus" />
          </div>
          <div className="optionDivInfo">
            <h3>Contact Us</h3>
            <p>Ask your doubts</p>
          </div>
        </div>
        <div className="accountOptionsDiv">
          <div className="optionDivImage">
            <img src={logoutlogo} alt="logout" />
          </div>
          <div
            className="optionDivInfo"
            style={{
              display: "flex",
              alignItems: "center",
            }}
            onClick={handleLogout}
          >
            <h3 style={{ color: "#EF314C", fontSize: "20px" }}>Logout</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginSecurity = () => {
  const { user } = useContext(UserContext);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);
  const handleSignIn = async () => {
    if (!password) {
      setError("Please enter password");
      return;
    }

    try {
      await services.reauthenticateUser(user.email, password);
      navigate("/edit", { state: { field: location.state.field } });
    } catch (err) {
      setError("Authentication failed. Please check your password.");
    }
  };
  // user?setLoading(false):setLoading(true);
  return (
    <>
      <LoadingOverlay visible={loading} />
      {!loading && (
        <div className="login-section">
          <div className="login-sec-first">
            <h1
              style={{
                width: "100%",
                margin: "auto",
                fontSize: "25px",
                fontWeight: "bold",
                marginBottom: "0px",
              }}
            >
              Sign in
            </h1>
          </div>
          <div className="login-sec-sec">
            <div className="login-sec-sec-first">
              <p>{user.name}</p>
              <p>{user.email}</p>
            </div>
            <div className="login-sec-sec-sec">
              <div
                className="login-sec-sec-sec-first"
                style={{ width: "100%" }}
              >
                <label>Password</label>
                <a href="http://google.com" style={{ color: "#6bacf5" }}>
                  Forgot Password
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 5px",
                  borderRadius: "5px",
                  border: "1px solid black",
                }}
              />
            </div>
            {error && <p style={{ color: "red" }}>{error}</p>}
          </div>
          <div className="login-sec-third" onClick={handleSignIn}>
            Sign in
          </div>
        </div>
      )}
    </>
  );
};

export { Account, LoginSecurity };
