// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;



import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Roles from './pages/Roles';
import './App.css';
import './styles.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav>
          <h1>RoleGuard</h1>
          <ul>
            <li><a href="/">Dashboard</a></li>
            <li><a href="/users">Users</a></li>
            <li><a href="/roles">Roles</a></li>
          </ul>
        </nav>
        <main>       
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/roles" element={<Roles />} />
          </Routes>    
        </main>
      </div>
    </Router>
  );
}

export default App;
