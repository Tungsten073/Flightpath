import { useState, useRef } from 'react'
import { parseUpdateWithGemini } from '../../lib/gemini'
import { useUpdates } from '../../context/UpdatesContext'

const MAX_CHARS = 2000

export default function AddUpdateForm({ project, milestones = [], tasks = [] }) {
  const [text, setText] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('')
  const [lastParsed, setLastParsed] = useState(null)
  const textareaRef = useRef(null)
  const { addUpdate } = useUpdates()

  async function handleSubmit(e) {
    e.preventDefault()
    const raw = text.trim()
    if (!raw) return

    setStatus('loading')
    setErrorMsg('')
    setLastParsed(null)

    try {
      const parsed = await parseUpdateWithGemini(raw, milestones, tasks)
      const entry = await addUpdate(project.id, raw, parsed)
      setLastParsed(entry || { parsed })
      setStatus('success')
      setText('')
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
    } catch (err) {
      console.error('Update parsing/submission error:', err)
      setStatus('error')
      setErrorMsg(err.message || 'Failed to submit update.')
    }
  }

  function handleChange(e) {
    setText(e.target.value)
    if (status === 'error' || status === 'success') {
      setStatus('idle')
      setErrorMsg('')
    }
    e.target.style.height = 'auto'
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  return (
    <div className="add-update-section">
      <div className="panel-header">
        <span className="panel-title">
          <SparkleIcon />
          Add AI Update
        </span>
      </div>

      <form onSubmit={handleSubmit} className="add-update-form">
        <div className="add-update-textarea-wrap">
          <textarea
            ref={textareaRef}
            className="add-update-textarea"
            placeholder="Paste raw text — emails, Slack notes, or status reports... Gemini will parse milestones & task statuses automatically."
            value={text}
            onChange={handleChange}
            maxLength={MAX_CHARS}
            rows={4}
            disabled={status === 'loading'}
          />
          <span className="char-count">
            {text.length}/{MAX_CHARS}
          </span>
        </div>

        <div className="add-update-footer">
          <button
            type="submit"
            className={`add-update-btn${status === 'loading' ? ' loading' : ''}`}
            disabled={!text.trim() || status === 'loading'}
          >
            {status === 'loading' ? (
              <>
                <SpinnerIcon />
                Parsing with Gemini…
              </>
            ) : (
              <>
                <SparkleIcon size={14} />
                Parse &amp; Add Update
              </>
            )}
          </button>

          {status === 'success' && lastParsed && (
            <span className="add-update-success">
              ✓ Added — {lastParsed?.parsed?.milestoneName ? `matched to "${lastParsed.parsed.milestoneName}"` : 'update logged to timeline'}
            </span>
          )}
        </div>

        {status === 'error' && (
          <div className="add-update-error">
            <div className="flex items-center gap-2">
              <AlertIcon />
              <strong>Parsing Error</strong>
            </div>
            <p className="text-xs" style={{ margin: 0, color: 'var(--text-primary)' }}>
              {errorMsg}
            </p>
          </div>
        )}
      </form>
    </div>
  )
}

function SparkleIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path d="M8 1l1.2 3.8L13 6l-3.8 1.2L8 11l-1.2-3.8L3 6l3.8-1.2L8 1z" fill="currentColor"/>
      <path d="M13 11l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" fill="currentColor" opacity="0.6"/>
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, animation: 'spin 0.8s linear infinite' }}>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="26" strokeDashoffset="10" strokeLinecap="round"/>
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: 'var(--status-blocked-text)' }}>
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8" cy="11.5" r="0.75" fill="currentColor"/>
    </svg>
  )
}
