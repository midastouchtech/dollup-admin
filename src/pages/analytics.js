import { isNil, isEmpty, repeat, insert, keys, values } from "ramda";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import moment from "moment";
import { useParams } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

/* eslint-disable */


const exists = i =>!isEmpty(i) && !isNil(i);
const Analytics = ({ socket }) => {
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    if (socket && isLoading && hasRequested === false) {
      setHasRequested(true);
      socket.emit("GET_ALL_BOOKINGS");
      socket.emit("GET_ALL_CUSTOMERS");
      socket.emit("GET_ALL_VENDORS");
      socket.on("RECEIVE_ALL_BOOKINGS", (v) => {
        console.log("bookings", v);
        setBookings(v.bookings);
      });

      socket.on("RECEIVE_ALL_CUSTOMERS", (v) => {
        console.log("customers", v);
        setCustomers(v);
      });

      socket.on("RECEIVE_ALL_VENDORS", (v) => {
        console.log("vendors", v);
        setVendors(v);
      });
    }
  }, [socket]);

  const sales = bookings
    .map((b) => ({
      date: moment(b.dateTime).format("DD MMM YYYY"),
      price: b.service.salePrice,
      vendor: b.vendor.storeName,
    }))
    .reduce((prev, curr) => {
      if (prev[curr.date]) {
        prev[curr.date] += parseInt(curr.price);
      } else {
        prev[curr.date] = parseInt(curr.price);
      }
      return prev;
    }, {});

  const salesByVendor = bookings
    .map((b) => ({
      date: moment(b.dateTime).format("DD MMM YYYY"),
      price: b.service.salePrice,
      vendor: b.vendor.storeName,
    }))
    .reduce((prev, curr) => {
      if (prev[curr.vendor]) {
        prev[curr.vendor] += parseInt(curr.price);
      } else {
        prev[curr.vendor] = parseInt(curr.price);
      }
      return prev;
    }, {});

  const salesByCustomer = bookings
    .map((b) => ({
      date: moment(b.dateTime).format("DD MMM YYYY"),
      price: b.service.salePrice,
      customer: b.customer.name,
    }))
    .reduce((prev, curr) => {
      if (prev[curr.customer]) {
        prev[curr.customer] += parseInt(curr.price);
      } else {
        prev[curr.customer] = parseInt(curr.price);
      }
      return prev;
    }, {});

  const servicesBooked = bookings
    .map((b) => ({
      date: moment(b.dateTime).format("DD MMM YYYY"),
      service: b.service.name,
    }))
    .reduce((prev, curr) => {
      if (prev[curr.service]) {
        prev[curr.service] += 1;
      } else {
        prev[curr.service] = 1;
      }
      return prev;
    }, {});

  console.log("sales", sales);
  console.log("salesByVendor", salesByVendor);
  console.log("salesByCustomer", salesByCustomer);

  return (
    <div className="container-fluid">
      <div className="row">
        <main role="main" className="col-md-12 ml-sm-auto col-lg-12 px-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3">
            <h1 className="h2">Analytics</h1>
          </div>
          <div className="row">
            <div className="col-md-3">
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title">Total Bookings</h5>
                  <h6 className="card-subtitle mb-2 text-muted">
                    Total Bookings
                  </h6>
                  <p className="card-text">{bookings.length}</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title">Total Revenue</h5>
                  <h6 className="card-subtitle mb-2 text-muted">
                    Total Revenue
                  </h6>
                  <p className="card-text">
                    R{" "}
                    {bookings.reduce(
                      (prev, curr) => prev + parseInt(curr.service.salePrice),
                      0
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title">Total Customers</h5>
                  <h6 className="card-subtitle mb-2 text-muted">
                    Total Customers
                  </h6>
                  <p className="card-text">{customers.length}</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title">Total Vendors</h5>
                  <h6 className="card-subtitle mb-2 text-muted">
                    Total Vendors
                  </h6>
                  <p className="card-text">{vendors.length}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 h-100">
              <div className="card">
                <div className="card-body">
                  {exists(sales) && (
                    <Line
                      datasetIdKey="id"
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: "top",
                          },
                          title: {
                            display: true,
                            text: "Sales",
                          },
                        },
                      }}
                      data={{
                        labels: keys(sales),
                        datasets: [
                          {
                            id: 1,
                            label: "",
                            data: values(sales),
                            backgroundColor: "rgba(255, 99, 132, 0.2)",
                            borderColor: "rgba(255, 99, 132, 1)",
                            borderWidth: 1,
                          },
                        ],
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-6 h-100">
              <div className="card">
                <div className="card-body">
                  {exists(salesByVendor) && (
                    <Bar
                      datasetIdKey="id"
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: "top",
                          },
                          title: {
                            display: true,
                            text: "Sales By Vendor",
                          },
                        },
                      }}
                      data={{
                        labels: keys(salesByVendor),
                        datasets: [
                          {
                            id: 1,
                            label: "",
                            data: values(salesByVendor),
                            backgroundColor: "rgba(255, 99, 132, 0.2)",
                            borderColor: "rgba(255, 99, 132, 1)",
                            borderWidth: 1,
                          },
                        ],
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-6 h-100">
              <div className="card">
                <div className="card-body">
                  {exists(salesByCustomer) && (
                    <Bar
                      datasetIdKey="id"
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: "top",
                          },
                          title: {
                            display: true,
                            text: "Sales By Customer",
                          },
                        },
                      }}
                      data={{
                        labels: keys(salesByCustomer),
                        datasets: [
                          {
                            id: 1,
                            label: "",
                            data: values(salesByCustomer),
                            backgroundColor: "rgba(255, 99, 132, 0.2)",
                            borderColor: "rgba(255, 99, 132, 1)",
                            borderWidth: 1,
                          },
                        ],
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-6 h-100">
              <div className="card">
                <div className="card-body">
                  {exists(servicesBooked) && (
                    <Bar
                      datasetIdKey="id"
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: "top",
                          },
                          title: {
                            display: true,
                            text: "Top Services Booked",
                          },
                        },
                      }}
                      data={{
                        labels: keys(servicesBooked),
                        datasets: [
                          {
                            id: 1,
                            label: "",
                            data: values(servicesBooked),
                            backgroundColor: "rgba(255, 99, 132, 0.2)",
                            borderColor: "rgba(255, 99, 132, 1)",
                            borderWidth: 1,
                          },
                        ],
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
