import { useChat } from '@/ChatContext'
import { SHARED_UUID, useUpload } from '@/UploadContext'
import {
  IconArrowRotateRight,
  IconClipboardList,
  IconFileCirclePlus,
  IconTrashCan,
} from '@/icons'
import { Inter } from 'next/font/google'
import {
  ChangeEventHandler,
  ComponentProps,
  Dispatch,
  KeyboardEventHandler,
  SetStateAction,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import Markdown from 'react-markdown'

const inter = Inter({ subsets: ['latin'] })

const DrawerContext = createContext([false, (value) => {}] as [
  boolean,
  Dispatch<SetStateAction<boolean>>,
])

function ActBtn({ className, children, ...props }: ComponentProps<'button'>) {
  return (
    <button
      className={`btn btn-sm btn-square btn-outline join-item text-xl text-white ${className}`}
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
    <div
      ref={logRef}
      className='relative bg-base-200 overflow-y-scroll overflow-x-hidden grow'
    >
      <div className='absolute inset-0 flex text-wrap text-gray-600 pointer-events-none'>
        <div className='m-auto justify-center align-middle p-4'>
          <h4 className='text-lg'>Disclaimer</h4>
          <ul className='list-disc pl-4'>
            <li>
              Experimental prototype rushed by students, model will hallucinate
            </li>
            <li>Prototype will throttle on many concurrent users</li>
          </ul>
        </div>
      </div>
      {msgs.map((m, i) => (
        <div
          className={`chat ${m.role === 'user' ? 'chat-end' : 'chat-start'}`}
          key={i}
        >
          <div
            className={`chat-bubble text-white ${m.role === 'user' ? 'bg-accent' : ''}`}
          >
            <Markdown className='reactMarkDown'>{m.text}</Markdown>
          </div>
        </div>
      ))}
    </div>
  )
}

function ChatEntry() {
  const [text, setText] = useState('')
  const { addMsg, error, isSending } = useChat()
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isSending) return
    setText('')
    addMsg({ role: 'user', text })
  }

  const handleEnter: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key == 'Enter') {
      e.preventDefault()
      if (isSending) return
      setText('')
      addMsg({ role: 'user', text })
    }
  }

  const updateText: ChangeEventHandler<HTMLTextAreaElement> = (e) =>
    setText(e.target.value)

  useEffect(() => {
    const textElm = inputRef.current
    if (!textElm) return
    textElm.style.height = '0px'
    getComputedStyle(textElm) // From testing not actually necessary but whatever.
    textElm.style.height = `${textElm.scrollHeight}px`
  }, [text])

  return (
    <form onSubmit={handleSubmit} className='form-control'>
      <textarea
        ref={inputRef}
        placeholder={isSending ? 'Processing...' : error ?? 'Type a message...'}
        className='textarea textarea-ghost break-words overflow-hidden resize-none !outline-none !border-transparent'
        value={text}
        onChange={updateText}
        onKeyDown={handleEnter}
        rows={1}
      />
      <button type='submit' className='btn btn-ghost' disabled={isSending}>
        {isSending ? 'Sending...' : 'Send'}
      </button>
    </form>
  )
}

function LeftActionBar() {
  const [open, setOpen] = useContext(DrawerContext)
  return (
    <div className='join'>
      <ActBtn>
        <IconTrashCan />
      </ActBtn>
      <ActBtn onClick={() => setOpen(true)}>
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
    const { uuid, uploadText, allocateUUID } = useUpload()
    const [text, setText] = useState('')

    const onUpload = (text: string) => {
      if (text === '') return
      // TODO: popup saying uploading, followed by pop up that says done
      // add like the first few words ellipses in the pop up so they know what
      // was uploaded
      uploadText(text)
    }

    return (
      <dialog {...props} ref={ref} className='modal'>
        <div className='modal-box'>
          <h3 className='font-bold text-lg text-center'>Upload Document</h3>
          <div className='flex justify-center'>
            {uuid === SHARED_UUID ? (
              <button
                className='btn btn-xs btn-outline btn-primary text-white'
                onClick={() => allocateUUID()}
              >
                Assign Personal DB
              </button>
            ) : (
              <span className='text-xs text-center text-gray-400'>
                Personal Id: {uuid}
              </span>
            )}
          </div>
          <div
            role='tablist'
            className='tabs tabs-bordered justify-center grid-cols-4'
          >
            <input
              type='radio'
              name='pdf'
              role='tab'
              className='tab mb-4'
              aria-label='PDF'
              onClick={() => setSelected('pdf')}
              checked={selected === 'pdf'}
            />
            <div role='tabpanel' className='tab-content'>
              <div className='w-full'></div>
            </div>
            <input
              type='radio'
              name='url'
              role='tab'
              className='tab mb-4'
              aria-label='URL'
              onClick={() => setSelected('url')}
              checked={selected === 'url'}
            />
            <div role='tabpanel' className='tab-content'>
              Tab content 2
            </div>
            <input
              type='radio'
              name='wikipedia'
              role='tab'
              className='tab mb-4'
              aria-label='Wikipedia'
              onClick={() => setSelected('wikipedia')}
              checked={selected === 'wikipedia'}
            />
            <div role='tabpanel' className='tab-content'>
              Tab content 3
            </div>
            <input
              type='radio'
              name='text'
              role='tab'
              className='tab mb-4'
              aria-label='Text'
              onClick={() => setSelected('text')}
              checked={selected === 'text'}
            />
            <div role='tabpanel' className='tab-content'>
              <div className='flex flex-col gap-4'>
                <textarea
                  className='textarea textarea-bordered resize-y'
                  placeholder='Paste text here...'
                  rows={10}
                  onChange={(e) => setText(e.target.value)}
                />
                <button
                  className='btn btn-sm btn-primary text-white'
                  onClick={() => onUpload(text)}
                >
                  Upload
                </button>
              </div>
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
  const { resetUUID } = useUpload()

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
                resetUUID()
                resetModalRef.current?.close()
              }}
              className='btn btn-error'
            >
              Revert to Shared DB
            </button>
            <div className='flex-grow'></div>
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
    <div className='navbar z-10 min-h-12 bg-accent'>
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
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { chunks } = useChat()
  const { uuid } = useUpload()
  return (
    <DrawerContext.Provider value={[drawerOpen, setDrawerOpen]}>
      <div className='drawer'>
        <input type='checkbox' className='drawer-toggle' checked={drawerOpen} />
        <main
          className={`drawer-content fixed inset-0 flex flex-col h-[calc(100dvh)] w-[calc(100dvw)] overflow-hidden ${inter.className}`}
        >
          <Header />
          <p className='text-xs text-gray-400 text-center'>
            Dataset Id: {uuid}
          </p>
          <ChatLog />
          <ChatEntry />
        </main>
        <div className='drawer-side'>
          <label
            aria-label='close sidebar'
            className='drawer-overlay'
            onClick={() => setDrawerOpen(false)}
          ></label>
          <ul className='menu p-4 w-80 min-h-full bg-base-200 text-base-content'>
            <h3 className='text-lg'>Referenced Snippets</h3>
            <p className='text-xs'> Dataset Id: {uuid}</p>
            {chunks.map((s, i) => (
              <li
                key={i}
                className={`border ${i % 2 == 0 ? 'bg-base-400' : 'bg-base-100'}`}
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DrawerContext.Provider>
  )
}
