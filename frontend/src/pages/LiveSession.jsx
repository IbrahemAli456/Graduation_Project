import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"

const EXERCISES = [
  { id: "squat", name: "Squat" },
  { id: "pushup", name: "Push Up" },
  { id: "plank", name: "Plank" },
]

function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0")
  const s = String(sec % 60).padStart(2, "0")
  return `${m}:${s}`
}

function pickFeedback(exerciseId) {
  const byExercise = {
    squat: [
      { level: "warning", msg: "Lower your hips slightly." },
      { level: "warning", msg: "Keep your back neutral (don’t round)." },
      { level: "good", msg: "Nice depth — keep control." },
      { level: "warning", msg: "Knees should track over toes." },
      { level: "good", msg: "Good tempo — keep breathing." },
    ],
    pushup: [
      { level: "warning", msg: "Keep your body in a straight line." },
      { level: "warning", msg: "Don’t flare elbows too much." },
      { level: "good", msg: "Great range of motion." },
      { level: "warning", msg: "Engage your core — avoid sagging." },
      { level: "good", msg: "Solid reps — keep steady." },
    ],
    plank: [
      { level: "warning", msg: "Don’t drop your hips." },
      { level: "good", msg: "Nice brace — keep it." },
      { level: "warning", msg: "Keep neck neutral." },
      { level: "good", msg: "Great stability." },
      { level: "warning", msg: "Squeeze glutes for better alignment." },
    ],
  }

  const list = byExercise[exerciseId] || [{ level: "good", msg: "Good form!" }]
  return list[Math.floor(Math.random() * list.length)]
}

export default function LiveSession() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const feedbackIntervalRef = useRef(null)
  const timerIntervalRef = useRef(null)

  const [selectedExercise, setSelectedExercise] = useState("squat")
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState("")
  const [feedback, setFeedback] = useState([])
  const [seconds, setSeconds] = useState(0)
  const [status, setStatus] = useState("Ready") // Ready | Good | Warning

  async function startSession() {
    setError("")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
    } catch (e) {
      setError("Camera permission denied or camera not available.")
      return
    }

    setIsRunning(true)
    setStatus("Good")
    setSeconds(0)
    setFeedback([])

    timerIntervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)

    feedbackIntervalRef.current = setInterval(() => {
      const item = pickFeedback(selectedExercise)
      const ts = new Date().toLocaleTimeString()
      setFeedback((prev) => [{ ts, ...item }, ...prev].slice(0, 10))
      setStatus(item.level === "warning" ? "Warning" : "Good")
    }, 2000)
  }

  function stopSession() {
    if (feedbackIntervalRef.current) {
      clearInterval(feedbackIntervalRef.current)
      feedbackIntervalRef.current = null
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setIsRunning(false)
    setStatus("Ready")
  }

  function reset() {
    setFeedback([])
    setSeconds(0)
    setStatus(isRunning ? "Good" : "Ready")
  }

  useEffect(() => {
    return () => stopSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dotClass =
    status === "Good" ? "dot good" : status === "Warning" ? "dot warn" : "dot ready"

  return (
    <div className="grid">
      {/* Header */}
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="h1" style={{ marginBottom: 6 }}>Live Training</div>
            <div className="muted">Use your camera and get real-time feedback.</div>
          </div>
          <Link to="/plan" className="btn">← Back to Plan</Link>
        </div>
      </div>

      {error && (
        <div className="card" style={{ borderColor: "rgba(255,92,122,0.35)" }}>
          <b style={{ color: "var(--danger)" }}>Error:</b> {error}
        </div>
      )}

      {/* Controls */}
      <div className="card soft">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div className="row" style={{ alignItems: "center" }}>
            <label className="label" style={{ minWidth: 220 }}>
              Exercise
              <select
                className="input"
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                disabled={isRunning}
              >
                {EXERCISES.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="badge">
              Timer: <b>{formatTime(seconds)}</b>
            </div>

            <div className="pill">
              <span className={dotClass} />
              Status: {status}
            </div>
          </div>

          <div className="row">
            {!isRunning ? (
              <button className="btn primary" onClick={startSession}>
                Start
              </button>
            ) : (
              <button className="btn" onClick={stopSession}>
                Stop
              </button>
            )}
            <button className="btn" onClick={reset}>
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Camera + Feedback */}
      <div className="grid grid-2">
        <div className="card">
          <div className="h2">Camera</div>

          <div className="videoWrap" style={{ marginTop: 12 }}>
            <video ref={videoRef} className="videoEl" playsInline muted />
            <div className="overlay">
              <div className="pill">
                <span className="dot ready" />
                {EXERCISES.find((x) => x.id === selectedExercise)?.name}
              </div>
              <div className="pill">⏱ {formatTime(seconds)}</div>
            </div>
          </div>

          <div className="muted" style={{ marginTop: 10 }}>
            (Mock feedback now — later the AI will stream feedback events.)
          </div>
        </div>

        <div className="card">
          <div className="h2">Real-time Feedback</div>

          {isRunning && feedback.length === 0 && (
            <div className="muted" style={{ marginTop: 10 }}>
              Waiting for feedback...
            </div>
          )}

          {!isRunning && (
            <div className="muted" style={{ marginTop: 10 }}>
              Choose exercise then press <b>Start</b>.
            </div>
          )}

          <div className="grid" style={{ marginTop: 12 }}>
            {feedback.map((f, idx) => (
              <div
                key={idx}
                className="card soft"
                style={{
                  padding: 12,
                  borderColor:
                    f.level === "warning"
                      ? "rgba(255,204,0,0.25)"
                      : "rgba(51,209,122,0.25)",
                }}
              >
                <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <div className="badge" style={{ margin: 0 }}>
                    <span className={f.level === "warning" ? "dot warn" : "dot good"} />
                    {f.level === "warning" ? "Warning" : "Good"}
                  </div>
                  <div className="muted">{f.ts}</div>
                </div>
                <div style={{ marginTop: 8, fontWeight: 800 }}>{f.msg}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
