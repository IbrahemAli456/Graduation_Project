import { useEffect, useRef, useState, useCallback } from "react"
import { Pose, POSE_CONNECTIONS } from "@mediapipe/pose"
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils"

// ── Exercise list ─────────────────────────────────────────────
const EXERCISES = [
  { id: "barbell_biceps_curl", label: "Curls"               },
  { id: "tricep_pushdown",     label: "Tricep Pushdown"      },
  { id: "squat",               label: "Squat"                },
  { id: "front_squat",         label: "Front Squat"          },
  { id: "zercher_squat",       label: "Zercher Squat"        },
  { id: "deadlift",            label: "Deadlift"             },
  { id: "sumo_deadlift",       label: "Sumo Deadlift"        },
  { id: "romanian_deadlift",   label: "Romanian Deadlift"    },
  { id: "bench_press",         label: "Bench Press"          },
  { id: "shoulder_press",      label: "Shoulder Press"       },
  { id: "incline_bench_press", label: "Incline Bench Press"  },
  { id: "push_up",             label: "Push Up"              },
  { id: "plank",               label: "Plank"                },
  { id: "pull_up",             label: "Pull Up"              },
  { id: "lat_pulldown",        label: "Lat Pulldown"         },
  { id: "lateral_raise",       label: "Lateral Raise"        },
]

const WS_URL            = "ws://127.0.0.1:5000/api/Mediapose/ws"
const COUNTDOWN_SECONDS = 5
const SEND_INTERVAL_MS  = 100   // send landmarks every 100ms (~10fps to backend)
const WARMUP_FRAMES     = 10
const MAX_FEEDBACK      = 4

// ── Audio feedback ────────────────────────────────────────────
let lastSpokenText = ""
let lastSpokenTime = 0
function speakFeedback(messages) {
  if (!messages?.length) return
  const now  = Date.now()
  const text = messages.map(m => m.message).join(". ")
  if (text === lastSpokenText && now - lastSpokenTime < 4000) return
  lastSpokenText = text
  lastSpokenTime = now
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.rate   = 1.0
  utt.volume = 1.0
  window.speechSynthesis.speak(utt)
}

