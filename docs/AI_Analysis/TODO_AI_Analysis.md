# TODO: AI Analysis Next Steps

## Immediate Actions
- [ ] **Start Backend**: Ensure your backend service is running on port 8080.
- [ ] **CORS**: Ensure your backend allows CORS requests from the frontend (usually `http://localhost:5173` or wherever this runs).

## Future Improvements
- [ ] **Streaming Support**: Implement the `/chat/stream` endpoint for real-time feedback.
- [ ] **Save Analysis**: Currently the analysis is lost when closing the modal. Consider saving it to the `Idea` store/local storage.
- [ ] **Prompt Engineering**: Allow customizing the prompt sent to the AI (currently just sends the raw content).
