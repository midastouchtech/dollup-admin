import { useSelector, useDispatch } from "react-redux";
import { save, selectUser } from "../../store/user";
import { isNil, isEmpty } from "ramda";
import React, { useEffect, Fragment, useState } from "react";
import styled from "styled-components";
import { NavItem, ListItemIcon } from "./components";
import { FaSearch } from "react-icons/fa";
import { includes } from "ramda";
import { useLocation } from "react-router-dom";
import cookies from "js-cookie";
import { Helmet } from "react-helmet";

import { useNavigate } from "react-router-dom";
import moment from "moment";

const exists = (i) => !isNil(i) && !isEmpty(i);

const SideBarContainer = styled.div`
  display: flex;
  width: 20%;
  background: #181925;
  align-items: center;
  flex-direction: column;
`;

const Item = styled.div``;

const NavContainer = styled.div`
  display: flex;
  width: 100%;
  height: 83px;
  background: #181925;
  flex-direction: row;
  ${Item} {
    margin-top: 15px;
    height: 50px;
    width: 20%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

const SearchBox = styled.div`
  width: 269px;
  height: 40px;
  background: #6a6b6f;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    fill: #bcbec5;
  }
  input {
    width: 80%;
    height: 75%;
    margin-left: 10px;
    background: transparent;
    font-size: 14px;
    font-weight: 600;
    color: #bcbec5;
    border: none;
    &:active {
      outline: none;
    }
    &:focus {
      outline: none;
    }
    &:hover {
      outline: none;
    }
    /* border: none; */
  }
`;

const ChildrenContainer = styled.div`
  display: flex;
  width: 80%;
  border-top-left-radius: 20px;
  height: 90vh;
  overflow: scroll;
`;

const ItemsContainer = styled.div`
  display: flex;
  width: 100%;
`;

const ImageContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const NavItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const MuralContainer = styled.div`
  display: none;
  flex-direction: column;
  width: 100px;
  height: 100px;
  justify-content: center;
  align-items: center;
  img {
    width: 125px;
    height: 113px;
  }
`;

const Image = styled.div`
  border-radius: 100px;
  width: 95px;
  height: 95px;
  border: 3px solid #758ac0;
  background: url(${(props) => props.path});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

const Username = styled.p`
  font-weight: bold;
  font-size: 14px;
  text-transform: capitalize;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  span {
    color: grey;
  }
`;

const StyledAside = styled.aside`
  height: 100vh;
  background-color: #313a46 !important;
`;

const StyledMain = styled.main`
  height: 100vh;
  background: #fff;
  overflow-x: scroll;
  margin-top: 5vh;
  .btn-primary {
    color: #fff;
    background-color: #e91e63 !important;
    border-color: #e91e63 !important;
  }
  .table .thead-dark th {
    color: #fff;
    background-color: #313a46;
    border-color: #313a46;
  }
`;

const StyledImg = styled.img`
  width: 20%;
  margin-left: 100px;
  margin-bottom: 20px;
  margin-top: 20px;
`;

const Banner = styled.div`
  width: 100vw;
  height: 40px;
  background: #d80009;
  padding: 10px;
  text-align: center;
  color: white;
  font-weight: 700;
`;

const navItems = [
  {
    icon: "list",
    title: "Bookings",
    link: "/",
    isActive: true,
  },
  {
    icon: "vendors",
    title: "Vendors",
    link: "/vendors",
  },
  {
    icon: "money",
    title: "Customers",
    link: "/customers",
  },
  {
    icon: "envelope",
    title: "Services",
    link: "/services",
  },
  {
    icon: "bell",
    title: "Stylists",
    link: "/stylists",
  },
  {
    icon: "settings",
    title: "Categories",
    link: "/categories",
  },
  {
    icon: "logout",
    title: "Sub Categories",
    link: "/sub-categories",
  },
  {
    icon: "bell",
    title: "Requests",
    link: "/requests",
  },
  {
    icon: "settings",
    title: "Analytics",
    link: "/analytics",
  },
];

