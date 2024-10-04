import React, { useState, useEffect } from "react";
import { useContext } from "react";
import { UserContext } from "./UserContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { Paper, IconButton, useMediaQuery } from "@mui/material";
// import zoralogo from "../Assets/ZORA.png";
// import zoralogo from "../Assets/zora.jpg";
import zoralogo from "../Assets/AdornWear.png";
import SignUpButton from "./SignUpButton";
import cashondelivery from "../Assets/cashondelivery.png";
import easyreturn from "../Assets/easyreturn.png";
import freedelivery from "../Assets/freedelivery.png";
import HomeIcon from "@mui/icons-material/Home";
import { toast } from "react-toastify";
import services from "../Appwrite/Service";

const formatCategoryName = (name) => {
  const firstPart = name.split("-")[0];
  return firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
};

const Navbar = () => {
  const { user, setUser } = useContext(UserContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isHovering, setIsHovering] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const debounce = (func, delay) => {
    let timer;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(context, args), delay);
    };
  };

  // Handle search input with debouncing
  const handleSearch = debounce(async (query) => {
    if (query.trim() !== "") {
      try {
        setLoading(true);
        const normalizedQuery = query.toLowerCase();
        const searchResults = await services.searchProducts(normalizedQuery);
        setSearchResults(searchResults);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        toast.error("Error fetching products!", { autoClose: 1500 });
      }
    } else {
      setSearchResults([]);
    }
  }, 1000);

  const getCategories = async () => {
    try {
      const categoriesList = await services.fetchCategories();
      setCategories(categoriesList);
    } catch (error) {
      toast.error("Error fetching categories!", { autoClose: 1500 });
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  const getLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      padding: "12px 10px",
      borderRadius: "3px",
      marginBottom: "5px",
      backgroundColor: isActive ? "#cbcbcb" : "#f0f0f0",
      color: isActive ? "black" : "#5d5858",
      textDecoration: "none",
    };
  };

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

  const goToAccounts = () => {
    navigate("/accounts");
  };

  const handleMouseEnter = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMouseLeave = () => {
    setAnchorEl(null);
  };

  const handleToggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div
      style={{
        borderBottom: "1px solid #E9EAEC",
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 1000,
        backgroundColor: "white",
        marginBottom: "5px",
      }}
    >
      <div className="deliveryMainDiv">
        <div className="deliveryDesignDiv">
          <div className="deliveryDesign">
            <img src={freedelivery} alt="delivery" />
            <h3>Free Shipping</h3>
          </div>
          <div className="deliveryDesign">
            <img src={cashondelivery} alt="cash" />
            <h3>Cash On Delivery</h3>
          </div>
          <div className="deliveryDesign">
            <img src={easyreturn} alt="return" />
            <h3>Easy Return</h3>
          </div>
        </div>
      </div>
      <div
        style={{
          width: "94%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "auto",
          padding: "10px 0px",
        }}
      >
        {isMobile ? (
          <>
            {/* Mobile View */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
              }}
            >
              {/* Hamburger Menu */}
              <IconButton onClick={handleToggleMobileMenu}>
                {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
              </IconButton>

              {/* Logo */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Link to="/" style={{ textDecoration: "none" }}>
                  <img src={zoralogo} alt="logo" style={{ width: "160px" }} />
                </Link>
              </div>

              {/* Right Side Icons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <Link to="/cart" style={{ color: "inherit" }}>
                  <ShoppingCartOutlinedIcon
                    sx={{ fontSize: 22, cursor: "pointer" }}
                  />
                </Link>
              </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <Paper
                style={{
                  position: "absolute",
                  top: 0,
                  left: mobileMenuOpen ? 0 : "-100%",
                  height: "100vh",
                  width: "80%",
                  zIndex: 100,
                  backgroundColor: "white",
                  padding: "8px",
                  boxShadow:
                    "rgba(0, 0, 0, 0.1) 0px 4px 8px, rgba(0, 0, 0, 0.1) 0px 6px 20px",
                  transition: "left 0.3s ease-in-out",
                }}
              >
                {/* Close Icon */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    top: "2.5%",
                  }}
                >
                  <img
                    src={zoralogo}
                    alt="logo"
                    style={{
                      width: "160px",
                      position: "absolute",
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  />
                  <IconButton
                    sx={{ position: "absolute", right: 0 }}
                    onClick={handleToggleMobileMenu}
                  >
                    <CloseIcon />
                  </IconButton>
                </div>

                <div style={{ marginBottom: "20px", marginTop: "50px" }}>
                  <div style={{ marginBottom: "20px" }}>
                    {user ? (
                      <div style={{ marginTop: "45px" }}>
                        <p>Welcome,</p>
                        <h1>{user.name}</h1>
                      </div>
                    ) : (
                      <div
                        style={{
                          height: "50px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: "black",
                          borderRadius: "8px",
                          marginTop: "60px",
                        }}
                        onClick={() => {
                          const signUpButton =
                            document.getElementById("toggleButton");
                          signUpButton.click();
                        }}
                      >
                        <SignUpButton />
                      </div>
                    )}
                  </div>
                </div>
                {/* Sidebar List Items */}
                {user != null && (
                  <ul
                    style={{
                      listStyleType: "none",
                      padding: 0,
                      marginTop: "40px",
                    }}
                  >
                    <li
                      style={getLinkStyle("/")}
                      onClick={handleToggleMobileMenu}
                    >
                      <Link
                        to="/"
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <HomeIcon sx={{ marginRight: "5px" }} />
                          Home
                        </div>
                      </Link>
                    </li>
                    <li
                      style={getLinkStyle("/loginAndsecurity")}
                      onClick={handleToggleMobileMenu}
                    >
                      <Link
                        to="/loginAndsecurity"
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <AccountCircleIcon sx={{ marginRight: "5px" }} />
                          My Profile
                        </div>
                      </Link>
                    </li>
                    <li
                      style={getLinkStyle("/orders")}
                      onClick={handleToggleMobileMenu}
                    >
                      <Link
                        to="/orders"
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <ReceiptLongIcon sx={{ marginRight: "5px" }} />
                          My Orders
                        </div>
                      </Link>
                    </li>
                    <li
                      style={getLinkStyle("/address")}
                      onClick={handleToggleMobileMenu}
                    >
                      <Link
                        to="/address"
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <LocationOnIcon sx={{ marginRight: "5px" }} />
                          My Addresses
                        </div>
                      </Link>
                    </li>
                    <li
                      style={getLinkStyle("/contactus")}
                      onClick={handleToggleMobileMenu}
                    >
                      <Link
                        to="/contactus"
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <HelpOutlineIcon sx={{ marginRight: "5px" }} />
                          Contact Us
                        </div>
                      </Link>
                    </li>

                    {user && (
                      <li
                        style={getLinkStyle("/logout")}
                        onClick={handleToggleMobileMenu}
                      >
                        {/* <Link
                      to="/logout"
                      style={{ textDecoration: "none", color: "inherit" }}
                    > */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            color: "red",
                          }}
                          onClick={handleLogout}
                        >
                          <LogoutIcon sx={{ marginRight: "5px" }} />
                          Logout
                        </div>
                        {/* </Link> */}
                      </li>
                    )}
                  </ul>
                )}
              </Paper>
            )}
          </>
        ) : (
          <>
            {/* Desktop View */}
            <ul
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                height: "100%",
                padding: "10px",
                listStyleType: "none",
                margin: 0,
              }}
            >
              <li style={{ marginRight: "20px" }}>
                <Link
                  to="/"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Home
                </Link>
              </li>
              <li style={{ marginRight: "20px" }}>
                <Link
                  to="/kurti"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Kurti Set
                </Link>
              </li>
              <li style={{ marginRight: "20px" }}>
                <Link
                  to="/unstitchedsuits"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  UnStitched Suits
                </Link>
              </li>
              <li style={{ marginRight: "20px" }}>
                <Link
                  to="/menswear"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Mens Wear
                </Link>
              </li>
              <li
                style={{ cursor: "pointer", position: "relative" }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  to="/accessories/bags"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Accessories
                </Link>
                {anchorEl && (
                  <Paper
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      zIndex: 10,
                      padding: "10px",
                    }}
                  >
                    <ul style={{ listStyleType: "none", padding: 0 }}>
                      {categories
                        .filter(
                          (category) =>
                            category.name !== "kurti" &&
                            category.name !== "unstitched-suits" &&
                            category.name !== "mens-wear"
                        )
                        .map((category, index) => (
                          <li key={index} className="accessoriesItemsHover">
                            <Link
                              to={category.path}
                              style={{
                                textDecoration: "none",
                                color: "inherit",
                              }}
                            >
                              {formatCategoryName(category.name)}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </Paper>
                )}
              </li>
            </ul>

            <div
              style={{
                width: "15%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Link to="/" style={{ textDecoration: "none" }}>
                <img src={zoralogo} alt="logo" style={{ width: "180px" }} />
              </Link>
            </div>

            <div
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                height: "100%",
                paddingRight: "12px",
              }}
            >
              <div
                style={{
                  width: "50%",
                  height: "35px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow:
                    "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
                  marginRight: "12px",
                  borderRadius: "6px",
                  padding: "0px 8px",
                }}
              >
                <SearchIcon sx={{ color: "grey" }} />
                <input
                  style={{
                    width: "90%",
                    height: "100%",
                    outline: "none",
                    border: "none",
                    fontSize: "14px",
                  }}
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                />
                <div className="searchRenderProducts">
                  {searchResults.map((product, index) => {
                    return (
                      <Link
                        key={index}
                        to={`/${product.category}/${product.productId}`}
                        onClick={() => {
                          setSearchResults([]);
                        }}
                      >
                        <div className="searchProductDiv">
                          <div className="searchProductImage">
                            <img
                              src={product.productImages[0]}
                              alt={product.productName}
                            />
                          </div>
                          <div className="searchProductInfo">
                            <p style={{ marginBottom: "3px" }}>
                              {product.productName}
                            </p>
                            <p>{`₹${product.productSalePrice}`}</p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
              <a
                href="https://www.instagram.com/zorawear.zw/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit" }}
              >
                <InstagramIcon
                  sx={{ fontSize: 22, margin: "0 7px", cursor: "pointer" }}
                />
              </a>

              <a
                href="https://wa.me/9324469475"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit" }}
              >
                <WhatsAppIcon
                  sx={{ fontSize: 22, margin: "0 7px", cursor: "pointer" }}
                />
              </a>

              <Link to="/cart" style={{ color: "inherit" }}>
                <ShoppingCartOutlinedIcon
                  sx={{ fontSize: 22, margin: "0 7px", cursor: "pointer" }}
                />
              </Link>
              {isHovering && <p id="gotoyouraccounttext">Go to your account</p>}

              {user ? (
                <div
                  style={{
                    marginLeft: "5px",
                    padding: "5px",
                    boxShadow:
                      "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  className="userWhenLoggedIn"
                  onClick={goToAccounts}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  {/* {user.name} */}
                  {user.name}
                </div>
              ) : (
                <div
                  style={{
                    marginLeft: "5px",
                    padding: "5px",
                    boxShadow:
                      "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  <SignUpButton />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {isMobile && location.pathname === "/" ? (
        <div
          style={{
            width: "94%",
            padding: "2px",
            margin: "auto",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "40px",
              display: "flex",
              alignItems: "center",
              boxShadow:
                "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
              borderRadius: "6px",
              padding: "0px 8px",
            }}
          >
            <SearchIcon sx={{ color: "grey" }} />
            <input
              style={{
                width: "90%",
                height: "100%",
                outline: "none",
                border: "none",
                fontSize: "14px",
              }}
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
            />
            <div className="searchRenderProducts">
              {searchResults.map((product, index) => {
                return (
                  <Link
                    key={index}
                    to={`/${product.category}/${product.productId}`}
                    onClick={() => {
                      setSearchResults([]);
                    }}
                  >
                    <div className="searchProductDiv" key={index}>
                      <div className="searchProductImage">
                        <img
                          src={product.productImages[0]}
                          alt={product.productName}
                        />
                      </div>
                      <div className="searchProductInfo">
                        <p style={{ marginBottom: "3px" }}>
                          {product.productName}
                        </p>
                        <p>{`₹${product.productSalePrice}`}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="scrolling-wrapper">
            {categories.map((category, index) => (
              <Link to={category.path} key={index} className="card">
                <img
                  src={category.imageLink}
                  alt={category.name}
                  className="card-image"
                />
                <h4 className="card-title">
                  {formatCategoryName(category.name)}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Navbar;
