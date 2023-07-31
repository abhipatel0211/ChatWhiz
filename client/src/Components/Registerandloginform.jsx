import React, { useContext } from "react";
import { useState } from "react";
import axios from "axios";
import config from "../../config";

import { UserContext } from "./UserContext";

function Register() {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [Alreadylogedinorregister, setAlreadylogedinorregister] =
    useState("login");
  const { setemail: setLoggedInUsername, setId } = useContext(UserContext);
  // const backendurl = process.env.REACT_APP_BACKEND_URL;
  //the any function which is done awaits is done async
  async function handlesubmit(e) {
    e.preventDefault();
    // alert(email+" "+password);
    const url = Alreadylogedinorregister === "register" ? "register" : "login";
    try {
      // alert("complete");
      console.log("start try");
      console.log(`hello ${config.REACT_APP_BACKEND_URL}/${url}`);
      // var xhr = new XMLHttpRequest();
      // xhr.withCredentials = true;

      // Rest of your XMLHttpRequest code

      if (url === "register") {
        await axios
          .post(`${config.REACT_APP_BACKEND_URL}/${url}`, { email, password })
          .then((res) => {
            //After Register
            if (res.data === "email_already_exist") {
              alert("username already exist use other username");
            } else {
              console.log(res.headers);
              console.log(res);
              console.log("Hello");
              console.log(res.Cookies);
              setLoggedInUsername(email);
              setId(res.data.id);
              const d = new Date();
              d.getTime();
              //  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
              d.setTime(d.getTime() + 24 * 60 * 60 * 1000);
              let expires = "expires=" + d.toUTCString();
              // document.cookie = `token=${res.data.token}`;
              document.cookie = `token=${res.data.token}; ${expires}; path=/;`;
              console.log(res);
            }
          })
          .catch((e) => {
            console.log("error in try of register", e);
          });
      } else if (url === "login") {
        await axios
          .post(`${config.REACT_APP_BACKEND_URL}/${url}`, { email, password })
          .then((res) => {
            //After Register
            // console.log(res.headers);
            // console.log(res);
            // console.log("Hello")
            // console.log(res.Cookies);
            // if(res)
            if (res.data === "wrong_password") {
              alert("Wrong Password Try again");
            } else if (res.data === "no_email") {
              alert("No user found Please create your account");
            } else {
              console.log(res);
              setLoggedInUsername(email);
              setId(res.data.id);
              const d = new Date();
              d.getTime();
              //  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
              d.setTime(d.getTime() + 24 * 60 * 60 * 1000);
              let expires = "expires=" + d.toUTCString();
              // document.cookie = `token=${res.data.token}`;
              document.cookie = `token=${res.data.token}; ${expires}; path=/;`;
              console.log(res);
            }
          })
          .catch((e) => {
            console.log("error in try of login ", e);
          });
      }
    } catch (err) {
      console.log("error after try", err);
    }
  }

  return (
    <>
      {/* bg-blue-100 bg-[#6C63FF]   #ECECEC*/}
      <div className="flex bg-[#bd91e6] m-2 h-full">
        <div className="mx-7 w-1/2 max-md:hidden md:flex lg:flex items-center justify-center">
          <img src="\src\assets\svg\login_chat.svg" alt="SVG Image" />
        </div>
        <div className=" h-screen w-1/2 max-md:w-full  flex items-center">
          <form className="w-64 mx-auto" onSubmit={handlesubmit}>
            {/* <p>Register</p> */}
            <input
              value={email}
              onChange={(ev) => setemail(ev.target.value)}
              className="block w-full p-2 mb-2 border"
              type="text"
              placeholder="username"
              required
            />
            <input
              value={password}
              onChange={(ev) => setpassword(ev.target.value)}
              className="block w-full p-2 mb-2 border"
              type="password"
              placeholder="password"
              required
            />
            {/* bg-blue-500 #32CD32 */}
            <button className="bg-[#32CD32] text-white block w-full rounded-sm p-2">
              {Alreadylogedinorregister === "register" ? "Register" : "Login"}
            </button>

            {Alreadylogedinorregister === "register" && (
              <div className="text-center mt-4">
                Already a user ?
                <button
                  className="font-bold m-2"
                  onClick={() => setAlreadylogedinorregister("login")}
                >
                  Login here
                </button>
              </div>
            )}
            {Alreadylogedinorregister === "login" && (
              <div className="text-center mt-4 ">
                Dont have account ?
                <button
                  className="font-bold m-2"
                  onClick={() => setAlreadylogedinorregister("register")}
                >
                  Register Here
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
export default Register;
