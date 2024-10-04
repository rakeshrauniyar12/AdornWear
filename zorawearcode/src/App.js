import { BrowserRouter as Router } from "react-router-dom";
import "./Styles/Model.css";
import "./Styles/Navbar.css";
import "./Styles/Product.css";
import "./Styles/Order.css";
import "./Styles/OrderDetails.css";
import "./Styles/LoginAndSecurity.css";
import "./Styles/EditDetails.css";
import "./Styles/Payment.css";
import "./Styles/ProductDetails.css";
import "./Styles/OrderPlaced.css";
import "./Styles/Cart.css";
import "./Styles/ReturnOrder.css";
import ScrollToTop from "./Components/ScrollToTop";
import Navbar from "./Components/Navbar";
import Content from "./Components/Content";
import Footer from "./Components/Footer";
import { AddressProvider } from '../src/Components/Address';


function App() {
 
  
  return (
   <AddressProvider>
      <Router>
        <div id="appMain">
         <Navbar/>
          <ScrollToTop />
          <Content />
         <Footer />
        </div>
      </Router>
      </AddressProvider>
    );
}

export default App;
