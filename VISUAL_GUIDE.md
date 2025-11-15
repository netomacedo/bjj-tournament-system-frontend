# BJJ Tournament Frontend - Visual Guide

## Application Screenshots & Features

### 1. Dashboard (Home Page)
**Route:** `/`

**What you'll see:**
- Large welcome header: "🥋 BJJ Tournament Management Dashboard"
- Four statistic cards showing:
  - Total Athletes (with 👥 icon)
  - Total Tournaments (with 🏆 icon)
  - Upcoming Tournaments (with 📅 icon)
  - Active Tournaments (with ⚡ icon)
- Quick Actions section with buttons:
  - "+ Register Athlete"
  - "+ Create Tournament"
  - "View Matches"
  - "View Brackets"
- Upcoming Tournaments list (if any exist)

**Colors:** White cards on light gray background, blue accent colors

---

### 2. Athletes List Page
**Route:** `/athletes`

**What you'll see:**
- Page title "Athletes" with "+ Register New Athlete" button
- Search bar to search athletes by name
- Dropdown filter to filter by belt rank
- Grid of athlete cards, each showing:
  - Colored bar at top indicating belt rank
  - Athlete name
  - Belt rank (e.g., "Blue", "Purple")
  - Age (calculated from date of birth)
  - Weight in kg
  - Gender
  - Team/Academy name
  - Three action buttons: View, Edit, Delete

**Features:**
- Real-time search
- Filter by belt rank (White through Black and beyond)
- Responsive grid layout
- Hover effects on cards

---

### 3. Register/Edit Athlete Page
**Route:** `/athletes/register` or `/athletes/edit/:id`

**What you'll see:**
- Form with four sections:

  **Section 1: Personal Information**
  - Full Name (text input)
  - Date of Birth (date picker) - shows calculated age
  - Gender (dropdown: Male/Female)

  **Section 2: Competition Information**
  - Belt Rank (dropdown with all IBJJF belt ranks)
  - Weight in kg (number input)

  **Section 3: Team & Coach**
  - Team/Academy name (text input)
  - Coach name (text input)

  **Section 4: Contact Information**
  - Email (email input with validation)
  - Phone Number (tel input)

- Bottom buttons: Cancel and "Register Athlete" (or "Update Athlete" in edit mode)

**Form Validation:**
- Required fields marked with *
- Email format validation
- Number validation for weight
- Date validation

---

### 4. Tournaments List Page
**Route:** `/tournaments`

**What you'll see:**
- Page title "Tournaments" with "+ Create New Tournament" button
- Three filter tabs:
  - All Tournaments
  - Upcoming
  - Completed
- Grid of tournament cards, each showing:
  - Colored status bar at top (different color per status)
  - Tournament name
  - Description
  - Date (📅 icon)
  - Location (📍 icon)
  - Organizer name (👤 icon)
  - Registration deadline (📝 icon)
  - Action buttons based on status:
    - "View Details" (always shown)
    - "Close Registration" (if registration open)
    - "Start Tournament" (if registration closed)

**Status Colors:**
- Draft: Gray
- Registration Open: Green
- Registration Closed: Orange
- In Progress: Blue
- Completed: Purple

---

### 5. Create/Edit Tournament Page
**Route:** `/tournaments/create` or `/tournaments/edit/:id`

**What you'll see:**
- Form with three sections:

  **Section 1: Tournament Information**
  - Tournament Name (text input)
  - Description (textarea)
  - Location (text input)

  **Section 2: Schedule**
  - Tournament Date (date picker)
  - Registration Deadline (date picker)

  **Section 3: Organizer Information**
  - Organizer Name (text input)
  - Contact Email (email input)

- Bottom buttons: Cancel and "Create Tournament" (or "Update Tournament")

---

### 6. Tournament Details Page
**Route:** `/tournaments/:id`

**What you'll see:**
- Tournament name as header
- Two action buttons: Edit and Back
- Three information sections displaying:
  - Tournament Information (description, location, status)
  - Schedule (tournament date, registration deadline)
  - Organizer (name, email)

---

### 7. Match Scoring Page
**Route:** `/matches/:id/score`

