import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import App from "./App";
import Appointment from "./pages/appointments/appointment";
import AppointmentEditor from "./pages/appointments/appointment/edit";
import AppointmentCreator from "./pages/appointments/appointment/create";
import AppointmentQuote from "./pages/appointments/appointment/quote";

import Vendors from "./pages/vendors";
import VendorEdit from "./pages/vendors/vendor/edit";
import Customers from "./pages/customers";
import Services from "./pages/services";
import Stylists from "./pages/stylists";

import Categories from "./pages/categories";
import CategoryCreator from "./pages/categories/category/create";
import CategoryEditor from "./pages/categories/category/edit";
import SubCategories from "./pages/subCategories";
import SubCategoryCreator from "./pages/subCategories/subCategory/create";
import SubCategoryEditor from "./pages/subCategories/subCategory/edit";
import Requests from "./pages/requests";
import BookingsBy from "./pages/bookings-by";

import Settings from "./pages/settings";
import Messages from "./pages/messages";
import Login from "./pages/login";
import Logout from "./pages/logout";
import Register from "./pages/register";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";
import styled from "styled-components";
import Layout from "./components/layout";
import { useNavigate } from "react-router-dom";

import io from "socket.io-client";

import { Provider } from "react-redux";
import { store } from "./store";
import SimpleLayout from "./components/layout/simple";
import "./css/style.css";

const Container = styled.div`
  height: 100vh;
  width: 100%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
`;

const Main = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socektOptions = {
      path: "/socket.io",
      transports: ["websocket"],
      secure: true,
    };
    const newSocket = io(`${process.env.REACT_APP_SOCKET_URL}`, socektOptions);
    setSocket(newSocket);
    return () => newSocket.close();
  }, [setSocket]);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <SimpleLayout>
              <Login socket={socket} />
            </SimpleLayout>
          }
        />
        <Route
          path="/logout"
          element={
            <SimpleLayout>
              <Logout socket={socket} />
            </SimpleLayout>
          }
        />
        <Route
          path="/register"
          element={
            <SimpleLayout>
              <Register socket={socket} />
            </SimpleLayout>
          }
        />
        <Route
          path="/"
          element={
            <Layout socket={socket}>
              <App socket={socket} />
            </Layout>
          }
        />
        <Route
          path="/bookings-by/:name"
          element={
            <Layout socket={socket}>
              <BookingsBy socket={socket} />
            </Layout>
          }
        />
        <Route
          path="/vendors"
          element={
            <Layout socket={socket}>
              <Vendors socket={socket} />
            </Layout>
          }
        />
        <Route
          path="/customers"
          element={
            <Layout socket={socket}>
              <Customers socket={socket} />
            </Layout>
          }
        />
        <Route
          path="/services"
          element={
            <Layout socket={socket}>
              <Services socket={socket} />
            </Layout>
          }
        />
        <Route
          path="/stylists"
          element={
            <Layout socket={socket}>
              <Stylists socket={socket} />
            </Layout>
          }
        />
        <Route
          path="/appointment/:appId"
          element={
            <Layout socket={socket}>
              <Appointment socket={socket} />
            </Layout>
          }
        />
        <Route
          path="/appointment/edit/:appId"
          element={
            <Layout socket={socket}>
              <AppointmentEditor socket={socket} />
            </Layout>
          }
        />
        <Route
          path="/vendor/edit/:vendorId"
          element={
            <Layout socket={socket}>
              <VendorEdit socket={socket} />
            </Layout>
          }
        />
        <Route
          path="/appointment/quote/:appId"
          element={
            <SimpleLayout>
              <AppointmentQuote socket={socket} />
            </SimpleLayout>
          }
        />
        <Route
          path="/appointment/create"
          element={
            <Layout socket={socket}>
              <AppointmentCreator socket={socket} />
            </Layout>
          }
        />
        <Route
          path="/requests"
          element={
            <Layout socket={socket}>
              <Requests socket={socket} />
            </Layout>
          }
        />
        <Route
          path="/categories"
          element={
            <Layout socket={socket}>
              <Categories socket={socket} />
            </Layout>
          }
        />
        <Route
          path="/sub-categories"
          element={
            <Layout socket={socket}>
              <SubCategories socket={socket} />
            </Layout>
          }
        />
        <Route
          path="/category/create"
          element={
            <Layout socket={socket}>
              <CategoryCreator socket={socket} />
            </Layout>
          }
        />
        <Route
          path="/category/edit/:categoryId"
          element={
            <Layout socket={socket}>
              <CategoryEditor socket={socket} />
            </Layout>
          }
        />
        <Route
          path="/sub-category/create"
          element={
            <Layout socket={socket}>
              <SubCategoryCreator socket={socket} />
            </Layout>
          }
        />
        <Route
          path="/sub-category/edit/:subCategoryId"
          element={
            <Layout socket={socket}>
              <SubCategoryEditor socket={socket} />
            </Layout>
          }
        />
        <Route
          path="/settings"
          element={
            <Layout socket={socket}>
              <Settings socket={socket} />
            </Layout>
          }
        />
        <Route
          path="/messages"
          element={
            <Layout socket={socket}>
              <Messages socket={socket} />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Main />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
