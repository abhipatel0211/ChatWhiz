#steps to run the project

step 1. Clone the repository

step 2. Add the .env file  in both api and client folder

step 3. in the .env file of client add this 
```
REACT_API_BASE_URL="http://localhost:4000",
VITE_API_BASE_WS = "localhost:4000"
```

step 4. in the .env file of api add this

```
MONGO_URL = ""
JWT_SECRET=""
CLIENT_URL="http://localhost:5173/"
```

step 5. now go to api folder and run command 
```
yarn start
```

step 6. now go to client folder and run command
```
yarn run dev
```
