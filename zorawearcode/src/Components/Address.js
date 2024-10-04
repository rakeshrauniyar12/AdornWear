import React, { createContext, useState, useEffect, useContext } from "react";
import "../Styles/Address.css";
import { UserContext } from "./UserContext";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import services from "../Appwrite/Service";
import LoadingOverlay from "./LoadingOverlay";

const Address = () => {
  const { addresses, setAddresses } = useContext(AddressContext);
  const [showAddressPage, setShowAddressPage] = useState(false);

  const toggleAddressPage = () => {
    setShowAddressPage(!showAddressPage);
  };

  const handleAddressAdded = () => {
    setShowAddressPage(false); // Switch back to AddressContent after address added
  };

  return (
    <>
      {!showAddressPage && addresses && addresses.length > 0 ? (
        <AddressContent toggleAddressPage={toggleAddressPage} />
      ) : (
        <AddressPage
          toggleAddressPage={toggleAddressPage}
          handleAddressAdded={handleAddressAdded}
        />
      )}
    </>
  );
};

const AddressContent = ({ toggleAddressPage }) => {
  const { user } = useContext(UserContext);
  const { addresses, setAddresses } = useContext(AddressContext);
  const [loading, setLoading] = useState(false);

  const handleRemoveAddress = async (addressId) => {
    setLoading(true);
    try {
      if (user) {
        await services.removeAddress(addressId);
        const updatedAddresses = addresses.filter(
          (address) => address.$id !== addressId
        );
        setAddresses(updatedAddresses);
        toast.success("Address removed successfully!", {
          autoClose: 1500,
        });
      } else {
        toast.warn("Please try again!", { autoClose: 1500 });
      }
    } catch (error) {
      toast.error("Error removing address!", { autoClose: 1500 });
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <LoadingOverlay visible={loading} />
      {addresses && addresses.length > 0 ? (
        <div className="address-content">
          <div
            className="address-first-di"
            style={{ cursor: "pointer" }}
            onClick={toggleAddressPage}
          >
            <AddIcon />
            <h2>Add new address</h2>
          </div>
          {addresses.map((address) => (
            <div key={address.id} className="address-first-div">
              <p>{`${address.shippingAddress}, ${address.mobileNumber}`}</p>
              <button
                onClick={() => handleRemoveAddress(address.$id)}
                className="address-remove-btn"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <AddressPage />
      )}
    </>
  );
};

const AddressPage = ({ handleAddressAdded }) => {
  const { user } = useContext(UserContext);
  const { addresses, setAddresses } = useContext(AddressContext);
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  // const [otp, setOtp] = useState("");
  // const [generatedOtp, setGeneratedOtp] = useState("");
  const [pincode, setPincode] = useState("");
  const [flatDetails, setFlatDetails] = useState("");
  const [areaDetails, setAreaDetails] = useState("");
  const [landmark, setLandmark] = useState("");
  const [townCity, setTownCity] = useState("");
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(false);

  const [fullNameError, setFullNameError] = useState("");
  const [mobileNumberError, setMobileNumberError] = useState("");
  const [pincodeError, setPincodeError] = useState("");
  const [flatDetailsError, setFlatDetailsError] = useState("");
  const [areaDetailsError, setAreaDetailsError] = useState("");
  const [landmarkError, setLandmarkError] = useState("");
  const [townCityError, setTownCityError] = useState("");
  const [stateError, setStateError] = useState("");

  // const handlePhoneVerification = async () => {
  //   try {
  //     await services.sendOtp(mobileNumber);
  //     toast.success("OTP sent successfully!");
  //   } catch (error) {
  //     console.error("Error sending OTP:", error);
  //   }
  // };

  // const handleVerifyOTP = async () => {
  //   try {
  //     const response = await services.verifyOtp(mobileNumber, otp);
  //     if (response.success) {
  //       toast.success("OTP verified successfully!");
  //     } else {
  //       toast.error("Invalid OTP");
  //     }
  //   } catch (error) {
  //     console.error("Error verifying OTP:", error);
  //   }
  // };

  const handleAddAddress = async () => {
    setLoading(true);

    let isValid = true;

    if (fullName.trim() === "") {
      setFullNameError("Please enter full name");
      isValid = false;
    } else {
      setFullNameError("");
    }

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobileNumber)) {
      setMobileNumberError(
        "Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9."
      );
      isValid = false;
    } else {
      setMobileNumberError("");
    }

    if (pincode.trim() === "") {
      setPincodeError("Please enter pincode");
      isValid = false;
    } else {
      setPincodeError("");
    }

    if (flatDetails.trim() === "") {
      setFlatDetailsError(
        "Please enter flat, house no., building, company, apartment"
      );
      isValid = false;
    } else {
      setFlatDetailsError("");
    }

    if (areaDetails.trim() === "") {
      setAreaDetailsError("Please enter area, street, sector, village");
      isValid = false;
    } else {
      setAreaDetailsError("");
    }

    if (landmark.trim() === "") {
      setLandmarkError("Please enter landmark");
      isValid = false;
    } else {
      setLandmarkError("");
    }

    if (townCity.trim() === "") {
      setTownCityError("Please enter town/city name");
      isValid = false;
    } else {
      setTownCityError("");
    }

    if (state.trim() === "") {
      setStateError("Please enter state name");
      isValid = false;
    } else {
      setStateError("");
    }

    if (!isValid) {
      setLoading(false); // Clear loading state if validation fails
      return;
    }

    const shippingAddress = `${fullName}, ${flatDetails}, ${areaDetails}, ${landmark}, ${townCity}, ${state}, ${pincode}`;
    try {
      if (user) {
        // Add address
        await services.addAddress(user.$id, mobileNumber, shippingAddress);
        const addressData = await services.getAddresses(user.$id);
        setFullName("");
        setMobileNumber("");
        setPincode("");
        setFlatDetails("");
        setAreaDetails("");
        setLandmark("");
        setTownCity("");
        setState("");
        toast.success("Address added successfully!", {
          autoClose: 1500,
        });
        setAddresses(addressData);
        handleAddressAdded();
      } else {
        toast.warn("Please try again!", { autoClose: 1500 });
      }
    } catch (error) {
      toast.warn("User is not authenticated. Please log in.", {
        autoClose: 1500,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="address-main">
      <LoadingOverlay visible={loading} />
      <div>
        <h1 style={{ fontSize: "25px" }}>Add a new address</h1>
      </div>
      <div className="address-main-first">
        <div>
          <label>Full Name (First and Last Name)</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          {fullNameError && <p style={{ color: "red" }}>{fullNameError}</p>}
        </div>
        <div>
          <label>Mobile Number</label>
          <input
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
          />
          {mobileNumberError && (
            <p style={{ color: "red" }}>{mobileNumberError}</p>
          )}
        </div>
        {/* <button onClick={handlePhoneVerification}>Send OTP</button> */}
        {/* <div>
          <label>OTP</label>
          <input value={otp} onChange={(e) => setOtp(e.target.value)} />
        </div> */}
        {/* <button onClick={handleVerifyOTP}>Verify OTP</button> */}
        <div>
          <label>Pincode</label>
          <input value={pincode} onChange={(e) => setPincode(e.target.value)} />
          {pincodeError && <p style={{ color: "red" }}>{pincodeError}</p>}
        </div>
        <div>
          <label>Flat, House no., Building, Company, Apartment</label>
          <input
            value={flatDetails}
            onChange={(e) => setFlatDetails(e.target.value)}
          />
          {flatDetailsError && (
            <p style={{ color: "red" }}>{flatDetailsError}</p>
          )}
        </div>
        <div>
          <label>Area, Street, Sector, Village</label>
          <input
            value={areaDetails}
            onChange={(e) => setAreaDetails(e.target.value)}
          />
          {areaDetailsError && (
            <p style={{ color: "red" }}>{areaDetailsError}</p>
          )}
        </div>
        <div>
          <label>Landmark</label>
          <input
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
          />
          {landmarkError && <p style={{ color: "red" }}>{landmarkError}</p>}
        </div>
        <div>
          <label>Town/City</label>
          <input
            value={townCity}
            onChange={(e) => setTownCity(e.target.value)}
          />
          {townCityError && <p style={{ color: "red" }}>{townCityError}</p>}
        </div>
        <div>
          <label>State</label>
          <input value={state} onChange={(e) => setState(e.target.value)} />
          {stateError && <p style={{ color: "red" }}>{stateError}</p>}
        </div>
      </div>
      <div className="address-button">
        <button onClick={handleAddAddress}>Add address</button>
      </div>
    </div>
  );
};

// AddressContext.js

export const AddressContext = createContext();

export const AddressProvider = ({ children }) => {
  const { user } = useContext(UserContext);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAddress = async () => {
      if (user) {
        try {
          const addresses = await services.getAddresses(user.$id);
          setAddresses(addresses);
          setLoading(false);
        } catch (error) {
          toast.error("Error fetching user address!", { autoClose: 1500 });
          setLoading(false);
        }
      }
    };
    fetchUserAddress();
  }, [user]);

  return (
    <AddressContext.Provider value={{ addresses, setAddresses, loading }}>
      {children}
    </AddressContext.Provider>
  );
};

export default Address;
