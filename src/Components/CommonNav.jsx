import React from "react";
import { Link, useLocation } from "react-router-dom";

const CommonNav = ({ navItems = [] }) => {
  // Add default empty array
  const location = useLocation();

  return (
    <div className="nav_headings">
      {navItems &&
        Array.isArray(navItems) && // Add validation check
        navItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`doctor-nav-btn ${
              location.pathname === item.path ? "active" : ""
            }`}
          >
            <span className="btn-text">{item.label}</span>
          </Link>
        ))}
    </div>
  );
};

export default CommonNav;
