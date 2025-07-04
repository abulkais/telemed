import React from 'react';


function HmoePage() {
  return (
    <div className="App">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <a className="navbar-brand" href="/">Hospitality</a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ml-auto">
              <li className="nav-item active">
                <a className="nav-link" href="/">Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#departments">Departments</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#doctors">Doctors</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#faq">FAQ</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#testimonials">Testimonials</a>
              </li>
              <li className="nav-item">
                <a className="nav-link btn btn-light text-primary ml-2" href="#appointment">Book Appointment</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h1>Welcome to Hospitality</h1>
              <h2>We Are Providing Best & Affordable Health Care</h2>
              <p className="lead">
                Continued Financial Initiatives Excellence at Hospitality Commercial Vehicle Service, 
                Advanced Medical Treatment, and Competence Project Care for Senior Diseases.
              </p>
              <div className="d-flex mt-4">
                <div className="mr-4">
                  <h3>Our 2023</h3>
                </div>
                <div>
                  <h3>Our Appointment</h3>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              {/* You can add your image here */}
              <div className="hero-image-placeholder"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Reach Out Section */}
      <section className="reach-out py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-4">Reach Out to Us</h2>
          <p className="text-center mb-5">
            How the right to be an eligible clinic needs to help us?
          </p>
          <div className="text-center">
            <p><strong>On completion:</strong></p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services py-5">
        <div className="container">
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h3 className="card-title">24 Hour Service</h3>
                  <p className="card-text">
                    Includes phone calls and other medical services that are not fully discharged 
                    and will be used in our healthcare plan work.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h3 className="card-title">Advanced Medical Technology</h3>
                  <p className="card-text">
                    Based on a high-level medical technology we allow the highest quality care.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h3 className="card-title">We are always ensure best</h3>
                  <p className="card-text">
                    Medical treatment for Your Health
                  </p>
                  <ul className="list-unstyled">
                    <li>Management Resource Collection has set long-term management focus on the primary patient of patients and patients.</li>
                    <li>The site: Specialize In Medicine.</li>
                    <li>Advanced Science Research Auditor.</li>
                    <li>Resource Offshore or All Medical Therapists.</li>
                    <li>Easy use in the Healthcare Process.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section id="departments" className="departments py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5">Departments</h2>
          <p className="text-center mb-5">
            Experience the case of racing everything you need under our roof with our comprehensive departmental offerings.
          </p>
          <div className="row text-center">
            <div className="col-md-2 col-6 mb-4">
              <div className="department-card p-3">
                <h4>Overall</h4>
              </div>
            </div>
            <div className="col-md-2 col-6 mb-4">
              <div className="department-card p-3">
                <h4>On holiday</h4>
              </div>
            </div>
            <div className="col-md-2 col-6 mb-4">
              <div className="department-card p-3">
                <h4>Naturdays</h4>
              </div>
            </div>
            <div className="col-md-2 col-6 mb-4">
              <div className="department-card p-3">
                <h4>Denmarkday</h4>
              </div>
            </div>
            <div className="col-md-2 col-6 mb-4">
              <div className="department-card p-3">
                <h4>Cardiology</h4>
              </div>
            </div>
            <div className="col-md-2 col-6 mb-4">
              <div className="department-card p-3">
                <h4>Bachelory</h4>
              </div>
            </div>
          </div>
          <div className="text-center mt-3">
            <h4>David Mow</h4>
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section id="doctors" className="doctors py-5">
        <div className="container">
          <h2 className="text-center mb-5">Meet Our Doctors</h2>
          <p className="text-center mb-5">
            Our team of expert doctors taken a wide range of specialists, ensuring you receive the highest quality care interest for your individual needs.
          </p>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card doctor-card">
                <div className="card-body text-center">
                  {/* Doctor image placeholder */}
                  <div className="doctor-image mb-3"></div>
                  <h3>Emily Williams</h3>
                  <p className="specialty">Cardiology</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card doctor-card">
                <div className="card-body text-center">
                  <div className="doctor-image mb-3"></div>
                  <h3>James Smith</h3>
                  <p className="specialty">David</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card doctor-card">
                <div className="card-body text-center">
                  <div className="doctor-image mb-3"></div>
                  <h3>Jessica Taylor</h3>
                  <p className="specialty">David</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card doctor-card">
                <div className="card-body text-center">
                  <div className="doctor-image mb-3"></div>
                  <h3>Matthew Brown</h3>
                  <p className="specialty">David</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-us py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5">Why Choose Our Hospital?</h2>
          <p className="text-center mb-5">
            At Hospitality, we understand their your health and well-being as of paramount importance. 
            Here's why we believe your hospital chooses it for your medical needs:
          </p>
          
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h3 className="card-title">Personalized Care</h3>
                  <p className="card-text">
                    A therapist is an excellent and healthy and well-being student at site. On behalf of your nursing assistant, 
                    we have made extensive use of personalized care services to help them improve their lives and deliver good quality care in the future.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h3 className="card-title">Expert Team</h3>
                  <p className="card-text">
                    With a dedicated team of experienced healthcare professionals, he helped clients, nurses, 
                    and experts assist us with the development of new and innovative medical services. 
                    We are proud of all these healthcare professionals who will support throughout your treatment.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h3 className="card-title">Cutting-Edge Facilities</h3>
                  <p className="card-text">
                    At hospitality, our facilities offer a number of useful design choices. As a result, 
                    our nursing assistant receives several relevant grants and offers a unique opportunity 
                    to provide the high-quality of care at every day of your journey.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Operational Method Section */}
      <section className="operational-method py-5">
        <div className="container">
          <h2 className="text-center mb-4">Our Operational Method</h2>
          <h3 className="text-center mb-5">A Comprehensive Guide to Your Health</h3>
          <p className="text-center mb-5">
            We serve as your reliable one-stop destination for all your healthcare needs. 
            Our extensive directory is crafted to offer convenient access to a diverse array 
            of healthcare services and providers, guaranteeing optimal care for you and your family.
          </p>
          <div className="row text-center">
            <div className="col-md-3 mb-4">
              <div className="step-card p-4">
                <h4>Book An Appointment</h4>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="step-card p-4">
                <h4>Conduct Checkup</h4>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="step-card p-4">
                <h4>Perform Treatment</h4>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="step-card p-4">
                <h4>Prescribe & Payment</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5">Frequently Asked Questions</h2>
          <div className="accordion" id="faqAccordion">
            <div className="card">
              <div className="card-header" id="headingOne">
                <h5 className="mb-0">
                  <button className="btn btn-link" type="button" data-toggle="collapse" data-target="#collapseOne">
                    What are your opening hours?
                  </button>
                </h5>
              </div>
              <div id="collapseOne" className="collapse show" data-parent="#faqAccordion">
                <div className="card-body">
                  We are open 24/7 for emergency services. Regular consultation hours are from 8:00 AM to 8:00 PM.
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header" id="headingTwo">
                <h5 className="mb-0">
                  <button className="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapseTwo">
                    Do you accept insurance?
                  </button>
                </h5>
              </div>
              <div id="collapseTwo" className="collapse" data-parent="#faqAccordion">
                <div className="card-body">
                  Yes, we accept most major insurance plans. Please contact our billing department for specific information about your insurance provider.
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header" id="headingThree">
                <h5 className="mb-0">
                  <button className="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapseThree">
                    How do I book an appointment?
                  </button>
                </h5>
              </div>
              <div id="collapseThree" className="collapse" data-parent="#faqAccordion">
                <div className="card-body">
                  You can book an appointment by calling our reception at (123) 456-7890 or through our online booking system on our website.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials py-5">
        <div className="container">
          <h2 className="text-center mb-5">Patient Testimonials</h2>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card testimonial-card">
                <div className="card-body">
                  <p className="card-text">
                    "The care I received at Hospitality was exceptional. The doctors were knowledgeable and took time to explain everything to me."
                  </p>
                  <div className="patient-info">
                    <div className="patient-image"></div>
                    <div>
                      <h5>John Doe</h5>
                      <p>Cardiology Patient</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card testimonial-card">
                <div className="card-body">
                  <p className="card-text">
                    "The facilities are modern and clean, and the staff was very friendly. I felt well taken care of during my entire stay."
                  </p>
                  <div className="patient-info">
                    <div className="patient-image"></div>
                    <div>
                      <h5>Jane Smith</h5>
                      <p>General Surgery</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card testimonial-card">
                <div className="card-body">
                  <p className="card-text">
                    "I highly recommend Hospitality for their personalized approach to healthcare. They really listen to their patients."
                  </p>
                  <div className="patient-info">
                    <div className="patient-image"></div>
                    <div>
                      <h5>Robert Johnson</h5>
                      <p>Orthopedics</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Appointment Section */}
      <section id="appointment" className="appointment py-5 bg-primary text-white">
        <div className="container">
          <h2 className="text-center mb-4">Book An Appointment</h2>
          <div className="row justify-content-center">
            <div className="col-md-8">
              <form>
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <input type="text" className="form-control" placeholder="Full Name" required />
                  </div>
                  <div className="form-group col-md-6">
                    <input type="email" className="form-control" placeholder="Email" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <input type="tel" className="form-control" placeholder="Phone Number" required />
                  </div>
                  <div className="form-group col-md-6">
                    <select className="form-control" required>
                      <option value="">Select Department</option>
                      <option>Cardiology</option>
                      <option>Orthopedics</option>
                      <option>Neurology</option>
                      <option>General Medicine</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <input type="date" className="form-control" required />
                  </div>
                  <div className="form-group col-md-6">
                    <input type="time" className="form-control" required />
                  </div>
                </div>
                <div className="form-group">
                  <textarea className="form-control" rows="3" placeholder="Additional Information"></textarea>
                </div>
                <div className="text-center">
                  <button type="submit" className="btn btn-light btn-lg">Submit Request</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer py-5 bg-dark text-white">
        <div className="container">
          <div className="row">
            <div className="col-md-4 mb-4">
              <h4>Hospitality</h4>
              <p>
                Providing best & affordable healthcare with advanced medical technology and personalized care.
              </p>
            </div>
            <div className="col-md-4 mb-4">
              <h4>Quick Links</h4>
              <ul className="list-unstyled">
                <li><a href="/">Home</a></li>
                <li><a href="#departments">Departments</a></li>
                <li><a href="#doctors">Doctors</a></li>
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#testimonials">Testimonials</a></li>
              </ul>
            </div>
            <div className="col-md-4 mb-4">
              <h4>Contact Us</h4>
              <p>
                <i className="fas fa-map-marker-alt mr-2"></i> 123 Medical Drive, Health City
              </p>
              <p>
                <i className="fas fa-phone mr-2"></i> (123) 456-7890
              </p>
              <p>
                <i className="fas fa-envelope mr-2"></i> info@hospitality.com
              </p>
            </div>
          </div>
          <hr className="bg-light" />
          <div className="text-center">
            <p>&copy; 2023 Hospitality. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HmoePage;