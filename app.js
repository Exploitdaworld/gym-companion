// ============================================
// UTILITY FUNCTIONS
// ============================================

const storage = {
    get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    append(key, value) {
        const existing = this.get(key) || [];
        existing.push(value);
        this.set(key, existing);
    },
};

// If testing is enabled, override the Tricep Dips media to use the remote animated GIF
try {
    if (ExerciseLibrary && ExerciseLibrary.TEST_USE_REMOTE_TRICEP_GIF) {
        const idx = ExerciseLibrary.exercises.findIndex(e => e.name === 'Tricep Dips');
        if (idx !== -1) {
            ExerciseLibrary.exercises[idx].media = ExerciseLibrary.REMOTE_TRICEP_GIF_URL;
        }
    }
} catch (e) {
    // ignore silently
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;

            // Update active states
            tabButtons.forEach(btn => btn.classList.remove('active', 'bg-blue-600', 'text-white'));
            tabButtons.forEach(btn => btn.classList.add('text-gray-600'));
            button.classList.add('active', 'bg-blue-600', 'text-white');
            button.classList.remove('text-gray-600');

            // Show selected tab
            tabContents.forEach(content => content.classList.add('hidden'));
            const tabElem = document.getElementById(`${tabName}-tab`);
            if (tabElem) {
                tabElem.classList.remove('hidden');
                // animate tab reveal if GSAP is available
                if (window.gsap) {
                    try { gsap.fromTo(tabElem, {autoAlpha: 0, y: 12}, {duration: 0.36, autoAlpha: 1, y: 0, ease: 'power2.out'}); } catch (e) {}
                }
            }

            // Load data for specific tabs
            if (tabName === 'progress') initProgressCharts();
            if (tabName === 'routine') loadRoutineGrid();
        });
    });

    // Set initial active state
    if (tabButtons[0]) {
        tabButtons[0].classList.add('bg-blue-600', 'text-white');
        tabButtons[0].classList.remove('text-gray-600');
    }
}

// ============================================
// WORKOUT TRACKER MODULE
// ============================================

const WorkoutTracker = {
    init() {
        const form = document.getElementById('workout-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExercise();
        });
        this.loadHistory();
    },

    addExercise() {
        const exercise = {
            id: Date.now(),
            name: document.getElementById('exercise-name').value,
            sets: parseInt(document.getElementById('exercise-sets').value),
            reps: parseInt(document.getElementById('exercise-reps').value),
            weight: parseFloat(document.getElementById('exercise-weight').value) || 0,
            date: new Date().toISOString()
        };

        storage.append('workouts', exercise);
        this.loadHistory();
        document.getElementById('workout-form').reset();
    },

    loadHistory() {
        const workouts = storage.get('workouts') || [];
        const container = document.getElementById('workout-history');
        
        if (workouts.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center">No workouts logged yet. Start by adding an exercise!</p>';
            return;
        }

        // Group by date
        const grouped = workouts.reduce((acc, workout) => {
            const date = new Date(workout.date).toLocaleDateString();
            if (!acc[date]) acc[date] = [];
            acc[date].push(workout);
            return acc;
        }, {});

        container.innerHTML = Object.entries(grouped)
            .reverse()
            .map(([date, exercises]) => `
                <div class="border border-gray-200 rounded-lg p-4">
                    <h3 class="font-semibold text-gray-700 mb-3">${date}</h3>
                    <div class="space-y-2">
                        ${exercises.map(ex => `
                            <div class="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                                <div>
                                    <div class="font-medium text-gray-800">${ex.name}</div>
                                    <div class="text-sm text-gray-600">${ex.sets} sets × ${ex.reps} reps ${ex.weight ? `@ ${ex.weight}kg` : ''}</div>
                                </div>
                                <button onclick="WorkoutTracker.deleteExercise(${ex.id})" 
                                    class="text-red-500 hover:text-red-700 text-sm">Delete</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
    },

    deleteExercise(id) {
        let workouts = storage.get('workouts') || [];
        workouts = workouts.filter(w => w.id !== id);
        storage.set('workouts', workouts);
        this.loadHistory();
    }
};

// ============================================
// ROUTINE PLANNER MODULE
// ============================================

const RoutinePlanner = {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    
    init() {
        loadRoutineGrid();
    }
};

// ============================================
// DIET PLANNER
// ============================================

