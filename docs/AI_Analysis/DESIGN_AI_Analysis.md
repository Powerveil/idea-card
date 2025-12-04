# DESIGN: AI Analysis Feature

## 1. Architecture
- **Frontend Only**: Logic resides within `IdeaDetailModal.vue`.
- **Direct API Call**: Component calls `localhost:8080` directly.

## 2. UI Design
- **Location**: Inside `IdeaDetailModal`, below the main content (`modal-body`) and above the footer (`modal-footer`).
- **Components**:
    - **Trigger Button**: "✨ AI Analysis" button.
    - **Result Container**: A styled box with a different background color (e.g., light purple/blue) to distinguish from user content.
    - **Loading Indicator**: Simple text or spinner during request.

## 3. Data Flow
1. User clicks "AI Analysis".
2. `analyzeContent()` is called.
3. `GET /chat/sync?message=...` is fired.
4. Response text is assigned to `aiAnalysis`.
5. UI updates to show result.

## 4. Interface
```typescript
// State
const aiAnalysis = ref<string>('')
const isAnalyzing = ref<boolean>(false)

// Function
const analyzeIdea = async () => {
  if (!props.idea) return
  isAnalyzing.value = true
  try {
    const msg = `Title: ${props.idea.title}\nContent: ${props.idea.content}`
    const res = await fetch(`http://localhost:8080/chat/sync?message=${encodeURIComponent(msg)}`)
    const text = await res.text()
    aiAnalysis.value = text
  } catch (e) {
    aiAnalysis.value = "Error analyzing idea."
  } finally {
    isAnalyzing.value = false
  }
}
```
