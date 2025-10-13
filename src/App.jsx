import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import './App.css'
import './components/sidebar.css'
import Dashboard from './pages/Dashboard'
import ClaimRequests from './pages/ClaimRequests'
import TodoWorks from './pages/TodoWorks'
import Profile from './pages/Profile'

function App(){
  return (
    <BrowserRouter>
      <div style={{display:'flex'}}>
        <Sidebar />
        <main className="with-sidebar">
          <Routes>
            <Route path="/" element={<Dashboard/>} />
            <Route path="/claim-requests" element={<ClaimRequests/>} />
            <Route path="/todo-works" element={<TodoWorks/>} />
            <Route path="/profile" element={<Profile/>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
