import React from "react";
import { useState } from "react";
// import axios form "axios";
import axios from "axios";

function Home() {
    const [email, setemail] = useState('');
    const [password, setpassword] = useState('');
    // function onclickRegister() {
    async function onclickRegister(e) {
        if (!email && !password)
            alert("Enter email or password")
        else {
            e.preventDefault();
            alert(password + email);
            try {
                await axios
                    .post("http://127.0.0.1:4000/reg", { email, password })
                    .then((res) => {
                        alert(password + email);
                        if (res.data == "exist") {
                            alert("Login successful");
                        } else if (res.data == "notexist") {
                            history("/home", { state: { id: email } });
                            // alert("login success");
                        } else {
                            alert(" other error " + res);
                        }
                    })
                    .catch((e) => {
                        alert("wrong details in signup" + e);
                        console.log(e);
                    });
            } catch (e) {
                console.log(e);
            }
        }
    }
    // }

    return (

        <>
            <div className="bg-blue-100 h-screen m-auto flex items-center">
                <form className="w-64 mx-auto">
                    <p>Login</p>
                    <input value={email} onChange={ (ev) => setemail(ev.target.value)} className="block w-full p-2 mb-2 border" type="email" placeholder="username" required/>
                    <input value={password} onChange={ (ev) => setpassword(ev.target.value)}className="block w-full p-2 mb-2 border" type="password" placeholder="password" required/>
                    <input type="submit" value="Register"className="bg-blue-500 text-white block w-full rounded-sm p-2" onClick={onclickRegister} />
                        {/* Register</button> */}
                </form>
            </div>
        </>
    );

}
export default Home;