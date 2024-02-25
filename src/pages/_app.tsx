import { ChatProvider } from '@/ChatContext'
import { UploadProvider } from '@/UploadContext'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChatProvider>
      <UploadProvider>
        <Component {...pageProps} />
      </UploadProvider>
    </ChatProvider>
  )
}
