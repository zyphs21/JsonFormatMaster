import JsonFormatter from './components/JsonFormatter'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="bg-blue-600 text-white py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">JSON 格式化大师</h1>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4">
        <JsonFormatter />
      </main>
      
      <footer className="bg-gray-100 dark:bg-gray-800 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} JSON 格式化大师 | 功能强大的 JSON 格式化工具</p>
        </div>
      </footer>
    </div>
  )
}

export default App
