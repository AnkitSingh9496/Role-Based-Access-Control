import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { api } from '../api/mockApi'; // Correct API import
import { initialUsers } from '../api/mockData'; // Import initial users from mockData
import Navbar from './Navbar'; // Import the Navbar component

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

  // Fetch users from the API and update counts
  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.getUsers(); // Correct API usage
      setUsers(response);
      updateUserCounts(response); // Update counts when fetching users
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []); // Empty dependency array, only re-run on mount

  // Initialize active users count from initial data in mockData.js
  const initializeUserCounts = () => {
    const activeCount = initialUsers.filter(user => user.status === 'Active').length;
    setActiveUsers(activeCount);
    setTotalUsers(initialUsers.length); // Total number of users
  };

  // Update the counts based on the current users data
  const updateUserCounts = (usersList) => {
    setTotalUsers(usersList.length); // Update total users count
    const activeCount = usersList.filter(user => user.status === 'Active').length; // Count active users
    setActiveUsers(activeCount);
  };

  useEffect(() => {
    initializeUserCounts(); // Set initial active users count
    fetchUsers();
  }, [fetchUsers]); // Add fetchUsers to the dependency array

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
        await api.updateUser(currentUser.id, currentUser); // Use `id` to update user
      } else {
        await api.createUser(currentUser); // Create user and pass the full user data
      }
      fetchUsers(); // Refresh the user list
      setShowModal(false);
      setCurrentUser({ id: null, username: '', email: '', role: 'User', status: 'Active' });
      setEditMode(false);
    } catch (error) {
      console.error('Error adding/updating user:', error);
      alert('There was an error saving the user. Please try again.');
    }
  };

  // Edit user
  const handleEditClick = (user) => {
    setCurrentUser(user); // Pass full user object (including `id`)
    setEditMode(true);
    setShowModal(true);
  };

  // Delete user and update counts
  const handleDeleteClick = async (id) => {
    try {
      const deletedUser = users.find(user => user.id === id);
      await api.deleteUser(id); // Correctly pass `id` to delete user
      fetchUsers(); // Refresh the user list after deletion
      if (deletedUser && deletedUser.status === 'Active') {
        setActiveUsers(activeUsers - 1); // Decrease active count if the deleted user was active
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('There was an error deleting the user. Please try again.');
    }
  };

  // Filter users based on search term
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

      {/* Dashboard Stats */}
      <div>
        <h3>Total Users: {totalUsers}</h3>
        {/* <h3>Active Users: {activeUsers}</h3> */}
      </div>

      {/* Header with Search and Add User Button */}
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

      {/* Modal for Adding/Editing User */}
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

      {/* Table of Users */}
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





// import React, { useState, useEffect, useCallback } from 'react';
// import styled from 'styled-components';
// import { api } from '../api/mockApi'; // Correct API import
// import { initialUsers } from '../api/mockData'; // Import initial users from mockData
// import Navbar from './Navbar'; // Import the Navbar component

// const UsersContainer = styled.div`
//   padding: 20px;
// `;

// const UserTable = styled.table`
//   width: 100%;
//   border-collapse: collapse;
//   margin-top: 20px;
// `;

// const UserTableHeader = styled.th`
//   background: #282c34;
//   color: white;
//   padding: 10px;
// `;

// const UserTableCell = styled.td`
//   border: 1px solid #ddd;
//   padding: 10px;
// `;

// const Modal = styled.div`
//   position: fixed;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   background: rgba(0, 0, 0, 0.5);
//   display: flex;
//   justify-content: center;
//   align-items: center;
// `;

// const ModalContent = styled.div`
//   background: white;
//   padding: 20px;
//   border-radius: 8px;
//   width: 100%;
//   max-width: 800px;
//   display: flex;
//   flex-direction: column;
// `;

// const HeaderContainer = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   margin-bottom: 20px;
// `;

// const SearchContainer = styled.div`
//   display: flex;
//   justify-content: center;
//   flex: 1;
// `;

// const SearchInput = styled.input`
//   padding: 8px;
//   width: 50%;
//   margin-left: 20px;
//   border: 1px solid #ccc;
//   border-radius: 5px;
// `;

// const AddUserButton = styled.button`
//   padding: 8px 16px;
//   background-color: #4caf50;
//   color: white;
//   border: none;
//   border-radius: 5px;
//   cursor: pointer;
// `;

// const EditButton = styled.button`
//   padding: 8px 16px;
//   background-color: #ff9800; /* Orange color for edit */
//   color: white;
//   border: none;
//   border-radius: 5px;
//   cursor: pointer;
//   margin-right: 8px;
// `;

// const DeleteButton = styled.button`
//   padding: 8px 16px;
//   background-color: #f44336; /* Red color for delete */
//   color: white;
//   border: none;
//   border-radius: 5px;
//   cursor: pointer;
// `;

// const FormRow = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   margin-bottom: 15px;
// `;

// const FormInput = styled.input`
//   padding: 8px;
//   margin-right: 15px;
//   width: 200px;
//   border: 1px solid #ccc;
//   border-radius: 5px;
// `;

// const FormSelect = styled.select`
//   padding: 8px;
//   margin-right: 15px;
//   width: 200px;
//   border: 1px solid #ccc;
//   border-radius: 5px;
// `;

// const ButtonContainer = styled.div`
//   display: flex;
//   justify-content: flex-end;
//   gap: 10px;
// `;

// const Users = () => {
//   const [showModal, setShowModal] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [currentUser, setCurrentUser] = useState({ id: null, username: '', email: '', role: 'User', status: 'Active' });
//   const [users, setUsers] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [totalUsers, setTotalUsers] = useState(0);
//   const [activeUsers, setActiveUsers] = useState(0);

//   // Fetch users from the API and update counts
//   const fetchUsers = useCallback(async () => {
//     try {
//       const response = await api.getUsers(); // Correct API usage
//       setUsers(response);
//       updateUserCounts(response); // Update counts when fetching users
//     } catch (error) {
//       console.error('Error fetching users:', error);
//     }
//   }, []); // Empty dependency array, only re-run on mount

//   // Initialize active users count from initial data in mockData.js
//   const initializeUserCounts = () => {
//     const activeCount = initialUsers.filter(user => user.status === 'Active').length;
//     setActiveUsers(activeCount);
//     setTotalUsers(initialUsers.length); // Total number of users
//   };

//   // Update the counts based on the current users data
//   const updateUserCounts = (usersList) => {
//     setTotalUsers(usersList.length); // Update total users count
//     const activeCount = usersList.filter(user => user.status === 'Active').length; // Count active users
//     setActiveUsers(activeCount);
//   };

//   useEffect(() => {
//     initializeUserCounts(); // Set initial active users count
//     fetchUsers();
//   }, [fetchUsers]); // Add fetchUsers to the dependency array

//   const handleAddOrEditUser = async () => {
//     if (!currentUser.username || !currentUser.email || !currentUser.role || !currentUser.status) {
//       alert('All fields are required.');
//       return;
//     }

//     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailPattern.test(currentUser.email)) {
//       alert('Please enter a valid email address.');
//       return;
//     }

//     try {
//       if (editMode) {
//         await api.updateUser(currentUser.id, currentUser); // Use `id` to update user
//       } else {
//         await api.createUser(currentUser); // Create user and pass the full user data
//       }
//       fetchUsers(); // Refresh the user list
//       setShowModal(false);
//       setCurrentUser({ id: null, username: '', email: '', role: 'User', status: 'Active' });
//       setEditMode(false);
//     } catch (error) {
//       console.error('Error adding/updating user:', error);
//       alert('There was an error saving the user. Please try again.');
//     }
//   };

//   // Edit user
//   const handleEditClick = (user) => {
//     setCurrentUser(user); // Pass full user object (including `id`)
//     setEditMode(true);
//     setShowModal(true);
//   };

//   // Delete user and update counts
//   const handleDeleteClick = async (id) => {
//     try {
//       const deletedUser = users.find(user => user.id === id);
//       await api.deleteUser(id); // Correctly pass `id` to delete user
//       fetchUsers(); // Refresh the user list after deletion
//       if (deletedUser && deletedUser.status === 'Active') {
//         setActiveUsers(activeUsers - 1); // Decrease active count if the deleted user was active
//       }
//     } catch (error) {
//       console.error('Error deleting user:', error);
//       alert('There was an error deleting the user. Please try again.');
//     }
//   };

//   // Filter users based on search term
//   const filteredUsers = users.filter(
//     (user) =>
//       (user.username?.toLowerCase().includes(searchTerm.toLowerCase())) ||
//       (user.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
//       (user.role?.toLowerCase().includes(searchTerm.toLowerCase()))
//   );

//   return (
//     <UsersContainer>
//       <Navbar />

//       <h1>User Management</h1>

//       {/* Dashboard Stats */}
//       <div>
//         <h3>Total Users: {totalUsers}</h3>
//         {/* <h3>Active Users: {activeUsers}</h3> */}
//       </div>

//       {/* Header with Search and Add User Button */}
//       <HeaderContainer>
//         <AddUserButton onClick={() => { setShowModal(true); setEditMode(false); }}>
//           Add User
//         </AddUserButton>
//         <SearchContainer>
//           <SearchInput
//             type="text"
//             placeholder="Search users..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </SearchContainer>
//       </HeaderContainer>

//       {/* Modal for Adding/Editing User */}
//       {showModal && (
//         <Modal>
//           <ModalContent>
//             <h2>{editMode ? 'Edit User' : 'Add User'}</h2>
//             <FormRow>
//               <FormInput
//                 type="text"
//                 placeholder="Username"
//                 value={currentUser.username}
//                 onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })}
//               />
//               <FormInput
//                 type="email"
//                 placeholder="Email"
//                 value={currentUser.email}
//                 onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
//               />
//             </FormRow>

//             <FormRow>
//               <FormSelect
//                 value={currentUser.role}
//                 onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
//               >
//                 <option value="User">User</option>
//                 <option value="Admin">Admin</option>
//               </FormSelect>

//               <FormSelect
//                 value={currentUser.status}
//                 onChange={(e) => setCurrentUser({ ...currentUser, status: e.target.value })}
//               >
//                 <option value="Active">Active</option>
//                 <option value="Inactive">Inactive</option>
//               </FormSelect>
//             </FormRow>

//             {/* Buttons for Submit and Cancel */}
//             <ButtonContainer>
//               <button onClick={handleAddOrEditUser}>{editMode ? 'Update' : 'Submit'}</button>
//               <button onClick={() => setShowModal(false)}>Cancel</button>
//             </ButtonContainer>
//           </ModalContent>
//         </Modal>
//       )}

//       {/* User Table */}
//       <UserTable>
//         <thead>
//           <tr>
//             <UserTableHeader>Username</UserTableHeader>
//             <UserTableHeader>Email</UserTableHeader>
//             <UserTableHeader>Role</UserTableHeader>
//             <UserTableHeader>Status</UserTableHeader>
//             <UserTableHeader>Actions</UserTableHeader>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredUsers.map((user) => (
//             <tr key={user.id}>
//               <UserTableCell>{user.username}</UserTableCell>
//               <UserTableCell>{user.email}</UserTableCell>
//               <UserTableCell>{user.role}</UserTableCell>
//               <UserTableCell>{user.status}</UserTableCell>
//               <UserTableCell>
//                 <EditButton onClick={() => handleEditClick(user)}>Edit</EditButton>
//                 <DeleteButton onClick={() => handleDeleteClick(user.id)}>Delete</DeleteButton>
//               </UserTableCell>
//             </tr>
//           ))}
//         </tbody>
//       </UserTable>
//     </UsersContainer>
//   );
// };

// export default Users;






// import React, { useState, useEffect } from 'react';
// import styled from 'styled-components';
// import { api } from '../api/mockApi'; // Ensure correct API import
// import Navbar from './Navbar'; // Import the Navbar component

// const UsersContainer = styled.div`
//   padding: 20px;
// `;

// const UserTable = styled.table`
//   width: 100%;
//   border-collapse: collapse;
//   margin-top: 20px;
// `;

// const UserTableHeader = styled.th`
//   background: #282c34;
//   color: white;
//   padding: 10px;
// `;

// const UserTableCell = styled.td`
//   border: 1px solid #ddd;
//   padding: 10px;
// `;

// const Modal = styled.div`
//   position: fixed;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   background: rgba(0, 0, 0, 0.5);
//   display: flex;
//   justify-content: center;
//   align-items: center;
// `;

// const ModalContent = styled.div`
//   background: white;
//   padding: 20px;
//   border-radius: 8px;
//   width: 100%;
//   max-width: 800px;
//   display: flex;
//   flex-direction: column;
// `;

// const HeaderContainer = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   margin-bottom: 20px;
// `;

// const SearchContainer = styled.div`
//   display: flex;
//   justify-content: center;
//   flex: 1;
// `;

// const SearchInput = styled.input`
//   padding: 8px;
//   width: 50%;
//   margin-left: 20px;
//   border: 1px solid #ccc;
//   border-radius: 5px;
// `;

// const AddUserButton = styled.button`
//   padding: 8px 16px;
//   background-color: #4caf50;
//   color: white;
//   border: none;
//   border-radius: 5px;
//   cursor: pointer;
// `;

// const EditButton = styled.button`
//   padding: 8px 16px;
//   background-color: #ff9800; /* Orange color for edit */
//   color: white;
//   border: none;
//   border-radius: 5px;
//   cursor: pointer;
//   margin-right: 8px;
// `;

// const DeleteButton = styled.button`
//   padding: 8px 16px;
//   background-color: #f44336; /* Red color for delete */
//   color: white;
//   border: none;
//   border-radius: 5px;
//   cursor: pointer;
// `;

// const FormRow = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   margin-bottom: 15px;
// `;

// const FormInput = styled.input`
//   padding: 8px;
//   margin-right: 15px;
//   width: 200px;
//   border: 1px solid #ccc;
//   border-radius: 5px;
// `;

// const FormSelect = styled.select`
//   padding: 8px;
//   margin-right: 15px;
//   width: 200px;
//   border: 1px solid #ccc;
//   border-radius: 5px;
// `;

// const ButtonContainer = styled.div`
//   display: flex;
//   justify-content: flex-end;
//   gap: 10px;
// `;

// const Users = () => {
//   const [showModal, setShowModal] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [currentUser, setCurrentUser] = useState({ username: '', email: '', role: 'User', status: 'Active' });
//   const [users, setUsers] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [totalUsers, setTotalUsers] = useState(0);
//   const [activeUsers, setActiveUsers] = useState(0);

//   const fetchUsers = async () => {
//     try {
//       const response = await api.getUsers(); // Correct API usage
//       setUsers(response);
//       updateUserCounts(response); // Update counts when fetching users
//     } catch (error) {
//       console.error('Error fetching users:', error);
//     }
//   };

//   const updateUserCounts = (usersList) => {
//     setTotalUsers(usersList.length); // Total users count
//     const activeCount = usersList.filter(user => user.status === 'Active').length; // Active users count
//     setActiveUsers(activeCount);
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const handleAddOrEditUser = async () => {
//     if (!currentUser.username || !currentUser.email || !currentUser.role || !currentUser.status) {
//       alert('All fields are required.');
//       return;
//     }

//     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailPattern.test(currentUser.email)) {
//       alert('Please enter a valid email address.');
//       return;
//     }

//     try {
//       if (editMode) {
//         await api.updateUser(currentUser.username, currentUser); // Correct API usage
//       } else {
//         await api.createUser(currentUser); // Correct API usage
//       }
//       fetchUsers(); // Refresh the user list
//       setShowModal(false);
//       setCurrentUser({ username: '', email: '', role: 'User', status: 'Active' });
//       setEditMode(false);
//     } catch (error) {
//       console.error('Error adding/updating user:', error);
//       alert('There was an error saving the user. Please try again.');
//     }
//   };

//   const handleEditClick = (user) => {
//     setCurrentUser(user);
//     setEditMode(true);
//     setShowModal(true);
//   };

//   const handleDeleteClick = async (username) => {
//     try {
//       await api.deleteUser(username); // Correct API usage
//       fetchUsers(); // Refresh the user list after deletion
//     } catch (error) {
//       console.error('Error deleting user:', error);
//       alert('There was an error deleting the user. Please try again.');
//     }
//   };

//   // Filtered users based on search input
//   const filteredUsers = users.filter(
//     (user) =>
//       (user.username?.toLowerCase().includes(searchTerm.toLowerCase())) ||
//       (user.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
//       (user.role?.toLowerCase().includes(searchTerm.toLowerCase()))
//   );

//   return (
//     <UsersContainer>
//       <Navbar />

//       <h1>User Management</h1>

//       {/* Dashboard Stats */}
//       <div>
//         <h3>Total Users: {totalUsers}</h3>
//         <h3>Active Users: {activeUsers}</h3>
//       </div>

//       {/* Header with Search and Add User Button */}
//       <HeaderContainer>
//         <AddUserButton onClick={() => { setShowModal(true); setEditMode(false); }}>
//           Add User
//         </AddUserButton>
//         <SearchContainer>
//           <SearchInput
//             type="text"
//             placeholder="Search users..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </SearchContainer>
//       </HeaderContainer>

//       {showModal && (
//         <Modal>
//           <ModalContent>
//             <h2>{editMode ? 'Edit User' : 'Add User'}</h2>
            
//             {/* Form for username, email, role */}
//             <FormRow>
//               <FormInput
//                 type="text"
//                 placeholder="Username"
//                 value={currentUser.username}
//                 onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })}
//               />
//               <FormInput
//                 type="email"
//                 placeholder="Email"
//                 value={currentUser.email}
//                 onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
//               />
//               <FormSelect
//                 value={currentUser.role}
//                 onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
//               >
//                 <option value="User">User</option>
//                 <option value="Admin">Admin</option>
//               </FormSelect>
//               <FormSelect
//                 value={currentUser.status}
//                 onChange={(e) => setCurrentUser({ ...currentUser, status: e.target.value })}
//               >
//                 <option value="Active">Active</option>
//                 <option value="Inactive">Inactive</option>
//               </FormSelect>
//             </FormRow>
            
//             {/* Buttons for Submit and Cancel */}
//             <ButtonContainer>
//               <button onClick={handleAddOrEditUser}>{editMode ? 'Update' : 'Submit'}</button>
//               <button onClick={() => setShowModal(false)}>Cancel</button>
//             </ButtonContainer>
//           </ModalContent>
//         </Modal>
//       )}

//       <UserTable>
//         <thead>
//           <tr>
//             <UserTableHeader>Username</UserTableHeader>
//             <UserTableHeader>Email</UserTableHeader>
//             <UserTableHeader>Role</UserTableHeader>
//             <UserTableHeader>Status</UserTableHeader>
//             <UserTableHeader>Actions</UserTableHeader>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredUsers.map((user) => (
//             <tr key={user.username}>
//               <UserTableCell>{user.username}</UserTableCell>
//               <UserTableCell>{user.email}</UserTableCell>
//               <UserTableCell>{user.role}</UserTableCell>
//               <UserTableCell>{user.status}</UserTableCell>
//               <UserTableCell>
//                 <EditButton onClick={() => handleEditClick(user)}>Edit</EditButton>
//                 <DeleteButton onClick={() => handleDeleteClick(user.username)}>
//                   Delete
//                 </DeleteButton>
//               </UserTableCell>
//             </tr>
//           ))}
//         </tbody>
//       </UserTable>
//     </UsersContainer>
//   );
// };

// export default Users;





// import React, { useState, useEffect } from 'react';
// import styled from 'styled-components';
// import { api } from '../api/mockApi'; // Ensure correct API import
// import Navbar from './Navbar'; // Import the Navbar component

// const UsersContainer = styled.div`
//   padding: 20px;
// `;

// const UserTable = styled.table`
//   width: 100%;
//   border-collapse: collapse;
//   margin-top: 20px;
// `;

// const UserTableHeader = styled.th`
//   background: #282c34;
//   color: white;
//   padding: 10px;
// `;

// const UserTableCell = styled.td`
//   border: 1px solid #ddd;
//   padding: 10px;
// `;

// const Modal = styled.div`
//   position: fixed;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   background: rgba(0, 0, 0, 0.5);
//   display: flex;
//   justify-content: center;
//   align-items: center;
// `;

// const ModalContent = styled.div`
//   background: white;
//   padding: 20px;
//   border-radius: 8px;
//   width: 100%;
//   max-width: 800px;
//   display: flex;
//   flex-direction: column;
// `;

// const HeaderContainer = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   margin-bottom: 20px;
// `;

// const SearchContainer = styled.div`
//   display: flex;
//   justify-content: center;
//   flex: 1;
// `;

// const SearchInput = styled.input`
//   padding: 8px;
//   width: 50%;
//   margin-left: 20px;
//   border: 1px solid #ccc;
//   border-radius: 5px;
// `;

// const AddUserButton = styled.button`
//   padding: 8px 16px;
//   background-color: #4caf50;
//   color: white;
//   border: none;
//   border-radius: 5px;
//   cursor: pointer;
// `;

// const EditButton = styled.button`
//   padding: 8px 16px;
//   background-color: #ff9800; /* Orange color for edit */
//   color: white;
//   border: none;
//   border-radius: 5px;
//   cursor: pointer;
//   margin-right: 8px;
// `;

// const DeleteButton = styled.button`
//   padding: 8px 16px;
//   background-color: #f44336; /* Red color for delete */
//   color: white;
//   border: none;
//   border-radius: 5px;
//   cursor: pointer;
// `;

// const FormRow = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   margin-bottom: 15px;
// `;

// const FormInput = styled.input`
//   padding: 8px;
//   margin-right: 15px;
//   width: 200px;
//   border: 1px solid #ccc;
//   border-radius: 5px;
// `;

// const FormSelect = styled.select`
//   padding: 8px;
//   margin-right: 15px;
//   width: 200px;
//   border: 1px solid #ccc;
//   border-radius: 5px;
// `;

// const ButtonContainer = styled.div`
//   display: flex;
//   justify-content: flex-end;
//   gap: 10px;
// `;

// const Users = () => {
//   const [showModal, setShowModal] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [currentUser, setCurrentUser] = useState({ username: '', email: '', role: 'User' });
//   const [users, setUsers] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');

//   const fetchUsers = async () => {
//     try {
//       const response = await api.getUsers(); // Correct API usage
//       setUsers(response);
//     } catch (error) {
//       console.error('Error fetching users:', error);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const handleAddOrEditUser = async () => {
//     if (!currentUser.username || !currentUser.email || !currentUser.role) {
//       alert('All fields are required.');
//       return;
//     }

//     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailPattern.test(currentUser.email)) {
//       alert('Please enter a valid email address.');
//       return;
//     }

//     try {
//       if (editMode) {
//         await api.updateUser(currentUser.username, currentUser); // Correct API usage
//       } else {
//         await api.createUser(currentUser); // Correct API usage
//       }
//       fetchUsers(); // Refresh the user list
//       setShowModal(false);
//       setCurrentUser({ username: '', email: '', role: 'User' });
//       setEditMode(false);
//     } catch (error) {
//       console.error('Error adding/updating user:', error);
//       alert('There was an error saving the user. Please try again.');
//     }
//   };

//   const handleEditClick = (user) => {
//     setCurrentUser(user);
//     setEditMode(true);
//     setShowModal(true);
//   };

//   const handleDeleteClick = async (username) => {
//     try {
//       await api.deleteUser(username); // Correct API usage
//       fetchUsers(); // Refresh the user list after deletion
//     } catch (error) {
//       console.error('Error deleting user:', error);
//       alert('There was an error deleting the user. Please try again.');
//     }
//   };

//   // Filtered users based on search input
//   const filteredUsers = users.filter(
//     (user) =>
//       (user.username?.toLowerCase().includes(searchTerm.toLowerCase())) ||
//       (user.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
//       (user.role?.toLowerCase().includes(searchTerm.toLowerCase()))
//   );

//   return (
//     <UsersContainer>
//       <Navbar />

//       <h1>User Management</h1>

//       {/* Header with Search and Add User Button */}
//       <HeaderContainer>
//         <AddUserButton onClick={() => { setShowModal(true); setEditMode(false); }}>
//           Add User
//         </AddUserButton>
//         <SearchContainer>
//           <SearchInput
//             type="text"
//             placeholder="Search users..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </SearchContainer>
//       </HeaderContainer>

//       {showModal && (
//         <Modal>
//           <ModalContent>
//             <h2>{editMode ? 'Edit User' : 'Add User'}</h2>
            
//             {/* Form for username, email, role */}
//             <FormRow>
//               <FormInput
//                 type="text"
//                 placeholder="Username"
//                 value={currentUser.username}
//                 onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })}
//               />
//               <FormInput
//                 type="email"
//                 placeholder="Email"
//                 value={currentUser.email}
//                 onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
//               />
//               <FormSelect
//                 value={currentUser.role}
//                 onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
//               >
//                 <option value="User">User</option>
//                 <option value="Admin">Admin</option>
//               </FormSelect>
//             </FormRow>
            
//             {/* Buttons for Submit and Cancel */}
//             <ButtonContainer>
//               <button onClick={handleAddOrEditUser}>{editMode ? 'Update' : 'Submit'}</button>
//               <button onClick={() => setShowModal(false)}>Cancel</button>
//             </ButtonContainer>
//           </ModalContent>
//         </Modal>
//       )}

//       <UserTable>
//         <thead>
//           <tr>
//             <UserTableHeader>Username</UserTableHeader>
//             <UserTableHeader>Email</UserTableHeader>
//             <UserTableHeader>Role</UserTableHeader>
//             <UserTableHeader>Status</UserTableHeader>
//             <UserTableHeader>Actions</UserTableHeader>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredUsers.map((user) => (
//             <tr key={user.username}>
//               <UserTableCell>{user.username}</UserTableCell>
//               <UserTableCell>{user.email}</UserTableCell>
//               <UserTableCell>{user.role}</UserTableCell>
//               <UserTableCell>{user.status}</UserTableCell>
//               <UserTableCell>
//                 <EditButton onClick={() => handleEditClick(user)}>Edit</EditButton>
//                 <DeleteButton onClick={() => handleDeleteClick(user.username)}>
//                   Delete
//                 </DeleteButton>
//               </UserTableCell>
//             </tr>
//           ))}
//         </tbody>
//       </UserTable>
//     </UsersContainer>
//   );
// };

// export default Users;






// import React, { useState, useEffect } from 'react';
// import styled from 'styled-components';
// import { api } from '../api/mockApi'; // Ensure correct API import
// import Navbar from './Navbar'; // Import the Navbar component
// const UsersContainer = styled.div`
//   padding: 20px;
// `;

// const UserTable = styled.table`
//   width: 100%;
//   border-collapse: collapse;
//   margin-top: 20px;
// `;

// const UserTableHeader = styled.th`
//   background: #282c34;
//   color: white;
//   padding: 10px;
// `;

// const UserTableCell = styled.td`
//   border: 1px solid #ddd;
//   padding: 10px;
// `;

// const Modal = styled.div`
//   position: fixed;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   background: rgba(0, 0, 0, 0.5);
//   display: flex;
//   justify-content: center;
//   align-items: center;
// `;

// const ModalContent = styled.div`
//   background: white;
//   padding: 20px;
//   border-radius: 8px;
// `;

// // New styled components for layout
// const HeaderContainer = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
// `;

// const SearchContainer = styled.div`
//   display: flex;
//   justify-content: center;
//   flex: 1;
// `;

// const SearchInput = styled.input`
//   padding: 8px;
//   width: 50%;
//   margin-left: 20px;
//   border: 1px solid #ccc;
//   border-radius: 5px;
// `;

// const AddUserButton = styled.button`
//   padding: 8px 16px;
//   background-color: #4caf50;
//   color: white;
//   border: none;
//   border-radius: 5px;
//   cursor: pointer;
// `;

// const EditButton = styled.button`
//   padding: 8px 16px;
//   background-color: #ff9800; /* Orange color for edit */
//   color: white;
//   border: none;
//   border-radius: 5px;
//   cursor: pointer;
//   margin-right: 8px;
// `;

// const DeleteButton = styled.button`
//   padding: 8px 16px;
//   background-color: #f44336; /* Red color for delete */
//   color: white;
//   border: none;
//   border-radius: 5px;
//   cursor: pointer;
// `;

// const Users = () => {
//   const [showModal, setShowModal] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [currentUser, setCurrentUser] = useState({ username: '', email: '', role: 'User' });
//   const [users, setUsers] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");

//   const fetchUsers = async () => {
//     try {
//       const response = await api.getUsers(); // Correct API usage
//       setUsers(response);
//     } catch (error) {
//       console.error('Error fetching users:', error);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const handleAddOrEditUser = async () => {
//     if (!currentUser.username || !currentUser.email || !currentUser.role) {
//       alert('All fields are required.');
//       return;
//     }

//     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailPattern.test(currentUser.email)) {
//       alert('Please enter a valid email address.');
//       return;
//     }

//     try {
//       if (editMode) {
//         await api.updateUser(currentUser.username, currentUser); // Correct API usage
//       } else {
//         await api.createUser(currentUser); // Correct API usage
//       }
//       fetchUsers(); // Refresh the user list
//       setShowModal(false);
//       setCurrentUser({ username: '', email: '', role: 'User' });
//       setEditMode(false);
//     } catch (error) {
//       console.error('Error adding/updating user:', error);
//       alert('There was an error saving the user. Please try again.');
//     }
//   };

//   const handleEditClick = (user) => {
//     setCurrentUser(user);
//     setEditMode(true);
//     setShowModal(true);
//   };

//   const handleDeleteClick = async (username) => {
//     try {
//       await api.deleteUser(username); // Correct API usage
//       fetchUsers(); // Refresh the user list after deletion
//     } catch (error) {
//       console.error('Error deleting user:', error);
//       alert('There was an error deleting the user. Please try again.');
//     }
//   };

//   // Filtered users based on search input
//   const filteredUsers = users.filter(user =>
//     (user.username?.toLowerCase().includes(searchTerm.toLowerCase())) ||
//     (user.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
//     (user.role?.toLowerCase().includes(searchTerm.toLowerCase()))
//   );

//   return (
//     <UsersContainer>
//           <Navbar />

//       <h1>User Management</h1>

//       {/* Header with Search and Add User Button */}
//       <HeaderContainer>
//         <AddUserButton onClick={() => { setShowModal(true); setEditMode(false); }}>Add User</AddUserButton>
//         <SearchContainer>
//           <SearchInput
//             type="text"
//             placeholder="Search users..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </SearchContainer>
//       </HeaderContainer>

//       {showModal && (
//         <Modal>
//           <ModalContent>
//             <h2>{editMode ? 'Edit User' : 'Add User'}</h2>
//             <input
//               type="text"
//               placeholder="Username"
//               value={currentUser.username}
//               onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })}
//             />
//             <input
//               type="email"
//               placeholder="Email"
//               value={currentUser.email}
//               onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
//             />
//             <select value={currentUser.role} onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}>
//               <option value="User">User</option>
//               <option value="Admin">Admin</option>
//             </select>
//             <button onClick={handleAddOrEditUser}>{editMode ? 'Update' : 'Submit'}</button>
//             <button onClick={() => setShowModal(false)}>Cancel</button>
//           </ModalContent>
//         </Modal>
//       )}

//       <UserTable>
//         <thead>
//           <tr>
//             <UserTableHeader>Username</UserTableHeader>
//             <UserTableHeader>Email</UserTableHeader>
//             <UserTableHeader>Role</UserTableHeader>
//             <UserTableHeader>Status</UserTableHeader>
//             <UserTableHeader>Actions</UserTableHeader>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredUsers.map((user) => (
//             <tr key={user.username}>
//               <UserTableCell>{user.username}</UserTableCell>
//               <UserTableCell>{user.email}</UserTableCell>
//               <UserTableCell>{user.role}</UserTableCell>
//               <UserTableCell>{user.status}</UserTableCell>
//               <UserTableCell>
//                 <EditButton onClick={() => handleEditClick(user)}>Edit</EditButton>
//                 <DeleteButton onClick={() => handleDeleteClick(user.username)}>Delete</DeleteButton>
//               </UserTableCell>
//             </tr>
//           ))}
//         </tbody>
//       </UserTable>
//     </UsersContainer>
//   );
// };

// export default Users;


// import React, { useState, useEffect } from 'react';
// import styled from 'styled-components';
// import { api } from '../api/mockApi'; // Ensure correct API import

// const UsersContainer = styled.div`
//   padding: 20px;
// `;

// const UserTable = styled.table`
//   width: 100%;
//   border-collapse: collapse;
//   margin-top: 20px;
// `;

// const UserTableHeader = styled.th`
//   background: #282c34;
//   color: white;
//   padding: 10px;
// `;

// const UserTableCell = styled.td`
//   border: 1px solid #ddd;
//   padding: 10px;
// `;

// const Modal = styled.div`
//   position: fixed;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   background: rgba(0, 0, 0, 0.5);
//   display: flex;
//   justify-content: center;
//   align-items: center;
// `;

// const ModalContent = styled.div`
//   background: white;
//   padding: 20px;
//   border-radius: 8px;
// `;

// // New styled components for layout
// const HeaderContainer = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
// `;

// const SearchContainer = styled.div`
//   display: flex;
//   justify-content: center;
//   flex: 1;
// `;

// const SearchInput = styled.input`
//   padding: 8px;
//   width: 50%;
//   margin-left: 20px;
//   border: 1px solid #ccc;
//   border-radius: 5px;
// `;

// const AddUserButton = styled.button`
//   padding: 8px 16px;
//   background-color: #4caf50;
//   color: white;
//   border: none;
//   border-radius: 5px;
//   cursor: pointer;
// `;

// const Users = () => {
//   const [showModal, setShowModal] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [currentUser, setCurrentUser] = useState({ username: '', email: '', role: 'User' });
//   const [users, setUsers] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");

//   const fetchUsers = async () => {
//     try {
//       const response = await api.getUsers(); // Correct API usage
//       setUsers(response);
//     } catch (error) {
//       console.error('Error fetching users:', error);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const handleAddOrEditUser = async () => {
//     if (!currentUser.username || !currentUser.email || !currentUser.role) {
//       alert('All fields are required.');
//       return;
//     }

//     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailPattern.test(currentUser.email)) {
//       alert('Please enter a valid email address.');
//       return;
//     }

//     try {
//       if (editMode) {
//         await api.updateUser(currentUser.username, currentUser); // Correct API usage
//       } else {
//         await api.createUser(currentUser); // Correct API usage
//       }
//       fetchUsers(); // Refresh the user list
//       setShowModal(false);
//       setCurrentUser({ username: '', email: '', role: 'User' });
//       setEditMode(false);
//     } catch (error) {
//       console.error('Error adding/updating user:', error);
//       alert('There was an error saving the user. Please try again.');
//     }
//   };

//   const handleEditClick = (user) => {
//     setCurrentUser(user);
//     setEditMode(true);
//     setShowModal(true);
//   };

//   const handleDeleteClick = async (username) => {
//     try {
//       await api.deleteUser(username); // Correct API usage
//       fetchUsers(); // Refresh the user list after deletion
//     } catch (error) {
//       console.error('Error deleting user:', error);
//       alert('There was an error deleting the user. Please try again.');
//     }
//   };

//   // Filtered users based on search input
//   const filteredUsers = users.filter(user =>
//     (user.username?.toLowerCase().includes(searchTerm.toLowerCase())) ||
//     (user.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
//     (user.role?.toLowerCase().includes(searchTerm.toLowerCase()))
//   );

//   return (
//     <UsersContainer>
//       <h1>User Management</h1>

//       {/* Header with Search and Add User Button */}
//       <HeaderContainer>
//         <AddUserButton onClick={() => { setShowModal(true); setEditMode(false); }}>Add User</AddUserButton>
//         <SearchContainer>
//           <SearchInput
//             type="text"
//             placeholder="Search users..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </SearchContainer>
//       </HeaderContainer>

//       {showModal && (
//         <Modal>
//           <ModalContent>
//             <h2>{editMode ? 'Edit User' : 'Add User'}</h2>
//             <input
//               type="text"
//               placeholder="Username"
//               value={currentUser.username}
//               onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })}
//             />
//             <input
//               type="email"
//               placeholder="Email"
//               value={currentUser.email}
//               onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
//             />
//             <select value={currentUser.role} onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}>
//               <option value="User">User</option>
//               <option value="Admin">Admin</option>
//             </select>
//             <button onClick={handleAddOrEditUser}>{editMode ? 'Update' : 'Submit'}</button>
//             <button onClick={() => setShowModal(false)}>Cancel</button>
//           </ModalContent>
//         </Modal>
//       )}

//       <UserTable>
//         <thead>
//           <tr>
//             <UserTableHeader>Username</UserTableHeader>
//             <UserTableHeader>Email</UserTableHeader>
//             <UserTableHeader>Role</UserTableHeader>
//             <UserTableHeader>Status</UserTableHeader>
//             <UserTableHeader>Actions</UserTableHeader>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredUsers.map((user) => (
//             <tr key={user.username}>
//               <UserTableCell>{user.username}</UserTableCell>
//               <UserTableCell>{user.email}</UserTableCell>
//               <UserTableCell>{user.role}</UserTableCell>
//               <UserTableCell>{user.status}</UserTableCell>
//               <UserTableCell>
//                 <button onClick={() => handleEditClick(user)}>Edit</button>
//                 <button onClick={() => handleDeleteClick(user.username)}>Delete</button>
//               </UserTableCell>
//             </tr>
//           ))}
//         </tbody>
//       </UserTable>
//     </UsersContainer>
//   );
// };

// export default Users;




// import React, { useState, useEffect } from 'react';
// import styled from 'styled-components';
// import { api } from '../api/mockApi'; // Ensure correct API import

// const UsersContainer = styled.div`
//   padding: 20px;
// `;

// const UserTable = styled.table`
//   width: 100%;
//   border-collapse: collapse;
//   margin-top: 20px;
// `;

// const UserTableHeader = styled.th`
//   background: #282c34;
//   color: white;
//   padding: 10px;
// `;

// const UserTableCell = styled.td`
//   border: 1px solid #ddd;
//   padding: 10px;
// `;

// const Modal = styled.div`
//   position: fixed;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   background: rgba(0, 0, 0, 0.5);
//   display: flex;
//   justify-content: center;
//   align-items: center;
// `;

// const ModalContent = styled.div`
//   background: white;
//   padding: 20px;
//   border-radius: 8px;
// `;

// const Users = () => {
//   const [showModal, setShowModal] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [currentUser, setCurrentUser] = useState({ username: '', email: '', role: 'User' });
//   const [users, setUsers] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');  // Search term state

//   const fetchUsers = async () => {
//     try {
//       const response = await api.getUsers(); // Correct API usage
//       setUsers(response);
//     } catch (error) {
//       console.error('Error fetching users:', error);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const handleAddOrEditUser = async () => {
//     if (!currentUser.username || !currentUser.email || !currentUser.role) {
//       alert('All fields are required.');
//       return;
//     }

//     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailPattern.test(currentUser.email)) {
//       alert('Please enter a valid email address.');
//       return;
//     }

//     try {
//       if (editMode) {
//         await api.updateUser(currentUser.username, currentUser); // Correct API usage
//       } else {
//         await api.createUser(currentUser); // Correct API usage
//       }
//       fetchUsers(); // Refresh the user list
//       setShowModal(false);
//       setCurrentUser({ username: '', email: '', role: 'User' });
//       setEditMode(false);
//     } catch (error) {
//       console.error('Error adding/updating user:', error);
//       alert('There was an error saving the user. Please try again.');
//     }
//   };

//   const handleEditClick = (user) => {
//     setCurrentUser(user);
//     setEditMode(true);
//     setShowModal(true);
//   };

//   const handleDeleteClick = async (username) => {
//     try {
//       await api.deleteUser(username); // Correct API usage
//       fetchUsers(); // Refresh the user list after deletion
//     } catch (error) {
//       console.error('Error deleting user:', error);
//       alert('There was an error deleting the user. Please try again.');
//     }
//   };

//   // Filtered users based on the search term
//   const filteredUsers = users.filter(user => 
//     (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
//     (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
//     (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase()))
//   );
  
// //   const filteredUsers = users.filter(user =>
// //     user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //     user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //     user.role.toLowerCase().includes(searchTerm.toLowerCase())
// //   );

//   return (
//     <UsersContainer>
//       <h1>User Management</h1>

//       {/* Search Input */}
//       <input
//         type="text"
//         placeholder="Search users..."
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)} // Update search term
//       />

