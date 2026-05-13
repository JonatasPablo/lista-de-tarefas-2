import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary.tsx'
import { initServiceWorker } from './pwa/updateServiceWorker.ts'

initServiceWorker()

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || ''
const isGoogleLoginConfigured = GOOGLE_CLIENT_ID !== ''

const appTree = (
    <ErrorBoundary>
        <App isGoogleLoginConfigured={isGoogleLoginConfigured} />
    </ErrorBoundary>
)

createRoot(document.getElementById('root')!).render(
    isGoogleLoginConfigured ? (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            {appTree}
        </GoogleOAuthProvider>
    ) : (
        appTree
    )
)
