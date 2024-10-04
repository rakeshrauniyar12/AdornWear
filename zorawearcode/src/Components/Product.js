import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import FilterListIcon from "@mui/icons-material/FilterList";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { toast } from "react-toastify";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import LoadingOverlay from "./LoadingOverlay";
import useMediaQuery from "@mui/material/useMediaQuery";
import services from "../Appwrite/Service";

const formatCategoryName = (name) => {
  if (!name) return "";
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const Dropdown = ({ title, options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(title);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    onSelect(option);
  };

  return (
    <div className="dropdown_main">
      <div
        className={`select ${isOpen ? "select-clicked" : ""}`}
        onClick={toggleDropdown}
      >
        <span className="selected">{selectedOption}</span>
        <div className={`caret ${isOpen ? "caret-rotate" : ""}`}></div>
      </div>
      <ul className={`menu ${isOpen ? "menu-open" : ""}`}>
        {options.map((option, index) => (
          <li key={index} onClick={() => handleOptionSelect(option)}>
            {option}
          </li>
        ))}
      </ul>
    </div>
  );
};

const ProductFilterSort = ({
  onFilterClick,
  onSortChange,
  filtersApplied,
  handleResetFilters,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Sort by");

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    onSortChange(option);
  };

  const handleResetSort = () => {
    setSelectedOption("Sort by");
    setIsOpen(false);
    onSortChange("Default");
  };

  return (
    <div id="filter_sort_text">
      <div className="filter_text">
        <p>
          Filter by
          <span id="less_than"></span>
        </p>
        <div id="filterOptionInMobileDevice" onClick={onFilterClick}>
          <div>
            <p style={{ marginRight: "5px" }}>Filter</p>
            <FilterListIcon sx={{ fontSize: "20px" }} />
          </div>
        </div>
      </div>
      {filtersApplied && (
        <div
          onClick={handleResetFilters}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "25px",
            padding: "2px 4px",
            cursor: "pointer",
            fontSize: "12px",
            borderRadius: "5px",
            border: "none",
            outline: "none",
            backgroundColor: "none",
            boxShadow:
              "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
          }}
        >
          Reset Filters
        </div>
      )}
      <div className="dropdown_main_">
        <div
          className={`select_ ${isOpen ? "select_-clicked" : ""}`}
          onClick={toggleDropdown}
        >
          <span className="selected_">{selectedOption}</span>
          <div className={`caret_ ${isOpen ? "caret_-rotate" : ""}`}></div>
        </div>
        <ul className={`menu_2_ ${isOpen ? "menu_2_-open" : ""}`}>
          <li onClick={handleResetSort}>Default</li>
          <li onClick={() => handleOptionSelect("Price: low to high")}>
            Price: low to high
          </li>
          <li onClick={() => handleOptionSelect("Price: high to low")}>
            Price: high to low
          </li>
        </ul>
      </div>
    </div>
  );
};

