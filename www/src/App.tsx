import LSystemCanvas from "./components/LSystemCanvas"

function App() {
  return (
    <div className="relative min-h-screen bg-bg text-text">
      <LSystemCanvas />
      <div className="relative flex items-center justify-center min-h-screen">
        <div className="bg-surface border border-border rounded-lg p-8 flex items-center">
          <img src="/favicon.svg" alt="Logo" className="w-12 h-12 mr-2" />
          <div>
            <h1 className="text-accent-light text-lg">mutantcacti</h1>
            <p className="text-text">Rebuilding...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
