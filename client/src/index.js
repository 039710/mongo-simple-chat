import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Login from './pages/Login';
import VideoRoom from './pages/VideoRoom';
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
            <Route path="/video-group/:id" element={<VideoRoom />} />
        </Routes>
      </Router>
      {/* <App /> */}
    </Provider>
);
