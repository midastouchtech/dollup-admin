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

const SmallImage = styled.img`
  width: 40px;
  max-height: 40px;
`;
const Categories = ({ socket }) => {
  const [categories, setCategories] = useState(null);
  const [originalCategories, setOriginalCategories] = useState(null);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const getPageCategories = (p) => {
    socket.emit("GET_NEXT_PAGE_CATEGORIES", { page: p, pageLimit: 25 });
    socket.on("RECEIVE_NEXT_PAGE_CATEGORIES", (data) => {
      console.log("received", data);
      setCategories(data.categories);
      setOriginalCategories(data.categories);
      setPage(p);
    });
  };

  useEffect(() => {
    console.log("use effect socket", socket);
    if (socket && !categories) {
      getPageCategories(0);
    }
  }, [socket]);

  const handleSearch = async (term) => {
    setLoading(true);
    setNotFound(false);
    socket.emit("SEARCH_SERVICE", { term: searchTerm });
    socket.on("RECEIVE_SEARCHED_SERVICE", (data) => {
      setCategories(data);
      setLoading(false);
    });
    socket.on("RECEIVE_SEARCHED_SERVICE_NOT_FOUND", (data) => {
      setCategories([]);
      setNotFound(true);
      setLoading(false);
    });
  };

  const clearSearch = () => {
    setCategories(originalCategories);
    setSearchTerm("");
    setNotFound(false);
  };

  return (
    <div className="container-fluid">
      <div className="d-flex flex-wrap mb-2 align-items-center justify-content-between">
        <div className="mb-3 mr-3">
          <h6 className="fs-16 text-black font-w600 mb-0">Categories</h6>
          <span className="fs-14">All active categories listed here </span>
          <br />
          <br />
          <Link
            to={`/category/create`}
            className="btn btn-xs btn-primary text-nowrap"
          >
            <i
              className="fa fa-info
                                            scale5 mr-3"
              aria-hidden="true"
            ></i>
            Create Category
          </Link>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-10">
          <input
            type="text"
            className="form-control input-default"
            placeholder="Enter category name"
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
              <span className="sr-only">Searching for category</span>
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
                {!isNil(categories) && !isEmpty(categories) && (
                  <table
                    id="example2"
                    className="table table-bordered"
                  >
                    <thead class="thead-dark">
                      <tr>
                        <th>Id</th>
                        <th>Name</th>
                        <th>Sub Categories</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories?.map((category, index) => (
                        <tr key={index} className="">
                          <td>{category?.id}</td>
                          <td>{category?.name}</td>
                          <td>
                            {/* Sub Categories table */}
                            <table className="table table-bordered">
                              <tbody>
                                {category?.subCategories?.map(
                                  (subCategory, index) => (
                                    <tr key={index}>
                                      <td>{subCategory?.name}</td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </td>
                          <td>
                            <Link
                              to={`/category/edit/${category.id}`}
                              className="btn btn-xs btn-primary text-nowrap"
                            >
                              <i
                                className="fa fa-info
                                            scale5 mr-3"
                                aria-hidden="true"
                              ></i>
                              Edit
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {(isNil(categories) || isEmpty(categories)) && (
                  <NoAppointments>
                    <div className="d-flex">
                      <h1>No Categories</h1>
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
              onClick={() => getPageCategories(page === 0 ? 0 : page - 1)}
            >
              Prev Page
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`nav-link`}
              onClick={() => getPageCategories(page + 1)}
            >
              Next Page
            </a>
          </li>
          {repeat("i", page).map((i, index) => (
            <li className="nav-item">
              <a
                className={`nav-link`}
                onClick={() => getPageCategories(index)}
              >
                Page {index + 1}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Categories;
