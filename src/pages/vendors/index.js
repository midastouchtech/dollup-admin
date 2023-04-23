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

const Vendors = ({ socket }) => {
  const [vendors, setVendors] = useState(null);
  const [originalVendors, setOriginalVendors] = useState(null);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const getPageVendors = (p) => {
      socket.emit("GET_NEXT_PAGE_VENDORS", { page: p, pageLimit:25});
      socket.on("RECEIVE_NEXT_PAGE_VENDORS", (data) => {
        console.log("received", data)
        setVendors(data.vendors);
        setOriginalVendors(data.vendors);
        setPage(p);
      });
  };
  
  useEffect(()=>{
    console.log("use effect socket", socket)
    if (socket && !vendors) {
      getPageVendors(0);
    }
  
  }, [socket]);
  

  const handleSearch = async (term) => {
    setLoading(true);
    setNotFound(false);
    socket.emit("SEARCH_VENDOR", {term: searchTerm});
    socket.on("RECEIVE_SEARCHED_VENDOR", (data) => {
      setVendors(data);
      setLoading(false);
    });
    socket.on("RECEIVE_SEARCHED_VENDOR_NOT_FOUND", (data) => {
      setVendors([]);
      setNotFound(true);
      setLoading(false);
    });
  };

  const clearSearch = () => {
    setVendors(originalVendors);
    setSearchTerm("");
    setNotFound(false);
  }

  return (
    <div className="container-fluid">
      <div className="d-flex flex-wrap mb-2 align-items-center justify-content-between">
        <div className="mb-3 mr-3">
          <h6 className="fs-16 text-black font-w600 mb-0">
            Vendors
          </h6>
          <span className="fs-14">All active vendors listed here </span>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-10">
          <input
            type="text"
            className="form-control input-default"
            placeholder="Enter vendor name"
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
        </div>
        <div className="col-1">
          <button type="button" class="btn btn-primary" onClick={handleSearch}>Search</button>
        </div>
        <div className="col-1">
          <button type="button" class="btn btn-primary" onClick={clearSearch}>Clear</button>
        </div>
      </div>
      <div className="row">
        <div className="col-12 d-flex justify-content-center">
        {loading && (
          <div className="spinner-border" role="status">
            <span className="sr-only">Searching for vendor</span>
          </div>
        )}
        </div>
        {notFound && (
          <div className="alert alert-danger" role="alert">
            Vendor could not be found.
          </div>
        )}
      </div>
      <br />
      <div className="row">
        <div className="col-xl-12">
          <div className="tab-content">
            <div id="All" className="tab-pane active fade show">
              <div className="table-responsive">
                {!isNil(vendors) && !isEmpty(vendors) && (
                  <table
                    id="example2"
                    className="table table-bordered"
                  >
                    <thead class="thead-dark">
                      <tr>
                        <th>Salon</th>
                        <th>Owner</th>
                        <th>Email</th>
                        <th>Cell</th>
                        <th>Address </th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendors?.map((vendor, index) => (
                        <tr key={index}>
                          <td>{vendor?.storeName}</td>
                          <td>{vendor?.fullName}</td>
                          <td>{vendor?.email}</td>
                          <td>{vendor?.cell}</td>
                          <td>{vendor?.address}</td>
                          <td>
                            <Link to={`/vendor/edit/${vendor.id}`}  className="btn btn-xs btn-primary text-nowrap">
                              <i
                                className="fa fa-info
                                            scale5 mr-3"
                                aria-hidden="true"
                              ></i>
                              More info
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {(isNil(vendors) || isEmpty(vendors)) && (
                  <NoAppointments>
                    <div className="d-flex">
                      <h1>No Vendors</h1>
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
              onClick={() => getPageVendors(page === 0 ? 0 : page-1)}
            >
              Prev Page
            </a>
          </li> 
          <li className="nav-item">
            <a
              className={`nav-link`}
              onClick={() => getPageVendors(page+1)}
            >
              Next Page
            </a>
          </li>
          {repeat('i', page).map((i, index) => (
            <li className="nav-item">
              <a
                className={`nav-link`}
                onClick={() => getPageVendors(index)}
              >
                Page {index+1}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Vendors;
