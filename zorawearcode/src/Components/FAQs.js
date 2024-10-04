import React, { useState } from "react";
import Add from "../Assets/add.png";
import Cross from "../Assets/close.png";
import faqlogo from "../Assets/faqlogo.jpg";
import "../Styles/FAQs.css";

const FAQs = () => {
  const [openQuestions, setOpenQuestions] = useState({});

  const toggleQuestion = (index) => {
    setOpenQuestions((prevState) => ({
      ...prevState,
      [index]: !prevState[index] || false,
    }));
  };

  const faqData = [
    {
      question: "How do I determine my clothing size?",
      answer:
        "To determine your clothing size, refer to our size chart available on each product page. Additionally, you can measure yourself and compare your measurements with our size guide to find the perfect fit.",
    },
    {
      question: "Do you offer international shipping?",
      answer:
        "No, we don't offer international shipping.",
    },
    {
      question: "What is your return policy?",
      answer:
        "We have a hassle-free return policy. If you are not satisfied with your purchase, you can return it within 14 days for a full refund or exchange. Please refer to our Returns & Exchanges page for more details.",
    },
    {
      question: "How can I track my order?",
      answer:
        "Once your order has been shipped, you will receive a tracking number via email. You can use this tracking number to monitor the status of your delivery on our website or through the courier's website.",
    },
    {
      question: "Are the colors of the products accurate in the photos?",
      answer:
        "We strive to display accurate colors of our products in the photos. However, due to variations in monitor settings, the actual colors may vary slightly. Rest assured, we ensure the closest representation of the product colors.",
    },
  ];
  

  return (
    <div id="faq">
      <h1>Frequently Asked Questions</h1>
      <div className="faqDiv">
        <div className="faqlogodiv">
          <img src={faqlogo} alt="faqlogo" />
        </div>
        <div id="faqquestions">
          {faqData.map((question, index) => (
            <div className="faqquestion" key={index}>
              <div>
                <img
                  src={openQuestions[index] ? Cross : Add}
                  alt={openQuestions[index] ? "cross" : "add"}
                  onClick={() => toggleQuestion(index)}
                />
              </div>
              <div>
                <p>{question.question}</p>
                {openQuestions[index] && (
                  <p className="questionanswer">{question.answer}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQs;
