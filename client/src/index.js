import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Login from './pages/Login';
import { Provider } from 'react-redux';
import store from './redux';
import { Routes, Route, BrowserRouter as Router } from "react-router-dom"
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
      <Router>
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
      {/* <App /> */}
    </Provider>
);
