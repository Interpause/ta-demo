import { createContext, useContext, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

const SHARED_UUID = '00000000-0000-0000-0000-000000000000'

interface UploadState {
  uuid: string
  uploadText: (text: string) => void
  // allocateUUID: () => void
}

const Context = createContext<UploadState>({} as UploadState)

export const useUpload = () => useContext(Context)
export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [uuid, setUUID] = useState<string>(SHARED_UUID)

  const uploadText = (text: string) => {
    // NOTE: to prevent stress, fastapi does a 307 redirect if the path is different
    // i.e., /api/rag/create_document vs /api/rag/create_document/. this redirect ofc
    // messes up CORS
    const req = fetch('/api/rag/create_document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doc_id: uuidv4(), ds_id: uuid, content: text }),
    })
    return (async () => {
      try {
        const res = await req
        const data = await res.json()
        console.log(data)
      } catch (e) {
        console.error(e)
      }
    })()
  }

  return (
    <Context.Provider value={{ uuid, uploadText }}>{children}</Context.Provider>
  )
}
