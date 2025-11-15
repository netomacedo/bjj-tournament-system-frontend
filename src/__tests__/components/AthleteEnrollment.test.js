import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import AthleteEnrollment from '../../components/Divisions/AthleteEnrollment';
import divisionService from '../../services/divisionService';
import athleteService from '../../services/athleteService';

// Mock services
jest.mock('../../services/divisionService');
jest.mock('../../services/athleteService');

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

describe('AthleteEnrollment Component', () => {
  const mockDivision = {
    id: 1,
    name: 'Adult Male Blue Belt Medium Heavy',
    beltRank: 'BLUE',
    ageCategory: 'ADULT',
    gender: 'MALE',
    weightClass: 'MEDIUM_HEAVY'
  };

  const mockEnrolledAthletes = [
    {
      id: 1,
      name: 'John Doe',
      beltRank: 'BLUE',
      weight: 82.5,
      gender: 'MALE',
      dateOfBirth: '1995-05-15',
      team: 'Team Alpha'
    },
    {
      id: 2,
      name: 'Jane Smith',
      beltRank: 'BLUE',
      weight: 80.0,
      gender: 'MALE',
      dateOfBirth: '1998-03-20',
      team: 'Team Beta'
    }
  ];

  const mockAvailableAthletes = [
    {
      id: 3,
      name: 'Bob Johnson',
      beltRank: 'BLUE',
      weight: 85.0,
      gender: 'MALE',
      dateOfBirth: '1996-07-10',
      team: 'Team Gamma',
      email: 'bob@example.com'
    },
    {
      id: 4,
      name: 'Alice Williams',
      beltRank: 'BLUE',
      weight: 78.0,
      gender: 'MALE',
      dateOfBirth: '1997-11-25',
      team: 'Team Delta',
      email: 'alice@example.com'
    }
  ];

  const mockAllAthletes = [...mockEnrolledAthletes, ...mockAvailableAthletes];

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
    athleteService.getAllAthletes.mockReturnValue(new Promise(() => {}));

    renderWithRouter(<AthleteEnrollment />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render division name and athlete sections after loading', async () => {
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockEnrolledAthletes });
    athleteService.getAllAthletes.mockResolvedValue({ data: mockAllAthletes });

    renderWithRouter(<AthleteEnrollment />);

    await waitFor(() => {
      expect(screen.getByText('Manage Athletes')).toBeInTheDocument();
      expect(screen.getByText('Adult Male Blue Belt Medium Heavy')).toBeInTheDocument();
      expect(screen.getByText(/Enrolled Athletes \(2\)/)).toBeInTheDocument();
      expect(screen.getByText(/Available Athletes \(2\)/)).toBeInTheDocument();
    });
  });

  it('should display enrolled athletes correctly', async () => {
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockEnrolledAthletes });
    athleteService.getAllAthletes.mockResolvedValue({ data: mockAllAthletes });

    renderWithRouter(<AthleteEnrollment />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('82.5 kg')).toBeInTheDocument();
      expect(screen.getByText('Team: Team Alpha')).toBeInTheDocument();
    });
  });

  it('should display available athletes correctly', async () => {
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockEnrolledAthletes });
    athleteService.getAllAthletes.mockResolvedValue({ data: mockAllAthletes });

    renderWithRouter(<AthleteEnrollment />);

    await waitFor(() => {
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      expect(screen.getByText('Alice Williams')).toBeInTheDocument();
      expect(screen.getByText('85 kg')).toBeInTheDocument();
      expect(screen.getByText('Team: Team Gamma')).toBeInTheDocument();
    });
  });

  it('should not display enrolled athletes in available section', async () => {
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockEnrolledAthletes });
    athleteService.getAllAthletes.mockResolvedValue({ data: mockAllAthletes });

    renderWithRouter(<AthleteEnrollment />);

    await waitFor(() => {
      const availableSection = screen.getByText(/Available Athletes/).closest('.available-section');
      expect(availableSection).toBeInTheDocument();
      expect(availableSection.textContent).not.toContain('John Doe');
      expect(availableSection.textContent).not.toContain('Jane Smith');
    });
  });

  it('should filter athletes by name when searching', async () => {
    const user = userEvent.setup();
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockEnrolledAthletes });
    athleteService.getAllAthletes.mockResolvedValue({ data: mockAllAthletes });

    renderWithRouter(<AthleteEnrollment />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search by name/)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by name/);
    await user.type(searchInput, 'Bob');

    await waitFor(() => {
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      expect(screen.queryByText('Alice Williams')).not.toBeInTheDocument();
    });
  });

  it('should filter athletes by team when searching', async () => {
    const user = userEvent.setup();
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockEnrolledAthletes });
    athleteService.getAllAthletes.mockResolvedValue({ data: mockAllAthletes });

    renderWithRouter(<AthleteEnrollment />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search by name/)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by name/);
    await user.type(searchInput, 'Gamma');

    await waitFor(() => {
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      expect(screen.queryByText('Alice Williams')).not.toBeInTheDocument();
    });
  });

  it('should filter athletes by email when searching', async () => {
    const user = userEvent.setup();
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockEnrolledAthletes });
    athleteService.getAllAthletes.mockResolvedValue({ data: mockAllAthletes });

    renderWithRouter(<AthleteEnrollment />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search by name/)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by name/);
    await user.type(searchInput, 'alice@example.com');

    await waitFor(() => {
      expect(screen.getByText('Alice Williams')).toBeInTheDocument();
      expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
    });
  });

  it('should show "No athletes match your search" when search has no results', async () => {
    const user = userEvent.setup();
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockEnrolledAthletes });
    athleteService.getAllAthletes.mockResolvedValue({ data: mockAllAthletes });

    renderWithRouter(<AthleteEnrollment />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search by name/)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by name/);
    await user.type(searchInput, 'NonexistentAthlete');

    await waitFor(() => {
      expect(screen.getByText('No athletes match your search')).toBeInTheDocument();
    });
  });

  it('should clear filter when search is cleared', async () => {
    const user = userEvent.setup();
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockEnrolledAthletes });
    athleteService.getAllAthletes.mockResolvedValue({ data: mockAllAthletes });

    renderWithRouter(<AthleteEnrollment />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search by name/)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by name/);
    await user.type(searchInput, 'Bob');

    await waitFor(() => {
      expect(screen.queryByText('Alice Williams')).not.toBeInTheDocument();
    });

    await user.clear(searchInput);

    await waitFor(() => {
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      expect(screen.getByText('Alice Williams')).toBeInTheDocument();
    });
  });

  it('should enroll an athlete when Enroll button is clicked', async () => {
    const user = userEvent.setup();
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockEnrolledAthletes });
    athleteService.getAllAthletes.mockResolvedValue({ data: mockAllAthletes });
    divisionService.enrollAthlete.mockResolvedValue({});

    renderWithRouter(<AthleteEnrollment />);

    await waitFor(() => {
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    const availableSection = screen.getByText('Bob Johnson').closest('.athlete-card');
    const enrollButton = availableSection.querySelector('.btn-primary');

    await user.click(enrollButton);

    await waitFor(() => {
      expect(divisionService.enrollAthlete).toHaveBeenCalledWith('1', 3);
    });
  });

  it('should remove an athlete when Remove button is clicked and confirmed', async () => {
    const user = userEvent.setup();
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockEnrolledAthletes });
    athleteService.getAllAthletes.mockResolvedValue({ data: mockAllAthletes });
    divisionService.removeAthlete.mockResolvedValue({});

    renderWithRouter(<AthleteEnrollment />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const enrolledSection = screen.getByText('John Doe').closest('.athlete-card');
    const removeButton = enrolledSection.querySelector('.btn-danger');

    await user.click(removeButton);

    expect(window.confirm).toHaveBeenCalledWith('Remove this athlete from the division?');

    await waitFor(() => {
      expect(divisionService.removeAthlete).toHaveBeenCalledWith('1', 1);
    });
  });

  it('should not remove athlete when cancel is clicked on confirmation', async () => {
    const user = userEvent.setup();
    window.confirm = jest.fn(() => false);
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockEnrolledAthletes });
    athleteService.getAllAthletes.mockResolvedValue({ data: mockAllAthletes });

    renderWithRouter(<AthleteEnrollment />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const enrolledSection = screen.getByText('John Doe').closest('.athlete-card');
    const removeButton = enrolledSection.querySelector('.btn-danger');

    await user.click(removeButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(divisionService.removeAthlete).not.toHaveBeenCalled();
  });

  it('should show alert when enrollment fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Athlete does not meet division requirements';
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockEnrolledAthletes });
    athleteService.getAllAthletes.mockResolvedValue({ data: mockAllAthletes });
    divisionService.enrollAthlete.mockRejectedValue({
      response: { data: { message: errorMessage } }
    });

    renderWithRouter(<AthleteEnrollment />);

    await waitFor(() => {
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    const availableSection = screen.getByText('Bob Johnson').closest('.athlete-card');
    const enrollButton = availableSection.querySelector('.btn-primary');

    await user.click(enrollButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to enroll athlete: ' + errorMessage);
    });
  });

  it('should show alert when removal fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Cannot remove athlete with scheduled matches';
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockEnrolledAthletes });
    athleteService.getAllAthletes.mockResolvedValue({ data: mockAllAthletes });
    divisionService.removeAthlete.mockRejectedValue({
      response: { data: { message: errorMessage } }
    });

    renderWithRouter(<AthleteEnrollment />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const enrolledSection = screen.getByText('John Doe').closest('.athlete-card');
    const removeButton = enrolledSection.querySelector('.btn-danger');

    await user.click(removeButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to remove athlete: ' + errorMessage);
    });
  });

  it('should display empty state when no athletes are enrolled', async () => {
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: [] });
    athleteService.getAllAthletes.mockResolvedValue({ data: mockAvailableAthletes });

    renderWithRouter(<AthleteEnrollment />);

    await waitFor(() => {
      expect(screen.getByText('No athletes enrolled yet')).toBeInTheDocument();
    });
  });

  it('should display empty state when no athletes are available', async () => {
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockAllAthletes });
    athleteService.getAllAthletes.mockResolvedValue({ data: mockAllAthletes });

    renderWithRouter(<AthleteEnrollment />);

    await waitFor(() => {
      expect(screen.getByText('No available athletes')).toBeInTheDocument();
    });
  });

  it('should navigate back when Back button is clicked', async () => {
    const user = userEvent.setup();
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockEnrolledAthletes });
    athleteService.getAllAthletes.mockResolvedValue({ data: mockAllAthletes });

    renderWithRouter(<AthleteEnrollment />);

    await waitFor(() => {
      expect(screen.getByText('Back')).toBeInTheDocument();
    });

    const backButton = screen.getByText('Back');
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('should display error state when loading fails', async () => {
    divisionService.getDivisionById.mockRejectedValue(new Error('API error'));

    renderWithRouter(<AthleteEnrollment />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load division and athletes')).toBeInTheDocument();
      expect(screen.getByText('Go Back')).toBeInTheDocument();
    });
  });

  it('should navigate back when "Go Back" button is clicked in error state', async () => {
    const user = userEvent.setup();
    divisionService.getDivisionById.mockRejectedValue(new Error('API error'));

    renderWithRouter(<AthleteEnrollment />);

    await waitFor(() => {
      expect(screen.getByText('Go Back')).toBeInTheDocument();
    });

    const goBackButton = screen.getByText('Go Back');
    await user.click(goBackButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('should calculate athlete age correctly', async () => {
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockEnrolledAthletes });
    athleteService.getAllAthletes.mockResolvedValue({ data: mockAllAthletes });

    renderWithRouter(<AthleteEnrollment />);

    await waitFor(() => {
      // Should display ages based on dateOfBirth
      const ageElements = screen.getAllByText(/\d+ years/);
      expect(ageElements.length).toBeGreaterThan(0);
    });
  });

  it('should display experience notes when available', async () => {
    const athletesWithNotes = [
      ...mockAvailableAthletes.slice(0, 1),
      {
        ...mockAvailableAthletes[1],
        experienceNotes: 'Competition experience: 5 tournaments'
      }
    ];

    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockEnrolledAthletes });
    athleteService.getAllAthletes.mockResolvedValue({ data: [...mockEnrolledAthletes, ...athletesWithNotes] });

    renderWithRouter(<AthleteEnrollment />);

    await waitFor(() => {
      expect(screen.getByText('Competition experience: 5 tournaments')).toBeInTheDocument();
    });
  });

  it('should refresh data after successful enrollment', async () => {
    const user = userEvent.setup();
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.getDivisionAthletes.mockResolvedValue({ data: mockEnrolledAthletes });
    athleteService.getAllAthletes.mockResolvedValue({ data: mockAllAthletes });
    divisionService.enrollAthlete.mockResolvedValue({});

    renderWithRouter(<AthleteEnrollment />);

    await waitFor(() => {
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    const availableSection = screen.getByText('Bob Johnson').closest('.athlete-card');
    const enrollButton = availableSection.querySelector('.btn-primary');

    await user.click(enrollButton);

    await waitFor(() => {
      // fetchData should be called again (initial + after enroll)
      expect(divisionService.getDivisionById).toHaveBeenCalledTimes(2);
      expect(divisionService.getDivisionAthletes).toHaveBeenCalledTimes(2);
      expect(athleteService.getAllAthletes).toHaveBeenCalledTimes(2);
    });
  });
});