import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Critical: Root element not found!");
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <AuthProvider>
          <App />
        </AuthProvider>
      </StrictMode>
    );
  } catch (err) {
    console.error("Critical: React render failed!", err);
    rootElement.innerHTML = `<div style="color: white; padding: 20px; text-align: center;">
      <h1>Something went wrong</h1>
      <p>The application failed to start. Check the console for details.</p>
      <button onclick="window.location.reload()">Reload App</button>
    </div>`;
  }
}
