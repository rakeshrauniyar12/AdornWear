import React, { useState } from "react";
import "../Styles/Contact.css";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import contactlogo from "../Assets/contactlogo.jpg";
import FeedIcon from "@mui/icons-material/Feed";
import { toast } from "react-toastify";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CallIcon from "@mui/icons-material/Call";
import LoadingOverlay from "./LoadingOverlay";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    email: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("https://formspree.io/f/xwkgdezr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setFormData({
          name: "",
          subject: "",
          email: "",
          message: "",
        });
        toast.success("Thanks for your message!", {
          autoClose: 1500,
        });
      } else {
        toast.error("Something went wrong!", { autoClose: 1500 });
      }
    } catch (error) {
      toast.error("Something went wrong!", { autoClose: 1500 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="contactContainer">
      <h1>Contact Us</h1>
      <div className="contactUsMain">
        <div className="contactlogodiv">
          <img src={contactlogo} alt="contactus" />
        </div>
        <div className="formMainDiv">
          <form onSubmit={handleSubmit}>
            <div className="contactUsFormDiv">
              <PersonIcon sx={{ color: "grey" }} />
              <input
                name="name"
                placeholder="Name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="contactUsFormDiv">
              <FeedIcon sx={{ color: "grey" }} />
              <input
                name="subject"
                placeholder="Subject"
                type="text"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            <div className="contactUsFormDiv">
              <EmailIcon sx={{ color: "grey" }} />
              <input
                name="email"
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="textareamessage">
              <textarea
                name="message"
                placeholder="Message"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            <div className="messageSubmitButton">
              <button type="submit" disabled={submitting}>
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="companyContactDetails">
        <div className="contactCompanyDiv">
          <div className="eachContactIcon">
            <LocationOnIcon sx={{ fontSize: 30 }} />
          </div>
          <div className="eachContactInfo">
            <p>368, Ghas bazar, Bandra East, Mumbai, Maharashtra - 400051 </p>
          </div>
        </div>

        <div className="contactCompanyDiv">
          <div className="eachContactIcon">
            <CallIcon sx={{ fontSize: 30 }} />
          </div>
          <div className="eachContactInfo">
            <p>+91-9769884438</p>
          </div>
        </div>

        <div className="contactCompanyDiv">
          <div className="eachContactIcon">
            <EmailIcon sx={{ fontSize: 30 }} />
          </div>
          <div className="eachContactInfo">
            <p>www.zorawear@gmail.com</p>
          </div>
        </div>
      </div>
      {submitting && <LoadingOverlay />}
    </div>
  );
};

export default Contact;
