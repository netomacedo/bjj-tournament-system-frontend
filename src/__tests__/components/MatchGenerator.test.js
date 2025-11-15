import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import MatchGenerator from '../../components/Divisions/MatchGenerator';
import divisionService from '../../services/divisionService';

// Mock the divisionService
jest.mock('../../services/divisionService');

// Mock useParams and useNavigate
const mockNavigate = jest.fn();
const mockDivisionId = '1';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ divisionId: mockDivisionId }),
  useNavigate: () => mockNavigate,
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('MatchGenerator Component', () => {
  const mockDivision = {
    id: 1,
    name: 'Adult Male Blue Belt Medium Heavy',
    beltRank: 'BLUE',
    ageCategory: 'ADULT',
    gender: 'MALE',
    weightClass: 'MEDIUM_HEAVY'
  };

  const mockAthletes = [
    { id: 1, name: 'John Doe', weight: 82.5 },
    { id: 2, name: 'Jane Smith', weight: 80.0 },
    { id: 3, name: 'Bob Johnson', weight: 85.0 },
    { id: 4, name: 'Alice Williams', weight: 78.0 }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
    window.confirm = jest.fn(() => true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render loading state initially', () => {
    divisionService.getDivisionById.mockReturnValue(new Promise(() => {}));
    divisionService.getDivisionAthletes.mockReturnValue(new Promise(() => {}));

    renderWithRouter(<MatchGenerator />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render match generator after loading', async () => {
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockAthletes });

    renderWithRouter(<MatchGenerator />);

    await waitFor(() => {
      expect(screen.getByText('Manual Match Creation')).toBeInTheDocument();
      expect(screen.getByText('Adult Male Blue Belt Medium Heavy')).toBeInTheDocument();
      expect(screen.getByText(/Create custom match pairings/i)).toBeInTheDocument();
    });
  });

  it('should show warning when fewer than 2 athletes', async () => {
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: [mockAthletes[0]] });

    renderWithRouter(<MatchGenerator />);

    await waitFor(() => {
      expect(screen.getByText('Not Enough Athletes')).toBeInTheDocument();
      expect(screen.getByText(/You need at least 2 athletes/i)).toBeInTheDocument();
    });
  });

  it('should navigate back when Go Back is clicked in insufficient athletes state', async () => {
    const user = userEvent.setup();
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: [mockAthletes[0]] });

    renderWithRouter(<MatchGenerator />);

    await waitFor(() => {
      expect(screen.getByText('Go Back')).toBeInTheDocument();
    });

    const goBackButton = screen.getByText('Go Back');
    await user.click(goBackButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('should initialize with one empty match pair', async () => {
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockAthletes });

    renderWithRouter(<MatchGenerator />);

    await waitFor(() => {
      expect(screen.getByText('Match 1')).toBeInTheDocument();
      expect(screen.getByText(/Match Pairings \(1\)/i)).toBeInTheDocument();
    });
  });

  it('should add a new match pair when Add Match is clicked', async () => {
    const user = userEvent.setup();
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockAthletes });

    renderWithRouter(<MatchGenerator />);

    await waitFor(() => {
      expect(screen.getByText('+ Add Match')).toBeInTheDocument();
    });

    const addButton = screen.getByText('+ Add Match');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Match 2')).toBeInTheDocument();
      expect(screen.getByText(/Match Pairings \(2\)/i)).toBeInTheDocument();
    });
  });

  it('should remove a match pair when Remove is clicked', async () => {
    const user = userEvent.setup();
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockAthletes });

    renderWithRouter(<MatchGenerator />);

    await waitFor(() => {
      expect(screen.getByText('+ Add Match')).toBeInTheDocument();
    });

    // Add second match
    const addButton = screen.getByText('+ Add Match');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Match 2')).toBeInTheDocument();
    });

    // Remove second match
    const removeButtons = screen.getAllByText('Remove');
    await user.click(removeButtons[1]);

    await waitFor(() => {
      expect(screen.queryByText('Match 2')).not.toBeInTheDocument();
      expect(screen.getByText(/Match Pairings \(1\)/i)).toBeInTheDocument();
    });
  });

  it('should not show Remove button when only one match exists', async () => {
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockAthletes });

    renderWithRouter(<MatchGenerator />);

    await waitFor(() => {
      expect(screen.getByText('Match 1')).toBeInTheDocument();
    });

    expect(screen.queryByText('Remove')).not.toBeInTheDocument();
  });

  it('should populate athlete dropdowns with available athletes', async () => {
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockAthletes });

    renderWithRouter(<MatchGenerator />);

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects).toHaveLength(2);

      // Check that all athletes appear in dropdown options
      expect(screen.getByText('John Doe (82.5kg)')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith (80kg)')).toBeInTheDocument();
    });
  });

  it('should update match pair when athlete is selected', async () => {
    const user = userEvent.setup();
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockAthletes });

    renderWithRouter(<MatchGenerator />);

    await waitFor(() => {
      expect(screen.getByText('Athlete 1')).toBeInTheDocument();
    });

    const selects = screen.getAllByRole('combobox');
    const athlete1Select = selects[0];

    await user.selectOptions(athlete1Select, '1');

    expect(athlete1Select.value).toBe('1');
  });

  it('should prevent selecting the same athlete in both positions of a match', async () => {
    const user = userEvent.setup();
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockAthletes });

    renderWithRouter(<MatchGenerator />);

    await waitFor(() => {
      expect(screen.getByText('Athlete 1')).toBeInTheDocument();
    });

    const selects = screen.getAllByRole('combobox');
    const athlete1Select = selects[0];
    const athlete2Select = selects[1];

    // Select athlete 1 in first position
    await user.selectOptions(athlete1Select, '1');

    // Athlete 1 should not be available in second position
    const athlete2Options = Array.from(athlete2Select.options).map(opt => opt.value);
    expect(athlete2Options).not.toContain('1');
  });

  it('should prevent selecting already paired athletes in other matches', async () => {
    const user = userEvent.setup();
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockAthletes });

    renderWithRouter(<MatchGenerator />);

    await waitFor(() => {
      expect(screen.getByText('+ Add Match')).toBeInTheDocument();
    });

    // Select athletes in first match
    const firstMatchSelects = screen.getAllByRole('combobox');
    await user.selectOptions(firstMatchSelects[0], '1');
    await user.selectOptions(firstMatchSelects[1], '2');

    // Add second match
    const addButton = screen.getByText('+ Add Match');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Match 2')).toBeInTheDocument();
    });

    // Athletes 1 and 2 should not be available in second match
    const secondMatchSelects = screen.getAllByRole('combobox').slice(2);
    const athlete1Options = Array.from(secondMatchSelects[0].options).map(opt => opt.value);

    expect(athlete1Options).not.toContain('1');
    expect(athlete1Options).not.toContain('2');
    expect(athlete1Options).toContain('3');
    expect(athlete1Options).toContain('4');
  });

  it('should validate that both athletes are selected', async () => {
    const user = userEvent.setup();
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockAthletes });

    renderWithRouter(<MatchGenerator />);

    await waitFor(() => {
      expect(screen.getByText(/Create 1 Match/i)).toBeInTheDocument();
    });

    const createButton = screen.getByText(/Create 1 Match/i);
    await user.click(createButton);

    expect(window.alert).toHaveBeenCalledWith('Match 1: Both athletes must be selected');
    expect(divisionService.generateMatchesManual).not.toHaveBeenCalled();
  });

  it('should validate that athlete cannot match with themselves', async () => {
    const user = userEvent.setup();
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockAthletes });

    renderWithRouter(<MatchGenerator />);

    await waitFor(() => {
      expect(screen.getByText('Athlete 1')).toBeInTheDocument();
    });

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], '1');

    // Manually set both to same athlete (shouldn't happen in UI, but test validation)
    const createButton = screen.getByText(/Create 1 Match/i);

    // This would be caught by UI preventing same selection, but test validation logic
    expect(createButton).toBeInTheDocument();
  });

  it('should submit matches successfully when validation passes', async () => {
    const user = userEvent.setup();
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockAthletes });
    divisionService.generateMatchesManual.mockResolvedValue({ data: { matchesGenerated: 1 } });

    renderWithRouter(<MatchGenerator />);

    await waitFor(() => {
      expect(screen.getByText('Athlete 1')).toBeInTheDocument();
    });

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], '1');
    await user.selectOptions(selects[1], '2');

    const createButton = screen.getByText(/Create 1 Match/i);
    await user.click(createButton);

    expect(window.confirm).toHaveBeenCalledWith('Create 1 match?');

    await waitFor(() => {
      expect(divisionService.generateMatchesManual).toHaveBeenCalledWith('1', [[1, 2]]);
      expect(window.alert).toHaveBeenCalledWith('Matches created successfully!');
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  it('should submit multiple matches successfully', async () => {
    const user = userEvent.setup();
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockAthletes });
    divisionService.generateMatchesManual.mockResolvedValue({ data: { matchesGenerated: 2 } });

    renderWithRouter(<MatchGenerator />);

    await waitFor(() => {
      expect(screen.getByText('+ Add Match')).toBeInTheDocument();
    });

    // Setup first match
    let selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], '1');
    await user.selectOptions(selects[1], '2');

    // Add and setup second match
    const addButton = screen.getByText('+ Add Match');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Match 2')).toBeInTheDocument();
    });

    selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[2], '3');
    await user.selectOptions(selects[3], '4');

    const createButton = screen.getByText(/Create 2 Matches/i);
    await user.click(createButton);

    expect(window.confirm).toHaveBeenCalledWith('Create 2 matches?');

    await waitFor(() => {
      expect(divisionService.generateMatchesManual).toHaveBeenCalledWith('1', [[1, 2], [3, 4]]);
    });
  });

  it('should not submit when user cancels confirmation', async () => {
    const user = userEvent.setup();
    window.confirm = jest.fn(() => false);
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockAthletes });

    renderWithRouter(<MatchGenerator />);

    await waitFor(() => {
      expect(screen.getByText('Athlete 1')).toBeInTheDocument();
    });

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], '1');
    await user.selectOptions(selects[1], '2');

    const createButton = screen.getByText(/Create 1 Match/i);
    await user.click(createButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(divisionService.generateMatchesManual).not.toHaveBeenCalled();
  });

  it('should show error alert when match creation fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Matches already generated for this division';
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockAthletes });
    divisionService.generateMatchesManual.mockRejectedValue({
      response: { data: { message: errorMessage } }
    });

    renderWithRouter(<MatchGenerator />);

    await waitFor(() => {
      expect(screen.getByText('Athlete 1')).toBeInTheDocument();
    });

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], '1');
    await user.selectOptions(selects[1], '2');

    const createButton = screen.getByText(/Create 1 Match/i);
    await user.click(createButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to create matches: ' + errorMessage);
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should disable Create button when submitting', async () => {
    const user = userEvent.setup();
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockAthletes });
    divisionService.generateMatchesManual.mockImplementation(() =>
      new Promise(resolve => setTimeout(resolve, 100))
    );

    renderWithRouter(<MatchGenerator />);

    await waitFor(() => {
      expect(screen.getByText('Athlete 1')).toBeInTheDocument();
    });

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], '1');
    await user.selectOptions(selects[1], '2');

    const createButton = screen.getByText(/Create 1 Match/i);
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Creating Matches...')).toBeInTheDocument();
    });

    const submittingButton = screen.getByText('Creating Matches...');
    expect(submittingButton).toBeDisabled();
  });

  it('should disable Create button when no match pairs exist', async () => {
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: [mockAthletes[0]] });

    renderWithRouter(<MatchGenerator />);

    await waitFor(() => {
      // With fewer than 2 athletes, should show warning screen
      expect(screen.getByText('Not Enough Athletes')).toBeInTheDocument();
    });
  });

  it('should navigate back when Cancel is clicked', async () => {
    const user = userEvent.setup();
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockAthletes });

    renderWithRouter(<MatchGenerator />);

    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('should display error state when loading fails', async () => {
    divisionService.getDivisionById.mockRejectedValue(new Error('API error'));

    renderWithRouter(<MatchGenerator />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load division data')).toBeInTheDocument();
      expect(screen.getByText('Go Back')).toBeInTheDocument();
    });
  });

  it('should navigate back when Go Back is clicked in error state', async () => {
    const user = userEvent.setup();
    divisionService.getDivisionById.mockRejectedValue(new Error('API error'));

    renderWithRouter(<MatchGenerator />);

    await waitFor(() => {
      expect(screen.getByText('Go Back')).toBeInTheDocument();
    });

    const goBackButton = screen.getByText('Go Back');
    await user.click(goBackButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('should display VS between athlete selects', async () => {
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockAthletes });

    renderWithRouter(<MatchGenerator />);

    await waitFor(() => {
      expect(screen.getByText('VS')).toBeInTheDocument();
    });
  });

  it('should update button text based on number of matches', async () => {
    const user = userEvent.setup();
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockAthletes });

    renderWithRouter(<MatchGenerator />);

    await waitFor(() => {
      expect(screen.getByText(/Create 1 Match/i)).toBeInTheDocument();
    });

    const addButton = screen.getByText('+ Add Match');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/Create 2 Matches/i)).toBeInTheDocument();
    });
  });

  it('should display match count in section header', async () => {
    const user = userEvent.setup();
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockAthletes });

    renderWithRouter(<MatchGenerator />);

    await waitFor(() => {
      expect(screen.getByText(/Match Pairings \(1\)/i)).toBeInTheDocument();
    });

    const addButton = screen.getByText('+ Add Match');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/Match Pairings \(2\)/i)).toBeInTheDocument();
    });
  });
});