import { Link, useNavigate } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { getCurrentUser } from "../services/users"

function safeJsonParse(value) {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function normalizeMealText(text) {
  if (!text) return ""
  // النص جاي فيه \n حرفيًا، فبنحوّله لسطر جديد
  return String(text).replace(/\\n/g, "\n").trim()
}

function parseMealSections(mealText) {
  const text = normalizeMealText(mealText)
  if (!text) return []

  // بنقسّم على "TITLE:" (زي BREAKFAST:, LUNCH:, ...)
  // ونحافظ على العنوان
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean)

  const sections = []
  let current = null

  const isHeader = (line) =>
    /^[A-Z][A-Z\s]+:$/.test(line) || /^[A-Z][A-Z\s]+:/.test(line) // مرنة شوية

  for (const line of lines) {
    // لو سطر عنوان
    if (isHeader(line)) {
      // مثال: "BREAKFAST:" أو "BREAKFAST:\n - ..."
      const title = line.replace(/:.*$/, "").trim() // خد العنوان قبل :
      current = { title, items: [] }
      sections.push(current)

      // لو في نفس السطر فيه محتوى بعد النقطتين
      const afterColon = line.includes(":") ? line.split(":").slice(1).join(":").trim() : ""
      if (afterColon) current.items.push(afterColon)
      continue
    }

    // لو مش عنوان
    if (!current) {
      // لو النص بدأ بدون عنوان — حطه في قسم عام
      current = { title: "Plan", items: [] }
      sections.push(current)
    }

    // شيل "- " لو موجود
    const item = line.replace(/^-+\s*/, "").trim()
    if (item) current.items.push(item)
  }

  // فلترة الأقسام الفاضية
  return sections.filter((s) => s.items.length > 0)
}

export default function Dashboard() {
  const navigate = useNavigate()

  const [user, setUser] = useState(() => safeJsonParse(localStorage.getItem("current_user") || "null"))
  const [nutritionPlan, setNutritionPlan] = useState(() =>
    safeJsonParse(localStorage.getItem("nutrition_plan") || "null")
  )
  const [showRaw, setShowRaw] = useState(false)

  // تحديث بيانات المستخدم (اختياري)
  useEffect(() => {
    getCurrentUser()
      .then((data) => {
        const me = data?.data ?? data
        setUser(me)
        localStorage.setItem("current_user", JSON.stringify(me))
      })
      .catch(() => {})
  }, [])

  // استخراج الداتا اللي جاية من الباك
  const inbody = nutritionPlan?.inbody_data || {}
  const conditions = nutritionPlan?.health_conditions || []

  // meal_plan dict جاية بالشكل: { id, meal, user_id, ... }
  const mealText =
    nutritionPlan?.meal_plan?.meal ||
    nutritionPlan?.meal_plan?.meal_plan ||
    nutritionPlan?.meal_plan ||
    ""

  const sections = useMemo(() => parseMealSections(mealText), [mealText])

  const stats = useMemo(() => {
    return {
      workouts: 8,
      streak: 4,
      avgCalories: inbody.target_calories ?? 2150,
      sessions: 5,
      lastStatus: "Good",
    }
  }, [inbody])

  function goGenerate() {
    navigate("/goals")
  }

  function clearPlan() {
    localStorage.removeItem("nutrition_plan")
    setNutritionPlan(null)
    setShowRaw(false)
  }

  return (
    <div className="grid">
      {/* Header */}
      <div className="card">
        <div className="h1">Dashboard</div>
        <div className="muted">
          {user?.username ? (
            <>
              Welcome back, <b>{user.username}</b> 👋
            </>
          ) : (
            "Your training overview & recent performance."
          )}
        </div>
      </div>

      {/* Nutrition Plan */}
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="h2" style={{ margin: 0 }}>Nutrition Plan</div>
            <div className="muted">Your latest generated plan</div>
          </div>

          <div className="row">
            {nutritionPlan ? (
              <>
                <button className="btn" onClick={() => setShowRaw((p) => !p)}>
                  {showRaw ? "Hide Raw" : "Show Raw"}
                </button>
                <button className="btn" onClick={clearPlan}>Clear</button>
              </>
            ) : (
              <button className="btn primary" onClick={goGenerate}>
                Generate in Goals →
              </button>
            )}
          </div>
        </div>

        {!nutritionPlan ? (
          <div className="muted" style={{ marginTop: 12 }}>
            No nutrition plan yet. Go to <b>Goals</b> and click <b>Generate Plan</b>.
          </div>
        ) : (
          <>
            {/* Conditions */}
            {conditions.length > 0 && (
              <div className="row" style={{ marginTop: 12, flexWrap: "wrap", gap: 8 }}>
                <div className="muted">Health:</div>
                {conditions.map((c) => (
                  <span key={c} className="badge warn">{c}</span>
                ))}
              </div>
            )}

            {/* Targets */}
            <div
              className="grid"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                marginTop: 12,
              }}
            >
              <div className="card soft">
                <div className="h2">{inbody.target_calories ?? "-"}</div>
                <div className="muted">Target Calories</div>
              </div>
              <div className="card soft">
                <div className="h2">{inbody.target_protein ?? "-"}</div>
                <div className="muted">Target Protein</div>
              </div>
              <div className="card soft">
                <div className="h2">{inbody.target_carbs ?? "-"}</div>
                <div className="muted">Target Carbs</div>
              </div>
              <div className="card soft">
                <div className="h2">{inbody.target_fat ?? "-"}</div>
                <div className="muted">Target Fats</div>
              </div>
            </div>

            {/* Meals Sections */}
            <div style={{ marginTop: 14 }}>
              <div className="h2" style={{ marginBottom: 8 }}>Meals</div>

              {sections.length === 0 ? (
                <div className="muted">No meal text found.</div>
              ) : (
                <div className="grid" style={{ gap: 12 }}>
                  {sections.map((sec) => (
                    <div key={sec.title} className="card soft">
                      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                        <div className="h2" style={{ margin: 0 }}>{sec.title}</div>
                      </div>

                      <ul style={{ marginTop: 10, marginBottom: 0, paddingLeft: 18 }}>
                        {sec.items.map((item, idx) => (
                          <li key={idx} style={{ marginBottom: 6 }}>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Raw JSON (اختياري) */}
            {showRaw && (
              <div style={{ marginTop: 14 }}>
                <div className="muted" style={{ marginBottom: 6 }}>
                  Raw plan data:
                </div>
                <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                  {JSON.stringify(nutritionPlan, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}
      </div>

      {/* Stats */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <div className="card soft">
          <div className="h2">{stats.workouts}</div>
          <div className="muted">Workouts Completed</div>
        </div>

        <div className="card soft">
          <div className="h2">{stats.streak} days</div>
          <div className="muted">Current Streak</div>
        </div>

        <div className="card soft">
          <div className="h2">{stats.avgCalories}</div>
          <div className="muted">Avg Calories</div>
        </div>

        <div className="card soft">
          <div className="h2">{stats.sessions}</div>
          <div className="muted">Live Sessions</div>
        </div>
      </div>

      {/* Actions */}
      <div className="card soft">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="h2" style={{ margin: 0 }}>What’s next?</div>
            <div className="muted">Continue training or update your goal.</div>
          </div>

          <div className="row">
            <Link to="/goals" className="btn">Goals</Link>
            <Link to="/live" className="btn primary">Start Live Session</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