const SuggestedDiet = {
    // Simple balanced, slightly calorie deficit daily plan (example)
    Monday: {
        breakfast: 'Oats with berries + 1 scoop protein',
        lunch: 'Grilled chicken salad (mixed greens, avocado)',
        snack: 'Greek yogurt + almonds',
        dinner: 'Salmon, quinoa, steamed broccoli'
    },
    Tuesday: {
        breakfast: 'Scrambled eggs + spinach + whole grain toast',
        lunch: 'Turkey wrap with veggies',
        snack: 'Apple + peanut butter',
        dinner: 'Stir-fry tofu with mixed vegetables and brown rice'
    },
    Wednesday: {
        breakfast: 'Protein shake + banana',
        lunch: 'Tuna salad with mixed greens',
        snack: 'Carrot sticks + hummus',
        dinner: 'Chicken breast, sweet potato, asparagus'
    },
    Thursday: {
        breakfast: 'Cottage cheese with pineapple',
        lunch: 'Beef and vegetable bowl with quinoa',
        snack: 'Mixed nuts',
        dinner: 'Grilled shrimp, brown rice, green beans'
    },
    Friday: {
        breakfast: 'Omelette (eggs, veggies) + whole grain toast',
        lunch: 'Chicken caesar (light dressing)',
        snack: 'Protein bar or shake',
        dinner: 'Lean steak, roasted veggies, salad'
    },
    Saturday: {
        breakfast: 'Pancakes (protein) + berries',
        lunch: 'Quinoa salad with chickpeas',
        snack: 'Cottage cheese + fruit',
        dinner: 'Baked cod, roasted sweet potato, kale'
    },
    Sunday: {
        breakfast: 'Yogurt parfait with granola',
        lunch: 'Leftovers / flexible meal',
        snack: 'Fruit + nuts',
        dinner: 'Light pasta with veggies and lean protein'
    }
};

// Pakistani-focused diet plan (from user's attachment)
const PakistaniDiet = {
    // Use same structure for each day; flexible options provided in notes
    Monday: {
        breakfast: 'Warm water with lemon or green tea; 2 boiled eggs + 1 whole wheat roti',
        lunch: '1–2 chapatis, skinless grilled chicken curry, daal or mixed sabzi, fresh salad',
        snack: 'Seasonal fruit + handful of soaked almonds',
        dinner: 'Grilled chicken tikka + 1 chapati + sautéed vegetables',
        beforeBed: 'Warm turmeric milk (low-fat) or herbal tea'
    },
    Tuesday: {
        breakfast: 'Vegetable omelet with minimal oil + whole wheat toast',
        lunch: 'Chicken curry (light), brown rice or chapati, salad',
        snack: 'Green tea + roasted chana',
        dinner: 'Tofu/vegetable stir-fry with brown rice',
        beforeBed: 'Herbal tea'
    },
    Wednesday: {
        breakfast: 'Paratha with ½ tsp desi ghee (occasionally) or egg option',
        lunch: 'Grilled chicken breast, daal, chapati, salad',
        snack: 'Greek yogurt or fruit',
        dinner: 'Chicken palak (minimal oil) + small portion rice',
        beforeBed: 'Warm milk with turmeric'
    },
    Thursday: {
        breakfast: 'Oats or protein shake + banana',
        lunch: 'Tuna or chicken salad, chapati',
        snack: 'Carrot sticks + hummus',
        dinner: 'Grilled shrimp or fish, quinoa or rice, vegetables',
        beforeBed: 'Herbal tea'
    },
    Friday: {
        breakfast: 'Omelette + whole wheat roti',
        lunch: 'Lean beef bowl or chicken, brown rice, salad',
        snack: 'Mixed nuts',
        dinner: 'Lean steak or kebab, roasted veggies',
        beforeBed: 'Warm milk'
    },
    Saturday: {
        breakfast: 'Protein pancakes or yogurt parfait',
        lunch: 'Quinoa salad with chickpeas',
        snack: 'Cottage cheese + fruit',
        dinner: 'Baked cod or chicken, sweet potato, kale',
        beforeBed: 'Herbal tea'
    },
    Sunday: {
        breakfast: 'Yogurt parfait with granola',
        lunch: 'Flexible/leftovers',
        snack: 'Fruit + nuts',
        dinner: 'Light pasta with veggies and lean protein',
        beforeBed: 'Warm milk'
    },
    // Add contextual notes
    _notes: `Key Notes for Pakistani Context:\n- Use skinless chicken, prefer grilling/baking over deep frying.\n- Prefer whole wheat chapati, brown rice, or millet instead of white flour naan.\n- Cook with minimal oil; use spices for flavor (zeera, dhania, haldi, mirch).\n- Hydration: 8–10 glasses daily.\n\nRecipe ideas: Chicken tikka baked with yogurt marinade; Chicken palak (minimal oil); Chicken soup with desi spices.`
};

