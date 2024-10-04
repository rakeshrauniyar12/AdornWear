import React from "react";
import { useMediaQuery } from "@mui/material";

function PrivacyPolicy() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const width = isMobile ? "94%" : "70%";
  return (
    <div
      style={{
        width: width,
        margin: "auto",
        marginBottom: "50px",
        paddingTop: "30px",
      }}
    >
      <h1>Zorawear Privacy Policy</h1>
      <p style={{ marginBottom: "20px" }}>Last Updated: 22 May 2024</p>
      <p>
        <strong>Information We Collect</strong>
        <br />
        At Zorawear, we collect a variety of information to enhance your
        shopping experience. This includes personal data you provide directly,
        such as your name, email address, phone number, and shipping address.
        Additionally, we gather information about your interactions with our
        site, such as your purchase history, browsing patterns, and preferences.
        This helps us tailor our services to better meet your needs. According
        to the Information Technology (Reasonable Security Practices and
        Procedures and Sensitive Personal Data or Information) Rules, 2011, we
        ensure that all personal data is collected with your consent and handled
        with the utmost care.
        <br />
        <br />
        <strong>How We Use Your Information</strong>
        <br />
        The information we collect is used to process your orders efficiently
        and provide exceptional customer service. We also use your data to
        improve our website, personalize your experience, and send you updates
        about new products and promotions. Furthermore, we may use your
        information to comply with legal requirements and protect our rights.
        Under the Information Technology Act, 2000, we adhere to legal
        obligations regarding the use and storage of personal data, ensuring
        that your information is only used for legitimate purposes.
        <br />
        <br />
        <strong>Sharing Your Information</strong>
        <br />
        We value your privacy and do not sell your personal information to third
        parties. However, we may share your data with trusted third-party
        service providers who assist us with operations such as order
        fulfillment, payment processing, and marketing. These providers are
        bound by strict confidentiality agreements and are prohibited from using
        your information for any other purposes. In compliance with Section 43A
        of the Information Technology Act, 2000, and associated rules, we ensure
        that these third parties implement adequate security measures to protect
        your data.
        <br />
        <br />
        <strong>Your Choices</strong>
        <br />
        You have the right to access, update, and delete your personal
        information at any time. Additionally, you can opt-out of receiving
        marketing communications from us. We provide easy-to-use options for you
        to manage your preferences and exercise your rights under the Personal
        Data Protection Bill, 2019. If you wish to make changes to your data or
        unsubscribe from our communications, you can do so through your account
        settings or by contacting our customer support team.
        <br />
        <br />
        <strong>Security</strong>
        <br />
        Protecting your personal information is a top priority for us. We
        implement comprehensive security measures to safeguard your data from
        unauthorized access, use, or disclosure. This includes using encryption,
        secure servers, and other advanced security technologies. While we
        strive to protect your information, we acknowledge that no method of
        data transmission over the internet is entirely secure. We adhere to the
        guidelines set forth in the Information Technology (Reasonable Security
        Practices and Procedures and Sensitive Personal Data or Information)
        Rules, 2011, to ensure the highest level of security.
        <br />
        <br />
        <strong>Changes to This Policy</strong>
        <br />
        We may update this privacy policy periodically to reflect changes in our
        practices, technologies, or legal requirements. When significant updates
        are made, we will notify you through email or by posting a notice on our
        website. Your continued use of our services after such changes signifies
        your acceptance of the updated policy. We recommend reviewing this
        policy regularly to stay informed about how we are protecting your
        information. Any changes will comply with applicable laws, including the
        Information Technology Act, 2000.
        <br />
        <br />
        <strong>Contact Us</strong>
        <br />
        If you have any questions or concerns about this privacy policy, please
        do not hesitate to contact us. You can reach us at zorawear@gmail.com or
        through our customer service hotline. We are committed to addressing
        your inquiries promptly and transparently. Additionally, if you believe
        your rights under Indian law have been violated, you have the right to
        lodge a complaint with the appropriate data protection authority. We are
        dedicated to ensuring your privacy and trust in Zorawear.
      </p>
    </div>
  );
}

export default PrivacyPolicy;
