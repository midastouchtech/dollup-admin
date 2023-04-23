import { isNil, isEmpty, repeat } from "ramda";
import React, { useState } from "react";
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

const Appointments = ({ socket }) => {
  const [appointments, setAppointments] = useState(null);
  const [originalAppointments, setOriginalAppointments] = useState(null);
  const [monthType, setMonthType] = useState("any");
  const [type, setStatusType] = useState("all");
  const [page, setPage] = useState(0);
  const [currentMonthPageCount, setCurrentMonthPageCount] = useState(0);
  const [nextMonthPageCount, setNextMonthPageCount] = useState(0);
  const [prevMonthPageCount, setPrevMonthPageCount] = useState(0);

  const getAllAppointments = () => {
    socket.emit("GET_ALL_APPOINTMENTS");
    socket.on("RECEIVE_ALL_APPOINTMENTS", (data) => {
      setAppointments(data);
      setOriginalAppointments(data);
    });
  };

  if (socket && !appointments) {
    getAllAppointments();
  }

  const setAppointmentsType = (type) => {
    if (type === "all") {
      setAppointments(originalAppointments);
    } else {
      const newAppointments = originalAppointments.filter(
        (appointment) => appointment.status === type
      );
      setAppointments(newAppointments);
      setStatusType(type);
    }
  };

  const getCurrentMonthsAppointments = (page) => {
    socket.emit("GET_CURRENT_MONTHS_APPOINTMENTS", {
      page
    });
    socket.on("RECEIVE_CURRENT_MONTHS_APPOINTMENTS", (data) => {
      setAppointments(data);
      setOriginalAppointments(data);
      setMonthType("current");
      setPage(page); 
    });
  };

  const getNextMonthsAppointments = (p) => {
    socket.emit("GET_NEXT_MONTHS_APPOINTMENTS", {
      page: p,
    });
    socket.on("RECEIVE_NEXT_MONTHS_APPOINTMENTS", (data) => {
      setAppointments(data);
      setOriginalAppointments(data);
      setMonthType("next");
      setPage(p) 
    });
  };
  
  const getPrevMonthsAppointments = (p) => {
    socket.emit("GET_PREVIOUS_MONTHS_APPOINTMENTS", {
      page: p,
    });
    socket.on("RECEIVE_PREVIOUS_MONTHS_APPOINTMENTS", (data) => {
      setAppointments(data);
      setOriginalAppointments(data);
      setMonthType("prev");
      setPage(p)     
    });
  };

  const functionsByMonth = {
    any: getAllAppointments,
    current: getCurrentMonthsAppointments,
    next: getNextMonthsAppointments,
    prev: getPrevMonthsAppointments,
  };


  const getAppointmentsByMonth = (e) => {
    console.log("getting first set appointments for monthtype", e.target.value);
    const month = e.target.value;
    if (monthType !== month) {
      functionsByMonth[month](0);
      setMonthType(month);
    }
  };

  const getPageAppointments = (p) => {
    if (monthType === "any") {
      socket.emit("GET_NEXT_PAGE_APPOINTMENTS", { page: p});
      socket.on("RECEIVE_NEXT_PAGE_APPOINTMENTS", (data) => {
        setAppointments(data);
        setOriginalAppointments(data);
        setPage(p);
      });
    } else {
      console.log("getting next page appointments for", monthType, "month");
      functionsByMonth[monthType](p);
    }
  };


  console.log("prevMonthPageCount", prevMonthPageCount)
  console.log("currentMonthPageCount", currentMonthPageCount)
  console.log("nextMonthPageCount", nextMonthPageCount)
  return (
    <div className="container-fluid">
      <div className="d-flex flex-wrap mb-2 align-items-center justify-content-between">
        <div className="mb-3 mr-3">
          <h6 className="fs-16 text-black font-w600 mb-0">
            Appointment Requests
          </h6>
          <span className="fs-14">All active appointments listed here </span>
        </div>
        <div className="event-tabs mb-3 mr-3">
          <ul className="nav nav-tabs" role="tablist">
            <li className="nav-item">
              <a
                className={`nav-link ${type === "all" ? "active" : ""}`}
                onClick={() => setAppointmentsType("all")}
              >
                All
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link ${type === "approved" ? "active" : ""}`}
                onClick={() => setAppointmentsType("approved")}
              >
                Approved
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link ${type === "pending" ? "active" : ""}`}
                onClick={() => setAppointmentsType("pending")}
              >
                Pending
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link ${type === "declined" ? "active" : ""}`}
                onClick={() => setAppointmentsType("declined")}
              >
                Declined
              </a>
            </li>
          </ul>
        </div>
        <div className="d-flex mb-3">
          <select
            className="form-control style-2 default-select mr-3"
            onClick={getAppointmentsByMonth}
          >
            <option value="any" selected={monthType === "any"}>
              All
            </option>
            <option value="current" selected={monthType === "current"}>
              Current month
            </option>
            <option value="next" selected={monthType === "next"}>
              Next month
            </option>
            <option value="prev" selected={monthType === "prev"}>
              Prev Month
            </option>
          </select>
          <a href="#" className="btn btn-primary text-nowrap">
            <i className="fa fa-file-text scale5 mr-3" aria-hidden="true"></i>
            Generate Report
          </a>
        </div>
      </div>
      <div className="row">
        <div className="col-xl-12">
          <div className="tab-content">
            <div id="All" className="tab-pane active fade show">
              <div className="table-responsive">
                {!isNil(appointments) && !isEmpty(appointments) && (
                  <table
                    id="example2"
                    className="table card-table display dataTablesCard"
                  >
                    <thead class="thead-dark">
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>PON</th>
                        <th>Company </th>
                        <th>Location</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Info</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments?.map((appointment, index) => (
                        <tr key={index}>
                          <td>{appointment.id}</td>
                          <td>{appointment.usersWhoCanManage[0].name}</td>
                          <td>{appointment.details.purchaseOrderNumber}</td>
                          <td>{appointment.details.company.name}</td>
                          <td>{appointment.details.clinic}</td>
                          <td>{appointment.details.date}</td>
                          <td>
                            <span
                              className={`badge ${getBadgeclassName(
                                appointment.status
                              )}`}
                            >
                              {appointment.status}
                            </span>
                          </td>
                          <td>
                            <Link to={`/appointment/${appointment.id}`}  className="btn btn-primary text-nowrap">
                              <i
                                className="fa fa-info
                                            scale5 mr-3"
                                aria-hidden="true"
                              ></i>
                              Info
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {(isNil(appointments) || isEmpty(appointments)) && (
                  <NoAppointments>
                    <div className="d-flex">
                      <h1>No appointments</h1>
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
              className={`nav-link ${type === "approved" ? "active" : ""}`}
              onClick={() => getPageAppointments(page === 0 ? 0 : page-1)}
            >
              Prev Page
            </a>
          </li> 
          <li className="nav-item">
            <a
              className={`nav-link ${type === "pending" ? "active" : ""}`}
              onClick={() => getPageAppointments(page+1)}
            >
              Next Page
            </a>
          </li>
          {repeat('i', page).map((i, index) => (
            <li className="nav-item">
              <a
                className={`nav-link ${type === "pending" ? "active" : ""}`}
                onClick={() => getPageAppointments(index)}
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

export default Appointments;
