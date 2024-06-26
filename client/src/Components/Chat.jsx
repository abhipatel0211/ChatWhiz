import React, { useContext, useEffect, useRef, useState } from "react";
import Avtar from "./Avtar";
import Logo from "./Logo";
import { UserContext } from "./UserContext";
import { floor, uniqBy } from "lodash";
import axios from "axios";
import Contact from "./Contact";
import config from "../../config";
import notify from "../assets/sound.mp3";
// import notify from "..//assets/sound.mp3";

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, setselectedUserId] = useState(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const { email, id, setId, setemail } = useContext(UserContext);
  const divUnderMessages = useRef();

  useEffect(() => {
    connectToWs();
  }, []);

  function connectToWs() {
    // const ws = new WebSocket("ws://localhost:4000");
    const ws = new WebSocket(`ws://${config.REACT_APP_WS_URL}`);

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

  // import axios from "axios";

  function logout() {
    axios
      .post(`${config.REACT_APP_BACKEND_URL}/logout`)
      .then(() => {
        setWs(null);
        setId(null);
        setemail(null);

        // Clear the authentication token or session cookie
        const d = new Date();
        d.getTime();
        //  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
        let expires = "expires=" + d.toUTCString();
        document.cookie = `token=; ${expires}; path=/;`;

        // Optionally, you can also remove other relevant cookies if needed
        // document.cookie = "favorite-color=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // After clearing the cookie, you can redirect the user to the login page
        window.location.href = "/login";
      })
      .catch((error) => {
        // Handle the error if the logout request fails
        console.error("Logout failed:", error);
      });
  }

  // function logout() {
  //   axios.post("http://localhost:4000/logout").then(() => {
  //     setId(null);
  //     setemail(null);

  //     let removing = browser.cookies.remove({
  //       url: tabs[0].url,
  //       name: "favorite-color",
  //     });
  //     removing.then(onRemoved, onError);
  //     // cookies.remove("token");
  //     // removeCookies("token");
  //   });
  // }

  function sendMessage(ev, file = null) {
    if (ev) ev.preventDefault();
    // console.log("sending message", newMessageText);
    const message = newMessageText.trim();
    // console.log(message);
    if (!message && file == null) {
      console.log("no msg");
      alert("Add text in message box");
      return;
    }
    // setNewMessageText(newans);
    // newMessageText = newans;
    // console.log(newMessageText.length);
    // console.log(newMessageText);
    // if (newMessageText[0] == " ") {
    //   console.log("space found");
    // }
    // if (!newMessageText) {
    //   return;
    // }

    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
        file,
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
    if (file) {
      axios
        .get(`${config.REACT_APP_BACKEND_URL}/messages/` + selectedUserId, {
          withCredentials: true,
        })
        .then((res) => {
          // Handle the response data
          // console.log(`hello${res.data}`);
          // const { data } = res;
          setMessages(res.data);
          setMessages((prev) => [
            ...prev,
            {
              text: newMessageText,
              sender: id,
              recipient: selectedUserId,
              _id: Date.now(),
              file,
            },
          ]);
          // Perform further actions with the data
        })
        .catch((error) => {
          // Handle any errors that occurred during the request
          console.error(error);
        });
    } else {
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
  }

  function sendFile(ev) {
    console.log(ev.target.files); // we will get the file here
    // const file = ev.taret.file[0];
    const maxFileSize = (1 / 2) * 1024 * 1024; //0.5 mb
    // alert(ev.target.files[0].size);
    // console.log(ev.target.files.size);
    if (ev.target.files && ev.target.files[0].size > maxFileSize) {
      alert(
        "File size exceeds the allowed limit. Please choose a smaller file. (0.5 MB)"
      );
      fileInput.value = ""; // Clear the file input to allow the user to choose a different file
    } else {
      const reader = new FileReader();
      reader.readAsDataURL(ev.target.files[0]);
      reader.onload = () => {
        sendMessage(null, {
          name: ev.target.files[0].name,
          data: reader.result,
        });
      };
    }
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
    axios.get(`${config.REACT_APP_BACKEND_URL}/people`).then((res) => {
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
      // console.log("hello message");
      axios
        .get(`${config.REACT_APP_BACKEND_URL}/messages/` + selectedUserId, {
          withCredentials: true,
        })
        .then((res) => {
          // Handle the response data
          // console.log(res.data.filebase64);
          // if(res.data.)
          // const { data } = res;
          // setNewMessageText("");
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
    // console.log(ev);
    // console.log("new message", ev.data);
    const messageData = JSON.parse(ev.data);
    // console.log(messageData);
    // console.log(selectedUserId);
    console.log(id);
    if (id == messageData.recipient) {
      // console.log("yes found");
      var audio = new Audio(notify);
      audio.play();
    }
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
      // if(messageData.recipient == )
      // if(messageData.)
      // console.log("hello0");
    } else if ("text" in messageData) {
      // console.log({ messageData });

      //now to handle the message received by the other user we have to put it in the messages array as down
      const sender = messageData.sender;
      // console.log(selectedUserId);
      if (sender === selectedUserId) {
        setMessages((prev) => [...prev, { ...messageData }]);
      }
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

  // function base64ToFile(base64Data, filename) {
  //   const arr = base64Data.split(",");
  //   const mimeType = arr[0].match(/:(.*?);/)[1];
  //   const bstr = atob(arr[1]);
  //   let n = bstr.length;
  //   const u8arr = new Uint8Array(n);
  //   while (n--) {
  //     u8arr[n] = bstr.charCodeAt(n);
  //   }
  //   return new File([u8arr], filename, { type: mimeType });
  // }

  // function getFileMimeType(filename) {
  //   const extension = filename.split(".").pop();
  //   switch (extension.toLowerCase()) {
  //     case "jpg":
  //     case "jpeg":
  //       return "image/jpeg";
  //     case "png":
  //       return "image/png";
  //     case "gif":
  //       return "image/gif";
  //     case "pdf":
  //       return "application/pdf";
  //     case "txt":
  //       return "text/plain";
  //     // Add more cases for other file types as needed
  //     default:
  //       return "application/octet-stream";
  //   }
  // }
  const [isDragging, setIsDragging] = useState(false);
  const [width, setWidth] = useState(33.33); // Initial width in percentage

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!isDragging) return;
      let newWidth = (event.clientX / window.innerWidth) * 100;
      if (newWidth < 25) {
        newWidth = 25;
      } else if (newWidth > 70) {
        newWidth = 70;
      }
      console.log("New width:", newWidth);
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      console.log("Mouse up");
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = () => {
    setIsDragging(true);
    console.log("Mouse down");
  };

  useEffect(() => {
    console.log("isDragging:", isDragging);
  }, [isDragging]);

  return (
    <div className="flex h-screen ">
      <div className={`bg-white flex`} style={{ width: `${width}%` }}>
        <div className="flex flex-col flex-grow ">
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
          <div className="p-2 flex-1 text-center flex justify-center items-end">
            <span className="mr-2 text-sm text-gray-600 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                  clipRule="evenodd"
                />
              </svg>
              {email}
            </span>
            <button
              onClick={logout}
              className="text-sm text-gray-600 bg-blue-200 py-1 px-2 border rounded-sm h-fit"
            >
              logout
            </button>
          </div>
        </div>
        <div
          className="resize-handle flex justify-center items-center"
          onMouseDown={handleMouseDown}
        >
          <div
            className="h-full resize-handle bg-gray-200 w-1 cursor-col-resize"
            onMouseDown={handleMouseDown}
          >
            {/* &#x2194; */}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col bg-blue-200 p-2">
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
                      {message.file && message.filebase64 && (
                        <div className="flex ">
                          {/* <a
                            className="flex items-center gap-1 border-b"
                            href={URL.createObjectURL(`data:${getFileMimeType(
                              message.file
                            )};base64, ${message.filebase64.split(",")[1]}`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            // href={`data:${getFileMimeType(
                            //   message.file
                            // )};base64, ${message.filebase64.split(",")[1]}`}
                            // target="_blank"
                          >
                            Download {message.file}
                            <img
                              src={`data:${getFileMimeType(
                                message.file
                              )};base64, ${message.filebase64.split(",")[1]}`}
                              // src={`data:image/jpeg;base64, ${
                              //   message.filebase64.split(",")[1]
                              // }`}
                              // src={base64ToFile(message.filebase64, message.file)}
                              alt={message.file}
                            /> */}
                          <a
                            className="flex items-center gap-1 border-b"
                            href={`${message.filebase64}`}
                            // href={`data:application/octet-stream;base64,${
                            //   message.filebase64.split(",")[1]
                            // }`}
                            download={message.file}
                            // href={
                            //   "http://localhost:4000/uploads/" + message.file
                            // }
                            // target="_blank"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="w-5 h-5"
                            >
                              <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                              <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                            </svg>

                            {/* <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z"
                                clipRule="evenodd"
                              />
                            </svg> */}
                            {message.file}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={divUnderMessages}></div>
              </div>
            </div>
          )}
        </div>
        {!!selectedUserId && ( //two !! means it will be in true or false
          <form className="flex mx-2 gap-2">
            <input
              type="text"
              className="flex-grow bg-white border p-2 rounded-md"
              value={newMessageText}
              onChange={(ev) => setNewMessageText(ev.target.value)}
              placeholder="Type your message here"
              // required
            />

            <label className="bg-blue-300 text-gray-600 p-2 rounded-md border-blue-200 cursor-pointer">
              <input
                className="hidden"
                onClick={() => {
                  console.log("clicked on mic");
                }}
              />
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
                  d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
                />
              </svg>
            </label>
            <label className="bg-blue-300 text-gray-600 p-2 rounded-md border-blue-200 cursor-pointer">
              <input type="file" className="hidden" onChange={sendFile} />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path
                  fillRule="evenodd"
                  d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z"
                  clipRule="evenodd"
                />
              </svg>
            </label>
            <button
              type="button"
              className=" bg-blue-500 text-white p-2 rounded-md"
              onClick={sendMessage}
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