//       <button onClick={() => { setShowModal(true); setEditMode(false); }}>Add User</button>

//       {showModal && (
//         <Modal>
//           <ModalContent>
//             <h2>{editMode ? 'Edit User' : 'Add User'}</h2>
//             <input
//               type="text"
//               placeholder="Username"
//               value={currentUser.username}
//               onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })}
//             />
//             <input
//               type="email"
//               placeholder="Email"
//               value={currentUser.email}
//               onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
//             />
//             <select value={currentUser.role} onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}>
//               <option value="User">User</option>
//               <option value="Admin">Admin</option>
//             </select>
//             <button onClick={handleAddOrEditUser}>{editMode ? 'Update' : 'Submit'}</button>
//             <button onClick={() => setShowModal(false)}>Cancel</button>
//           </ModalContent>
//         </Modal>
//       )}

//       {/* User Table */}
//       <UserTable>
//         <thead>
//           <tr>
//             <UserTableHeader>Username</UserTableHeader>
//             <UserTableHeader>Email</UserTableHeader>
//             <UserTableHeader>Role</UserTableHeader>
//             <UserTableHeader>Status</UserTableHeader>
//             <UserTableHeader>Actions</UserTableHeader>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredUsers.map((user) => (
//             <tr key={user.username}>
//               <UserTableCell>{user.username}</UserTableCell>
//               <UserTableCell>{user.email}</UserTableCell>
//               <UserTableCell>{user.role}</UserTableCell>
//               <UserTableCell>{user.status}</UserTableCell>
//               <UserTableCell>
//                 <button onClick={() => handleEditClick(user)}>Edit</button>
//                 <button onClick={() => handleDeleteClick(user.username)}>Delete</button>
//               </UserTableCell>
//             </tr>
//           ))}
//         </tbody>
//       </UserTable>
//     </UsersContainer>
//   );
// };

