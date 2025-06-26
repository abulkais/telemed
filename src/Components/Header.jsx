import React, { useState } from "react";
import "../assets/Header.css";
import MenuIcon from '@mui/icons-material/Menu';
const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-left">
        <img src="/logo.png" alt="HMS Logo" className="logo" />
        <h3>Smart Patient Card Templates</h3>
      </div>

      <div className="header-right">
        <div className="user-menu">
          <button
            className="menu-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <Menu />
          </button>

          {dropdownOpen && (
            <div className="dropdown-menu">
              <div className="profile-section">
                <AccountCircle className="profile-icon" />
                <div>
                  <p className="username">Infy HMS</p>
                  <p className="email">admin@hms.com</p>
                </div>
              </div>

              <ul>
                <li>
                  <Edit className="icon" /> Edit Profile
                </li>
                <li>
                  <Lock className="icon" /> Change Password
                </li>
                <li>
                  <Language className="icon" /> Change Language
                </li>
                <li>
                  <ExitToApp className="icon" /> Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
