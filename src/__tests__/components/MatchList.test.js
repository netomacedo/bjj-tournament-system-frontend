import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MatchList from '../../components/Matches/MatchList';
import matchService from '../../services/matchService';
import divisionService from '../../services/divisionService';

// Mock the services
jest.mock('../../services/matchService');
jest.mock('../../services/divisionService');

// Mock useSearchParams
const mockSearchParams = new URLSearchParams();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: () => [mockSearchParams],
  useNavigate: () => jest.fn(),
}));

const mockDivision = {
  id: 1,
  name: 'Adult Male White Belt -76kg',
  beltRank: 'WHITE',
  ageCategory: 'ADULT',
  gender: 'MALE',
  weightClass: '-76kg',
};

const mockMatches = [
  {
    id: 1,
    matchNumber: 1,
    roundNumber: 1,
    matNumber: 1,
    athlete1Id: 1,
    athlete1Name: 'John Doe',
    athlete1Team: 'Team A',
    athlete2Id: 2,
    athlete2Name: 'Jane Smith',
    athlete2Team: 'Team B',
    completed: false,
    inProgress: false,
    athlete1Score: 0,
    athlete2Score: 0,
  },
  {
    id: 2,
    matchNumber: 2,
    roundNumber: 1,
    matNumber: 2,
    athlete1Id: 3,
    athlete1Name: 'Bob Johnson',
    athlete2Id: 4,
    athlete2Name: 'Alice Williams',
    completed: false,
    inProgress: true,
    athlete1Score: 4,
    athlete2Score: 2,
  },
  {
    id: 3,
    matchNumber: 3,
    roundNumber: 2,
    matNumber: 1,
    athlete1Id: 1,
    athlete1Name: 'John Doe',
    athlete2Id: 3,
    athlete2Name: 'Bob Johnson',
    completed: true,
    inProgress: false,
    athlete1Score: 10,
    athlete2Score: 0,
    winnerId: 1,
    submissionType: 'Rear Naked Choke',
  },
];

