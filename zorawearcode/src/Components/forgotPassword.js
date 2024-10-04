import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import services from "../Appwrite/Service";
import "../Styles/forgot.css";
import LoadingOverlay from "./LoadingOverlay";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sendingCode, setSendingCode] = useState(false);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleSendCode = async () => {
    if (email) {
      try {
        setSendingCode(true);
        await services.account.createRecovery(
          email,
          "https://zorawear.vercel.app/resetpassword"
        );
        toast.success(`Recovery code sent to ${email}`, { autoClose: 1500 });
      } catch (error) {
        toast.error("Failed to send recovery code", { autoClose: 1500 });
      } finally {
        setSendingCode(false);
      }
    } else {
      toast.warn("Please enter a valid email address", { autoClose: 1500 });
    }
  };

  return (
    <>
      <div class="forgot-cont">
        <h2>Password Recovery</h2>
        <input
          type="email"
          id="email"
          value={email}
          onChange={handleEmailChange}
          class="forgot-input"
          placeholder="Enter your email"
        />
        <button
          onClick={handleSendCode}
          className="forgot-btn"
          disabled={sendingCode}
        >
          {sendingCode ? "Sending..." : "Send Recovery Code"}
        </button>
      </div>
      {sendingCode && <LoadingOverlay />}
    </>
  );
};

const ResetPassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleOldPasswordChange = (event) => {
    setOldPassword(event.target.value);
  };

  const handleNewPasswordChange = (event) => {
    setNewPassword(event.target.value);
  };

  const navigate = useNavigate();

  const changePassword = async () => {
    if (oldPassword !== newPassword) {
      toast.warn("Password does not match");
      return;
    }
    try {
      setUpdatingPassword(true); // Set updatingPassword to true when starting password update
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get("userId");
      const secret = urlParams.get("secret");
      await services.account.updateRecovery(
        userId,
        secret,
        oldPassword,
        newPassword
      );
      toast.success("Password reset successfully", { autoClose: 1500 });
      navigate("/");
    } catch (error) {
      toast.error("Failed to reset password", { autoClose: 1500 });
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div class="forgot-cont">
      <h1>Reset Password</h1>
      <div>
        <label>Password</label>
        <input
          type="password"
          value={oldPassword}
          onChange={handleOldPasswordChange}
          class="forgot-input"
          placeholder="New Password"
        />
      </div>
      <div>
        <label>Comfirm Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={handleNewPasswordChange}
          class="forgot-input"
          placeholder="Confirm New Password"
        />
      </div>
      <button
        onClick={changePassword}
        className="forgot-btn"
        disabled={updatingPassword}
      >
        {updatingPassword ? "Updating..." : "Reset Password"}
      </button>
      {updatingPassword && <LoadingOverlay />}
    </div>
  );
};

export { ForgotPassword, ResetPassword };
