import styled from "styled-components";
import {
  FaClipboardList,
  FaChartBar,
  FaMoneyCheckAlt,
  FaEnvelope,
  FaCog,
  FaSignOutAlt,
  FaBell,
} from "react-icons/fa";
import { propSatisfies } from "ramda";
import { useNavigate } from "react-router-dom";
import { Fragment } from "react";

const iconMap = {
  list: FaClipboardList,
  chart: FaChartBar,
  money: FaMoneyCheckAlt,
  envelope: FaEnvelope,
  settings: FaCog,
  logout: FaSignOutAlt,
  bell: FaBell,
};

const ListItem = styled.li`
  list-style: none;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 15px;
  transtion: all 0.25s ease-in-out;
  padding: 5px 15px;
  margin-left: -15px;
  cursor: pointer;
  &:hover {
    background: #0f0f16;
    margin-right: -100px;
    padding: 5px 15px;
    border-top-left-radius: 10px;
    margin-left: -15px;
    border-bottom-left-radius: 10px;
    transition: padding 0.25s ease-in-out;
  }
  &.selected {
    background: #0f0f16;
    margin-right: -100px;
    padding: 5px 15px;
    border-top-left-radius: 10px;
    margin-left: -15px;
    border-bottom-left-radius: 10px;
    transition: padding 0.25s ease-in-out;
  }
`;

const IconContainer = styled.div`
  width: 44px;
  height: 44px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${(props) => props.color || "#1F1F2B"};
  border-radius: 100px;
  margin-right: 15px;
  svg {
    fill: ${(props) => props.fill || "#848484"};
  }
`;

const StyledLi = styled.li`
  border: none !important;
  background: transparent !important;
  color: #fff !important;
  border-bottom: 1px solid #fff !important;
 
  &:hover {
    background: orange !important;
  }
  a{
    color: #fff !important;
    
  }
  &.selected{
    background: #5a094e !important;
  }
  p{
    margin: 0 !important;
  }
`;

export function ListItemIcon({ icon, ...rest }) {
  const Icon = iconMap[icon];
  return (
    <IconContainer {...rest}>
      <Icon />
    </IconContainer>
  );
}

export function NavItem({ icon, title, link, isActive, external }) {
  const navigate = useNavigate();
  const gotuUrl = () => {
    if (typeof window !== "undefined") {
      navigate(link);
    }
  };
  return (
    <Fragment>
        {!external && (
            <StyledLi
            className={`list-group-item list-group-item-action list-group-item-dark py-2 ripple ${
              isActive ? "selected" : ""
            }`}
            onClick={() => gotuUrl()}
          >
            <p>{title}</p>
          </StyledLi>
        )}
        {external && (
            <StyledLi
            className={`list-group-item list-group-item-action list-group-item-dark py-2 ripple ${
              isActive ? "selected" : ""
            }`}
            
          >
            <a href={link} target="_blank" rel="noreferrer"><p>{title}</p></a>
          </StyledLi>
        )}
    </Fragment>
  );
}
