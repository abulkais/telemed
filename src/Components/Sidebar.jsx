import React, { useState, useEffect } from "react";
import "../assets/Sidebar.css";
import { Link } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import PeopleIcon from "@mui/icons-material/People";
import AddIcon from "@mui/icons-material/Add";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

import BedIcon from "@mui/icons-material/Bed";
import DescriptionIcon from "@mui/icons-material/Description";
import OpacityIcon from "@mui/icons-material/Opacity";
import MenuIcon from "@mui/icons-material/Menu";
import { BsCapsule } from "react-icons/bs";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-collapse on mobile by default
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    window.addEventListener("resize", handleResize);
    // Set initial state
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header d-flex align-items-center">
          <button className="toggle-btn" onClick={toggleSidebar}>
            <MenuIcon />
          </button>
          {!isCollapsed && (
            <>
              <img
                src="https://infyhms.sgp1.cdn.digitaloceanspaces.com/638/Graphics.png"
                alt="HMS Logo"
                className="logo"
              />
              <h3>HMS</h3>
            </>
          )}
        </div>

        {!isCollapsed && (
          <div className="search-box">
            <input type="text" placeholder="Search" className="form-control" />
            <SearchIcon className="search-icon" />
          </div>
        )}

        <ul className="nav flex-column">
          <li className="nav-item">
            <Link to="/dashboard" className="nav-link" title="Dashboard">
              <svg
                width="20"
                height="20"
                className="svg-inline--fa fa-chart-pie"
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="chart-pie"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 576 512"
                data-fa-i2svg=""
              >
                <path
                  fill="currentColor"
                  d="M304 16.58C304 7.555 310.1 0 320 0C443.7 0 544 100.3 544 224C544 233 536.4 240 527.4 240H304V16.58zM32 272C32 150.7 122.1 50.34 238.1 34.25C248.2 32.99 256 40.36 256 49.61V288L412.5 444.5C419.2 451.2 418.7 462.2 411 467.7C371.8 495.6 323.8 512 272 512C139.5 512 32 404.6 32 272zM558.4 288C567.6 288 575 295.8 573.8 305C566.1 360.9 539.1 410.6 499.9 447.3C493.9 452.1 484.5 452.5 478.7 446.7L320 288H558.4z"
                ></path>
              </svg>{" "}
              {!isCollapsed && <span>Dashboard</span>}
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/generate-patient-smart-cards"
              className="nav-link"
              title="Patient Smart Cards"
            >
              <svg
                width="20"
                height="20"
                className="svg-inline--fa fa-id-card"
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="id-card"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 576 512"
                data-fa-i2svg=""
              >
                <path
                  fill="currentColor"
                  d="M528 32h-480C21.49 32 0 53.49 0 80V96h576V80C576 53.49 554.5 32 528 32zM0 432C0 458.5 21.49 480 48 480h480c26.51 0 48-21.49 48-48V128H0V432zM368 192h128C504.8 192 512 199.2 512 208S504.8 224 496 224h-128C359.2 224 352 216.8 352 208S359.2 192 368 192zM368 256h128C504.8 256 512 263.2 512 272S504.8 288 496 288h-128C359.2 288 352 280.8 352 272S359.2 256 368 256zM368 320h128c8.836 0 16 7.164 16 16S504.8 352 496 352h-128c-8.836 0-16-7.164-16-16S359.2 320 368 320zM176 192c35.35 0 64 28.66 64 64s-28.65 64-64 64s-64-28.66-64-64S140.7 192 176 192zM112 352h128c26.51 0 48 21.49 48 48c0 8.836-7.164 16-16 16h-192C71.16 416 64 408.8 64 400C64 373.5 85.49 352 112 352z"
                ></path>
              </svg>{" "}
              {!isCollapsed && <span>Patient Smart Cards</span>}
            </Link>
          </li>

          <li className="nav-item">
            <Link
              to="/inventories-categories"
              className="nav-link"
              title="inventories categories"
            >
              <svg
                width="20"
                height="20"
                className="svg-inline--fa fa-cart-flatbed-suitcase"
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="id-card"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 576 512"
                data-fa-i2svg=""
              >
                <path
                  fill="currentColor"
                  d="M541.2 448C542.1 453 544.1 458.4 544.1 464C544.1 490.5 522.6 512 496 512C469.5 512 448.1 490.5 448.1 464C448.1 458.4 449.2 453 450.1 448H253.1C254.9 453 256 458.4 256 464C256 490.5 234.5 512 208 512C181.5 512 160 490.5 160 464C160 458.4 161.1 453 162.9 448L96 448C78.4 448 64 433.6 64 416V80C64 71.16 56.84 64 48 64H32C14.4 64 0 49.6 0 32C0 14.4 14.4 0 32 0H64C99.2 0 128 28.8 128 64V384H608C625.6 384 640 398.4 640 416C640 433.6 625.6 448 608 448L541.2 448zM432 0C458.5 0 480 21.5 480 48V320H288V48C288 21.5 309.5 0 336 0H432zM336 96H432V48H336V96zM256 320H224C206.4 320 192 305.6 192 288V128C192 110.4 206.4 96 224 96H256V320zM576 128V288C576 305.6 561.6 320 544 320H512V96H544C561.6 96 576 110.4 576 128z"
                ></path>
              </svg>{" "}
              {!isCollapsed && <span>Inventories</span>}
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/admin" className="nav-link" title="Users">
              <PeopleIcon className="icon" />
              {!isCollapsed && <span>Users</span>}
            </Link>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link" title="AddOn">
              <AddIcon className="icon" />
              {!isCollapsed && <span>AddOn</span>}
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link" title="Appointments">
              <CalendarTodayIcon className="icon" />
              {!isCollapsed && <span>Appointments</span>}
            </a>
          </li>
          <li className="nav-item">
            <Link
              to="ipd-patients"
              className="nav-link"
              title="IPD - Patient In"
            >
              <svg
                width="20"
                height="20"
                className="svg-inline--fa fa-hospital-user"
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="hospital-user"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 576 512"
                data-fa-i2svg=""
              >
                <path
                  fill="currentColor"
                  d="M272 0C298.5 0 320 21.49 320 48V367.8C281.8 389.2 256 430 256 476.9C256 489.8 259.6 501.8 265.9 512H48C21.49 512 0 490.5 0 464V384H144C152.8 384 160 376.8 160 368C160 359.2 152.8 352 144 352H0V288H144C152.8 288 160 280.8 160 272C160 263.2 152.8 256 144 256H0V48C0 21.49 21.49 0 48 0H272zM152 64C143.2 64 136 71.16 136 80V104H112C103.2 104 96 111.2 96 120V136C96 144.8 103.2 152 112 152H136V176C136 184.8 143.2 192 152 192H168C176.8 192 184 184.8 184 176V152H208C216.8 152 224 144.8 224 136V120C224 111.2 216.8 104 208 104H184V80C184 71.16 176.8 64 168 64H152zM512 272C512 316.2 476.2 352 432 352C387.8 352 352 316.2 352 272C352 227.8 387.8 192 432 192C476.2 192 512 227.8 512 272zM288 477.1C288 425.7 329.7 384 381.1 384H482.9C534.3 384 576 425.7 576 477.1C576 496.4 560.4 512 541.1 512H322.9C303.6 512 288 496.4 288 477.1V477.1z"
                ></path>
              </svg>{" "}
              {!isCollapsed && <span>IPD - Patient In</span>}
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/opd-patients"
              className="nav-link"
              title="OPD - Patient Out"
            >
              <svg
                width="20"
                height="20"
                className="svg-inline--fa fa-stethoscope"
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="stethoscope"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 576 512"
                data-fa-i2svg=""
              >
                <path
                  fill="currentColor"
                  d="M480 112c-44.18 0-80 35.82-80 80c0 32.84 19.81 60.98 48.11 73.31v78.7c0 57.25-50.25 104-112 104c-60 0-109.3-44.1-111.9-99.23C296.1 333.8 352 269.3 352 191.1V36.59c0-11.38-8.15-21.38-19.28-23.5L269.8 .4775c-13-2.625-25.54 5.766-28.16 18.77L238.4 34.99c-2.625 13 5.812 25.59 18.81 28.22l30.69 6.059L287.9 190.7c0 52.88-42.13 96.63-95.13 97.13c-53.38 .5-96.81-42.56-96.81-95.93L95.89 69.37l30.72-6.112c13-2.5 21.41-15.15 18.78-28.15L142.3 19.37c-2.5-13-15.15-21.41-28.15-18.78L51.28 12.99C40.15 15.24 32 25.09 32 36.59v155.4c0 77.25 55.11 142 128.1 156.8C162.7 439.3 240.6 512 336 512c97 0 176-75.37 176-168V265.3c28.23-12.36 48-40.46 48-73.25C560 147.8 524.2 112 480 112zM480 216c-13.25 0-24-10.75-24-24S466.7 168 480 168S504 178.7 504 192S493.3 216 480 216z"
                ></path>
              </svg>{" "}
              {!isCollapsed && <span>OPD - Patient Out</span>}
            </Link>
          </li>

          <li className="nav-item">
            <Link to="/income-categories" className="nav-link" title="Finance">
              <svg
                width="20"
                height="20"
                className="svg-inline--fa fa-money-bill"
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="money-bill"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 576 512"
                data-fa-i2svg=""
              >
                <path
                  fill="currentColor"
                  d="M512 64C547.3 64 576 92.65 576 128V384C576 419.3 547.3 448 512 448H64C28.65 448 0 419.3 0 384V128C0 92.65 28.65 64 64 64H512zM128 384C128 348.7 99.35 320 64 320V384H128zM64 192C99.35 192 128 163.3 128 128H64V192zM512 384V320C476.7 320 448 348.7 448 384H512zM512 128H448C448 163.3 476.7 192 512 192V128zM288 352C341 352 384 309 384 256C384 202.1 341 160 288 160C234.1 160 192 202.1 192 256C192 309 234.1 352 288 352z"
                ></path>
              </svg>{" "}
              {!isCollapsed && <span>Finance</span>}
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/prescriptions" className="nav-link" title="Finance">
              <svg
                width="20"
                height="20"
                className="svg-inline--fa fa-file-prescription mr-1"
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="file-prescription"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 384 512"
                data-fa-i2svg=""
              >
                <path
                  fill="currentColor"
                  d="M176 240H128v32h48C184.9 272 192 264.9 192 256S184.9 240 176 240zM256 0v128h128L256 0zM224 128L224 0H48C21.49 0 0 21.49 0 48v416C0 490.5 21.49 512 48 512h288c26.51 0 48-21.49 48-48V160h-127.1C238.3 160 224 145.7 224 128zM292.5 315.5l11.38 11.25c6.25 6.25 6.25 16.38 0 22.62l-29.88 30L304 409.4c6.25 6.25 6.25 16.38 0 22.62l-11.25 11.38c-6.25 6.25-16.5 6.25-22.75 0L240 413.3l-30 30c-6.249 6.25-16.48 6.266-22.73 .0156L176 432c-6.25-6.25-6.25-16.38 0-22.62l29.1-30.12L146.8 320H128l.0078 48.01c0 8.875-7.125 16-16 16L96 384c-8.875 0-16-7.125-16-16v-160C80 199.1 87.13 192 96 192h80c35.38 0 64 28.62 64 64c0 24.25-13.62 45-33.5 55.88L240 345.4l29.88-29.88C276.1 309.3 286.3 309.3 292.5 315.5z"
                ></path>
              </svg>
              {!isCollapsed && <span>Prescriptions</span>}
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/account" className="nav-link" title="Billing">
              <svg
                width="20"
                height="20"
                className="svg-inline--fa fa-file-invoice-dollar"
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="file-invoice-dollar"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 384 512"
                data-fa-i2svg=""
              >
                <path
                  fill="currentColor"
                  d="M384 128h-128V0L384 128zM256 160H384v304c0 26.51-21.49 48-48 48h-288C21.49 512 0 490.5 0 464v-416C0 21.49 21.49 0 48 0H224l.0039 128C224 145.7 238.3 160 256 160zM64 88C64 92.38 67.63 96 72 96h80C156.4 96 160 92.38 160 88v-16C160 67.63 156.4 64 152 64h-80C67.63 64 64 67.63 64 72V88zM72 160h80C156.4 160 160 156.4 160 152v-16C160 131.6 156.4 128 152 128h-80C67.63 128 64 131.6 64 136v16C64 156.4 67.63 160 72 160zM197.5 316.8L191.1 315.2C168.3 308.2 168.8 304.1 169.6 300.5c1.375-7.812 16.59-9.719 30.27-7.625c5.594 .8438 11.73 2.812 17.59 4.844c10.39 3.594 21.83-1.938 25.45-12.34c3.625-10.44-1.891-21.84-12.33-25.47c-7.219-2.484-13.11-4.078-18.56-5.273V248c0-11.03-8.953-20-20-20s-20 8.969-20 20v5.992C149.6 258.8 133.8 272.8 130.2 293.7c-7.406 42.84 33.19 54.75 50.52 59.84l5.812 1.688c29.28 8.375 28.8 11.19 27.92 16.28c-1.375 7.812-16.59 9.75-30.31 7.625c-6.938-1.031-15.81-4.219-23.66-7.031l-4.469-1.625c-10.41-3.594-21.83 1.812-25.52 12.22c-3.672 10.41 1.781 21.84 12.2 25.53l4.266 1.5c7.758 2.789 16.38 5.59 25.06 7.512V424c0 11.03 8.953 20 20 20s20-8.969 20-20v-6.254c22.36-4.793 38.21-18.53 41.83-39.43C261.3 335 219.8 323.1 197.5 316.8z"
                ></path>
              </svg>{" "}
              {!isCollapsed && <span>Billing</span>}
            </Link>
          </li>

          <li className="nav-item">
            <Link to="/bed-types" className="nav-link" title="Bed Management">
              <BedIcon className="icon" />
              {!isCollapsed && <span>Bed Management</span>}
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/blood-banks" className="nav-link" title="Blood Banks">
              <OpacityIcon className="icon" />
              {!isCollapsed && <span>Blood Banks</span>}
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/documents" className="nav-link" title="Documents">
              <DescriptionIcon className="icon" />
              {!isCollapsed && <span>Documents</span>}
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/doctors" className="nav-link" title="Doctors">
              <PeopleIcon className="icon" />
              {!isCollapsed && <span>Doctors</span>}
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/medicnies-categories"
              className="nav-link"
              title="Medicines"
            >
              <BsCapsule className="icon" />
              {!isCollapsed && <span>Medicines</span>}
            </Link>
          </li>

          <li className="nav-item">
            <Link
              to="/diagnosis-categories"
              className="nav-link"
              title="Diagnosis"
            >
              <svg
                width="20"
                height="20"
                className="svg-inline--fa fa-person-dots-from-line"
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="person-dots-from-line"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 576 512"
                data-fa-i2svg=""
              >
                <path
                  fill="currentColor"
                  d="M463.1 256c8.75 0 15.1-7.25 15.1-16S472.7 224 463.1 224c-8.75 0-15.1 7.25-15.1 16S455.2 256 463.1 256zM287.1 176c48.5 0 87.1-39.5 87.1-88S336.5 0 287.1 0S200 39.5 200 88S239.5 176 287.1 176zM80 256c8.75 0 15.1-7.25 15.1-16S88.75 224 80 224S64 231.3 64 240S71.25 256 80 256zM75.91 375.1c.6289-.459 41.62-29.26 100.1-50.05L176 432h223.1l-.0004-106.8c58.32 20.8 99.51 49.49 100.1 49.91C508.6 381.1 518.3 384 527.9 384c14.98 0 29.73-7 39.11-20.09c15.41-21.59 10.41-51.56-11.16-66.97c-1.955-1.391-21.1-14.83-51.83-30.85C495.5 279.2 480.7 288 463.1 288c-26.25 0-47.1-21.75-47.1-48c0-3.549 .4648-6.992 1.217-10.33C378.6 217.2 334.4 208 288 208c-59.37 0-114.1 15.01-160.1 32.67C127.6 266.6 106 288 80 288C69.02 288 58.94 284 50.8 277.7c-18.11 10.45-29.25 18.22-30.7 19.26c-21.56 15.41-26.56 45.38-11.16 66.97C24.33 385.5 54.3 390.4 75.91 375.1zM335.1 344c13.25 0 23.1 10.75 23.1 24s-10.75 24-23.1 24c-13.25 0-23.1-10.75-23.1-24S322.7 344 335.1 344zM240 248c13.25 0 23.1 10.75 23.1 24S253.3 296 240 296c-13.25 0-23.1-10.75-23.1-24S226.8 248 240 248zM559.1 464H16c-8.75 0-15.1 7.25-15.1 16l-.0016 16c0 8.75 7.25 16 15.1 16h543.1c8.75 0 15.1-7.25 15.1-16L575.1 480C575.1 471.3 568.7 464 559.1 464z"
                ></path>
              </svg>
              {"  "}
              {!isCollapsed && <span>Diagnosis</span>}
            </Link>
          </li>

          <li className="nav-item">
            <Link to="/services" className="nav-link" title="Services">
              <svg
                width="20"
                height="20"
                className="svg-inline--fa fa-box"
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="box"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                data-fa-i2svg=""
              >
                <path
                  fill="currentColor"
                  d="M50.73 58.53C58.86 42.27 75.48 32 93.67 32H208V160H0L50.73 58.53zM240 160V32H354.3C372.5 32 389.1 42.27 397.3 58.53L448 160H240zM448 416C448 451.3 419.3 480 384 480H64C28.65 480 0 451.3 0 416V192H448V416z"
                ></path>
              </svg>{" "}
              {!isCollapsed && <span>Services</span>}
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/doctor-opd-charges"
              className="nav-link"
              title="Services"
            >
              <svg
                width="20"
                height="20"
                className="svg-inline--fa fa-coins"
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="coins"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                data-fa-i2svg=""
              >
                <path
                  fill="currentColor"
                  d="M512 80C512 98.01 497.7 114.6 473.6 128C444.5 144.1 401.2 155.5 351.3 158.9C347.7 157.2 343.9 155.5 340.1 153.9C300.6 137.4 248.2 128 192 128C183.7 128 175.6 128.2 167.5 128.6L166.4 128C142.3 114.6 128 98.01 128 80C128 35.82 213.1 0 320 0C426 0 512 35.82 512 80V80zM160.7 161.1C170.9 160.4 181.3 160 192 160C254.2 160 309.4 172.3 344.5 191.4C369.3 204.9 384 221.7 384 240C384 243.1 383.3 247.9 381.9 251.7C377.3 264.9 364.1 277 346.9 287.3C346.9 287.3 346.9 287.3 346.9 287.3C346.8 287.3 346.6 287.4 346.5 287.5L346.5 287.5C346.2 287.7 345.9 287.8 345.6 288C310.6 307.4 254.8 320 192 320C132.4 320 79.06 308.7 43.84 290.9C41.97 289.9 40.15 288.1 38.39 288C14.28 274.6 0 258 0 240C0 205.2 53.43 175.5 128 164.6C138.5 163 149.4 161.8 160.7 161.1L160.7 161.1zM391.9 186.6C420.2 182.2 446.1 175.2 468.1 166.1C484.4 159.3 499.5 150.9 512 140.6V176C512 195.3 495.5 213.1 468.2 226.9C453.5 234.3 435.8 240.5 415.8 245.3C415.9 243.6 416 241.8 416 240C416 218.1 405.4 200.1 391.9 186.6V186.6zM384 336C384 354 369.7 370.6 345.6 384C343.8 384.1 342 385.9 340.2 386.9C304.9 404.7 251.6 416 192 416C129.2 416 73.42 403.4 38.39 384C14.28 370.6 .0003 354 .0003 336V300.6C12.45 310.9 27.62 319.3 43.93 326.1C83.44 342.6 135.8 352 192 352C248.2 352 300.6 342.6 340.1 326.1C347.9 322.9 355.4 319.2 362.5 315.2C368.6 311.8 374.3 308 379.7 304C381.2 302.9 382.6 301.7 384 300.6L384 336zM416 278.1C434.1 273.1 452.5 268.6 468.1 262.1C484.4 255.3 499.5 246.9 512 236.6V272C512 282.5 507 293 497.1 302.9C480.8 319.2 452.1 332.6 415.8 341.3C415.9 339.6 416 337.8 416 336V278.1zM192 448C248.2 448 300.6 438.6 340.1 422.1C356.4 415.3 371.5 406.9 384 396.6V432C384 476.2 298 512 192 512C85.96 512 .0003 476.2 .0003 432V396.6C12.45 406.9 27.62 415.3 43.93 422.1C83.44 438.6 135.8 448 192 448z"
                ></path>
              </svg>{" "}
              {!isCollapsed && <span>Hospital Charges</span>}
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/vaccinations" className="nav-link" title="Vaccinations">
              <svg
                width="20"
                height="20"
                className="svg-inline--fa fa-syringe"
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="syringe"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                data-fa-i2svg=""
              >
                <path
                  fill="currentColor"
                  d="M504.1 71.03l-64-64c-9.375-9.375-24.56-9.375-33.94 0s-9.375 24.56 0 33.94L422.1 56L384 94.06l-55.03-55.03c-9.375-9.375-24.56-9.375-33.94 0c-8.467 8.467-8.873 21.47-2.047 30.86l149.1 149.1C446.3 222.1 451.1 224 456 224c6.141 0 12.28-2.344 16.97-7.031c9.375-9.375 9.375-24.56 0-33.94L417.9 128L456 89.94l15.03 15.03C475.7 109.7 481.9 112 488 112s12.28-2.344 16.97-7.031C514.3 95.59 514.3 80.41 504.1 71.03zM208.8 154.1l58.56 58.56c6.25 6.25 6.25 16.38 0 22.62C264.2 238.4 260.1 240 256 240S247.8 238.4 244.7 235.3L186.1 176.8L144.8 218.1l58.56 58.56c6.25 6.25 6.25 16.38 0 22.62C200.2 302.4 196.1 304 192 304S183.8 302.4 180.7 299.3L122.1 240.8L82.75 280.1C70.74 292.1 64 308.4 64 325.4v88.68l-56.97 56.97c-9.375 9.375-9.375 24.56 0 33.94C11.72 509.7 17.86 512 24 512s12.28-2.344 16.97-7.031L97.94 448h88.69c16.97 0 33.25-6.744 45.26-18.75l187.6-187.6l-149.1-149.1L208.8 154.1z"
                ></path>
              </svg>{" "}
              {!isCollapsed && <span>Vaccinations</span>}
            </Link>
          </li>

          <li className="nav-item">
            <Link
              to="/pathology-parameters"
              className="nav-link"
              title="Pathology"
            >
              <svg
                width="20"
                height="20"
                className="svg-inline--fa fa-flask"
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="flask"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                data-fa-i2svg=""
              >
                <path
                  fill="currentColor"
                  d="M437.2 403.5L319.1 215L319.1 64h7.1c13.25 0 23.1-10.75 23.1-24l-.0002-16c0-13.25-10.75-24-23.1-24H120C106.8 0 96.01 10.75 96.01 24l-.0002 16c0 13.25 10.75 24 23.1 24h7.1L128 215l-117.2 188.5C-18.48 450.6 15.27 512 70.89 512h306.2C432.7 512 466.5 450.5 437.2 403.5zM137.1 320l48.15-77.63C189.8 237.3 191.9 230.8 191.9 224l.0651-160h63.99l-.06 160c0 6.875 2.25 13.25 5.875 18.38L309.9 320H137.1z"
                ></path>
              </svg>{" "}
              {!isCollapsed && <span>Pathology</span>}
            </Link>
          </li>

          <li className="nav-item">
            <Link to="/operation-reports" className="nav-link" title="Reports">
              <svg
                width="20"
                height="20"
                className="svg-inline--fa fa-file-medical"
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="file-medical"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 384 512"
                data-fa-i2svg=""
              >
                <path
                  fill="currentColor"
                  d="M256 0v128h128L256 0zM224 128L224 0H48C21.49 0 0 21.49 0 48v416C0 490.5 21.49 512 48 512h288c26.51 0 48-21.49 48-48V160h-127.1C238.3 160 224 145.7 224 128zM288 301.7v36.57C288 345.9 281.9 352 274.3 352L224 351.1v50.29C224 409.9 217.9 416 210.3 416H173.7C166.1 416 160 409.9 160 402.3V351.1L109.7 352C102.1 352 96 345.9 96 338.3V301.7C96 294.1 102.1 288 109.7 288H160V237.7C160 230.1 166.1 224 173.7 224h36.57C217.9 224 224 230.1 224 237.7V288h50.29C281.9 288 288 294.1 288 301.7z"
                ></path>
              </svg>{" "}
              {!isCollapsed && <span>Reports</span>}
            </Link>
          </li>

          <li className="nav-item">
            <Link to="/patients" className="nav-link" title="Patients">
              <svg
                width="20"
                height="20"
                className="svg-inline--fa fa-user-injured"
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="user-injured"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                data-fa-i2svg=""
              >
                <path
                  fill="currentColor"
                  d="M277.4 11.98C261.1 4.469 243.1 0 224 0C170.3 0 124.5 33.13 105.5 80h81.07L277.4 11.98zM342.5 80c-7.895-19.47-20.66-36.19-36.48-49.51L240 80H342.5zM224 256c70.7 0 128-57.31 128-128c0-5.48-.9453-10.7-1.613-16H97.61C96.95 117.3 96 122.5 96 128C96 198.7 153.3 256 224 256zM272 416h-45.14l58.64 93.83C305.4 503.1 320 485.8 320 464C320 437.5 298.5 416 272 416zM274.7 304H173.3c-5.393 0-10.71 .3242-15.98 .8047L206.9 384H272c44.13 0 80 35.88 80 80c0 18.08-6.252 34.59-16.4 48h77.73C432.5 512 448 496.5 448 477.3C448 381.6 370.4 304 274.7 304zM0 477.3C0 496.5 15.52 512 34.66 512H64v-169.1C24.97 374.7 0 423.1 0 477.3zM96 322.4V512h153.1L123.7 311.3C114.1 314.2 104.8 317.9 96 322.4z"
                ></path>
              </svg>{" "}
              {!isCollapsed && <span>Patients</span>}
            </Link>
          </li>

          <li className="nav-item">
            <Link to="/settings" className="nav-link" title="Settings">
              <svg
                width="20"
                height="20"
                className="svg-inline--fa fa-gears"
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="gears"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 512"
                data-fa-i2svg=""
              >
                <path
                  fill="currentColor"
                  d="M286.3 155.1C287.4 161.9 288 168.9 288 175.1C288 183.1 287.4 190.1 286.3 196.9L308.5 216.7C315.5 223 318.4 232.1 314.7 241.7C312.4 246.1 309.9 252.2 307.1 257.2L304 262.6C300.1 267.6 297.7 272.4 294.2 277.1C288.5 284.7 278.5 287.2 269.5 284.2L241.2 274.9C230.5 283.8 218.3 290.9 205 295.9L198.1 324.9C197 334.2 189.8 341.6 180.4 342.8C173.7 343.6 166.9 344 160 344C153.1 344 146.3 343.6 139.6 342.8C130.2 341.6 122.1 334.2 121 324.9L114.1 295.9C101.7 290.9 89.5 283.8 78.75 274.9L50.53 284.2C41.54 287.2 31.52 284.7 25.82 277.1C22.28 272.4 18.98 267.5 15.94 262.5L12.92 257.2C10.13 252.2 7.592 247 5.324 241.7C1.62 232.1 4.458 223 11.52 216.7L33.7 196.9C32.58 190.1 31.1 183.1 31.1 175.1C31.1 168.9 32.58 161.9 33.7 155.1L11.52 135.3C4.458 128.1 1.62 119 5.324 110.3C7.592 104.1 10.13 99.79 12.91 94.76L15.95 89.51C18.98 84.46 22.28 79.58 25.82 74.89C31.52 67.34 41.54 64.83 50.53 67.79L78.75 77.09C89.5 68.25 101.7 61.13 114.1 56.15L121 27.08C122.1 17.8 130.2 10.37 139.6 9.231C146.3 8.418 153.1 8 160 8C166.9 8 173.7 8.418 180.4 9.23C189.8 10.37 197 17.8 198.1 27.08L205 56.15C218.3 61.13 230.5 68.25 241.2 77.09L269.5 67.79C278.5 64.83 288.5 67.34 294.2 74.89C297.7 79.56 300.1 84.42 304 89.44L307.1 94.83C309.9 99.84 312.4 105 314.7 110.3C318.4 119 315.5 128.1 308.5 135.3L286.3 155.1zM160 127.1C133.5 127.1 112 149.5 112 175.1C112 202.5 133.5 223.1 160 223.1C186.5 223.1 208 202.5 208 175.1C208 149.5 186.5 127.1 160 127.1zM484.9 478.3C478.1 479.4 471.1 480 464 480C456.9 480 449.9 479.4 443.1 478.3L423.3 500.5C416.1 507.5 407 510.4 398.3 506.7C393 504.4 387.8 501.9 382.8 499.1L377.4 496C372.4 492.1 367.6 489.7 362.9 486.2C355.3 480.5 352.8 470.5 355.8 461.5L365.1 433.2C356.2 422.5 349.1 410.3 344.1 397L315.1 390.1C305.8 389 298.4 381.8 297.2 372.4C296.4 365.7 296 358.9 296 352C296 345.1 296.4 338.3 297.2 331.6C298.4 322.2 305.8 314.1 315.1 313L344.1 306.1C349.1 293.7 356.2 281.5 365.1 270.8L355.8 242.5C352.8 233.5 355.3 223.5 362.9 217.8C367.6 214.3 372.5 210.1 377.5 207.9L382.8 204.9C387.8 202.1 392.1 199.6 398.3 197.3C407 193.6 416.1 196.5 423.3 203.5L443.1 225.7C449.9 224.6 456.9 224 464 224C471.1 224 478.1 224.6 484.9 225.7L504.7 203.5C511 196.5 520.1 193.6 529.7 197.3C535 199.6 540.2 202.1 545.2 204.9L550.5 207.9C555.5 210.1 560.4 214.3 565.1 217.8C572.7 223.5 575.2 233.5 572.2 242.5L562.9 270.8C571.8 281.5 578.9 293.7 583.9 306.1L612.9 313C622.2 314.1 629.6 322.2 630.8 331.6C631.6 338.3 632 345.1 632 352C632 358.9 631.6 365.7 630.8 372.4C629.6 381.8 622.2 389 612.9 390.1L583.9 397C578.9 410.3 571.8 422.5 562.9 433.2L572.2 461.5C575.2 470.5 572.7 480.5 565.1 486.2C560.4 489.7 555.6 492.1 550.6 496L545.2 499.1C540.2 501.9 534.1 504.4 529.7 506.7C520.1 510.4 511 507.5 504.7 500.5L484.9 478.3zM512 352C512 325.5 490.5 304 464 304C437.5 304 416 325.5 416 352C416 378.5 437.5 400 464 400C490.5 400 512 378.5 512 352z"
                ></path>
              </svg>{" "}
              {!isCollapsed && <span>Settings</span>}
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
