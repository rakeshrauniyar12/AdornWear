import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { UserContext } from "./UserContext";
import services from "../Appwrite/Service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import "../Styles/CreateReview.css";
import { toast } from "react-toastify";
import LoadingOverlay from "./LoadingOverlay";

const CreateReview = () => {
  const { productId } = useParams();
  const { user } = useContext(UserContext);
  const [rating, setRating] = useState(0);
  const [product, setProduct] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [headline, setHeadline] = useState("");
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      const productData = await services.fetchProductById(productId);
      setProduct(productData);
    };

    fetchProduct();
  }, [productId]);

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleHeadlineChange = (event) => {
    setHeadline(event.target.value);
  };

  const handleReviewChange = (event) => {
    setReview(event.target.value);
  };

  const submitReview = async () => {
    const userId = user.$id;

    const reviewData = {
      productId: productId,
      userId: userId,
      rating: rating,
      headline: headline,
      comment: review,
      timeStamp: new Date().toISOString(),
    };

    if (!productId || !userId || !rating || !headline || !review) {
      toast.warning("All fields must be filled out");
      return;
    }

    try {
      setSubmitting(true);
      await services.submitReview(reviewData);
      setHeadline("");
      setRating(0);
      setReview("");
    } catch (error) {
      toast.error("Error adding review to Appwrite: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="createReviewContainer">
      <h2>Create Review</h2>
      {product ? (
        <div className="productInfor">
          <img src={product.productImages[0]} alt="image" />
          <h4 style={{ fontWeight: "lighter" }}>{product.productName}</h4>
        </div>
      ) : (
        <p>Loading...</p>
      )}

      <div className="ratingSection">
        <label>Overall rating</label>
        <div className="starRating">
          {[...Array(5)].map((_, index) => (
            <FontAwesomeIcon
              key={index}
              icon={faStar}
              className={`star ${
                rating >= index + 1 || hoverRating >= index + 1 ? "filled" : ""
              }`}
              onMouseEnter={() => setHoverRating(index + 1)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => handleRatingChange(index + 1)}
            />
          ))}
        </div>
      </div>

      <div className="reviewSection">
        <label>Add a headline</label>
        <input
          type="text"
          placeholder="Summarize your review in a few words"
          value={headline}
          onChange={handleHeadlineChange}
        />

        <label>Add a written review</label>
        <textarea
          placeholder="Describe your experience with the product. What did you like or dislike?"
          value={review}
          onChange={handleReviewChange}
          rows="4"
        />

        <button onClick={submitReview} disabled={submitting}>
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </div>
      {submitting && <LoadingOverlay />}
    </div>
  );
};

export default CreateReview;