**What you'll see:**
- "Match Scorer" header with Back button
- Two-column layout:

  **Left Column - Athlete 1:**
  - Large score display (in blue)
  - Advantages count
  - Six action buttons:
    - Takedown (+2)
    - Sweep (+2)
    - Guard Pass (+3)
    - Mount (+4)
    - Back Control (+4)
    - Advantage (+1)

  **Right Column - Athlete 2:**
  - Same layout as Athlete 1

  **Center:** "VS" separator

- "Save Score" button at bottom (green)

**Interaction:**
- Click buttons to add points in real-time
- Scores update immediately
- Save button persists changes to backend

---

### 8. Navigation Header (All Pages)

**What you'll see:**
- Dark blue gradient background
- Logo: "🥋 BJJ Tournament System"
- Navigation menu with links:
  - Dashboard
  - Athletes
  - Tournaments
  - Matches
  - Brackets
- Active page highlighted with lighter background

**Responsive:**
- On mobile: menu items wrap to multiple lines
- Sticky header stays at top when scrolling

---

## Design System

### Color Palette
- **Primary Blue:** #4169e1 (used for primary actions, active states)
- **Dark Background:** #1a1a2e (used for header)
- **Light Gray:** #f5f5f5 (page background)
- **White:** #ffffff (cards, forms)
- **Success Green:** #28a745
- **Danger Red:** #dc3545
- **Warning Yellow:** #ffc107
- **Secondary Gray:** #6c757d

### Typography
- **Headers:** Bold, 2rem - 2.5rem
- **Subheaders:** Bold, 1.3rem - 1.5rem
- **Body Text:** Regular, 1rem
- **Small Text:** 0.85rem - 0.95rem

### Spacing
- Card padding: 1.5rem - 2rem
- Grid gaps: 1.5rem - 2rem
- Form spacing: 1rem - 1.5rem

### Buttons
- **Primary:** Blue background, white text, hover lift effect
- **Secondary:** Gray background, white text
- **Danger:** Red background, white text
- **Success:** Green background, white text
- **All buttons:** Rounded corners (5px), smooth transitions

### Cards
- White background
- Rounded corners (10px)
- Subtle shadow (0 2px 10px rgba(0,0,0,0.1))
- Hover effect: lift up 5px, enhanced shadow

### Forms
- Clean, organized sections
- Section headers with bottom borders
- Inline labels
- Input fields with border focus effect (blue border on focus)
- Helper text in gray
- Error messages in red background

---

## Responsive Breakpoints

- **Desktop:** 1200px+ (full grid layouts)
- **Tablet:** 768px - 1199px (adjusted grid columns)
- **Mobile:** < 768px (single column, stacked layouts)

---

## User Flow Examples

### Registering a New Athlete
1. Click "Dashboard" → "+ Register Athlete"
2. Fill in all required fields (marked with *)
3. See age calculate automatically from date of birth
4. Select belt rank from dropdown
5. Enter weight, team, coach info
6. Add contact email and phone
7. Click "Register Athlete"
8. Redirected to Athletes list with new athlete visible

### Creating a Tournament
1. Navigate to "Tournaments" page
2. Click "+ Create New Tournament"
3. Enter tournament name, description, location
4. Select dates for tournament and registration deadline
5. Add organizer information
6. Click "Create Tournament"
7. Redirected to tournaments list
8. New tournament appears with "Draft" or "Registration Open" status

### Scoring a Match
1. Navigate to match from tournament or matches page
2. Click on "Score Match"
3. See two athletes side by side
4. Click point buttons for respective athlete (e.g., "Mount (+4)")
5. See score update in real-time
6. Add advantages if needed
7. Click "Save Score" to persist changes
8. System saves to backend via API

---

## Mobile Experience

All pages are fully responsive:
- Header menu items stack vertically
- Athlete/tournament cards display in single column
- Forms maintain full width
- Action buttons stack vertically
- Match scorer displays athletes vertically (one above the other)
- Touch-friendly button sizes (minimum 44x44px)

---

This visual guide describes the complete user interface of your BJJ Tournament Frontend application. The actual rendered application will display all these features with the described styling and interactions.
