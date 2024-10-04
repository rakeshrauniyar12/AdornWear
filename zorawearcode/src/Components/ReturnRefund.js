import React from "react";
import { useMediaQuery } from "@mui/material";

function ReturnRefundPolicy() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const width = isMobile ? "94%" : "70%";

  return (
    <div
      style={{
        width: width,
        margin: "auto",
        marginBottom: "50px",
        paddingTop: "20px",
        lineHeight: "24px",
      }}
    >
      <h1 style={{ marginBottom: "40px" }}>
        Zorawear Return and Replace Policy
      </h1>
      <p>
        At Zorawear, we strive to ensure that our products reach you in perfect
        condition. However, if you receive a damaged item or find that an item
        is missing from your order, we're here to help with our straightforward
        return and replace policy.
      </p>

      <h3 style={{ marginBottom: "10px", marginTop: "25px" }}>
        Eligibility for Return and Replace
      </h3>
      <ol style={{ paddingLeft: "40px" }}>
        <li>
          <strong> Damaged Products:</strong>
          If you receive a product that is damaged, you may request a
          replacement.
        </li>
        <li>
          <strong>Missing Items: </strong>If an item from your order is missing,
          you can report it for a replacement.
        </li>
      </ol>

      <h3 style={{ marginBottom: "10px", marginTop: "25px" }}>
        How to Request a Return or Replacement
      </h3>
      <ol style={{ paddingLeft: "40px" }}>
        <li>
          <strong>Provide a 360° Unboxing Video:</strong> To process your
          request, we require a clear 360° unboxing video that shows the
          condition of the package and contents upon arrival. This video helps
          us understand the issue and expedite your request.
        </li>
        <li>
          <strong>Contact Customer Service:</strong> Once you have the unboxing
          video, please contact our customer service team within 7 days of
          receiving your order. You can reach us via [customer service email] or
          [customer service phone number].
        </li>
        <li>
          <strong>Submit Details: </strong> Along with the video, provide your
          order number, a brief description of the issue, and any other relevant
          details.
        </li>
      </ol>

      <h3 style={{ marginBottom: "10px", marginTop: "25px" }}>
        Processing Time
      </h3>
      <ul style={{ paddingLeft: "40px" }}>
        <li>
          <strong>Review and Approval:</strong>Our team will review your
          submission and approve the return or replacement if it meets our
          policy criteria.
        </li>
        <li>
          <strong>Replacement Shipping:</strong> Once approved, we will ship the
          replacement product as soon as possible, typically within 5-7 business
          days.
        </li>
      </ul>

      <h3 style={{ marginBottom: "10px", marginTop: "25px" }}>
        Important Notes
      </h3>
      <ul style={{ paddingLeft: "40px", marginBottom: "30px" }}>
        <li>
          Ensure the unboxing video clearly shows the packaging and the
          condition of the products as they were received.
        </li>
        <li>
          Claims without the required unboxing video may not be eligible for
          return or replacement.
        </li>
        <li>
          This policy only applies to items that are damaged upon arrival or
          missing from the order.
        </li>
      </ul>
      <p>
        Thank you for shopping with Zorawear. We appreciate your understanding
        and cooperation in ensuring a smooth return and replacement process. If
        you have any questions, please don't hesitate to contact our customer
        service team.
      </p>
    </div>
  );
}

export default ReturnRefundPolicy;
