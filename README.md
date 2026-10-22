# Simple Daily Study Schedule Maker

A small, no-dependency web app that turns your subjects into a time-blocked study plan for the day.

## Features

Add subjects with custom study durations and priority levels (High, Medium, or Low).
Set your study start time and break length.
Automatically generates a smart timetable with high-priority subjects scheduled first.
Mark study sessions as complete with simple checkboxes.
Copy your schedule as text or print it instantly.
Your schedule is automatically saved in your browser, so you can continue where you left off.

## How to run

No install needed. Open `index.html` in any browser.

Or serve it locally:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

## Project structure

```
simple-daily-study-schedule-maker/
├── index.html   # page structure
├── style.css    # styling
├── script.js    # schedule logic + localStorage
└── README.md
```

## How the schedule is built

1. Subjects are sorted by priority (High, then Medium, then Low); ties keep the order you added them.
2. Each subject becomes one study block starting from your chosen start time.
3. A break is inserted between consecutive blocks.

## Ideas for improvements

- Split long subjects into Pomodoro-style sessions (e.g. 25 min study + 5 min break)
- Drag and drop to reorder subjects
- Weekly view with a different plan per day
- Dark mode
- Export to PDF or .ics calendar file

## License

MIT
