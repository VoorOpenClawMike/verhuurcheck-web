export default function NotFound({ onHome }: { onHome: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Pagina niet gevonden</h2>
        <p className="text-gray-500 mb-8">De pagina die u zoekt bestaat niet.</p>
        <button
          onClick={onHome}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Terug naar home
        </button>
      </div>
    </div>
  )
}
