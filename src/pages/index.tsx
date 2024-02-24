import { useChat } from '@/ChatContext'
import {
  IconArrowRotateRight,
  IconClipboardList,
  IconFileCirclePlus,
  IconTrashCan,
} from '@/icons'
import { Inter } from 'next/font/google'
import { ComponentProps, forwardRef, useEffect, useRef, useState } from 'react'

const inter = Inter({ subsets: ['latin'] })

function ActBtn({ className, children, ...props }: ComponentProps<'button'>) {
  return (
    <button
      className={`btn btn-square btn-outline join-item btn-sm ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

function ChatLog() {
  const { msgs } = useChat()
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const divElm = logRef.current
    if (!divElm) return
    divElm.scrollTop = divElm.scrollHeight
  }, [msgs.length])

  return (
    <div ref={logRef} className='bg-base-200 overflow-y-scroll grow'>
      {msgs.map((m, i) => (
        <div
          className={`chat ${m.role === 'user' ? 'chat-end' : 'chat-start'}`}
          key={i}
        >
          <div
            className={`chat-bubble ${m.role === 'user' ? 'bg-accent-content' : ''}`}
          >
            {m.text}
          </div>
        </div>
      ))}
    </div>
  )
}

function ChatEntry() {
  const [text, setText] = useState('')
  const { addMsg } = useChat()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text === '') return
    addMsg({ role: 'user', text })
    setText('')
  }

  return (
    <form onSubmit={handleSubmit} className='form-control'>
      <input
        type='text'
        placeholder='Type a message'
        className='input input-ghost'
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type='submit' className='btn btn-ghost'>
        Send
      </button>
    </form>
  )
}

function LeftActionBar() {
  return (
    <div className='join'>
      <ActBtn>
        <IconTrashCan />
      </ActBtn>
      <ActBtn>
        <IconClipboardList />
      </ActBtn>
    </div>
  )
}

const UploadModal = forwardRef<HTMLDialogElement, ComponentProps<'dialog'>>(
  (props, ref) => {
    const [selected, setSelected] = useState<
      'pdf' | 'url' | 'wikipedia' | 'text'
    >('pdf')
    return (
      <dialog {...props} ref={ref} className='modal'>
        <div className='modal-box'>
          <h3 className='font-bold text-lg text-center'>Upload Document</h3>
          <div role='tablist' className='tabs tabs-bordered'>
            <input
              type='radio'
              name='pdf'
              role='tab'
              className='tab'
              aria-label='PDF'
              onClick={() => setSelected('pdf')}
              checked={selected === 'pdf'}
            />
            <div role='tabpanel' className='tab-content p-10'>
              Tab content 1
            </div>

            <input
              type='radio'
              name='url'
              role='tab'
              className='tab'
              aria-label='URL'
              onClick={() => setSelected('url')}
              checked={selected === 'url'}
            />
            <div role='tabpanel' className='tab-content p-10'>
              Tab content 2
            </div>

            <input
              type='radio'
              name='wikipedia'
              role='tab'
              className='tab'
              aria-label='Wikipedia'
              onClick={() => setSelected('wikipedia')}
              checked={selected === 'wikipedia'}
            />
            <div role='tabpanel' className='tab-content p-10'>
              Tab content 3
            </div>

            <input
              type='radio'
              name='text'
              role='tab'
              className='tab'
              aria-label='Text'
              onClick={() => setSelected('text')}
              checked={selected === 'text'}
            />
            <div role='tabpanel' className='tab-content p-10'>
              Tab content 3
            </div>
          </div>
        </div>

        <form method='dialog' className='modal-backdrop'>
          <button></button>
        </form>
      </dialog>
    )
  },
)

function RightActionBar() {
  const uploadModalRef = useRef<HTMLDialogElement>(null)
  const resetModalRef = useRef<HTMLDialogElement>(null)
  const { resetMsgs } = useChat()

  const showUploadModal = () => uploadModalRef.current?.showModal()
  const showResetModal = () => resetModalRef.current?.showModal()

  return (
    <>
      <div className='join'>
        <ActBtn onClick={showUploadModal}>
          <IconFileCirclePlus />
        </ActBtn>
        <ActBtn onClick={showResetModal}>
          <IconArrowRotateRight />
        </ActBtn>
      </div>
      <UploadModal ref={uploadModalRef} />
      <dialog ref={resetModalRef} className='modal'>
        <div className='modal-box'>
          <h3 className='font-bold text-lg text-center'>Reset Chat</h3>
          <p>Are you sure you want to reset the chat?</p>
          <div className='modal-action'>
            <button
              onClick={() => {
                resetMsgs()
                resetModalRef.current?.close()
              }}
              className='btn btn-error'
            >
              Yes
            </button>
            <button
              onClick={() => resetModalRef.current?.close()}
              className='btn btn-ghost'
            >
              No
            </button>
          </div>
        </div>
        <form method='dialog' className='modal-backdrop'>
          <button></button>
        </form>
      </dialog>
    </>
  )
}

function Header() {
  return (
    <div className='navbar z-10 min-h-12 bg-accent-content'>
      <div className='navbar-start'>
        <LeftActionBar />
      </div>
      <div className='navbar-center'>
        <a className='btn btn-ghost btn-xs text-lg'>VirtuTA</a>
      </div>
      <div className='navbar-end'>
        <RightActionBar />
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <main className={`fixed inset-0 flex flex-col h-screen ${inter.className}`}>
      <Header />
      <ChatLog />
      <ChatEntry />
    </main>
  )
}
