import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { api } from '../api/mockApi'; 
import { initialUsers } from '../api/mockData'; 
import Navbar from './Navbar'; 

const UsersContainer = styled.div`
  padding: 20px;
`;

const UserTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

const UserTableHeader = styled.th`
  background: #282c34;
  color: white;
  padding: 10px;
`;

const UserTableCell = styled.td`
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
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SearchContainer = styled.div`
  display: flex;
  justify-content: center;
  flex: 1;
`;

const SearchInput = styled.input`
  padding: 8px;
  width: 50%;
  margin-left: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const AddUserButton = styled.button`
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const EditButton = styled.button`
  padding: 8px 16px;
  background-color: #ff9800; /* Orange color for edit */
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 8px;
`;

const DeleteButton = styled.button`
  padding: 8px 16px;
  background-color: #f44336; /* Red color for delete */
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const FormRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  gap: 20px; /* Add space between form elements */
`;

const FormInput = styled.input`
  padding: 8px;
  width: 200px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const FormSelect = styled.select`
  padding: 8px;
  width: 200px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const Users = () => {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState({ id: null, username: '', email: '', role: 'User', status: 'Active' });
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.getUsers(); 
      setUsers(response);
      updateUserCounts(response); 
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []); 

  const initializeUserCounts = () => {
    const activeCount = initialUsers.filter(user => user.status === 'Active').length;
    setActiveUsers(activeCount);
    setTotalUsers(initialUsers.length); 
  };

  const updateUserCounts = (usersList) => {
    setTotalUsers(usersList.length); 
    const activeCount = usersList.filter(user => user.status === 'Active').length; 
    setActiveUsers(activeCount);
  };

  useEffect(() => {
    initializeUserCounts(); 
    fetchUsers();
  }, [fetchUsers]); 

  const handleAddOrEditUser = async () => {
    if (!currentUser.username || !currentUser.email || !currentUser.role || !currentUser.status) {
      alert('All fields are required.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(currentUser.email)) {
      alert('Please enter a valid email address.');
      return;
    }

    try {
      if (editMode) {
        await api.updateUser(currentUser.id, currentUser); 
      } else {
        await api.createUser(currentUser); 
      }
      fetchUsers(); 
      setShowModal(false);
      setCurrentUser({ id: null, username: '', email: '', role: 'User', status: 'Active' });
      setEditMode(false);
    } catch (error) {
      console.error('Error adding/updating user:', error);
      alert('There was an error saving the user. Please try again.');
    }
  };

  const handleEditClick = (user) => {
    setCurrentUser(user); 
    setEditMode(true);
    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
    try {
      const deletedUser = users.find(user => user.id === id);
      await api.deleteUser(id); 
      fetchUsers(); 
      if (deletedUser && deletedUser.status === 'Active') {
        setActiveUsers(activeUsers - 1); 
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('There was an error deleting the user. Please try again.');
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.username?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.role?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <UsersContainer>
      <Navbar />
      <h1>User Management</h1>
      <div>
        <h3>Total Users: {totalUsers}</h3>
      </div>

      <HeaderContainer>
        <AddUserButton onClick={() => { setShowModal(true); setEditMode(false); }}>
          Add User
        </AddUserButton>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
      </HeaderContainer>

      {showModal && (
        <Modal>
          <ModalContent>
            <h2>{editMode ? 'Edit User' : 'Add User'}</h2>
            <FormRow>
              <FormInput
                type="text"
                placeholder="Username"
                value={currentUser.username}
                onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })}
              />
              <FormInput
                type="email"
                placeholder="Email"
                value={currentUser.email}
                onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
              />
              <FormSelect
                value={currentUser.role}
                onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </FormSelect>
              <FormSelect
                value={currentUser.status}
                onChange={(e) => setCurrentUser({ ...currentUser, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </FormSelect>
            </FormRow>
            <ButtonContainer>
              <button onClick={handleAddOrEditUser}>
                {editMode ? 'Update' : 'Submit'}
              </button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </ButtonContainer>
          </ModalContent>
        </Modal>
      )}
      <UserTable>
        <thead>
          <tr>
            <UserTableHeader>Username</UserTableHeader>
            <UserTableHeader>Email</UserTableHeader>
            <UserTableHeader>Role</UserTableHeader>
            <UserTableHeader>Status</UserTableHeader>
            <UserTableHeader>Actions</UserTableHeader>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <UserTableCell>{user.username}</UserTableCell>
              <UserTableCell>{user.email}</UserTableCell>
              <UserTableCell>{user.role}</UserTableCell>
              <UserTableCell>{user.status}</UserTableCell>
              <UserTableCell>
                <EditButton onClick={() => handleEditClick(user)}>Edit</EditButton>
                <DeleteButton onClick={() => handleDeleteClick(user.id)}>Delete</DeleteButton>
              </UserTableCell>
            </tr>
          ))}
        </tbody>
      </UserTable>
    </UsersContainer>
  );
};

export default Users;




