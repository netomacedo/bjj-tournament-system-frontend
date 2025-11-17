# BJJ Tournament Management System - Frontend

A comprehensive React-based frontend application for managing Brazilian Jiu-Jitsu tournaments, featuring athlete management, division organization, bracket generation, and real-time match scoring.

![React](https://img.shields.io/badge/React-19.2.0-blue)
![React Router](https://img.shields.io/badge/React_Router-7.9.5-red)
![Tests](https://img.shields.io/badge/Tests-Passing-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Table of Contents

- [Features](#features)
- [System Flow](#system-flow)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [API Integration](#api-integration)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Features

### Athlete Management
- Register new athletes with complete profile information
- Search and filter athletes by belt rank, age, gender, and team
- Edit athlete profiles
- View athlete competition history
- Belt rank progression tracking (19 IBJJF belt ranks)

### Tournament Management
- Create tournaments with IBJJF-compliant settings
- Manage tournament status (Registration Open, In Progress, Completed)
- View upcoming and active tournaments
- Tournament details with comprehensive statistics

### Division System
- Create divisions based on:
  - **Belt Rank**: 19 IBJJF belt ranks (White-Grey to Red)
  - **Age Category**: 14 categories (Mighty Mite to Master 7)
  - **Gender**: Male, Female, Not Applicable (kids under 10)
  - **Weight Class**: Gender-specific weight divisions
- Automatic division name generation
- Division validation (no duplicates, eligibility checking)

### Athlete Enrollment
- Two-panel enrollment interface
- Real-time search and filtering
- Automatic eligibility validation
- Visual athlete details (belt, weight, age, team)

### Match Generation
- **Automatic**: Random shuffle bracket generation
- **Manual**: Custom match pairings by coaches
- Support for three bracket types:
  - Single Elimination
  - Double Elimination
  - Round Robin
- Duplicate prevention and validation

### Dashboard
- Tournament statistics overview
- Athlete count tracking
- Quick actions for common tasks
- Upcoming tournaments display

### Match Scoring
- Real-time IBJJF-compliant scoring
- Points, advantages, and penalties tracking
- Match timer integration
- Winner determination

## System Flow

The BJJ Tournament Management System follows a hierarchical workflow designed to match real-world tournament operations:

### 1. Athlete Registration
**Entry Point**: Dashboard → Athletes → Register Athlete

- **Who**: Tournament organizers, coaches, or gym owners
- **What**: Register athletes with complete profiles
- **Data Collected**: Personal info (name, DOB, gender), BJJ credentials (belt, team), physical attributes (weight), contact information
- **Navigation**: Header → AthleteList → AthleteForm

### 2. Tournament Creation
**Entry Point**: Dashboard → Tournaments → Create Tournament

- **Who**: Tournament directors
- **What**: Set up a new tournament event
- **Configuration**: Tournament name, date, location, registration deadline, status
- **Navigation**: Dashboard → TournamentList → TournamentForm

### 3. Division Setup
**Entry Point**: Tournaments → Select Tournament → Manage Divisions

- **Who**: Tournament organizers
- **What**: Create competitive divisions
- **Division Criteria**:
  - Belt Rank (White-Grey to Red - 19 IBJJF ranks)
  - Age Category (Mighty Mite to Master 7 - 14 categories)
  - Gender (Male/Female/Not Applicable)
  - Weight Class (Gender-specific IBJJF divisions)
  - Bracket Type (Single/Double Elimination, Round Robin)
- **Smart Features**: Auto name generation, duplicate prevention, validation
- **Navigation**: TournamentDetail → DivisionManager → DivisionForm

### 4. Athlete Enrollment
**Entry Point**: Division Manager → Select Division → Enroll Athletes

- **Who**: Tournament organizers
- **What**: Add athletes to their appropriate divisions
- **Interface**: Two-panel design (Enrolled | Available)
- **Features**: Real-time search, pagination (5/page), visual athlete cards, eligibility validation, confirmation modals
- **Navigation**: DivisionManager → AthleteEnrollment

### 5. Match Generation
**Entry Point**: Division Manager → Select Division → Generate Matches

- **Who**: Tournament organizers
- **Options**:
  - **Automatic**: System randomly shuffles and pairs athletes
  - **Manual**: Coach manually selects athlete pairings
- **Validation**: Minimum 2 athletes, duplicate prevention
- **Navigation**: DivisionManager → Auto Generate OR MatchGenerator

### 6. Bracket View
**Entry Point**: Division Manager → Select Division → View Bracket

- **Who**: Tournament staff, coaches, spectators
- **Features**: Round organization (R1, Quarters, Semis, Final), status indicators (Pending/In Progress/Completed), score display, winner highlighting, mat assignments
- **Navigation**: DivisionManager → BracketView

### 7. Match Execution
**Entry Point**: Bracket View → Select Match OR Division Manager → View Matches

- **Workflow**:
  1. **Pending** → "Start Match" → API: `POST /api/matches/{id}/start` → Status: In Progress
  2. **In Progress** → "Score Match" → MatchScorer (real-time IBJJF scoring) → API: `PUT /api/matches/{id}` → "Complete" → API: `POST /api/matches/{id}/complete`
  3. **Completed** → "View Details" → Display scores, winner, submission type
- **Navigation**: BracketView/MatchList → MatchScorer

### 8. Tournament Progression
- Completed matches automatically update brackets
- Winners advance to next round
- Dashboard statistics update in real-time

### Data Flow Diagram

```
Dashboard (Entry)
    ├── Athletes → Register → AthleteList
    └── Tournaments → Create → TournamentList
            └── Select Tournament → DivisionManager
                    ├── Create Division → DivisionForm
                    ├── Enroll Athletes → AthleteEnrollment
                    ├── Generate Matches → Auto/Manual
                    ├── View Bracket → BracketView → MatchList
                    └── Matches → MatchList → MatchScorer
```

### Navigation Structure

**Top Navigation** (Header):
- Dashboard
- Athletes
- Tournaments

**Note**: "Matches" and "Brackets" are NOT in top navigation - they require tournament/division context and are only accessible through the division manager.

**Quick Actions** (Dashboard):
- + Register Athlete
- + Create Tournament

## Tech Stack

### Frontend
- **React 19.2.0** - Latest React with concurrent features
- **React Router DOM 7.9.5** - Client-side routing
- **Axios 1.13.2** - HTTP client for API communication
- **CSS3** - Modern, responsive styling

### Development & Testing
- **Jest** - Unit testing framework
- **React Testing Library** - Component testing
- **MSW (Mock Service Worker)** - API mocking
- **Create React App** - Build tooling

### Backend Integration
- **Spring Boot REST API** - Java backend
- **RESTful endpoints** - Standard HTTP methods
- **CORS enabled** - Cross-origin requests

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 16.x or higher ([Download](https://nodejs.org/))
- **npm** 8.x or higher (comes with Node.js)
- **Backend API** running on port 8080 (or configured port)
- **Git** (for version control)

### Backend Repository
The backend API is required for full functionality:
```bash
git clone https://github.com/netomacedo/bjj-tournament-system.git
```

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd bjj-tournament-frontend
```

### 2. Install Dependencies
```bash
npm install
```

This will install all required packages:
- React and React DOM
- React Router DOM
- Axios
- Testing libraries
- Development dependencies

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:8080/api

# Optional: Other configurations
REACT_APP_ENV=development
```

## Running the Application

### Development Mode

Start the development server with hot reload:

```bash
npm start
```

The application will automatically open at **http://localhost:3000**

Features in development mode:
- Hot module replacement (HMR)
- Source maps for debugging
- Detailed error messages
- React DevTools integration

### Production Build

Create an optimized production build:

```bash
npm run build
```

This creates a `build/` folder with:
- Minified JavaScript bundles
- Optimized CSS
- Asset optimization
- Code splitting
- Service worker (optional)

### Serve Production Build Locally

Test the production build:

```bash
npm install -g serve
serve -s build -p 3000
```

## Testing

### Run All Tests

```bash
npm test
```

Interactive test runner with watch mode.

### Run Tests Once (CI Mode)

```bash
npm run test:ci
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

Generates coverage report in `coverage/` folder.

### Test Structure

The project has **121 comprehensive unit tests**:

#### Service Tests (22 tests)
- **divisionService.test.js** - CRUD operations, enrollment, match generation

#### Component Tests (99 tests)
- **DivisionManager.test.js** (28 tests) - Division display and management
- **DivisionForm.test.js** (23 tests) - Division creation and validation
- **AthleteEnrollment.test.js** (24 tests) - Athlete enrollment workflow
- **MatchGenerator.test.js** (24 tests) - Match generation (auto/manual)

#### Existing Tests
- **Dashboard.test.js** - Dashboard statistics and navigation
- **AthleteList.test.js** - Athlete listing and filtering
- **AthleteForm.test.js** - Athlete registration
- **TournamentList.test.js** - Tournament display

### Coverage Thresholds

```json
{
  "branches": 70,
  "functions": 80,
  "lines": 80,
  "statements": 80
}
```

### Run Specific Tests

```bash
# Test a specific file
npm test -- --testPathPattern="divisionService"

# Test by name pattern
npm test -- -t "should enroll athlete"

# Update snapshots
npm test -- -u
```

## Project Structure

```
bjj-tournament-frontend/
├── public/                    # Static assets
│   ├── index.html            # HTML template
│   └── favicon.ico           # App icon
│
├── src/
│   ├── components/           # React components
│   │   ├── Athletes/
│   │   │   ├── AthleteList.js
│   │   │   ├── AthleteList.css
│   │   │   ├── AthleteForm.js
│   │   │   └── AthleteForm.css
│   │   ├── Divisions/
│   │   │   ├── DivisionManager.js      # Division display
│   │   │   ├── DivisionForm.js         # Create divisions
│   │   │   ├── AthleteEnrollment.js    # Enroll athletes
│   │   │   ├── MatchGenerator.js       # Generate matches
│   │   │   └── [CSS files]
│   │   ├── Tournaments/
│   │   │   ├── TournamentList.js
│   │   │   ├── TournamentForm.js
│   │   │   ├── TournamentDetail.js
│   │   │   └── [CSS files]
│   │   ├── Matches/
│   │   │   ├── MatchList.js
│   │   │   └── MatchScorer.js
│   │   ├── Brackets/
│   │   │   └── BracketView.js
│   │   └── Header/
│   │       ├── Header.js
│   │       └── Header.css
│   │
│   ├── services/             # API service layer
│   │   ├── api.js           # Axios instance & interceptors
│   │   ├── athleteService.js
│   │   ├── tournamentService.js
│   │   ├── divisionService.js
│   │   └── matchService.js
│   │
│   ├── constants/            # Application constants
│   │   └── index.js         # Belt ranks, age categories, weight classes
│   │
│   ├── pages/               # Page components
│   │   └── Dashboard.js
│   │
│   ├── __tests__/           # Test files
│   │   ├── components/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── __mocks__/           # Test mocks
│   │   ├── axios.js
│   │   ├── server.js
│   │   └── handlers.js
│   │
│   ├── App.js               # Main app component
│   ├── App.css              # Global styles
│   ├── index.js             # Entry point
│   ├── setupTests.js        # Test configuration
│   └── reportWebVitals.js   # Performance monitoring
│
├── .env                      # Environment variables (not in git)
├── .env.example              # Environment template
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies & scripts
├── README.md                # This file
└── TEST_SUMMARY.md          # Test documentation
```

## API Integration

### Backend Requirements

The frontend requires the **BJJ Tournament System** backend:

**Repository**: https://github.com/netomacedo/bjj-tournament-system

**Default URL**: http://localhost:8080/api

### API Endpoints

#### Athletes
```
GET    /api/athletes                    # List all athletes
GET    /api/athletes/{id}               # Get athlete by ID
POST   /api/athletes                    # Register new athlete
PUT    /api/athletes/{id}               # Update athlete
DELETE /api/athletes/{id}               # Delete athlete
GET    /api/athletes/search?name=...    # Search athletes
GET    /api/athletes/belt/{beltRank}    # Filter by belt
GET    /api/athletes/age?min=...&max=...# Filter by age
```

#### Tournaments
```
GET    /api/tournaments                 # List all tournaments
GET    /api/tournaments/{id}            # Get tournament details
POST   /api/tournaments                 # Create tournament
PUT    /api/tournaments/{id}            # Update tournament
DELETE /api/tournaments/{id}            # Delete tournament
GET    /api/tournaments/upcoming        # Get upcoming tournaments
POST   /api/tournaments/{id}/start      # Start tournament
POST   /api/tournaments/{id}/close-registration
```

#### Divisions
```
GET    /api/divisions/{id}                              # Get division
GET    /api/tournaments/{tournamentId}/divisions        # List divisions
POST   /api/tournaments/{tournamentId}/divisions        # Create division
PUT    /api/divisions/{id}                              # Update division
DELETE /api/divisions/{id}                              # Delete division
POST   /api/divisions/{divisionId}/athletes/{athleteId} # Enroll athlete
DELETE /api/divisions/{divisionId}/athletes/{athleteId} # Remove athlete
GET    /api/divisions/{divisionId}/athletes             # List enrolled
POST   /api/tournaments/divisions/{id}/generate-matches # Auto generate
POST   /api/tournaments/divisions/{id}/generate-matches-manual # Manual
```

#### Matches
```
GET    /api/matches/{id}                # Get match details
PUT    /api/matches/{id}                # Update match score
POST   /api/matches/{id}/start          # Start match
POST   /api/matches/{id}/finish         # Finish match
```

### CORS Configuration

Your backend must allow CORS from `http://localhost:3000`:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "https://yourdomain.com")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

## Development Workflow

### Full Stack Development

**Terminal 1 - Backend:**
```bash
cd bjj-tournament-system
./mvnw spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd bjj-tournament-frontend
npm start
```

### Code Quality

**Linting:**
```bash
npm run lint
```

**Format Code:**
```bash
npm run format
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add your feature description"

# Push to remote
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

### Commit Convention

Use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Build process or auxiliary tool changes

## Deployment

### Netlify

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   ```bash
   npx netlify-cli deploy --prod
   ```

3. **Environment variables:**
   Set `REACT_APP_API_URL` in Netlify dashboard

### Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Configure environment:**
   ```bash
   vercel env add REACT_APP_API_URL
   ```

### Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Build and run:**
```bash
docker build -t bjj-tournament-frontend .
docker run -p 3000:80 bjj-tournament-frontend
```

### Environment-Specific Builds

**Development:**
```bash
REACT_APP_ENV=development npm start
```

**Staging:**
```bash
REACT_APP_API_URL=https://staging-api.example.com npm run build
```

**Production:**
```bash
REACT_APP_API_URL=https://api.example.com npm run build
```

## Troubleshooting

### Common Issues

#### 1. CORS Errors

**Problem**: Browser console shows CORS policy errors

**Solution**:
- Ensure backend CORS configuration allows `http://localhost:3000`
- Check backend is running on correct port
- Verify `REACT_APP_API_URL` in `.env`

#### 2. API Connection Failed

**Problem**: "Network Error" or "Failed to fetch"

**Solution**:
- Verify backend is running: `curl http://localhost:8080/api/athletes`
- Check `.env` file has correct `REACT_APP_API_URL`
- Restart frontend after changing `.env`: `npm start`

#### 3. Blank Page After Build

**Problem**: Production build shows blank page

**Solution**:
- Check browser console for errors
- Verify `homepage` in `package.json` matches deployment path
- Ensure all environment variables are set in hosting service

#### 4. Tests Failing

**Problem**: Tests fail with module errors

**Solution**:
- Clear Jest cache: `npm test -- --clearCache`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 16+)

#### 5. Slow Performance

**Problem**: App is slow or laggy

**Solution**:
- Use production build: `npm run build`
- Check React DevTools Profiler
- Verify backend response times
- Consider implementing pagination for large lists

### Debug Mode

Enable detailed logging:

```javascript
// src/services/api.js
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config);
    return config;
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response);
    return response;
  }
);
```

### Getting Help

- **Issues**: Check existing [GitHub Issues](../../issues)
- **Discussions**: Join [GitHub Discussions](../../discussions)
- **Backend Issues**: Report to [BJJ Tournament System](https://github.com/netomacedo/bjj-tournament-system/issues)

## Performance Optimization

### Production Optimizations

The production build includes:
- Code minification and uglification
- Tree shaking (removes unused code)
- Asset optimization (images, CSS)
- Code splitting (lazy loading)
- Gzip compression

### Best Practices

1. **Lazy Loading**: Components are loaded on demand
2. **Memoization**: Expensive calculations are cached
3. **Virtual Scrolling**: For large athlete/match lists (future)
4. **Image Optimization**: Compress images before upload
5. **Bundle Analysis**: `npm run build -- --stats`

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- Use functional components with hooks
- Follow ESLint configuration
- Write unit tests for new features
- Update documentation

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **IBJJF** - International Brazilian Jiu-Jitsu Federation for tournament rules
- **React Team** - For the amazing framework
- **Contributors** - Everyone who has contributed to this project

## Contact

For questions or support:
- **Email**: your-email@example.com
- **GitHub**: [@netomacedo](https://github.com/netomacedo)
- **Project**: [BJJ Tournament System](https://github.com/netomacedo/bjj-tournament-system)

---

**Built with ❤️ for the BJJ community**