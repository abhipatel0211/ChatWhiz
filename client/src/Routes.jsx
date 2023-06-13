
import { useContext } from 'react';
import Register from './Components/Registerandloginform'
import { UserContext } from './Components/UserContext';
import Chat from './Components/Chat';

const Routes = () => {
  const { email, id } = useContext(UserContext);
  console.log("email and id found");
  console.log(email, id);
  if (email) {
    // return  window.location.href = 'https://localhost:5173/profile';
    // return "logged in!"+ email;
    return <Chat />;
  }
  // console.log(username);
  return (
    <Register />
  )
}

export default Routes;