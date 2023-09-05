import { isNil, isEmpty, repeat, insert } from "ramda";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import moment from "moment";
import { useParams } from "react-router-dom";
/* eslint-disable */

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

const NoBookings = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 500px;
  width: 100%;
`;

const StyledUL = styled.ul`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  overflow-x: scroll;
  align-items: center;
  width: auto;
  height: 80px;
  li {
    flex-shrink: 0;
    a {
      padding: 0.325rem 0.7rem !important;
    }
  }
`;

const Bookings = ({ socket }) => {
  const [bookings, setBookings] = useState(null);
  const [originalBookings, setOriginalBookings] = useState(null);
  const [monthType, setMonthType] = useState("any");
  const [type, setStatusType] = useState("all");
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [pageLimit, setPageLimit] = useState("25");
  const [hasRequested, setHasRequested] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [appCount, setAppCount] = useState(0);
  let params = useParams();

  const handleSearch = async (term) => {
    setLoading(true);
    setNotFound(false);
    socket.emit("SEARCH_BOOKING", { term });
    socket.on("RECEIVE_SEARCHED_BOOKING", (data) => {
      setBookings(data);
      setLoading(false);
    });
    socket.on("RECEIVE_SEARCHED_BOOKING_NOT_FOUND", (data) => {
      setBookings(originalBookings);
      setNotFound(true);
      setLoading(false);
    });
  };

  const clearSearch = () => {
    setBookings(originalBookings);
    setSearchTerm("");
    setNotFound(false);
  };

  const handleFilter = () => {
    socket.emit("GET_BOOKINGS_BY_DATE", { date: fromDate });
    socket.on("RECEIVE_BOOKINGS_BY_DATE", (newBookings) => {
      setBookings(newBookings);
    });
  };

  const getAllBookings = () => {
    socket.emit("GET_NEXT_PAGE_BOOKINGS", { page: 0, pageLimit });
    socket.on("RECEIVE_NEXT_PAGE_BOOKINGS", (data) => {
      console.log("receive all bookings", data);
      const { bookings, pages, count } = data;
      setBookings(bookings);
      setPageCount(Math.round(count / pageLimit));
      setAppCount(count);
      setOriginalBookings(bookings);
    });
  };

  useEffect(() => {
    console.log("use effect socket", socket);
    console.log("params", params);
    if (socket && !bookings && hasRequested === false) {
      setHasRequested(true);
      const {name} = params;
    
        if(name){
            handleSearch(name);
            setSearchTerm(name)
        }

    }
  }, [socket]);

  const setBookingsType = (type) => {
    if (type === "all") {
      setBookings(originalBookings);
    } else {
      const newBookings = originalBookings.filter(
        (booking) => booking.status === type
      );
      setBookings(newBookings);
      setStatusType(type);
    }
  };

  const getCurrentMonthsBookings = (page) => {
    socket.emit("GET_CURRENT_MONTHS_BOOKINGS", {
      page,
      pageLimit,
    });
    socket.on("RECEIVE_CURRENT_MONTHS_BOOKINGS", (data) => {
      const { bookings, pages, count } = data;
      setBookings(bookings);
      setPageCount(Math.round(count / pageLimit));
      setAppCount(count);
      setOriginalBookings(bookings);
      setMonthType("current");
      setPage(page);
    });
  };

  const getNextMonthsBookings = (p) => {
    socket.emit("GET_NEXT_MONTHS_BOOKINGS", { page: p, pageLimit });
    socket.on("RECEIVE_NEXT_MONTHS_BOOKINGS", (data) => {
      const { bookings, pages, count } = data;
      setBookings(bookings);
      setPageCount(Math.round(count / pageLimit));
      setAppCount(count);
      setOriginalBookings(bookings);
      setMonthType("next");
      setPage(p);
    });
  };

  const getPrevMonthsBookings = (p) => {
    socket.emit("GET_PREVIOUS_MONTHS_BOOKINGS", { page: p, pageLimit });
    socket.on("RECEIVE_PREVIOUS_MONTHS_BOOKINGS", (data) => {
      const { bookings, pages, count } = data;
      setBookings(bookings);
      setPageCount(Math.round(count / pageLimit));
      setAppCount(count);
      setOriginalBookings(bookings);
      setMonthType("prev");
      setPage(p);
    });
  };

  const functionsByMonth = {
    any: getAllBookings,
    current: getCurrentMonthsBookings,
    next: getNextMonthsBookings,
    prev: getPrevMonthsBookings,
  };

  const getBookingsByMonth = (e) => {
    console.log("getting first set bookings for monthtype", e.target.value);
    const month = e.target.value;
    if (monthType !== month) {
      functionsByMonth[month](0);
      setMonthType(month);
    }
  };

  const getPageBookings = (p) => {
    if (monthType === "any") {
      socket.emit("GET_NEXT_PAGE_BOOKINGS", { page: p, pageLimit });
      socket.on("RECEIVE_NEXT_PAGE_BOOKINGS", (data) => {
        const { bookings, pages, count } = data;
        setBookings(bookings);
        setPageCount(Math.round(count / pageLimit));
        setAppCount(count);
        setOriginalBookings(data);
        setPage(p);
      });
    } else {
      //console.log("getting next page bookings for", monthType, "month");
      functionsByMonth[monthType](p);
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex flex-wrap mb-2 align-items-center justify-content-between">
        <div className="mb-3 mr-3">
          <h1 className="fs-16 text-black font-w600 mb-0">
            Showing bookings by "{searchTerm}"
          </h1>
          <span className="fs-14">Found {bookings?.length} bookings. </span>
          <div className="row"></div>
        </div>
      </div>

      <br />
      <div className="row">
        <div className="col-xl-12">
          <div className="tab-content">
            <div id="All" className="tab-pane active fade show">
              <div className="table-responsive">
                {!isNil(bookings) && !isEmpty(bookings) && (
                  <table
                    id="example2"
                    className="table card-table display dataTablesCard"
                  >
                    <thead class="thead-dark">
                      <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Vendor</th>
                        <th>Customer </th>
                        <th>Service</th>
                        <th>Stylist</th>
                        <th>Completed</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings?.map((booking, index) => (
                        <tr key={index}>
                          <td>
                            {moment(booking.dateTime)
                              .utc()
                              .format("DD MMM YYYY")}
                          </td>
                          <td>
                            {moment(booking.dateTime).utc().format("HH:mm")}
                          </td>
                          <td>
                            <a
                              href={`/bookings-by/${booking?.vendor?.storeName}`}
                            >
                              {booking?.vendor?.storeName}
                            </a>
                          </td>
                          <td>
                            <a href={`/bookings-by/${booking?.customer?.name}`}>
                              {booking?.customer?.name}
                            </a>
                          </td>
                          <td>
                            <a href={`/bookings-by/${booking?.service?.name}`}>
                              {booking?.service?.name}
                            </a>
                          </td>
                          <td>
                            <a href={`/bookings-by/${booking?.stylist?.name}`}>
                              {booking?.stylist?.name}
                            </a>
                          </td>
                          <td>{booking?.isComplete ? "Yes" : "No"}</td>
                          <td>
                            <Link
                              to={`/booking/${booking.id}`}
                              className="btn btn-xs btn-light  text-nowrap"
                            >
                              Open
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {(isNil(bookings) || isEmpty(bookings)) && (
                  <NoBookings>
                    <div className="d-flex">
                      <h1>No bookings</h1>
                    </div>
                  </NoBookings>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="event-tabs mb-3 mr-3">
        <StyledUL className="nav nav-tabs" role="tablist">
          <li className="nav-item">
            <a
              className={`nav-link ${type === "approved" ? "active" : ""}`}
              onClick={() => getPageBookings(page === 0 ? 0 : page - 1)}
            >
              Prev Page
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`nav-link ${type === "pending" ? "active" : ""}`}
              onClick={() => getPageBookings(page + 1)}
            >
              Next Page
            </a>
          </li>
          {repeat("i", pageCount).map((i, index) => (
            <li className="nav-item">
              <a
                className={`nav-link ${page === index ? "active" : ""}`}
                onClick={() => getPageBookings(index)}
              >
                Page {index + 1}
              </a>
            </li>
          ))}
        </StyledUL>
      </div>
    </div>
  );
};

export default Bookings;