// export default Users;






// import React, { useState, useEffect } from 'react';
// import styled from 'styled-components';
// import { api } from '../api/mockApi'; // Ensure correct import

// const UsersContainer = styled.div`
//   padding: 20px;
// `;

// const UserTable = styled.table`
//   width: 100%;
//   border-collapse: collapse;
//   margin-top: 20px;
// `;

// const UserTableHeader = styled.th`
//   background: #282c34;
//   color: white;
//   padding: 10px;
// `;

// const UserTableCell = styled.td`
//   border: 1px solid #ddd;
//   padding: 10px;
// `;

// const Modal = styled.div`
//   position: fixed;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   background: rgba(0, 0, 0, 0.5);
//   display: flex;
//   justify-content: center;
//   align-items: center;
// `;

// const ModalContent = styled.div`
//   background: white;
//   padding: 20px;
//   border-radius: 8px;
// `;

// const Users = () => {
//   const [showModal, setShowModal] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [currentUser , setCurrentUser ] = useState({ username: '', email: '', role: 'User ' });
//   const [users, setUsers] = useState([]);

//   const fetchUsers = async () => {
//     try {
//       const response = await api.getUsers(); // Ensure correct usage of api
//       setUsers(response);
//     } catch (error) {
//       console.error('Error fetching users:', error);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const handleAddOrEditUser  = async () => {
//     if (!currentUser.username || !currentUser.email || !currentUser.role) {
//       alert('All fields are required.');
//       return;
//     }

