# DueDate

A mobile-friendly deadline tracker for students juggling more than one degree. Built with plain HTML, CSS, and JavaScript in a single file, no install or account needed.

**Live app:** [(https://due-date-three.vercel.app/)]

## Why I built it

I'm doing an offline B.Tech and an online BS at the same time, and my deadlines were scattered across WhatsApp, portals, and notes. DueDate puts them all in one place, sorted by what's due first.

## Features

- Add tasks with title, course, source (College / Online Degree), type (Assignment, Quiz, Exam, Project, Other), due date and time, and notes
- Dashboard sorted by urgency with color-coded cards:
  - Red: due within 48 hours or overdue
  - Yellow: due within 7 days
  - Green: due later
- Live countdown (for example "2d 5h left") that refreshes every minute
- Mark tasks as done, with undo, and a separate Completed tab
- Search, plus filters by source, course, and type
- Rolling "This Week" view grouped by day
- Edit and delete tasks, with a confirmation before deleting
- Data saved in the browser with localStorage, so it survives a refresh
- Responsive, dark-mode friendly layout

## Edge cases handled

- Overdue tasks stay red and show "Overdue by ..." instead of negative time
- Form validation blocks empty titles and missing dates
- Corrupted localStorage falls back to an empty list instead of crashing
- User input is escaped before rendering, so HTML in a title can't break the page
- Long titles and notes wrap instead of stretching the mobile layout

## Run it locally

1. Download or clone this repo
2. Open `index.html` in any browser

## Tech

HTML, CSS (variables for theming), vanilla JavaScript, localStorage.

## How it was made

Vibe coded in Google AI Studio: I described the app in plain language, had it list possible flaws before writing code, then tested it (past dates, empty fields, lots of tasks) and fixed what broke.

## Possible next steps

- Reminders and notifications
- Import deadlines from a calendar
- Export and backup of tasks