const DietPlanner = {
    init() {
        const applyBtn = document.getElementById('apply-suggested-diet');
        if (applyBtn) applyBtn.addEventListener('click', this.applySuggestedDiet.bind(this));
        const applyPak = document.getElementById('apply-pakistani-diet');
        if (applyPak) applyPak.addEventListener('click', this.applyPakistaniDiet.bind(this));
        const clearBtn = document.getElementById('clear-diet');
        if (clearBtn) clearBtn.addEventListener('click', this.clearDiet.bind(this));
        this.loadDietPlan();
    },

    applySuggestedDiet() {
        if (!confirm('Apply the suggested diet plan? This will overwrite any saved diet.')) return;
        storage.set('dietPlan', SuggestedDiet);
        this.loadDietPlan();
    },

    applyPakistaniDiet() {
        if (!confirm('Apply the Pakistani diet plan? This will overwrite any saved diet.')) return;
        storage.set('dietPlan', PakistaniDiet);
        this.loadDietPlan();
    },

    clearDiet() {
        if (!confirm('Clear saved diet plan?')) return;
        storage.set('dietPlan', {});
        this.loadDietPlan();
    },

    loadDietPlan() {
        const plan = storage.get('dietPlan') || {};
        const container = document.getElementById('diet-plan');
        if (!container) return;

        const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
        container.innerHTML = days.map(day => {
            const d = plan[day] || { breakfast: '—', lunch: '—', snack: '—', dinner: '—' };
            return `
                <div class="border rounded-lg p-4 bg-white">
                    <h3 class="font-semibold mb-2">${day}</h3>
                    <div class="text-sm text-gray-700"><strong>Breakfast:</strong> ${d.breakfast}</div>
                    <div class="text-sm text-gray-700"><strong>Lunch:</strong> ${d.lunch}</div>
                    <div class="text-sm text-gray-700"><strong>Snack:</strong> ${d.snack}</div>
                    <div class="text-sm text-gray-700"><strong>Dinner:</strong> ${d.dinner}</div>
                    <div class="text-sm text-gray-700"><strong>Before Bed:</strong> ${d.beforeBed || '—'}</div>
                </div>
            `;
        }).join('');

        // If the plan has notes (e.g., Pakistani context), render them below
        if (plan && plan._notes) {
            const notesEl = document.createElement('div');
            notesEl.className = 'mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-300 text-sm text-gray-700';
            notesEl.innerHTML = `<strong>Notes:</strong><pre class="whitespace-pre-wrap">${plan._notes}</pre>`;
            container.appendChild(notesEl);
        }
    }
};

// ============================================
// THEME (Light / Dark / System)
// ============================================

const Theme = {
    key: 'themeMode', // values: 'light' | 'dark' | 'system'
    modes: ['light', 'dark', 'system'],
    init() {
        this.button = document.getElementById('theme-toggle');
        this.mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
        const stored = localStorage.getItem(this.key) || 'system';
        this.current = stored;
        this.apply(stored, {skipSave: true});

        // Wire popover (if present) instead of cycling the theme when clicking the button
        this.popover = document.getElementById('theme-popover');
        if (this.button) {
            this.button.classList.add('theme-toggle');
            this.button.setAttribute('aria-haspopup', 'true');
            this.button.setAttribute('aria-expanded', 'false');
            this.button.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!this.popover) return this.cycle();
                const isHidden = this.popover.classList.contains('hidden');
                if (isHidden) this.showPopover(); else this.hidePopover();
            });
            this.button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (this.popover) this.showPopover(); else this.cycle(); }
                if (e.key === 'Escape') { if (this.popover) this.hidePopover(); }
            });
            this.updateButton();
        }

        // Attach option buttons inside popover
        if (this.popover) {
            this.popover.querySelectorAll('.theme-option').forEach(opt => {
                opt.addEventListener('click', (e) => {
                    const mode = opt.dataset.mode;
                    if (mode) this.apply(mode);
                    this.hidePopover();
                });
            });

            // Close popover when clicking outside
            document.addEventListener('click', (ev) => {
                if (!this.popover) return;
                const target = ev.target;
                if (target === this.button || this.popover.contains(target)) return;
                if (!this.popover.classList.contains('hidden')) this.hidePopover();
            });

            // Close on Escape
            document.addEventListener('keydown', (ev) => {
                if (ev.key === 'Escape') this.hidePopover();
            });
        }

        // Listen to system changes when in 'system' mode
        if (this.mq) {
            this.mqlHandler = () => { if (this.current === 'system') this.apply('system'); };
            if (this.mq.addEventListener) this.mq.addEventListener('change', this.mqlHandler);
            else if (this.mq.addListener) this.mq.addListener(this.mqlHandler);
        }
    },

    effectiveTheme(mode) {
        if (mode === 'system') {
            return (this.mq && this.mq.matches) ? 'dark' : 'light';
        }
        return mode;
    },

    apply(mode, opts = {}) {
        // Smooth transition overlay: capture current bg, show overlay, then switch theme and fade overlay
        const overlay = document.getElementById('theme-overlay');
        if (overlay) {
            try {
                // snapshot current computed background so overlay doesn't change when CSS vars update
                const doc = document.documentElement;
                const currentBg = getComputedStyle(doc).getPropertyValue('--bg') || '';
                overlay.style.background = currentBg;
                // Force reflow then show
                overlay.classList.add('active');
                overlay.getBoundingClientRect();
            } catch (e) {}
        }

        const theme = this.effectiveTheme(mode);
        if (theme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');

        document.documentElement.setAttribute('data-theme-mode', mode);
        this.current = mode;
        if (!opts.skipSave) localStorage.setItem(this.key, mode);
        this.updateButton();

        if (overlay) {
            // delay briefly so the overlay is visible, then fade it out
            window.setTimeout(() => {
                overlay.classList.remove('active');
                // remove inline background after transition
                window.setTimeout(() => { overlay.style.background = ''; }, 320);
            }, 50);
        }
    },

    cycle() {
        const idx = this.modes.indexOf(this.current);
        const next = this.modes[(idx + 1) % this.modes.length];
        this.apply(next);
    },

    updateButton() {
        if (!this.button) return;
        const mode = this.current;
        let icon = '⚙️';
        let label = 'System';
        if (mode === 'dark') { icon = '🌙'; label = 'Dark'; }
        else if (mode === 'light') { icon = '☀️'; label = 'Light'; }

        this.button.textContent = icon;
        this.button.title = `Theme: ${label}`;
        this.button.setAttribute('aria-checked', mode === 'dark' ? 'true' : 'false');
        this.button.setAttribute('aria-label', `Toggle theme (current: ${label})`);
    },

    showPopover() {
        if (!this.popover || !this.button) return;
        this.popover.classList.remove('hidden');
        this.popover.style.opacity = '1';
        this.button.setAttribute('aria-expanded', 'true');
        // focus first option for keyboard users
        const firstOpt = this.popover.querySelector('.theme-option');
        if (firstOpt) firstOpt.focus();
    },

    hidePopover() {
        if (!this.popover || !this.button) return;
        this.popover.classList.add('hidden');
        this.button.setAttribute('aria-expanded', 'false');
    },
};