const Product = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([]);
  const { category, subcategory } = useParams();
  const [sortBy, setSortBy] = useState("Sort by");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [filters, setFilters] = useState({
    Brand: "",
    Color: "",
    SaleDiscount: "",
    Price: "",
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsList = await services.fetchProducts();
        setProducts(productsList);
        setFilteredProducts(productsList);
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const uniqueBrands = Array.from(
        new Set(
          products.map((product) => formatBrandName(product.productBrand))
        )
      );
      setBrands(uniqueBrands);
    }
  }, [products]);

  const formatBrandName = (name) => {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  useEffect(() => {
    if (products.length > 0) {
      setLoading(true);
      const categoryFilteredProducts = products.filter((product) =>
        category ? product.category === category : subcategory ? product.category === subcategory : true
      );
      setFilteredProducts(categoryFilteredProducts)
      setLoading(false);
    }
  }, [category, subcategory, products, filters]);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    let sortedProducts = [...filteredProducts];

    switch (value) {
      case "Price: low to high":
        sortedProducts.sort((a, b) => a.productSalePrice - b.productSalePrice);
        break;
      case "Price: high to low":
        sortedProducts.sort((a, b) => b.productSalePrice - a.productSalePrice);
        break;
      case "Default":
        sortedProducts = products.filter((product) =>
          category
            ? product.category === category
            : product.subcategory === subcategory
        );
        break;
      default:
        break;
    }

    setFilteredProducts(sortedProducts);
  };

  const handleDropdownChange = (filterType) => (value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: value,
    }));
  };

  const handleApplyFilters = () => {
    let tempProducts = products;

    if (category || subcategory) {
      tempProducts = tempProducts.filter((product) =>
        category
          ? product.category === category
          : product.subcategory === subcategory
      );
    }

    if (filters.Brand) {
      const brandToFilter = filters.Brand.toLowerCase();
      tempProducts = tempProducts.filter(
        (product) => product.productBrand.toLowerCase() === brandToFilter
      );
    }

    if (filters.Color) {
      const colorToFilter = filters.Color.toLowerCase();
      tempProducts = tempProducts.filter(
        (product) => product.color.toLowerCase() === colorToFilter
      );
    }

    if (filters.SaleDiscount) {
      tempProducts = tempProducts.filter((product) => {
        const discount = parseInt(product.productDiscount);
        if (filters.SaleDiscount === "No Discount") {
          return discount === 0;
        } else if (filters.SaleDiscount === "Up to 30%") {
          return discount > 0 && discount <= 30;
        } else if (filters.SaleDiscount === "30% - 50%") {
          return discount > 30 && discount <= 50;
        } else if (filters.SaleDiscount === "50% - 60%") {
          return discount > 50 && discount <= 60;
        } else {
          return discount > 60;
        }
      });
    }

    if (filters.Price) {
      tempProducts = tempProducts.filter((product) => {
        const price = parseInt(product.productSalePrice); // Convert price to integer for comparison
        if (filters.Price === "₹0 - ₹499") {
          return price >= 0 && price <= 499;
        } else if (filters.Price === "₹500 - ₹999") {
          return price >= 500 && price <= 999;
        } else if (filters.Price === "₹1000 - ₹1999") {
          return price >= 1000 && price <= 1999;
        } else if (filters.Price === "₹2000 - ₹2999") {
          return price >= 2000 && price <= 2999;
        } else {
          return price >= 3000;
        }
      });
    }

    setFilteredProducts(tempProducts);
    setFiltersApplied(true);
    handleModalClose();
  };

  const handleResetFilters = () => {
    setFilters({
      Brand: "",
      Color: "",
      SaleDiscount: "",
      Price: "",
    });
    setFilteredProducts(filteredProducts);
    setFiltersApplied(false); // Reset filtersApplied to false
  };

  const modalStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  };

  const closeButtonStyle = {
    position: "absolute",
    top: 10,
    right: 10,
  };

  return (
    <div id="productContainer">
      <LoadingOverlay visible={loading} />
      <div id="productHeading">
        <h2 style={{ fontWeight: "500" }}>
          {formatCategoryName(category ? category : subcategory)}
        </h2>
        <p>
          Showing {filteredProducts.length} out of {products.length} products
        </p>
      </div>
      <ProductFilterSort
        onFilterClick={handleModalOpen}
        onSortChange={handleSortChange}
        filtersApplied={filtersApplied}
        handleResetFilters={handleResetFilters}
      />
      <div id="productMain">
        {!isMobile && (
          <div id="productSidebar">
            <Dropdown
              title="Brand"
              options={brands}
              onSelect={handleDropdownChange("Brand")}
            />
            <Dropdown
              title="Color"
              options={[
                "Yellow",
                "White",
                "Brown",
                "Blue",
                "Gray",
                "Green",
                "Khaki",
                "Multicolor",
              ]}
              onSelect={handleDropdownChange("Color")}
            />
            <Dropdown
              title="Sale Discount"
              options={[
                "No Discount",
                "Up to 30%",
                "30% - 50%",
                "50% - 60%",
                "+ 60%",
              ]}
              onSelect={handleDropdownChange("SaleDiscount")}
            />
            <Dropdown
              title="Price"
              options={[
                "₹0 - ₹499",
                "₹500 - ₹999",
                "₹1000 - ₹1999",
                "₹2000 - ₹2999",
                "Above ₹3000",
              ]}
              onSelect={handleDropdownChange("Price")}
            />
            <Button className="filterButtonStyle" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </div>
        )}
        <div id="productDiv">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <div key={index} className="product">
                <Link to={`${product.$id}`}>
                  <div className="productImgDiv">
                    <img
                      src={product.productImages[0]}
                      alt={product.productName}
                    />
                    {/* {product.newarrivals ? (
                      <p className="newArrivalTag">New Arrivals</p>
                    ) : null} */}
                  </div>
                  <div className="productInfoDiv">
                    <p className="productBrand">{product.productBrand}</p>
                    <p className="productTitle">{product.productName}</p>
                    <h2>
                      {`₹${Math.round(product.productSalePrice * 0.95)}`}
                      <span style={{ fontSize: "15px", marginLeft: "5px" }}>
                        <s>{`₹${product.productSalePrice}`}</s>
                      </span>
                    </h2>
                    <p className="freedeliverytext">Free Delivery</p>
                    <div className="productRating">
                      <p className="productRatingText">
                        {product.productRating || 0}
                        <span className="fa fa-star checked"></span>
                      </p>
                      <p className="productReviewsText">
                        {product.productReviews || 0} <span>Reviews</span>
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="noproductfoundtextdiv">
              <h2>No products found!</h2>
            </div>
          )}
        </div>
      </div>
      <Modal open={isModalOpen} onClose={handleModalClose}>
        <Box sx={modalStyle}>
          <IconButton
            aria-label="close"
            onClick={handleModalClose}
            sx={closeButtonStyle}
          >
            <CloseIcon />
          </IconButton>
          <h2
            style={{
              textAlign: "center",
              fontWeight: "lighter",
            }}
          >
            Refined by
          </h2>
          <hr
            style={{
              backgroundColor: "rgb(219, 219, 219)",
              height: "1px",
              border: "none",
            }}
          />
          <Dropdown
            title="Brand"
            options={brands}
            onSelect={handleDropdownChange("Brand")}
          />
          <Dropdown
            title="Color"
            options={[
              "Yellow",
              "White",
              "Brown",
              "Blue",
              "Gray",
              "Green",
              "Khaki",
              "Multicolor",
            ]}
            onSelect={handleDropdownChange("Color")}
          />
          <Dropdown
            title="Sale Discount"
            options={[
              "No Discount",
              "Up to 30%",
              "30% - 50%",
              "50% - 60%",
              "+ 60%",
            ]}
            onSelect={handleDropdownChange("Sale Discount")}
          />
          <Dropdown
            title="Price"
            options={[
              "₹500 - ₹999",
              "₹1000 - ₹1999",
              "₹2000 - ₹2999",
              "Above ₹3000",
            ]}
            onSelect={handleDropdownChange("Price")}
          />
          <Button id="filterMobileButtonStyle" onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default Product;
