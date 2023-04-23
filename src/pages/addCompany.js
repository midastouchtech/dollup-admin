import { getValue } from "@testing-library/user-event/dist/utils";
import { isEmpty, isNil } from "ramda";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../store/user";
import { Input, ButtonContainer } from "../components/form";
import { FaUserCheck } from "react-icons/fa";

const Container = styled.div`
  width: 100%;
  height: 500px;
  margin-top: 72px;
  margin-bottom: 20vh;
  padding: 20px;
  display: flex;
  justify-content: center;
`;

const MainForm = styled.div`
  display: flex;
  flex-direction: column;
  box-shadow: -1px 0px 7px 4px #00000017;
  justify-content: flex-start;
  border-radius: 10px;
  border: 1px solid #000;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  width: 90%;
  background: #c5c6d2;
`;

export const Form = styled.div`
  pading-top: 20px;
  display: flex;
  flex-direction: column;
  width: 90%;
  height: 100%;
  padding: 20px;
  justify-content: space-evenly;
  ${ButtonContainer} {
    background: gold;
  }
`;

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: ${(props) => props.justify || "center"};
  align-items: center;
  width: 100%;
  margin-top: 10px;
  flex-direction: ${(props) => props.direction || "column"};
  backround: blue;
  padding: 20px;
  background: #28283824;
  button {
    margin-right: 10px;
  }
`;

const Complete = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 20px;
  height: 100%;
  svg {
    fill: #07141a87;
  }
`;

const InputsContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  justify-content: space-evenly;
  flex-wrap: wrap;
  input{
    width: 400px;
    height: 30px;
  }
  `;

function AddAppointment({ socket }) {
  const user = useSelector(selectUser).data;
  const [details, setDetails] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isEmpty(details)) {
      setIsValid(false);
    } else {
      const keys = [
        "name",
        "registrationNumber",
        "vat",
        "physicalAddress",
        "postalAddress",
        "registrationName",
      ];
      const isValid = keys.every(
        (key) => !isNil(details[key]) && !isEmpty(details[key])
      );
      setIsValid(isValid);
    }
  }, [setIsValid, details]);

  const setDetail = (item) => (e) =>
    setDetails({ ...details, [item]: e.target.value });

  const getValue = (item) => {
    return isNil(details[item]) ? "" : details[item];
  };

  const handleSubmit = () => {
    setIsComplete(true);
    const company = {
      details,
      usersWhoCanEdit: [],
      usersWhoCanManage: [
        { id: user.id, name: `${user.details.name}  ${user.details.surname}` },
      ],
      messages: [],
      isDecomissioned: false,
    };
    console.log(company);
    socket.emit("SAVE_NEW_COMPANY", company);
  };

  return (
    <Container>
      <MainForm>
        <Form>
          {!isComplete && (
            <InputsContainer>
              <Input
                placeholder="Company Name"
                value={getValue("name")}
                onChange={setDetail("name")}
              />
              <Input
                placeholder="Registration Name"
                value={getValue("registrationName")}
                onChange={setDetail("registrationName")}
              />
              <Input
                placeholder="Registration Number"
                value={getValue("registrationNumber")}
                onChange={setDetail("registrationNumber")}
              />
              <Input
                placeholder="Vat"
                value={getValue("vat")}
                onChange={setDetail("vat")}
              />
              <Input
                placeholder="Physical Address"
                value={getValue("physicalAddress")}
                onChange={setDetail("physicalAddress")}
              />
              <Input
                placeholder="Postal Address"
                value={getValue("postalAddress")}
                onChange={setDetail("postalAddress")}
              />
            </InputsContainer>
          )}
          {isComplete && (
            <Complete>
              <h1>Company Added</h1>
              <br />
              <FaUserCheck size="3em" />
              <br />
            </Complete>
          )}
        </Form>
        {isComplete && (
          <StyledButtonContainer>
            <Link to="/">
              <button>Close</button>
            </Link>
          </StyledButtonContainer>
        )}
        {!isComplete && (
          <StyledButtonContainer direction="row">
            <Link to="/">
              <button>Cancel</button>
            </Link>
            <button disabled={!isValid} onClick={handleSubmit}>
              {" "}
              Save{" "}
            </button>
          </StyledButtonContainer>
        )}
      </MainForm>
    </Container>
  );
}

export default AddAppointment;