//     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailPattern.test(currentUser.email)) {
//       alert('Please enter a valid email address.');
//       return;
//     }

//     try {
//       if (editMode) {
//         await api.updateUser (currentUser.username, currentUser ); // Ensure correct usage of api
//       } else {
//         await api.createUser (currentUser ); // Ensure correct usage of api
//       }
//       fetchUsers (); // Refresh the user list
//       setShowModal(false);
//       setCurrentUser ({ username: '', email: '', role: 'User  ' });
//       setEditMode(false);
//     } catch (error) {
//       console.error('Error adding/updating user:', error);
//       alert('There was an error saving the user. Please try again.');
//     }
//   };

//   const handleEditClick = (user) => {
//     setCurrentUser (user);
//     setEditMode(true);
//     setShowModal(true);
//   };

//   const handleDeleteClick = async (username) => {
//     try {
//       await api.deleteUser (username); // Ensure correct usage of api
//       fetchUsers(); // Refresh the user list after deletion
//     } catch (error) {
//       console.error('Error deleting user:', error);
//       alert('There was an error deleting the user. Please try again.');
//     }
//   };

//   return (
//     <UsersContainer>
//       <h1>User Management</h1>
//       <input type="text" placeholder="Search users..." />
//       <button onClick={() => { setShowModal(true); setEditMode(false); }}>Add User</button>
//       {showModal && (
//         <Modal>
//           <ModalContent>
//             <h2>{editMode ? 'Edit User' : 'Add User'}</h2>
//             <input
//               type="text"
//               placeholder="Username"
//               value={currentUser.username}
//               onChange={(e) => setCurrentUser ({ ...currentUser , username: e.target.value })}
//             />
//             <input
//               type="email"
//               placeholder="Email"
//               value={currentUser.email}
//               onChange={(e) => setCurrentUser ({ ...currentUser , email: e.target.value })}
//             />
//             <select value={currentUser.role} onChange={(e) => setCurrentUser ({ ...currentUser , role: e.target.value })}>
//               <option value="User  ">User  </option>
//               <option value="Admin">Admin</option>
//             </select>
//             <button onClick={handleAddOrEditUser }>{editMode ? 'Update' : 'Submit'}</button>
//             <button onClick={() => setShowModal(false)}>Cancel</button>
//           </ModalContent>
//         </Modal>
//       )}
//       <UserTable Table>
//         <thead>
//           <tr>
//             <UserTableHeader TableHeader>Username</UserTableHeader>
//             <UserTableHeader TableHeader>Email</UserTableHeader>
//             <UserTableHeader TableHeader>Role</UserTableHeader>
//             <UserTableHeader TableHeader>Status</UserTableHeader>
//             <UserTableHeader TableHeader>Actions</UserTableHeader>
//           </tr>
//         </thead>
//         <tbody>
//           {users.map(user => (
//             <tr key={user.username}>
//               <UserTableCell TableCell>{user.username}</UserTableCell>
//               <UserTableCell TableCell>{user.email}</UserTableCell>
//               <UserTableCell TableCell>{user.role}</UserTableCell>
//               <UserTableCell TableCell>{user.status}</UserTableCell>
//               <UserTableCell TableCell>
//                 <button onClick={() => handleEditClick(user)}>Edit</button>
//                 <button onClick={() => handleDeleteClick(user.username)}>Delete</button>
//               </UserTableCell>
//             </tr>
//           ))}
//         </tbody>
//       </UserTable>
//     </UsersContainer>
//   );
// };

