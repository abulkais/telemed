import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [data, setData] = useState({
    doctors: { totalCount: 0, activeCount: 0 },
    patients: { totalCount: 0, activeCount: 0 },
    nurses: { totalCount: 0, activeCount: 0 },
    admins: { totalCount: 0, activeCount: 0 },
    labTechnicians: { totalCount: 0, activeCount: 0 },
    accountants: { totalCount: 0, activeCount: 0 },
    receptionists: { totalCount: 0, activeCount: 0 },
    pharmacists: { totalCount: 0, activeCount: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = "http://localhost:8080/api";
        const [
          doctorsRes,
          patientsRes,
         
          nurseRes,
          adminsRes,
          labTechniciansRes,
          accountantsRes,
          receptionistsRef,
          pharmacistsRef,
        ] = await Promise.all([
          axios.get(`${baseUrl}/doctors`),
          axios.get(`${baseUrl}/patients`),
          axios.get(`${baseUrl}/nurses`),
          axios.get(`${baseUrl}/admins`),
          axios.get(`${baseUrl}/lab-technicians`),
          axios.get(`${baseUrl}/accountants`),
          axios.get(`${baseUrl}/receptionists`),
          axios.get(`${baseUrl}/pharmacists`),
        ]);

        const doctors = doctorsRes.data;
        const patients = patientsRes.data;
        const nurses = nurseRes.data;
        const admins = adminsRes.data;
        const labTechnicians = labTechniciansRes.data;
        const accountants = accountantsRes.data;
        const receptionists = receptionistsRef.data;
        const pharmacists = pharmacistsRef.data;

        setData({
          doctors: {
            totalCount: doctors.length,
            activeCount: doctors.filter(
              (doc) => doc.status === 1 || doc.status === "Active"
            ).length,
          },
          patients: {
            totalCount: patients.length,
            activeCount: patients.filter(
              (p) => p.status === 1 || p.status === "Active"
            ).length,
          },
          
          nurses: {
            totalCount: nurses.length,
            activeCount: nurses.filter(
              (n) => n.status === 1 || n.status === "Active"
            ).length,
          },
          admins: {
            totalCount: admins.length,
            activeCount: admins.filter(
              (a) => a.status === 1 || a.status === "Active"
            ).length,
          },
          labTechnicians: {
            totalCount: labTechnicians.length,
            activeCount: labTechnicians.filter(
              (lt) => lt.status === 1 || lt.status === "Active"
            ).length,
          },
          accountants: {
            totalCount: accountants.length,
            activeCount: accountants.filter(
              (acc) => acc.status === 1 || acc.status === "Active"
            ).length,
          },
          receptionists: {
            totalCount: receptionists.length,
            activeCount: receptionists.filter(
              (rec) => rec.status === 1 || rec.status === "Active"
            ).length,
          },
          pharmacists: {
            totalCount: pharmacists.length,
            activeCount: pharmacists.filter(
              (ph) => ph.status === 1 || ph.status === "Active"
            ).length,
          },
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container-fluid py-4">
      <div className="row g-4">
        <div className="col-lg-4 col-md-6">
          <div className="dashboard-card doctors-card">
            <svg
              className="dashboard-icon"
              aria-hidden="true"
              focusable="false"
              data-prefix="fas"
              data-icon="user-doctor"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
            >
              <path
                fill="currentColor"
                d="M352 128C352 198.7 294.7 256 223.1 256C153.3 256 95.1 198.7 95.1 128C95.1 57.31 153.3 0 223.1 0C294.7 0 352 57.31 352 128zM287.1 362C260.4 369.1 239.1 394.2 239.1 424V448C239.1 452.2 241.7 456.3 244.7 459.3L260.7 475.3C266.9 481.6 277.1 481.6 283.3 475.3C289.6 469.1 289.6 458.9 283.3 452.7L271.1 441.4V424C271.1 406.3 286.3 392 303.1 392C321.7 392 336 406.3 336 424V441.4L324.7 452.7C318.4 458.9 318.4 469.1 324.7 475.3C330.9 481.6 341.1 481.6 347.3 475.3L363.3 459.3C366.3 456.3 368 452.2 368 448V424C368 394.2 347.6 369.1 320 362V308.8C393.5 326.7 448 392.1 448 472V480C448 497.7 433.7 512 416 512H32C14.33 512 0 497.7 0 480V472C0 393 54.53 326.7 128 308.8V370.3C104.9 377.2 88 398.6 88 424C88 454.9 113.1 480 144 480C174.9 480 200 454.9 200 424C200 398.6 183.1 377.2 160 370.3V304.2C162.7 304.1 165.3 304 168 304H280C282.7 304 285.3 304.1 288 304.2L287.1 362zM167.1 424C167.1 437.3 157.3 448 143.1 448C130.7 448 119.1 437.3 119.1 424C119.1 410.7 130.7 400 143.1 400C157.3 400 167.1 410.7 167.1 424z"
              ></path>
            </svg>
            <div className="dashboard-card-content">
              <div className="content-left">
                <h3>Doctors</h3>
                <p>{data.doctors.totalCount}</p>
              </div>
              <div className="content-right">
                <h5>Active</h5>
                <span className="mt-2">{data.doctors.activeCount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="dashboard-card patients-card">
            <svg
              className="svg-inline--fa fa-user-injured dashboard-icon"
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
            </svg>
            <div className="dashboard-card-content">
              <div className="content-left">
                <h3>Patients</h3>
                <p>{data.patients.totalCount}</p>
              </div>
              <div className="content-right">
                <h5>Active</h5>
                <span className="mt-2">{data.patients.activeCount}</span>
              </div>
            </div>
          </div>
        </div>


        <div className="col-lg-4 col-md-6">
          <div className="dashboard-card users-card">
            <svg
              className="svg-inline--fa fa-user-nurse fs-1-xl dashboard-icon"
              aria-hidden="true"
              focusable="false"
              data-prefix="fas"
              data-icon="user-nurse"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
              data-fa-i2svg=""
            >
              <path
                fill="currentColor"
                d="M224 304c70.75 0 128-57.25 128-128V65.88c0-13.38-8.25-25.38-20.75-30L246.5 4.125C239.3 1.375 231.6 0 224 0S208.8 1.375 201.5 4.125L116.8 35.88C104.3 40.5 96 52.5 96 65.88V176C96 246.8 153.3 304 224 304zM184 71.63c0-2.75 2.25-5 5-5h21.62V45c0-2.75 2.25-5 5-5h16.75c2.75 0 5 2.25 5 5v21.62H259c2.75 0 5 2.25 5 5v16.75c0 2.75-2.25 5-5 5h-21.62V115c0 2.75-2.25 5-5 5H215.6c-2.75 0-5-2.25-5-5V93.38H189c-2.75 0-5-2.25-5-5V71.63zM144 160h160v16C304 220.1 268.1 256 224 256S144 220.1 144 176V160zM327.2 312.8L224 416L120.8 312.8c-69.93 22.3-120.8 87.25-120.8 164.6C.0006 496.5 15.52 512 34.66 512H413.3c19.14 0 34.66-15.46 34.66-34.61C447.1 400.1 397.1 335.1 327.2 312.8z"
              ></path>
            </svg>
            <div className="dashboard-card-content">
              <div className="content-left">
                <h3>Nurses</h3>
                <p>{data.nurses.totalCount}</p>
              </div>
              <div className="content-right">
                <h5>Active</h5>
                <span className="mt-2">{data.nurses.activeCount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="dashboard-card users-card">
            <svg
              className="svg-inline--fa fa-vial-virus fs-1-xl dashboard-icon"
              aria-hidden="true"
              focusable="false"
              data-prefix="fas"
              data-icon="vial-virus"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 576 512"
              data-fa-i2svg=""
            >
              <path
                fill="currentColor"
                d="M256 32C273.7 32 288 46.33 288 64C288 81.67 273.7 96 256 96V207.1C252.9 209.1 249.9 211.5 247.2 214.2C225.3 236.1 225.3 271.6 247.2 293.4C247.4 293.6 247.4 293.7 247.5 293.8L247.5 293.8C247.5 293.9 247.5 294.1 247.4 294.4C247.3 294.6 247.1 294.8 247.1 294.8L247 294.9C246.1 294.9 246.8 294.9 246.6 294.9C215.7 294.9 190.6 319.1 190.6 350.9C190.6 381.8 215.7 406.9 246.6 406.9C246.8 406.9 246.1 406.9 247 406.9L247.1 406.9C247.1 406.1 247.3 407.1 247.4 407.4C247.5 407.7 247.5 407.9 247.5 407.1L247.5 408C247.4 408.1 247.4 408.2 247.2 408.3C236 419.5 230.6 434.2 230.8 448.8C213.3 467.1 188 480 160 480C106.1 480 64 437 64 384V96C46.33 96 32 81.67 32 64C32 46.33 46.33 32 64 32H256zM192 192V96H128V192H192zM383.8 189.7C397.1 189.7 407.8 200.4 407.8 213.7C407.8 242.9 443.2 257.6 463.9 236.9C473.3 227.5 488.5 227.5 497.8 236.9C507.2 246.2 507.2 261.4 497.8 270.8C477.2 291.5 491.8 326.9 521.1 326.9C534.3 326.9 545.1 337.6 545.1 350.9C545.1 364.1 534.3 374.9 521.1 374.9C491.8 374.9 477.2 410.3 497.8 430.9C507.2 440.3 507.2 455.5 497.8 464.9C488.5 474.3 473.3 474.3 463.9 464.9C443.2 444.2 407.8 458.9 407.8 488.1C407.8 501.4 397.1 512.1 383.8 512.1C370.6 512.1 359.8 501.4 359.8 488.1C359.8 458.9 324.5 444.2 303.8 464.9C294.4 474.3 279.2 474.3 269.8 464.9C260.5 455.5 260.5 440.3 269.8 430.9C290.5 410.3 275.9 374.9 246.6 374.9C233.4 374.9 222.6 364.1 222.6 350.9C222.6 337.6 233.4 326.9 246.6 326.9C275.9 326.9 290.5 291.5 269.8 270.8C260.5 261.4 260.5 246.2 269.8 236.9C279.2 227.5 294.4 227.5 303.8 236.9C324.5 257.6 359.8 242.9 359.8 213.7C359.8 200.4 370.6 189.7 383.8 189.7H383.8zM352 352C369.7 352 384 337.7 384 320C384 302.3 369.7 288 352 288C334.3 288 320 302.3 320 320C320 337.7 334.3 352 352 352zM416 360C402.7 360 392 370.7 392 384C392 397.3 402.7 408 416 408C429.3 408 440 397.3 440 384C440 370.7 429.3 360 416 360z"
              ></path>
            </svg>

            <div className="dashboard-card-content">
              <div className="content-left">
                <h3>Lab Technicians</h3>
                <p>{data.labTechnicians.totalCount}</p>
              </div>
              <div className="content-right">
                <h5>Active</h5>
                <span className="mt-2">{data.labTechnicians.activeCount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="dashboard-card users-card">
            <svg
              className="svg-inline--fa fa-lock fs-1-xl dashboard-icon"
              aria-hidden="true"
              focusable="false"
              data-prefix="fas"
              data-icon="lock"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
              data-fa-i2svg=""
            >
              <path
                fill="currentColor"
                d="M80 192V144C80 64.47 144.5 0 224 0C303.5 0 368 64.47 368 144V192H384C419.3 192 448 220.7 448 256V448C448 483.3 419.3 512 384 512H64C28.65 512 0 483.3 0 448V256C0 220.7 28.65 192 64 192H80zM144 192H304V144C304 99.82 268.2 64 224 64C179.8 64 144 99.82 144 144V192z"
              ></path>
            </svg>

            <div className="dashboard-card-content">
              <div className="content-left">
                <h3>Admins</h3>
                <p>{data.admins.totalCount}</p>
              </div>
              <div className="content-right">
                <h5>Active</h5>
                <span className="mt-2">{data.admins.activeCount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="dashboard-card users-card">
            <svg
              className="svg-inline--fa fa-file-invoice-dollar fs-1-xl dashboard-icon"
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
            </svg>

            <div className="dashboard-card-content">
              <div className="content-left">
                <h3>Accountants</h3>
                <p>{data.accountants.totalCount}</p>
              </div>
              <div className="content-right">
                <h5>Active</h5>
                <span className="mt-2">{data.accountants.activeCount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="dashboard-card users-card">
          <svg className="svg-inline--fa fa-user-tie fs-1-xl dashboard-icon" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="user-tie" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg=""><path fill="currentColor" d="M352 128C352 198.7 294.7 256 224 256C153.3 256 96 198.7 96 128C96 57.31 153.3 0 224 0C294.7 0 352 57.31 352 128zM209.1 359.2L176 304H272L238.9 359.2L272.2 483.1L311.7 321.9C388.9 333.9 448 400.7 448 481.3C448 498.2 434.2 512 417.3 512H30.72C13.75 512 0 498.2 0 481.3C0 400.7 59.09 333.9 136.3 321.9L175.8 483.1L209.1 359.2z"></path></svg>

        
            <div className="dashboard-card-content">
              <div className="content-left">
                <h3>Receptionists</h3>
                <p>{data.receptionists.totalCount}</p>
              </div>
              <div className="content-right">
                <h5>Active</h5>
                <span className="mt-2">{data.receptionists.activeCount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="dashboard-card users-card">
            <svg
              className="svg-inline--fa fa-prescription fs-1-xl dashboard-icon"
              aria-hidden="true"
              focusable="false"
              data-prefix="fas"
              data-icon="prescription"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
              data-fa-i2svg=""
            >
              <path
                fill="currentColor"
                d="M440.1 448.4l-96.28-96.21l95.87-95.95c9.373-9.381 9.373-24.59 0-33.97l-22.62-22.64c-9.373-9.381-24.57-9.381-33.94 0L288.1 295.6L220.5 228c46.86-22.92 76.74-75.46 64.95-133.1C273.9 38.74 221.8 0 164.6 0H31.1C14.33 0 0 14.34 0 32.03v264.1c0 13.26 10.75 24.01 23.1 24.01l31.1 .085c13.25 0 23.1-10.75 23.1-24.02V240.2H119.4l112.1 112L135.4 448.4c-9.373 9.381-9.373 24.59 0 33.97l22.62 22.64c9.373 9.38 24.57 9.38 33.94 0l96.13-96.21l96.28 96.21c9.373 9.381 24.57 9.381 33.94 0l22.62-22.64C450.3 472.9 450.3 457.7 440.1 448.4zM79.1 80.06h87.1c22.06 0 39.1 17.95 39.1 40.03s-17.94 40.03-39.1 40.03H79.1V80.06z"
              ></path>
            </svg>

            <div className="dashboard-card-content">
              <div className="content-left">
                <h3>Pharmacists</h3>
                <p>{data.pharmacists.totalCount}</p>
              </div>
              <div className="content-right">
                <h5>Active</h5>
                <span className="mt-2">{data.pharmacists.activeCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
