import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DOVER_PRICE, MEDICAL_SERVICES } from "../../../../constants";
import { keys, values } from "ramda";
import styled from "styled-components";
import html2canvas from "html2canvas";
import jspdf from "jspdf";
import axios from "axios";
import { v4 as uuid } from "uuid";

const formatPrice = (price) => {
  return `R ${price.toFixed(2)}`;
};

const StyedContainer = styled.div`
  overflow-y: scroll;
  height: 96vh;
  @media print {
    #printPageButton {
      display: none;
    }
  }
  .quote-container {
    border: 1px solid #lightgrey;
  }
  background-color: #fff;
  img {
    width: 100%;
  }
  h5 {
    padding: 10px 0;
  }
  td,
  th {
    padding: 5px 0 !important;
  }
  .details-row {
    p {
      padding: 0 !important;
      margin: 0 !important;
    }
  }
  tr {
    &:last-of-type {
      td {
        border: none;
      }
    }
  }
`;

function App({ socket }) {
  let params = useParams();
  const invoiceId = uuid();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [appointment, setAppointment] = useState({});
  const [services, setServices] = useState([]);
  const [total, setTotal] = useState(0);
  const [servicesPrice, setServicesPrice] = useState(0);
  const [totalAccessCardPrice, setAccessCardPrice] = useState(0);
  const [sitesPrice, setSitesPrice] = useState(0);
  const [company, setCompany] = useState({});
  const [disableButton, setButtonDisabled] = useState(false);
  const [status, setStatus] = useState("Email Invoice");
  const [doverCount, setDoverCount] = useState(0);
  const [doverPrice, setDoverPrice] = useState(0);
  const [hasRequested, setHasRequested] = useState(false)

  const [serviceCounts, setServiceCounts] = useState({});

  const savetopdf = () => {
    window.scrollTo(0, 0);
    const input = document.getElementById("quote-container");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jspdf("p", "mm", "a4");
      var width = pdf.internal.pageSize.getWidth() - 20;
      var height = pdf.internal.pageSize.getHeight() - 20;
      pdf.addImage(imgData, "JPEG", 10, 0, width, height);
      pdf.save("download.pdf");
    });
  };
  
  useEffect(()=>{
    console.log("use effect socket", socket)
    if (socket && isLoading && hasRequested === false) {
      setHasRequested(true)
      socket.emit("GET_APPOINTMENT", { id: params.appId });
      socket.on("RECEIVE_COMPANY", (data) => {
        setCompany(data);
      });
      socket.on("RECEIVE_APPOINTMENT", (appointment) => {
        socket.emit("GET_COMPANY", { id: appointment?.details?.company?.id });
        setIsLoading(false);
        setAppointment(appointment);
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
        const serviceCounts = allServices.reduce((acc, service) => {
          if (acc[service.id]) {
            acc[service.id] = acc[service.id] + 1;
          } else {
            acc[service.id] = 1;
          }
          return acc;
        }, {});
  
        const sitesPrices = appointment?.details?.employees?.reduce(
          (acc, employee) => {
            return employee?.sites && employee?.sites.length > 0 ? acc + (employee?.sites?.length - 1) * 38.40 : acc;
          },
          0
        );
        const accessCardPrices =  appointment?.details?.employees?.reduce(
          (acc, employee) => {
            const accessCardSites = employee.sites.filter(s => s.hasAccessCard === true)
            return accessCardSites.length > 0 ? acc + (accessCardSites.length - 1) * 51.20 : acc;
          }, 0);
          const doverPrices =  appointment?.details?.employees?.reduce(
            (acc, employee) => {
              const requiresDover = employee.dover?.required;
              return requiresDover ? acc + DOVER_PRICE : acc;
            }, 0)
        const employeesDoingDOver = appointment?.details?.employees?.filter((employee) => employee.dover?.required).length;
  
        setDoverPrice(doverPrices)
        setDoverCount(employeesDoingDOver)
        setAccessCardPrice(accessCardPrices)
        console.log(sitesPrices);
        setServicesPrice(servicesPrice);
        setServiceCounts(serviceCounts);
        setSitesPrice(sitesPrices);
        setServices(services);
        if (appointment.invoice) {
          setButtonDisabled(true);
        }
      });
    }
  
  }, [socket]);

  

  return (
    <StyedContainer>
      <div class="container">
        <div class="container">
          <br />
          <div class="row">
            <div class="col-1"></div>
            <div class="col-10 text-center">
              <a
                id="printPageButton"
                className="btn btn-primary mr-1"
                href={"/appointment/" + appointment.id}
              >
                {" "}
                Close
              </a>
              <button
                id="printPageButton"
                className="btn btn-primary ml-1"
                onClick={() => savetopdf()}
              >
                {" "}
                Save as PDF{" "}
              </button>
            </div>
          </div>
          <br />
          <div className="row">
            <div className="col-1"></div>
            <div id="quote-container" className="col-10 quote-container">
              <br />
              <div class="row details-row">
                <div class="col-md-6">
                  <img className="logo-abbr" src="/cplogo-text.png" alt="" />
                </div>
              </div>
              <hr />
              <div class="row details-row">
                <div class="col-md-6 text-left">
                  <h4>
                    <strong>Postal Address</strong>
                  </h4>
                  <p>Postnet P156</p>
                  <p>Private Bag X 7260</p>
                  <p>Practice No 0286389</p>
                  <p>1035</p>
                </div>
                <div class="col-md-6 text-left">
                  <h4>
                    <strong>Physical Address</strong>
                  </h4>
                  <p>Extension 5</p>
                  <p>Witbank 1035</p>
                  <p>Tel 013 656 2020</p>
                  <p>Fax 013 658 5036</p>
                </div>
                <br />
                
                
              </div>
              <hr />
              <div class="row">
                  <div class="col-md-6 text-left">
                    <h5>Purchase Order Number</h5>
                    <p className="mb-3">
                      <strong>
                        {appointment?.details?.purchaseOrderNumber}
                      </strong>
                    </p>
                    <h5>Invoice Number</h5>
                    <p className="mb-3">
                      <strong>
                        {appointment.invoice
                          ? appointment.invoice.id
                          : invoiceId}
                      </strong>
                    </p>
                    <h5>Terms</h5>
                    <p>
                      <strong>E&O E. Errors and ommisions expected</strong>
                    </p>
                  </div>
                  <div class="col-md-6 text-left">
                  <h4>Bill To </h4>
                  <strong>
                    <strong>{company?.details?.name}</strong>
                  </strong>
                  <p>{company?.details?.physicalAddress}</p>
                  <hr />
                  <h4>Appointment ID</h4>
                  <p>
                    <strong>{appointment.id}</strong>
                  </p>
                </div>
                </div>
              <div class="row">
                <div class="col-md-12 ">
                  <br />
                  <hr />
                  <div>
                    <table class="table">
                      <thead class="thead-dark">
                        <tr>
                          <th>
                            <h5>Description</h5>
                          </th>
                          <th>
                            <h5>Quantity</h5>
                          </th>
                          <th class="text-right">
                            <h5>Amount</h5>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <h5>Service prices</h5>
                        {values(MEDICAL_SERVICES).map((service) =>
                          serviceCounts[service.id] ? (
                            <tr>
                              <td class="col-md-8">{service.title}</td>
                              <td
                                class="col-md-1"
                                style={{ textAlign: "center" }}
                              >
                                {serviceCounts[service.id]}
                              </td>
                              <td class="col-md-5 text-right">
                                {formatPrice(service.price)}
                              </td>
                            </tr>
                          ) : (
                            ""
                          )
                        )}
                        <br />
                        <h5>Site Prices</h5>
                        {appointment?.details?.employees?.map((employee) => (
                          <tr>
                            <td class="col-md-8">{employee?.name}</td>
                            <td
                              class="col-md-1"
                              style={{ textAlign: "center" }}
                            >
                              {employee?.sites && employee?.sites.length > 0 ? employee?.sites?.length : 0}
                            </td>
                            <td class="col-md-5 text-right">
                              {formatPrice(
                                employee?.sites?.length > 0
                                  ? (employee?.sites?.length - 1) * 38.40
                                  : 0
                              )}
                            </td>
                          </tr>
                        ))}
                        <br />
                        <h5>Access Card Prices</h5>
                        {appointment?.details?.employees?.map((employee) => {
                          const accessCardSites = employee.sites.filter(s => s.hasAccessCard === true)
                          return (
                            <tr>
                              <td class="col-md-8 text-capitalize">{employee?.name}</td>
                              <td
                                class="col-md-1"
                                style={{ textAlign: "center" }}
                              >
                                {accessCardSites.length}
                              </td>
                              <td class="col-md-5 text-right">
                                {formatPrice(
                                  accessCardSites.length > 0
                                    ? (accessCardSites.length - 1) * 51.20
                                    : 0
                                )}
                              </td>
                            </tr>
                          )
                        })}
                        <br />
                        <tr>
                          <td class="col-md-8"></td>
                          <td class="col-md-1" style={{ textAlign: "center" }}>
                            <h4>
                              <strong>Total: </strong>
                            </h4>
                          </td>
                          <td class="col-md-5 text-right">
                            <h4>
                              <strong>
                                {formatPrice(servicesPrice + sitesPrice + totalAccessCardPrice)}
                              </strong>
                            </h4>
                          </td>
                        </tr>
                        <h5>Dover Service</h5>
                        <tr>
                          <td class="col-md-8 text-capitalize">Employees</td>
                          <td class="col-md-1">{doverCount}</td>
                          <td class="col-md-5 text-right">{formatPrice(doverPrice)}</td>
                        </tr>
                        <br />
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div class="row details-row">
                <div class="col-md-6 text-left">
                  <h4>
                    <strong>Banking Details</strong>
                  </h4>
                  <p>ClinicPlus (PTY)LTD</p>
                  <p>Bank: ABSA</p>
                  <p>Account Number: 4069672703</p>
                  <p>Account Type: Cheque</p>
                  <p>Branch: 632005</p>
                  <p>Reference: {company?.details?.name}</p>
                </div>
                <div class="col-md-6 text-left">
                  <h4>
                    <strong>Dover Service Banking Details</strong>
                  </h4>
                  <p>ClinicPlus Health And Safety Training</p>
                  <p>Bank: FNB</p>
                  <p>Account Number: 62763932243</p>
                  <p>Account Type: Gold Business Account</p>
                  <p>Branch Code: 270250</p>
                  <p>Branch Name: WITBANK 430</p>
                </div>
              </div>
              
              


            </div>
          </div>
        </div>
      </div>
    </StyedContainer>
  );
}

export default App;