// Suggested routine (from provided workout plan suggestion - fat-loss split)
const SuggestedRoutine = {
    Monday: [
        { name: 'Incline Dumbbell Press', sets: 4, reps: 10 },
        { name: 'Flat Barbell Bench Press', sets: 4, reps: 8 },
        { name: 'Cable Chest Flys', sets: 3, reps: 12 },
        { name: 'Tricep Dips', sets: 3, reps: 12 },
        { name: 'Overhead Tricep Extension', sets: 3, reps: 15 }
    ],
    Tuesday: [
        { name: 'Deadlifts', sets: 4, reps: 6 },
        { name: 'Lat Pulldown', sets: 4, reps: 10 },
        { name: 'Seated Row', sets: 3, reps: 12 },
        { name: 'Barbell Curl', sets: 3, reps: 10 },
        { name: 'Hammer Curl', sets: 3, reps: 12 }
    ],
    Wednesday: [
        { name: 'Barbell Squats', sets: 4, reps: 8 },
        { name: 'Romanian Deadlifts', sets: 3, reps: 10 },
        { name: 'Walking Lunges', sets: 3, reps: 20 },
        { name: 'Hip Thrusts', sets: 3, reps: 12 },
        { name: 'Leg Press', sets: 3, reps: 15 }
    ],
    Thursday: [
        { name: 'Overhead Dumbbell Press', sets: 4, reps: 10 },
        { name: 'Arnold Press', sets: 3, reps: 12 },
        { name: 'Lateral Raises', sets: 3, reps: 15 },
        { name: 'Rear Delt Flys', sets: 3, reps: 15 },
        { name: 'Cable Crunches', sets: 3, reps: 20 }
    ],
    Friday: [
        { name: 'Incline Barbell Press', sets: 4, reps: 8 },
        { name: 'Dumbbell Chest Flys', sets: 3, reps: 12 },
        { name: 'Pull-Ups', sets: 4, reps: 10 },
        { name: 'T-Bar Row', sets: 3, reps: 12 },
        { name: 'Dumbbell Pullover', sets: 3, reps: 15 }
    ],
    Saturday: [
        { name: 'Front Squats', sets: 4, reps: 8 },
        { name: 'Bulgarian Split Squats', sets: 3, reps: 10 },
        { name: 'Dumbbell Shoulder Press', sets: 3, reps: 12 },
        { name: 'Upright Row', sets: 3, reps: 15 },
        { name: 'Calf Raises', sets: 3, reps: 20 }
    ],
    Sunday: []
};

function applySuggestedRoutine() {
    if (!confirm('Apply the suggested weekly routine? This will overwrite any saved routine.')) return;
    storage.set('routines', SuggestedRoutine);
    loadRoutineGrid();
}

function clearRoutine() {
    if (!confirm('Clear saved routine? This will remove all exercises from the routine planner.')) return;
    storage.set('routines', {});
    loadRoutineGrid();
}

