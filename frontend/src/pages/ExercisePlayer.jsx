import { useEffect, useRef, useState, useCallback } from "react"
// 1 — imports
import {
  cur_pushdown, plank_pushup,
  squats, rdl,
  sumo_deadlift_api, front_squat_api, zercher_squat_api,
  deadlift, press_api
} from "../services/YOLOpose/pose"

// import {
//   cur_pushdown, plank_pushup,
//   squats, rdl,
//   sumo_deadlift_api, front_squat_api, zercher_squat_api,
//   deadlift, press_api
// } from "../services/MEDIApose/pose"

// 2 — EXERCISES registry
const EXERCISES = [
  { id: "barbell_biceps_curl", label: "Curls",                api: "curl_pushdown" },
  { id: "tricep_pushdown",     label: "Tricep Pushdown",      api: "curl_pushdown" },
  { id: "squat",               label: "Squat",                api: "squat" },
  { id: "front_squat",         label: "Front Squat",          api: "front_squat" },
  { id: "zercher_squat",       label: "Zercher Squat",        api: "zercher_squat" },
  { id: "deadlift",            label: "Deadlift",             api: "deadlift" },
  { id: "sumo_deadlift",       label: "Sumo Deadlift",        api: "sumo_deadlift" },
  { id: "romanian_deadlift",   label: "Romanian Deadlift",    api: "romanian_deadlift" },
  { id: "bench_press",         label: "Bench Press",          api: "press" },
  { id: "shoulder_press",      label: "Shoulder Press",       api: "press" },
  { id: "incline_bench_press", label: "Incline Bench Press",  api: "press" },
  { id: "push_up",             label: "Push Up",              api: "plank_pushup" },
  { id: "plank",               label: "Plank",                api: "plank_pushup" },
  { id: "pull_up",             label: "Pull Up",              api: "press" },
  { id: "lat_pulldown",        label: "Lat Pulldown",         api: "press" },
  { id: "lateral_raise",       label: "Lateral Raise",        api: "press" },
]

// 3 — API_MAP
const API_MAP = {
  curl_pushdown:    cur_pushdown,
  plank_pushup:     plank_pushup,
  squat:            squats,
  front_squat:      front_squat_api,
  zercher_squat:    zercher_squat_api,
  deadlift:         deadlift,
  sumo_deadlift:    sumo_deadlift_api,
  romanian_deadlift: rdl,
  press:            press_api
}

// ── API map — add new API functions here only ─────────────────


function getApiFunction(id) {
  const ex = EXERCISES.find(e => e.id === id)
  if (!ex || !ex.api) return null
  return API_MAP[ex.api] || null
}

// ── Constants ─────────────────────────────────────────────────
const FRAME_INTERVAL_MS  = 300
const COUNTDOWN_SECONDS  = 5
const MOTION_THRESHOLD   = 15
const MOTION_MIN_PERCENT = 0.02
const WARMUP_FRAMES      = 15
const MAX_FEEDBACK       = 4

// ── Motion detection helper ───────────────────────────────────
function detectMotion(currentData, prevData) {
  if (!prevData) return false
  const total = currentData.length / 4
  let changed = 0
  for (let i = 0; i < currentData.length; i += 4) {
    if (
      Math.abs(currentData[i]   - prevData[i])   > MOTION_THRESHOLD ||
      Math.abs(currentData[i+1] - prevData[i+1]) > MOTION_THRESHOLD ||
      Math.abs(currentData[i+2] - prevData[i+2]) > MOTION_THRESHOLD
    ) changed++
  }
  return (changed / total) > MOTION_MIN_PERCENT
}