// export default Users;


// import React, { useState, useEffect } from 'react';
// import styled from 'styled-components';
// import { api } from '../api/mockApi'; // Import the MockApi

// const UsersContainer = styled.div`
//   padding: 20px;
// `;

// const UserTable = styled.table`
//   width: 100%;
//   border-collapse: collapse;
//   margin-top: 20px;
// `;

// const UserTableHeader = styled.th`
//   background: #282c34;
//   color: white;
//   padding: 10px;
// `;

// const UserTableCell = styled.td`
//   border: 1px solid #ddd;
//   padding: 10px;
// `;

// const Modal = styled.div`
//   position: fixed;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   background: rgba(0, 0, 0, 0.5);
//   display: flex;
//   justify-content: center;
//   align-items: center;
// `;

// const ModalContent = styled.div`
//   background: white;
//   padding: 20px;
//   border-radius: 8px;
// `;

// const Users = () => {
//   const [showModal, setShowModal] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [currentUser , setCurrentUser ] = useState({ username: '', email: '', role: 'User ' });
//   const [users, setUsers] = useState([]);

//   const fetchUsers = async () => {
//     try {
//       const response = await api.getUsers();
//       setUsers(response);
//     } catch (error) {
//       console.error('Error fetching users:', error);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const handleAddOrEditUser  = async () => {
//     // Validation
//     if (!currentUser.username || !currentUser.email || !currentUser.role) {
//       alert('All fields are required.');
//       return;
//     }

