import React, { createContext, useState, useEffect } from "react";
import services from "../Appwrite/Service"; // Import your service module
import { useContext } from "react";

const UserContext = createContext();
const OrderContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const currentUserData = await services.getCurrentUser();
        setUser(currentUserData);
      } catch (error) {
        throw error;
      }
    }
    fetchCurrentUser();
  }, []);
  const updateUserDetails = (field, value) => {
    setUser((prevUser) => ({
      ...prevUser,
      [field]: value,
    }));
  };
  return (
    <UserContext.Provider value={{ user, setUser, updateUserDetails }}>{children}</UserContext.Provider>
  );
};

// const OrderProvider = ({ children }) => {
//   const { user } = useContext(UserContext);
//   const [orders, setOrders] = useState([]);
//   const [activeOrders, setActiveOrders] = useState([]);
//   const [canceledOrders, setCanceledOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//  const [returnOrders,setReturnOrders] = useState([]);
//   useEffect(() => {
//     const fetchOrders = async () => {
//       setLoading(true);
//       try {
//         if(user){
//         const ordersData = await services.getOrders(user.$id);
//         if (ordersData) {
//           setOrders(ordersData);
//           filteredOrders(ordersData);
//         }
//       }
//       } catch (error) {
//         console.error("Failed to fetch orders:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (user && user.$id) {
//       fetchOrders();
//     }
//   }, [user]);
//   const filteredOrders = (orders) => {
//     const categorizedOrders = orders.reduce(
//       (acc, order) => {
//         const activeProducts = order.products.filter(
//           (product) => !JSON.parse(product).isCancel
//         );
//         const canceledProducts = order.products.filter(
//           (product) => JSON.parse(product).isCancel
//         );
//         const returnProducts = order.products.filter(
//           (product) => JSON.parse(product).isReturn
//         );
//         if (activeProducts.length > 0) {
//           acc.activeOrders.push({ ...order, products: activeProducts });
//         }
//         if (canceledProducts.length > 0) {
//           acc.canceledOrders.push({ ...order, products: canceledProducts });
//         }
//         if (returnProducts.length > 0) {
//           acc.returnOrders.push({ ...order, products: returnProducts });
//         }
//         return acc;
//       },
//       { activeOrders: [], canceledOrders: [], returnOrders: [], }
//     );

//     setActiveOrders(categorizedOrders.activeOrders);
//     setCanceledOrders(categorizedOrders.canceledOrders);
//     setReturnOrders(categorizedOrders.returnOrders);
//   };

//   const handleProductCancellation = (orderId, productId) => {
//     const updatedOrders = orders.map((order) => {
//       if (order.$id === orderId) {
//         const updatedProducts = order.products.map((product) => {
//           const parsedProduct = JSON.parse(product);
//           if (parsedProduct.productId === productId) {
//             parsedProduct.isCancel = true;
//           }
//           return JSON.stringify(parsedProduct);
//         });
//         return { ...order, products: updatedProducts };
//       }
//       return order;
//     });

//     setOrders(updatedOrders);
//     filteredOrders(updatedOrders);
//   };

//   const handleReturnProduct = (orderId, productId) => {
//     const updatedOrders = orders.map((order) => {
//       if (order.$id === orderId) {
//         const updatedProducts = order.products.map((product) => {
//           const parsedProduct = JSON.parse(product);
//           if (parsedProduct.productId === productId) {
//             parsedProduct.isReturn = true;
//           }
//           return JSON.stringify(parsedProduct);
//         });
//         return { ...order, products: updatedProducts };
//       }
//       return order;
//     });

//     setOrders(updatedOrders);
//     filteredOrders(updatedOrders);
//   };

//   return (
//     <OrderContext.Provider value={{
//       orders,
//       setOrders,
//       activeOrders,
//       setActiveOrders,
//       canceledOrders,
//       setCanceledOrders,
//       loading,
//       filteredOrders,
//       handleProductCancellation,
//       handleReturnProduct,
//       returnOrders,
//       setReturnOrders
//     }}>
//       {children}
//     </OrderContext.Provider>
//   );
// };

export { UserContext, UserProvider };