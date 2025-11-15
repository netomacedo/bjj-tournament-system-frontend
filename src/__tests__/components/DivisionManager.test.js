import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import DivisionManager from '../../components/Divisions/DivisionManager';
import divisionService from '../../services/divisionService';

// Mock the divisionService
jest.mock('../../services/divisionService');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('DivisionManager Component', () => {
  const mockDivisions = [
    {
      id: 1,
      name: 'Adult Male Blue Belt Medium Heavy',
      beltRank: 'BLUE',
      ageCategory: 'ADULT',
      gender: 'MALE',
      weightClass: 'MEDIUM_HEAVY',
      bracketType: 'SINGLE_ELIMINATION',
      athleteCount: 8,
      matchesGenerated: false,
      completed: false,
      athletes: [
        { id: 1, name: 'John Doe', weight: 82.5 },
        { id: 2, name: 'Jane Smith', weight: 80.0 }
      ]
    },
    {
      id: 2,
      name: 'Adult Female Blue Belt Light',
      beltRank: 'BLUE',
      ageCategory: 'ADULT',
      gender: 'FEMALE',
      weightClass: 'LIGHT',
      bracketType: 'DOUBLE_ELIMINATION',
      athleteCount: 4,
      matchesGenerated: true,
      completed: false
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render loading state initially', () => {
    divisionService.getTournamentDivisions.mockReturnValue(new Promise(() => {}));

    renderWithRouter(<DivisionManager tournamentId={1} />);

    expect(screen.getByText('Loading divisions...')).toBeInTheDocument();
  });

  it('should render divisions after loading', async () => {
    divisionService.getTournamentDivisions.mockResolvedValue({ data: mockDivisions });

    renderWithRouter(<DivisionManager tournamentId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Tournament Divisions')).toBeInTheDocument();
      expect(screen.getByText('Adult Male Blue Belt Medium Heavy')).toBeInTheDocument();
      expect(screen.getByText('Adult Female Blue Belt Light')).toBeInTheDocument();
    });
  });

  it('should display "Add Division" button', async () => {
    divisionService.getTournamentDivisions.mockResolvedValue({ data: mockDivisions });

    renderWithRouter(<DivisionManager tournamentId={1} />);

    await waitFor(() => {
      expect(screen.getByText('+ Add Division')).toBeInTheDocument();
    });
  });

  it('should navigate to create division form when "Add Division" is clicked', async () => {
    const user = userEvent.setup();
    divisionService.getTournamentDivisions.mockResolvedValue({ data: mockDivisions });

    renderWithRouter(<DivisionManager tournamentId={1} />);

    await waitFor(() => {
      expect(screen.getByText('+ Add Division')).toBeInTheDocument();
    });

    const addButton = screen.getByText('+ Add Division');
    await user.click(addButton);

    expect(mockNavigate).toHaveBeenCalledWith('/tournaments/1/divisions/create');
  });

  it('should display empty state when no divisions exist', async () => {
    divisionService.getTournamentDivisions.mockResolvedValue({ data: [] });

    renderWithRouter(<DivisionManager tournamentId={1} />);

    await waitFor(() => {
      expect(screen.getByText('No Divisions Yet')).toBeInTheDocument();
      expect(screen.getByText(/Create divisions to organize athletes/i)).toBeInTheDocument();
      expect(screen.getByText('Create First Division')).toBeInTheDocument();
    });
  });

  it('should navigate to create division when "Create First Division" is clicked', async () => {
    const user = userEvent.setup();
    divisionService.getTournamentDivisions.mockResolvedValue({ data: [] });

    renderWithRouter(<DivisionManager tournamentId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Create First Division')).toBeInTheDocument();
    });

    const createButton = screen.getByText('Create First Division');
    await user.click(createButton);

    expect(mockNavigate).toHaveBeenCalledWith('/tournaments/1/divisions/create');
  });

  it('should display division athlete count', async () => {
    divisionService.getTournamentDivisions.mockResolvedValue({ data: mockDivisions });

    renderWithRouter(<DivisionManager tournamentId={1} />);

    await waitFor(() => {
      expect(screen.getByText('8 Athletes')).toBeInTheDocument();
      expect(screen.getByText('4 Athletes')).toBeInTheDocument();
    });
  });

  it('should display "No Matches" when matches not generated', async () => {
    divisionService.getTournamentDivisions.mockResolvedValue({ data: mockDivisions });

    renderWithRouter(<DivisionManager tournamentId={1} />);

    await waitFor(() => {
      expect(screen.getByText('No Matches')).toBeInTheDocument();
    });
  });

  it('should display "Matches Ready" when matches are generated', async () => {
    divisionService.getTournamentDivisions.mockResolvedValue({ data: mockDivisions });

    renderWithRouter(<DivisionManager tournamentId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Matches Ready')).toBeInTheDocument();
    });
  });

  it('should expand division when header is clicked', async () => {
    const user = userEvent.setup();
    divisionService.getTournamentDivisions.mockResolvedValue({ data: mockDivisions });

    renderWithRouter(<DivisionManager tournamentId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Adult Male Blue Belt Medium Heavy')).toBeInTheDocument();
    });

    const divisionHeader = screen.getByText('Adult Male Blue Belt Medium Heavy').closest('.division-header');
    await user.click(divisionHeader);

    await waitFor(() => {
      expect(screen.getByText('Manage Athletes')).toBeInTheDocument();
      expect(screen.getByText('Auto Generate Matches')).toBeInTheDocument();
      expect(screen.getByText('Manual Match Creation')).toBeInTheDocument();
    });
  });

  it('should collapse division when header is clicked again', async () => {
    const user = userEvent.setup();
    divisionService.getTournamentDivisions.mockResolvedValue({ data: mockDivisions });

    renderWithRouter(<DivisionManager tournamentId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Adult Male Blue Belt Medium Heavy')).toBeInTheDocument();
    });

    const divisionHeader = screen.getByText('Adult Male Blue Belt Medium Heavy').closest('.division-header');

    // Expand
    await user.click(divisionHeader);
    await waitFor(() => {
      expect(screen.getByText('Manage Athletes')).toBeInTheDocument();
    });

    // Collapse
    await user.click(divisionHeader);
    await waitFor(() => {
      expect(screen.queryByText('Manage Athletes')).not.toBeInTheDocument();
    });
  });

  it('should navigate to athlete enrollment when "Manage Athletes" is clicked', async () => {
    const user = userEvent.setup();
    divisionService.getTournamentDivisions.mockResolvedValue({ data: mockDivisions });

    renderWithRouter(<DivisionManager tournamentId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Adult Male Blue Belt Medium Heavy')).toBeInTheDocument();
    });

    const divisionHeader = screen.getByText('Adult Male Blue Belt Medium Heavy').closest('.division-header');
    await user.click(divisionHeader);

    await waitFor(() => {
      expect(screen.getByText('Manage Athletes')).toBeInTheDocument();
    });

    const manageButton = screen.getByText('Manage Athletes');
    await user.click(manageButton);

    expect(mockNavigate).toHaveBeenCalledWith('/divisions/1/athletes');
  });

  it('should disable match generation buttons when fewer than 2 athletes', async () => {
    const divisionsWithFewAthletes = [{
      ...mockDivisions[0],
      athleteCount: 1,
      athletes: [{ id: 1, name: 'John Doe', weight: 82.5 }]
    }];

    divisionService.getTournamentDivisions.mockResolvedValue({ data: divisionsWithFewAthletes });

    renderWithRouter(<DivisionManager tournamentId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Adult Male Blue Belt Medium Heavy')).toBeInTheDocument();
    });

    const divisionHeader = screen.getByText('Adult Male Blue Belt Medium Heavy').closest('.division-header');
    await user.click(divisionHeader);

    await waitFor(() => {
      const autoButton = screen.getByText('Auto Generate Matches');
      const manualButton = screen.getByText('Manual Match Creation');

      expect(autoButton).toBeDisabled();
      expect(manualButton).toBeDisabled();
    });
  });

  it('should enable match generation buttons when 2 or more athletes', async () => {
    const user = userEvent.setup();
    divisionService.getTournamentDivisions.mockResolvedValue({ data: mockDivisions });

    renderWithRouter(<DivisionManager tournamentId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Adult Male Blue Belt Medium Heavy')).toBeInTheDocument();
    });

    const divisionHeader = screen.getByText('Adult Male Blue Belt Medium Heavy').closest('.division-header');
    await user.click(divisionHeader);

    await waitFor(() => {
      const autoButton = screen.getByText('Auto Generate Matches');
      const manualButton = screen.getByText('Manual Match Creation');

      expect(autoButton).not.toBeDisabled();
      expect(manualButton).not.toBeDisabled();
    });
  });

  it('should call generateMatches when "Auto Generate Matches" is clicked and confirmed', async () => {
    const user = userEvent.setup();
    window.confirm = jest.fn(() => true);
    divisionService.getTournamentDivisions.mockResolvedValue({ data: mockDivisions });
    divisionService.generateMatches.mockResolvedValue({ data: { matchesGenerated: 4 } });
    window.alert = jest.fn();

    renderWithRouter(<DivisionManager tournamentId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Adult Male Blue Belt Medium Heavy')).toBeInTheDocument();
    });

    const divisionHeader = screen.getByText('Adult Male Blue Belt Medium Heavy').closest('.division-header');
    await user.click(divisionHeader);

    await waitFor(() => {
      expect(screen.getByText('Auto Generate Matches')).toBeInTheDocument();
    });

    const autoButton = screen.getByText('Auto Generate Matches');
    await user.click(autoButton);

    expect(window.confirm).toHaveBeenCalledWith('Generate matches automatically?');

    await waitFor(() => {
      expect(divisionService.generateMatches).toHaveBeenCalledWith(1);
    });
  });

  it('should navigate to manual match creation when button is clicked and confirmed', async () => {
    const user = userEvent.setup();
    window.confirm = jest.fn(() => true);
    divisionService.getTournamentDivisions.mockResolvedValue({ data: mockDivisions });

    renderWithRouter(<DivisionManager tournamentId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Adult Male Blue Belt Medium Heavy')).toBeInTheDocument();
    });

    const divisionHeader = screen.getByText('Adult Male Blue Belt Medium Heavy').closest('.division-header');
    await user.click(divisionHeader);

    await waitFor(() => {
      expect(screen.getByText('Manual Match Creation')).toBeInTheDocument();
    });

    const manualButton = screen.getByText('Manual Match Creation');
    await user.click(manualButton);

    expect(window.confirm).toHaveBeenCalledWith('Generate matches manually?');
    expect(mockNavigate).toHaveBeenCalledWith('/divisions/1/generate-matches');
  });

  it('should show "View Bracket" button when matches are generated', async () => {
    const user = userEvent.setup();
    const divisionsWithMatches = mockDivisions.filter(d => d.matchesGenerated);
    divisionService.getTournamentDivisions.mockResolvedValue({ data: divisionsWithMatches });

    renderWithRouter(<DivisionManager tournamentId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Adult Female Blue Belt Light')).toBeInTheDocument();
    });

    const divisionHeader = screen.getByText('Adult Female Blue Belt Light').closest('.division-header');
    await user.click(divisionHeader);

    await waitFor(() => {
      expect(screen.getByText('View Bracket')).toBeInTheDocument();
      expect(screen.queryByText('Auto Generate Matches')).not.toBeInTheDocument();
    });
  });

  it('should navigate to bracket view when "View Bracket" is clicked', async () => {
    const user = userEvent.setup();
    const divisionsWithMatches = mockDivisions.filter(d => d.matchesGenerated);
    divisionService.getTournamentDivisions.mockResolvedValue({ data: divisionsWithMatches });

    renderWithRouter(<DivisionManager tournamentId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Adult Female Blue Belt Light')).toBeInTheDocument();
    });

    const divisionHeader = screen.getByText('Adult Female Blue Belt Light').closest('.division-header');
    await user.click(divisionHeader);

    await waitFor(() => {
      expect(screen.getByText('View Bracket')).toBeInTheDocument();
    });

    const viewBracketButton = screen.getByText('View Bracket');
    await user.click(viewBracketButton);

    expect(mockNavigate).toHaveBeenCalledWith('/brackets/2');
  });

  it('should display enrolled athletes when division is expanded', async () => {
    const user = userEvent.setup();
    divisionService.getTournamentDivisions.mockResolvedValue({ data: mockDivisions });

    renderWithRouter(<DivisionManager tournamentId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Adult Male Blue Belt Medium Heavy')).toBeInTheDocument();
    });

    const divisionHeader = screen.getByText('Adult Male Blue Belt Medium Heavy').closest('.division-header');
    await user.click(divisionHeader);

    await waitFor(() => {
      expect(screen.getByText('Enrolled Athletes:')).toBeInTheDocument();
      expect(screen.getByText(/John Doe - 82.5kg/)).toBeInTheDocument();
      expect(screen.getByText(/Jane Smith - 80kg/)).toBeInTheDocument();
    });
  });

  it('should display bracket type in division details', async () => {
    const user = userEvent.setup();
    divisionService.getTournamentDivisions.mockResolvedValue({ data: mockDivisions });

    renderWithRouter(<DivisionManager tournamentId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Adult Male Blue Belt Medium Heavy')).toBeInTheDocument();
    });

    const divisionHeader = screen.getByText('Adult Male Blue Belt Medium Heavy').closest('.division-header');
    await user.click(divisionHeader);

    await waitFor(() => {
      expect(screen.getByText('Bracket Type:')).toBeInTheDocument();
      expect(screen.getByText('Single Elimination')).toBeInTheDocument();
    });
  });

  it('should handle error gracefully when fetching divisions fails', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    divisionService.getTournamentDivisions.mockRejectedValue(new Error('API error'));

    renderWithRouter(<DivisionManager tournamentId={1} />);

    await waitFor(() => {
      expect(screen.getByText('No Divisions Yet')).toBeInTheDocument();
    });

    expect(consoleLogSpy).toHaveBeenCalledWith('Divisions endpoint not available yet:', expect.any(Error));

    consoleLogSpy.mockRestore();
  });

  it('should handle athleteCount fallback when athletes array is undefined', async () => {
    const divisionsWithAthleteCount = [{
      ...mockDivisions[0],
      athletes: undefined,
      athleteCount: 5
    }];

    divisionService.getTournamentDivisions.mockResolvedValue({ data: divisionsWithAthleteCount });

    renderWithRouter(<DivisionManager tournamentId={1} />);

    await waitFor(() => {
      expect(screen.getByText('5 Athletes')).toBeInTheDocument();
    });
  });

  it('should display "Active" status for incomplete divisions', async () => {
    divisionService.getTournamentDivisions.mockResolvedValue({ data: mockDivisions });

    renderWithRouter(<DivisionManager tournamentId={1} />);

    await waitFor(() => {
      const activeStatuses = screen.getAllByText('Active');
      expect(activeStatuses.length).toBeGreaterThan(0);
    });
  });
});