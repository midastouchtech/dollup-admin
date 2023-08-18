import React, { useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../store/user";

import { Link } from "react-router-dom";
import { isNil, isEmpty } from "ramda";
import styled from "styled-components";
import { assoc } from "ramda";
import moment from "moment";
import { ButtonContainer } from "../components/form";

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  height: 100%;
  flex-direction: column;
`;

export const Row = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex-direction: row;
  align-items: flex-start;
  overflow: hidden;
  width: 100%;
  height: 100%;
  padding: 20px;
`;

export const FullPane = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  height: 100%;
  button {
    background: #b77f0b;
    border: 0;
    height: 25px;
    color: #ffffff;
    text-transform: capitalize;
    border-radius: 5px;
    box-shadow: 1px 1px 10px 1px #0000001f;
    width: 100px !important;
    margin-top: 10px;
  }
  table {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 1px solid #666;
    border-collapse: collapse;
    thead {
      border: 1px solid #666;
      th {
        border: 1px solid #666;
      }
    }
    tr {
      td {
        border: 1px solid #666;
        text-align: center;
        a {
          color: #fff;
          background: #b77f0b;
          padding-left: 10px;
          padding-right: 10px;
          border-radius: 8px;
          font-size: 12px;
          cursor: pointer;
          &:hover {
            background: #c3a059;
            box-shadow: 1px 1px 3px 0px #0000007a;
          }
          &.disabled {
            background: #666;
            cursor: not-allowed;
          }
        }
      }
    }
  }
`;

const Message = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  background: #f3f5e8;
  border-radius: 5px;
  overflow: hidden;
  margin: 10px;
  width: 400px;
`;

const MessageBody = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 2px 10px;
  font-size: 12px;
`;

const MessageFooter = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 2px 10px;
  background: #d3d3d340;

  font-size: 9px;

  div {
    margin-right: 10px;
  }
`;

const MessageWriterContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 90%;
`;

const MessageWriter = styled.textarea`
  border: 1px solid grey;
  padding: 10px;
  border-radius: 5px;
  text-align: left;
  rows: 5;
  width: 80%;
`;

const MessagesContainer = styled.div`
  height: 70%;
  overflow-y: scroll;
  width: 90%;
  .left {
    margin-left: 450px;
  }
`;

const ButtonSContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 210px;
  justify-content: space-around;
`;

function Payments({ socket }) {
  const user = useSelector(selectUser).data;
  const [messageToSend, setMessageToSend] = useState("");

  const { messages } = user;
  const exists = (i) => !isNil(i) && !isEmpty(i);

  const onChange = (e) => {
    setMessageToSend(e.target.value);
  };

  const isCurrentUser = (author) => {
    return author.id === user.id;
  };

  const sendMessage = (url) => {
    setMessageToSend("");
    const appMessages = user.messages;
    console.log("App messaes", appMessages);
    const newMessages = [
      ...appMessages,
      {
        message: messageToSend,
        author: {
          id: user.id,
          name: user.details.name + " " + user.details.surname,
        },
        createdAt: new Date(),
      },
    ];
    console.log({
      id: user.id,
      messages: newMessages,
    });
    socket.emit("UPDATE_USER", {
      id: user.id,
      messages: newMessages,
    });
  };

  return (
    <Row className="row">
      <FullPane>
        <Container>
          <MessagesContainer>
            {exists(messages) &&
              messages.map((message, index) => (
                <Message
                  key={index}
                  className={isCurrentUser(message.author) ? "right" : "left"}
                >
                  <MessageBody>{message.message}</MessageBody>
                  <MessageFooter>
                    <div>{moment(message.createdAt).fromNow()}</div>
                    <div>{message.author.name}</div>
                  </MessageFooter>
                </Message>
              ))}
          </MessagesContainer>
          <MessageWriterContainer>
            <MessageWriter onChange={onChange} value={messageToSend} />

            <ButtonSContainer>
              <button onClick={sendMessage}>Send</button>
            </ButtonSContainer>
          </MessageWriterContainer>
        </Container>
      </FullPane>
    </Row>
  );
}

export default Payments;
