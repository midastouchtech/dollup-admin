import { isNil, isEmpty, repeat } from "ramda";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";

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

const SmallImage = styled.img`
  width: 40px;
  max-height: 40px;
`;
const Requests = ({ socket }) => {
  const [requests, setRequests] = useState(null);
  const [originalRequests, setOriginalRequests] = useState(null);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const getPageRequests = (p) => {
    socket.emit("GET_NEXT_PAGE_REQUESTS", { page: p, pageLimit: 25 });
    socket.on("RECEIVE_NEXT_PAGE_REQUESTS", (data) => {
      console.log("received", data);
      setRequests(data.requests);
      setOriginalRequests(data.requests);
      setPage(p);
    });
  };

  useEffect(() => {
    console.log("use effect socket", socket);
    if (socket && !requests) {
      getPageRequests(0);
    }
  }, [socket]);

  const handleSearch = async (term) => {
    setLoading(true);
    setNotFound(false);
    socket.emit("SEARCH_SERVICE", { term: searchTerm });
    socket.on("RECEIVE_SEARCHED_SERVICE", (data) => {
      setRequests(data);
      setLoading(false);
    });
    socket.on("RECEIVE_SEARCHED_SERVICE_NOT_FOUND", (data) => {
      setRequests([]);
      setNotFound(true);
      setLoading(false);
    });
  };

  const clearSearch = () => {
    setRequests(originalRequests);
    setSearchTerm("");
    setNotFound(false);
  };

  return (
    <div className="container-fluid">
      <div className="d-flex flex-wrap mb-2 align-items-center justify-content-between">
        <div className="mb-3 mr-3">
          <h6 className="fs-16 text-black font-w600 mb-0">Requests</h6>
          <span className="fs-14">All active requests listed here </span>
          <br />
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-10">
          <input
            type="text"
            className="form-control input-default"
            placeholder="Enter request name"
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
              <span className="sr-only">Searching for request</span>
            </div>
          )}
        </div>
        {notFound && (
          <div className="alert alert-danger" role="alert">
            Category could not be found.
          </div>
        )}
      </div>
      <br />
      <div className="row">
        <div className="col-xl-12">
          <div className="tab-content">
            <div id="All" className="tab-pane active fade show">
              <div className="table-responsive">
                {!isNil(requests) && !isEmpty(requests) && (
                  <table id="example2" className="table table-bordered">
                    <thead class="thead-dark">
                      <tr>
                        <th>Thumbnail</th>
                        <th colspan="2">Type</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests?.map((request, index) => (
                        <tr key={index} className="">
                          <td>
                            <SmallImage src={request?.thumbnail} />
                          </td>
                          <td colspan="2">
                            {request.type === "main" ? (
                             <Button variant="dark">Main Category</Button>
                            ) : (
                              <ButtonGroup aria-label="Basic example">
                                <Button variant="secondary">Sub category</Button>
                                <Button variant="dark">{request.category.name}</Button>
                              </ButtonGroup>
                            )}
                          </td>
                          <td>{request?.name}</td>
                          <td style={{ width: "400px" }}>
                            <small>{request?.description}</small>
                          </td>
                          <td>
                            <Link
                              to={
                                request.type === "main"
                                  ? `/category/create/?name=${request.name}&thumbnail=${request.thumbnail}`
                                  : `/sub-category/create/?name=${request.name}&thumbnail=${request.thumbnail}&category=${request.category.id}`
                              }
                              className="btn btn-block btn-xs btn-primary text-nowrap mr-2"
                            >
                              <i
                                className="fa fa-info
                                            scale5 mr-3"
                                aria-hidden="true"
                              ></i>
                              Create
                            </Link>
                            <Link
                              to={`/request/edit/${request.id}`}
                              className="btn btn-block  btn-xs btn-dark text-nowrap"
                            >
                              <i
                                className="fa fa-info
                                            scale5 mr-3"
                                aria-hidden="true"
                              ></i>
                              Decline
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {(isNil(requests) || isEmpty(requests)) && (
                  <NoAppointments>
                    <div className="d-flex">
                      <h1>No Requests</h1>
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
              onClick={() => getPageRequests(page === 0 ? 0 : page - 1)}
            >
              Prev Page
            </a>
          </li>
          <li className="nav-item">
            <a className={`nav-link`} onClick={() => getPageRequests(page + 1)}>
              Next Page
            </a>
          </li>
          {repeat("i", page).map((i, index) => (
            <li className="nav-item">
              <a className={`nav-link`} onClick={() => getPageRequests(index)}>
                Page {index + 1}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Requests;
