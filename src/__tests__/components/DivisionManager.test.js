import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DivisionManager from '../../components/Divisions/DivisionManager';
import divisionService from '../../services/divisionService';

// Mock services
jest.mock('../../services/divisionService');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  useNavigate: () => mockNavigate,
}));

describe('DivisionManager - Delete/Edit Functionality', () => {
  const mockDivisions = [
    {
      id: 1,
      name: 'Adult Blue Belt Middleweight',
      beltRank: 'BLUE',
      ageCategory: 'ADULT',
      gender: 'MALE',
      weightClass: 'MIDDLE',
      bracketType: 'SINGLE_ELIMINATION',
      athleteCount: 8,
      matchesGenerated: false,
      completed: false,
    },
    {
      id: 2,
      name: 'Adult Purple Belt Lightweight',
      beltRank: 'PURPLE',
      ageCategory: 'ADULT',
      gender: 'FEMALE',
      weightClass: 'LIGHT',
      bracketType: 'SINGLE_ELIMINATION',
      athleteCount: 4,
      matchesGenerated: true,
      completed: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    divisionService.getTournamentDivisions.mockResolvedValue({ data: mockDivisions });
  });

  const renderComponent = (tournamentId = '1') => {
    return render(
      <BrowserRouter>
        <DivisionManager tournamentId={tournamentId} />
      </BrowserRouter>
    );
  };

  test('should display edit button when division is expanded', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Adult Blue Belt Middleweight')).toBeInTheDocument();
    });

    // Expand first division
    fireEvent.click(screen.getByText('Adult Blue Belt Middleweight'));

    await waitFor(() => {
      expect(screen.getByText(/✏️ Edit/i)).toBeInTheDocument();
    });
  });

  test('should display delete button when division is expanded', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Adult Blue Belt Middleweight')).toBeInTheDocument();
    });

    // Expand first division
    fireEvent.click(screen.getByText('Adult Blue Belt Middleweight'));

    await waitFor(() => {
      expect(screen.getByText(/🗑️ Delete/i)).toBeInTheDocument();
    });
  });

  test('should navigate to edit page when edit is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Adult Blue Belt Middleweight')).toBeInTheDocument();
    });

    // Expand first division
    fireEvent.click(screen.getByText('Adult Blue Belt Middleweight'));

    // Click edit
    const editButton = await screen.findByText(/✏️ Edit/i);
    fireEvent.click(editButton);

    expect(mockNavigate).toHaveBeenCalledWith('/divisions/edit/1');
  });

  test('should show confirmation modal when delete is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Adult Blue Belt Middleweight')).toBeInTheDocument();
    });

    // Expand first division
    fireEvent.click(screen.getByText('Adult Blue Belt Middleweight'));

    // Click delete
    const deleteButton = await screen.findByText(/🗑️ Delete/i);
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('Delete Division')).toBeInTheDocument();
      expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
    });
  });

  test('should delete division when confirmed in modal', async () => {
    divisionService.deleteDivision.mockResolvedValue({});
    
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Adult Blue Belt Middleweight')).toBeInTheDocument();
    });

    // Expand first division
    fireEvent.click(screen.getByText('Adult Blue Belt Middleweight'));

    // Click delete
    const deleteButton = await screen.findByText(/🗑️ Delete/i);
    fireEvent.click(deleteButton);

    // Confirm in modal
    await waitFor(() => {
      expect(screen.getByText('Delete Division')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Delete Division');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(divisionService.deleteDivision).toHaveBeenCalledWith(1);
    });
  });

  test('should show success message after delete', async () => {
    divisionService.deleteDivision.mockResolvedValue({});
    
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Adult Blue Belt Middleweight')).toBeInTheDocument();
    });

    // Expand and delete
    fireEvent.click(screen.getByText('Adult Blue Belt Middleweight'));
    const deleteButton = await screen.findByText(/🗑️ Delete/i);
    fireEvent.click(deleteButton);

    // Confirm
    const confirmButton = await screen.findByText('Delete Division');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText('Division deleted successfully!')).toBeInTheDocument();
    });
  });

  test('should show error message when delete fails', async () => {
    divisionService.deleteDivision.mockRejectedValue({
      response: { data: { message: 'Cannot delete division with matches' } },
    });
    
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Adult Blue Belt Middleweight')).toBeInTheDocument();
    });

    // Expand and delete
    fireEvent.click(screen.getByText('Adult Blue Belt Middleweight'));
    const deleteButton = await screen.findByText(/🗑️ Delete/i);
    fireEvent.click(deleteButton);

    // Confirm
    const confirmButton = await screen.findByText('Delete Division');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/Cannot delete division with matches/i)).toBeInTheDocument();
    });
  });

  test('should refresh divisions after successful delete', async () => {
    divisionService.deleteDivision.mockResolvedValue({});
    
    renderComponent();

    // Initial load
    await waitFor(() => {
      expect(divisionService.getTournamentDivisions).toHaveBeenCalledTimes(1);
    });

    // Expand and delete
    fireEvent.click(screen.getByText('Adult Blue Belt Middleweight'));
    const deleteButton = await screen.findByText(/🗑️ Delete/i);
    fireEvent.click(deleteButton);

    // Confirm delete
    const confirmButton = await screen.findByText('Delete Division');
    fireEvent.click(confirmButton);

    // Click OK on success message
    await waitFor(() => {
      expect(screen.getByText('Division deleted successfully!')).toBeInTheDocument();
    });

    const okButton = screen.getByText('OK');
    fireEvent.click(okButton);

    // Should reload divisions
    await waitFor(() => {
      expect(divisionService.getTournamentDivisions).toHaveBeenCalledTimes(2);
    });
  });
});
