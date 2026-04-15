# Advanced Todo Card — Stage 1a

## What changed from Stage 0

This version extends the original Todo Card into a more interactive, stateful component.

### Added features
- Edit mode with a full inline form
- Editable title, description, priority, and due date
- Save and cancel actions
- Status control dropdown with synchronized checkbox behavior
- Priority indicator with visual state changes for Low, Medium, and High
- Expand / collapse behavior for long descriptions
- Overdue indicator with visible overdue styling
- Granular time remaining updates every 30 seconds
- Completed state handling that replaces time remaining with `Completed`
- Improved visual state syncing across checkbox, status display, and status control
- README documentation for Stage 1a changes

### State behavior
- Checking the checkbox changes status to `Done`
- Setting status to `Done` checks the checkbox
- Unchecking after `Done` resets status to `Pending`
- Saving from edit mode updates the live card values
- Cancel restores the previous values
- Time updates stop when the task is marked `Done`

### Accessibility improvements
- Semantic article-based card structure
- Labeled edit form fields
- Accessible status control
- Expand/collapse uses `aria-expanded` and `aria-controls`
- Live time updates use `aria-live="polite"`
- Keyboard focus styles remain visible throughout

## Files
- `index.html`
- `styles.css`
- `script.js`
- `README.md`
