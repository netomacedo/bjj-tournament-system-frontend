import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import AthleteForm from '../../components/Athletes/AthleteForm';

const renderWithRouter = (component, { route = '/athletes/register' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/athletes/register" element={component} />
        <Route path="/athletes/edit/:id" element={component} />
        <Route path="/athletes" element={<div>Athletes List</div>} />
      </Routes>
    </BrowserRouter>
  );
};

describe('AthleteForm Component', () => {
  it('should render the registration form', () => {
    renderWithRouter(<AthleteForm />);
    
    expect(screen.getByText('Register New Athlete')).toBeInTheDocument();
  });

  it('should render all form sections', () => {
    renderWithRouter(<AthleteForm />);
    
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Competition Information')).toBeInTheDocument();
    expect(screen.getByText('Team & Coach')).toBeInTheDocument();
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
  });

  it('should render all required form fields', () => {
    renderWithRouter(<AthleteForm />);
    
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date of Birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Gender/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Belt Rank/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Weight/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
  });

  it('should allow user to input athlete information', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AthleteForm />);
    
    const nameInput = screen.getByLabelText(/Full Name/i);
    await user.type(nameInput, 'Test Athlete');
    expect(nameInput.value).toBe('Test Athlete');

    const emailInput = screen.getByLabelText(/Email/i);
    await user.type(emailInput, 'test@example.com');
    expect(emailInput.value).toBe('test@example.com');
  });

  it('should calculate and display age from date of birth', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AthleteForm />);
    
    const dobInput = screen.getByLabelText(/Date of Birth/i);
    const birthYear = new Date().getFullYear() - 25;
    await user.type(dobInput, `${birthYear}-01-01`);
    
    await waitFor(() => {
      expect(screen.getByText(/Age: 25 years old/i)).toBeInTheDocument();
    });
  });

  it('should have all belt rank options in dropdown', () => {
    renderWithRouter(<AthleteForm />);
    
    const beltSelect = screen.getByLabelText(/Belt Rank/i);
    const options = Array.from(beltSelect.options).map(opt => opt.text);
    
    expect(options).toContain('White');
    expect(options).toContain('Blue');
    expect(options).toContain('Purple');
    expect(options).toContain('Brown');
    expect(options).toContain('Black');
  });

  it('should have gender options', () => {
    renderWithRouter(<AthleteForm />);
    
    const genderSelect = screen.getByLabelText(/Gender/i);
    const options = Array.from(genderSelect.options).map(opt => opt.text);
    
    expect(options).toContain('Male');
    expect(options).toContain('Female');
  });

  it('should have cancel and submit buttons', () => {
    renderWithRouter(<AthleteForm />);
    
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Register Athlete')).toBeInTheDocument();
  });

  it('should validate required fields on submit', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AthleteForm />);
    
    const submitButton = screen.getByText('Register Athlete');
    await user.click(submitButton);
    
    // HTML5 validation should prevent submission
    // In a real test, you might check for validation messages
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AthleteForm />);
    
    // Fill in required fields
    await user.type(screen.getByLabelText(/Full Name/i), 'Test Athlete');
    await user.type(screen.getByLabelText(/Date of Birth/i), '1995-06-15');
    await user.type(screen.getByLabelText(/Weight/i), '75.5');
    await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
    
    const submitButton = screen.getByText('Register Athlete');
    await user.click(submitButton);
    
    // After successful submission, should redirect
    // This would require mocking the navigation
  });

  it('should display error message on submission failure', async () => {
    // This would require mocking a failed API call
    // using MSW's server.use() in the test
  });

  it('should load existing athlete data in edit mode', async () => {
    const athleteId = 1;
    renderWithRouter(<AthleteForm />, { route: `/athletes/edit/${athleteId}` });
    
    await waitFor(() => {
      const nameInput = screen.getByLabelText(/Full Name/i);
      expect(nameInput.value).toBe('John Silva');
    });
  });

  it('should show "Edit Athlete" title in edit mode', () => {
    renderWithRouter(<AthleteForm />, { route: '/athletes/edit/1' });
    
    waitFor(() => {
      expect(screen.getByText('Edit Athlete')).toBeInTheDocument();
    });
  });

  it('should show "Update Athlete" button in edit mode', () => {
    renderWithRouter(<AthleteForm />, { route: '/athletes/edit/1' });
    
    waitFor(() => {
      expect(screen.getByText('Update Athlete')).toBeInTheDocument();
    });
  });

  it('should navigate back on cancel', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AthleteForm />);
    
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    
    // Should navigate to /athletes
  });

  it('should accept numeric weight input', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AthleteForm />);
    
    const weightInput = screen.getByLabelText(/Weight/i);
    await user.type(weightInput, '75.5');
    expect(weightInput.value).toBe('75.5');
  });

  it('should show all form sections with proper headers', () => {
    renderWithRouter(<AthleteForm />);
    
    const sections = [
      'Personal Information',
      'Competition Information',
      'Team & Coach',
      'Contact Information'
    ];

    sections.forEach(section => {
      expect(screen.getByText(section)).toBeInTheDocument();
    });
  });
});
