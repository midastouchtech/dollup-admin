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
import { useSearchParams } from "react-router-dom";

function App({ socket }) {
  let params = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [booking, setBooking] = useState({});
  const [originalVendor, setOriginalBooking] = useState({});
  const [hasUpdatedBooking, sethasUpdatedBooking] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [services, setServices] = useState([]);

  useEffect(() => {
    console.log("use effect socket", socket, params);
    if (socket && isLoading && hasRequested === false) {
      setHasRequested(true);
      socket.emit("GET_BOOKING", { id: params.id });
      socket.on("RECEIVE_BOOKING", (v) => {
        console.log("v page RECEIVE_BOOKING", v);
        setIsLoading(false);
        setBooking(v);
        setOriginalBooking(v);
      });
    }
  }, [socket]);

  useEffect(() => {
    const hasUpdatedBooking = !equals(booking, originalVendor);
    sethasUpdatedBooking(hasUpdatedBooking);
  });

  return (
    <div className="container">
      <div className="py-5 text-center">
        <img
          className="d-block mx-auto mb-4"
          src={booking?.vendor?.avatar}
          alt=""
          width="72"
          height="72"
        />
        <p className="badge badge-warning text-capitalize badge-lg lead">{booking.type}</p>
        <h2>{booking?.vendor?.storeName}</h2>
        <p className="lead">{booking?.vendor?.address}</p>
      </div>

      <div className="row">
        <div className="col-md-4 order-md-2 mb-4">
          <h4 className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-muted">Service</span>
          </h4>
          <ul className="list-group mb-3">
            <li className="list-group-item d-flex justify-content-between lh-condensed">
              <div>
                <h6 className="my-0">{booking?.service?.name}</h6>
                <small className="text-muted">
                  {booking?.service?.category.name}{" "}
                  {booking?.service?.duration.hours}hrs{" "}
                  {booking?.service?.duration.minutes}
                  mins
                </small>
              </div>
              <span className="text-muted">R{booking?.service?.salePrice}</span>
            </li>
          </ul>
        </div>
        <div className="col-md-8 order-md-1">
          <h4 className="mb-3">Customer</h4>
          <form className="needs-validation" novalidate>
            <div className="row">
              <div className="col-md-6 mb-3">
                <p className="lead">{booking?.customer?.name}</p>
                <p className="lead">{booking?.customer?.email}</p>
                <p className="lead">{booking?.customer?.phoneNumber}</p>
              </div>
              <div className="col-md-12 mb-3">
                <figure className="ps-block--form-box">
                  <figcaption className="lead">Booking Status</figcaption>
                  <div className="ps-block__content">
                    <div className="row">
                      <div className="form-group col-md-3 col-sm-12 col-xs-12">
                        <label>Is Complete</label>
                        <br />
                        <button
                          className={`mr-3 btn  ${
                            !booking?.isComplete ? "btn-danger" : "btn-dark"
                          }`}
                          disabled
                          onClick={(e) => {
                            e.preventDefault();

                            setBooking(assoc("isComplete", false, booking));
                          }}
                        >
                          No
                        </button>
                        <button
                          className={`mr-3 btn  ${
                            booking?.isComplete ? "btn-success" : "btn-dark"
                          }`}
                          disabled
                          onClick={(e) => {
                            e.preventDefault();
                            setBooking(assoc("isComplete", true, booking));
                          }}
                        >
                          Yes
                        </button>
                      </div>
                      <div className="form-group col-md-3 col-sm-12 col-xs-12">
                        <label>Is Paid</label>
                        <br />
                        <button
                          className={`mr-3 btn  ${
                            !booking?.isPaid ? "btn-danger" : "btn-dark"
                          }`}
                          disabled
                          onClick={(e) => {
                            e.preventDefault();
                            setBooking(assoc("isPaid", false, booking));
                          }}
                        >
                          No
                        </button>
                        <button
                          className={`mr-3 btn  ${
                            booking?.isPaid ? "btn-success" : "btn-dark"
                          }`}
                          disabled
                          onClick={(e) => {
                            e.preventDefault();
                            setBooking(assoc("isPaid", true, booking));
                          }}
                        >
                          Yes
                        </button>
                      </div>
                      <div className="form-group col-md-3 col-sm-12 col-xs-12">
                        <label>Is Cancelled</label>
                        <br />
                        <button
                          className={`mr-3 btn  ${
                            !booking?.isCancelled ? "btn-danger" : "btn-dark"
                          }`}
                          size="large"
                          disabled
                          onClick={(e) => {
                            e.preventDefault();
                            setBooking(assoc("isCancelled", false, booking));
                          }}
                        >
                          No
                        </button>
                        <button
                          className={`mr-3 btn  ${
                            booking?.isCancelled ? "btn-success" : "btn-dark"
                          }`}
                          size="large"
                          disabled
                          onClick={(e) => {
                            e.preventDefault();
                            setBooking(assoc("isCancelled", true, booking));
                          }}
                        >
                          Yes
                        </button>
                      </div>
                      <div className="form-group col-md-3 col-sm-12 col-xs-12">
                        <label>Client didn't show up</label>
                        <br />
                        <button
                          className={`mr-3 btn  ${
                            !booking?.isNoShow ? "btn-danger" : "btn-dark"
                          }`}
                          size="large"
                          onClick={(e) => {
                            e.preventDefault();
                            setBooking(assoc("isNoShow", false, booking));
                          }}
                          checked={booking?.isNoShow}
                          disabled
                        >
                          No
                        </button>
                        <button
                          className={`mr-3 btn  ${
                            booking?.isNoShow ? "btn-success" : "btn-dark"
                          }`}
                          size="large"
                          onClick={(e) => {
                            e.preventDefault();
                            setBooking(assoc("isNoShow", true, booking));
                          }}
                          checked={booking?.isNoShow}
                          disabled
                        >
                          Yes
                        </button>
                      </div>
                    </div>
                  </div>
                </figure>
              </div>
            </div>
            <br />
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
