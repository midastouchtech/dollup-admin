import { assoc, isEmpty, isNil, mergeAll, values, without } from "ramda";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { selectUser } from "../store/user";
import { Link } from "react-router-dom";
import { Input, ButtonContainer } from "../components/form";
import { CLINIC_LOCATIONS, MEDICAL_SERVICES } from "../constants";
import Services from "./services";
import Uploader from "./nda";
import short from "short-uuid";
import { FaCalendarCheck } from "react-icons/fa";

const Container = styled.div`
  width: 100%;
  height: 500px;
  margin-top: 72px;
  margin-bottom: 20vh;
  padding: 20px;
  display: flex;
  justify-content: center;
`;

const Span = styled.span`
  color: red;
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

const Message = styled.div`
  padding: 10%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const InputContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 390px;
  margin-top: 10px;
  flex-direction: column;
  select, input{
    width: 80%;
  }
  button {
    width: 100px;
    height: 20px;
    margin-right: 20px;
    background: #c28300;
    font-size: 10px;
    border: 0;
    height: 40px;
    color: #ffffff;
    text-transform: capitalize;
    border-radius: 5px;
    box-shadow: 1px 1px 10px 1px #0000001f;
  }
`;

const Select = styled.select`
  margin-top: 10px;
  padding: 15px;
  border: 1px solid #80808052;
  box-shadow: -2px 3px 7px 1px #cfcfcfb5;
  border-radius: 5px;
  background: #dddddd;
  font-size: 14px;
`;

const Label = styled.label`
  margin-top: 10px;
  font-weight: 500;
  color: #37373a;
`;

const FlexContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: ${(props) => props.justify || "center"};
  align-items: center;
  width: 100%;
  margin-top: 10px;
  flex-direction: ${(props) => props.direction || "column"};
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
  width: 100%;
  flex-direction: column;
  padding: 20px;
  height: 100%;
  svg {
    fill: #07141a87;
  }
`;

export const Form = styled.div`
  pading-top: 20px;
  display: flex;
  flex-direction: column;
  width: 90%;
  height: 100%;
  padding: 20px;
  justify-content: space-evenly;
  overflow-y: scroll;
  ${ButtonContainer} {
    background: gold;
  }
`;

const Inputs = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: wrap;
  width: 100%;
  input {
    width: 20%;
    margin-right: 5px;
  }
`;

const Emp = styled.li`
    font-size:12px;
    span{
      font-weight: 600;
    border: 1px solid #1e283200;
    color: #1e2832;
    background: transparent;
    margin-right: 10px;
    }
    display: flex;
    justify-content: space-between;
    button{
      width: 60px;
    margin-right: 20px;
    font-size: 10px;
    height: 20px;
    text-transform: capitalize;
    border-radius: 5px;
    box-shadow: 1px 1px 10px 1px #0000001f;
    border: 1px solid #1e283200;
    color: #1e2832;
    background: transparent;
    margin-left: 10px;
    margin-bottom: 5px;
}
    }
