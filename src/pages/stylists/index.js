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

const Stylists = ({ socket }) => {
  const [stylists, setStylists] = useState(null);
  const [originalStylists, setOriginalStylists] = useState(null);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const getPageStylists = (p) => {
      socket.emit("GET_NEXT_PAGE_STYLISTS", { page: p, pageLimit:25});
      socket.on("RECEIVE_NEXT_PAGE_STYLISTS", (data) => {
        console.log("received", data)
        setStylists(data.stylists);
        setOriginalStylists(data.stylists);
        setPage(p);
      });
  };
  
  useEffect(()=>{
    console.log("use effect socket", socket)
    if (socket && !stylists) {
      getPageStylists(0);
    }
  
  }, [socket]);
  

  const handleSearch = async (term) => {
    setLoading(true);
    setNotFound(false);
    socket.emit("SEARCH_STYLIST", {term: searchTerm});
    socket.on("RECEIVE_SEARCHED_STYLIST", (data) => {
      setStylists(data);
      setLoading(false);
    });
    socket.on("RECEIVE_SEARCHED_STYLIST_NOT_FOUND", (data) => {
      setStylists([]);
      setNotFound(true);
      setLoading(false);
    });
  };

  const clearSearch = () => {
    setStylists(originalStylists);
    setSearchTerm("");
    setNotFound(false);
  }

  return (
    <div className="container-fluid">
      <div className="d-flex flex-wrap mb-2 align-items-center justify-content-between">
        <div className="mb-3 mr-3">
          <h4 className="fs-16 text-black font-w600 mb-0">
            Stylists
          </h4>
          <span className="fs-14">All active stylists listed here </span>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-10">
          <input
            type="text"
            className="form-control input-default"
            placeholder="Enter stylist name"
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
            <span className="sr-only">Searching for stylist</span>
          </div>
        )}
        </div>
        {notFound && (
          <div className="alert alert-danger" role="alert">
            Stylist could not be found.
          </div>
        )}
      </div>
      <br />
      <div className="row">
        <div className="col-xl-12">
          <div className="tab-content">
            <div id="All" className="tab-pane active fade show">
              <div className="table-responsive">
                {!isNil(stylists) && !isEmpty(stylists) && (
                  <table
                    id="example2"
                    className="table table-bordered"
                  >
                    <thead class="thead-dark">
                      <tr>
                        <th>Name</th>
                        <th>Cell</th>
                        <th>Email</th>
                        <th>Vendor </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stylists?.map((stylist, index) => (
                        <tr key={index}>
                          <td>{stylist?.name}</td>
                          <td>{stylist?.phoneNumber}</td>
                          <td>{stylist?.email}</td>
                          <td>{stylist?.vendor?.storeName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {(isNil(stylists) || isEmpty(stylists)) && (
                  <NoAppointments>
                    <div className="d-flex">
                      <h1>No Stylists</h1>
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
              onClick={() => getPageStylists(page === 0 ? 0 : page-1)}
            >
              Prev Page
            </a>
          </li> 
          <li className="nav-item">
            <a
              className={`nav-link`}
              onClick={() => getPageStylists(page+1)}
            >
              Next Page
            </a>
          </li>
          {repeat('i', page).map((i, index) => (
            <li className="nav-item">
              <a
                className={`nav-link`}
                onClick={() => getPageStylists(index)}
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

export default Stylists;
