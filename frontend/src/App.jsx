import usePing from './hooks/apis/queries/usePing.js'
import './App.css'
import { Route, Routes } from 'react-router-dom';
import { CreateProject } from './pages/CreateProject.jsx'

function App() {

  const { isLoading,data } =  usePing();


    if(isLoading){
      return(
        <>
          Loading...
        </>
      )
    }

  return (
   <Routes>
       <Route path='/' element={<CreateProject/>}/>
   </Routes>
  )
}

export default App