//     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailPattern.test(currentUser.email)) {
//       alert('Please enter a valid email address.');
//       return;
//     }

//     try {
//       if (editMode) {
//         await api.updateUser (currentUser.username, currentUser );
//       } else {
//         await api.createUser (currentUser );
//       }
//       fetchUsers(); // Refresh the user list
//       setShowModal(false);
//       setCurrentUser ({ username: '', email: '', role: 'User ' });
//       setEditMode(false);
//     } catch (error) {
//       console.error('Error adding/updating user:', error);
//       alert('There was an error saving the user. Please try again.');
//     }
//   };

//   const handleEditClick = (user) => {
//     setCurrentUser (user);
//     setEditMode(true);
//     setShowModal(true);
//   };

//   const handleDeleteClick = async (username) => {
//     try {
//       await api.deleteUser (username);
//       fetchUsers(); // Refresh the user list after deletion
//     } catch (error) {
//       console.error('Error deleting user:', error);
//       alert('There was an error deleting the user. Please try again.');
//     }
//   };

//   return (
//     <UsersContainer>
//       <h1>User Management</h1>
//       <input type="text" placeholder="Search users..." />
//       <button onClick={() => { setShowModal(true); setEditMode(false); }}>Add User</button>
//       {showModal && (
//         <Modal>
//           <ModalContent>
//             <h2>{editMode ? 'Edit User' : 'Add User'}</h2>
//             <input
//               type="text"
//               placeholder="Username"
//               value={currentUser.username}
//               onChange={(e) => setCurrentUser ({ ...currentUser , username: e.target.value })}
//             />
//             <input
//               type="email"
//               placeholder="Email"
//               value={currentUser.email}
//               onChange={(e) => setCurrentUser ({ ...currentUser , email: e.target.value })}
//             />
//             <select value={currentUser.role} onChange={(e) => setCurrentUser ({ ...currentUser , role: e.target.value })}>
//               <option value="User ">User </option>
//               <option value="Admin">Admin</option>
//             </select>
//             <button onClick={handleAddOrEditUser }>{editMode ? 'Update' : 'Submit'}</button>
//             <button onClick={() => setShowModal(false)}>Cancel</button>
//           </ModalContent>
//         </Modal>
//       )}
//       <UserTable Table>
//         <thead>
//           <tr>
//             <UserTableHeader TableHeader>Username</UserTableHeader>
//             <UserTableHeader TableHeader>Email</UserTableHeader>
//             <UserTableHeader TableHeader>Role</UserTableHeader>
//             <UserTableHeader TableHeader>Status</UserTableHeader>
//             <UserTableHeader TableHeader>Actions</UserTableHeader>
//           </tr>
//         </thead>
//         <tbody>
//           {users.map(user => (
//             <tr key={user.username}>
//               <UserTableCell TableCell>{user.username}</UserTableCell>
//               <UserTableCell TableCell>{user.email}</UserTableCell>
//               <UserTableCell TableCell>{user.role}</UserTableCell>
//               <UserTableCell TableCell>{user.status}</UserTableCell>
//               <UserTableCell TableCell>
//                 <button onClick={() => handleEditClick(user)}>Edit</button>
//                 <button onClick={() => handleDeleteClick(user.username)}>Delete</button>
//               </UserTableCell>
//             </tr>
//           ))}
//         </tbody>
//       </UserTable>
//     </UsersContainer>
//   );
// };

