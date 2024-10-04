import React from "react";
import { useMediaQuery } from "@mui/material";

const OrderAndDelivery = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const width = isMobile ? "94%" : "70%";
  return (
    <section style={{ width: width ,margin:"auto",lineHeight:"22px"}}>
      <h1>Order and Delivery</h1>
      <p style={{marginBottom:"20px"}}>Last Updated: 24 May 2024</p>
      <p>
        Zorawear aims to provide a seamless ordering and delivery experience for
        its customers. Upon placing an order, customers will receive
        confirmation via email or SMS. Delivery times may vary depending on the
        shipping location and product availability but we ensure that we will
        try to deliver order within 7 to 14 days. Zorawear endeavors to dispatch
        orders promptly and provide tracking information for shipments. In case
        of any delays or issues with delivery, customers can reach out to our
        customer support team for assistance. Please refer to our Shipping
        Policy for more details on delivery timelines and procedures.
      </p>
    </section>
  );
};

export default OrderAndDelivery;
