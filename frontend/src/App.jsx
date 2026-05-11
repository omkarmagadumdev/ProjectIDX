import usePing from './hooks/apis/queries/usePing.js'
import './App.css'
import { Router } from './Router.jsx'
import { Route, Routes } from 'react-router-dom';
import { CreateProject } from './pages/CreateProject.jsx'

function App() {

  return (
      <>
        <Router />
      </>
  )
}

export default App