// export default Users;


// import React, { useState } from 'react';
// import styled from 'styled-components';
// import axios from 'axios';
// import { useEffect} from 'react';

// const UsersContainer = styled.div`
//   padding: 20px;
// `;

// const UserTable = styled.table`
//   width: 100%;
//   border-collapse: collapse;
//   margin-top: 20px;
// `;

// const UserTableHeader = styled.th`
//   background: #282c34;
//   color: white;
//   padding: 10px;
// `;

// const UserTableCell = styled.td`
//   border: 1px solid #ddd;
//   padding: 10px;
// `;

// const Modal = styled.div`
//   position: fixed;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   background: rgba(0, 0, 0, 0.5);
//   display: flex;
//   justify-content: center;
//   align-items: center;
// `;

// const ModalContent = styled.div`
//   background: white;
//   padding: 20px;
//   border-radius: 8px;
// `;

// const Users = () => {
//   const [showModal, setShowModal] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [currentUser , setCurrentUser ] = useState({ username: '', email: '', role: 'User ' });
//   const [users, setUsers] = useState([
//     { username: 'admin', email: 'admin@example.com', role: 'Admin', status: 'Active' },
//     { username: 'user', email: 'user@example.com', role: 'User ', status: 'Active' },

//   ]);
//   const fetchUsers = async () => {
//     try {
//       const response = await axios.get('http://localhost:5000/users');
//       setUsers(response.data);
//     } catch (error) {
//       console.error('Error fetching users:', error);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

// //   const handleAddOrEditUser  = async () => {
// //     // Validation
// //     if (!currentUser.username || !currentUser.email || !currentUser.role) {
// //         alert('All fields are required.');
// //         return;
// //     }

