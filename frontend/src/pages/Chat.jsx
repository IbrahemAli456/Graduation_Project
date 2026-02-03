import { useEffect, useMemo, useRef, useState } from "react"
import { useApp } from "../app/AppContext"

function now() {
  return new Date().toLocaleTimeString()
}

// ردود Mock ذكية شوية حسب goal + profile
function mockBotReply(userText, { profile, goal }) {
  const t = userText.toLowerCase()

  // أسئلة عن السعرات/الوجبات
  if (t.includes("calories") || t.includes("سعرات") || t.includes("وجبات") || t.includes("meal")) {
    if (goal === "Fat Loss") {
      return `للهدف (Fat Loss) الأفضل تبدأ بـ 1800–2000 كالوري يوميًا، مع بروتين عالي. لو عايز، قولّي بتاكل كام وجبة في اليوم؟`
    }
    if (goal === "Muscle Gain") {
      return `للهدف (Muscle Gain) محتاج فائض سعرات: 2400–2800 تقريبًا + بروتين عالي. تحب أقترح لك توزيع وجبات 3 ولا 5؟`
    }
    return `لـ Maintain: خلي السعرات حوالين 2100–2300 (تقريبًا)، وتوازن بروتين/كارب/دهون. تحب نموذج يوم كامل؟`
  }

  // أسئلة عن الخطة/التمارين
  if (t.includes("workout") || t.includes("تمرين") || t.includes("خطة") || t.includes("plan")) {
    return `خطة ${goal || "—"} بتتعمل على حسب بياناتك (${profile.height || "-"}cm, ${profile.weight || "-"}kg). تحب أشرح لك يوم 1 بالتفصيل ولا نعدل التمارين حسب مستواك؟`
  }

  // أسئلة عن الألم/الإصابة (رد آمن عام)
  if (t.includes("pain") || t.includes("وجع") || t.includes("إصابة") || t.includes("injury")) {
    return `لو في ألم حاد أو مستمر، الأفضل توقف التمرين وتستشير مختص. قولي الألم فين بالظبط؟ أثناء الحركة ولا بعدها؟`
  }

  // أسئلة عن اللايف/الوضعية
  if (t.includes("live") || t.includes("كاميرا") || t.includes("feedback") || t.includes("وضعية")) {
    return `في الـ Live Session هتطلع لك ملاحظات لحظية على الوضعية. لو عايز تحسن السكوات: ركّز على ثبات الركبة والظهر ومحاذاة القدمين.`
  }

  // افتراضي
  return `تمام. علشان أساعدك بدقة: سؤالك عن (التمارين) ولا (الوجبات) ولا (اللايف)؟`
}

export default function Chat() {
  const { profile, goal } = useApp()

  const [input, setInput] = useState("")
  const [messages, setMessages] = useState(() => [
    {
      id: crypto.randomUUID?.() || String(Math.random()),
      role: "bot",
      text: `أهلًا ${profile.name || ""} 👋 اسألني عن الخطة أو الوجبات أو التمرين (Goal: ${goal || "Not selected"}).`,
      ts: now(),
    },
  ])

  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const context = useMemo(() => ({ profile, goal }), [profile, goal])

  function send() {
    const text = input.trim()
    if (!text) return

    const userMsg = {
      id: crypto.randomUUID?.() || String(Math.random()),
      role: "user",
      text,
      ts: now(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")

    // Mock "thinking"
    setTimeout(() => {
      const reply = mockBotReply(text, context)
      const botMsg = {
        id: crypto.randomUUID?.() || String(Math.random()),
        role: "bot",
        text: reply,
        ts: now(),
      }
      setMessages((prev) => [...prev, botMsg])
    }, 500)
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="grid">
      <div className="card">
        <div className="h1">Assistant</div>
        <div className="muted">
          Ask about plans, meals, workouts, or live feedback.
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {/* Messages */}
        <div style={{ height: 420, overflowY: "auto", padding: 16 }}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                marginBottom: 10,
              }}
            >
              <div
                className="card soft"
                style={{
                  maxWidth: "75%",
                  padding: 12,
                  borderColor:
                    m.role === "user"
                      ? "rgba(110,231,255,0.25)"
                      : "rgba(255,255,255,0.10)",
                }}
              >
                <div style={{ fontWeight: 800, marginBottom: 6 }}>
                  {m.role === "user" ? "You" : "Coach AI"}{" "}
                  <span className="muted" style={{ fontWeight: 600, marginLeft: 8 }}>
                    {m.ts}
                  </span>
                </div>
                <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ borderTop: "1px solid var(--border)", padding: 12 }}>
          <div className="row" style={{ alignItems: "center" }}>
            <textarea
              className="input"
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="اكتب سؤالك هنا… (Enter للإرسال)"
              style={{ resize: "none", flex: 1 }}
            />
            <button className="btn primary" onClick={send}>
              Send
            </button>
          </div>

          <div className="help" style={{ marginTop: 8 }}>
            Tip: اكتب مثلًا “عاوز نظام وجبات لزيادة العضلات” أو “ازاي أحسن السكوات؟”
          </div>
        </div>
      </div>
    </div>
  )
}
