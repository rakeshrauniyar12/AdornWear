import React, { useContext, useState } from "react";
import { UserContext } from "./UserContext";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import services from "../Appwrite/Service";
import LoadingOverlay from "./LoadingOverlay";

const EditDetails = () => {
  const { user, updateUserDetails } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [newValue, setNewValue] = useState("");
  const [updating, setUpdating] = useState(false);

  const handleSaveChanges = async () => {
    try {
      setUpdating(true);
      if (location.state.field === "name") {
        await services.updateUserName(newValue);
      } else if (location.state.field === "password") {
        await services.updateUserPassword(newValue);
      }
      toast.success("Changes saved successfully", { autoClose: 1500 });
      navigate("/");
    } catch (error) {
      toast.error("Error updating document", { autoClose: 1500 });
    } finally {
      setUpdating(false);
    }
  };
  return (
    <div className="change-main">
      <h2 className="change-main-h2">Change your {location.state.field}</h2>
      <div className="change-main-first">
        <p>
          If you want to change the {location.state.field} associated with your
          Zorawear customer account, you may do so below. Be sure to click the
          <span style={{ fontWeight: "bold" }}>Save Changes</span> button when
          you are done.
        </p>
      </div>
      <div className="change-main-second">
        <label>New {location.state.field}</label>
        <input
          type={location.state.field === "password" ? "password" : "text"}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
        />
        <button
          className="change-main-button"
          onClick={handleSaveChanges}
          disabled={updating}
        >
          {updating ? "Updating..." : "Save changes"}
        </button>
      </div>
      {updating && <LoadingOverlay />}
    </div>
  );
};

export default EditDetails;
