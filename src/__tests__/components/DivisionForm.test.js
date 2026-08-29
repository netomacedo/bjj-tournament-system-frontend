import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DivisionForm from '../../components/Divisions/DivisionForm';
import divisionService from '../../services/divisionService';

// Mock services
jest.mock('../../services/divisionService');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  useNavigate: () => mockNavigate,
}));

describe('DivisionForm - Edit Mode', () => {
  const mockDivision = {
    id: 1,
    tournamentId: 10,
    name: 'Adult Blue Belt Middleweight',
    beltRank: 'BLUE',
    ageCategory: 'ADULT',
    gender: 'MALE',
    weightClass: 'MIDDLE',
    bracketType: 'SINGLE_ELIMINATION',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.alert = jest.fn();
  });

  const renderCreateMode = () => {
    return render(
      <BrowserRouter>
        <Routes>
          <Route path="/tournaments/:tournamentId/divisions/create" element={<DivisionForm />} />
        </Routes>
      </BrowserRouter>,
      { initialEntries: ['/tournaments/10/divisions/create'] }
    );
  };

  const renderEditMode = () => {
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    
    return render(
      <BrowserRouter>
        <Routes>
          <Route path="/divisions/edit/:divisionId" element={<DivisionForm />} />
        </Routes>
      </BrowserRouter>,
      { wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter> }
    );
  };

  test('should display "Create New Division" in create mode', () => {
    renderCreateMode();
    expect(screen.getByText('Create New Division')).toBeInTheDocument();
  });

  test('should display "Edit Division" in edit mode', async () => {
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });

    render(
      <BrowserRouter initialEntries={['/divisions/edit/1']}>
        <Routes>
          <Route path="/divisions/edit/:divisionId" element={<DivisionForm />} />
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Division')).toBeInTheDocument();
    });
  });

  test('should load and populate form fields in edit mode', async () => {
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });

    render(
      <BrowserRouter initialEntries={['/divisions/edit/1']}>
        <Routes>
          <Route path="/divisions/edit/:divisionId" element={<DivisionForm />} />
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(divisionService.getDivisionById).toHaveBeenCalledWith('1');
    });

    await waitFor(() => {
      const beltSelect = screen.getByLabelText(/Belt Rank/i);
      expect(beltSelect.value).toBe('BLUE');
      
      const ageSelect = screen.getByLabelText(/Age Category/i);
      expect(ageSelect.value).toBe('ADULT');
      
      const genderSelect = screen.getByLabelText(/Gender/i);
      expect(genderSelect.value).toBe('MALE');
    });
  });

  test('should call updateDivision when editing', async () => {
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.updateDivision.mockResolvedValue({ data: {} });

    render(
      <BrowserRouter initialEntries={['/divisions/edit/1']}>
        <Routes>
          <Route path="/divisions/edit/:divisionId" element={<DivisionForm />} />
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Division')).toBeInTheDocument();
    });

    // Submit form
    const submitButton = screen.getByText(/Update Division/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(divisionService.updateDivision).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          beltRank: 'BLUE',
          ageCategory: 'ADULT',
          gender: 'MALE',
        })
      );
    });
  });

  test('should call createDivision in create mode', async () => {
    divisionService.createDivision.mockResolvedValue({ data: {} });

    render(
      <BrowserRouter initialEntries={['/tournaments/10/divisions/create']}>
        <Routes>
          <Route path="/tournaments/:tournamentId/divisions/create" element={<DivisionForm />} />
        </Routes>
      </BrowserRouter>
    );

    // Fill form
    const beltSelect = screen.getByLabelText(/Belt Rank/i);
    fireEvent.change(beltSelect, { target: { value: 'BLUE' } });

    const ageSelect = screen.getByLabelText(/Age Category/i);
    fireEvent.change(ageSelect, { target: { value: 'ADULT' } });

    const genderSelect = screen.getByLabelText(/Gender/i);
    fireEvent.change(genderSelect, { target: { value: 'MALE' } });

    const bracketSelect = screen.getByLabelText(/Bracket Type/i);
    fireEvent.change(bracketSelect, { target: { value: 'SINGLE_ELIMINATION' } });

    // Submit
    const submitButton = screen.getByText(/Create Division/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(divisionService.createDivision).toHaveBeenCalledWith(
        '10',
        expect.objectContaining({
          beltRank: 'BLUE',
          ageCategory: 'ADULT',
          gender: 'MALE',
          bracketType: 'SINGLE_ELIMINATION',
        })
      );
    });
  });

  test('should show success alert after update', async () => {
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.updateDivision.mockResolvedValue({ data: {} });

    render(
      <BrowserRouter initialEntries={['/divisions/edit/1']}>
        <Routes>
          <Route path="/divisions/edit/:divisionId" element={<DivisionForm />} />
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Division')).toBeInTheDocument();
    });

    const submitButton = screen.getByText(/Update Division/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Division updated successfully!');
    });
  });

  test('should show success alert after create', async () => {
    divisionService.createDivision.mockResolvedValue({ data: {} });

    render(
      <BrowserRouter initialEntries={['/tournaments/10/divisions/create']}>
        <Routes>
          <Route path="/tournaments/:tournamentId/divisions/create" element={<DivisionForm />} />
        </Routes>
      </BrowserRouter>
    );

    // Fill and submit
    fireEvent.change(screen.getByLabelText(/Belt Rank/i), { target: { value: 'BLUE' } });
    fireEvent.change(screen.getByLabelText(/Age Category/i), { target: { value: 'ADULT' } });
    fireEvent.change(screen.getByLabelText(/Gender/i), { target: { value: 'MALE' } });
    
    const submitButton = screen.getByText(/Create Division/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Division created successfully!');
    });
  });

  test('should navigate back to tournament after successful save', async () => {
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.updateDivision.mockResolvedValue({ data: {} });

    render(
      <BrowserRouter initialEntries={['/divisions/edit/1']}>
        <Routes>
          <Route path="/divisions/edit/:divisionId" element={<DivisionForm />} />
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Division')).toBeInTheDocument();
    });

    const submitButton = screen.getByText(/Update Division/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/tournaments/10');
    });
  });

  test('should show error message when update fails', async () => {
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.updateDivision.mockRejectedValue({
      response: { data: { message: 'Cannot update division with active matches' } },
    });

    render(
      <BrowserRouter initialEntries={['/divisions/edit/1']}>
        <Routes>
          <Route path="/divisions/edit/:divisionId" element={<DivisionForm />} />
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Division')).toBeInTheDocument();
    });

    const submitButton = screen.getByText(/Update Division/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Cannot update division with active matches/i)).toBeInTheDocument();
    });
  });

  test('should show "Updating Division..." while submitting in edit mode', async () => {
    divisionService.getDivisionById.mockResolvedValue({ data: mockDivision });
    divisionService.updateDivision.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <BrowserRouter initialEntries={['/divisions/edit/1']}>
        <Routes>
          <Route path="/divisions/edit/:divisionId" element={<DivisionForm />} />
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Division')).toBeInTheDocument();
    });

    const submitButton = screen.getByText(/Update Division/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Updating Division...')).toBeInTheDocument();
    });
  });

  test('should show "Creating Division..." while submitting in create mode', async () => {
    divisionService.createDivision.mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter initialEntries={['/tournaments/10/divisions/create']}>
        <Routes>
          <Route path="/tournaments/:tournamentId/divisions/create" element={<DivisionForm />} />
        </Routes>
      </BrowserRouter>
    );

    // Fill form
    fireEvent.change(screen.getByLabelText(/Belt Rank/i), { target: { value: 'BLUE' } });
    fireEvent.change(screen.getByLabelText(/Age Category/i), { target: { value: 'ADULT' } });
    fireEvent.change(screen.getByLabelText(/Gender/i), { target: { value: 'MALE' } });

    const submitButton = screen.getByText(/Create Division/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Creating Division...')).toBeInTheDocument();
    });
  });
});
