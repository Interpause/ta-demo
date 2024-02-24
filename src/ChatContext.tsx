import { createContext, useContext, useState } from 'react'

interface Msg {
  role: 'user' | 'model'
  text: string
}

interface ChatState {
  msgs: Msg[]
  addMsg: (msg: Msg) => void
  resetMsgs: () => void
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

  const addMsg = (msg: Msg) => {
    const newMsgs = [...msgs, msg]
    setMsgs(newMsgs)
    fetch('/api/bot/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat: newMsgs, autoSearch: true }),
    }).then(async (res) => {
      try {
        const raw = await res.text()
        console.info(raw)
        const data = JSON.parse(raw)
        console.info(data)
        if (data.text) setMsgs([...newMsgs, { role: 'model', text: data.text }])
      } catch (err) {
        console.error(err)
      }
    })
  }
  const resetMsgs = () => setMsgs([GREETING])

  return (
    <Context.Provider value={{ msgs, addMsg, resetMsgs }}>
      {children}
    </Context.Provider>
  )
}
