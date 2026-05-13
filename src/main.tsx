import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary.tsx'

registerSW({
    immediate: true,
})

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || ''
const isGoogleLoginConfigured = GOOGLE_CLIENT_ID !== ''

const appTree = (
    <ErrorBoundary>
        <App isGoogleLoginConfigured={isGoogleLoginConfigured} />
    </ErrorBoundary>
)

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        {isGoogleLoginConfigured ? (
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                {appTree}
            </GoogleOAuthProvider>
        ) : (
            appTree
        )}
    </StrictMode>
)
