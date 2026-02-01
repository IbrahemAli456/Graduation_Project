import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"

// Mock videos (local URLs or placeholders)
// لاحقًا هتيجي من DB: ex.videoUrl
const VIDEO_BY_ID = {
  squat: "https://www.w3schools.com/html/mov_bbb.mp4",
  pushup: "https://www.w3schools.com/html/mov_bbb.mp4",
  plank: "https://www.w3schools.com/html/mov_bbb.mp4",
}

const NAME_BY_ID = {
  squat: "Squat",
  pushup: "Push Up",
  plank: "Plank",
}

function randomTip(exerciseId) {
  const tips = {
    squat: [
      "Lower your hips a bit more.",
      "Keep your back neutral.",
      "Knees track over toes.",
    ],
    pushup: [
      "Keep your body in a straight line.",
      "Don’t flare your elbows too much.",
      "Lower your chest under control.",
    ],
    plank: [
      "Don’t drop your hips.",
      "Brace your core.",
      "Keep your neck neutral.",
    ],
  }
  const list = tips[exerciseId] || ["Good form!"]
  return list[Math.floor(Math.random() * list.length)]
}

export default function ExercisePlayer() {
  const { id } = useParams()
  const [feedback, setFeedback] = useState([])
  const videoUrl = VIDEO_BY_ID[id]
  const exName = useMemo(() => NAME_BY_ID[id] || "Exercise", [id])

  // Mock "real-time" feedback: كل 2 ثانية يضيف نصيحة
  useEffect(() => {
    setFeedback([]) // reset when exercise changes
    const interval = setInterval(() => {
      setFeedback((prev) => [
        { ts: new Date().toLocaleTimeString(), msg: randomTip(id) },
        ...prev,
      ].slice(0, 6))
    }, 2000)

    return () => clearInterval(interval)
  }, [id])

  if (!videoUrl) {
    return (
      <div>
        <p>Exercise not found.</p>
        <Link to="/exercises">Back to exercises</Link>
      </div>
    )
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>{exName}</h2>
        <Link to="/exercises">← Back</Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <div>
          <video
            src={videoUrl}
            controls
            autoPlay
            style={{ width: "100%", borderRadius: 8, background: "#000" }}
          />
          <p style={{ marginTop: 8, opacity: 0.8 }}>
            (دلوقتي Mock — لاحقًا الفيديو والـ feedback هيبقوا real-time من السيرفر)
          </p>
        </div>

        <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Real-time Feedback</h3>

          {feedback.length === 0 ? (
            <p>Waiting for feedback...</p>
          ) : (
            <ul style={{ paddingLeft: 18 }}>
              {feedback.map((f, idx) => (
                <li key={idx}>
                  <b>{f.ts}:</b> {f.msg}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
