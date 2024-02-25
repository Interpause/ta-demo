import { createContext, useContext, useState } from 'react'

interface Msg {
  role: 'user' | 'model'
  text: string
}

interface ChatState {
  msgs: Msg[]
  chunks: string[]
  addMsg: (msg: Msg) => void
  resetMsgs: () => void
  isSending: boolean
  error?: string
}

const GREETING: Msg = {
  role: 'model',
  text: 'Hello, I am VirtuTA, your virtual teacher assistant. What are we learning today?',
}

const INSTRUCTION: Msg = {
  role: 'model',
  text: 'Hello, I am VirtuTA, your virtual teacher assistant. Press the Add File icon on the top right to upload documents or webpages. Press the Clipboard icon on the top left to see the current knowledge snippets. Ask me anything!',
}

// AKA must have context.
const Context = createContext<ChatState>({} as ChatState)

export const useChat = () => useContext(Context)
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [msgs, setMsgs] = useState<Msg[]>([INSTRUCTION])
  const [chunks, setChunks] = useState<string[]>([])
  const [isSending, setSending] = useState(false)
  const [error, setError] = useState<string>()

  const addMsg = (msg: Msg) => {
    setSending(true)
    setError(undefined)

    let newMsgs = [...msgs]
    if (msg.text && msg.text !== '') {
      newMsgs = [...msgs, msg]
      setMsgs(newMsgs)
    }

    // TODO: Server side support model continuation.
    if (newMsgs[newMsgs.length - 1].role === 'model') return setSending(false)
    if (isSending) return setSending(false)

    // POST request.
    const req = fetch('/api/bot/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat: newMsgs, autoSearch: true }),
    })
    ;(async () => {
      // NOTE: make sure the try wraps everything...
      try {
        const res = await req
        const raw = await res.text()
        const data = JSON.parse(raw)

        if (data.text) {
          setMsgs([...newMsgs, { role: 'model', text: data.text }])
          console.log(data.text)
        } else setError(`API Error: ${JSON.stringify(data)}`)

        console.log(data.chunks)
        setChunks(data.chunks)
      } catch (err) {
        console.error(err)
        setError(`API Error: ${JSON.stringify(err)}`)
      } finally {
        setSending(false)
      }
    })()
  }
  const resetMsgs = () => setMsgs([GREETING])

  return (
    <Context.Provider
      value={{ msgs, chunks, addMsg, resetMsgs, error, isSending }}
    >
      {children}
    </Context.Provider>
  )
}
