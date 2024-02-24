import { createContext, useContext, useState } from 'react'

interface Msg {
  role: 'user' | 'model'
  text: string
}

interface ChatState {
  msgs: Msg[]
  addMsg: (msg: Msg) => void
  resetMsgs: () => void
  isSending: boolean
  error?: string
}

const GREETING: Msg = {
  role: 'model',
  text: 'Hello, I am VirtuTA, your virtual teacher assistant. What are we learning today?',
}

// AKA must have context.
const Context = createContext<ChatState>({} as ChatState)

export const useChat = () => useContext(Context)
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [msgs, setMsgs] = useState<Msg[]>([GREETING])
  const [isSending, setSending] = useState(false)
  const [error, setError] = useState<string>()

  const addMsg = (msg: Msg) => {
    let newMsgs = [...msgs]
    if (msg.text && msg.text !== '') {
      newMsgs = [...msgs, msg]
      setMsgs(newMsgs)
    }
    setError(undefined)
    setSending(true)
    ;(async () => {
      const res = await fetch('/api/bot/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat: newMsgs, autoSearch: true }),
      })
      try {
        const raw = await res.text()
        const data = JSON.parse(raw)
        if (data.text) setMsgs([...newMsgs, { role: 'model', text: data.text }])
        else setError(`API Error: ${JSON.stringify(data)}`)
      } catch (err) {
        console.error(err)
        setError(`API Error: ${JSON.stringify(err)}`)
      }
      setSending(false)
    })()
  }
  const resetMsgs = () => setMsgs([GREETING])

  return (
    <Context.Provider value={{ msgs, addMsg, resetMsgs, error, isSending }}>
      {children}
    </Context.Provider>
  )
}
