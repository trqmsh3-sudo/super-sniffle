# 🧠 Smart AI Routing Guide

## 🎯 מה זה Smart Routing?

מערכת חכמה שמחליטה **אוטומטית** איזה AI להשתמש לכל משימה:
- **Gemini** (חינם) → משימות פשוטות
- **Claude** (בתשלום) → משימות מורכבות + web search

**תוצאה: חיסכון של 70-80% בעלויות AI!** 💰

---

## 💡 האסטרטגיה

```
חלוקת העבודה:

🟢 Gemini (Google - חינם עד 60 req/min):
├── זיהוי מוצרים
├── סינון ספאם
├── סיכום תיקים קיימים
├── שאלות בסיסיות
├── קטגוריזציה
└── 70% מהעבודה!

🔵 Claude (Anthropic - בתשלום):
├── בניית תיקים חדשים (web search!)
├── ניתוח עמוק של ביקורות
├── עדכון תיקים עם מידע חדש
├── שאלות מורכבות
└── 30% מהעבודה
```

---

## 🚀 איך להשתמש

### הגדרה:

```bash
# .env
GEMINI_API_KEY=your_gemini_key_here
CLAUDE_API_KEY=your_claude_key_here  # אופציונלי
```

### בקוד:

```javascript
const SmartAIRouter = require('./services/aiRouter');
const router = new SmartAIRouter();

// המערכת תבחר אוטומטית!

// 1. זיהוי מוצר (פשוט → Gemini)
const product = await router.route('identify_product', {
  query: 'iphone 15 pro'
});

// 2. בניית תיק (מורכב → Claude + web search)
const dossier = await router.route('build_dossier', {
  productName: 'iPhone 15 Pro'
});

// 3. סיכום (פשוט → Gemini)
const summary = await router.route('summarize_existing', {
  product_name: 'iPhone 15 Pro',
  overall_score: 87,
  pros: [...],
  cons: [...]
});
```

---

## 📊 משימות נתמכות

### Gemini (חינם):

| משימה | תיאור | דוגמה |
|-------|--------|-------|
| `identify_product` | זיהוי וניקוי שם מוצר | "iphone 15" → {"name": "iPhone 15 Pro"} |
| `filter_spam` | סינון ביקורות ספאם | "BUY NOW!!!" → {is_spam: true} |
| `summarize_existing` | סיכום תיק קיים | תיק → סיכום של 2-3 משפטים |
| `simple_comparison` | השוואה בין 2 מוצרים | A vs B → {winner: "A"} |
| `basic_qa` | שאלות בסיסיות | "מה הציון?" → {answer: "87/100"} |
| `categorize` | קטגוריזציה | "iPhone" → {category: "smartphones"} |

### Claude (בתשלום):

| משימה | תיאור | עלות |
|-------|--------|------|
| `build_dossier` | בניית תיק חדש + web search | ~$0.02 |
| `update_dossier` | עדכון תיק עם מידע חדש | ~$0.02 |
| `deep_analysis` | ניתוח עמוק | ~$0.02 |
| `complex_qa` | שאלות מורכבות | ~$0.02 |

---

## 💰 חיסכון בפועל

### דוגמה: 1000 משתמשים בחודש

**ללא Smart Routing (הכל Claude):**
```
בניית תיקים: 200 × $0.02 = $4
שאלות: 2000 × $0.02 = $40
סיכומים: 500 × $0.02 = $10
השוואות: 300 × $0.02 = $6
───────────────────────
סה"כ: $60/חודש (~₪220)
```

**עם Smart Routing (70% Gemini):**
```
בניית תיקים (Claude): 200 × $0.02 = $4
שאלות (30% Claude): 600 × $0.02 = $12
סיכומים (Gemini): $0
השוואות (Gemini): $0
───────────────────────
סה"כ: $16/חודש (~₪60)
```

**חיסכון: $44/חודש (73%)** 🎉

---

## 📈 ניטור ביצועים

### API Endpoint:

```bash
GET /api/admin/ai-stats
```

