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
  pipe,
  append,
  last,
} from "ramda";
import short from "short-uuid";
import Dropdown from "react-bootstrap/Dropdown";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import Uploader from "../../../../components/Upload";
import { DOVER_PRICE, MEDICAL_SERVICES } from "../../../../constants";
import Services from "./services";
import Sites from "./sites";
import Comments from "./comments";
import CompanySearch from "../../../../components/Modal/companySearch";
import { useSelector } from "react-redux";
import { selectUser } from "../../../../store/user";
import { useSearchParams } from "react-router-dom";
import SearchModal from "../../../../components/Modal";
import html2canvas from "html2canvas";
import jspdf from "jspdf";
import axios from "axios";
import { v4 as uuid } from "uuid";
import "react-alert-confirm/lib/style.css";
import AlertConfirm from "react-alert-confirm";
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
    margin: 1.75rem auto;
  }
`;

const Error = styled.p`
  color: red;
`;

function App({ socket }) {
  const navigate = useNavigate();
  const currentUser = useSelector(selectUser).data;

  const [bodyItem, setBodyItem] = useState("details");
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [showNdaModal, setNdaModalOpen] = useState(false);
  const [ndaStatus, setStatus] = useState("");
  const [appointment, setAppointment] = useState({
    details: {
      company: null,
      date: null,
      purchaseOrderNumber: null,
      clinic: "Churchill",
      ndaAccepted: false,
      employees: [],
    },
    usersWhoCanEdit: [],
    usersWhoCanManage: [],
    payment: {
      proofOfPayment: "",
      amount: 0,
    },
    isVoided: false,
    isComplete: false,
    tracking: [],
    messages: [],
    status: "pending",
  });
  if (
    !isNil(currentUser) &&
    !isEmpty(currentUser) &&
    isEmpty(appointment.usersWhoCanManage)
  ) {
    setAppointment(
      assocPath(
        ["usersWhoCanManage"],
        [
          {
            id: currentUser?.id,
            name: `${currentUser?.details?.name} ${currentUser?.details?.surname}`,
          },
        ],
        appointment
      )
    );
  }

  const [originalAppointment, setOriginalAppointment] = useState({});
  const [hasUpdatedAppointmnent, setHasUpdatedAppointment] = useState(false);
  const [hasCompletedUpload, setHasCompletedUpload] = useState(false);
  const [show, setShowCompanySearch] = useState(false);
  const [appointmentsForDateCount, setAppointmentsForDateCount] = useState();
  const [ shouldUpdateCount, setShouldUpdateCount] = useState(false)

  const searchParamCompanyId = searchParams.get("companyId");
  const searchParamCompanyName = searchParams.get("companyName");

  const setDetail = (key, value) => {
    console.log("setting detail", key, value);
    setAppointment(assocPath(["details", key], value, appointment));
  };

  const addPdfUrl = (url) => {
    setAppointment(
      pipe(
        assocPath(["details", "ndaAccepted"], true),
        assocPath(["details", "ndaPdf"], url)
      )
    );
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
    const services = keys(MEDICAL_SERVICES).reduce((accx, service) => {
      const filteredServices = allServices.filter((s) => s.id === service);
      const reducedPriceFromFilteredServices = filteredServices.reduce(
        (acc, service) => {
          return acc + service.price;
        },
        0
      );

      if (filteredServices.length > 0) {
        return [
          ...accx,
          {
            id: service,
            price: reducedPriceFromFilteredServices,
            filter: filteredServices,
          },
        ];
      }
      return accx;
    }, []);
    const servicesPrice = services.reduce((acc, service) => {
      return acc + service.price;
    }, 0);
    const sitesPrice = appointment?.details?.employees?.reduce(
      (acc, employee) => {
        return employee?.sites && employee?.sites.length > 0
          ? acc + (employee?.sites?.length - 1) * 38.4
          : acc;
      },
      0
    );
    const accessCardPrice = appointment?.details?.employees?.reduce(
      (acc, employee) => {
        const accessCardSites = employee.sites.filter(
          (s) => s.hasAccessCard === true
        );
        return accessCardSites.length > 0
          ? acc + (accessCardSites.length - 1) * 51.2
          : acc;
      },
      0
    );
    const doverPrices = appointment?.details?.employees?.reduce(
      (acc, employee) => {
        const requiresDover = employee.dover?.required;
        return requiresDover ? acc + DOVER_PRICE : acc;
      },
      0
    );
    console.log("doverPrice", doverPrices);
    console.log("servicesPrice", servicesPrice);
    console.log("site price", sitesPrice);
    console.log("accessCardPrice", accessCardPrice);

    const bookingPrice =
      servicesPrice + sitesPrice + accessCardPrice + doverPrices;

    console.log("bookingPrice", bookingPrice);
    return bookingPrice;
  };

  const openConfirm = (id) => {
    AlertConfirm({
      title: "Congratulations",
      desc: "You have created an appointment with clinicplus you can proceed to process payment from your Proforma invoice on the system if you dont have an account",
      onOk: () => {
        navigate("/appointment/" + id);
      },
      onCancel: () => {
        console.log("cancel");
      },
    });
  };
  const saveAppointment = () => {
    const price = calculateBookingPrice();
    const appointmentWithNewPrice = assocPath(
      ["payment", "amount"],
      price,
      appointment
    );
    console.log("saving appza");
    socket.emit("SAVE_NEW_APPOINTMENT", appointmentWithNewPrice);
    socket.on("APPOINTMENT_ADDED", (data) => {
      openConfirm(data.id);
    });
  };

  const selectCompany = (company) => {
    console.log("selecting company", company);

    const newAppointment = pipe(assocPath(["details", "company"], company))(
      appointment
    );
    setAppointment(newAppointment);
  };

  if (socket && !appointmentsForDateCount) {
    socket.emit("GET_APPOINTMENTS_FOR_DATE_COUNT");
    socket.on("RECEIVE_APPOINTMENTS_FOR_DATE_COUNT", ({ count }) => {
      setAppointmentsForDateCount(count);
    });
  }

  const isNotNilOrEmpty = (i) => !isNil(i) && !isEmpty(i);
  if (
    isNotNilOrEmpty(searchParamCompanyId) &&
    isNotNilOrEmpty(searchParamCompanyName) &&
    isNil(appointment?.details?.company)
  ) {
    selectCompany({
      id: searchParamCompanyId,
      name: searchParamCompanyName,
    });
  }

  const createNewEmployee = () => {
    const newEmployee = {
      id: short.generate(),
      name: "",
      idNumber: "",
      comments: [],
      occupation: "",
      services: [],
      sites: [],
      isMinimized: true,
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

  const exists = (i) => !isNil(i) && !isEmpty(i);

  useEffect(() => {
    const hasUpdatedAppointmnent = !equals(appointment, originalAppointment);
    setHasUpdatedAppointment(hasUpdatedAppointmnent);
    if (
      socket &&
      exists(appointment?.details?.date) &&
      exists(appointment?.details?.clinic)
      && shouldUpdateCount === true
    ) {
      socket.emit("GET_APPOINTMENTS_FOR_DATE_COUNT", {
        clinic: appointment.details.clinic,
        date: appointment.details.date,
      });
      socket.on("RECEIVE_APPOINTMENTS_FOR_DATE_COUNT", ({ count }) => {
        console.log("COUNT", count);
        setAppointmentsForDateCount(count);
      });
      setShouldUpdateCount(false);
    }
  });

  const handleNdaModalClose = () => {
    setNdaModalOpen(!showNdaModal);
  };

  const uploadToCloudinary = () => {
    setDetail("ndaAccepted", true);
    window.scrollTo(0, 0);
    window.scrollTo(0, 0);
    const input = document.getElementById("ndamodal");
    var doc = new jspdf("p", "px", "a4");
    doc.html(input, {
      callback: function (pdf) {
        setStatus("Generating pdf please wait...");
        var blob = pdf.output("blob");
        const url = "https://api.cloudinary.com/v1_1/clinic-plus/raw/upload";
        const formData = new FormData();
        formData.append("file", blob, "quote.pdf");
        formData.append("upload_preset", "pwdsm6sz");
        setStatus("Uploading NDA form...");
        axios({
          method: "POST",
          data: formData,
          headers: { "Content-Type": "multipart/form-data" },
          url,
        })
          .then((response) => {
            console.log(appointment.details.ndaAccepted);
            addPdfUrl(response.data.secure_url);
            setStatus("");
          })
          .catch((errr) => setStatus("Error sending invoice"));
      },
      html2canvas: {
        scale: 0.36,
      },
      x: 20,
      y: 20,
    });
  };

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
    <Container class="container">
      <div class="pagetitle"></div>
      <div class="row">
        <div className="col-xl-12 col-lg-12">
          <div className="card">
            <div className="card-body">
              <h1 className="card-title">Create an Appointment</h1>
              <button
                className={`btn btn-outline-primary mr-1`}
                onClick={() => navigate("/")}
              >
                Cancel
              </button>
              {!(appointmentsForDateCount >= 100) && (
                <button
                  className={`btn mr-1 ${
                    hasUpdatedAppointmnent ? "btn-primary" : "btn-secondary"
                  }`}
                  onClick={saveAppointment}
                  disabled={!appointment?.details?.ndaAccepted}
                >
                  Create Appointment
                </button>
              )}

              <br />
              {exists(appointmentsForDateCount) && (
                <p>
                  <small class="text-secondary">
                    The number of appointments for {appointment?.details?.date}{" "}
                    at {appointment?.details?.clinic} is{" "}
                    {appointmentsForDateCount} the limit is 100{" "}
                  </small>
                  <br />
                  <small class="text-danger">
                    {appointmentsForDateCount >= 100
                      ? "Please note you won't be able to save this appointment as the limit has been reached."
                      : ""}
                  </small>
                </p>
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
        <div class="col-xl-12 col-lg-12">
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
                      <Dropdown>
                        <Dropdown.Toggle variant="warning" id="dropdown-basic">
                          {appointment?.details?.company?.name ||
                            "Select a company"}
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                          {currentUser?.companiesManaging?.map((company) => (
                            <Dropdown.Item
                              onClick={() => selectCompany(company)}
                              key={company.id}
                            >
                              {company?.name}
                            </Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </div>
                  <div class="form-group row">
                    <label class="col-sm-4 col-form-label">Date</label>
                    <div class="col-sm-8">
                      <input
                        class="form-control input-default "
                        placeholder="select date"
                        type="date"
                        onChange={(e) => {
                          setDetail("date", e.target.value);
                          setShouldUpdateCount(true);
                        }}
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
                        placeholder="Purchase order number"
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
        <div class="col-xl-12 col-lg-12">
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
                        onChange={(event) => {
                          setDetail("clinic", "Churchill");
                          setShouldUpdateCount(true);
                        }}
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
                        onChange={(event) => {
                          setDetail("clinic", "Hendrina");
                          setShouldUpdateCount(true);
                        }}
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
              <p>
                Do you accept ClinicPlus Booking's non disclosure agreement?
              </p>
              {appointment?.details?.ndaAccepted !== true && (
                <Error>
                  Cannot continue sale without reading and agreeing to Non
                  Disclosure Agreement
                </Error>
              )}
              <button
                className="btn btn-outline-secondary mb-3"
                onClick={handleNdaModalClose}
              >
                Read and accept NDA
              </button>
              <SearchModal
                name="ndamodal"
                show={showNdaModal}
                handleClose={handleNdaModalClose}
                title="ClinicPlus NDA"
              >
                <p>
                  {" "}
                  This non-disclosure agreement is entered into the parties
                  above for the purpose of preventing unauthorized disclosure of
                  confidential information. This agreement is for non-medical
                  professional staff that in the course of their duties are
                  required to deal with potentially sensitive confidential
                  employee information and records.{" "}
                </p>
                <p>
                  I{" "}
                  <strong>
                    {currentUser?.details?.name} {currentUser?.details?.surname}{" "}
                  </strong>
                  am fully authorised by{" "}
                  <strong>{appointment?.details?.company?.name} </strong>
                  to request and receive the medical information of the
                  employees of{" "}
                  <strong>{appointment?.details?.company?.name}</strong> who
                  have done their medical screening for fitness to work at
                  ClinicPlus, Witbank. The information will only be used for the
                  purpose of verification of these medicals at other clinics.
                  The email address to be used for this purpose:
                  <strong> {currentUser?.details?.email}</strong>
                </p>
                <p>
                  I am aware that I deal with confidential medical and other
                  information of the employees. I agree to keep confidential all
                  information which I may become aware of in dealing with
                  medical records of employees. This includes direct disclosure
                  as well as indirect disclosure to any person.
                </p>
                <p>
                  I hereby declare that the employees of{" "}
                  <strong>{appointment?.details?.company?.name} </strong>have
                  been informed of the fact that I will be dealing with their
                  medical records and that they have given their consent to
                  this.
                </p>
                <div class="basic-form">
                  <form>
                    <div class="form-group">
                      <div class="form-check mb-2">
                        <input
                          type="checkbox"
                          class="form-check-input"
                          checked={appointment?.details?.ndaAccepted === true}
                          onChange={async () => {
                            try {
                              await uploadToCloudinary();
                            } catch (e) {
                              console.log(e);
                            }
                          }}
                        />
                        <label class="form-check-label" for="check1">
                          I accept
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
                          I don't accept
                        </label>
                      </div>
                    </div>
                  </form>
                </div>
                <p>{ndaStatus}</p>
              </SearchModal>
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
            employees. The limit is 100 employees{" "}
          </p>
        </div>
        {appointment?.details?.employees?.map((employee) => (
          <div class="col-xl-12 col-lg-6 col-sm-6">
            <div class="card">
              <div class="card-header">
                <h4 class="card-title">
                  {" "}
                  <span className="badge badge-outline primary badge-xl">
                    Employee
                  </span>{" "}
                  {employee?.name}{" "}
                </h4>
                <div className="row">
                  <div className="col-12">
                    <button
                      className="btn btn-danger"
                      onClick={removeEmployee(employee.id)}
                    >
                      {" "}
                      Delete Employee{" "}
                    </button>
                    <button
                      className="btn btn-warning ml-2"
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
              <SearchModal
                show={!employee.isMinimized}
                handleClose={
                  employee?.isMinimized
                    ? maximizeEmployee(employee?.id)
                    : minimizeEmployee(employee?.id)
                }
              >
                <CardBody className={`card-body maximized"`}>
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
                                <div className="col-4">
                                  {getFormattedPrice(DOVER_PRICE)}
                                </div>
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
                                  {employee.jobSpecFile && (
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
      <div class="row">
        <div className="col-xl-12 col-lg-12">
          <div className="card">
            <div className="card-body">
              <h1 className="card-title">Create an Appointment</h1>
              <button
                className={`btn btn-outline-primary mr-1`}
                onClick={() => navigate("/")}
              >
                Cancel
              </button>
              <button
                className={`btn mr-1 ${
                  hasUpdatedAppointmnent ? "btn-primary" : "btn-secondary"
                }`}
                onClick={saveAppointment}
                disabled={!appointment?.details?.ndaAccepted}
              >
                Create Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default App;
