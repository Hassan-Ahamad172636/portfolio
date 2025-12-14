import { Route, Routes } from 'react-router-dom'
import './App.css'
import MainPage from './pages/landing/MainPage'

function App() {

  return (
    <>
    {/* <Navbar></Navbar> */}
    <Routes>
      <Route path='/' element={<MainPage />}></Route>
    </Routes>
    </>
  )
}

export default App