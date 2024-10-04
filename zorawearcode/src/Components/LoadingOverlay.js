import React from "react";
import { Oval } from "react-loader-spinner";
import "../Styles/LoadingOverlay.css";

const LoadingOverlay = ({ visible }) => {
  if (!visible) return null;

  return (
    <div className="loading-overlay">
      <div className="spinner-container">
        <Oval
          height={50}
          width={50}
          color="#901454"
          visible={true}
          ariaLabel="oval-loading"
          secondaryColor="#f3f3f3"
          strokeWidth={4}
          strokeWidthSecondary={4}
        />
      </div>
    </div>
  );
};

export default LoadingOverlay;
