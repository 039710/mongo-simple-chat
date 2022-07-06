import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {useEffect,useRef,useState} from 'react'
import io from "socket.io-client";
import Peer from "simple-peer";
import {useParams} from 'react-router-dom'
function VideoRoom() {
  // get the current room
  const dispatch = useDispatch();
  const {user} = useSelector(state => state)
  const {id:roomID} = useParams()
  const [peers, setPeers] = useState([]);
  const [audioFlag, setAudioFlag] = useState(true);
  const [videoFlag, setVideoFlag] = useState(true);
  const [userUpdate, setUserUpdate] = useState([]);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const videoConstraints = {
    minAspectRatio: 1.333,
    minFrameRate: 60,
    height: window.innerHeight / 1.8,
    width: window.innerWidth / 3,
  };
  useEffect(() => {
    console.log('use effect')
    socketRef.current = io.connect("http://localhost:3000/");
    if(localStorage.getItem('user')){
      dispatch({
        type: 'SET_USER',
        payload: JSON.parse(localStorage.getItem('user'))
      })
    }
  }, []);
  useEffect(()=>{
    if(user){
      console.log(user._id,roomID)
      socketRef.current.emit('identity',({ userId: user._id, roomId: roomID }));
      createStream();
    }
  },[user])
  const Video = (props) => {
    const ref = useRef();

    useEffect(() => {
      props.peer.on("stream", (stream) => {
        ref.current.srcObject = stream;
      });
    }, []);

    return <video playsInline autoPlay ref={ref} />;
  };
  const createStream = async () => {
    navigator.mediaDevices
      .getUserMedia({ video: videoConstraints, audio: true })
      .then((stream) => {
        userVideo.current.srcObject = stream;
        console.log('ini roomID',roomID)
        socketRef.current.emit("subscribe", (roomID));
        socketRef.current.on("all users", (users) => {
          console.log(users)
          const peers = [];
          users.forEach((user) => {
            console.log(user,'<<<<<')
            const peer = createPeer(user.userId, socketRef.current.id, stream);
            peersRef.current.push({
              peerID: user.userId,
              peer,
            });
            peers.push({
              peerID: user.userId,
              peer,
            });
          });
          setPeers(peers);
        });
        socketRef.current.on("user joined", (payload) => {
          console.log("==", payload)
          const peer = addPeer(payload.signal, payload.callerID, stream);
          peersRef.current.push({
            peerID: payload.callerID,
            peer,
          });
          const peerObj = {
            peer,
            peerID: payload.callerID,
          };
          setPeers((users) => [...users, peerObj]);
        });

        socketRef.current.on("user left", (id) => {
          const peerObj = peersRef.current.find((p) => p.peerID === id);
          if (peerObj) {
            peerObj.peer.destroy();
          }
          const peers = peersRef.current.filter((p) => p.peerID !== id);
          peersRef.current = peers;
          setPeers(peers);
        });

        socketRef.current.on("receiving returned signal", (payload) => {
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          item.peer.signal(payload.signal);
        });

        socketRef.current.on("change", (payload) => {
          setUserUpdate(payload);
        });
      });
  }
  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
      });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("returning signal", { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  return (
    <div className='h-screen w-screen bg-indigo-400 p-3 flex space-x-2 flex-wrap justify-center items-center'>
      {/* video grid */}
      <div className='text-white flex flex-col items-center justify-center min-w-[400px] min-h-[400px] bg-indigo-500 rounded-md'>
        <video muted ref={userVideo} autoPlay playsInline />
        <div className="flex space-x-2">
          <div onClick={() => {
            if (userVideo.current.srcObject) {
              userVideo.current.srcObject.getTracks().forEach(function (track) {
                if (track.kind === "video") {
                  if (track.enabled) {
                    socketRef.current.emit("change", [...userUpdate, {
                      id: socketRef.current.id,
                      videoFlag: false,
                      audioFlag,
                    }]);
                    track.enabled = false;
                    setVideoFlag(false);
                  } else {
                    socketRef.current.emit("change", [...userUpdate, {
                      id: socketRef.current.id,
                      videoFlag: true,
                      audioFlag,
                    }]);
                    track.enabled = true;
                    setVideoFlag(true);
                  }
                }
              });
            }
          }}>
          {videoFlag ? <button className="bg-indigo-600 py-1 px-2 rounded-md">Video on</button> : <button className="bg-indigo-600 py-1 px-2 rounded-md">Video off</button>}
        </div>
        <div onClick={() => {
            if (userVideo.current.srcObject) {
              userVideo.current.srcObject.getTracks().forEach(function (track) {
                if (track.kind === "audio") {
                  if (track.enabled) {
                    socketRef.current.emit("change", [...userUpdate, {
                      id: socketRef.current.id,
                      videoFlag,
                      audioFlag: false,
                    }]);
                    track.enabled = false;
                    setAudioFlag(false);
                  } else {
                    socketRef.current.emit("change", [...userUpdate, {
                      id: socketRef.current.id,
                      videoFlag,
                      audioFlag: true,
                    }]);
                    track.enabled = true;
                    setAudioFlag(true);
                  }
                }
              });
            }
          }}>
          {audioFlag ? <button className="bg-indigo-600 py-1 px-2 rounded-md">Audio on</button> : <button className="bg-indigo-600 py-1 px-2 rounded-md">Audio off</button>}
        </div>
        </div>
      </div>
      {peers.map((peer,index) => {
        {console.log(peers,'<<< ini peers')}
        let audioFlagTemp = true;
        let videoFlagTemp = true;
        if (userUpdate) {
          userUpdate.forEach((entry) => {
            if (peer && peer.peerID && peer.peerID === entry.id) {
              audioFlagTemp = entry.audioFlag;
              videoFlagTemp = entry.videoFlag;
            }
          });
        }
        return (
          <div key={peer.peerID} className='text-white flex flex-col items-center justify-center min-w-[400px] min-h-[400px] bg-indigo-500 rounded-md'>
            <Video peer={peer.peer} />
            <div className="flex space-x-2">
              {videoFlag ? <button className="bg-indigo-600 py-1 px-2 rounded-md">Video on</button> : <button className="bg-indigo-600 py-1 px-2 rounded-md">Video off</button>}
              {audioFlag ? <button className="bg-indigo-600 py-1 px-2 rounded-md">Audio on</button> : <button className="bg-indigo-600 py-1 px-2 rounded-md">Audio off</button>}
            </div>
          </div>
        );
      })}
     
    </div>
  )
}

export default VideoRoom