import moment from "moment";
import {
  any,
  assoc,
  has,
  isEmpty,
  isNil,
  values,
  assocPath,
  omit,
  reject,
  without,
  insert,
  keys,
  equals,
  append,
  last,
} from "ramda";
import short from "short-uuid";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import Uploader from "../../../../components/Upload";
import { DOVER_PRICE, MEDICAL_SERVICES } from "../../../../constants";
import Services from "./services";
import Sites from "./sites";
import Comments from "./comments";
import SearchModal from "../../../../components/Modal";

const getFormattedPrice = (price) => `R${price.toFixed(2)}`;

const CardBody = styled.div`
  &.minimized {
    display: none;
  }
  &.maximized {
    display: block;
  }
`;

const Container = styled.div`
  .modal-dialog {
    max-width: 1000px;
  }
`;
function App({ socket }) {
  let params = useParams();
  const navigate = useNavigate();

  const [bodyItem, setBodyItem] = useState("details");
  const [isLoading, setIsLoading] = useState(true);
  const [appointment, setAppointment] = useState({});
  const [originalAppointment, setOriginalAppointment] = useState({});
  const [hasUpdatedAppointmnent, setHasUpdatedAppointment] = useState(false);
  const [hasCompletedUpload, setHasCompletedUpload] = useState(false);
  const [hasRequested, setHasRequested] = useState(false)

  useEffect(()=>{
    console.log("use effect socket", socket)
    if (socket && isLoading && isEmpty(appointment) && hasRequested === false) {
      console.log("getting app")
      setHasRequested(true)
      socket.emit("GET_APPOINTMENT", { id: params.appId });
      socket.on("RECEIVE_APPOINTMENT", (appointment) => {
        setIsLoading(false);
        setAppointment(appointment);
        setOriginalAppointment(appointment);
      });
    }
  
  }, [socket]);

  

  const setDetail = (key, value) => {
    console.log("setting detail", key, value);
    setAppointment(assocPath(["details", key], value, appointment));
  };

  const resetAppointmentToOriginal = () => {
    setAppointment(originalAppointment);
  };

  const setEmployeeDetail = (id, key, value) => {
    const employee = appointment?.details.employees?.find((e) => e.id === id);
    const index = appointment?.details?.employees?.indexOf(employee);
    const employeesWithoutEmployee = without(
      [employee],
      appointment?.details?.employees
    );
    const newEmployee = assoc(key, value, employee);
    const newEmployees = insert(index, newEmployee, employeesWithoutEmployee);
    setDetail("employees", newEmployees);
  };

  function saveStatus(status) {
    setAppointment(assoc("status", status, appointment));
  }

  const getActiveClass = (status) => {
    return status === appointment.status ? "btn-primary" : "btn-secondary";
  };

  const calculateBookingPrice = () => {
    const allServicesWithVienna = appointment?.details?.employees?.reduce(
      (acc, employee) => {
        return [...acc, ...employee.services];
      },
      []
    );
    const allServices = allServicesWithVienna.filter(s => s.id !== "vienna-test")
    const servicesPrice = allServices.reduce((acc, service) => {
      return acc + service.price;
    }, 0);
    const sitesPrice = appointment?.details?.employees?.reduce(
      (acc, employee) => {
        return employee?.sites && employee?.sites.length > 0
          ? acc + (employee?.sites?.length - 1) * 38.40
          : acc;
      },
      0
    );
    const accessCardPrice =  appointment?.details?.employees?.reduce(
      (acc, employee) => {
        const accessCardSites = employee.sites.filter(s => s.hasAccessCard === true)
        return accessCardSites.length > 0 ? acc + (accessCardSites.length - 1) * 51.20 : acc;
      }, 0)
      const doverPrices =  appointment?.details?.employees?.reduce(
        (acc, employee) => {
          const requiresDover = employee.dover?.required;
          return requiresDover ? acc + DOVER_PRICE : acc;
        }, 0)
        console.log("doverPrice", doverPrices);
        console.log("servicesPrice", servicesPrice);
        console.log("site price", sitesPrice);
        console.log("accessCardPrice", accessCardPrice);
        
        
        
      const bookingPrice = servicesPrice + sitesPrice + accessCardPrice + doverPrices;
      
  
    console.log("bookingPrice", bookingPrice);
    return bookingPrice;
  };

  const saveAppointment = () => {
    const price = calculateBookingPrice();
    const appointmentWithNewPrice = assocPath(
      ["payment", "amount"],
      price,
      appointment
    );
    console.log("saving appza");
    socket.emit("UPDATE_APPOINTMENT", appointmentWithNewPrice);
    socket.on("APPOINTMENT_UPDATED", () => {
      console.log("appointment updated");
      navigate("/appointment/edit/" + appointment.id);
    });
  };

  const createNewEmployee = () => {
    const newEmployee = {
      id: short.generate(),
      name: "",
      idNumber: "",
      comments: [],
      occupation: "",
      services: [],
      sites: [],
      dover: {
        required: false,
      },
    };
    console.log("new employee", newEmployee);
    const newEmployees = [newEmployee, ...appointment?.details?.employees];
    console.log("newEmployees", newEmployees);
    setDetail("employees", newEmployees);
  };

  const removeEmployee = (id) => () => {
    console.log("removing employee", id);
    const employee = appointment?.details.employees?.find((e) => e.id === id);
    const newEmployees = without([employee], appointment?.details?.employees);
    setDetail("employees", newEmployees);
  };

  const minimizeEmployee = (id) => () => {
    console.log("minimizing employee", id);
    const employee = appointment?.details.employees?.find((e) => e.id === id);
    const minimizedEmployee = assoc("isMinimized", true, employee);
    const index = appointment?.details?.employees?.indexOf(employee);
    const employeesWithoutEmployee = without(
      [employee],
      appointment?.details?.employees
    );
    const newEmployees = insert(
      index,
      minimizedEmployee,
      employeesWithoutEmployee
    );

    setDetail("employees", newEmployees);
  };

  const maximizeEmployee = (id) => () => {
    console.log("maximizing employee", id);
    const employee = appointment?.details.employees?.find((e) => e.id === id);
    const maximizedEmployee = assoc("isMinimized", false, employee);
    const index = appointment?.details?.employees?.indexOf(employee);
    const employeesWithoutEmployee = without(
      [employee],
      appointment?.details?.employees
    );
    const newEmployees = insert(
      index,
      maximizedEmployee,
      employeesWithoutEmployee
    );
    setDetail("employees", newEmployees);
  };

  useEffect(() => {
    const hasUpdatedAppointmnent = !equals(appointment, originalAppointment);
    setHasUpdatedAppointment(hasUpdatedAppointmnent);
  });

  const toggleDoverRequested = (id) => {
    const employee = appointment?.details.employees?.find((e) => e.id === id);
    const index = appointment?.details?.employees?.indexOf(employee);
    const employeesWithoutEmployee = without(
      [employee],
      appointment?.details?.employees
    );
    const isRequired = employee.dover?.required;
    const newEmployee = assocPath(["dover", "required"], !isRequired, employee);
    const newEmployees = insert(index, newEmployee, employeesWithoutEmployee);
    setDetail("employees", newEmployees);
  };

  return (
    <Container className="container-fluid">
      <div class="row">
        <div className="col-xl-12 col-lg-12">
          <div className="card">
            <div className="card-body">
              <h1 className="card-title">Edit Appointment</h1>
              <button
                className={`btn  btn-outline-primary mr-1`}
                onClick={() => navigate("/appointment/" + appointment.id)}
                disabled={hasUpdatedAppointmnent}
              >
                Close
              </button>
              <button
                className={`btn mr-1 ${
                  hasUpdatedAppointmnent ? "btn-primary" : "btn-secondary"
                }`}
                onClick={saveAppointment}
                disabled={
                  !(
                    appointment?.details?.ndaAccepted ||
                    appointment.status !== "pending"
                  )
                }
              >
                Save Appointment
              </button>
              <button
                className={`btn ${
                  hasUpdatedAppointmnent ? "btn-link" : "btn-secondary"
                }`}
                onClick={resetAppointmentToOriginal}
                disabled={!hasUpdatedAppointmnent}
              >
                Cancel Changes
              </button>
              {appointment.status !== "pending" && (
                <p> Cannot edit appointmewnt after status change</p>
              )}
            </div>
          </div>
        </div>
        <div class="col-xl-12 col-lg-12">
          <div class="card">
            <div class="card-header">
              <h4 class="card-title">Forms</h4>
            </div>
            <div class="card-body">
              <ul>
                <li>
                  <a
                    href="/forms/Annexure 3 - Medical Certificate of Fitness.pdf"
                    target="_blank"
                    rel="no_rel"
                  >
                    Annexure 3 - Medical Certificate of Fitness.pdf
                  </a>
                </li>
                <li>
                  <a
                    href="/forms/Man Job Spec.pdf"
                    target="_blank"
                    rel="no_rel"
                  >
                    Man Job Spec.pdf
                  </a>
                </li>
                <li>
                  <a
                    href="/forms/Man Job Spec ClinicPlus.xlsx"
                    target="_blank"
                    rel="no_rel"
                  >
                    Man Job Spec ClinicPlus.xlsx
                  </a>
                </li>
                <li>
                  <a
                    href="/forms/Man Job Spec for Working at Heights and Confined Spaces.xlsx"
                    target="_blank"
                    rel="no_rel"
                  >
                    Man Job Spec for Working at Heights and Confined Spaces.xlsx
                  </a>
                </li>
                <li>
                  <a
                    href="/forms/Non-disclosure agreement 2023.doc"
                    target="_blank"
                    rel="no_rel"
                  >
                    Non-disclosure agreement 2023.doc
                  </a>
                </li>
                <li>
                  <a
                    href="/forms/Record of Hazardous Work DMR.doc"
                    target="_blank"
                    rel="no_rel"
                  >
                    Record of Hazardous Work DMR.doc
                  </a>
                </li>
                <li>
                  <a
                    href="/forms/Training Banking Details Confirmation.pdf"
                    target="_blank"
                    rel="no_rel"
                  >
                    Training Banking Details Confirmation.pdf
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="col-xl-12  col-lg-12">
          <div class="card">
            <div class="card-header">
              <h4 class="card-title">Details</h4>
            </div>
            <div class="card-body">
              <div class="basic-form">
                <form>
                  <div class="form-group row">
                    <label class="col-sm-4 col-form-label">Company</label>
                    <div class="col-sm-8">
                      <input
                        class="form-control input-default "
                        placeholder="col-form-label-sm"
                        disabled
                        value={appointment?.details?.company?.name}
                      />
                    </div>
                  </div>
                  <div class="form-group row">
                    <label class="col-sm-4 col-form-label">Date</label>
                    <div class="col-sm-8">
                      <input
                        class="form-control input-default "
                        placeholder="Select date"
                        type="date"
                        onChange={(e) => setDetail("date", e.target.value)}
                        value={appointment?.details?.date}
                      />
                    </div>
                  </div>
                  <div class="form-group row">
                    <label class="col-sm-4 col-form-label">
                      Purchase order number
                    </label>
                    <div class="col-sm-8">
                      <input
                        type="email"
                        class="form-control input-default "
                        placeholder="Enter purchase order number"
                        onChange={(event) =>
                          setDetail("purchaseOrderNumber", event.target.value)
                        }
                        value={appointment?.details?.purchaseOrderNumber}
                      />
                    </div>
                  </div>
                  <div class="form-group row">
                    <label class="col-sm-4 col-form-label">
                      Company name on medical
                    </label>
                    <div class="col-sm-8">
                      <input
                        type="email"
                        class="form-control input-default "
                        placeholder="Company name on medical"
                        onChange={(event) =>
                          setDetail("companyNameOnMedical", event.target.value)
                        }
                        value={appointment?.details?.companyNameOnMedical}
                      />
                    </div>
                  </div>
                  <div class="form-group row">
                    <label class="col-sm-4 col-form-label">
                      Company responsible for payment
                    </label>
                    <div class="col-sm-8">
                      <input
                        type="email"
                        class="form-control input-default "
                        placeholder="Company responsible for payment"
                        onChange={(event) =>
                          setDetail(
                            "companyResponsibleForPayment",
                            event.target.value
                          )
                        }
                        value={
                          appointment?.details?.companyResponsibleForPayment
                        }
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-12  col-lg-12">
          <div class="card">
            <div class="card-header">
              <h4 class="card-title">Clinic</h4>
            </div>
            <div class="card-body">
              <div class="basic-form">
                <form>
                  <div class="form-group">
                    <div class="form-check mb-2">
                      <input
                        type="checkbox"
                        class="form-check-input"
                        checked={
                          appointment?.details?.clinic?.toLowerCase() ===
                          "churchill"
                        }
                        value="Churchill"
                        onChange={(event) => setDetail("clinic", "Churchill")}
                      />
                      <label class="form-check-label" for="check1">
                        Churchill
                      </label>
                    </div>
                    <div class="form-check mb-2">
                      <input
                        type="checkbox"
                        class="form-check-input"
                        value="Hendrina"
                        checked={
                          appointment?.details?.clinic?.toLowerCase() ===
                          "hendrina"
                        }
                        onChange={(event) => setDetail("clinic", "Hendrina")}
                      />
                      <label class="form-check-label" for="check2">
                        Hendrina
                      </label>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-12 col-lg-6">
          <div class="card">
            <div class="card-header">
              <h4 class="card-title">Non disclosure Agreement</h4>
            </div>
            <div class="card-body">
              <p>Do you accept ClinicPlusBookings Non Disclosure Agreement? </p>
              <div class="basic-form">
                <form>
                  <div class="form-group">
                    <div class="form-check mb-2">
                      <input
                        type="checkbox"
                        class="form-check-input"
                        checked={appointment?.details?.ndaAccepted === true}
                        onChange={() => setDetail("ndaAccepted", true)}
                      />
                      <label class="form-check-label" for="check1">
                        NDA has been accepted.
                      </label>
                    </div>
                    <div class="form-check mb-2">
                      <input
                        type="checkbox"
                        class="form-check-input"
                        checked={appointment?.details?.ndaAccepted === false}
                        onChange={() => setDetail("ndaAccepted", false)}
                      />
                      <label class="form-check-label" for="check2">
                        NDA has not been accepted.
                      </label>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-12 col-lg-12 text-center">
          <h2>Employees</h2>
          <button
            className="btn btn-primary mb-2"
            onClick={
              appointment?.details?.employees?.length === 100
                ? () => {}
                : createNewEmployee
            }
          >
            {" "}
            Add New Employee{" "}
          </button>
          <br />
          <p>
            This appointment has {appointment?.details?.employees?.length}{" "}
            employees. The limit is 100 employees.{" "}
          </p>
        </div>
        {appointment?.details?.employees?.map((employee, i) => (
          <div class="col-sm-12  col-xl-6  col-lg-6">
            <div class="card">
              <div class="card-header">
                <div class="row">
                  <div class="col-md-4 col-sm-12 col-xs-12">
                    <h4 class="card-title"> Edit {employee.name}</h4>
                  </div>
                  <div class="col-md-8 col-sm-12 col-xs-12">
                    <div className="row btn-group mt-3 d-flex flex-row justitfy-content-center align-items-center">
                      <button
                        className="col-md-4 col-sm-6 col-xs-6 btn btn-danger"
                        onClick={removeEmployee(employee.id)}
                      >
                        {" "}
                        Delete{" "}
                      </button>
                      <button
                        className="col-md-4 col-sm-6 col-xs-6 btn btn-warning"
                        onClick={
                          employee?.isMinimized
                            ? maximizeEmployee(employee?.id)
                            : minimizeEmployee(employee?.id)
                        }
                      >
                        {" "}
                        {employee?.isMinimized ? "View" : "Hide"} Details{" "}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <SearchModal
                show={!employee.isMinimized}
                handleClose={
                  employee?.isMinimized
                    ? maximizeEmployee(employee?.id)
                    : minimizeEmployee(employee?.id)
                }
              >
                <CardBody
                  className={`card-body ${
                    employee.isMinimized ? "minimized" : "maximized"
                  }`}
                >
                  <div class="basic-form">
                    <form>
                      <div class="form-group row">
                        <label class="col-sm-4 col-form-label">Name</label>
                        <div class="col-sm-8">
                          <input
                            type="text"
                            class="form-control"
                            placeholder="Name"
                            onChange={(event) =>
                              setEmployeeDetail(
                                employee.id,
                                "name",
                                event.target.value
                              )
                            }
                            value={employee?.name}
                          />
                        </div>
                      </div>
                      <div class="form-group row">
                        <label class="col-sm-4 col-form-label">
                          ID/Passport Number
                        </label>
                        <div class="col-sm-8">
                          <input
                            type="text"
                            class="form-control"
                            placeholder="Identity Number"
                            onChange={(event) =>
                              setEmployeeDetail(
                                employee.id,
                                "idNumber",
                                event.target.value
                              )
                            }
                            value={employee?.idNumber}
                          />
                        </div>
                      </div>
                      <div class="form-group row">
                        <label class="col-sm-4 col-form-label">
                          Occupation
                        </label>
                        <div class="col-sm-8">
                          <input
                            type="text"
                            class="form-control"
                            placeholder="Occupation"
                            onChange={(event) =>
                              setEmployeeDetail(
                                employee.id,
                                "occupation",
                                event.target.value
                              )
                            }
                            value={employee?.occupation}
                          />
                        </div>
                      </div>
                      <div class="form-group row">
                        <label class="col-sm-4 col-form-label">Sites</label>
                        <div class="col-sm-8">
                          <Sites
                            employeeSites={employee?.sites || []}
                            onChange={(sites) =>
                              setEmployeeDetail(employee.id, "sites", sites)
                            }
                          />
                        </div>
                      </div>
                      <div class="form-group row">
                        <label class="col-sm-4 col-form-label">Services</label>
                        <div class="col-sm-8">
                          <Services
                            selectedServices={employee?.services}
                            onChange={(services) =>
                              setEmployeeDetail(
                                employee.id,
                                "services",
                                services
                              )
                            }
                          />
                        </div>
                      </div>
                      <div class="form-group row">
                      <label class="col-sm-4 col-form-label">
                        Dover Service
                        <br />
                        <small>Only done in Witbank</small>
                      </label>
                      <div class="col-sm-8">
                        <div className="row">
                          <div className="col-12">
                            <div className="row">
                              <div className="col-8">
                                <input
                                  type="checkbox"
                                  id={`dover-checkbox}`}
                                  className="mr-2"
                                  name={"dover test"}
                                  value={employee.dover?.required}
                                  checked={employee.dover?.required}
                                  onClick={() =>
                                    toggleDoverRequested(employee.id)
                                  }
                                />
                                <label htmlFor={`dover-checkbox`}>
                                  Require dover test
                                </label>
                              </div>
                              <div className="col-4">{getFormattedPrice(DOVER_PRICE)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                      <div class="form-group row">
                        <label class="col-sm-4 col-form-label">
                          Job Spec File
                        </label>
                        <div class="col-sm-8">
                          <div class="card">
                            <div class="card-body">
                              <div class="row">
                                <div class="col-12">
                                  {employee?.jobSpecFile && (
                                    <p>
                                      <a
                                        className="btn btn-primary mb-2"
                                        href={employee?.jobSpecFile}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        View Uploaded
                                      </a>
                                    </p>
                                  )}
                                  <Uploader
                                    onChange={(jobSpecFileUrl) =>
                                      setEmployeeDetail(
                                        employee?.id,
                                        "jobSpecFile",
                                        jobSpecFileUrl
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="form-group row">
                      <label class="col-sm-4 col-form-label">
                        Extra Job Spec Files
                      </label>
                      <div class="col-sm-8">
                        <div class="card">
                          <div class="card-body">
                            <div class="row">
                              <div class="col-12">
                                <ol>
                                  {employee?.extraJobSpecFiles &&
                                    employee?.extraJobSpecFiles.map((ex) => (
                                      <li>
                                        <small>
                                          <a
                                            href={ex}
                                            target="_blank"
                                            rel="noreferrer"
                                          >
                                            {last(ex.split("/"))}
                                          </a>
                                        </small>
                                      </li>
                                    ))}
                                </ol>
                                <Uploader
                                  onChange={(jobSpecFileUrl) => {
                                    const extraJobSpecFiles =
                                      employee.extraJobSpecFiles;
                                    const newFiles = append(
                                      jobSpecFileUrl,
                                      extraJobSpecFiles
                                    );
                                    setEmployeeDetail(
                                      employee?.id,
                                      "extraJobSpecFiles",
                                      newFiles
                                    );
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                      <div class="form-group row">
                        <label class="col-sm-4 col-form-label">Comments</label>
                        <div class="col-sm-8">
                          <Comments
                            employeeComments={employee?.comments || []}
                            onChange={(comments) =>
                              setEmployeeDetail(
                                employee.id,
                                "comments",
                                comments
                              )
                            }
                          />
                        </div>
                      </div>
                    </form>
                  </div>
                </CardBody>
              </SearchModal>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}

export default App;
