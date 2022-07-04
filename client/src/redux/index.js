import { configureStore } from '@reduxjs/toolkit'
import thunk from 'redux-thunk'
const initialState = {
  count: 0,
  rooms: [],
  messages: [],
  users: [],
  currentRoom: null,
  user : null,
}
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload
      };
    case 'SET_ROOMS':
      return {
        ...state,
        rooms: action.payload
      };
    case 'SET_COUNTS':
      return {
        ...state,
        count: action.payload
      };
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: action.payload
      };
    case 'SET_CURRENT_ROOM':
      return {
        ...state,
        currentRoom: action.payload
      };
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload]
      }

    default:
      return state;
  }
}
const store = configureStore({
  reducer,
  devTools: true,
  middleware: [thunk]
})

export default store;