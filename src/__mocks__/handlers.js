import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8080/api';

// Mock data
const mockAthletes = [
  {
    id: 1,
    name: 'John Silva',
    dateOfBirth: '1995-06-15',
    gender: 'MALE',
    beltRank: 'BLUE',
    weight: 75.5,
    team: 'Gracie Barra',
    coachName: 'Master Carlos',
    email: 'john.silva@email.com',
    phone: '+1234567890'
  },
  {
    id: 2,
    name: 'Maria Santos',
    dateOfBirth: '1998-03-20',
    gender: 'FEMALE',
    beltRank: 'PURPLE',
    weight: 58.0,
    team: 'Alliance',
    coachName: 'Professor Ana',
    email: 'maria.santos@email.com',
    phone: '+0987654321'
  }
];

const mockTournaments = [
  {
    id: 1,
    name: 'Summer BJJ Championship 2025',
    description: 'Annual summer tournament',
    location: 'Sports Arena, City Center',
    tournamentDate: '2025-07-15',
    registrationDeadline: '2025-07-01',
    organizer: 'Local BJJ Federation',
    contactEmail: 'info@bjjfed.com',
    status: 'REGISTRATION_OPEN'
  },
  {
    id: 2,
    name: 'Winter Open 2025',
    description: 'Winter championship',
    location: 'Convention Center',
    tournamentDate: '2025-12-10',
    registrationDeadline: '2025-11-25',
    organizer: 'BJJ Association',
    contactEmail: 'contact@bjjassoc.com',
    status: 'DRAFT'
  }
];

const mockMatches = [
  {
    id: 1,
    athlete1Id: 1,
    athlete2Id: 2,
    athlete1Points: 0,
    athlete2Points: 0,
    athlete1Advantages: 0,
    athlete2Advantages: 0,
    status: 'PENDING',
    divisionId: 1
  }
];

export const handlers = [
  // Athlete endpoints
  http.get(`${BASE_URL}/athletes`, () => {
    return HttpResponse.json(mockAthletes);
  }),

  http.get(`${BASE_URL}/athletes/:id`, ({ params }) => {
    const { id } = params;
    const athlete = mockAthletes.find(a => a.id === parseInt(id));
    if (athlete) {
      return HttpResponse.json(athlete);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.post(`${BASE_URL}/athletes`, async ({ request }) => {
    const newAthlete = await request.json();
    const athleteWithId = { ...newAthlete, id: mockAthletes.length + 1 };
    mockAthletes.push(athleteWithId);
    return HttpResponse.json(athleteWithId, { status: 201 });
  }),

  http.put(`${BASE_URL}/athletes/:id`, async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json();
    const index = mockAthletes.findIndex(a => a.id === parseInt(id));
    if (index !== -1) {
      mockAthletes[index] = { ...mockAthletes[index], ...updates };
      return HttpResponse.json(mockAthletes[index]);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.delete(`${BASE_URL}/athletes/:id`, ({ params }) => {
    const { id } = params;
    const index = mockAthletes.findIndex(a => a.id === parseInt(id));
    if (index !== -1) {
      mockAthletes.splice(index, 1);
      return new HttpResponse(null, { status: 204 });
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.get(`${BASE_URL}/athletes/belt/:beltRank`, ({ params }) => {
    const { beltRank } = params;
    const filtered = mockAthletes.filter(a => a.beltRank === beltRank);
    return HttpResponse.json(filtered);
  }),

  http.get(`${BASE_URL}/athletes/search`, ({ request }) => {
    const url = new URL(request.url);
    const name = url.searchParams.get('name');
    const filtered = mockAthletes.filter(a => 
      a.name.toLowerCase().includes(name.toLowerCase())
    );
    return HttpResponse.json(filtered);
  }),

  // Tournament endpoints
  http.get(`${BASE_URL}/tournaments`, () => {
    return HttpResponse.json(mockTournaments);
  }),

  http.get(`${BASE_URL}/tournaments/:id`, ({ params }) => {
    const { id } = params;
    const tournament = mockTournaments.find(t => t.id === parseInt(id));
    if (tournament) {
      return HttpResponse.json(tournament);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.get(`${BASE_URL}/tournaments/upcoming`, () => {
    const upcoming = mockTournaments.filter(t => 
      t.status === 'REGISTRATION_OPEN' || t.status === 'DRAFT'
    );
    return HttpResponse.json(upcoming);
  }),

  http.post(`${BASE_URL}/tournaments`, async ({ request }) => {
    const newTournament = await request.json();
    const tournamentWithId = { 
      ...newTournament, 
      id: mockTournaments.length + 1,
      status: 'DRAFT'
    };
    mockTournaments.push(tournamentWithId);
    return HttpResponse.json(tournamentWithId, { status: 201 });
  }),

  http.put(`${BASE_URL}/tournaments/:id`, async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json();
    const index = mockTournaments.findIndex(t => t.id === parseInt(id));
    if (index !== -1) {
      mockTournaments[index] = { ...mockTournaments[index], ...updates };
      return HttpResponse.json(mockTournaments[index]);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.post(`${BASE_URL}/tournaments/:id/start`, ({ params }) => {
    const { id } = params;
    const index = mockTournaments.findIndex(t => t.id === parseInt(id));
    if (index !== -1) {
      mockTournaments[index].status = 'IN_PROGRESS';
      return HttpResponse.json(mockTournaments[index]);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.post(`${BASE_URL}/tournaments/:id/close-registration`, ({ params }) => {
    const { id } = params;
    const index = mockTournaments.findIndex(t => t.id === parseInt(id));
    if (index !== -1) {
      mockTournaments[index].status = 'REGISTRATION_CLOSED';
      return HttpResponse.json(mockTournaments[index]);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // Match endpoints
  http.get(`${BASE_URL}/matches/:id`, ({ params }) => {
    const { id } = params;
    const match = mockMatches.find(m => m.id === parseInt(id));
    if (match) {
      return HttpResponse.json(match);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.put(`${BASE_URL}/matches/:id`, async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json();
    const index = mockMatches.findIndex(m => m.id === parseInt(id));
    if (index !== -1) {
      mockMatches[index] = { ...mockMatches[index], ...updates };
      return HttpResponse.json(mockMatches[index]);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.post(`${BASE_URL}/matches/:id/start`, ({ params }) => {
    const { id } = params;
    const index = mockMatches.findIndex(m => m.id === parseInt(id));
    if (index !== -1) {
      mockMatches[index].status = 'IN_PROGRESS';
      return HttpResponse.json(mockMatches[index]);
    }
    return new HttpResponse(null, { status: 404 });
  }),
];
