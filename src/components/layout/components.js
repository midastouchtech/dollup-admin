import styled from "styled-components";
import {
  FaClipboardList,
  FaChartBar,
  FaMoneyCheckAlt,
  FaEnvelope,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaPeopleArrows,
  FaPeopleLine,
  FaCogs,
} from "react-icons/fa";

import { propSatisfies } from "ramda";
import { useNavigate } from "react-router-dom";
import { Fragment } from "react";
import { BsCardChecklist, BsPeopleFill } from "react-icons/bs";
import { GiOfficeChair } from "react-icons/gi";
import { MdManageAccounts} from "react-icons/md";
const iconMap = {
  list: BsCardChecklist,
  vendors: FaPeopleArrows,
  money: BsPeopleFill,
  envelope: GiOfficeChair,
  settings: FaCog,
  logout: FaCogs,
  bell: MdManageAccounts,
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
  margin-right: 15px;
  svg {
    fill: #fff;
  }
`;

const StyledLi = styled.li`
cursor: pointer;
  color: #8391a2 !important;
  background: transparent !important;
  border: none !important;
  &:hover {
    color: #fff !important;
    border-radius: 5px;
    background: #515f722b !important;
  }
  &.selected {
    background: #515f722b !important;
    border-radius: 5px;
    color: #fff !important;
  }
  p {
    margin: 0 !important;
  }
`;

const Container = styled.div`
  display:flex;
  justify-content: space-tweeen;
  align-items: center;
`;

export function ListItemIcon({ icon, ...rest }) {
  const Icon = iconMap[icon];
  return (
    <IconContainer>
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
          <Container>
            <ListItemIcon icon={icon} />
            {title}
          </Container>
        </StyledLi>
      )}
      {external && (
        <StyledLi
          className={`list-group-item list-group-item-action list-group-item-dark py-2 ripple ${
            isActive ? "selected" : ""
          }`}
        >
          <a href={link} target="_blank" rel="noreferrer">
            <Container>
              {iconMap[icon]}
              {title}
            </Container>
          </a>
        </StyledLi>
      )}
    </Fragment>
  );
}
