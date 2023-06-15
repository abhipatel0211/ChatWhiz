import React, { useContext, useEffect, useState } from 'react'
import Avtar from './Avtar';
import Logo from './Logo';
import { UserContext } from './UserContext';

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectedUserId, setselectedUserId] = useState(null);
  const { email,id  } = useContext(UserContext);


  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000");

    ws.addEventListener('open', () => {
      console.log('Connected to WebSocket');
    });
    setWs(ws);
    console.log("hello ws");
    console.log(ws);
    ws.addEventListener('message', (event) => {
      const message = event.data;
      handleMessage(event);
    });
  }, []);

  function showOnlinePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({userId,email}) => {
      people[userId] = email;
    });
    console.log(people);
    setOnlinePeople(people);
  }


  function handleMessage(ev) {
    // console.log('new message', ev.data);
    const messageData = JSON.parse(ev.data);
    console.log(messageData);
    if ('online' in messageData) {
      showOnlinePeople(messageData.online);
    }
    // ev.data.text().then(messageString => {
    //   console.log(messageString);
    // })
  }

  // function selectContact(userId) {

  // }

  const onlinePeopleExclOurUser = { ...onlinePeople };
  delete onlinePeopleExclOurUser[id];
  console.log("hello online" +id+" "+email);
  console.log(onlinePeopleExclOurUser);

  return (
    <div className='flex h-screen'>
      <div className="bg-white w-1/3">
        <Logo />
        {Object.keys(onlinePeopleExclOurUser).map(userId => (
          <div key={userId} onClick={ () => setselectedUserId(userId)} className={"border-b border-gray-100 py-2 pl-4 flex items-center gap-2 border cursor-pointer " + (userId === selectedUserId ? 'bg-blue-200':'')}>
            {userId === sle}
            <Avtar email={onlinePeople[userId]} userId={userId}  />
            <span className="text-gray-800" >{onlinePeople[userId]}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col bg-blue-200 w-2/3 p-2">
        <div className="flex-grow" >
          <div className='text-blue-600 bold flex justify-center items-center text-3xl '>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
          </svg>

          messages with selected person

          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
  <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
</svg>

          </div>
        </div>
        <div className="flex mx-2 gap-2"> 
          <input type="text" className="flex-grow bg-white border p-2 rounded-md" placeholder="Type your message here" />
          <button className=" bg-blue-500 text-white p-2 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
</svg>

          </button>
        </div>
      </div>
    </div>
  )
}

export default Chat;