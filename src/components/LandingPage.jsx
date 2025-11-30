import React from 'react';
import '../styles/LandingPage.css';

function LandingPage() {
  const features = [
    {
      title: 'Secure Records',
      description: 'Safely store and access your medical history, prescriptions, and test results anytime, anywhere.',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      )
    },
    {
      title: 'Effortless Appointments',
      description: 'Book, reschedule, and receive reminders for your doctor appointments with a few simple clicks.',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M8 7V3m8 4V3m-9 8h8m-8 4h8m-11 0a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2z" />
      )
    },
    {
      title: '24/7 Access',
      description: 'Your health data is always accessible, ensuring you have the information you need, when you need it.',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      )
    }
  ];

  return (
    <div className="bodyContainer landingPage">

      <main className="mainContent">
        <section className="heroSection container">
          <h1 className="heroTitle">Secure and Seamless Health Management.</h1>
          <p className="heroSubtitle">
            All your health records and appointments in one place. Securely manage your medical history and book doctor visits effortlessly.
          </p>
          <button className="loginBtn" onClick={() => window.location.href="/login"}>Access MedVault Now</button>
        </section>

        <section className="featuresSection container">
          <h2 className="sectionTitle">Empowering Your Health Journey</h2>
          <div className="featuresGrid">
            {features.map((feature, index) => (
              <div key={index} className="featureCard">
                <div className="featureIconWrapper">
                  <svg className="featureIcon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="featureTitle">{feature.title}</h3>
                <p className="featureDescription">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

<footer className="footer">
  <div className="container">
    <div className="footerContent">
      <div className="footerContact">
        <a
          href="https://www.linkedin.com/in/hitesh-narasapuram-712a91222/"
          target="_blank"
          rel="noopener noreferrer"
          className="linkedinLink"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            fill="currentColor"
            viewBox="0 0 24 24"
            className="linkedinIcon"
          >
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.762 2.239 5 5 5h14c2.762 0 5-2.238 5-5v-14c0-2.761-2.238-5-5-5zm-11.5 20h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.787-1.75-1.754s.784-1.754 1.75-1.754c.967 0 1.75.787 1.75 1.754s-.783 1.754-1.75 1.754zm14.5 12.268h-3v-5.604c0-1.336-.027-3.055-1.861-3.055-1.863 0-2.149 1.454-2.149 2.957v5.702h-3v-11h2.885v1.507h.041c.402-.76 1.387-1.56 2.854-1.56 3.051 0 3.61 2.008 3.61 4.618v6.435z"/>
          </svg>
          <span>LinkedIn</span>
        </a>
      </div>

      <p className="footerText">&copy; {new Date().getFullYear()} MedVault. All rights reserved.</p>
    </div>
  </div>
</footer>


    </div>
  );
}

export default LandingPage;