function Layout({ socket, children }) {
  const user = useSelector(selectUser).data;
  const cookieUser = cookies.get("dollup_admin_logged_in_user");
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [systemSettings, setSystemSettings] = useState();

  useEffect(() => {
    console.log("use effect socket", socket);
    // if(socket && !exists(systemSettings)){
    //   socket.emit("GET_SYSTEM_SETTINGS")
    //   socket.on("RECEIVE_SYSTEM_SETTINGS", settings => {
    //     setSystemSettings(settings)
    //   })
    //   socket.on("FETCH_SYSTEM_SETTINGS", settings => {
    //     socket.emit("GET_SYSTEM_SETTINGS")
    //   })
    // }
    if (socket && !exists(user)) {
      socket.onAny((event) => console.log("** Handling:", event));

      if (cookieUser) {
        socket.emit("GET_USER", { id: cookieUser });
      }
      if (
        (isNil(cookieUser) || isEmpty(cookieUser)) &&
        location.pathname !== "/login"
      ) {
        navigate("/login");
      }
      socket.on("RECEIVE_USER", (u) => {
        dispatch(save(u));
      });
    }
  }, [socket]);

  const isAuthRoute =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <Fragment>
      <Helmet>
        <title> Admin Dashboard</title>
        <meta
          name="description"
          content="ClinicPlus offers comprehensive Occupational Health Management and Consulting service to mines and industries. Our goal is to help our clients manage their occupational health and safety risks."
        />
        {/* <link href="/cp-logo-full.png" rel="icon" />
        <link href="/cp-logo-full.png" rel="apple-touch-icon" /> */}
        <link href="https://fonts.gstatic.com" rel="preconnect" />

        <meta property="og:title" content="ClinicPlus Bookings" />

        <meta
          property="og:description"
          content="ClinicPlus offers comprehensive Occupational Health Management and Consulting service to mines and industries. Our goal is to help our clients manage their occupational health and safety risks."
        />

        <meta property="og:image:width" content="1200" />

        <meta property="og:image:height" content="630" />
        <link
          href="https://fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,600,600i,700,700i|Nunito:300,300i,400,400i,600,600i,700,700i|Poppins:300,300i,400,400i,500,500i,600,600i,700,700i"
          rel="stylesheet"
        />

        <link href="/css/bootstrap.min.css" rel="stylesheet" />
        <link
          href="/css/bootstrap-directional-buttons.min.css"
          rel="stylesheet"
        />
      </Helmet>
      {systemSettings?.client.underMaintanance && (
        <Banner>Please note the system is under maintanance</Banner>
      )}
      {!isAuthRoute && (
        <Fragment>
          <div className="row">
            <StyledAside className="col-2 text-light pt-5 d-none d-sm-none d-lg-block">
              <div className="d-flex flex-column align-items-center">
                <div className="d-flex flex-column align-items-center">
                  <Image path={user?.details?.picture || "/assets/man.png"} />
                  <Username>{user?.details?.name}</Username>
                  <span>{user?.details.email}</span>
                </div>
              </div>
              <ul class="list-group list-group-flush mx-3 mt-4  text-light">
                {navItems.map((item) => {
                  const isActive =
                    location.pathname === "/"
                      ? item.link === "/"
                      : includes(location.pathname, item.link);
                  return (
                    <NavItem
                      key={item.title}
                      {...item}
                      navigate={navigate}
                      isActive={isActive}
                    />
                  );
                })}
              </ul>
              <MuralContainer>
                <p>© Copyright Clinic Plus 2020 </p>
              </MuralContainer>
            </StyledAside>
            <StyledMain className="col-xs-12 col-sm-12 col-lg-9">
              <div className="container">
                <div class="pagetitle mt-3 mb-3"></div>
              </div>
              {children}
            </StyledMain>
          </div>
        </Fragment>
      )}
      {isAuthRoute && children}
    </Fragment>
  );
}

export default Layout;
