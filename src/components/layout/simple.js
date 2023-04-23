
import React, { Fragment } from "react";
import { Helmet } from "react-helmet";

function SimpleLayout({ children }) {
  return (
    <Fragment>
      <Helmet>
        <title>ClinicPlus Bookings</title>
        <meta name="description" content="ClinicPlus offers comprehensive Occupational Health Management and Consulting service to mines and industries. Our goal is to help our clients manage their occupational health and safety risks." />
        <link href="/assets/img/favicon.png" rel="icon" />
        <link href="/assets/img/apple-touch-icon.png" rel="apple-touch-icon" />
        <link href="https://fonts.gstatic.com" rel="preconnect" />
        <link
          href="https://fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,600,600i,700,700i|Nunito:300,300i,400,400i,600,600i,700,700i|Poppins:300,300i,400,400i,500,500i,600,600i,700,700i"
          rel="stylesheet"
        />

        <link href="/css/bootstrap.min.css" rel="stylesheet" />
        <link
          href="/assets/vendor/bootstrap-icons/bootstrap-icons.css"
          rel="stylesheet"
        />
        <link
          href="/assets/vendor/boxicons/css/boxicons.min.css"
          rel="stylesheet"
        />
        <link href="/assets/vendor/quill/quill.snow.css" rel="stylesheet" />
        <link href="/assets/vendor/quill/quill.bubble.css" rel="stylesheet" />
        <link href="/assets/vendor/remixicon/remixicon.css" rel="stylesheet" />
        <link
          href="/assets/vendor/simple-datatables/style.css"
          rel="stylesheet"
        />

        <link href="/assets/css/style2.css" rel="stylesheet" />
      </Helmet>
      {children}
    </Fragment>
  );
}

export default SimpleLayout;