export default function ExercisePlayer() {
  const videoRef      = useRef(null)
  const canvasRef     = useRef(null)
  const prevDataRef   = useRef(null)
  const intervalRef   = useRef(null)
  const frameCountRef = useRef(0)

  const [selectedId,  setSelectedId]  = useState("")
  const [feedback,    setFeedback]    = useState([])
  const [elbow,       setElbow]       = useState(null)
  const [lean,        setLean]        = useState(null)
  const [cameraOn,    setCameraOn]    = useState(false)
  const [error,       setError]       = useState(null)
  const [hasCritical, setHasCritical] = useState(false)
  const [countdown,   setCountdown]   = useState(null)
  const [isMoving,    setIsMoving]    = useState(false)

  const selectedLabel  = EXERCISES.find(e => e.id === selectedId)?.label || ""
  const isCountingDown = countdown !== null
  const hasApi         = !!getApiFunction(selectedId)

  // ── Stop camera ───────────────────────────────────────────────
  function stopCamera() {
    clearInterval(intervalRef.current)
    const stream = videoRef.current?.srcObject
    stream?.getTracks().forEach(t => t.stop())
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraOn(false)
    setFeedback([])
    setElbow(null)
    setLean(null)
    setHasCritical(false)
    setError(null)
    setCountdown(null)
    setIsMoving(false)
    prevDataRef.current   = null
    frameCountRef.current = 0
  }

  // ── Start with countdown ──────────────────────────────────────
  async function startWithCountdown() {
    if (!selectedId) {
      setError("Please select an exercise first")
      return
    }
    if (!hasApi) {
      setError("This exercise is not yet supported for real-time correction")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      setError(null)
    } catch (err) {
      setError("Could not access camera: " + err.message)
      return
    }

    let count = COUNTDOWN_SECONDS
    setCountdown(count)

    const timer = setInterval(() => {
      count -= 1
      if (count <= 0) {
        clearInterval(timer)
        setCountdown(null)
        setCameraOn(true)
        frameCountRef.current = 0
        startSendingFrames()
      } else {
        setCountdown(count)
      }
    }, 1000)
  }

  // ── Send one frame ────────────────────────────────────────────
  const sendFrame = useCallback(async () => {
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !video.srcObject) return

    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    ctx.drawImage(video, 0, 0)

    const imageData   = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const currentData = new Uint8Array(imageData.data)
    const moving      = detectMotion(currentData, prevDataRef.current)
    prevDataRef.current = currentData
    setIsMoving(moving)

    if (!moving) return

    frameCountRef.current += 1
    const isWarmup = frameCountRef.current <= WARMUP_FRAMES

    canvas.toBlob(async (blob) => {
      if (!blob) return
      const form = new FormData()
      form.append("frame", blob, "frame.jpg")

      try {
        const apiFn = getApiFunction(selectedId)
        if (!apiFn) return

        const data = await apiFn(form)
        if (!data.success) return

        setElbow(data.elbow_ratio)
        setLean(data.trunk_lean)
        setHasCritical(data.has_critical)

        // Skip feedback during warmup
        if (isWarmup) return

        if (data.feedback?.length > 0) {
          // Add new feedback — replace oldest if at max
          setFeedback(prev => [
            { ts: new Date().toLocaleTimeString(), messages: data.feedback },
            ...prev
          ].slice(0, MAX_FEEDBACK))
        } else {
          // Good form — clear all feedback
          setFeedback([])
          setHasCritical(false)
        }

      } catch (err) {
        console.error("Frame send error:", err)
      }
    }, "image/jpeg", 0.8)
  }, [selectedId])

  function startSendingFrames() {
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(sendFrame, FRAME_INTERVAL_MS)
  }

  useEffect(() => {
    if (cameraOn || isCountingDown) stopCamera()
  }, [selectedId])

  useEffect(() => {
    return () => stopCamera()
  }, [])

  // Update interval when sendFrame changes (selectedId change)
  useEffect(() => {
    if (cameraOn) {
      startSendingFrames()
    }
  }, [sendFrame])

  return (
    <div style={{ display: "grid", gap: 20, padding: 16 }}>

      <h2 style={{ margin: 0 }}>Live Exercise Correction</h2>

      {/* Controls */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <select
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          disabled={isCountingDown || cameraOn}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "1px solid #ddd",
            fontSize: 14,
            minWidth: 220,
            cursor: "pointer",
            opacity: (isCountingDown || cameraOn) ? 0.5 : 1
          }}
        >
          <option value="">-- Select Exercise --</option>
          {EXERCISES.map(ex => (
            <option key={ex.id} value={ex.id}>
              {ex.label}{!ex.api ? " (coming soon)" : ""}
            </option>
          ))}
        </select>

        {!cameraOn && !isCountingDown && (
          <button
            onClick={startWithCountdown}
            disabled={!selectedId}
            style={{
              padding: "10px 24px",
              background: selectedId ? "#22c55e" : "#ccc",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: selectedId ? "pointer" : "not-allowed",
              fontWeight: 600,
              fontSize: 14
            }}
          >
            Start Camera
          </button>
        )}

        {(cameraOn || isCountingDown) && (
          <button
            onClick={stopCamera}
            style={{
              padding: "10px 24px",
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14
            }}
          >
            Stop
          </button>
        )}

        {cameraOn && selectedLabel && (
          <span style={{
            padding: "6px 14px",
            background: "#dbeafe",
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 500,
            color: "#1d4ed8"
          }}>
            {selectedLabel}
          </span>
        )}

        {cameraOn && (
          <span style={{
            padding: "6px 14px",
            background: isMoving ? "#dcfce7" : "#f3f4f6",
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 500,
            color: isMoving ? "#16a34a" : "#9ca3af",
            transition: "all 0.2s"
          }}>
            {isMoving ? "● Analyzing" : "○ Waiting for movement"}
          </span>
        )}
      </div>

      {error && (
        <p style={{ color: "#ef4444", margin: 0, fontWeight: 500 }}>{error}</p>
      )}

      {/* Camera — always in DOM */}
      <div style={{
        display: (isCountingDown || cameraOn) ? "grid" : "none",
        gridTemplateColumns: "2fr 1fr",
        gap: 16,
        alignItems: "start"
      }}>

        {/* Camera side */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <video
              ref={videoRef}
              muted
              playsInline
              style={{
                width: "100%",
                borderRadius: 8,
                background: "#000",
                border: hasCritical
                  ? "3px solid #ef4444"
                  : isCountingDown
                  ? "3px solid #facc15"
                  : "3px solid #22c55e",
                transition: "border-color 0.2s"
              }}
            />

            {isCountingDown && (
              <div style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.55)",
                borderRadius: 8,
                gap: 8
              }}>
                <div style={{ color: "#fff", fontSize: 16, fontWeight: 500 }}>
                  Get into position...
                </div>
                <div style={{
                  color: "#facc15",
                  fontSize: 96,
                  fontWeight: 700,
                  lineHeight: 1
                }}>
                  {countdown}
                </div>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} style={{ display: "none" }} />

          {cameraOn && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              padding: 12,
              background: "#f8f8f8",
              borderRadius: 8,
              fontSize: 13
            }}>
              <div>
                <b>Elbow ratio:</b>{" "}
                <span style={{
                  color: elbow > 0.553 ? "#ef4444" : "#16a34a",
                  fontWeight: 600
                }}>
                  {elbow != null ? elbow.toFixed(3) : "--"}
                </span>
                <span style={{ opacity: 0.5 }}> / max 0.553</span>
              </div>
              <div>
                <b>Trunk lean:</b>{" "}
                <span style={{ fontWeight: 600 }}>
                  {lean != null ? lean.toFixed(3) : "--"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Feedback panel */}
        <div style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          background: "#fff",
          minHeight: 200
        }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111" }}>
            Real-time Feedback
          </h3>

          {isCountingDown && (
            <p style={{ opacity: 0.5, margin: 0, fontSize: 14 }}>Starting soon...</p>
          )}

          {cameraOn && feedback.length === 0 && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 14px",
              background: "#dcfce7",
              borderRadius: 8,
              borderLeft: "4px solid #16a34a"
            }}>
              <span style={{ fontSize: 20 }}>✅</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: "#15803d" }}>
                Good form — keep it up!
              </span>
            </div>
          )}

          {cameraOn && feedback.map((f, idx) => (
            <div key={idx} style={{
              padding: "12px 14px",
              borderRadius: 8,
              background: "#fef2f2",
              borderLeft: "4px solid #ef4444",
              display: "flex",
              flexDirection: "column",
              gap: 4
            }}>
              <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>
                {f.ts}
              </div>
              {f.messages.map((m, i) => (
                <div key={i} style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#b91c1c",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}>
                  <span style={{ fontSize: 18 }}>
                    {m.severity === "CRITICAL" ? "🚨" : "⚠️"}
                  </span>
                  {m.message}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Placeholder */}
      {!cameraOn && !isCountingDown && (
        <div style={{
          padding: 40,
          textAlign: "center",
          border: "2px dashed #e5e7eb",
          borderRadius: 12,
          color: "#9ca3af"
        }}>
          <p style={{ fontSize: 16, margin: 0 }}>
            Select an exercise and press <b>Start Camera</b> to begin
          </p>
        </div>
      )}

    </div>
  )
}
