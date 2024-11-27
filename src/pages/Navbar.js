import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
const NavbarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.1); 
  backdrop-filter: blur(10px); 
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
  padding: 10px 20px;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
`;
const NavLinks = styled.div`
  display: flex;
  gap: 20px;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 18px;
  font-weight: 500;
  &:hover {
    color: #ff9800;
  }
`;
const Navbar = () => {
  return (
    <NavbarContainer>
      <NavLinks>
      <h1 style={{ color: 'white' }}>Role Based Access Control</h1>
        
      </NavLinks>
    </NavbarContainer>
  );
};

export default Navbar;