`;

const exists = (i) => !isNil(i) && !isEmpty(i);

const getTotal = (services) => {
  return services.reduce((sum, currentItem) => {
    return sum + currentItem.price;
  }, 0);
};
const getAmount = (employees) => {
  return employees.reduce((sum, employee) => {
    return (
      sum +
      (!exists(employee)
        ? 0
        : !exists(employee.services)
        ? 0
        : getTotal(employee.services))
    );
  }, 0);
};

function AddAppointment({ socket }) {
  const user = useSelector(selectUser).data;
  const [appointment, setAppointment] = useState();
  const [companies, setCompanies] = useState();
  const [details, setDetails] = useState({});
  const [currentEmployee, setCurrentEmployee] = useState({
    id: short.generate(),
  });
  const [employees, setEmployees] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [isEditingEmployee, setIsEditingEmployee] = useState(false);
  const [validation, setValidation] = useState({});
  useEffect(() => {
    if (isEmpty(details)) {
      setIsValid(false);
    } else {
      const keys = ["date", "clinic", "company", "employees", "ndaUrl"];
      const isValid = keys.every(
        (key) => !isNil(details[key]) && !isEmpty(details[key])
      );
      const vals = keys.map((key) => {
        const valid = !isNil(details[key]) && !isEmpty(details[key]);
        return { [key]: valid };
      });
      setValidation(mergeAll(vals));
      setIsValid(isValid);
    }
  }, [setIsValid, details]);

  const setDetail = (item) => (e) =>
    setDetails({ ...details, [item]: e.target.value });

  const getEmpValue = (item) => {
    return isNil(currentEmployee[item]) ? "" : currentEmployee[item];
  };

  const setEmpDetaill = (item) => (e) => {
    setCurrentEmployee({ ...currentEmployee, [item]: e.target.value });
  };

  const closeEmployeeForm = () => {
    if (isEditingEmployee) {
      setIsEditingEmployee(false);
      const existingEmployee = employees.find(
        (e) => e.id === currentEmployee.id
      );
      const newEmployees = without([existingEmployee], employees);
      setEmployees([...newEmployees, currentEmployee]);
      setCurrentEmployee({});
    } else {
      setIsAddingEmployee(false);
      const newEmployees = [...employees, currentEmployee];
      setEmployees(newEmployees);
      setDetail("employees")({ target: { value: newEmployees } });
      setCurrentEmployee({ id: short.generate() });
    }
  };

  const cancelEmployeeForm = () => {
    setIsAddingEmployee(false);
    setCurrentEmployee({ id: short.generate() });
  };

  const getValue = (item) => {
    return isNil(details[item]) ? "" : details[item];
  };

  const handleSubmit = () => {
    setIsComplete(true);
    const appointment = {
      details,
      usersWhoCanEdit: [],
      usersWhoCanManage: [
        { id: user.id, name: `${user.details.name}  ${user.details.surname}` },
      ],
      payment: {
        hasBeenPaid: false,
        amount: getAmount(employees),
        proofOfPayment: "",
        receipt: "",
      },
      messages: [],
      isVoided: false,
      isComplete: false,
      status: "pending"
    };

    socket.emit("SAVE_NEW_APPOINTMENT", appointment);
  };

  if (isNil(companies) && !isNil(user)) {
    setCompanies([...user.companiesManaging, ...user.companiesCanEdit]);
  }

  const getCompany = (company) => ({
    target: { value: companies.find((c) => c.id === company) },
  });

  const hasCompanies = !isNil(companies) && !isEmpty(companies);
  if (hasCompanies && !details.company) {
    setDetails({ ...details, ["company"]: companies[0] });
  }
  console.log(details);
  return (
    <Container>
      <MainForm>
        {(isAddingEmployee || isEditingEmployee) && (
          <Form>
            <Inputs>
              <Input
                placeholder="name"
                value={getEmpValue("name")}
                onChange={setEmpDetaill("name")}
              />
              <Input
                placeholder="occupation"
                value={getEmpValue("occupation")}
                onChange={setEmpDetaill("occupation")}
              />
              <Input
                placeholder="site"
                value={getEmpValue("site")}
                onChange={setEmpDetaill("site")}
              />
              <Input
                placeholder="comments"
                value={getEmpValue("comments")}
                onChange={setEmpDetaill("comments")}
              />
            </Inputs>
            <InputContainer>
              <Label>Man job spec</Label>
              <Uploader
                title="job spec file"
                onChange={(services) =>
                  setEmpDetaill("jobSpecFile")({ target: { value: services } })
                }
              />
            </InputContainer>
            <Services
              selectedServices={currentEmployee.services}
              onChange={(services) => {
                setEmpDetaill("services")({ target: { value: services } });
              }}
            />
          </Form>
        )}

        {!isComplete &&
          !isAddingEmployee &&
          !isEditingEmployee &&
          hasCompanies && (
            <Form width="90%">
              <FlexContainer>
                {companies && (
                  <InputContainer width="400px">
                    <Label>
                      Company {!validation["company"] && <Span>*</Span>}
                    </Label>
                    <Select
                      onChange={(e) =>
                        setDetail("company")(getCompany(e.target.value))
                      }
                    >
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </Select>
                  </InputContainer>
                )}
                <InputContainer width="400px">
                  <Label>Date {!validation["date"] && <Span>*</Span>}</Label>
                  <Input
                    placeholder="date"
                    type="date"
                    value={getValue("date")}
                    onChange={setDetail("date")}
                  />
                </InputContainer>
                <InputContainer width="400px">
                  <Label>Purchase order number </Label>
                  <Input
                    placeholder="Purchase Order Number"
                    type="purchaseOrderNumber"
                    value={getValue("purchaseOrderNumber")}
                    onChange={setDetail("purchaseOrderNumber")}
                  />
                </InputContainer>
                <InputContainer width="400px">
                  <Label>
                    Clinic {!validation["clinic"] && <Span>*</Span>}
                  </Label>
                  <Select onChange={(e) => setDetail("clinic")(e)}>
                    {CLINIC_LOCATIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </InputContainer>
              </FlexContainer>

              <InputContainer>
                <Label>
                  Non-disclosure agreement{" "}
                  {!validation["ndaUrl"] && <Span>*</Span>}
                </Label>
                <Uploader
                  title="Signed nda"
                  onChange={(services) =>
                    setDetail("ndaUrl")({ target: { value: services } })
                  }
                />
              </InputContainer>
              <InputContainer>
                <Label>
                  Employees {!validation["employees"] && <Span>*</Span>}
                </Label>
                <ol>
                  {employees.map((e) => {
                    console.log("EMPLOYEE", e);
                    return (
                      <Emp>
                        <span>R{getTotal(e.services)} </span> {e.name}
                        <br />
                        <button
                          onClick={() => {
                            setCurrentEmployee(e);
                            setIsEditingEmployee(true);
                          }}
                        >
                          edit
                        </button>
                      </Emp>
                    );
                  })}
                </ol>
                <button onClick={() => setIsAddingEmployee(true)}>
                  Add Employee
                </button>
              </InputContainer>
            </Form>
          )}

        {isComplete && (
          <Complete>
            <h1>Appointment Added</h1>
            <br />
            <FaCalendarCheck size="3em" />
            <br />
          </Complete>
        )}
        {!hasCompanies && (
          <Complete>
            <h1>No company available</h1>
            <br />
            <p>
              You are not managing or editin any company, please add a company
              first.
            </p>
            <br />
          </Complete>
        )}
        {!hasCompanies && (
          <StyledButtonContainer direction="row">
            <Link to="/">
              <button>Cancel</button>
            </Link>
            <Link to="/add-company">
              <button>Add company</button>
            </Link>
          </StyledButtonContainer>
        )}
        {!isAddingEmployee &&
          !isEditingEmployee &&
          !isComplete &&
          hasCompanies && (
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
        {isComplete && (
          <StyledButtonContainer direction="row">
            <Link to="/">
              <button>Close</button>
            </Link>
          </StyledButtonContainer>
        )}
        {(isAddingEmployee || isEditingEmployee) && (
          <StyledButtonContainer direction="row">
            <button onClick={cancelEmployeeForm}>Cancel</button>
            <button onClick={closeEmployeeForm}> Save Employee </button>
          </StyledButtonContainer>
        )}
      </MainForm>
    </Container>
  );
}

export default AddAppointment;