describe('MatchList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.set('divisionId', '1');
  });

  describe('Rendering and Data Fetching', () => {
    test('should render loading state initially', () => {
      matchService.getMatchesByDivision.mockReturnValue(new Promise(() => {}));
      divisionService.getDivisionById.mockReturnValue(new Promise(() => {}));

      render(
        <BrowserRouter>
          <MatchList />
        </BrowserRouter>
      );

      expect(screen.getByText(/loading matches/i)).toBeInTheDocument();
    });

    test('should fetch and display matches when divisionId is provided', async () => {
      matchService.getMatchesByDivision.mockResolvedValue({ data: mockMatches });
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });

      render(
        <BrowserRouter>
          <MatchList />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(matchService.getMatchesByDivision).toHaveBeenCalledWith('1');
        expect(divisionService.getDivisionById).toHaveBeenCalledWith('1');
      });

      expect(screen.getByText('Match #1')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    test('should display division information', async () => {
      matchService.getMatchesByDivision.mockResolvedValue({ data: mockMatches });
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });

      render(
        <BrowserRouter>
          <MatchList />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(mockDivision.name)).toBeInTheDocument();
        expect(screen.getByText(mockDivision.beltRank)).toBeInTheDocument();
        expect(screen.getByText(mockDivision.ageCategory)).toBeInTheDocument();
      });
    });

    test('should show "no division selected" message when divisionId is missing', async () => {
      mockSearchParams.delete('divisionId');

      render(
        <BrowserRouter>
          <MatchList />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/no division selected/i)).toBeInTheDocument();
      });
    });

    test('should show "no matches yet" message when matches array is empty', async () => {
      matchService.getMatchesByDivision.mockResolvedValue({ data: [] });
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });

      render(
        <BrowserRouter>
          <MatchList />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/no matches yet/i)).toBeInTheDocument();
      });
    });

    test('should handle API errors gracefully', async () => {
      const errorMessage = 'Failed to load matches';
      matchService.getMatchesByDivision.mockRejectedValue({
        response: { data: { message: errorMessage } },
      });
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });

      render(
        <BrowserRouter>
          <MatchList />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/error loading matches/i)).toBeInTheDocument();
      });
    });
  });

  describe('Match Status Display', () => {
    test('should display pending matches with correct status', async () => {
      const pendingMatches = [mockMatches[0]];
      matchService.getMatchesByDivision.mockResolvedValue({ data: pendingMatches });
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });

      render(
        <BrowserRouter>
          <MatchList />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/⏳ pending/i)).toBeInTheDocument();
      });
    });

    test('should display in-progress matches with correct status', async () => {
      const inProgressMatches = [mockMatches[1]];
      matchService.getMatchesByDivision.mockResolvedValue({ data: inProgressMatches });
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });

      render(
        <BrowserRouter>
          <MatchList />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/⚔️ in progress/i)).toBeInTheDocument();
      });
    });

    test('should display completed matches with correct status and scores', async () => {
      const completedMatches = [mockMatches[2]];
      matchService.getMatchesByDivision.mockResolvedValue({ data: completedMatches });
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });

      render(
        <BrowserRouter>
          <MatchList />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/✓ completed/i)).toBeInTheDocument();
        expect(screen.getByText(/10 pts/i)).toBeInTheDocument();
        expect(screen.getByText(/0 pts/i)).toBeInTheDocument();
      });
    });

    test('should display winner icon for completed matches', async () => {
      const completedMatches = [mockMatches[2]];
      matchService.getMatchesByDivision.mockResolvedValue({ data: completedMatches });
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });

      render(
        <BrowserRouter>
          <MatchList />
        </BrowserRouter>
      );

      await waitFor(() => {
        const winnerBadges = screen.getAllByText('👑');
        expect(winnerBadges).toHaveLength(1);
      });
    });

    test('should display submission type for completed matches with submissions', async () => {
      const completedMatches = [mockMatches[2]];
      matchService.getMatchesByDivision.mockResolvedValue({ data: completedMatches });
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });

      render(
        <BrowserRouter>
          <MatchList />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/submission: rear naked choke/i)).toBeInTheDocument();
      });
    });
  });

  describe('Match Information Display', () => {
    test('should display round number when available', async () => {
      matchService.getMatchesByDivision.mockResolvedValue({ data: mockMatches });
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });

      render(
        <BrowserRouter>
          <MatchList />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getAllByText(/round 1/i).length).toBeGreaterThan(0);
      });
    });

    test('should display mat number when available', async () => {
      matchService.getMatchesByDivision.mockResolvedValue({ data: mockMatches });
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });

      render(
        <BrowserRouter>
          <MatchList />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getAllByText(/mat 1/i).length).toBeGreaterThan(0);
      });
    });

    test('should display athlete team information when available', async () => {
      matchService.getMatchesByDivision.mockResolvedValue({ data: [mockMatches[0]] });
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });

      render(
        <BrowserRouter>
          <MatchList />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Team A')).toBeInTheDocument();
        expect(screen.getByText('Team B')).toBeInTheDocument();
      });
    });
  });

  describe('Action Buttons', () => {
    test('should show "Start Match" button for pending matches', async () => {
      const pendingMatches = [mockMatches[0]];
      matchService.getMatchesByDivision.mockResolvedValue({ data: pendingMatches });
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });

      render(
        <BrowserRouter>
          <MatchList />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/start match/i)).toBeInTheDocument();
      });
    });

    test('should show "Score Match" button for in-progress matches', async () => {
      const inProgressMatches = [mockMatches[1]];
      matchService.getMatchesByDivision.mockResolvedValue({ data: inProgressMatches });
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });

      render(
        <BrowserRouter>
          <MatchList />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/score match/i)).toBeInTheDocument();
      });
    });

    test('should show "View Details" button for completed matches', async () => {
      const completedMatches = [mockMatches[2]];
      matchService.getMatchesByDivision.mockResolvedValue({ data: completedMatches });
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });

      render(
        <BrowserRouter>
          <MatchList />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/view details/i)).toBeInTheDocument();
      });
    });
  });

  describe('Start Match Flow', () => {
    test('should open confirmation modal when clicking "Start Match"', async () => {
      const pendingMatches = [mockMatches[0]];
      matchService.getMatchesByDivision.mockResolvedValue({ data: pendingMatches });
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });

      render(
        <BrowserRouter>
          <MatchList />
        </BrowserRouter>
      );

      await waitFor(() => {
        const startButton = screen.getByText(/start match/i);
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/start match #1/i)).toBeInTheDocument();
      });
    });

    test('should call startMatch API when confirming start match', async () => {
      const pendingMatches = [mockMatches[0]];
      matchService.getMatchesByDivision.mockResolvedValue({ data: pendingMatches });
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
      matchService.startMatch.mockResolvedValue({ data: { ...mockMatches[0], inProgress: true } });

      render(
        <BrowserRouter>
          <MatchList />
        </BrowserRouter>
      );

      await waitFor(() => {
        const startButton = screen.getByText(/start match/i);
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        const confirmButton = screen.getByText(/start match/i);
        fireEvent.click(confirmButton);
      });

      await waitFor(() => {
        expect(matchService.startMatch).toHaveBeenCalledWith(1);
      });
    });

    test('should show success message when match started successfully', async () => {
      const pendingMatches = [mockMatches[0]];
      matchService.getMatchesByDivision.mockResolvedValue({ data: pendingMatches });
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
      matchService.startMatch.mockResolvedValue({ data: { ...mockMatches[0], inProgress: true } });

      render(
        <BrowserRouter>
          <MatchList />
        </BrowserRouter>
      );

      await waitFor(() => {
        const startButton = screen.getByText(/start match/i);
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        const confirmButton = screen.getByText(/start match/i);
        fireEvent.click(confirmButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/success!/i)).toBeInTheDocument();
      });
    });

    test('should handle start match API errors', async () => {
      const pendingMatches = [mockMatches[0]];
      matchService.getMatchesByDivision.mockResolvedValue({ data: pendingMatches });
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
      matchService.startMatch.mockRejectedValue({
        response: { data: { message: 'Match already started' } },
      });

      render(
        <BrowserRouter>
          <MatchList />
        </BrowserRouter>
      );

      await waitFor(() => {
        const startButton = screen.getByText(/start match/i);
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        const confirmButton = screen.getByText(/start match/i);
        fireEvent.click(confirmButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Refresh', () => {
    test('should refresh data after successful match start', async () => {
      const pendingMatches = [mockMatches[0]];
      matchService.getMatchesByDivision.mockResolvedValue({ data: pendingMatches });
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
      matchService.startMatch.mockResolvedValue({ data: { ...mockMatches[0], inProgress: true } });

      render(
        <BrowserRouter>
          <MatchList />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(matchService.getMatchesByDivision).toHaveBeenCalledTimes(1);
      });

      const startButton = await screen.findByText(/start match/i);
      fireEvent.click(startButton);

      await waitFor(() => {
        const confirmButton = screen.getByText(/start match/i);
        fireEvent.click(confirmButton);
      });

      await waitFor(() => {
        const okButton = screen.getByText(/ok/i);
        fireEvent.click(okButton);
      });

      // Should refetch data after confirming success
      await waitFor(() => {
        expect(matchService.getMatchesByDivision).toHaveBeenCalledTimes(2);
      });
    });
  });
});
