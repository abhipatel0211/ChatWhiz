// import { BrowserRouter as Router, Route} from "react-router-dom";
import { UserContextProvider } from "./Components/UserContext.jsx";

import Routes from "./Routes";

function App() {
  return (
    <>
      <UserContextProvider>
        <Routes />
        {/* <Profile /> */}
      </UserContextProvider>
    </>
  )
}

export default App
