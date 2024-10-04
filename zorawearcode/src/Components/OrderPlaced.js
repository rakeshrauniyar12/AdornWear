import React from "react";
import TickIcon from '../Assets/tick_icon.png'
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

const OrderPlaced= ()=>{
    const location = useLocation();
    const { selectedAddress } = location.state || {};
    return(
        <div className="orderPlaced-main-section">
            <div className="orderPlaced-first-section">
                <div className="orderPlaced-first-section-first">
                     <img src={TickIcon} alt="Tick" height="20px" width="20px"
                     />
                    <h1 style={{fontWeight:"bolder",fontSize:"18px",color:"#06a44b"}}>
                        Order placed, thank you!
                    </h1>
                </div>
             <p>Confirmation mail will be sent to your mail.</p>
             <h3>Shipping Address:</h3>
             <p>{selectedAddress}</p>
            </div>
            <div className="orderPlaced-border"></div>
            <Link to={"/"} style={{color:"green"}}>{"Continue Shopping >"}</Link>
        </div>
    )
}

export default OrderPlaced;