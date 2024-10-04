import { React, useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import { useContext } from "react";
import { UserContext } from "./UserContext";
import { useParams, useNavigate } from "react-router-dom";
import { addDays, format, parseISO } from "date-fns";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { toast } from "react-toastify";
import services from "../Appwrite/Service";
import { Oval } from "react-loader-spinner";
import "../Styles/Order.css";
import conf from "../conf/conf";
import LoadingOverlay from "./LoadingOverlay";

const useOrderDetails = (orderId) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const orderData = await services.databases.getDocument(
          conf.appwriteDatabaseId,
          conf.appwriteOrdersCollectionId,
          orderId
        );
        if (orderData) {
          setOrder(orderData);
        } else {
          setError("No such document!");
        }
      } catch (err) {
        setError("Error fetching order details: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  return { order, loading, error };
};

const Orders = () => {
  const [activeId, setActiveId] = useState("Orders");
  const { user } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returnOrders, setReturnOrders] = useState([]);
  const [canceledOrders, setCanceledOrders] = useState([]);
  // const { orders,setOrders,canceledOrders, setCanceledOrders,returnOrders,setReturnOrders,activeOrders,setActiveOrders,handleReturnProduct, } = useContext(OrderContext);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (user) {
          const ordersData = await services.getOrders(user.$id);
          if (ordersData) {
            setOrders(ordersData);
            filteredOrders(ordersData);
          }
        }
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const filteredOrders = (orders) => {
    const categorizedOrders = orders.reduce(
      (acc, order) => {
        const activeProducts = order.products.filter((product) => {
          const parsedProduct = JSON.parse(product);
          return !parsedProduct.isCancel && !parsedProduct.isReturn;
        });
        const canceledProducts = order.products.filter((product) => {
          const parsedProduct = JSON.parse(product);
          return parsedProduct.isCancel && !parsedProduct.isReturn;
        });
        const returnProducts = order.products.filter((product) => {
          const parsedProduct = JSON.parse(product);
          return !parsedProduct.isCancel && parsedProduct.isReturn;
        });
        if (activeProducts.length > 0) {
          acc.activeOrders.push({ ...order, products: activeProducts });
        }
        if (canceledProducts.length > 0) {
          acc.canceledOrders.push({ ...order, products: canceledProducts });
        }
        if (returnProducts.length > 0) {
          acc.returnOrders.push({ ...order, products: returnProducts });
        }
        return acc;
      },
      { activeOrders: [], canceledOrders: [], returnOrders: [] }
    );

    setActiveOrders(categorizedOrders.activeOrders);
    setCanceledOrders(categorizedOrders.canceledOrders);
    setReturnOrders(categorizedOrders.returnOrders);
  };
  const handleProductCancellation = (orderId, productId) => {
    const updatedOrders = orders.map((order) => {
      if (order.$id === orderId) {
        const updatedProducts = order.products.map((product) => {
          const parsedProduct = JSON.parse(product);
          if (parsedProduct.productId === productId) {
            parsedProduct.isCancel = true;
          }
          return JSON.stringify(parsedProduct);
        });
        return { ...order, products: updatedProducts };
      }
      return order;
    });

    setOrders(updatedOrders);
    filteredOrders(updatedOrders);
  };

  const handleReturnProduct = (orderId, productId) => {
    const updatedOrders = orders.map((order) => {
      if (order.$id === orderId) {
        const updatedProducts = order.products.map((product) => {
          const parsedProduct = JSON.parse(product);
          if (parsedProduct.productId === productId) {
            parsedProduct.isReturn = true;
          }
          return JSON.stringify(parsedProduct);
        });
        return { ...order, products: updatedProducts };
      }
      return order;
    });

    setOrders(updatedOrders);
    filteredOrders(updatedOrders);
  };

  return (
    <div className="lOrder-main">
      <div className="mOrder-first-section">
        <div className="mOrder-h1">
          <h1>Your Orders</h1>
        </div>
      </div>
      <div className="kOrder-sec-two">
        {["Orders", "Cancelled Orders", "Return Orders"].map((tag) => (
          <p
            className="kOrder-sec-two-p"
            key={tag}
            style={{
              cursor: "pointer",
              textDecoration: activeId === tag ? "underline" : "none",
            }}
            onClick={() => setActiveId(tag)}
          >
            {tag}
          </p>
        ))}
      </div>
      <div id="main-content">
        {activeId === "Orders" ? (
          <OrderContent
            activeOrders={activeOrders}
            loading={loading}
            onProductCancel={handleProductCancellation}
            onProductReturn={handleReturnProduct}
            manageFilteredOrders={filteredOrders}
          />
        ) : activeId === "Cancelled Orders" ? (
          <Cancell canceledOrders={canceledOrders} />
        ) : activeId === "Return Orders" ? (
          <ReturnOrder activeOrders={returnOrders} loading={loading} />
        ) : null}
      </div>
    </div>
  );
};

