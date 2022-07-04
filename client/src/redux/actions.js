const axios = require('axios');
const expand = {
  users: '_expand=users',
  rooms: '_expand=rooms',
}
const API = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 1000,
  headers: { 'Content-Type': 'application/json' }
});


export const fetchMessages = (roomId,token) => {
  console.log('token',token)
  return async dispatch => {
    dispatch({
      type: 'SET_MESSAGES',
      payload: []
    });
    const response = await API.get('/room/' + roomId,{
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    dispatch({
      type: 'SET_MESSAGES',
      payload: response.data.conversation
    });
  }
}

export const addMessage = (data) => {
  return async dispatch => {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: data
    });
  }
}

export const fetchRooms = (userId, token) => {
  return async dispatch => {
    const response = await API.get('/room/user/' + userId, { headers: { 'Authorization': 'Bearer ' + token } });
    dispatch({
      type: 'SET_ROOMS',
      payload: response.data.rooms
    });
    if (response.data.rooms.length > 0) {
      dispatch({
        type: 'SET_CURRENT_ROOM',
        payload: {
          _id: response.data.rooms[response.data.rooms.length - 1]._id,
          name : response.data.rooms[response.data.rooms.length - 1].name
        }
      })
      dispatch(fetchMessages(response.data.rooms[response.data.rooms.length - 1]._id,token));
    }
  }
}

export const fetchUser = (userId) => {
  return async dispatch => {
    const response = await API.get('/users/' + userId);
    dispatch({
      type: 'SET_USER',
      payload: response.data
    });
  }
}

export const postMessage = (currentRoom,message,token) => {
  return async dispatch => {
    const response = await API.post('/room/'+currentRoom+'/message',{
      messageText: message
      },{
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    const {post} = response.data
    dispatch(addMessage(post))
    // dispatch(fetchMessages(message.roomsId));
  }
}

export const logIn = (data) => {
  return async dispatch => {
    const response = await API.post('/login', {
      email: data.email,
      password: data.password
    });
    const { user, authorization } = response.data;
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', authorization);
    dispatch({
      type: 'SET_USER',
      payload: user
    });
  }
}
