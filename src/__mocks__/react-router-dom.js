// Mock react-router-dom for Jest tests
const actual = jest.requireActual('react-router-dom');

module.exports = {
  ...actual,
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => jest.fn(),
  useParams: () => ({}),
  useLocation: () => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
  }),
};