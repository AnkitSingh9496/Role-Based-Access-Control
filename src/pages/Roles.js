import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import Navbar from './Navbar';

const RolesContainer = styled.div`
  padding: 20px;
`;

const RolesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

const RolesTableHeader = styled.th`
  background: #282c34;
  color: white;
  padding: 10px;
`;

const RolesTableCell = styled.td`
  border: 1px solid #ddd;
  padding: 10px;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
`;

const Button = styled.button`
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px;
`;

const EditButton = styled.button`
  padding: 8px 16px;
  background-color: #ff9800;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 8px;
`;

const DeleteButton = styled.button`
  padding: 8px 16px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const AddRoleButton = styled(Button)`
  background-color: #007bff;
`;

const Roles = () => {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRole, setCurrentRole] = useState({ roleName: '', description: '', permissions: '' });
  const [roles, setRoles] = useState([
    { roleName: 'Admin', description: 'Full system access', permissions: 'users.read, users.write, users.delete, roles.read, roles.write, roles.delete' },
    { roleName: 'User', description: 'Basic access', permissions: 'users.read, roles.read' },
  ]);

  const handleAddOrEditRole = () => {
    if (editMode) {
      setRoles(roles.map(role => (role.roleName === currentRole.roleName ? currentRole : role)));
    } else {
      setRoles([...roles, currentRole]);
    }
    setShowModal(false);
    setCurrentRole({ roleName: '', description: '', permissions: '' });
    setEditMode(false);
  };

  const handleEditClick = (role) => {
    setCurrentRole(role);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDeleteClick = (roleName) => {
    setRoles(roles.filter(role => role.roleName !== roleName));
  };

  return (
    <RolesContainer>
      <Navbar />
      <h1>Role Management</h1>
      <AddRoleButton onClick={() => { setShowModal(true); setEditMode(false); }}>Add Role</AddRoleButton>

      {showModal && (
        <Modal>
          <ModalContent>
            <h2>{editMode ? 'Edit Role' : 'Add Role'}</h2>
            <Input
              type="text"
              placeholder="Role Name"
              value={currentRole.roleName}
              onChange={(e) => setCurrentRole({ ...currentRole, roleName: e.target.value })}
            />
            <Input
              type="text"
              placeholder="Description"
              value={currentRole.description}
              onChange={(e) => setCurrentRole({ ...currentRole, description: e.target.value })}
            />
            <Input
              type="text"
              placeholder="Permissions (comma separated)"
              value={currentRole.permissions}
              onChange={(e) => setCurrentRole({ ...currentRole, permissions: e.target.value })}
            />
            <div>
              <Button onClick={handleAddOrEditRole}>{editMode ? 'Update' : 'Submit'}</Button>
              <Button onClick={() => setShowModal(false)} style={{ backgroundColor: '#ccc' }}>Cancel</Button>
            </div>
          </ModalContent>
        </Modal>
      )}

      <RolesTable>
        <thead>
          <tr>
            <RolesTableHeader>Role Name</RolesTableHeader>
            <RolesTableHeader>Description</RolesTableHeader>
            <RolesTableHeader>Permissions</RolesTableHeader>
            <RolesTableHeader>Actions</RolesTableHeader>
          </tr>
        </thead>
        <tbody>
          {roles.map(role => (
            <tr key={role.roleName}>
              <RolesTableCell>{role.roleName}</RolesTableCell>
              <RolesTableCell>{role.description}</RolesTableCell>
              <RolesTableCell>{role.permissions}</RolesTableCell>
              <RolesTableCell>
                <EditButton onClick={() => handleEditClick(role)}>Edit</EditButton>
                <DeleteButton onClick={() => handleDeleteClick(role.roleName)}>Delete</DeleteButton>
              </RolesTableCell>
            </tr>
          ))}
        </tbody>
      </RolesTable>
    </RolesContainer>
  );
};
export default Roles;