// //     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// //     if (!emailPattern.test(currentUser.email)) {
// //         alert('Please enter a valid email address.');
// //         return;
// //     }

// //     try {
// //         if (editMode) {
// //             await axios.put(`http://localhost:5000/users/${currentUser.username}`, currentUser );
// //         } else {
// //             await axios.post('http://localhost:5000/users', currentUser );
// //         }
// //         fetchUsers();
// //         setShowModal(false);
// //         setCurrentUser ({ username: '', email: '', role: 'User ' });
// //         setEditMode(false);
// //     } 
// //     // catch (error) {
// //     //     console.error('Error adding/updating user:', error);
// //     //     alert('There was an error saving the user. Please try again.');
// //     // }
// // };

//   const handleAddOrEditUser  = () => {
//     if (editMode) {
//       setUsers(users.map(user => (user.username === currentUser.username ? currentUser  : user)));
//     } else {
//       setUsers([...users, currentUser ]);
//     }
//     setShowModal(false);
//     setCurrentUser ({ username: '', email: '', role: 'User ' });
//     setEditMode(false);
//   };

//   const handleEditClick = (user) => {
//     setCurrentUser (user);
//     setEditMode(true);
//     setShowModal(true);
//   };

//   const handleDeleteClick = (username) => {
//     setUsers(users.filter(user => user.username !== username));
//   };

//   return (
//     <UsersContainer>
//       <h1>User Management</h1>
//       <input type="text" placeholder="Search users..." />
//       <button onClick={() => { setShowModal(true); setEditMode(false); }}>Add User</button>
//       {showModal && (
//         <Modal>
//           <ModalContent>
//             <h2>{editMode ? 'Edit User' : 'Add User'}</h2>
//             <input
//               type="text"
//               placeholder="Username"
//               value={currentUser.username}
//               onChange={(e) => setCurrentUser ({ ...currentUser , username: e.target.value })}
//             />
//             <input
//               type="email"
//               placeholder="Email"
//               value={currentUser.email}
//               onChange={(e) => setCurrentUser ({ ...currentUser , email: e.target.value })}
//             />
//             <select value={currentUser.role} onChange={(e) => setCurrentUser ({ ...currentUser , role: e.target.value })}>
//               <option value="User ">User </option>
//               <option value="Admin">Admin</option>
//             </select>
//             <button onClick={handleAddOrEditUser }>{editMode ? 'Update' : 'Submit'}</button>
//             <button onClick={() => setShowModal(false)}>Cancel</button>
//           </ModalContent>
//         </Modal>
//       )}
//       <UserTable Table>
//         <thead>
//           <tr>
//             <UserTableHeader TableHeader>Username</UserTableHeader>
//             <UserTableHeader TableHeader>Email</UserTableHeader>
//             <UserTableHeader TableHeader>Role</UserTableHeader>
//             <UserTableHeader TableHeader>Status</UserTableHeader>
//             <UserTableHeader TableHeader>Actions</UserTableHeader>
//           </tr>
//         </thead>
//         <tbody>
//           {users.map(user => (
//             <tr key={user.username}>
//               <UserTableCell TableCell>{user.username}</UserTableCell>
//               <UserTableCell TableCell>{user.email}</UserTableCell>
//               <UserTableCell TableCell>{user.role}</UserTableCell>
//               <UserTableCell TableCell>{user.status}</UserTableCell>
//               <UserTableCell  TableCell>
//                 <button onClick={() => handleEditClick(user)}>Edit</button>
//                 <button onClick={() => handleDeleteClick(user.username)}>Delete</button>
//               </UserTableCell>
//             </tr>
//           ))}
//         </tbody>
//       </UserTable>
//     </UsersContainer>
//   );
// };

// export default Users;


// import React, { useState, useEffect } from 'react';
// import styled from 'styled-components';
// import axios from 'axios';

// const UsersContainer = styled.div`
//   padding: 20px;
// `;

// const UserTable = styled.table`
//   width: 100%;
//   border-collapse: collapse;
//   margin-top: 20px;
// `;

// const UserTableHeader = styled.th`
//   background: #282c34;
//   color: white;
//   padding: 10px;
// `;

// const UserTableCell = styled.td`
//   border: 1px solid #ddd;
//   padding: 10px;
// `;

// const Modal = styled.div`
//   position: fixed;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   background: rgba(0, 0, 0, 0.5);
//   display: flex;
//   justify-content: center;
//   align-items: center;
// `;

// const ModalContent = styled.div`
//   background: white;
//   padding: 20px;
//   border-radius: 8px;
// `;

// const Users = () => {
//   const [showModal, setShowModal] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [currentUser , setCurrentUser ] = useState({ username: '', email: '', role: 'User  ' });
//   const [users, setUsers] = useState([]);

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     const response = await axios.get('http://localhost:5000/users');
//     setUsers(response.data);
//   };

//   const handleAddOrEditUser  = async () => {
//     if (editMode) {
//       await axios.put(`http://localhost:5000/users/${currentUser.username}`, currentUser );
//     } else {
//       await axios.post('http://localhost:5000/users', currentUser );
//     }
//     fetchUsers();
//     setShowModal(false);
//     setCurrentUser ({ username: '', email: '', role: 'User  ' });
//     setEditMode(false);
//   };

//   const handleEditClick = (user) => {
//     setCurrentUser (user);
//     setEditMode(true);
//     setShowModal(true);
//   };

//   const handleDeleteClick = async (username ) => {
//     await axios.delete(`http://localhost:5000/users/${username}`);
//     fetchUsers();
//   };

//   return (
//     <UsersContainer>
//       <h1>User Management</h1>
//       <input type="text" placeholder="Search users..." />
//       <button onClick={() => { setShowModal(true); setEditMode(false); }}>Add User</button>
//       {showModal && (
//         <Modal>
//           <ModalContent>
//             <h2>{editMode ? 'Edit User' : 'Add User'}</h2>
//             <input
//               type="text"
//               placeholder="Username"
//               value={currentUser.username}
//               onChange={(e) => setCurrentUser ({ ...currentUser , username: e.target.value })}
//             />
//             <input
//               type="email"
//               placeholder="Email"
//               value={currentUser.email}
//               onChange={(e) => setCurrentUser ({ ...currentUser , email: e.target.value })}
//             />
//             <select
//               value={currentUser.role}
//               onChange={(e) => setCurrentUser ({ ...currentUser , role: e.target.value })}
//             >
//               <option value="User  ">User  </option>
//               <option value="Admin">Admin</option>
//             </select>
//             <button onClick={handleAddOrEditUser }>{editMode ? 'Update' : 'Submit'}</button>
//             <button onClick={() => setShowModal(false)}>Cancel</button>
//           </ModalContent>
//         </Modal>
//       )}
//       <UserTable Table>
//         <thead>
//           <tr>
//             <UserTableHeader TableHeader>Username</UserTableHeader>
//             <UserTableHeader TableHeader>Email</UserTableHeader>
//             <UserTableHeader TableHeader>Role</UserTableHeader>
//             <UserTableHeader TableHeader>Actions</UserTableHeader>
//           </tr>
//         </thead>
//         <tbody>
//           {users.map((user, index) => (
//             <tr key={index}>
//               <UserTableCell TableCell>{user.username}</UserTableCell>
//               <UserTableCell TableCell>{user.email}</UserTableCell>
//               <UserTableCell TableCell>{user.role}</UserTableCell>
//               <UserTableCell TableCell>
//                 <button onClick={() => handleEditClick(user)}>Edit</button>
//                 <button onClick={() => handleDeleteClick(user.username)}>Delete</button>
//               </UserTableCell>
//             </tr>
//           ))}
//         </tbody>
//       </UserTable>
//     </UsersContainer>
//   );
// };

// export default Users;