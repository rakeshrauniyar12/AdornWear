import React from "react";
import { useMediaQuery } from "@mui/material";
const TermsAndConditions = () => {
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
      <h1 style={{ marginBottom: "10px", marginTop: "10px" }}>
        Terms and Conditions
      </h1>
      <p style={{ marginBottom: "20px" }}>Last Updated: 22 May 2024</p>
      <section>
        <h2>Introduction and Acceptance of Terms</h2>
        <p>
          Users must agree to the Terms and Conditions before accessing the
          Zorawear website. By using the website, users acknowledge and accept
          all terms outlined herein, governing their use of the platform.
        </p>
      </section>
      <section>
        <h2 style={{ marginBottom: "10px", marginTop: "10px" }}>Definitions</h2>
        <p>
          Key terms such as "User," "Website," and "Products" are defined to
          ensure clarity throughout the document. This section clarifies the
          meaning of essential terms used within the Terms and Conditions.
        </p>
      </section>
      <section>
        <h2 style={{ marginBottom: "10px", marginTop: "10px" }}>
          Use of the Website
        </h2>
        <p>
          Zorawear website is designed for users interested in purchasing
          clothing and related products. Users must be of legal age or have
          parental consent to use the website. Unauthorized use or access is
          prohibited.
        </p>
      </section>
      <section>
        <h2 style={{ marginBottom: "10px", marginTop: "10px" }}>
          Accounts and Registration
        </h2>
        <p>
          Users may need to create an account to access certain features or make
          purchases. They are responsible for maintaining the confidentiality of
          their account credentials. Zorawear reserves the right to suspend or
          terminate accounts found in violation of terms.
        </p>
      </section>
      <section>
        <h2 style={{ marginBottom: "10px", marginTop: "10px" }}>
          User Contributions
        </h2>
        <p>
          Users can contribute content such as reviews, comments, or product
          ratings. Zorawear reserves the right to moderate, edit, or remove any
          user-generated content deemed inappropriate, offensive, or violating
          intellectual property rights.
        </p>
      </section>
      <section>
        <h2 style={{ marginBottom: "10px", marginTop: "10px" }}>
          Intellectual Property Rights
        </h2>
        <p>
          Zorawear owns all content, trademarks, and intellectual property
          displayed on the website unless otherwise stated. Users may not use,
          reproduce, or distribute Zorawear's content without explicit
          permission.
        </p>
      </section>
      <section>
        <h2 style={{ marginBottom: "10px", marginTop: "10px" }}>
          Privacy Policy
        </h2>
        <p>
          Zorawear collects and processes personal information as described in
          its Privacy Policy. Users are encouraged to review the Privacy Policy
          to understand how their data is collected, used, and protected.
        </p>
      </section>
      {/* Add more sections as needed */}
    </div>
  );
};

export default TermsAndConditions;
