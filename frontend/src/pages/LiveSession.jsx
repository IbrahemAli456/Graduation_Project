import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"

const EXERCISES = [
  { id: "squat", name: "Squat" },
  { id: "pushup", name: "Push Up" },
  { id: "plank", name: "Plank" },
]

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

function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0")
  const s = String(sec % 60).padStart(2, "0")
  return `${m}:${s}`
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

  async function startCamera() {
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

    // Timer
    timerIntervalRef.current = setInterval(() => {
      setSeconds((s) => s + 1)
    }, 1000)

    // Mock real-time feedback
    feedbackIntervalRef.current = setInterval(() => {
      const item = pickFeedback(selectedExercise)
      const ts = new Date().toLocaleTimeString()

      setFeedback((prev) => [{ ts, ...item }, ...prev].slice(0, 8))
      setStatus(item.level === "warning" ? "Warning" : "Good")
    }, 2000)
  }

  function stopCamera() {
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

  function resetSession() {
    setFeedback([])
    setSeconds(0)
    setStatus(isRunning ? "Good" : "Ready")
  }

  useEffect(() => {
    return () => stopCamera()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Live Training Session</h2>
        <Link to="/plan">← Back to Plan</Link>
      </div>

      {error && (
        <div style={{ border: "1px solid #f99", padding: 12, borderRadius: 8 }}>
          <b>Error:</b> {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <label>
          Exercise:{" "}
          <select
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

        <span>
          Timer: <b>{formatTime(seconds)}</b>
        </span>

        <span
          style={{
            padding: "4px 10px",
            borderRadius: 999,
            border: "1px solid #ddd",
            fontWeight: 700,
          }}
        >
          Status: {status}
        </span>

        <button onClick={resetSession} disabled={!isRunning && feedback.length === 0 && seconds === 0}>
          Reset
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Camera</h3>

          <video
            ref={videoRef}
            playsInline
            muted
            style={{ width: "100%", borderRadius: 8, background: "#000" }}
          />

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            {!isRunning ? (
              <button onClick={startCamera}>Start</button>
            ) : (
              <button onClick={stopCamera}>Stop</button>
            )}
            <span style={{ opacity: 0.8 }}>{isRunning ? "Running..." : "Not started"}</span>
          </div>

          <p style={{ marginTop: 10, opacity: 0.8 }}>
            (Mock feedback — لاحقًا هيتبدل ب real-time events من الـ AI)
          </p>
        </div>

        <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Real-time Feedback</h3>

          {!isRunning ? (
            <p>Choose exercise then press Start.</p>
          ) : feedback.length === 0 ? (
            <p>Waiting for feedback...</p>
          ) : (
            <ul style={{ paddingLeft: 18 }}>
              {feedback.map((f, idx) => (
                <li key={idx}>
                  <b>{f.ts}:</b>{" "}
                  <span style={{ fontWeight: f.level === "warning" ? 700 : 400 }}>
                    {f.msg}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