function loadRoutineGrid() {
    const container = document.getElementById('routine-grid');
    if (!container) return;
    const routines = storage.get('routines') || {};

    container.innerHTML = RoutinePlanner.days.map(day => {
        const dayExercises = routines[day] || [];
        return `
            <div class="border border-green-200 rounded-lg p-4">
                <h3 class="font-semibold text-green-800 mb-3">${day}</h3>
                <div class="space-y-2 mb-3" id="routine-${day}">
                    ${dayExercises.length === 0 ? 
                        '<p class="text-sm text-green-500">Rest day</p>' :
                        dayExercises.map(ex => `
                            <div class="bg-green-50 p-2 rounded text-sm">
                                <div class="font-medium">${ex.name}</div>
                                <div class="text-green-600">${ex.sets}×${ex.reps}</div>
                            </div>
                        `).join('')
                    }
                </div>
                <button onclick="addRoutineExercise('${day}')" 
                    class="w-full px-3 py-2 bg-red-200 text-red-700 rounded-md hover:bg-red-300 text-sm transition-colors">
                    + Add Exercise
                </button>
            </div>
        `;
    }).join('');
}

function addRoutineExercise(day) {
    const name = prompt('Exercise name:');
    if (!name) return;
    
    const sets = prompt('Number of sets:');
    if (!sets) return;
    
    const reps = prompt('Number of reps:');
    if (!reps) return;

    const routines = storage.get('routines') || {};
    if (!routines[day]) routines[day] = [];
    
    routines[day].push({
        name,
        sets: parseInt(sets),
        reps: parseInt(reps)
    });

    storage.set('routines', routines);
    loadRoutineGrid();
}

// ============================================
// TIMER MODULE
// ============================================

const Timer = {
    timeLeft: 0,
    totalTime: 0,
    interval: null,
    isPaused: false,

    init() {
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setTime(parseInt(btn.dataset.seconds));
            });
        });

        document.getElementById('custom-timer').addEventListener('change', (e) => {
            this.setTime(parseInt(e.target.value));
        });

        document.getElementById('timer-start').addEventListener('click', () => this.start());
        document.getElementById('timer-pause').addEventListener('click', () => this.pause());
        document.getElementById('timer-reset').addEventListener('click', () => this.reset());
    },

    setTime(seconds) {
        this.timeLeft = seconds;
        this.totalTime = seconds;
        this.updateDisplay();
    },

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        document.getElementById('timer-display').textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    },

    start() {
        if (this.timeLeft === 0) return;
        
        if (this.interval) clearInterval(this.interval);
        
        this.interval = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft === 0) {
                this.complete();
            }
        }, 1000);
    },

    pause() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    },

    reset() {
        this.pause();
        this.timeLeft = this.totalTime;
        this.updateDisplay();
    },

    complete() {
        this.pause();
        if (document.getElementById('sound-toggle').checked) {
            this.playSound();
        }
        alert('Rest time complete! 💪');
    },

    playSound() {
        // Create a simple beep using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
};

// ============================================
// MACRO CALCULATOR MODULE
// ============================================

const MacroCalculator = {
    init() {
        const form = document.getElementById('macro-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculate();
        });

        // Load saved data if exists
        const saved = storage.get('macroPreset');
        if (saved) {
            document.getElementById('macro-age').value = saved.age;
            document.getElementById('macro-weight').value = saved.weight;
            document.getElementById('macro-height').value = saved.height;
            document.getElementById('macro-gender').value = saved.gender;
            document.getElementById('macro-activity').value = saved.activity;
            document.getElementById('macro-goal').value = saved.goal;
        }
    },

    calculate() {
        const age = parseInt(document.getElementById('macro-age').value);
        const weight = parseFloat(document.getElementById('macro-weight').value);
        const height = parseInt(document.getElementById('macro-height').value);
        const gender = document.getElementById('macro-gender').value;
        const activity = parseFloat(document.getElementById('macro-activity').value);
        const goal = document.getElementById('macro-goal').value;

        // Save preset
        storage.set('macroPreset', { age, weight, height, gender, activity, goal });

        // Calculate BMR using Mifflin-St Jeor Equation
        let bmr;
        if (gender === 'male') {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }

        // Calculate TDEE
        let tdee = bmr * activity;

        // Adjust for goal
        let calories;
        if (goal === 'cut') {
            calories = tdee - 500; // 500 calorie deficit
        } else if (goal === 'bulk') {
            calories = tdee + 300; // 300 calorie surplus
        } else {
            calories = tdee;
        }

        // Calculate macros
        const protein = weight * 2.2; // 2.2g per kg
        const fats = weight * 0.9; // 0.9g per kg
        const proteinCals = protein * 4;
        const fatCals = fats * 9;
        const carbCals = calories - proteinCals - fatCals;
        const carbs = carbCals / 4;

        // Display results
        document.getElementById('result-calories').textContent = Math.round(calories);
        document.getElementById('result-protein').textContent = Math.round(protein);
        document.getElementById('result-carbs').textContent = Math.round(carbs);
        document.getElementById('result-fats').textContent = Math.round(fats);
        document.getElementById('macro-results').classList.remove('hidden');
    }
};

// ============================================
// MOOD & JOURNAL MODULE
// ============================================

