# ALIGNMENT: AI Analysis for Idea Cards

## 1. Project Context
- **Current State**: A Vue.js based Idea Card Manager using LocalStorage.
- **Goal**: Integrate an AI analysis feature for individual idea cards.
- **Constraint**: Do not overwrite existing card content. Add a new section for the analysis.

## 2. Requirements
- **Trigger**: User initiates analysis (e.g., via a button "AI Analyze").
- **Input**: The content of the current idea card.
- **API Endpoint**: `GET http://localhost:8080/chat/sync`
    - Parameter: `message` (URL encoded idea content).
- **Output**: Display the text response from the API.
- **UI/UX**: 
    - A new section below the main content in the Detail Modal.
    - Loading state while fetching.
    - Error handling.

## 3. Implementation Plan
- **Modify `IdeaDetailModal.vue`**:
    - Add `isAnalyzing` state.
    - Add `aiAnalysisResult` state.
    - Add `analyzeIdea` function using `fetch`.
    - Add UI elements:
        - "AI Analyze" button (near edit/close or in the footer).
        - Analysis Result Section (below `modal-body`, styled distinctly).

## 4. Questions & Assumptions
- **Assumption**: The backend is running locally on port 8080 and CORS is configured or not an issue for this dev environment.
- **Assumption**: The `message` parameter should include the title and content of the idea for better context.
- **Assumption**: The response is plain text.

## 5. Consensus
- We will implement the "Sync" (non-streaming) version first as requested.
