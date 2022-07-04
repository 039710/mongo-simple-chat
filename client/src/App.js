
// import useSelector and useDispatch from react-redux
import { useEffect,useRef,useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import io from 'socket.io-client';
import { fetchMessages, fetchRooms, postMessage,addMessage } from './redux/actions';
import { useNavigate } from 'react-router-dom';
const socket = io('http://localhost:3000/');
function App() {
  const dispatch = useDispatch();
  const navigator = useNavigate();
  const { rooms, currentRoom,messages : conversations,user } = useSelector(state => state);
  const [onlineUsers,setOnlineUsers] = useState([]);
  const [token,setToken] = useState('');
  const newMessage = useRef(null);
  const handleChangeRoom = (room) => {
    console.log(currentRoom._id,room._id)
    socket.emit('unsubscribe',currentRoom._id);
    dispatch({
      type: 'SET_CURRENT_ROOM',
      payload: room
    });
    dispatch(fetchMessages(room._id,token))
  } 
  const handleNewMessage = (e) => {
    if(e.keyCode === 13 || !e){
      dispatch(postMessage(currentRoom._id, newMessage.current.value,token));
      newMessage.current.value = '';
    }
  }
  useEffect(()=>{
    console.log('initial useEffect')
    if(!user && !localStorage.getItem('user')){
      navigator('/login')
    }else if(localStorage.getItem("user")){
      dispatch({type:"SET_USER",payload:JSON.parse(localStorage.getItem("user"))})
      const userId = JSON.parse(localStorage.getItem("user"))._id;
      const token = localStorage.getItem("token");
      setToken(token);
      dispatch(fetchRooms(userId,token));
    }
    
  },[])
  useEffect(()=>{
    if(user?.firstName){
      if(currentRoom && currentRoom._id){
        console.log('subscribe to room',currentRoom._id)
        socket.emit('identity', ({userId : user?._id, roomId :currentRoom._id}))
        socket.emit('subscribe', ({ userId: user?._id, roomId: currentRoom._id }));
      }
    }
  },[currentRoom?._id])
  useEffect(() => {
    console.log('socket useEffect')
    socket.on('userJoined', (data) => {
      console.log(`user with id ${data.user.name}, has been joined the room ${data.roomsId}`)
    })
    socket.on('new message', (message) => {
      console.log(user)
      const userId = user._id
      if (message.message.postedByUser._id !== userId){
        console.log(message.message.postedByUser._id, userId)
        dispatch(addMessage(message.message))
      }
    })
    socket.on('onlineUsers', (data) => {
      if(data[currentRoom._id]){
        console.log(data)
        console.log(`online users in room ${currentRoom._id} => ${data[currentRoom._id].length}`)
        setOnlineUsers(data[currentRoom._id].length)
      }

    })
  }, [socket])
  return (
    <div className="h-screen w-screen bg-indigo-300 flex space-x-2 p-2">
      <div id="list-rooms" className="p-2 w-[10%] rounded-md rounded-br-md h-full bg-indigo-400 relative">
        <h1 className="underline">Rooms</h1>
        {/* list rooms */}
        {rooms.length == 0 && <p className="text-white mt-3">No rooms yet</p> }
        <div className="flex flex-col py-5">
          {rooms.map((room, idx) => <div key={room._id} >
            <div onClick={e => handleChangeRoom(room)}  className={currentRoom._id != room._id ? "border bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-1 px-2 rounded cursor-pointer mb-1" : "border mb-1 bg-indigo-700 hover:bg-indigo-700 text-white font-bold py-1 px-2 rounded cursor-pointer"}>
              {room.name}
            </div>
            {room.subRooms.length !== 0 && (
              <div className="flex flex-col space-y-1 ml-3">
                {room.subRooms.map((subRoom, idx) => <div key={subRoom._id} onClick={e => handleChangeRoom(subRoom)}  className={currentRoom._id != subRoom._id ? "bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-1 px-2 rounded cursor-pointer border" : "bg-indigo-700 hover:bg-indigo-700 text-white font-bold py-1 px-2 rounded cursor-pointer"}>
                  {subRoom.name}
                </div>)}
              </div>
            )}
          </div>
          )}
        </div>
        {/* logged in users */}
        <div className="absolute bottom-0 left-0 flex flex-col space-y-2 py-5 w-full px-2 ">
          <button className="bg-indigo-600 w-full hover:bg-indigo-700 text-white font-bold py-1 px-2 rounded">
            {user?.firstName + " " + user?.lastName}
          </button>
          {/* logout */}
          
        </div>
      </div>
      <div id="chat-room" className="p-2 w-[90%] rounded-md rounded-bl-md h-full bg-indigo-400 relative">
        <div className="flex justify-around w-full">
          <h1 className="underline mb-5">Chat Room {currentRoom?.name ? currentRoom?.name : ""}</h1>
          <h1>Online Users {onlineUsers?.length}</h1>
        </div>
        {/* chat room */}
        <div className="px-1 flex flex-col space-y-2 bg-indigo-400 rounded-md max-h-[80%] min-h-[80%] overflow-y-scroll">
          {/* messages */}
          {conversations.length == 0 && <div className="text-center text-white">No conversations</div>}
          {conversations.map((item, idx) => <div key={idx} className={item.postedByUser?._id != user._id ? "rounded-md bg-indigo-500" : "rounded-md bg-indigo-700 text-right pr-3"}>
            <div className="w-full flex flex-col pl-2 pb-2">
              <span className='text-gray-100 font-bold '>{item?.postedByUser?.firstName + " " + item?.postedByUser?.lastName} | {new Date(item.createdAt).toTimeString().split(" ")[0]}</span>
              <span className="pl-3 text-white">{item.message?.messageText}</span>
            </div>
          </div>)}
        </div>

        {/* input message */}
        <div className="absolute bottom-5  w-full flex flex-col pr-4 space-y-2 rounded-md">
          
          <input ref={newMessage} onKeyDown={e => handleNewMessage(e)}  className="w-full p-2 rounded-md" type="text" placeholder="Type a message..." />
            <button onClick={e=>handleNewMessage()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-2 rounded">
              Send
            </button>
        
          </div>
      </div>
    </div>
  );
}

export default App;
