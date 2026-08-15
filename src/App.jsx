import { Routes, Route } from 'react-router-dom'
import { UpdatesProvider } from './context/UpdatesContext'
import AppHeader from './components/AppHeader'
import ProjectsOverview from './pages/ProjectsOverview'
import ProjectDetailInternal from './pages/ProjectDetailInternal'
import ProjectDetailCustomer from './pages/ProjectDetailCustomer'

export default function App() {
  return (
    <UpdatesProvider>
      <AppHeader />
      <Routes>
        <Route path="/" element={<ProjectsOverview />} />
        <Route path="/project/:id" element={<ProjectDetailInternal />} />
        <Route path="/project/:id/customer" element={<ProjectDetailCustomer />} />
      </Routes>
    </UpdatesProvider>
  )
}
