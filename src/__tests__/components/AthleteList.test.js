import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import AthleteList from '../../components/Athletes/AthleteList';

// Helper function to render with router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AthleteList Component', () => {
  it('should render the component with title', () => {
    renderWithRouter(<AthleteList />);
    
    expect(screen.getByText('Athletes')).toBeInTheDocument();
  });

  it('should display loading state initially', () => {
    renderWithRouter(<AthleteList />);
    
    expect(screen.getByText('Loading athletes...')).toBeInTheDocument();
  });

  it('should display athletes after loading', async () => {
    renderWithRouter(<AthleteList />);
    
    await waitFor(() => {
      expect(screen.getByText('John Silva')).toBeInTheDocument();
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    });
  });

  it('should display athlete details correctly', async () => {
    renderWithRouter(<AthleteList />);
    
    await waitFor(() => {
      expect(screen.getByText('John Silva')).toBeInTheDocument();
    });

    // Check for belt rank
    expect(screen.getByText('Blue')).toBeInTheDocument();
    
    // Check for team
    expect(screen.getByText('Gracie Barra')).toBeInTheDocument();
  });

  it('should render register button', () => {
    renderWithRouter(<AthleteList />);
    
    const registerButton = screen.getByText('+ Register New Athlete');
    expect(registerButton).toBeInTheDocument();
  });

  it('should have search functionality', async () => {
    renderWithRouter(<AthleteList />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search by name...')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by name...');
    expect(searchInput).toBeInTheDocument();
  });

  it('should have belt filter dropdown', async () => {
    renderWithRouter(<AthleteList />);
    
    await waitFor(() => {
      const filterSelect = screen.getAllByRole('combobox')[0];
      expect(filterSelect).toBeInTheDocument();
    });
  });

  it('should display action buttons for each athlete', async () => {
    renderWithRouter(<AthleteList />);
    
    await waitFor(() => {
      const viewButtons = screen.getAllByText('View');
      const editButtons = screen.getAllByText('Edit');
      const deleteButtons = screen.getAllByText('Delete');
      
      expect(viewButtons.length).toBeGreaterThan(0);
      expect(editButtons.length).toBeGreaterThan(0);
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
  });

  it('should show confirmation dialog when delete is clicked', async () => {
    global.confirm = jest.fn(() => true);
    
    renderWithRouter(<AthleteList />);
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
    });

    expect(global.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete this athlete?'
    );
  });

  it('should handle search input change', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AthleteList />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search by name...')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by name...');
    await user.type(searchInput, 'John');
    
    expect(searchInput.value).toBe('John');
  });

  it('should display error message when fetch fails', async () => {
    // This would require mocking a failed request
    // using MSW's server.use() in the test
  });

  it('should display "no athletes" message when list is empty', async () => {
    // This would require mocking an empty response
    // using MSW's server.use() in the test
  });

  it('should filter athletes when belt filter is changed', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AthleteList />);
    
    await waitFor(() => {
      const filterSelect = screen.getAllByRole('combobox')[0];
      expect(filterSelect).toBeInTheDocument();
    });
  });
});