### תגובה:

```json
{
  "success": true,
  "stats": {
    "overview": {
      "total_calls": 150,
      "gemini_calls": 105,
      "claude_calls": 45,
      "gemini_percentage": "70.0%"
    },
    "costs": {
      "gemini": "$0.00 (free)",
      "claude": "$0.90",
      "total_cost": "$0.90",
      "savings": {
        "usd": "$2.10",
        "ils": "₪7.77"
      },
      "potential_cost_without_routing": "$3.00"
    },
    "errors": {
      "gemini": 2,
      "claude": 0,
      "total": 2
    }
  },
  "message": "Smart routing saved you 70.0% of AI costs! 🎉"
}
```

---

## 🧪 בדיקות

### הרצת בדיקות:

```bash
npm run test-router
```

### מה זה בודק:
1. ✅ זיהוי מוצר (Gemini)
2. ✅ סינון ספאם (Gemini)
3. ✅ סיכום תיק (Gemini)
4. ✅ בניית תיק (Claude) - אופציונלי
5. ✅ סטטיסטיקות

---

## 🔧 התאמה אישית

### הוספת משימה חדשה:

1. הוסף למערך `simpleTasks` ב-`aiRouter.js`:
```javascript
const simpleTasks = [
  'identify_product',
  'filter_spam',
  'your_new_simple_task'  // ← הוסף כאן
];
```

2. הוסף prompt ב-`buildGeminiPrompt()`:
```javascript
your_new_simple_task: `
  Your prompt here...
  Return JSON: {...}
`
```

3. השתמש:
```javascript
const result = await router.route('your_new_simple_task', {
  // your data
});
```

---

## 💡 Best Practices

### 1. תמיד השתמש ב-Router
```javascript
// ❌ לא טוב
const gemini = new GoogleGenerativeAI(API_KEY);
const result = await gemini.generateContent(prompt);

// ✅ טוב
const router = new SmartAIRouter();
const result = await router.route('identify_product', data);
```

### 2. בדוק סטטיסטיקות
```javascript
// בסוף כל סשן
const stats = router.getStats();
console.log(`Saved: ${stats.costs.actual_savings}`);
```

### 3. Fallback
המערכת מטפלת אוטומטית:
- אם Gemini נכשל → עובר ל-Claude
- אם Claude לא זמין → זורק שגיאה ברורה

---

## 🐛 Troubleshooting

### "No AI service available"
```bash
# בדוק שיש לפחות Gemini API key:
echo $GEMINI_API_KEY
```

### "Gemini quota exceeded"
```bash
# Gemini: 60 requests/דקה
# אם עברת - המערכת תעבור אוטומטית ל-Claude
```

### "Claude API error"
```bash
# בדוק שה-key נכון:
# צריך להתחיל ב-sk-ant-api03-...
```

---

## 📚 דוגמאות נוספות

### שאלה חכמה:

```javascript
// המערכת מחליטה אוטומטית לפי מורכבות השאלה

// שאלה פשוטה → Gemini
await router.route('basic_qa', {
  question: "מה הציון הכללי?",
  dossier: {...}
});

// שאלה מורכבת → Claude
await router.route('complex_qa', {
  question: "האם המוצר מתאים למשפחה עם ילדים קטנים בסביבה רועשת?",
  dossier: {...}
});
```

### עדכון תיק:

```javascript
// רק אם יש Claude (web search!)
if (process.env.CLAUDE_API_KEY) {
  const updates = await router.route('update_dossier', {
    productName: 'iPhone 15 Pro',
    daysSinceUpdate: 30,
    currentDossier: {...}
  });
}
```

---

## 🎯 סיכום

**Smart AI Routing = Win-Win!**

✅ חיסכון של 70-80% בעלויות
✅ עדיין איכות מעולה
✅ אוטומטי לחלוטין
✅ fallback מובנה
✅ ניטור קל

**התחל עכשיו:**
```bash
npm run test-router
```

---

**נבנה על ידי: Smart AI הסטרטגיה 🚀**
