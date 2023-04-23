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
  equals,
} from "ramda";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import Uploader from "../../../../components/Upload";
import { useSearchParams } from "react-router-dom";


function App({ socket }) {
  let params = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [company, setCompany] = useState({});
  const [originalCompany, setOriginalCompany] = useState({});
  const [hasUpdatedCompany, sethasUpdatedCompany] = useState(false);
  const [searchParams] = useSearchParams();
  const [hasRequested, setHasRequested] = useState(false)

  useEffect(()=>{
    console.log("use effect socket", socket)
    if (socket && isLoading && hasRequested === false) {
      setHasRequested(true)
      socket.emit("GET_COMPANY", { id: params.companyId });
      socket.on("RECEIVE_COMPANY", (client) => {
        console.log("client page RECEIVE_company", client);
        setIsLoading(false);
        setCompany(client);
        setOriginalCompany(client);
      })
    }
  
  }, [socket]);

  

  const setDetail = (key, value) => {
    setCompany(assocPath(["details", key], value, company));
  };

  const resetCompanyToOriginal = () => {
    setCompany(originalCompany);
  };

  console.log(company);

  const saveCompany = () => {
    console.log("saving appza");
    socket.emit("UPDATE_COMPANY", company);
    socket.on("COMPANY_UPDATED", () => {
      console.log("company updated");
      navigate("/company/edit/" + company.id);
    });
  };

  useEffect(() => {
    const hasUpdatedCompany = !equals(company, originalCompany);
    sethasUpdatedCompany(hasUpdatedCompany);
  });

  return (
    <div class="container-fluid">
      <div class="row">
        <div className="col-xl-12 col-lg-12">
          <div className="card">
            <div className="card-body">
            <h1 className="card-title">Create an Company</h1>
              <button
                className={`btn btn-outline-primary mr-1`}
                onClick={() => navigate("/")}
                disabled={hasUpdatedCompany}
              >
                Close
              </button>
              <button
                className={`btn mr-1 ${
                  hasUpdatedCompany ? "btn-primary" : "btn-secondary"
                }`}
                onClick={saveCompany}
                disabled={!hasUpdatedCompany}
              >
                Save Company
              </button>
              <button
                className={`d-block d-sm-block d-md-block d-lg-block d-xl-block  btn btn-info  mt-3`}
                onClick={() => navigate("/appointment/create/?companyId=" + company.id+"&companyName="+company.details.name)}
                
              >
                Create Appointment For Company
              </button>
            </div>
          </div>
        </div>
        <div class="col-xl-6 col-lg-12">
          <div class="card">
            <div class="card-header">
              <h4 class="card-title">Details</h4>
            </div>
            <div class="card-body">
              <div class="basic-form">
                <form>
                  <div class="form-group row">
                    <label class="col-sm-4 col-form-label">ID</label>
                    <div class="col-sm-8">
                      <input
                        class="form-control input-default"
                        value={company?.id}
                        disabled
                      />
                    </div>
                  </div>
                  <div class="form-group row">
                    <label class="col-sm-4 col-form-label">Name</label>
                    <div class="col-sm-8">
                      <input
                        class="form-control input-default"
                        placeholder="enter name "
                        disabled
                        onChange={(e) => setDetail("name", e.target.value)}
                        value={company?.details?.name}
                      />
                    </div>
                  </div>
                  <div class="form-group row">
                    <label class="col-sm-4 col-form-label">Registration Name</label>
                    <div class="col-sm-8">
                      <input
                        class="form-control input-default"
                        placeholder="enter registrationName"
                        onChange={(e) => setDetail("registrationName", e.target.value)}
                        value={company?.details?.registrationName}
                      />
                    </div>
                  </div>
                  <div class="form-group row">
                    <label class="col-sm-4 col-form-label">Registration Number</label>
                    <div class="col-sm-8">
                      <input
                        class="form-control input-default"
                        placeholder="enter registrationNumber"
                        onChange={(e) => setDetail("registrationNumber", e.target.value)}
                        value={company?.details?.registrationNumber}
                      />
                    </div>
                  </div>
                  <div class="form-group row">
                    <label class="col-sm-4 col-form-label">
                      VAT
                    </label>
                    <div class="col-sm-8">
                      <input
                        class="form-control input-default"
                        placeholder="enter vat"
                        onChange={(e) => setDetail("vat", e.target.value)}
                        value={company?.details?.vat}
                      />
                    </div>
                  </div>
                  <div class="form-group row">
                    <label class="col-sm-4 col-form-label">
                      Physical Address
                    </label>
                    <div class="col-sm-8">
                      <textarea
                        class="form-control input-default"
                        placeholder="enter physical address"
                        onChange={(e) => setDetail("physicalAddress", e.target.value)}
                        value={company?.details?.physicalAddress}
                      />
                    </div>
                  </div>
                  <div class="form-group row">
                    <label class="col-sm-4 col-form-label">
                      Postal Address
                    </label>
                    <div class="col-sm-8">
                      <textarea
                        class="form-control input-default"
                        placeholder="enter postal address"
                        onChange={(e) => setDetail("postalAddress", e.target.value)}
                        value={company?.details?.postalAddress}
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-6 col-lg-12">
          <div class="card">
            <div class="card-header">
              <h4 class="card-title">Decomission</h4>
            </div>
            <div class="card-body">
              <p>When a company has been decommisioned it means ClinicPlus no longer accepts bookings from said company. </p>
              <p>The status of this company can be viewed below</p>
              <div class="basic-form">
              <p>This company is {company?.isDecomissioned === true ? <span className="badge badge-secondary">Decomissioned </span>: <span className="badge badge-success">Active </span>}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
