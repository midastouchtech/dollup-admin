import { isNil, isEmpty, repeat } from "ramda";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
const SubCategories = ({ socket }) => {
  
  const [subCategories, setSubCategories] = useState(null);
  const [originalSubCategories, setOriginalSubCategories] = useState(null);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const getPageSubCategories = (p) => {
      socket.emit("GET_NEXT_PAGE_SUB_CATEGORIES", { page: p, pageLimit:25});
      socket.on("RECEIVE_NEXT_PAGE_SUB_CATEGORIES", (data) => {
        console.log("received", data)
        setSubCategories(data.subCategories);
        setOriginalSubCategories(data.subCategories);
        setPage(p);
      });
  };
  
  useEffect(()=>{
    console.log("use effect socket", socket)
    if (socket && !subCategories) {
      getPageSubCategories(0);
    }
  
  }, [socket]);
  

  const handleSearch = async (term) => {
    setLoading(true);
    setNotFound(false);
    socket.emit("SEARCH_SUB_CATEGORY", {term: searchTerm});
    socket.on("RECEIVE_SEARCHED_SUB_CATEGORY", (data) => {
      setSubCategories(data);
      setLoading(false);
    });
    socket.on("RECEIVE_SEARCHED_SUB_CATEGORY_NOT_FOUND", (data) => {
      setSubCategories([]);
      setNotFound(true);
      setLoading(false);
    });
  };

  const clearSearch = () => {
    setSubCategories(originalSubCategories);
    setSearchTerm("");
    setNotFound(false);
  }

  return (
    <div className="container-fluid">
      <div className="d-flex flex-wrap mb-2 align-items-center justify-content-between">
        <div className="mb-3 mr-3">
          <h6 className="fs-16 text-black font-w600 mb-0">
            SubCategories
          </h6>
          <span className="fs-14">All active subCategories listed here </span>
          <br/>
          <br/>
          <Link
            to={`/sub-category/create`}
            className="btn btn-xs btn-primary text-nowrap"
          >
            <i
              className="fa fa-info
                                            scale5 mr-3"
              aria-hidden="true"
            ></i>
            Create Sub Category
          </Link>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-10">
          <input
            type="text"
            className="form-control input-default"
            placeholder="Enter subCategory name"
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
            <span className="sr-only">Searching for sub category</span>
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
                {!isNil(subCategories) && !isEmpty(subCategories) && (
                  <table
                    id="example2"
                    className="table table-bordered"
                  >
                    <thead class="thead-dark">
                      <tr>
                        <th>Id</th>
                        <th>Thumbnail</th>
                        <th>Name</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subCategories?.map((subCategory, index) => (
                        <tr key={index}>
                          <td>{subCategory?.id}</td>
                          <td><SmallImage src={subCategory?.thumbnail} /></td>
                          <td>{subCategory?.name}</td>
                          <td>
                            <Link to={`/sub-category/edit/${subCategory.id}`}  className="btn btn-xs btn-primary text-nowrap">
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
                {(isNil(subCategories) || isEmpty(subCategories)) && (
                  <NoAppointments>
                    <div className="d-flex">
                      <h1>No SubCategories</h1>
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
              onClick={() => getPageSubCategories(page === 0 ? 0 : page-1)}
            >
              Prev Page
            </a>
          </li> 
          <li className="nav-item">
            <a
              className={`nav-link`}
              onClick={() => getPageSubCategories(page+1)}
            >
              Next Page
            </a>
          </li>
          {repeat('i', page).map((i, index) => (
            <li className="nav-item">
              <a
                className={`nav-link`}
                onClick={() => getPageSubCategories(index)}
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

export default SubCategories;