const ReturnOrder = ({ activeOrders, loading }) => {
  const [returnStatus, setReturnStatus] = useState("Approval Pending");
  const isMobile = window.innerWidth <= 768;
  const navigate = useNavigate();

  useEffect(() => {
    if (activeOrders.length > 0 && activeOrders[0].products.length > 0) {
      const status = JSON.parse(activeOrders[0].products[0]).returnStatus;
      setReturnStatus(status);
    }
  }, [activeOrders]);

  if (loading) {
    return <LoadingOverlay visible={loading} />;
  }

  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, "dd-MM-yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };
  const extractName = (address) =>
    address ? address.split(",")[0].trim() : "Unknown";

  const viewItems = (category, productId) => {
    navigate(`/${category}/${productId}`);
  };

  const goContact = () => {
    navigate("/contactus");
  };

  const writeProductReview = (productId) => {
    navigate(`/createreview/${productId}`);
  };
  return (
    <>
      {activeOrders.length === 0 ? (
        <h2
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "40vh",
            color: "rgb(225, 0, 0)",
          }}
        >
          You have no orders.
        </h2>
      ) : (
        <div className="iOrder-detail-main">
          {activeOrders.map((order) => (
            <div key={order.$id}>
              <div className="iOrder-first-sec">
                <div className="iOrder-first-sec-first">
                  <div>
                    <p>Order Placed</p>
                    <p>{formatDate(order.$createdAt)}</p>
                  </div>
                  <div>
                    <p>Total</p>
                    <p>{order.returnAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p>Ship To</p>
                    <p>{extractName(order.address)}</p>
                  </div>
                </div>
                <div className="iOrder-first-sec-sec">
                  <div style={{ width: "110%" }}>
                    <p>Order # {order.$id}</p>
                  </div>
                </div>
              </div>
              <div className="iOrder-details-sec-sec">
                <h1 className="iOrder-t-h1">{returnStatus}</h1>
              </div>
              <div>
                {order.products.map(
                  (item, index) => (
                    (item = JSON.parse(item)),
                    isMobile ? (
                      <div
                        className="iOrder-details-sec-third"
                        style={{ width: "100%" }}
                      >
                        <div className="iOrder-details-sec-third-first">
                          <img src={item.productImage} alt="main" />
                        </div>
                        <div className="iOrder-details-sec-third-second">
                          <p className="iOrder-details-p1">
                            {item.productName}
                          </p>
                          <p className="iOrder-details-p">{item.productName}</p>
                          <p className="iOrder-details-p5">{returnStatus}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="iOrder-details-sec-third">
                        <div className="iOrder-details-sec-third-first">
                          <img src={item.productImage} alt="main" />
                        </div>
                        <div className="iOrder-details-sec-third-second">
                          <p className="iOrder-details-p1">
                            {item.productName}
                          </p>
                          <p className="iOrder-details-p">{item.productName}</p>
                          <p className="iOrder-details-p5"></p>
                          <div className="iOrder-pp">
                            <p>Price: {item.productPrice}</p>
                            <p>Color: {item.productColor}</p>
                            <p>Size: {item.productSize}</p>
                          </div>
                        </div>
                        <div className="iOrder-details-sec-third-third">
                          <button
                            className="iOrder-b1"
                            onClick={() =>
                              viewItems(item.productCategory, item.productId)
                            }
                          >
                            View items
                          </button>
                          <button className="iOrder-b2" onClick={goContact}>
                            Get product support
                          </button>
                          <button
                            className="iOrder-b1"
                            onClick={() => {
                              writeProductReview(item.productId);
                            }}
                          >
                            Write product review
                          </button>
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

const Cancell = ({ canceledOrders }) => {
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(false);
  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    if (canceledOrders.length === 0) {
      setLoading(false);
      setActive(true);
    } else {
      setActive(false);
      setLoading(false);
    }
  }, [canceledOrders]);
  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, "dd-MM-yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };
  const extractName = (address) =>
    address ? address.split(",")[0].trim() : "Unknown";

  return (
    <>
      {loading ? (
        <LoadingOverlay visible={loading} />
      ) : active ? (
        <h2
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "40vh",
            color: "rgb(225, 0, 0)",
          }}
        >
          No cancelled orders
        </h2>
      ) : (
        <div className="iOrder-detail-main">
          {canceledOrders.map((order) => (
            <div key={order.$id}>
              <div className="iOrder-first-sec">
                <div className="iOrder-first-sec-first">
                  <div>
                    <p>Order Placed</p>
                    <p>{formatDate(order.$createdAt)}</p>
                  </div>
                  <div>
                    <p>Total</p>
                    <p>{order.cancelAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p>Ship To</p>
                    <p>{extractName(order.address)}</p>
                  </div>
                </div>
                <div className="iOrder-first-sec-sec">
                  <div style={{ width: "110%" }}>
                    <p>Order # {order.$id}</p>
                  </div>
                </div>
              </div>
              <div>
                {order.products.map(
                  (item, index) => (
                    (item = JSON.parse(item)),
                    isMobile ? (
                      <div
                        className="iOrder-details-sec-third"
                        key={item.id}
                        style={{ width: "100%" }}
                      >
                        <div className="iOrder-details-sec-third-first">
                          <img src={item.productImage} alt="main" />
                        </div>
                        <div className="iOrder-details-sec-third-second">
                          <p className="iOrder-details-p1">
                            {item.productName}
                          </p>
                          <p className="iOrder-details-p">{item.productName}</p>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="iOrder-details-sec-third"
                        key={item.productId}
                      >
                        <div className="iOrder-details-sec-third-first">
                          <img src={item.productImage} alt="main" />
                        </div>
                        <div className="iOrder-details-sec-third-second">
                          <p className="iOrder-details-p1">
                            {item.productName}
                          </p>
                          <p className="iOrder-details-p">{item.productName}</p>
                          <div className="iOrder-pp">
                            <p>Price: {item.productPrice}</p>
                            <p>Color: {item.productColor}</p>
                            <p>Size: {item.productSize}</p>
                          </div>
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

const OrderContent = ({
  activeOrders,
  loading,
  onProductCancel,
  onProductReturn,
}) => {
  const { user } = useContext(UserContext);
  const isMobile = window.innerWidth <= 768;
  const [showPopup, setShowPopup] = useState(false);
  const [showReturnPopup, setReturnShowPopup] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [selectedReturnReason, setReturnSelectedReason] = useState("");
  const [currentOrder, setCurrentOrder] = useState(null);
  const [currentReturnOrder, setReturnCurrentOrder] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [currentReturnProduct, setReturnCurrentProduct] = useState(null);

  const navigate = useNavigate();
  if (loading) {
    return <LoadingOverlay visible={loading} />;
  }

  const handleViewDetails = (orderId, productId) => {
    navigate(`/orders/showorderdetails/${orderId}/${productId}`);
  };
  const handleCancelOrder = async (orderId, productId) => {
    try {
      const order = activeOrders.find((o) => o.$id === orderId);
      let newOrderAmount = order.orderAmount;
      let newCancelAmount = order.cancelAmount;
      const updatedProducts = order.products.map((product) => {
        product = JSON.parse(product);
        if (product.productId === productId) {
          product.isCancel = true;
          newOrderAmount -= product.productPrice; // Subtract the price of the canceled product
          newCancelAmount += product.productPrice; // Subtract the price of the canceled product
          return JSON.stringify(product);
        } else {
          return JSON.stringify(product);
        }
      });

      await services.updateOrder(orderId, {
        products: updatedProducts,
        orderAmount: newOrderAmount,
        cancelAmount: newCancelAmount,
      });

      onProductCancel(orderId, productId);
    } catch (error) {
      throw error;
    }
  };

  const handleReturnOrder = async (orderId, productId, reason, user) => {
    try {
      const order = activeOrders.find((o) => o.$id === orderId);
      let newOrderAmount = order.orderAmount;
      let newReturnAmount = order.returnAmount;
      const updatedProducts = order.products.map((product) => {
        product = JSON.parse(product);
        if (product.productId === productId) {
          product.isReturn = true;
          newOrderAmount -= product.productPrice; // Subtract the price of the canceled product
          newReturnAmount += product.productPrice; // Subtract the price of the canceled product
          return JSON.stringify(product);
        } else {
          return JSON.stringify(product);
        }
      });

      await services.updateOrder(orderId, {
        products: updatedProducts,
        orderAmount: newOrderAmount,
        returnAmount: newReturnAmount,
      });
      onProductReturn(orderId, productId);
    } catch (error) {
      throw error;
    }
  };

  const handleButtonClick = (orderId, productId) => {
    setCurrentOrder(orderId);
    setCurrentProduct(productId);
    setShowPopup(true);
  };

  const handleReturnButtonClick = (orderId, productId) => {
    setReturnCurrentOrder(orderId);
    setReturnCurrentProduct(productId);
    setReturnShowPopup(true);
  };

  const trackYourOrder = (orderId, trackingId) => {
    toast.warn("This will updated soon!");
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleReturnClosePopup = () => {
    setReturnShowPopup(false);
  };

  const handleReasonChange = (event) => {
    setSelectedReason(event.target.value);
  };

  const handleReturnReasonChange = (event) => {
    setReturnSelectedReason(event.target.value);
  };

  const handleSubmit = () => {
    handleCancelOrder(currentOrder, currentProduct, selectedReason);
    setShowPopup(false);
  };

  const handleReturnSubmit = () => {
    handleReturnOrder(
      currentReturnOrder,
      currentReturnProduct,
      selectedReturnReason,
      user
    );
    setReturnShowPopup(false);
  };

  const isReturnButtonVisible = (order) => {
    const date = new Date(order.$createdAt);
    date.setDate(date.getDate() + 14);
    const currentDate = new Date();
    const timeDiff = date.getTime() - currentDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff <= 14;
  };

  const handleInvoiceClick = (order) => {
    generateInvoicePDF(user, order)
      .then((pdfBytes) => {
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `${order.$id}.pdf`;
        link.click();
      })
      .catch((error) => {
        throw error;
      });
  };
  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, "dd-MM-yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };
  const extractName = (address) =>
    address ? address.split(",")[0].trim() : "Unknown";

  const viewItems = (category, productId) => {
    navigate(`/${category}/${productId}`);
  };

  const goContact = () => {
    navigate("/contactus");
  };

  const writeProductReview = (productId) => {
    navigate(`/createreview/${productId}`);
  };
  return (
    <>
      {activeOrders.length === 0 ? (
        <h2
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "40vh",
            color: "rgb(225, 0, 0)",
          }}
        >
          You have no orders.
        </h2>
      ) : (
        <div className="iOrder-detail-main">
          {activeOrders.map((order) => (
            <div key={order.$id}>
              <div className="iOrder-first-sec">
                <div className="iOrder-first-sec-first">
                  <div>
                    <p>Order Placed</p>
                    <p>{formatDate(order.$createdAt)}</p>
                  </div>
                  <div>
                    <p>Total</p>
                    <p>{order.orderAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p>Ship To</p>
                    <p>{extractName(order.address)}</p>
                  </div>
                  {order.orderStatus !== "delivered" ? (
                    <div>
                      <p>Tracking ID</p>
                      <p>{order.trackingId}</p>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
                <div className="iOrder-first-sec-sec">
                  <div style={{ width: "110%" }}>
                    <p>Order # {order.$id}</p>
                    <div
                      style={{
                        width: "90%",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Link to={`/orders/orderdetails/${order.$id}`}>
                        <p>
                          View order details
                          <span
                            style={{
                              borderLeft: "2px solid black",
                              marginRight: "4px",
                              marginLeft: "4px",
                            }}
                          ></span>
                        </p>
                      </Link>
                      <p
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          handleInvoiceClick(order);
                        }}
                      >
                        Invoice
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="iOrder-details-sec-sec">
                <h1 className="iOrder-t-h1">{order.orderStatus}</h1>
              </div>
              <div>
                {order.products.map(
                  (item, index) => (
                    (item = JSON.parse(item)),
                    isMobile ? (
                      <div
                        className="iOrder-details-sec-third"
                        style={{ width: "100%" }}
                      >
                        <div className="iOrder-details-sec-third-first">
                          <img src={item.productImage} alt="main" />
                        </div>
                        <div className="iOrder-details-sec-third-second">
                          <p className="iOrder-details-p1">
                            {item.productName}
                          </p>
                          <p className="iOrder-details-p">{item.productName}</p>
                          <p className="iOrder-details-p5">
                            {order.orderStatus}
                          </p>
                          <div style={{ width: "130%", display: "flex" }}>
                            {isMobile ? (
                              <button
                                className="iOrder-b"
                                onClick={() =>
                                  handleViewDetails(order.$id, item.productId)
                                }
                              >
                                View details
                              </button>
                            ) : (
                              ""
                            )}
                            {isMobile && order.orderStatus !== "delivered" ? (
                              <button
                                className="iOrder-b3"
                                onClick={() => {
                                  handleButtonClick(order.$id, item.productId);
                                }}
                              >
                                Cancel this item
                              </button>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="iOrder-details-sec-third">
                        <div className="iOrder-details-sec-third-first">
                          <img src={item.productImage} alt="main" />
                        </div>
                        <div className="iOrder-details-sec-third-second">
                          <p className="iOrder-details-p1">
                            {item.productName}
                          </p>
                          <p className="iOrder-details-p">{item.productName}</p>
                          <p className="iOrder-details-p5">
                            {order.orderStatus}
                          </p>
                          <div className="iOrder-pp">
                            <p>Price: {item.productPrice}</p>
                            <p>Color: {item.productColor}</p>
                            <p>Size: {item.productSize}</p>
                          </div>
                          <div className="bOrder-button">
                            {isReturnButtonVisible(order) && (
                              <button
                                className="iOrder-b1"
                                onClick={() => {
                                  handleReturnButtonClick(
                                    order.$id,
                                    item.productId
                                  );
                                }}
                              >
                                Return this item
                              </button>
                            )}
                            {order.orderStatus !== "delivered" ? (
                              <button
                                className="iOrder-b2"
                                onClick={() => {
                                  handleButtonClick(order.$id, item.productId);
                                }}
                              >
                                Cancel this item
                              </button>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                        <div className="iOrder-details-sec-third-third">
                          {order.orderStatus === "delivered" ? (
                            <button
                              className="iOrder-b1"
                              onClick={() =>
                                viewItems(item.productCategory, item.productId)
                              }
                            >
                              View items
                            </button>
                          ) : (
                            ""
                          )}
                          <button className="iOrder-b2" onClick={goContact}>
                            Get product support
                          </button>
                          <button
                            className="iOrder-b1"
                            onClick={() => {
                              writeProductReview(item.productId);
                            }}
                          >
                            Write product review
                          </button>
                          {order.orderStatus !== "delivered" ? (
                            <button
                              className="iOrder-b1"
                              onClick={() => {
                                trackYourOrder(order.$id, order.trackingId);
                              }}
                            >
                              Track your order
                            </button>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Why do you want to cancel this order?</h3>
            <select value={selectedReason} onChange={handleReasonChange}>
              <option value="">Select cancellation reason</option>
              <option value="mistake">Order created by mistake</option>
              <option value="time">Items would not arrive on time</option>
              <option value="price">Item price too high</option>
              <option value="cheaper">Found cheaper somewhere else</option>
              <option value="shipping">Need to change shipping address</option>
              <option value="payment">Need to change payment method</option>
            </select>
            <button onClick={handleSubmit} className="pop-btn">
              Submit
            </button>
            <button onClick={handleClosePopup} className="pop-btn">
              Close
            </button>
          </div>
        </div>
      )}
      {showReturnPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Why do you want to return this order?</h3>
            <select
              value={selectedReturnReason}
              onChange={handleReturnReasonChange}
            >
              <option value="">Select return reason</option>
              <option value="mistake">Order created by mistake</option>
              <option value="time">Items would not arrive on time</option>
              <option value="price">Item price too high</option>
              <option value="cheaper">Found cheaper somewhere else</option>
              <option value="shipping">Need to change shipping address</option>
              <option value="payment">Need to change payment method</option>
            </select>
            <button onClick={handleReturnSubmit} className="pop-btn">
              Submit
            </button>
            <button onClick={handleReturnClosePopup} className="pop-btn">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const generateInvoicePDF = async (userDetails, orderDetails) => {
  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, "dd-MM-yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, "HH:mm:ss");
    } catch (error) {
      return "Invalid date";
    }
  };

  const date = formatDate(orderDetails.$createdAt);

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);

  // Define margins
  const margin = 30; // Reduced margin for the table

  // Set up font and text size
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12; // Smaller font size for table content
  const headerFontSize = 10; // Slightly larger font size for headers

  // Function to draw wrapped text
  const drawWrappedText = (text, x, y, maxWidth) => {
    const words = text.split(" ");
    let line = "";
    let lineY = y;

    for (const word of words) {
      const testLine = line + word + " ";
      const testWidth = helveticaFont.widthOfTextAtSize(testLine, fontSize);
      if (testWidth > maxWidth) {
        page.drawText(line.trim(), {
          x: x,
          y: lineY,
          size: fontSize,
          font: helveticaFont,
        });
        line = word + " ";
        lineY -= fontSize + 1; // Move down for the next line
      } else {
        line = testLine;
      }
    }
    if (line) {
      page.drawText(line.trim(), {
        x: x,
        y: lineY,
        size: fontSize,
        font: helveticaFont,
      });
    }
  };

  // Add heading
  page.drawText("Zorawear Private Limited", {
    x: margin,
    y: 750,
    size: 20,
    font: helveticaFont,
  });
  drawWrappedText(
    `Address- 368, Ghas bazar, Bandra East, Mumbai, Maharashtra - 400051`,
    margin,
    730,
    600 - 2 * margin
  );

  // Draw horizontal line
  page.drawLine({
    start: { x: margin, y: 720 },
    end: { x: 600 - margin, y: 720 },
    thickness: 4,
  });

  page.drawText("Original Copy", {
    x: 600 - margin - 100,
    y: 700,
    size: 15,
    font: helveticaFont,
  });

  // Add invoice info
  const invoiceInfo = [
    { label: "Invoice ID:", value: orderDetails.$id },
    { label: "Invoice Date:", value: formatDate(orderDetails.$createdAt) },
    { label: "Invoice Time:", value: formatTime(orderDetails.$createdAt) },
    // { label: "Salesperson:", value: "Abdul Samad" },
  ];

  let startY = 680;
  for (let i = 0; i < invoiceInfo.length - 1; i++) {
    let info = invoiceInfo[i];
    let info1 = invoiceInfo[i + 1];
    page.drawText(`${info.label} ${info.value}`, {
      x: margin,
      y: startY,
      size: fontSize,
      font: helveticaFont,
    });
    page.drawText(`${info1.label} ${info1.value}`, {
      x: 600 - margin - 150,
      y: startY,
      size: fontSize,
      font: helveticaFont,
    });
    startY -= 20;
    i++;
  }

  // Draw horizontal line
  page.drawLine({
    start: { x: margin, y: startY },
    end: { x: 600 - margin, y: startY },
    thickness: 1,
  });

  // Add Billed to section
  page.drawText("Billed to:", {
    x: margin,
    y: startY - 20,
    size: fontSize,
    font: helveticaFont,
  });

  const billedToInfo = [
    { label: "Name:", value: userDetails.name },
    { label: "Email:", value: userDetails.email },
    { label: "Address:", value: orderDetails.address },
  ];

  startY -= 40;
  for (const info of billedToInfo) {
    drawWrappedText(
      `${info.label} ${info.value}`,
      margin,
      startY,
      600 - 2 * margin
    );
    startY -= 20;
  }

  // Draw horizontal line
  page.drawLine({
    start: { x: margin, y: startY - 5 },
    end: { x: 600 - margin, y: startY - 5 },
    thickness: 1,
  });

  // Draw product table
  const tableStartY = startY - 20; // Adjust starting Y position for the table
  const tableColumnWidths = [40, 280, 45, 60, 60, 50]; // Adjusted widths
  const tableColumnNames = [
    "S.No.",
    "Description",
    "Qty",
    "6% SGST",
    "6% CGST",
    "Price",
  ];
  const tableRowHeight = 25; // Reduced row height

  // Draw table header
  let tableY = tableStartY;
  for (let i = 0; i < tableColumnNames.length; i++) {
    const columnName = tableColumnNames[i];
    const columnX =
      margin + tableColumnWidths.slice(0, i).reduce((a, b) => a + b, 0);
    page.drawText(columnName, {
      x: columnX,
      y: tableY,
      size: headerFontSize,
      font: helveticaFont,
    });
  }
  tableY -= tableRowHeight;

  // Draw table rows
  for (const product of orderDetails.products) {
    const productData = JSON.parse(product);
    const productName = productData.productName || "N/A";
    const productQuantity = parseInt(productData.productQuantity, 10) || 0;
    const productPrice = productData.productPrice || 0;
    const productSGST = (productPrice * 0.06).toFixed(2);
    const productCGST = (productPrice * 0.06).toFixed(2);

    let rowY = tableY; // Define rowY for each row
    page.drawText((orderDetails.products.indexOf(product) + 1).toString(), {
      x: margin,
      y: rowY,
      size: fontSize,
      font: helveticaFont,
    });
    drawWrappedText(
      productName,
      margin + tableColumnWidths[0],
      rowY,
      tableColumnWidths[1]
    );
    page.drawText(productQuantity.toString(), {
      x: margin + tableColumnWidths[0] + tableColumnWidths[1],
      y: rowY,
      size: fontSize,
      font: helveticaFont,
    });
    page.drawText(productSGST, {
      x:
        margin +
        tableColumnWidths[0] +
        tableColumnWidths[1] +
        tableColumnWidths[2],
      y: rowY,
      size: fontSize,
      font: helveticaFont,
    });
    page.drawText(productCGST, {
      x:
        margin +
        tableColumnWidths[0] +
        tableColumnWidths[1] +
        tableColumnWidths[2] +
        tableColumnWidths[3],
      y: rowY,
      size: fontSize,
      font: helveticaFont,
    });
    page.drawText(productPrice.toFixed(2), {
      x:
        margin +
        tableColumnWidths[0] +
        tableColumnWidths[1] +
        tableColumnWidths[2] +
        tableColumnWidths[3] +
        tableColumnWidths[4],
      y: rowY,
      size: fontSize,
      font: helveticaFont,
    });
    tableY -= tableRowHeight; // Update tableY for the next row
  }

  // Draw horizontal line below the table
  page.drawLine({
    start: { x: margin, y: tableY + 20 },
    end: { x: 600 - margin, y: tableY + 20 },
    thickness: 1,
  });

  let totalAmount = 0;
  for (const product of orderDetails.products) {
    const productData = JSON.parse(product);
    const productPrice =
      parseFloat(productData.productPrice) * productData.productQuantity || 0;
    totalAmount += productPrice;
  }

  page.drawText(`Total Amount: ${totalAmount.toFixed(2)}`, {
    x: margin + tableColumnWidths.slice(0, 3).reduce((a, b) => a + b, 0),
    y: tableY - 0,
    size: 16,
    font: helveticaFont,
  });

  page.drawLine({
    start: { x: margin, y: tableY - 10 },
    end: { x: 600 - margin, y: tableY - 10 },
    thickness: 1,
  });

  page.drawText(`Terms & Conditions:`, {
    x: margin,
    y: tableY - 40,
    size: 16,
    font: helveticaFont,
  });

  page.drawText(
    `1) The invoice details the products purchased, including quantity, description, and price per unit.`,
    {
      x: margin,
      y: tableY - 60,
      size: 11,
      font: helveticaFont,
    }
  );
  page.drawText(
    `2) Goods returned for refund or exchange must be in original condition and within 7 days from delivered.`,
    {
      x: margin,
      y: tableY - 80,
      size: 11,
      font: helveticaFont,
    }
  );
  page.drawText(
    `3) Any disputes regarding the invoice must be notified within 7 days of receipt.`,
    {
      x: margin,
      y: tableY - 100,
      size: 11,
      font: helveticaFont,
    }
  );
  page.drawText(
    `4) Customer information provided will be used solely for the purpose of fulfilling the transaction.`,
    {
      x: margin,
      y: tableY - 120,
      size: 11,
      font: helveticaFont,
    }
  );
  page.drawText(
    `5) Buyer must inspect and accept goods promptly upon delivery.`,
    {
      x: margin,
      y: tableY - 140,
      size: 11,
      font: helveticaFont,
    }
  );

  page.drawText("Abdul Samad", {
    x: 600 - margin - 125,
    y: 70,
    size: 11,
    font: helveticaFont,
  });

  page.drawText("Authorized Signature", {
    x: 600 - margin - 150,
    y: 50,
    size: fontSize,
    font: helveticaFont,
  });

  // Save the PDF to a buffer
  const pdfBytes = await pdfDoc.save();

  // Return the PDF buffer
  return pdfBytes;
};

const OrderDetails = () => {
  const { orderId } = useParams();
  const [active, setActive] = useState(false);
  const isMobile = window.innerWidth <= 768;
  const { user } = useContext(UserContext);
  let { order, loading, error } = useOrderDetails(orderId);
  if (loading) {
    return loading ? (
      <div className="spinner-container">
        <Oval
          height={50}
          width={50}
          color="#901454"
          visible={true}
          ariaLabel="oval-loading"
          secondaryColor="#f3f3f3"
          strokeWidth={4}
          strokeWidthSecondary={4}
        />
      </div>
    ) : (
      setActive(true)
    );
  }

  let total;
  let subtotal;
  let cgst;
  let sgst;

  const calculateSubtotal = () => {
    let subtotal = order.orderAmount - order.orderAmount * 0.12;
    return subtotal;
  };

  const calculateSGST = () => {
    let sgst = order.orderAmount * 0.06;

    return sgst;
  };

  const calculateCGST = () => {
    let cgst = order.orderAmount * 0.06;
    return cgst;
  };
  subtotal = calculateSubtotal();
  sgst = calculateSGST();
  cgst = calculateCGST();
  total = subtotal + sgst + cgst;

  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, "dd-MM-yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleInvoiceClick = (orders) => {
    generateInvoicePDF(user, orders)
      .then((pdfBytes) => {
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `${orders.$id}.pdf`;
        link.click();
      })
      .catch((error) => {
        throw error;
      });
  };
  return (
    <>
      {active ? (
        <h2
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "10vh",
            color: "red",
          }}
        >
          order details not available!
        </h2>
      ) : (
        <div className="pOrder-details-main">
          <h1
            style={{ fontWeight: "lighter", marginBottom: "15px" }}
            className="pOrder-f"
          >
            View order details
          </h1>
          <div className="pOrder-details-main-first">
            {isMobile ? (
              <div className="pOrder-first-first">
                <div>
                  <p>Order date</p>
                  <p>{formatDate(order.$createdAt)}</p>
                </div>
                <div>
                  <p>Order #</p>
                  <p>{orderId}</p>
                </div>
              </div>
            ) : (
              <div className="porder-firstchild">
                <p>
                  Ordered date {formatDate(order.$createdAt)}
                  <span className="span2"></span>
                </p>
                <p>OrderId# {orderId}</p>
              </div>
            )}
            <div>
              {isMobile ? (
                <div className="lPOrder">
                  <p
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      handleInvoiceClick(order);
                    }}
                  >
                    Download Invoice
                  </p>
                  <p>{">"}</p>
                </div>
              ) : (
                <p
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    handleInvoiceClick(order);
                  }}
                >
                  Invoice
                </p>
              )}
            </div>
          </div>
          <div className="pOrder-details-main-section">
            <div className="pfirst-section">
              <h2 className="ph2">Shipping Address</h2>
              <p className="nBorder">{order.address}</p>
            </div>
            <div className="psecond-section">
              <h2 className="ph2">Payment Methods</h2>
              <p className="nBorder">{order.paymentMethod}</p>
            </div>
            <div className="pthird-section">
              <h2 className="ph2">Order Summary</h2>
              <div className="u2">
                <div>
                  <p>Subtotal</p>
                  <p>{subtotal.toFixed(2)}</p>
                </div>
                <div>
                  <p>SGST 6%</p>
                  <p>{sgst.toFixed(2)}</p>
                </div>
                <div>
                  <p>CGST 6%</p>
                  <p>{cgst.toFixed(2)}</p>
                </div>
                <div className="total-price">
                  <h3>Total:</h3>
                  <p>{total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ShowOrderDetails = () => {
  const { orderId, productId } = useParams();
  const { order, loading, error } = useOrderDetails(orderId);
  const { user } = useContext(UserContext);
  // const { handleProductCancellation } = useContext(OrderContext);
  const [active, setActive] = useState(false);
  const [showReturnPopup, setReturnShowPopup] = useState(false);
  const [selectedReturnReason, setReturnSelectedReason] = useState("");
  const [currentReturnOrder, setReturnCurrentOrder] = useState(null);
  const [currentReturnProduct, setReturnCurrentProduct] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  // const [loading, setLoading] = useState(true);
  const [returnOrders, setReturnOrders] = useState([]);
  const [canceledOrders, setCanceledOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (user) {
          const ordersData = await services.getOrders(user.$id);
          if (ordersData) {
            setOrders(ordersData);
            filteredOrders(ordersData);
          }
        }
      } catch (error) {
        throw error;
      }
    };
    fetchOrders();
  }, [user]);

  const filteredOrders = (orders) => {
    const categorizedOrders = orders.reduce(
      (acc, order) => {
        const activeProducts = order.products.filter((product) => {
          const parsedProduct = JSON.parse(product);
          return !parsedProduct.isCancel && !parsedProduct.isReturn;
        });
        const canceledProducts = order.products.filter(
          (product) => JSON.parse(product).isCancel
        );
        const returnProducts = order.products.filter(
          (product) => JSON.parse(product).isReturn
        );
        if (activeProducts.length > 0) {
          acc.activeOrders.push({ ...order, products: activeProducts });
        }
        if (canceledProducts.length > 0) {
          acc.canceledOrders.push({ ...order, products: canceledProducts });
        }
        if (returnProducts.length > 0) {
          acc.returnOrders.push({ ...order, products: returnProducts });
        }
        return acc;
      },
      { activeOrders: [], canceledOrders: [], returnOrders: [] }
    );

    setActiveOrders(categorizedOrders.activeOrders);
    setCanceledOrders(categorizedOrders.canceledOrders);
    setReturnOrders(categorizedOrders.returnOrders);
  };

  const handleReturnProduct = (orderId, productId) => {
    const updatedOrders = orders.map((order) => {
      if (order.$id === orderId) {
        const updatedProducts = order.products.map((product) => {
          const parsedProduct = JSON.parse(product);
          if (parsedProduct.productId === productId) {
            parsedProduct.isReturn = true;
          }
          return JSON.stringify(parsedProduct);
        });
        return { ...order, products: updatedProducts };
      }
      return order;
    });

    setOrders(updatedOrders);
    filteredOrders(updatedOrders);
  };

  const handleReturnReasonChange = (event) => {
    setReturnSelectedReason(event.target.value);
  };

  const handleReturnClosePopup = () => {
    setReturnShowPopup(false);
  };

  const handleReturnButtonClick = (orderId, productId) => {
    setReturnCurrentOrder(orderId);
    setReturnCurrentProduct(productId);
    setReturnShowPopup(true);
  };

  const handleReturnOrder = async (orderId, productId, reason, user) => {
    try {
      const order = activeOrders.find((o) => o.$id === orderId);
      let newReturnAmount = order.returnAmount;
      let newOrderAmount = order.orderAmount;
      const updatedProducts = order.products.map((product) => {
        product = JSON.parse(product);
        if (product.productId === productId) {
          product.isReturn = true;
          newOrderAmount -= product.productPrice;
          newReturnAmount += product.productPrice; // Subtract the price of the canceled product
          return JSON.stringify(product);
        } else {
          return JSON.stringify(product);
        }
      });
      await services.updateOrder(orderId, {
        products: updatedProducts,
        orderAmount: newOrderAmount,
        returnAmount: newReturnAmount,
      });
      handleReturnProduct(orderId, productId);
      navigate("/orders");
    } catch (error) {
      throw error;
    }
  };

  const trackYourOrder = (orderId, trackingId) => {
    toast.warn("This will updated soon!");
  };

  const isReturnButtonVisible = (order) => {
    const date = new Date(order.$createdAt);
    date.setDate(date.getDate() + 14);
    const currentDate = new Date();
    const timeDiff = date.getTime() - currentDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff <= 14;
  };

  const handleReturnSubmit = () => {
    handleReturnOrder(
      currentReturnOrder,
      currentReturnProduct,
      selectedReturnReason,
      user,
      activeOrders
    );
    setReturnShowPopup(false);
  };

  const navigate = useNavigate();
  if (loading) {
    return loading ? <LoadingOverlay visible={loading} /> : setActive(true);
  }

  const viewItems = (category, productId) => {
    navigate(`/${category}/${productId}`);
  };
  const writeProductReview = (productId) => {
    navigate(`/createreview/${productId}`);
  };
  const goContact = () => {
    navigate("/contactus");
  };

  const handleInvoiceClick = (order) => {
    generateInvoicePDF(user, order)
      .then((pdfBytes) => {
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `${order.$id}.pdf`;
        link.click();
      })
      .catch((error) => {
        throw error;
      });
  };

  let product = order.products.filter((pro) => {
    pro = JSON.parse(pro);
    if (pro.productId === productId) {
      return pro;
    }
  });
  product = JSON.parse(product[0]);
  return (
    <>
      {active ? (
        <h2
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "10vh",
            color: "red",
          }}
        >
          order details not available!
        </h2>
      ) : (
        <div className="rOrder-details-main">
          <div className="rOrder-details-main-first">
            <img src={product.productImage} alt="Orders-Details" />
            <p>{product.productName}</p>
          </div>

          <div
            className="rOrder-details-main-sec"
            onClick={() =>
              viewItems(product.productCategory, product.productId)
            }
          >
            <p>Buy it again</p>
            <p>{">"}</p>
          </div>
          <div className="dOrder-details-border"></div>
          <div className="rOrder-details-main-third">
            <h1 style={{ fontWeight: "bold", fontSize: "16px" }}>
              Need help with item?
            </h1>
            <div onClick={goContact}>
              <p>Get product support</p>
              <p>{">"}</p>
            </div>
          </div>
          <div className="dOrder-details-border"></div>
          <div className="rOrder-details-main-third">
            <h1 style={{ fontWeight: "bold", fontSize: "16px" }}>
              How's your item?
            </h1>
            <div onClick={() => writeProductReview(product.productId)}>
              <p>Write a product review</p>
              <p>{">"}</p>
            </div>
          </div>
          <div className="dOrder-details-border"></div>
          <div className="rOrder-details-main-third">
            <h1 style={{ fontWeight: "bold", fontSize: "16px" }}>Order info</h1>
            <Link to={`/orders/orderdetails/${orderId}`}>
              <div className="mobRorder">
                <p>View order details</p>
                <p>{">"}</p>
              </div>
            </Link>
            <div
              style={{ cursor: "pointer" }}
              onClick={() => {
                handleInvoiceClick(order);
              }}
            >
              <p>Download Invoice</p>
              <p>{">"}</p>
            </div>
            {order.orderStatus !== "delivered" && (
              <>
                <div
                  onClick={() => {
                    trackYourOrder(orderId, order.trackingId);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <p>Track your order</p>
                  <p>{">"}</p>
                </div>
                <div>
                  <p>Tracking ID</p>
                  <p>{order.trackingId}</p>
                </div>
              </>
            )}
            {isReturnButtonVisible(order) && (
              <div
                onClick={() => {
                  handleReturnButtonClick(orderId, productId);
                }}
                style={{ cursor: "pointer" }}
              >
                <p>Return this item</p>
                <p>{">"}</p>
              </div>
            )}
          </div>
          <div className="dOrder-details-border"></div>
        </div>
      )}
      {showReturnPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Why do you want to return this order?</h3>
            <select
              value={selectedReturnReason}
              onChange={handleReturnReasonChange}
            >
              <option value="">Select return reason</option>
              <option value="mistake">Order created by mistake</option>
              <option value="time">Items would not arrive on time</option>
              <option value="price">Item price too high</option>
              <option value="cheaper">Found cheaper somewhere else</option>
              <option value="shipping">Need to change shipping address</option>
              <option value="payment">Need to change payment method</option>
            </select>
            <button onClick={handleReturnSubmit} className="pop-btn">
              Submit
            </button>
            <button onClick={handleReturnClosePopup} className="pop-btn">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export { Orders, ShowOrderDetails, OrderDetails, useOrderDetails };
