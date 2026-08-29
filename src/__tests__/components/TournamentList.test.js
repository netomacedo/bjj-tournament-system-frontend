import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TournamentList from '../../components/Tournaments/TournamentList';
import tournamentService from '../../services/tournamentService';

// Mock services
jest.mock('../../services/tournamentService');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  useNavigate: () => mockNavigate,
}));

describe('TournamentList - Delete/Edit Functionality', () => {
  const mockTournaments = [
    {
      id: 1,
      name: 'Spring Championship 2024',
      description: 'Annual spring tournament',
      location: 'New York',
      tournamentDate: '2024-06-15',
      registrationDeadline: '2024-06-01',
      organizer: 'John Doe',
      status: 'REGISTRATION_OPEN',
    },
    {
      id: 2,
      name: 'Summer Open 2024',
      description: 'Open tournament',
      location: 'Los Angeles',
      tournamentDate: '2024-07-20',
      registrationDeadline: '2024-07-05',
      organizer: 'Jane Smith',
      status: 'REGISTRATION_CLOSED',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    tournamentService.getAllTournaments.mockResolvedValue({ data: mockTournaments });
    global.alert = jest.fn();
    global.confirm = jest.fn();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <TournamentList />
      </BrowserRouter>
    );
  };

  test('should display delete button for each tournament', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText(/🗑️ Delete/i)).toHaveLength(2);
    });
  });

  test('should display edit button for each tournament', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText(/✏️ Edit/i)).toHaveLength(2);
    });
  });

  test('should show confirmation dialog when delete is clicked', async () => {
    global.confirm.mockReturnValue(false);

    renderComponent();

    await waitFor(() => {
      const deleteButtons = screen.getAllByText(/🗑️ Delete/i);
      fireEvent.click(deleteButtons[0]);
    });

    expect(global.confirm).toHaveBeenCalledWith(
      expect.stringContaining('Spring Championship 2024')
    );
    expect(global.confirm).toHaveBeenCalledWith(
      expect.stringContaining('cannot be undone')
    );
  });

  test('should not delete tournament if user cancels', async () => {
    global.confirm.mockReturnValue(false);

    renderComponent();

    await waitFor(() => {
      const deleteButtons = screen.getAllByText(/🗑️ Delete/i);
      fireEvent.click(deleteButtons[0]);
    });

    expect(tournamentService.deleteTournament).not.toHaveBeenCalled();
  });

  test('should delete tournament when confirmed', async () => {
    global.confirm.mockReturnValue(true);
    tournamentService.deleteTournament.mockResolvedValue({});

    renderComponent();

    await waitFor(() => {
      const deleteButtons = screen.getAllByText(/🗑️ Delete/i);
      fireEvent.click(deleteButtons[0]);
    });

    await waitFor(() => {
      expect(tournamentService.deleteTournament).toHaveBeenCalledWith(1);
      expect(global.alert).toHaveBeenCalledWith('Tournament deleted successfully');
    });
  });

  test('should navigate to edit page when edit is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      const editButtons = screen.getAllByText(/✏️ Edit/i);
      fireEvent.click(editButtons[0]);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/tournaments/edit/1');
  });
});
