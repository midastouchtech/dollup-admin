import { isEmpty, isNil } from "ramda";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { save, selectUser } from "../../store/user";
import { css } from "@emotion/react";
import PropagateLoader from "react-spinners/PropagateLoader";
import cookies from "js-cookie";

const Container = styled.div`
  height: 100vh;
  padding: 50px 0px;
  padding: 20px;
  display: flex;
  justify-content: center;
  color: #fff;
  margin-bottom: 10vh;
  background: #fff;
  background-size: cover;
`;

const Wrapper = styled.div`
  backdrop-filter: blur(16px);
  width: 60%;
  padding: 40px;
  border: 1px solid #ffffff2e;
  border-radius: 10px;
  background: #343940;
  a {
    color: #fff;
  }
  @media (max-width: 800px) {
    width: 100%;
  }
`;

const exists = (i) => !isNil(i) && !isEmpty(i);

const Button = styled.button`
  margin-top: 15px;
  padding: 15px;
  border: 1px solid #80808052;
  box-shadow: -2px 3px 7px 1px #cfcfcf0a;
  border-radius: 5px;
  background: #ae9717;
  font-size: 14px;
  width: 100%;
  height: 50px;
  &["disabled"] {
    background: #ae971733;
    cursor: not-allowed;
  }
`;

const Error = styled.p`
  color: #ffd2d2;
  font-size: 14px;
  margin-bottom: 0;
  height: 20px;
`;

const Label = styled.label`
  font-size: 14px;
  margin-bottom: 5px;
`;

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};
const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
  margin-left: 290px;
`;

function App({ socket }) {
  let navigate = useNavigate();
  let dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [cell, setCell] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [surnameError, setSurnameError] = useState("");
  const [cellError, setCellError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isValid, setIsValid] = useState(false);
  let [color, setColor] = useState("#ffffff");

  const doRegister = () => {
    setLoading(true);
    socket.emit("GET_USER_BY_EMAIL", {email});
    console.log("getting user")
    socket.on("RECEIVE_USER", (user) => {
      console.log("receiving user")
      console.log(user)
      if (user) {
        setError("User already exists");
        setLoading(false)
      } else {
        socket.off("RECEIVE_USER")
        socket.emit("SAVE_NEW_USER", {
          details: {
            name,
            surname,
            email,
            cell,
          },
          appointmentsCanEdit: [],
          appointmentsManaging: [],
          companiesCanEdit: [],
          companiesManaging: [],
          isSuspended: false,
          role: "client",
          password,
        });
        socket.on("RECEIVE_SAVE_USER_SUCCESS", (data) => {
          navigate("/login");
          setLoading(false);
          socket.off("RECEIVE_SAVE_USER_SUCCESS")
        });
      }
    });
  };

  useEffect(() => {
    console.log("doing effect");
    if (!exists(name)) {
      setNameError("Name is required");
    } else {
      setNameError(null);
    }

    if (!exists(surname)) {
      setSurnameError("Surname is required");
    } else {
      setSurnameError(null);
    }

    if (!exists(cell)) {
      setCellError("Cell is required");
    } else if (cell.length !== 10) {
      setCellError("Cell must be 10 digits");
    } else if (cell[0] !== "0") {
      setCellError("Cell must start with 0");
    } else {
      setCellError(null);
    }

    if (!exists(email)) {
      setEmailError("Email is required");
    } else if (!validateEmail(email)) {
      setEmailError(
        "Invalid email address, email must follow user@example.com"
      );
    } else {
      setEmailError(null);
    }

    if (!exists(password)) {
      setPasswordError("Password is required");
    } else {
      setPasswordError(null);
    }

    if (!exists(confirmPassword)) {
      setConfirmPasswordError("Password confirmation is required");
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError(null);
    }
    if (
      exists(name) &&
      exists(surname) &&
      exists(cell) &&
      exists(email) &&
      exists(password) &&
      exists(confirmPassword) &&
      password === confirmPassword &&
      validateEmail(email)
    ) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [name, surname, cell, email, password, confirmPassword]);

  console.log("loading", loading);

  return (
    <Container className="container" id="appElement">
      <Wrapper>
        <h1>ClinicPlus Bookings</h1>
        <h3>Register</h3>
        <form>
          <div className="form-group">
            <div className="row">
              <label class="col-sm-4 col-form-label">Name</label>
              <input
                className="col-sm-6 ml-3 form-control input-default"
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="row">
              <div className="col-12">
                <Error>{nameError}</Error>
              </div>
            </div>
          </div>
          <div className="form-group ">
            <div className="row">
              <label class="col-sm-4 col-form-label">Surname</label>
              <input
                className="col-sm-6 ml-3 form-control input-default"
                type="text"
                placeholder="Name"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
              />
            </div>
            <div className="row">
              <div className="col-12">
                <Error>{surnameError}</Error>
              </div>
            </div>
          </div>
          <div className="form-group ">
            <div className="row">
              <label class="col-sm-4 col-form-label">Cell number</label>
              <input
                className="col-sm-6 ml-3 form-control input-default"
                type="text"
                placeholder="Name"
                value={cell}
                onChange={(e) => setCell(e.target.value)}
              />
            </div>
            <div className="row">
              <div className="col-12">
                <Error>{cellError}</Error>
              </div>
            </div>
          </div>
          <div className="form-group">
            <div className="row">
              <label class="col-sm-4 col-form-label">Email</label>
              <input
                className="col-sm-6 ml-3 form-control input-default"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="row">
              <div className="col-12">
                <Error>{emailError}</Error>
              </div>
            </div>
          </div>
          <div className="form-group ">
            <div className="row">
              <label class="col-sm-4 col-form-label">Password</label>
              <input
                className="col-sm-6 ml-3 form-control input-default"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="text"
                placeholder="Password"
              />
            </div>
            <div className="row">
              <div className="col-12">
                <Error>{passwordError}</Error>
              </div>
            </div>
          </div>
          <div className="form-group ">
            <div className="row">
              <label class="col-sm-4 col-form-label">Confirm Password</label>
              <input
                className="col-sm-6 ml-3 form-control input-default"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="text"
                placeholder="Password"
              />
            </div>
            <div className="row">
              <div className="col-12">
                <Error>{confirmPasswordError}</Error>
              </div>
            </div>
          </div>
        </form>
        <Button onClick={doRegister} disabled={!isValid}>
          Register
        </Button>
        <br />
        <br />
        <Link to="/login">Already have an account? Login</Link>
        <Error>{error && error}</Error>
        <Error>
          {loading === true && (
            <p>
              <PropagateLoader
                color={color}
                loading={loading}
                css={override}
                size={15}
              />
            </p>
          )}
        </Error>
      </Wrapper>
    </Container>
  );
}

export default App;
