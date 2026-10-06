import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AthleteForm from '../../components/Athletes/AthleteForm';
import athleteService from '../../services/athleteService';

jest.mock('../../services/athleteService');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({}),
}));

describe('AthleteForm - Simplified Version', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderForm = () => {
    return render(
      <BrowserRouter>
        <AthleteForm />
      </BrowserRouter>
    );
  };

  test('renders simplified form with only essential fields', () => {
    renderForm();

    // Check essential fields are present
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Age/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Gender/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Belt Rank/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Weight/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Team\/Academy/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Coach Name/i)).toBeInTheDocument();

    // Check removed fields are NOT present
    expect(screen.queryByLabelText(/Date of Birth/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Email/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Phone/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Experience Notes/i)).not.toBeInTheDocument();
  });

  test('shows default values for team and coach', () => {
    renderForm();

    const teamInput = screen.getByLabelText(/Team\/Academy/i);
    const coachInput = screen.getByLabelText(/Coach Name/i);

    expect(teamInput.value).toBe('Takedown Martial Arts');
    expect(coachInput.value).toBe('Pedro Monteiro');
  });

  test('submits form with minimal required fields', async () => {
    athleteService.registerAthlete.mockResolvedValue({
      data: {
        id: 1,
        name: 'Test Athlete',
        age: 10,
        team: 'Takedown Martial Arts',
        coachName: 'Pedro Monteiro',
      }
    });

    renderForm();

    // Fill in required fields only
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: 'Test Athlete' }
    });
    fireEvent.change(screen.getByLabelText(/Age/i), {
      target: { value: '10' }
    });
    fireEvent.change(screen.getByLabelText(/Weight/i), {
      target: { value: '35.5' }
    });

    // Submit form
    fireEvent.click(screen.getByText(/Register Athlete/i));

    await waitFor(() => {
      expect(athleteService.registerAthlete).toHaveBeenCalledWith({
        name: 'Test Athlete',
        age: 10,
        gender: 'MALE',
        beltRank: 'WHITE',
        weight: 35.5,
        team: 'Takedown Martial Arts',
        coachName: 'Pedro Monteiro',
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith('/athletes');
  });

  test('accepts age input between 4 and 150', () => {
    renderForm();

    const ageInput = screen.getByLabelText(/Age/i);

    expect(ageInput).toHaveAttribute('type', 'number');
    expect(ageInput).toHaveAttribute('min', '4');
    expect(ageInput).toHaveAttribute('max', '150');
  });

  test('shows helper text for team and coach defaults', () => {
    renderForm();

    expect(screen.getByText(/Default: Takedown Martial Arts/i)).toBeInTheDocument();
    expect(screen.getByText(/Default: Pedro Monteiro/i)).toBeInTheDocument();
  });

  test('allows custom team and coach values', async () => {
    athleteService.registerAthlete.mockResolvedValue({ data: { id: 1 } });

    renderForm();

    // Change default values
    fireEvent.change(screen.getByLabelText(/Team\/Academy/i), {
      target: { value: 'Gracie Barra' }
    });
    fireEvent.change(screen.getByLabelText(/Coach Name/i), {
      target: { value: 'John Danaher' }
    });

    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: 'Custom Athlete' }
    });
    fireEvent.change(screen.getByLabelText(/Age/i), {
      target: { value: '12' }
    });
    fireEvent.change(screen.getByLabelText(/Weight/i), {
      target: { value: '40' }
    });

    fireEvent.click(screen.getByText(/Register Athlete/i));

    await waitFor(() => {
      expect(athleteService.registerAthlete).toHaveBeenCalledWith(
        expect.objectContaining({
          team: 'Gracie Barra',
          coachName: 'John Danaher',
        })
      );
    });
  });
});
