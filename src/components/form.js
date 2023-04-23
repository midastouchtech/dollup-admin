import styled from "styled-components";




export const Input = styled.input`
    margin-top: 10px;
    padding: 15px;
    border: 1px solid #80808052;
    box-shadow: -2px 3px 7px 1px #cfcfcfb5;
    border-radius: 5px;
    background: #dddddd;
    font-size: 14px;
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: ${props => props.justify || "center"};
  align-items: center;
  width: 100%;
  margin-top: 10px;
  flex-direction: ${props => props.direction || "column"};

`;

export const Form = styled.div`
  display: flex;
  flex-direction: column;
  width:${props => props.width || "60%"};
  height: 100%;
  justify-content: space-evenly;
  ${ButtonContainer}{
    background: gold;
  }
`;