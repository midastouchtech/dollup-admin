import { isNil, isEmpty, repeat } from "ramda";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const getBadgeclassName = (status) => {
  switch (status) {
    case "pending":
      return "badge badge-warning";
    case "approved":
      return "badge badge-success";
    case "declined":
      return "badge badge-danger";
    default:
      return "badge badge-primary";
  }
};

const NoAppointments = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 500px;
  width: 100%;
`;

const Customers = ({ socket }) => {
  const [customers, setCustomers] = useState(null);
  const [originalCustomers, setOriginalCustomers] = useState(null);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const getPageCustomers = (p) => {
    socket.emit("GET_NEXT_PAGE_CUSTOMERS", { page: p, pageLimit: 25 });
    socket.on("RECEIVE_NEXT_PAGE_CUSTOMERS", (data) => {
      console.log("received", data);
      setCustomers(data.customers);
      setOriginalCustomers(data.customers);
      setPage(p);
    });
  };

  useEffect(() => {
    console.log("use effect socket", socket);
    if (socket && !customers) {
      getPageCustomers(0);
    }
  }, [socket]);

  const handleSearch = async (term) => {
    setLoading(true);
    setNotFound(false);
    socket.emit("SEARCH_CUSTOMER", { term: searchTerm });
    socket.on("RECEIVE_SEARCHED_CUSTOMER", (data) => {
      setCustomers(data);
      setLoading(false);
    });
    socket.on("RECEIVE_SEARCHED_CUSTOMER_NOT_FOUND", (data) => {
      setCustomers([]);
      setNotFound(true);
      setLoading(false);
    });
  };

  const clearSearch = () => {
    setCustomers(originalCustomers);
    setSearchTerm("");
    setNotFound(false);
  };

  return (
    <div className="container-fluid">
      <div className="d-flex flex-wrap mb-2 align-items-center justify-content-between">
        <div className="mb-3 mr-3">
          <h6 className="fs-16 text-black font-w600 mb-0">Customers</h6>
          <span className="fs-14">All active customers listed here </span>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-10">
          <input
            type="text"
            className="form-control input-default"
            placeholder="Enter customer name"
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
        </div>
        <div className="col-1">
          <button type="button" class="btn btn-primary" onClick={handleSearch}>
            Search
          </button>
        </div>
        <div className="col-1">
          <button type="button" class="btn btn-primary" onClick={clearSearch}>
            Clear
          </button>
        </div>
      </div>
      <div className="row">
        <div className="col-12 d-flex justify-content-center">
          {loading && (
            <div className="spinner-border" role="status">
              <span className="sr-only">Searching for customer</span>
            </div>
          )}
        </div>
        {notFound && (
          <div className="alert alert-danger" role="alert">
            Customer could not be found.
          </div>
        )}
      </div>
      <br />
      <div className="row">
        <div className="col-xl-12">
          <div className="tab-content">
            <div id="All" className="tab-pane active fade show">
              <div className="table-responsive">
                {!isNil(customers) && !isEmpty(customers) && (
                  <table id="example2" className="table table-bordered">
                    <thead class="thead-dark">
                      <tr>
                        <th>Name</th>
                        <th>Cell</th>
                        <th>Email</th>
                        <th>Address </th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers?.map((customer, index) => (
                        <tr key={index}>
                          <td>{customer?.name}</td>
                          <td>{customer?.phoneNumber}</td>
                          <td>{customer?.email}</td>
                          <td>{customer?.address?.address}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {(isNil(customers) || isEmpty(customers)) && (
                  <NoAppointments>
                    <div className="d-flex">
                      <h1>No Customers</h1>
                    </div>
                  </NoAppointments>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="event-tabs mb-3 mr-3">
        <ul className="nav nav-tabs" role="tablist">
          <li className="nav-item">
            <a
              className={`nav-link`}
              onClick={() => getPageCustomers(page === 0 ? 0 : page - 1)}
            >
              Prev Page
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`nav-link`}
              onClick={() => getPageCustomers(page + 1)}
            >
              Next Page
            </a>
          </li>
          {repeat("i", page).map((i, index) => (
            <li className="nav-item">
              <a className={`nav-link`} onClick={() => getPageCustomers(index)}>
                Page {index + 1}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Customers;
