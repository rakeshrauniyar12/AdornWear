import React, { useState, useEffect, useRef, useContext } from "react";
import "../Styles/Home.css";
import ProductCarousel from "./ProductCarousel";
import services from "../Appwrite/Service";
import { UserContext } from "./UserContext";
import caraousel_1 from "../Assets/caraousel_1.png";
import caraousel_2 from "../Assets/caraousel_2.png";
import caraousel_3 from "../Assets/caraousel_3.png";
import caraousel_4 from "../Assets/caraousel_4.png";
import caraousel_5 from "../Assets/caraousel_5.png";
import caraousel_6 from "../Assets/caraousel_6.png";
// import video_1 from "../Assets/video_1.mp4";
// import video_2 from "../Assets/video_2.mp4";
// import video_3 from "../Assets/video_3.mp4";
import { format, subDays, addDays } from "date-fns";

const Home = () => {
  const { user } = useContext(UserContext);
  const [currentItemIndex, setCurrentItemIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [newArrivals, setNewArrivals] = useState([]);
  const [youMightAlsoLike, setYouMightAlsoLike] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const [kurtiSet, setKurtiSet] = useState([]);
  const [unStitchedSuits, setUnStitchedSuits] = useState([]);
  const [mensWear, setMensWear] = useState([]);
  const [bags, setBags] = useState([]);
  const [watches, setWatches] = useState([]);

  const videoRef = useRef(null);

  const originalCarouselItems = [
    // { type: "video", src: video_1 },
    // { type: "video", src: video_2 },
    // { type: "video", src: video_3 },
    { type: "image", src: caraousel_1 },
    { type: "image", src: caraousel_2 },
    { type: "image", src: caraousel_3 },
    { type: "image", src: caraousel_4 },
    { type: "image", src: caraousel_5 },
    { type: "image", src: caraousel_6 },
  ];

  const carouselItems = [
    originalCarouselItems[originalCarouselItems.length - 1],
    ...originalCarouselItems,
    originalCarouselItems[0],
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const categories = [
          "kurti",
          "unstitchedsuits",
          "menswear",
          "bags",
          "watches",
        ];

        // Fetch products for each category
        const results = await Promise.all(
          categories.map((category) =>
            services.fetchProductsByCategory(category)
          )
        );

        // Store the results in state
        setKurtiSet(results[0]);
        setUnStitchedSuits(results[1]);
        setMensWear(results[2]);
        setBags(results[3]);
        setWatches(results[4]);
      } catch (err) {
        throw err;
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const now = new Date();
        const past2Days = subDays(now, 2);
        const future2Days = addDays(now, 2);

        const products = await services.fetchProducts();
        setNewArrivals(
          products.filter(
            (product) =>
              new Date(product.timeStamp) >= past2Days &&
              new Date(product.timeStamp) <= future2Days
          )
        );
      } catch (error) {
        throw error;
      }
    };

    const fetchYouMightAlsoLike = async () => {
      try {
        const products = await services.fetchProducts();
        setYouMightAlsoLike(products.slice(0, 10));
      } catch (error) {
        throw error;
      }
    };

    const fetchRecentlyViewed = async () => {
      try {
        if (user) {
          const userData = await services.getUserData(user.$id);
          if (userData && userData.viewedProducts) {
            const viewedProductDetails = [];

            for (let productId of userData.viewedProducts) {
              const product = await services.fetchProductById(productId);
              console.log("Home ", product);
              if (product) {
                viewedProductDetails.push(product);
              }
              console.log("Home viewed Products", viewedProductDetails);
            }

            setRecentlyViewed(viewedProductDetails);
          }
        }
      } catch (error) {
        throw error;
      }
    };

    fetchNewArrivals();
    fetchYouMightAlsoLike();
    fetchRecentlyViewed();
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning && !isHovered) {
        setCurrentItemIndex((prevIndex) => prevIndex + 1);
        setIsTransitioning(true);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isTransitioning, isHovered]);

  const handleTransitionEnd = () => {
    setIsTransitioning(false);
    if (currentItemIndex === 0) {
      setCurrentItemIndex(carouselItems.length - 2);
    } else if (currentItemIndex === carouselItems.length - 1) {
      setCurrentItemIndex(1);
    }
  };

  useEffect(() => {
    const carouselInner = document.querySelector(".carouselInner");
    carouselInner.addEventListener("transitionend", handleTransitionEnd);

    return () => {
      carouselInner.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, [currentItemIndex, carouselItems.length]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleTouchStart = (e) => {
    const touchStartX = e.touches[0].clientX;
    const touchMove = (moveEvent) => {
      const touchEndX = moveEvent.touches[0].clientX;
      const difference = touchStartX - touchEndX;
      if (Math.abs(difference) > 50) {
        if (difference > 0 && currentItemIndex < carouselItems.length - 1) {
          setCurrentItemIndex(currentItemIndex + 1);
        } else if (difference < 0 && currentItemIndex > 0) {
          setCurrentItemIndex(currentItemIndex - 1);
        }
      }
    };
    const touchEnd = () => {
      document.removeEventListener("touchmove", touchMove);
      document.removeEventListener("touchend", touchEnd);
    };
    document.addEventListener("touchmove", touchMove);
    document.addEventListener("touchend", touchEnd);
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      const resetVideo = () => {
        videoElement.currentTime = 0;
        videoElement.play();
      };
      videoElement.addEventListener("ended", resetVideo);
      return () => {
        videoElement.removeEventListener("ended", resetVideo);
      };
    }
  }, [currentItemIndex]);

  // Function to generate repeated message
  const generateRepeatedMessage = () => {
    const message = "Up to 15% OFF Sitewide | Shop Now";
    const separator = " | ";
    const screenWidth = window.innerWidth;
    const messageWidth = message.length * 8; // Rough estimate of the message width in pixels
    const repeatCount = Math.ceil(screenWidth / messageWidth) + 1;
    return Array(repeatCount).fill(message).join(separator);
  };

  const [repeatedMessage, setRepeatedMessage] = useState(
    generateRepeatedMessage()
  );

  useEffect(() => {
    const handleResize = () => {
      setRepeatedMessage(generateRepeatedMessage());
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      className="homeMain"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="carousel-container">
        <div
          className="carouselInner"
          style={{
            transform: `translateX(-${currentItemIndex * 100}%)`,
            transition: isTransitioning ? "transform 1s ease-in-out" : "none",
          }}
          onTouchStart={handleTouchStart}
        >
          {carouselItems.map((item, index) =>
            item.type === "image" ? (
              <img
                key={index}
                src={item.src}
                alt={`carousel-${index}`}
                className="carouselImage"
              />
            ) : (
              <video
                ref={index === currentItemIndex ? videoRef : null}
                key={index}
                src={item.src}
                autoPlay
                playsInline
                muted
                loop
                className="carouselImage"
              />
            )
          )}
        </div>
      </div>
      <div className="movingMessageDiv">
        <div className="movingMessage">{repeatedMessage}</div>
      </div>
      {newArrivals.length !== 0 && (
        <ProductCarousel title="New arrivals" products={newArrivals} />
      )}
      {kurtiSet.length !== 0 && (
        <ProductCarousel title="Kurti Set" products={kurtiSet} />
      )}
      {unStitchedSuits.length !== 0 && (
        <ProductCarousel title="UnStitched Suits" products={unStitchedSuits} />
      )}
      {mensWear.length !== 0 && (
        <ProductCarousel title="Mens" products={mensWear} />
      )}
      {bags.length !== 0 && <ProductCarousel title="Bags" products={bags} />}
      {watches.length !== 0 && (
        <ProductCarousel title="Watches" products={watches} />
      )}

      {youMightAlsoLike.length !== 0 && (
        <ProductCarousel
          title="You might also like"
          products={youMightAlsoLike}
        />
      )}
      {recentlyViewed.length !== 0 && (
        <ProductCarousel title="Recently viewed" products={recentlyViewed} />
      )}
    </div>
  );
};

export default Home;