export default function Mediapipe_player() {
  const videoRef       = useRef(null)
  const skeletonCanvas = useRef(null)
  const poseRef        = useRef(null)      // MediaPipe Pose instance
  const wsRef          = useRef(null)      // WebSocket connection
  const animFrameRef   = useRef(null)      // rAF handle for skeleton loop
  const sendTimerRef   = useRef(null)      // setInterval for WS sends
  const frameCountRef  = useRef(0)
  const hasFeedbackRef = useRef(false) // 👈 ADD THIS
  const isRedRef       = useRef(false) // 👈 ADD THIS
  const hasCriticalRef = useRef(false)
  const latestLandmarksRef = useRef(null)  // latest landmarks from MediaPipe

  const [selectedId,   setSelectedId]   = useState("")
  const [feedback,     setFeedback]     = useState([])
  const [cameraOn,     setCameraOn]     = useState(false)
  const [error,        setError]        = useState(null)
  const [hasCritical,  setHasCritical]  = useState(false)
  const [countdown,    setCountdown]    = useState(null)
  const [poseDetected, setPoseDetected] = useState(false)
  const [wsStatus,     setWsStatus]     = useState("disconnected") // connected | disconnected | error

  const selectedLabel  = EXERCISES.find(e => e.id === selectedId)?.label || ""
  const isCountingDown = countdown !== null

  useEffect(() => { hasCriticalRef.current = hasCritical }, [hasCritical])
  useEffect(() => { 
    hasFeedbackRef.current = feedback.length > 0 
  }, [feedback])

  // ── Init MediaPipe Pose (runs in browser via WASM) ─────────
  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    })
    pose.setOptions({
      modelComplexity:        1,
      smoothLandmarks:        true,
      enableSegmentation:     false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence:  0.5,
    })
    pose.onResults((results) => {
      // ── Draw skeleton on canvas ──────────────────────────
      const canvas = skeletonCanvas.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")

      const rect    = canvas.getBoundingClientRect()
      canvas.width  = rect.width
      canvas.height = rect.height
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (!results.poseLandmarks) {
        setPoseDetected(false)
        latestLandmarksRef.current = null
        return
      }

      setPoseDetected(true)

      // Store latest landmarks for WebSocket sending
      latestLandmarksRef.current = results.poseLandmarks.map(lm => ({
        x:          lm.x,
        y:          lm.y,
        z:          lm.z,
        visibility: lm.visibility ?? 1.0,
      }))

      const color = isRedRef.current ? "#ef4444" : "#22c55e"
      const fill  = isRedRef.current ? "rgba(239,68,68,0.6)" : "rgba(34,197,94,0.6)"
      drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { color, lineWidth: 3 })
      drawLandmarks(ctx, results.poseLandmarks, { color: fill, lineWidth: 1, radius: 4 })
    })

    poseRef.current = pose
    return () => pose.close()
  }, [])

  // ── Skeleton loop (rAF — runs every frame for smooth drawing) ──
  const startSkeletonLoop = useCallback(() => {
    const run = async () => {
      const video  = videoRef.current
      const canvas = skeletonCanvas.current
      if (video && canvas && poseRef.current && !video.paused && !video.ended) {
        await poseRef.current.send({ image: video })
      }
      animFrameRef.current = requestAnimationFrame(run)
    }
    animFrameRef.current = requestAnimationFrame(run)
  }, [])

  const stopSkeletonLoop = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
  }, [])

  // ── WebSocket connection ───────────────────────────────────
  function openWebSocket() {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    // Pass JWT token as query param for auth
 
    const ws    = new WebSocket(WS_URL)

    ws.onopen = () => {
      setWsStatus("connected")
      console.log("[WS] Connected")
      startSendingLandmarks()
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        const hasFeedback = data.feedback?.length > 0
        isRedRef.current = hasFeedback

        frameCountRef.current += 1
        const isWarmup = frameCountRef.current <= WARMUP_FRAMES

        setHasCritical(data.has_critical)

        if (isWarmup) return

        if (data.feedback?.length > 0) {
          setFeedback(prev => [
            { ts: new Date().toLocaleTimeString(), messages: data.feedback },
            ...prev
          ].slice(0, MAX_FEEDBACK))
          speakFeedback(data.feedback)
        } else {
          setFeedback([])
          setHasCritical(false)
        }
      } catch (e) {
        console.error("[WS] Parse error:", e)
      }
    }

    ws.onerror = () => {
      setWsStatus("error")
      setError("WebSocket error — check that Flask is running")
    }

    ws.onclose = () => {
      setWsStatus("disconnected")
      console.log("[WS] Closed")
    }

    wsRef.current = ws
  }

  function closeWebSocket() {
    clearInterval(sendTimerRef.current)
    wsRef.current?.close()
    wsRef.current = null
    setWsStatus("disconnected")
  }

  // ── Send landmarks over WebSocket every SEND_INTERVAL_MS ──
  function startSendingLandmarks() {
    clearInterval(sendTimerRef.current)
    sendTimerRef.current = setInterval(() => {
      const ws        = wsRef.current
      const landmarks = latestLandmarksRef.current
      if (!ws || ws.readyState !== WebSocket.OPEN || !landmarks) return

      ws.send(JSON.stringify({
        exercise:  selectedId,
        landmarks: landmarks,
      }))
    }, SEND_INTERVAL_MS)
  }

  // ── Stop everything ────────────────────────────────────────
  function stopCamera() {
    stopSkeletonLoop()
    closeWebSocket()

    const stream = videoRef.current?.srcObject
    stream?.getTracks().forEach(t => t.stop())
    if (videoRef.current) videoRef.current.srcObject = null

    const ctx = skeletonCanvas.current?.getContext("2d")
    if (ctx) ctx.clearRect(0, 0, skeletonCanvas.current.width, skeletonCanvas.current.height)

    setCameraOn(false)
    setFeedback([])
    setHasCritical(false)
    setError(null)
    setCountdown(null)
    setPoseDetected(false)
    latestLandmarksRef.current = null
    frameCountRef.current      = 0
    window.speechSynthesis.cancel()
  }

  // ── Start with countdown ───────────────────────────────────
  async function startWithCountdown() {
    if (!selectedId) { setError("Please select an exercise first"); return }

    setCountdown(COUNTDOWN_SECONDS)
    await new Promise(resolve => setTimeout(resolve, 0))

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (!videoRef.current) {
        stream.getTracks().forEach(t => t.stop())
        setError("Video element not ready. Please try again.")
        setCountdown(null)
        return
      }
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      setError(null)
    } catch (err) {
      setError("Could not access camera: " + err.message)
      setCountdown(null)
      return
    }

    let count = COUNTDOWN_SECONDS - 1
    setCountdown(count)
    const timer = setInterval(() => {
      count -= 1
      if (count <= 0) {
        clearInterval(timer)
        setCountdown(null)
        setCameraOn(true)
        frameCountRef.current = 0
        startSkeletonLoop()
        openWebSocket()
      } else {
        setCountdown(count)
      }
    }, 1000)
  }

  // Stop camera if exercise changes mid-session
  useEffect(() => {
    if (cameraOn || isCountingDown) stopCamera()
  }, [selectedId])

  useEffect(() => { return () => stopCamera() }, [])

  // ── WS status indicator color ──────────────────────────────
  const wsColor = wsStatus === "connected" ? "#22c55e"
                : wsStatus === "error"     ? "#ef4444"
                : "#9ca3af"

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>

      <h2 style={{ margin: 0 }}>Live Exercise Correction</h2>

      {/* ── Controls ─────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <select
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          disabled={isCountingDown || cameraOn}
          style={{
            padding: "10px 16px", borderRadius: 8, border: "1px solid #ddd",
            fontSize: 14, minWidth: 220, cursor: "pointer",
            opacity: (isCountingDown || cameraOn) ? 0.5 : 1
          }}
        >
          <option value="">-- Select Exercise --</option>
          {EXERCISES.map(ex => (
            <option key={ex.id} value={ex.id}>{ex.label}</option>
          ))}
        </select>

        {!cameraOn && !isCountingDown && (
          <button
            onClick={startWithCountdown}
            disabled={!selectedId}
            style={{
              padding: "10px 24px",
              background: selectedId ? "#22c55e" : "#ccc",
              color: "#fff", border: "none", borderRadius: 8,
              cursor: selectedId ? "pointer" : "not-allowed",
              fontWeight: 600, fontSize: 14
            }}
          >
            Start Camera
          </button>
        )}

        {(cameraOn || isCountingDown) && (
          <button
            onClick={stopCamera}
            style={{
              padding: "10px 24px", background: "#ef4444", color: "#fff",
              border: "none", borderRadius: 8, cursor: "pointer",
              fontWeight: 600, fontSize: 14
            }}
          >
            Stop
          </button>
        )}

        {cameraOn && selectedLabel && (
          <span style={{
            padding: "6px 14px", background: "#dbeafe", borderRadius: 20,
            fontSize: 13, fontWeight: 500, color: "#1d4ed8"
          }}>
            {selectedLabel}
          </span>
        )}

        {cameraOn && (
          <span style={{
            padding: "6px 14px",
            background: feedback.length > 0 ? "#fef2f2" : "#dcfce7",
            borderRadius: 20, fontSize: 13, fontWeight: 500,
            color: feedback.length > 0 ? "#ef4444" : "#16a34a",
            transition: "all 0.2s"
          }}>
            {feedback.length > 0 ? "🚨 Bad Form" : poseDetected ? "✅ Good Form" : "👤 No Pose"}
          </span>
        )}

        {/* WebSocket status indicator */}
        {(cameraOn || isCountingDown) && (
          <span style={{
            padding: "6px 14px", borderRadius: 20,
            fontSize: 13, fontWeight: 500,
            background: "#f3f4f6", color: wsColor,
            transition: "color 0.2s"
          }}>
            ⬤ {wsStatus === "connected" ? "WS Live" : wsStatus === "error" ? "WS Error" : "WS..."}
          </span>
        )}
      </div>

      {error && <p style={{ color: "#ef4444", margin: 0, fontWeight: 500 }}>{error}</p>}

      {/* ── Camera view ───────────────────────────────────────── */}
      {(isCountingDown || cameraOn) && (
        <div style={{
          position: "relative", width: "100%", background: "#000",
          borderRadius: 12, overflow: "hidden",
          border: feedback.length > 0 ? "3px solid #ef4444"
                : isCountingDown ? "3px solid #facc15"
                : "3px solid #22c55e",
          transition: "border-color 0.2s",
          aspectRatio: "16/9",
        }}>
          <video
            ref={videoRef}
            muted
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />

          {/* Skeleton overlay — drawn by MediaPipe WASM in browser */}
          <canvas
            ref={skeletonCanvas}
            style={{
              position: "absolute", top: 0, left: 0,
              width: "100%", height: "100%", pointerEvents: "none"
            }}
          />

          {/* Countdown */}
          {isCountingDown && (
            <div style={{
              position: "absolute", inset: 0, display: "flex",
              flexDirection: "column", alignItems: "center", justifyContent: "center",
              background: "rgba(0,0,0,0.55)", gap: 8
            }}>
              <div style={{ color: "#fff", fontSize: 16, fontWeight: 500 }}>
                Get into position...
              </div>
              <div style={{ color: "#facc15", fontSize: 96, fontWeight: 700, lineHeight: 1 }}>
                {countdown}
              </div>
            </div>
          )}

          {/* Live feedback overlay */}
          {cameraOn && feedback.length > 0 && (
            <div style={{
              position: "absolute", bottom: 16, left: 16, right: 16,
              display: "flex", flexDirection: "column", gap: 6, pointerEvents: "none"
            }}>
              {feedback[0].messages.map((m, i) => (
                <div key={i} style={{
                  background: m.severity === "CRITICAL"
                    ? "rgba(239,68,68,0.9)" : "rgba(234,179,8,0.9)",
                  color: "#fff", padding: "8px 14px", borderRadius: 8,
                  fontWeight: 700, fontSize: 15,
                  display: "flex", alignItems: "center", gap: 8,
                  backdropFilter: "blur(4px)"
                }}>
                  <span>{m.severity === "CRITICAL" ? "🚨" : "⚠️"}</span>
                  {m.message}
                </div>
              ))}
            </div>
          )}

          {/* Good form badge */}
          {cameraOn && feedback.length === 0 && poseDetected && (
            <div style={{
              position: "absolute", bottom: 16, left: 16,
              background: "rgba(34,197,94,0.85)",
              color: "#fff", padding: "8px 14px", borderRadius: 8,
              fontWeight: 700, fontSize: 14, pointerEvents: "none",
              backdropFilter: "blur(4px)"
            }}>
              ✅ Good form — keep it up!
            </div>
          )}
        </div>
      )}

      {/* ── Placeholder ───────────────────────────────────────── */}
      {!cameraOn && !isCountingDown && (
        <div style={{
          padding: 40, textAlign: "center",
          border: "2px dashed #e5e7eb", borderRadius: 12, color: "#9ca3af"
        }}>
          <p style={{ fontSize: 16, margin: 0 }}>
            Select an exercise and press <b>Start Camera</b> to begin
          </p>
        </div>
      )}

    </div>
  )
}