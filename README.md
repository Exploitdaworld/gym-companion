# 💪 Gym Companion Web App

A minimalist, responsive gym tracking application built with HTML, Tailwind CSS, and vanilla JavaScript.

## Features

### 1. **Workout Tracker**
- Add exercises with sets, reps, and weight
- Automatic workout history logging
- Grouped by date for easy viewing
- Delete individual exercises
- Data persists using localStorage

### 2. **Routine Planner**
- Weekly grid layout (Monday–Sunday)
- Add custom exercises to each day
- Visual representation of your workout split
- Save and load routines locally

### 3. **Timer & Rest Module**
- Countdown timer with MM:SS display
- Preset intervals: 30s, 60s, 90s
- Custom timer input
- Start, pause, and reset controls
- Optional sound alert using Web Audio API

### 4. **Macro Calculator**
- BMR calculation using Mifflin-St Jeor Equation
- Input: age, weight, height, gender, activity level
- Goal-based calculations (cut/maintain/bulk)
- Calculates daily calories, protein, carbs, and fats
- Saves presets for quick recalculation

### 5. **Mood & Journal Logger**
- Emoji-based mood selector (5 moods)
- Notes section for workout reflections
- Chronological history view
- Date and time stamps
- Delete individual entries

### 6. **Progress Charts**
- Weight lifted over time (line chart)
- Body weight progress tracking
- Powered by Chart.js
- Visual data representation for top 3 exercises

### 7. **Exercise Demonstrations**
- Library of 12+ common exercises
- Animated GIF demonstrations showing proper form
- Search exercises by name
- Filter by muscle group (chest, back, shoulders, legs, arms, core)
- Difficulty ratings (Beginner/Intermediate/Advanced)
- Step-by-step instructions for each exercise
- Responsive card layout

## Design Principles

- **Minimalist UI**: Clean layout with ample whitespace
- **Muted Colors**: Soft grays and blues for reduced eye strain
- **Responsive**: Mobile-first design that scales to desktop
- **Accessible**: Clear fonts (Inter) and intuitive navigation
- **Fast**: No frameworks, pure vanilla JavaScript
- **Persistent**: All data saved to localStorage

## Getting Started

1. Open `index.html` in a modern web browser
2. Start tracking your workouts!

No build process or dependencies required - just open and use.

## Technology Stack

- **HTML5**: Semantic markup
- **Tailwind CSS**: Utility-first styling via CDN
- **Vanilla JavaScript**: Modular, organized code
- **Chart.js**: Data visualization
- **localStorage**: Client-side data persistence
- **Web Audio API**: Timer sound alerts

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

Requires JavaScript and localStorage enabled.

## Future Enhancements

Potential features for future versions:
- Export/import workout data
- Progressive overload tracking
- Social sharing
- Progressive Web App (PWA) support
- Dark mode toggle
- Custom exercise uploads
- Video demonstrations (MP4 support)

## File Structure

```
gym-companion/
├── index.html      # Main HTML structure
├── app.js          # JavaScript modules
└── README.md       # Documentation
```

## Usage Tips

1. **Workout Tracker**: Log exercises as you complete them for accurate history
2. **Routine Planner**: Set up your weekly split once and reference it during workouts
3. **Timer**: Use preset buttons for quick rest periods between sets
4. **Macro Calculator**: Input your stats once - they'll be saved for future calculations
5. **Journal**: Track how you felt after each workout to identify patterns
6. **Progress Charts**: Regularly check your progress to stay motivated
7. **Exercise Demos**: Reference proper form before attempting new exercises

## License

Free to use and modify for personal or commercial projects.

---

**Built with ❤️ for fitness enthusiasts**
