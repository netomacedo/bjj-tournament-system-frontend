import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header/Header';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import AthleteList from './components/Athletes/AthleteList';
import AthleteForm from './components/Athletes/AthleteForm';
import TournamentList from './components/Tournaments/TournamentList';
import TournamentForm from './components/Tournaments/TournamentForm';
import TournamentDetail from './components/Tournaments/TournamentDetail';
import MatchList from './components/Matches/MatchList';
import MatchScorer from './components/Matches/MatchScorer';
import BracketView from './components/Brackets/BracketView';
import AthleteEnrollment from './components/Divisions/AthleteEnrollment';
import MatchGenerator from './components/Divisions/MatchGenerator';
import DivisionForm from './components/Divisions/DivisionForm';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <>
                    <Header />
                    <main className="main-content">
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />

                        {/* Athlete Routes */}
                        <Route path="/athletes" element={<AthleteList />} />
                        <Route path="/athletes/register" element={<AthleteForm />} />
                        <Route path="/athletes/edit/:id" element={<AthleteForm />} />
                        <Route path="/athletes/:id" element={<AthleteList />} />

                        {/* Tournament Routes */}
                        <Route path="/tournaments" element={<TournamentList />} />
                        <Route path="/tournaments/create" element={<TournamentForm />} />
                        <Route path="/tournaments/edit/:id" element={<TournamentForm />} />
                        <Route path="/tournaments/:id" element={<TournamentDetail />} />

                        {/* Division Routes */}
                        <Route path="/tournaments/:tournamentId/divisions/create" element={<DivisionForm />} />
                        <Route path="/divisions/:divisionId/athletes" element={<AthleteEnrollment />} />
                        <Route path="/divisions/:divisionId/generate-matches" element={<MatchGenerator />} />

                        {/* Match Routes */}
                        <Route path="/matches" element={<MatchList />} />
                        <Route path="/matches/:id/score" element={<MatchScorer />} />

                        {/* Bracket Routes */}
                        <Route path="/brackets" element={<BracketView />} />
                        <Route path="/brackets/:divisionId" element={<BracketView />} />
                      </Routes>
                    </main>
                  </>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
