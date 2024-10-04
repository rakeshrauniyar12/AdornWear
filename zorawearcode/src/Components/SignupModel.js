import React, { useContext } from "react";
import { useState, useRef } from "react";
import CloseIcon from "@mui/icons-material/Close";
import Search from "../Assets/search.png";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import services from "../Appwrite/Service.js";
import { UserContext } from "./UserContext.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

function SignupModal({ onClose }) {
  const [modalState, setModalState] = useState({
    isOpen: true,
    content: <SignInForm onClose={onClose} />,
  });
  const [activeId, setActiveId] = useState("Sign In");

  const openModal = (content, state) => {
    setActiveId(state);
    setModalState({ isOpen: false, content });
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h4 className="modal-title">Welcome To ZoraWear</h4>
          <CloseIcon
            sx={{ fontSize: 22, margin: "0 7px" }}
            onClick={onClose}
            className="button"
          />
        </div>
        <div id="showElement">
          <p
            onClick={() => openModal(<SignInForm />, "Sign In")}
            style={{
              cursor: "pointer",
              borderBottom:
                activeId === "Sign In"
                  ? "3px solid black"
                  : "3px solid transparent",
              color:
                activeId === "Sign In" ? "3px solid gray" : "3px solid black",
              fontWeight: activeId === "Sign In" ? "bolder" : "lighter",
            }}
          >
            Sign In
          </p>
          <p
            onClick={() =>
              openModal(
                <RegisterForm
                  onClose={onClose}
                  setActiveId={setActiveId}
                  setModalState={setModalState}
                  SignInForm={<SignInForm />}
                />,
                "Register"
              )
            }
            style={{
              cursor: "pointer",
              borderBottom:
                activeId === "Register"
                  ? "3px solid black"
                  : "3px solid transparent",
              color:
                activeId === "Register" ? "3px solid gray" : "3px solid black",
              fontWeight: activeId === "Register" ? "bold" : "lighter",
            }}
          >
            Register
          </p>
        </div>

        <div className="modal-body" show={modalState.isOpen}>
          {modalState.content}
        </div>
      </div>
    </div>
  );
}

function SignInForm({ onClose }) {
  const { setUser } = useContext(UserContext);
  const [showPassword, setShowPassword] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const continueWithGoogle = async () => {
    await services.handleContinueWithGoogle();
  };

  const toggleShowPassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };
  const handleLogin = async () => {
    // e.preventDefault();
    setIsLoading(true);
    const { email, password } = loginCredentials;

    try {
      await services.login({ email, password });
      const currentUser = await services.getCurrentUser();
      setUser(currentUser);
      toast.success("Login Successful", { autoClose: 1500 });
      onClose();
    } catch (error) {
      toast.error("Password incorrect!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginCredentials((prevCredentials) => ({
      ...prevCredentials,
      [name]: value,
    }));
  };
  const signInButtonRef = useRef(null);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      signInButtonRef.current.click();
    }
  };

  return (
    <div className="signInForm">
      <input
        type="email"
        placeholder="Email"
        name="email"
        value={loginCredentials.email}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
      />
      <div
        style={{ position: "relative", display: "inline-block", width: "100%" }}
      >
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          name="password"
          value={loginCredentials.password}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          style={{ paddingRight: "30px" }}
        />
        <FontAwesomeIcon
          icon={showPassword ? faEyeSlash : faEye}
          onClick={toggleShowPassword}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
          }}
        />
      </div>
      <div
        id="check"
        onClick={() => {
          navigate("/forgotpassword");
          onClose();
        }}
      >
        <p>Forgot your password?</p>
      </div>
      <button ref={signInButtonRef} onClick={handleLogin} disabled={isLoading}>
        {isLoading ? "Logging In..." : "Sign In"}
      </button>
      {/* <p>OR</p>
      <div className="signUpSecond" onClick={continueWithGoogle}>
        <img
          src={Search}
          style={{ width: "20px", height: "20px", marginLeft: "5px" }}
          alt="Google"
        />
        <p>Continue With Google</p>
      </div> */}
    </div>
  );
}

function RegisterForm({ onClose, setActiveId, setModalState, SignInForm }) {
  const [showPassword, setShowPassword] = useState(false);
  const [registerCredentials, setRegisterCredentials] = useState({
    email: "",
    password: "",
    confirmpassword: "",
    name: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const { name, email, password, confirmpassword } = registerCredentials;

    // Checking if any field is empty
    if (!name || !email || !password || !confirmpassword) {
      toast.warn("Please fill in all fields.", { autoClose: 1500 });
      return;
    }

    // Check if the email is in correct format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      toast.warn("Please enter a valid email address.", { autoClose: 1500 });
      return;
    }

    if (password.length < 8) {
      toast.warn("Passwords must be atleast 8 characters long.", {
        autoClose: 1500,
      });
      return;
    }

    if (password !== confirmpassword) {
      toast.warn("Passwords do not match.", { autoClose: 1500 });
      return;
    }

    // Check if the password meets the strength criteria
    // const passwordPattern =
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    // if (!passwordPattern.test(password)) {
    //   toast.warn(
    //     "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
    //     { autoClose: 1500 }
    //   );
    //   return;
    // }

    try {
      const userData = await services.createAccount({
        email,
        password,
        name,
      });
      if (userData) {
        setActiveId("Sign In");
        setModalState({ isOpen: false, content: SignInForm });
        setRegisterCredentials({
          name: "",
          email: "",
          password: "",
          confirmpassword: "",
        });
      }
    } catch (error) {
      toast.warn(`Register User error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegisterCredentials((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const signInButtonRef = useRef(null);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      signInButtonRef.current.click();
    }
  };

  return (
    <form
      className="signInForm"
      onSubmit={handleRegister}
      ref={signInButtonRef}
    >
      <input
        type="text"
        placeholder="Full Name"
        name="name"
        value={registerCredentials.name}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
      />
      <input
        type="email"
        placeholder="Email"
        name="email"
        value={registerCredentials.email}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
      />
      <div
        style={{ position: "relative", display: "inline-block", width: "100%" }}
      >
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          name="password"
          value={registerCredentials.password}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          style={{ paddingRight: "30px" }}
        />
        <FontAwesomeIcon
          icon={showPassword ? faEyeSlash : faEye}
          onClick={toggleShowPassword}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
          }}
        />
      </div>
      <div
        style={{ position: "relative", display: "inline-block", width: "100%" }}
      >
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Confirm Password"
          name="confirmpassword"
          value={registerCredentials.confirmpassword}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          style={{ paddingRight: "30px" }}
        />
        <FontAwesomeIcon
          icon={showPassword ? faEyeSlash : faEye}
          onClick={toggleShowPassword}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
          }}
        />
      </div>
      <p style={{ fontWeight: "lighter", width: "100%", margin: "10px 10px" }}>
        By registering, you agree to our{" "}
        <Link
          style={{ textDecoration: "underline" }}
          to={"/termsandcondition"}
          onClick={onClose}
        >
          Terms & Conditions
        </Link>{" "}
        and{" "}
        <Link
          style={{ textDecoration: "underline" }}
          to={"/privacypolicy"}
          onClick={onClose}
        >
          Privacy Policy
        </Link>
      </p>
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Registering..." : "Register"}
      </button>
      {/* <p>OR</p>
      <div className="signUpSecond">
        <img
          src={Search}
          style={{ width: "20px", height: "20px", marginLeft: "5px" }}
          alt="Google"
        />
        <p>Continue With Google</p>
      </div> */}
    </form>
  );
}

export default SignupModal;
