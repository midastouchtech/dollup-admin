import { isEmpty, isNil } from "ramda";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { save, selectUser } from "../../store/user";
import { css } from "@emotion/react";
import PropagateLoader from "react-spinners/PropagateLoader";
import cookies from 'js-cookie';

const Container = styled.div`
  height: 100vh;
  padding: 50px 0px;
  padding: 20px;
  display: flex;
  justify-content: center;
  color: #fff;
  margin-top: 10vh;
  margin-bottom: 10vh;

  background: url(mural.svg);
  background-size: cover;

`;

const Wrapper = styled.div`
    backdrop-filter: blur(16px);
    width: 40%;
    padding: 40px;
    height: 500px;
    border: 1px solid #ffffff2e;
    border-radius: 10px;
    background: #31334c33;
    display: flex ;
    flex-direction: column;
    justify-content: center;
    align-items: center;

`;

const exists = (i) => !isNil(i) && !isEmpty(i);

function App({ socket }) {
    let navigate = useNavigate();
    cookies.remove("clinicplus_client_logged_in_user")

    if(typeof window !== "undefined"){
        window.location = "/login"
    }
  return (
    <Container id="appElement">
        <Wrapper>
        
            <h1> Logging you out...</h1>
            
        </Wrapper>
      
    </Container>
  );
}

export default App;
