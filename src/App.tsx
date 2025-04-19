import JsonFormatter from './components/JsonFormatter'
import './App.css'

function App() {
  return (
    <div className="app-container" style={{ 
      width: '100%', 
      maxWidth: '100vw', 
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'auto',
      height: 'auto',
      minHeight: '100vh'
    }}>
      <JsonFormatter />
    </div>
  )
}

export default App
