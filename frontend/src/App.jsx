import usePing from './hooks/apis/queries/usePing.js'
import './App.css'
import { Router } from './Router.jsx'
import { Route, Routes } from 'react-router-dom';
import { CreateProject } from './pages/CreateProject.jsx';
// import { io } from 'socket.io-client'

function App() {

  // const socket = io("http://localhost:3000")

  return (
      <>
        <Router />
      </>
  )
}

export default App
