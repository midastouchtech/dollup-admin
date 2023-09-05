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
  const [vendor, setVendor] = useState({});
  const [originalVendor, setOriginalCompany] = useState({});
  const [hasUpdatedCompany, sethasUpdatedCompany] = useState(false);
  const [hasRequested, setHasRequested] = useState(false)
  const [services, setServices] = useState([]);

  useEffect(()=>{
    console.log("use effect socket", socket)
    if (socket && isLoading && hasRequested === false) {
      setHasRequested(true)
      socket.emit("GET_VENDOR", { id: params.vendorId });
      socket.on("RECEIVE_VENDOR", (v) => {
        console.log("v page RECEIVE_VENDOR", v);
        setIsLoading(false);
        setVendor(v);
        setOriginalCompany(v);
        socket.emit("GET_VENDOR_SERVICES", {id: v.id});
      })
      socket.on("RECEIVE_VENDOR_SERVICES", (services) => {
        setServices(services)
        console.log("SERVICES", services)
      });
    }
  
  }, [socket]);

  useEffect(() => {
    const hasUpdatedCompany = !equals(vendor, originalVendor);
    sethasUpdatedCompany(hasUpdatedCompany);
  });

  return (
    <div className="container">
      <div className="py-5 text-center">
        <img
          className="d-block mx-auto mb-4"
          src={vendor.avatar}
          alt=""
          width="72"
          height="72"
        />
        <h2>{vendor.storeName}</h2>
        <p className="lead">{vendor.address}</p>
      </div>

      <div className="row">
        <div className="col-md-4 order-md-2 mb-4">
          <h4 className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-muted">Services</span>
            <span className="badge badge-secondary badge-pill">
              {services.length}
            </span>
          </h4>
          <ul className="list-group mb-3">
            {services.map((s) => (
              <li className="list-group-item d-flex justify-content-between lh-condensed">
                <div>
                  <h6 className="my-0">{s.name}</h6>
                  <small className="text-muted">
                    {s.category.name} {s.duration.hours}hrs {s.duration.minutes}
                    mins
                  </small>
                </div>
                <span className="text-muted">R{s.salePrice}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-md-8 order-md-1">
          <h4 className="mb-3">Ownership</h4>
          <form className="needs-validation" novalidate>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="firstName">First name</label>
                <input
                  type="text"
                  className="form-control"
                  id="firstName"
                  placeholder=""
                  value={vendor.fullName}
                  onChange={(e) =>
                    setVendor(assoc("fullName", e.target.value, vendor))
                  }
                />
                <div className="invalid-feedback">
                  Valid first name is required / .
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="email">
                  Email <span className="text-muted"></span>
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="you@example.com"
                  value={vendor.email}
                  onChange={(e) =>
                    setVendor(assoc("email", e.target.value, vendor))
                  }
                />
                <div className="invalid-feedback">
                  Please enter a valid email address for shipping updates.
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="email">Cellphone Number</label>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="you@example.com"
                value={vendor.cell}
                onChange={(e) =>
                  setVendor(assoc("cell", e.target.value, vendor))
                }
              />
              <div className="invalid-feedback">
                Please enter a valid email address for shipping updates.
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                className="form-control"
                value={vendor.address}
                onChange={(e) =>
                  setVendor(assoc("address", e.target.value, vendor))
                }
                placeholder="1234 Main St"
                required
              />
              <div className="invalid-feedback">
                Please enter your shipping address.
              </div>
            </div>

            <div className="row">
              <div className="col-md-5 mb-3">
                <label htmlFor="country">Country</label>
                <select
                  className="custom-select d-block w-100"
                  id="country"
                  required
                  value={vendor.country}
                  onChange={(e) =>
                    setVendor(assoc("country", e.target.value, vendor))
                  }
                >
                  <option value="">Choose...</option>
                  <option>South Africa</option>
                </select>
                <div className="invalid-feedback">
                  Please select a valid country.
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <label htmlFor="state">Province</label>
                <select
                  className="custom-select d-block w-100"
                  id="state"
                  required
                  value={vendor.province}
                  onChange={(e) =>
                    setVendor(assoc("province", e.target.value, vendor))
                  }
                >
                  <option value="">Choose...</option>
                  <option>Eastern Cape</option>
                  <option>Free State</option>
                  <option>Gauteng</option>
                  <option>KwaZulu-Natal</option>
                  <option>Limpopo</option>
                  <option>Mpumalanga</option>
                  <option>North West</option>
                  <option>Northern Cape</option>
                  <option>Western Cape</option>
                </select>
                <div className="invalid-feedback">
                  Please provide a valid state.
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <label htmlFor="zip">Postal Code</label>
                <input
                  type="text"
                  className="form-control"
                  id="zip"
                  placeholder=""
                  required
                  value={vendor.postalCode}
                  onChange={(e) =>
                    setVendor(assoc("postalCode", e.target.value, vendor))
                  }
                />
                <div className="invalid-feedback">Zip code required / .</div>
              </div>
            </div>
            <hr className="mb-4" />

            <h4 className="mb-3">Commission</h4>

            <div className="d-block my-3">
              <div className="custom-control custom-radio">
                <input
                  id="credit"
                  name="paymentMethod"
                  type="radio"
                  className="custom-control-input"
                  required
                  checked={vendor.commissionType === "fixed"}
                  onChange={(e) =>
                    setVendor(assoc("commissionType", "fixed", vendor))
                  }
                />
                <label className="custom-control-label" htmlFor="credit">
                  Fixed Amount (eg R 230.5)
                </label>
              </div>
              <div className="custom-control custom-radio">
                <input
                  id="debit"
                  name="paymentMethod"
                  type="radio"
                  className="custom-control-input"
                  required
                  checked={vendor.commissionType === "percentage"}
                  onChange={(e) =>
                    setVendor(assoc("commissionType", "percentage", vendor))
                  }
                />
                <label className="custom-control-label" htmlFor="debit">
                  Percentage (eg 5%)
                </label>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="cc-name">Online Bookings</label>
                <input
                  type="text"
                  className="form-control"
                  id="onlineBookingsCommision"
                  placeholder=""
                  required
                  value={vendor.onlineBookingsCommision}
                  onChange={(e) =>
                    setVendor(
                      assoc("onlineBookingsCommision", e.target.value, vendor)
                    )
                  }
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="cc-number">Walk-in Bookings</label>
                <input
                  type="text"
                  className="form-control"
                  id="cc-number"
                  placeholder=""
                  required
                  value={vendor.walkInBookingsCommision}
                  onChange={(e) =>
                    setVendor(
                      assoc("walkInBookingsCommision", e.target.value, vendor)
                    )
                  }
                />
              </div>
            </div>
            <hr className="mb-4" />
            <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={!hasUpdatedCompany}>
              Save Vendor
            </button>
          </form>
        </div>
      </div>

      <footer className="my-5 pt-5 text-muted text-center text-small">
        <p className="mb-1">&copy; 2017-2018 Dollup</p>
        <ul className="list-inline">
          <li className="list-inline-item">
            <a href="#">Privacy</a>
          </li>
          <li className="list-inline-item">
            <a href="#">Terms</a>
          </li>
          <li className="list-inline-item">
            <a href="#">Support</a>
          </li>
        </ul>
      </footer>
    </div>
  );
}

export default App;
