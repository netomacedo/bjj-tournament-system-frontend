import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
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
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />

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
      </div>
    </Router>
  );
}

export default App;
