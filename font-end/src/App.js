import './App.css';
import {useState} from "react";
import Stomp from "stompjs";
import SockJS from 'sockjs-client';

var stompClient = null
function App() {
  const [listMessage,setListMessage] = useState([]);
  const [user,setUser] = useState({
    name:"",
    message:"",
    connected:false
  })

  const connect=()=>{
    const socket = new SockJS("http://localhost:8080/websocket");
    stompClient = Stomp.over(socket);
    stompClient.connect({},onConnected,onError);
  }

  const onConnected=()=>{
      setUser({...user,"connected":true});
      stompClient.subscribe("/topic/public",handleReceiveMessage);
  }

  const onError=(e)=>{
    console.log(e)
  }

  const handleReceiveMessage=(payload)=>{
    const data = JSON.parse(payload.body);
    listMessage.push(data);
    setListMessage([...listMessage]);
  }


  const onChangeName=(e)=>{
    setUser({...user,"name":e.target.value})
  }

  const handleSendMessage=()=>{
    const chatMessage={
      name:user.name,
      message:user.message
    }
    const newUser = {...user}
    newUser.message="";
    setUser(newUser);
    stompClient.send("/app/message",{},JSON.stringify(chatMessage));
  }

  return (
    <>
      <div className="container">
        <button onClick={()=>{console.log(listMessage)}}>log</button>
        {user.connected ?
        <div>
          <ul>
            {listMessage.map((item,index)=>{
              return (
                  <li key={index}>{item.name} : {item.message}</li>
              )
            })}
            <div>
            <input onChange={(e)=>{setUser({...user,"message":e.target.value})}} value={user.message}/>
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </ul>
        </div> :
        <div>
          <input onChange={onChangeName} value={user.name}/>
          <button onClick={connect}>Sign In</button>
        </div>}
      </div>
    </>
  );
}

export default App;