const Journal = {
    init() {
        // Mood selector
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mood-btn').forEach(b => {
                    b.classList.remove('ring-4', 'ring-blue-500');
                });
                btn.classList.add('ring-4', 'ring-blue-500');
                document.getElementById('selected-mood').value = btn.dataset.mood;
            });
        });

        // Form submission
        const form = document.getElementById('journal-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveLog();
        });

        this.loadHistory();
    },

    saveLog() {
        const mood = document.getElementById('selected-mood').value;
        if (!mood) {
            alert('Please select a mood');
            return;
        }

        const log = {
            id: Date.now(),
            mood,
            notes: document.getElementById('journal-notes').value,
            date: new Date().toISOString()
        };

        storage.append('journals', log);
        
        // Reset form
        document.getElementById('journal-form').reset();
        document.querySelectorAll('.mood-btn').forEach(b => {
            b.classList.remove('ring-4', 'ring-blue-500');
        });

        this.loadHistory();
    },

    loadHistory() {
        const journals = storage.get('journals') || [];
        const container = document.getElementById('journal-history');

        if (journals.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center">No journal entries yet.</p>';
            return;
        }

        container.innerHTML = journals
            .reverse()
            .slice(0, 10) // Show last 10 entries
            .map(log => `
                <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex items-center gap-2">
                            <span class="text-2xl">${log.mood}</span>
                            <span class="text-sm text-gray-600">${formatDate(log.date)}</span>
                        </div>
                        <button onclick="Journal.deleteLog(${log.id})" 
                            class="text-red-500 hover:text-red-700 text-sm">Delete</button>
                    </div>
                    ${log.notes ? `<p class="text-gray-700 text-sm">${log.notes}</p>` : ''}
                </div>
            `).join('');
    },

    deleteLog(id) {
        let journals = storage.get('journals') || [];
        journals = journals.filter(j => j.id !== id);
        storage.set('journals', journals);
        this.loadHistory();
    }
};

// ============================================
// EXERCISE DEMONSTRATIONS MODULE
// ============================================

