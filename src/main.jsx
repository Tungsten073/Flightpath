import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { DataProvider } from './context/DataContext'
import { UpdatesProvider } from './context/UpdatesContext'
import './styles/global.css'
import './styles/components.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <DataProvider>
        <UpdatesProvider>
          <App />
        </UpdatesProvider>
      </DataProvider>
    </BrowserRouter>
  </React.StrictMode>
)
