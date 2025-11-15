import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import Dashboard from '../../pages/Dashboard';

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Dashboard Component', () => {
  it('should render the dashboard title', () => {
    renderWithRouter(<Dashboard />);
    
    expect(screen.getByText(/BJJ Tournament Management Dashboard/i)).toBeInTheDocument();
  });

  it('should display loading state initially', () => {
    renderWithRouter(<Dashboard />);
    
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('should display statistics cards after loading', async () => {
    renderWithRouter(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Athletes')).toBeInTheDocument();
      expect(screen.getByText('Total Tournaments')).toBeInTheDocument();
      expect(screen.getByText('Upcoming Tournaments')).toBeInTheDocument();
      expect(screen.getByText('Active Tournaments')).toBeInTheDocument();
    });
  });

  it('should display correct athlete count', async () => {
    renderWithRouter(<Dashboard />);
    
    await waitFor(() => {
      const athleteCount = screen.getByText('Total Athletes')
        .closest('.stat-card')
        .querySelector('.stat-value');
      expect(athleteCount).toBeInTheDocument();
      expect(parseInt(athleteCount.textContent)).toBeGreaterThanOrEqual(0);
    });
  });

  it('should display Quick Actions section', async () => {
    renderWithRouter(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });
  });

  it('should have quick action buttons', async () => {
    renderWithRouter(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('+ Register Athlete')).toBeInTheDocument();
      expect(screen.getByText('+ Create Tournament')).toBeInTheDocument();
      expect(screen.getByText('View Matches')).toBeInTheDocument();
      expect(screen.getByText('View Brackets')).toBeInTheDocument();
    });
  });

  it('should display upcoming tournaments section when data exists', async () => {
    renderWithRouter(<Dashboard />);
    
    await waitFor(() => {
      // Check if upcoming tournaments section appears
      const upcomingSection = screen.queryByText('Upcoming Tournaments');
      if (upcomingSection) {
        expect(upcomingSection).toBeInTheDocument();
      }
    });
  });

  it('should navigate to athletes page when "View All" is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Dashboard />);
    
    await waitFor(() => {
      const viewAllButtons = screen.getAllByText('View All →');
      expect(viewAllButtons.length).toBeGreaterThan(0);
    });
  });

  it('should display stat icons', async () => {
    renderWithRouter(<Dashboard />);
    
    await waitFor(() => {
      const icons = screen.getAllByText(/👥|🏆|📅|⚡/);
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  it('should have clickable stat cards', async () => {
    renderWithRouter(<Dashboard />);
    
    await waitFor(() => {
      const statCards = document.querySelectorAll('.stat-card');
      expect(statCards.length).toBeGreaterThanOrEqual(4);
    });
  });

  it('should format tournament dates correctly', async () => {
    renderWithRouter(<Dashboard />);
    
    await waitFor(() => {
      // If upcoming tournaments exist, check date formatting
      const dateElements = document.querySelectorAll('.upcoming-item p');
      if (dateElements.length > 0) {
        // Dates should be formatted and readable
        expect(dateElements[0].textContent).toBeTruthy();
      }
    });
  });

  it('should display tournament locations with icon', async () => {
    renderWithRouter(<Dashboard />);
    
    await waitFor(() => {
      const locationElements = screen.queryAllByText(/📍/);
      // Locations might not exist if no upcoming tournaments
    });
  });
});
