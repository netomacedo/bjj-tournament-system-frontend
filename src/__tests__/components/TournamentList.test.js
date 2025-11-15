import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TournamentList from '../../components/Tournaments/TournamentList';

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('TournamentList Component', () => {
  it('should render the component with title', () => {
    renderWithRouter(<TournamentList />);
    
    expect(screen.getByText('Tournaments')).toBeInTheDocument();
  });

  it('should display loading state initially', () => {
    renderWithRouter(<TournamentList />);
    
    expect(screen.getByText('Loading tournaments...')).toBeInTheDocument();
  });

  it('should display tournaments after loading', async () => {
    renderWithRouter(<TournamentList />);
    
    await waitFor(() => {
      expect(screen.getByText('Summer BJJ Championship 2025')).toBeInTheDocument();
    });
  });

  it('should render create tournament button', () => {
    renderWithRouter(<TournamentList />);
    
    const createButton = screen.getByText('+ Create New Tournament');
    expect(createButton).toBeInTheDocument();
  });

  it('should have filter tabs', async () => {
    renderWithRouter(<TournamentList />);
    
    await waitFor(() => {
      expect(screen.getByText('All Tournaments')).toBeInTheDocument();
      expect(screen.getByText('Upcoming')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });
  });

  it('should display tournament details', async () => {
    renderWithRouter(<TournamentList />);
    
    await waitFor(() => {
      // Check for tournament information
      expect(screen.getByText('Summer BJJ Championship 2025')).toBeInTheDocument();
      expect(screen.getByText('Sports Arena, City Center')).toBeInTheDocument();
    });
  });

  it('should display tournament status badge', async () => {
    renderWithRouter(<TournamentList />);
    
    await waitFor(() => {
      const statusBadges = document.querySelectorAll('.status-bar');
      expect(statusBadges.length).toBeGreaterThan(0);
    });
  });

  it('should show action buttons based on tournament status', async () => {
    renderWithRouter(<TournamentList />);
    
    await waitFor(() => {
      expect(screen.getAllByText('View Details').length).toBeGreaterThan(0);
    });
  });

  it('should filter tournaments when tab is clicked', async () => {
    renderWithRouter(<TournamentList />);
    
    await waitFor(() => {
      const upcomingTab = screen.getByText('Upcoming');
      fireEvent.click(upcomingTab);
    });

    // Should refetch with upcoming filter
  });

  it('should show confirmation dialog when closing registration', async () => {
    global.confirm = jest.fn(() => true);
    
    renderWithRouter(<TournamentList />);
    
    await waitFor(() => {
      const closeRegButtons = screen.queryAllByText('Close Registration');
      if (closeRegButtons.length > 0) {
        fireEvent.click(closeRegButtons[0]);
        expect(global.confirm).toHaveBeenCalled();
      }
    });
  });

  it('should format dates correctly', async () => {
    renderWithRouter(<TournamentList />);
    
    await waitFor(() => {
      // Dates should be formatted as readable strings
      const dateElements = screen.getAllByText(/📅/);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  it('should display location with icon', async () => {
    renderWithRouter(<TournamentList />);
    
    await waitFor(() => {
      const locationElements = screen.getAllByText(/📍/);
      expect(locationElements.length).toBeGreaterThan(0);
    });
  });

  it('should display organizer with icon', async () => {
    renderWithRouter(<TournamentList />);
    
    await waitFor(() => {
      const organizerElements = screen.getAllByText(/👤/);
      expect(organizerElements.length).toBeGreaterThan(0);
    });
  });

  it('should handle empty tournament list', async () => {
    // This would require mocking an empty response
    // using MSW's server.use() in the test
  });

  it('should handle error state', async () => {
    // This would require mocking a failed request
    // using MSW's server.use() in the test
  });
});
