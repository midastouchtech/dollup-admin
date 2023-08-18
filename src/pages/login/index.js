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
  margin-top: 10vh;
  margin-bottom: 10vh;
  background: #fff;
  background-size: cover;
`;

const Wrapper = styled.div`
  backdrop-filter: blur(16px);
  width: 40%;
  padding: 40px;
  height: 500px;
  border-radius: 10px;
  color: #343940;
  @media (max-width: 800px) {
    width: 100%;
  }
`;

const exists = (i) => !isNil(i) && !isEmpty(i);

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 10px;
`;

const Input = styled.input`
  margin-top: 10px;
  padding: 15px;
  border: 1px solid #80808052;
  box-shadow: -2px 3px 7px 1px #cfcfcf0a;
  border-radius: 5px;
  background: #dddddd;
  font-size: 14px;
`;

const Button = styled.button`
  margin-top: 15px;
  padding: 15px;
  border: 1px solid #80808052;
  box-shadow: -2px 3px 7px 1px #cfcfcf0a;
  border-radius: 5px;
  background: pink;
  color: white;
  font-size: 14px;
  width: 100%;
  height: 50px;
`;

const Error = styled.p`
  color: red;
  font-size: 14px;
  margin-top: 10px;
  height: 40px;
`;

const Label = styled.label`
  font-size: 14px;
  margin-bottom: 5px;
`;

const LinkA = styled.a`
  margin-top: 20px;
  &:hover {
    color: lightblue;
    cursor: pointer;
  }
`;

function App({ socket }) {
  let navigate = useNavigate();
  let dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  let [color, setColor] = useState("#ffffff");

  const doLogin = () => {
    setLoading(true);
    socket.emit("DO_LOGIN_ADMIN", { email, password });
    socket.on("RECEIVE_LOGIN_USER_FAILED", (user) => {
      setLoading(false);
      setError(user.error);
    });
    socket.on("RECEIVE_LOGIN_USER_SUCCESS", (user) => {
      dispatch(save(user));
      cookies.set("dollup_admin_logged_in_user", user.id, { expires: 1 });
      setError("");
      setLoading(false);
      navigate("/");
    });
  };

  console.log("loading", loading);
  const override = css`
    display: block;
    margin: 0 auto;
    border-color: red;
    margin-left: 290px;
  `;
  return (
    <Container id="appElement">
      <Wrapper>
        <h1>
          Dollup <strong>Admin</strong>
        </h1>
        <InputWrapper>
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </InputWrapper>
        <InputWrapper>
          <Label>Password</Label>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
          />
        </InputWrapper>
        <Button onClick={doLogin}>Login</Button>
        <br />
        {/* <br />
        <LinkA onClick={() => navigate("/register")}>
          {" "}
          <Button>Register</Button>{" "}
        </LinkA> */}
        <br />
        <br />
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
