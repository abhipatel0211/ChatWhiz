//Done upto 4:11

import React, { useContext, useEffect, useRef, useState } from "react";
import Avtar from "./Avtar";
import Logo from "./Logo";
import { UserContext } from "./UserContext";
import { uniqBy } from "lodash";
import axios from "axios";
import Contact from "./Contact";

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, setselectedUserId] = useState(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const { email, id } = useContext(UserContext);
  const divUnderMessages = useRef();

  useEffect(() => {
    connectToWs();
  }, []);

  function connectToWs() {
    const ws = new WebSocket("ws://localhost:4000");

    ws.addEventListener("open", () => {
      // console.log("Connected to WebSocket");
    });
    setWs(ws);
    // console.log("hello ws");
    // console.log(ws);
    ws.addEventListener("message", (event) => {
      const message = event.data;
      handleMessage(event);
    });
    ws.addEventListener("close", () => {
      setTimeout(() => {
        console.log("disconnected trying to connect");
        connectToWs();
      }, 1000);
    });
  }

  function showOnlinePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({ userId, email }) => {
      people[userId] = email;
    });
    // console.log(people);
    setOnlinePeople(people);
  }

  function sendMessage(ev) {
    ev.preventDefault();
    // console.log("sending message");

    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
      })
    );
    setNewMessageText("");
    setMessages((prev) => [
      ...prev,
      {
        text: newMessageText,
        sender: id,
        recipient: selectedUserId,
        _id: Date.now(),
      },
    ]);
  }

  useEffect(() => {
    const div = divUnderMessages.current; //it is the refreance to letest
    if (div) {
      div.scrollIntoView({ behavior: "smooth" });
    }
    // console.log(div);
    // div.scrolltop = div.scrollHeight
  }, [messages]);

  useEffect(() => {
    axios.get("http://localhost:4000/people").then((res) => {
      const offlinePeopleArr = res.data
        .filter((p) => p._id !== id) // here it will first filter and remove the person itself
        .filter((p) => !Object.keys(onlinePeople).includes(p._id)); //now here it will filter the person that are online by the object as online people is the object and now it
      // here object.keys is used as it gives the array of the given object onlinePeople and not will remove the people which are online so it can be easily used to remove the people that are online now the list is only of the offline people
      // console.log(offlinePeople);
      const offlinePeople = {};
      offlinePeopleArr.forEach((p) => {
        offlinePeople[p._id] = p;
      });
      // console.log({ offlinePeople, offlinePeopleArr });//here offlinepeople is an object where the key is the id of the user while offlinePeopleArr is an array with the people who are offline
      // console.log(offlinePeople);
      setOfflinePeople(offlinePeople);
    });
  }, [onlinePeople]);

  useEffect(() => {
    if (selectedUserId) {
      console.log("hello message");
      axios
        .get("http://localhost:4000/messages/" + selectedUserId, {
          withCredentials: true,
        })
        .then((res) => {
          // Handle the response data
          // console.log(response.data);
          // const { data } = res;
          setMessages(res.data);
          // Perform further actions with the data
        })
        .catch((error) => {
          // Handle any errors that occurred during the request
          console.error(error);
        });
    }
  }, [selectedUserId]);

  function handleMessage(ev) {
    // console.log('new message', ev.data);
    const messageData = JSON.parse(ev.data);
    // console.log(messageData);
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else if ("text" in messageData) {
      // console.log({ messageData });

      //now to handle the message received by the other user we have to put it in the messages array as down
      setMessages((prev) => [...prev, { ...messageData }]);
    }
    // ev.data.text().then(messageString => {
    //   console.log(messageString);
    // })
  }

  // function selectContact(userId) {

  // }

  const onlinePeopleExclOurUser = { ...onlinePeople };
  delete onlinePeopleExclOurUser[id];
  // console.log("hello online" +id+" "+email);
  // console.log(onlinePeopleExclOurUser);

  const messageWithoutDups = uniqBy(messages, "_id");
  // const messageWithoutDups = messages;

  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3">
        <div>
          <Logo />
          {Object.keys(onlinePeopleExclOurUser).map((userId) => (
            <Contact
              key={userId}
              id={userId}
              online={true}
              email={onlinePeopleExclOurUser[userId]}
              onClick={() => setselectedUserId(userId)}
              selected={userId === selectedUserId}
            />
          ))}
          {Object.keys(offlinePeople).map((userId) => (
            <Contact
              key={userId}
              id={userId}
              online={false}
              email={offlinePeople[userId].email}
              onClick={() => setselectedUserId(userId)}
              selected={userId === selectedUserId}
            />
          ))}
        </div>
        <div>links</div>
      </div>
      <div className="flex flex-col bg-blue-200 w-2/3 p-2">
        <div className="flex-grow">
          {!selectedUserId && (
            <div className="flex h-full flex-grow items-center justify-center">
              <div className="text-gray-400">
                &larr; Select the person from sidebar
              </div>
            </div>
          )}
          {!!selectedUserId && (
            <div className="relative h-full">
              <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2 ">
                {messageWithoutDups.map((message) => (
                  <div
                    key={message._id}
                    className={
                      message.sender === id ? "text-right" : "text-left"
                    }
                  >
                    <div
                      className={
                        "text-left inline-block p-2  m-2 rounded-md  text-sm " +
                        (message.sender === id
                          ? "bg-blue-500 text-white "
                          : "bg-white text-gray-500")
                      }
                    >
                      {/* sender:{message.sender}
                      <br />
                      my id:{id}
                      <br /> */}
                      {message.text}
                    </div>
                  </div>
                ))}
                <div ref={divUnderMessages}></div>
              </div>
            </div>
          )}
        </div>
        {!!selectedUserId && ( //two !! means it will be in true or false
          <form className="flex mx-2 gap-2" onSubmit={sendMessage}>
            <input
              type="text"
              className="flex-grow bg-white border p-2 rounded-md"
              value={newMessageText}
              onChange={(ev) => setNewMessageText(ev.target.value)}
              placeholder="Type your message here"
            />
            <button
              type="submit"
              className=" bg-blue-500 text-white p-2 rounded-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Chat;
