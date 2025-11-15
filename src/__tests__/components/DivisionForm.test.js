import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import DivisionForm from '../../components/Divisions/DivisionForm';
import divisionService from '../../services/divisionService';

// Mock the divisionService
jest.mock('../../services/divisionService');

// Mock useParams and useNavigate
const mockNavigate = jest.fn();
const mockTournamentId = '1';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ tournamentId: mockTournamentId }),
  useNavigate: () => mockNavigate,
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('DivisionForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render the form with all required fields', () => {
    renderWithRouter(<DivisionForm />);

    expect(screen.getByText('Create New Division')).toBeInTheDocument();
    expect(screen.getByLabelText(/Belt Rank/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Age Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Gender/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Weight Class/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bracket Type/i)).toBeInTheDocument();
  });

  it('should have Cancel button that navigates back to tournament', async () => {
    const user = userEvent.setup();
    renderWithRouter(<DivisionForm />);

    const cancelButtons = screen.getAllByText('Cancel');
    await user.click(cancelButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/tournaments/1');
  });

  it('should display Division Validation Rules', () => {
    renderWithRouter(<DivisionForm />);

    expect(screen.getByText('Division Validation Rules:')).toBeInTheDocument();
    expect(screen.getByText(/Belt rank must match enrolled athletes/i)).toBeInTheDocument();
    expect(screen.getByText(/Duplicate divisions/i)).toBeInTheDocument();
  });

  it('should have default bracket type as SINGLE_ELIMINATION', () => {
    renderWithRouter(<DivisionForm />);

    const bracketTypeSelect = screen.getByLabelText(/Bracket Type/i);
    expect(bracketTypeSelect.value).toBe('SINGLE_ELIMINATION');
  });

  it('should update form data when fields are changed', async () => {
    const user = userEvent.setup();
    renderWithRouter(<DivisionForm />);

    const beltSelect = screen.getByLabelText(/Belt Rank/i);
    const ageSelect = screen.getByLabelText(/Age Category/i);
    const genderSelect = screen.getByLabelText(/Gender/i);

    await user.selectOptions(beltSelect, 'BLUE');
    await user.selectOptions(ageSelect, 'ADULT');
    await user.selectOptions(genderSelect, 'MALE');

    expect(beltSelect.value).toBe('BLUE');
    expect(ageSelect.value).toBe('ADULT');
    expect(genderSelect.value).toBe('MALE');
  });

  it('should enable weight class dropdown when gender is selected', async () => {
    const user = userEvent.setup();
    renderWithRouter(<DivisionForm />);

    const weightClassSelect = screen.getByLabelText(/Weight Class/i);
    expect(weightClassSelect).toBeDisabled();

    const genderSelect = screen.getByLabelText(/Gender/i);
    await user.selectOptions(genderSelect, 'MALE');

    expect(weightClassSelect).not.toBeDisabled();
  });

  it('should disable weight class dropdown when gender is NOT_APPLICABLE', async () => {
    const user = userEvent.setup();
    renderWithRouter(<DivisionForm />);

    const genderSelect = screen.getByLabelText(/Gender/i);
    await user.selectOptions(genderSelect, 'NOT_APPLICABLE');

    const weightClassSelect = screen.getByLabelText(/Weight Class/i);
    expect(weightClassSelect).toBeDisabled();
    expect(screen.getByText(/Weight classes not applicable for kids under 10/i)).toBeInTheDocument();
  });

  it('should update weight class options when gender is MALE', async () => {
    const user = userEvent.setup();
    renderWithRouter(<DivisionForm />);

    const genderSelect = screen.getByLabelText(/Gender/i);
    await user.selectOptions(genderSelect, 'MALE');

    const weightClassSelect = screen.getByLabelText(/Weight Class/i);

    // Should have male weight classes
    expect(weightClassSelect.querySelectorAll('option').length).toBeGreaterThan(1);
  });

  it('should update weight class options when gender is FEMALE', async () => {
    const user = userEvent.setup();
    renderWithRouter(<DivisionForm />);

    const genderSelect = screen.getByLabelText(/Gender/i);
    await user.selectOptions(genderSelect, 'FEMALE');

    const weightClassSelect = screen.getByLabelText(/Weight Class/i);

    // Should have female weight classes
    expect(weightClassSelect.querySelectorAll('option').length).toBeGreaterThan(1);
  });

  it('should clear weight class when changing from valid gender to empty', async () => {
    const user = userEvent.setup();
    renderWithRouter(<DivisionForm />);

    const genderSelect = screen.getByLabelText(/Gender/i);
    const weightClassSelect = screen.getByLabelText(/Weight Class/i);

    // Select gender and weight class
    await user.selectOptions(genderSelect, 'MALE');
    await user.selectOptions(weightClassSelect, 'LIGHT');

    // Change gender to empty
    await user.selectOptions(genderSelect, '');

    expect(weightClassSelect.value).toBe('');
  });

  it('should show validation error when submitting with missing required fields', async () => {
    const user = userEvent.setup();
    renderWithRouter(<DivisionForm />);

    const submitButton = screen.getByText('Create Division');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument();
    });

    expect(divisionService.createDivision).not.toHaveBeenCalled();
  });

  it('should successfully create division when all required fields are filled', async () => {
    const user = userEvent.setup();
    divisionService.createDivision.mockResolvedValue({
      data: {
        id: 1,
        name: 'Adult Male Blue Belt Medium Heavy'
      }
    });

    renderWithRouter(<DivisionForm />);

    // Fill in all required fields
    await user.selectOptions(screen.getByLabelText(/Belt Rank/i), 'BLUE');
    await user.selectOptions(screen.getByLabelText(/Age Category/i), 'ADULT');
    await user.selectOptions(screen.getByLabelText(/Gender/i), 'MALE');
    await user.selectOptions(screen.getByLabelText(/Bracket Type/i), 'SINGLE_ELIMINATION');

    const submitButton = screen.getByText('Create Division');
    await user.click(submitButton);

    await waitFor(() => {
      expect(divisionService.createDivision).toHaveBeenCalledWith('1', {
        beltRank: 'BLUE',
        ageCategory: 'ADULT',
        gender: 'MALE',
        weightClass: '',
        bracketType: 'SINGLE_ELIMINATION'
      });
    });

    expect(window.alert).toHaveBeenCalledWith('Division created successfully!');
    expect(mockNavigate).toHaveBeenCalledWith('/tournaments/1');
  });

  it('should create division with weight class when specified', async () => {
    const user = userEvent.setup();
    divisionService.createDivision.mockResolvedValue({
      data: {
        id: 1,
        name: 'Adult Male Blue Belt Medium Heavy'
      }
    });

    renderWithRouter(<DivisionForm />);

    // Fill in all fields including weight class
    await user.selectOptions(screen.getByLabelText(/Belt Rank/i), 'BLUE');
    await user.selectOptions(screen.getByLabelText(/Age Category/i), 'ADULT');
    await user.selectOptions(screen.getByLabelText(/Gender/i), 'MALE');
    await user.selectOptions(screen.getByLabelText(/Weight Class/i), 'MEDIUM_HEAVY');
    await user.selectOptions(screen.getByLabelText(/Bracket Type/i), 'DOUBLE_ELIMINATION');

    const submitButton = screen.getByText('Create Division');
    await user.click(submitButton);

    await waitFor(() => {
      expect(divisionService.createDivision).toHaveBeenCalledWith('1', {
        beltRank: 'BLUE',
        ageCategory: 'ADULT',
        gender: 'MALE',
        weightClass: 'MEDIUM_HEAVY',
        bracketType: 'DOUBLE_ELIMINATION'
      });
    });
  });

  it('should display loading state when submitting', async () => {
    const user = userEvent.setup();
    divisionService.createDivision.mockImplementation(() =>
      new Promise(resolve => setTimeout(resolve, 100))
    );

    renderWithRouter(<DivisionForm />);

    // Fill in required fields
    await user.selectOptions(screen.getByLabelText(/Belt Rank/i), 'BLUE');
    await user.selectOptions(screen.getByLabelText(/Age Category/i), 'ADULT');
    await user.selectOptions(screen.getByLabelText(/Gender/i), 'MALE');

    const submitButton = screen.getByText('Create Division');
    await user.click(submitButton);

    expect(screen.getByText('Creating Division...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('should display error message when division creation fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Division already exists for this category';

    divisionService.createDivision.mockRejectedValue({
      response: {
        data: { message: errorMessage }
      }
    });

    renderWithRouter(<DivisionForm />);

    // Fill in required fields
    await user.selectOptions(screen.getByLabelText(/Belt Rank/i), 'BLUE');
    await user.selectOptions(screen.getByLabelText(/Age Category/i), 'ADULT');
    await user.selectOptions(screen.getByLabelText(/Gender/i), 'MALE');

    const submitButton = screen.getByText('Create Division');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should display generic error message when error response has no message', async () => {
    const user = userEvent.setup();

    divisionService.createDivision.mockRejectedValue(new Error('Network error'));

    renderWithRouter(<DivisionForm />);

    // Fill in required fields
    await user.selectOptions(screen.getByLabelText(/Belt Rank/i), 'BLUE');
    await user.selectOptions(screen.getByLabelText(/Age Category/i), 'ADULT');
    await user.selectOptions(screen.getByLabelText(/Gender/i), 'MALE');

    const submitButton = screen.getByText('Create Division');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to create division')).toBeInTheDocument();
    });
  });

  it('should have all belt rank options available', () => {
    renderWithRouter(<DivisionForm />);

    const beltSelect = screen.getByLabelText(/Belt Rank/i);
    const options = beltSelect.querySelectorAll('option');

    // Should have default option + all belt ranks (19 + 1)
    expect(options.length).toBeGreaterThan(15);
    expect(options[0].value).toBe('');
    expect(options[0].textContent).toBe('Select Belt Rank');
  });

  it('should have all age category options available', () => {
    renderWithRouter(<DivisionForm />);

    const ageSelect = screen.getByLabelText(/Age Category/i);
    const options = ageSelect.querySelectorAll('option');

    // Should have default option + all age categories (14 + 1)
    expect(options.length).toBeGreaterThan(10);
    expect(options[0].value).toBe('');
    expect(options[0].textContent).toBe('Select Age Category');
  });

  it('should have all bracket type options available', () => {
    renderWithRouter(<DivisionForm />);

    const bracketSelect = screen.getByLabelText(/Bracket Type/i);
    const options = bracketSelect.querySelectorAll('option');

    // Should have 3 bracket types
    expect(options.length).toBe(3);
  });

  it('should handle form submission with Enter key', async () => {
    const user = userEvent.setup();
    divisionService.createDivision.mockResolvedValue({
      data: { id: 1 }
    });

    renderWithRouter(<DivisionForm />);

    // Fill in required fields
    await user.selectOptions(screen.getByLabelText(/Belt Rank/i), 'BLUE');
    await user.selectOptions(screen.getByLabelText(/Age Category/i), 'ADULT');
    await user.selectOptions(screen.getByLabelText(/Gender/i), 'MALE');

    const form = screen.getByLabelText(/Belt Rank/i).closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(divisionService.createDivision).toHaveBeenCalled();
    });
  });

  it('should show optional label for weight class when gender is selected', async () => {
    const user = userEvent.setup();
    renderWithRouter(<DivisionForm />);

    const genderSelect = screen.getByLabelText(/Gender/i);
    await user.selectOptions(genderSelect, 'MALE');

    expect(screen.getByText(/Weight Class \(Optional\)/i)).toBeInTheDocument();
  });

  it('should not show optional label for weight class when gender is NOT_APPLICABLE', async () => {
    const user = userEvent.setup();
    renderWithRouter(<DivisionForm />);

    const genderSelect = screen.getByLabelText(/Gender/i);
    await user.selectOptions(genderSelect, 'NOT_APPLICABLE');

    expect(screen.queryByText(/Weight Class \(Optional\)/i)).not.toBeInTheDocument();
  });
});