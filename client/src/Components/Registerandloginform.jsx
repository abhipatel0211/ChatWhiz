import React, { useContext } from "react";
import { useState } from "react";
import axios from "axios";

import { UserContext } from "./UserContext";

function Register() {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [Alreadylogedinorregister, setAlreadylogedinorregister] =
    useState("login");
  const { setemail: setLoggedInUsername, setId } = useContext(UserContext);

  //the any function which is done awaits is done async
  async function handlesubmit(e) {
    e.preventDefault();
    // alert(email+" "+password);
    const url = Alreadylogedinorregister === "register" ? "register" : "login";
    try {
      // alert("complete");
      console.log("start try");
      console.log(`http://localhost:4000/${url}`);
      // var xhr = new XMLHttpRequest();
      // xhr.withCredentials = true;

      // Rest of your XMLHttpRequest code

      if (url === "register") {
        await axios
          .post(`http://localhost:4000/${url}`, { email, password })
          .then((res) => {
            //After Register
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
          })
          .catch((e) => {
            console.log("error in try ", e);
          });
      } else if (url === "login") {
        await axios
          .post(`http://localhost:4000/${url}`, { email, password })
          .then((res) => {
            //After Register
            // console.log(res.headers);
            // console.log(res);
            // console.log("Hello")
            // console.log(res.Cookies);
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
          })
          .catch((e) => {
            console.log("error in try ", e);
          });
      }
    } catch (err) {
      console.log("error after try", err);
    }
  }

  return (
    <>
      <div className="bg-blue-100 h-screen flex items-center">
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

          <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
            {Alreadylogedinorregister === "register" ? "Register" : "Login"}
          </button>

          {Alreadylogedinorregister === "register" && (
            <div className="text-center mt-2">
              Already a user ?{" "}
              <button onClick={() => setAlreadylogedinorregister("login")}>
                Login here
              </button>
            </div>
          )}
          {Alreadylogedinorregister === "login" && (
            <div className="text-center mt-2">
              Dont have account ?{" "}
              <button onClick={() => setAlreadylogedinorregister("register")}>
                Register Here
              </button>
            </div>
          )}
        </form>
      </div>
    </>
  );
}
export default Register;
