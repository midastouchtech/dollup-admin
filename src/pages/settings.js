import { isEmpty, isNil } from "ramda";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { save, selectUser } from "../store/user";
import Uploader from "./nda";


const ImageContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Image = styled.div`
  border-radius: 100px;
  width: 95px;
  height: 95px;
  border: 3px solid #758ac0;
  background: url(${(props) => props.path});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

export const Input = styled.input`
  margin-top: 10px;
  padding: 15px;
  border: 1px solid #80808052;
  box-shadow: -2px 3px 7px 1px #cfcfcfb5;
  border-radius: 5px;
  background: #dddddd;
  font-size: 14px;
`;

export const InputContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 50%;
  margin-top: 10px;
  flex-direction: column;
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

const UpdateMessage = styled.small`
  position: absolute;
  margin-top: -200px;
  background: #8080805c;
  border-radius: 10px;
  padding: 15px;
  font-weight: 200;
  bottom: 100px;
  right: 20px;
  p {
    padding: 0;
    margin: 0;
  }
  transition: all 0.5s ease-out;
`;

const exists = (i) => !isNil(i) && !isEmpty(i);

function App({ socket }) {
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const [details, setDetails] = useState({});
  const [isComplete, setIsComplete] = useState(false);

  const user = useSelector(selectUser).data;
  const [ newUser, setNewUser ] = useState(user)

  useEffect(() => {
    if (exists(user)) {
      setDetails(user.details);
    }
  }, [user]);

  const setDetail = (id) => (e) => {
    console.log("setting", id, e.target.value);
    setDetails({ ...details, [id]: e.target.value });
  };

  const setUserDetail = (id) => (e) => {
    console.log("setting", id, e.target.value);
    setNewUser({ ...newUser, [id]: e.target.value });
  };

  const saveUser = () => {
    setIsComplete(true);
    const updatedUser = { ...newUser, details };
    dispatch(save(updatedUser));
    socket.emit("UPDATE_USER", updatedUser);
    socket.on("DATABASE_UPDATED", (u) => {
      socket.emit("GET_USER", { id: updatedUser.id });
    });
    socket.on("RECEIVE_USER", (u) => {
      console.log("SETTINS received user from db", u, "state user", user);
      dispatch(save(u));
    });
    setTimeout(() => {
      setIsComplete(false);
    }, 1000);
  };

  console.log(user);

  return (
    <div className="container" id="appElement">
       <div className="row">
            <div className="col-md-12 text-center mb-3">
              <button className="btn btn-warning" onClick={saveUser}>Save</button>
            </div>
          </div>
      <div className="row">
        <div className="col-md-12">
          <div className="d-flex flex-column align-items-center">
            <div className="d-flex flex-column align-items-center">
              <h5 clasName="card-title">Profile Picture</h5>
              {exists(user) && exists(details.picture) && (
                <ImageContainer>
                  <Image path={details.picture} />
                </ImageContainer>
              )}
              {exists(user) && !exists(details.picture) && (
                <ImageContainer>
                  <Image path="/assets/man.png" />
                </ImageContainer>
              )}
              <br />
              <p> Upload profile picture </p>
              <br />
              <Uploader
                title="profile picture"
                onChange={(url) =>
                  setDetail("picture")({ target: { value: url } })
                }
              />
            </div>
          </div>

          <div clasName="row">
            <div className="col-md-12">
              <div className="card">
                <div className="card-body">
                  <h3 className="card-title">Details</h3>
                  <form>
                  <div className="form-group ml-2 mr-2 row">
                      <label class="col-sm-4 col-form-label">Username</label>
                      <input
                        className="col-sm-8 form-control input-default"
                        placeholder="surname"
                        disabled
                        value={user.id}
                        onChange={setDetail("surname")}
                      />
                    </div>
                    <div className="form-group ml-2 mr-2 row">
                      <label class="col-sm-4 col-form-label">Name</label>
                      <input
                        className="col-sm-8 form-control input-default"
                        placeholder="name"
                        value={details.name}
                        disabled
                        onChange={setDetail("name")}
                      />
                    </div>
                    <div className="form-group ml-2 mr-2 row">
                      <label class="col-sm-4 col-form-label">Surname</label>
                      <input
                        className="col-sm-8 form-control input-default"
                        placeholder="surname"
                        disabled
                        value={details.surname}
                        onChange={setDetail("surname")}
                      />
                    </div>
                    <div className="form-group ml-2 mr-2 row">
                      <label class="col-sm-4 col-form-label">Password</label>
                      <input
                        className="col-sm-8 form-control input-default"
                        placeholder="surname"
                        value={newUser.password}
                        onChange={setUserDetail("password")}
                      />
                    </div>
                    
                    <div className="form-group ml-2 mr-2 row">
                      <label class="col-sm-4 col-form-label">Email</label>
                      <input
                        className="col-sm-8 form-control input-default"
                        placeholder="email"
                        value={details.email}
                        onChange={setDetail("email")}
                      />
                    </div>
                    <div className="form-group ml-2 mr-2 row">
                      <label class="col-sm-4 col-form-label">
                        Cellphone Number
                      </label>
                      <input
                        className="col-sm-8 form-control input-default"
                        placeholder="cell"
                        value={details.cell}
                        onChange={setDetail("cell")}
                      />
                    </div>
                    {isComplete && (
                      <UpdateMessage>
                        <p>Details Saved! </p>
                      </UpdateMessage>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
         
        </div>
      </div>
    </div>
  );
}

export default App;