const ExerciseLibrary = {
    // Toggle this to `true` to test with a known remote animated GIF
    // without changing local files. Set to `false` to use the local `images/tricep-dips.gif`.
    TEST_USE_REMOTE_TRICEP_GIF: true,
    REMOTE_TRICEP_GIF_URL: 'https://media.giphy.com/media/LML5ldpTKLPelFtBvs/giphy.gif',
    exercises: [
        {
            name: 'Bench Press',
            muscle: 'chest',
            difficulty: 'Intermediate',
            description: 'Classic chest exercise for building upper body strength',
            media: 'images/barbell-bench-press.gif',
            mediaType: 'gif',
            instructions: ['Lie flat on bench', 'Grip bar slightly wider than shoulders', 'Lower bar to chest', 'Press up explosively']
        },
        {
            name: 'Squat',
            muscle: 'legs',
            difficulty: 'Intermediate',
            description: 'Compound exercise for building leg strength and mass',
            media: 'images/squat-tempo-4010.gif',
            mediaType: 'gif',
            instructions: ['Position bar on upper back', 'Feet shoulder-width apart', 'Lower by bending knees', 'Drive through heels to stand']
        },
        {
            name: 'Deadlift',
            muscle: 'back',
            difficulty: 'Advanced',
            description: 'Full-body compound movement for posterior chain',
            media: 'images/barbell-deadlift.gif',
            mediaType: 'gif',
            instructions: ['Stand with feet hip-width', 'Grip bar outside legs', 'Keep back straight', 'Lift by extending hips and knees']
        },
        {
            name: 'Overhead Press',
            muscle: 'shoulders',
            difficulty: 'Intermediate',
            description: 'Vertical pressing movement for shoulder development',
            media: 'images/overhead-press.gif',
            mediaType: 'gif',
            instructions: ['Start bar at shoulders', 'Press overhead', 'Lock out arms', 'Lower with control']
        },
        {
            name: 'Pull-ups',
            muscle: 'back',
            difficulty: 'Intermediate',
            description: 'Bodyweight exercise for back and biceps',
            media: 'images/pullups.gif',
            mediaType: 'gif',
            instructions: ['Hang from bar', 'Pull chest to bar', 'Control descent', 'Repeat']
        },
        {
            name: 'Bicep Curls',
            muscle: 'arms',
            difficulty: 'Beginner',
            description: 'Isolation exercise for bicep development',
            media: 'images/dumbbellbicepcurls.gif',
            mediaType: 'gif',
            instructions: ['Hold dumbbells at sides', 'Curl weight up', 'Squeeze at top', 'Lower slowly']
        },
        {
            name: 'Plank',
            muscle: 'core',
            difficulty: 'Beginner',
            description: 'Isometric core strengthening exercise',
            media: 'images/body-saw-plank.gif',
            mediaType: 'gif',
            instructions: ['Forearms on ground', 'Body in straight line', 'Hold position', 'Engage core']
        },
        {
            name: 'Dumbbell Rows',
            muscle: 'back',
            difficulty: 'Beginner',
            description: 'Unilateral back exercise for muscle balance',
            media: 'images/dumbell-rows.gif',
            mediaType: 'gif',
            instructions: ['Support on bench', 'Pull dumbbell to hip', 'Squeeze shoulder blade', 'Lower with control']
        },
        {
            name: 'Lunges',
            muscle: 'legs',
            difficulty: 'Beginner',
            description: 'Unilateral leg exercise for balance and strength',
            media: 'images/bodyweight-lunges.gif',
            mediaType: 'gif',
            instructions: ['Step forward', 'Lower back knee', 'Push back to start', 'Alternate legs']
        },
        {
            name: 'Lateral Raises',
            muscle: 'shoulders',
            difficulty: 'Beginner',
            description: 'Isolation for shoulder width (lateral deltoids)',
            media: 'images/DB_LAT_RAISE.gif', // Local project GIF: place the provided GIF at `images/db_lateral_raise.gif`
            mediaType: 'gif',
            instructions: ['Hold dumbbells at sides', 'Raise arms to sides', 'Stop at shoulder height', 'Lower slowly']
        },
        {
            name: 'Push-ups',
            muscle: 'chest',
            difficulty: 'Beginner',
            description: 'Bodyweight chest, shoulder, and tricep builder',
            media: 'images/anim-push-ups.gif',// Local project GIF: place the provided GIF at `images/animated-pushup.gif`
            mediaType: 'gif',
            instructions: ['Hands shoulder-width', 'Lower chest to ground', 'Keep body straight', 'Push back up']
        },
        {
            name: 'Tricep Dips',
            muscle: 'arms',
            difficulty: 'Intermediate',
            description: 'Bodyweight tricep and chest exercise',
            // Local project GIF: place the provided GIF at `images/tricep-dips.gif`
            media: 'images/Chest-Dips.gif',
            mediaType: 'gif',
            instructions: ['Support on parallel bars', 'Lower body down', 'Elbows at 90 degrees', 'Push back up']
        }
    ],

    filteredExercises: [],

    init() {
        this.filteredExercises = [...this.exercises];
        this.renderExercises();

        // Search functionality (only if element exists)
        const searchEl = document.getElementById('exercise-search');
        if (searchEl) searchEl.addEventListener('input', (e) => { this.filterExercises(); });

        // Muscle filter (only if element exists)
        const muscleEl = document.getElementById('muscle-filter');
        if (muscleEl) muscleEl.addEventListener('change', () => { this.filterExercises(); });
        // Hook apply/clear buttons in Routine Planner (if present in DOM)
        const applyBtn = document.getElementById('apply-suggested-routine');
        if (applyBtn) applyBtn.addEventListener('click', applySuggestedRoutine);
        const clearBtn = document.getElementById('clear-routine');
        if (clearBtn) clearBtn.addEventListener('click', clearRoutine);
    },

    filterExercises() {
        const searchTerm = document.getElementById('exercise-search').value.toLowerCase();
        const muscleFilter = document.getElementById('muscle-filter').value;

        this.filteredExercises = this.exercises.filter(exercise => {
            const matchesSearch = exercise.name.toLowerCase().includes(searchTerm) ||
                                exercise.description.toLowerCase().includes(searchTerm);
            const matchesMuscle = !muscleFilter || exercise.muscle === muscleFilter;
            
            return matchesSearch && matchesMuscle;
        });

        this.renderExercises();
    },

    renderExercises() {
        const container = document.getElementById('exercise-library');
        if (!container) return;

        if (this.filteredExercises.length === 0) {
            container.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8">No exercises found. Try different filters.</div>';
            return;
        }

        container.innerHTML = this.filteredExercises.map(exercise => `
            <div class="exercise-card bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div class="aspect-video bg-gray-200 flex items-center justify-center overflow-hidden">
                    ${exercise.mediaType === 'gif' ? 
                        `<img src="${exercise.media}" alt="${exercise.name}" class="w-full h-full object-cover" onerror="this.src='https://via.placeholder.com/400x300?text=${encodeURIComponent(exercise.name)}'">` :
                        `<div class="text-gray-400 text-center p-4"><svg class="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><p class="text-sm">Demo video</p></div>`
                    }
                </div>
                <div class="p-4">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-semibold text-gray-800 text-lg">${exercise.name}</h3>
                        <span class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">${exercise.difficulty}</span>
                    </div>
                    <p class="text-sm text-gray-600 mb-2">${exercise.description}</p>
                    <div class="flex gap-2 items-center mb-3">
                        <span class="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 capitalize">💪 ${exercise.muscle}</span>
                    </div>
                    <details class="text-sm">
                        <summary class="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">View Instructions</summary>
                        <ol class="mt-2 space-y-1 text-gray-600 list-decimal list-inside">
                            ${exercise.instructions.map(step => `<li>${step}</li>`).join('')}
                        </ol>
                    </details>
                </div>
            </div>
        `).join('');

        // Animate exercise cards and images using GSAP (if available)
        if (window.gsap) {
            try {
                const items = Array.from(container.children);
                if (items.length) {
                    gsap.from(items, {duration: 0.5, y: 18, autoAlpha: 0, stagger: 0.06, ease: 'power2.out'});
                }

                const imgs = container.querySelectorAll('img');
                if (imgs.length) {
                    gsap.from(imgs, {duration: 0.6, scale: 0.96, autoAlpha: 0, stagger: 0.03, ease: 'power2.out'});
                }
                // Add GSAP hover animation handlers for a nicer micro-interaction
                const cards = container.querySelectorAll('.exercise-card');
                cards.forEach(card => {
                    card.addEventListener('pointerenter', () => {
                        try { gsap.to(card, {scale: 1.03, duration: 0.26, ease: 'power2.out'}); } catch (e) {}
                    });
                    card.addEventListener('pointerleave', () => {
                        try { gsap.to(card, {scale: 1, duration: 0.26, ease: 'power2.out'}); } catch (e) {}
                    });
                });
            } catch (e) {
                // ignore if GSAP fails
            }
        }
    }
};

// ============================================
// PROGRESS CHARTS MODULE
// ============================================

let weightChart = null;
let bodyWeightChart = null;

function initProgressCharts() {
    // Ensure chart elements exist
    const weightCanvas = document.getElementById('weight-chart');
    const bodyCanvas = document.getElementById('body-weight-chart');
    if (!weightCanvas && !bodyCanvas) return;

    const workouts = storage.get('workouts') || [];
    const macroData = storage.get('macroPreset');

    // Weight lifted chart
    if (weightCanvas) {
        const weightData = processWeightData(workouts);
        renderWeightChart(weightData);
    }

    // Body weight chart
    if (bodyCanvas) {
        const bodyWeightData = processBodyWeightData(macroData);
        renderBodyWeightChart(bodyWeightData);
    }
}

function processWeightData(workouts) {
    // Group by exercise and date
    const grouped = {};
    
    workouts.forEach(workout => {
        if (!grouped[workout.name]) {
            grouped[workout.name] = [];
        }
        grouped[workout.name].push({
            date: new Date(workout.date).toLocaleDateString(),
            weight: workout.weight * workout.sets * workout.reps // Total volume
        });
    });

    return grouped;
}

function processBodyWeightData(macroData) {
    // Simulate body weight tracking (in real app, this would be from user input)
    if (!macroData) return [];
    
    const today = new Date();
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i * 7);
        data.push({
            date: date.toLocaleDateString(),
            weight: macroData.weight + (Math.random() - 0.5) * 2 // Simulate variation
        });
    }
    
    return data;
}

function renderWeightChart(data) {
    const ctx = document.getElementById('weight-chart').getContext('2d');
    
    if (weightChart) {
        weightChart.destroy();
    }

    const datasets = Object.entries(data).slice(0, 3).map(([exercise, points], index) => {
        const colors = ['#3B82F6', '#EF4444', '#10B981'];
        return {
            label: exercise,
            data: points.map(p => p.weight),
            borderColor: colors[index],
            backgroundColor: colors[index] + '20',
            tension: 0.4
        };
    });

    const labels = data[Object.keys(data)[0]]?.map(p => p.date) || ['No data'];

    weightChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Total Volume (kg)'
                    }
                }
            }
        }
    });
}

function renderBodyWeightChart(data) {
    const ctx = document.getElementById('body-weight-chart').getContext('2d');
    
    if (bodyWeightChart) {
        bodyWeightChart.destroy();
    }

    if (data.length === 0) {
        bodyWeightChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['No data'],
                datasets: [{
                    label: 'Body Weight',
                    data: []
                }]
            }
        });
        return;
    }

    bodyWeightChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.date),
            datasets: [{
                label: 'Body Weight (kg)',
                data: data.map(d => d.weight),
                borderColor: '#8B5CF6',
                backgroundColor: '#8B5CF620',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Weight (kg)'
                    }
                }
            }
        }
    });
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    Theme.init();
    initTabs();
    WorkoutTracker.init();
    RoutinePlanner.init();
    DietPlanner.init();
    Timer.init();
    MacroCalculator.init();
    Journal.init();
    ExerciseLibrary.init();
    // GIF preview animation if present
    const gifPreview = document.getElementById('gif-preview');
    if (gifPreview) {
        gifPreview.addEventListener('load', () => {
            if (window.gsap) {
                try {
                    gsap.fromTo(gifPreview, {scale: 0.96, autoAlpha: 0}, {duration: 0.6, scale: 1, autoAlpha: 1, ease: 'elastic.out(1, 0.6)'});
                } catch (e) {}
            }
        });
    }
});
