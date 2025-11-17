import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import BracketView from '../../components/Brackets/BracketView';
import matchService from '../../services/matchService';
import divisionService from '../../services/divisionService';

// Mock the services
jest.mock('../../services/matchService');
jest.mock('../../services/divisionService');

const mockDivision = {
  id: 1,
  name: 'Adult Male White Belt -76kg',
  beltRank: 'WHITE',
  ageCategory: 'ADULT',
  gender: 'MALE',
  weightClass: '-76kg',
  bracketType: 'SINGLE_ELIMINATION',
};

const mockMatches = [
  {
    id: 1,
    matchNumber: 1,
    roundNumber: 1,
    matNumber: 1,
    athlete1Id: 1,
    athlete1Name: 'John Doe',
    athlete2Id: 2,
    athlete2Name: 'Jane Smith',
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
    inProgress: false,
    athlete1Score: 0,
    athlete2Score: 0,
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
  },
];

describe('BracketView Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.confirm = jest.fn(() => true);
    window.alert = jest.fn();
  });

  describe('Rendering and Data Fetching', () => {
    test('should render loading state initially', () => {
      divisionService.getDivisionById.mockReturnValue(new Promise(() => {}));

      render(
        <MemoryRouter initialEntries={['/brackets/1']}>
          <BracketView />
        </MemoryRouter>
      );

      expect(screen.getByText(/loading bracket/i)).toBeInTheDocument();
    });

    test('should fetch division and matches data', async () => {
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
      matchService.getMatchesByDivision.mockResolvedValue({ data: mockMatches });

      render(
        <MemoryRouter initialEntries={['/brackets/1']}>
          <BracketView />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(divisionService.getDivisionById).toHaveBeenCalled();
        expect(matchService.getMatchesByDivision).toHaveBeenCalled();
      });
    });

    test('should display division information', async () => {
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
      matchService.getMatchesByDivision.mockResolvedValue({ data: mockMatches });

      render(
        <MemoryRouter initialEntries={['/brackets/1']}>
          <BracketView />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(mockDivision.name)).toBeInTheDocument();
        expect(screen.getByText(mockDivision.beltRank)).toBeInTheDocument();
        expect(screen.getByText(mockDivision.ageCategory)).toBeInTheDocument();
      });
    });

    test('should handle no division ID gracefully', async () => {
      render(
        <MemoryRouter initialEntries={['/brackets']}>
          <BracketView />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/no division selected/i)).toBeInTheDocument();
      });
    });

    test('should handle API errors gracefully', async () => {
      const errorMessage = 'Failed to load division data';
      divisionService.getDivisionById.mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      render(
        <MemoryRouter initialEntries={['/brackets/1']}>
          <BracketView />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/error loading bracket/i)).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  describe('Match Organization', () => {
    test('should organize matches by round', async () => {
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
      matchService.getMatchesByDivision.mockResolvedValue({ data: mockMatches });

      render(
        <MemoryRouter initialEntries={['/brackets/1']}>
          <BracketView />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/round 1/i)).toBeInTheDocument();
        expect(screen.getByText(/round 2/i)).toBeInTheDocument();
      });
    });

    test('should display round names correctly', async () => {
      const finalMatches = [
        {
          id: 1,
          matchNumber: 1,
          roundNumber: 3,
          athlete1Name: 'John Doe',
          athlete2Name: 'Jane Smith',
          completed: false,
          inProgress: false,
        },
      ];

      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
      matchService.getMatchesByDivision.mockResolvedValue({ data: finalMatches });

      render(
        <MemoryRouter initialEntries={['/brackets/1']}>
          <BracketView />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/final/i)).toBeInTheDocument();
      });
    });

    test('should display match details correctly', async () => {
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
      matchService.getMatchesByDivision.mockResolvedValue({ data: mockMatches });

      render(
        <MemoryRouter initialEntries={['/brackets/1']}>
          <BracketView />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Match #1')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });
  });

  describe('Match Status Display', () => {
    test('should display pending status correctly', async () => {
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
      matchService.getMatchesByDivision.mockResolvedValue({ data: [mockMatches[0]] });

      render(
        <MemoryRouter initialEntries={['/brackets/1']}>
          <BracketView />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/⏳ pending/i)).toBeInTheDocument();
      });
    });

    test('should display completed matches with scores', async () => {
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
      matchService.getMatchesByDivision.mockResolvedValue({ data: [mockMatches[2]] });

      render(
        <MemoryRouter initialEntries={['/brackets/1']}>
          <BracketView />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/✓ completed/i)).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument();
      });
    });

    test('should highlight winner in completed matches', async () => {
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
      matchService.getMatchesByDivision.mockResolvedValue({ data: [mockMatches[2]] });

      render(
        <MemoryRouter initialEntries={['/brackets/1']}>
          <BracketView />
        </MemoryRouter>
      );

      await waitFor(() => {
        const winnerIcon = screen.getByText('👑');
        expect(winnerIcon).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    test('should show empty state when no matches exist', async () => {
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
      matchService.getMatchesByDivision.mockResolvedValue({ data: [] });

      render(
        <MemoryRouter initialEntries={['/brackets/1']}>
          <BracketView />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/no matches generated/i)).toBeInTheDocument();
      });
    });

    test('should show generate matches button when no matches exist', async () => {
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
      matchService.getMatchesByDivision.mockResolvedValue({ data: [] });

      render(
        <MemoryRouter initialEntries={['/brackets/1']}>
          <BracketView />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/⚡ generate matches automatically/i)).toBeInTheDocument();
      });
    });
  });

  describe('Generate Matches', () => {
    test('should call generateMatches API when clicking generate button', async () => {
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
      matchService.getMatchesByDivision.mockResolvedValue({ data: [] });
      divisionService.generateMatches.mockResolvedValue({ data: mockMatches });

      render(
        <MemoryRouter initialEntries={['/brackets/1']}>
          <BracketView />
        </MemoryRouter>
      );

      await waitFor(() => {
        const generateButton = screen.getByText(/⚡ generate matches automatically/i);
        fireEvent.click(generateButton);
      });

      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalled();
        expect(divisionService.generateMatches).toHaveBeenCalled();
      });
    });

    test('should show success alert when matches generated', async () => {
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
      matchService.getMatchesByDivision.mockResolvedValue({ data: [] });
      divisionService.generateMatches.mockResolvedValue({ data: mockMatches });

      render(
        <MemoryRouter initialEntries={['/brackets/1']}>
          <BracketView />
        </MemoryRouter>
      );

      await waitFor(() => {
        const generateButton = screen.getByText(/⚡ generate matches automatically/i);
        fireEvent.click(generateButton);
      });

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Matches generated successfully!');
      });
    });

    test('should handle generate matches errors', async () => {
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
      matchService.getMatchesByDivision.mockResolvedValue({ data: [] });
      divisionService.generateMatches.mockRejectedValue({
        response: { data: { message: 'Not enough athletes' } },
      });

      render(
        <MemoryRouter initialEntries={['/brackets/1']}>
          <BracketView />
        </MemoryRouter>
      );

      await waitFor(() => {
        const generateButton = screen.getByText(/⚡ generate matches automatically/i);
        fireEvent.click(generateButton);
      });

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          expect.stringContaining('Failed to generate matches')
        );
      });
    });

    test('should not generate matches if user cancels confirmation', async () => {
      window.confirm = jest.fn(() => false);
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
      matchService.getMatchesByDivision.mockResolvedValue({ data: [] });

      render(
        <MemoryRouter initialEntries={['/brackets/1']}>
          <BracketView />
        </MemoryRouter>
      );

      await waitFor(() => {
        const generateButton = screen.getByText(/⚡ generate matches automatically/i);
        fireEvent.click(generateButton);
      });

      await waitFor(() => {
        expect(divisionService.generateMatches).not.toHaveBeenCalled();
      });
    });
  });

  describe('Mat Number Display', () => {
    test('should display mat number when available', async () => {
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
      matchService.getMatchesByDivision.mockResolvedValue({ data: mockMatches });

      render(
        <MemoryRouter initialEntries={['/brackets/1']}>
          <BracketView />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getAllByText(/🥋 mat 1/i).length).toBeGreaterThan(0);
      });
    });
  });

  describe('Bracket Navigation', () => {
    test('should display back button', async () => {
      divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
      matchService.getMatchesByDivision.mockResolvedValue({ data: mockMatches });

      render(
        <MemoryRouter initialEntries={['/brackets/1']}>
          <BracketView />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/← back/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Recovery', () => {
    test('should show try again button on error', async () => {
      divisionService.getDivisionById.mockRejectedValue({
        response: { data: { message: 'Server error' } },
      });

      render(
        <MemoryRouter initialEntries={['/brackets/1']}>
          <BracketView />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/🔄 try again/i)).toBeInTheDocument();
      });
    });

    test('should retry fetching data when clicking try again', async () => {
      divisionService.getDivisionById.mockRejectedValue({
        response: { data: { message: 'Server error' } },
      });

      render(
        <MemoryRouter initialEntries={['/brackets/1']}>
          <BracketView />
        </MemoryRouter>
      );

      await waitFor(() => {
        const retryButton = screen.getByText(/🔄 try again/i);
        fireEvent.click(retryButton);
      });

      expect(divisionService.getDivisionById).toHaveBeenCalledTimes(2);
    });
  });
});
