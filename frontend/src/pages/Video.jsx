import { useState } from "react"
import { Link } from "react-router-dom"

export default function Video() {
  const [fileName, setFileName] = useState("")

  return (
    <div>
      <h2>Upload Exercise Video</h2>

      <input
        type="file"
        accept="video/*"
        onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
      />

      {fileName && <p>Selected: {fileName}</p>}

      <Link to="/feedback">Analyze (Mock) → Feedback</Link>
    </div>
  )
}
