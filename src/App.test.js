import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// Helper: login as coach and return rendered screen
function loginAsCoach() {
  render(<App />);
  fireEvent.change(screen.getByPlaceholderText(/ahmet\.antrenor/i), {
    target: { value: 'arap.metin' },
  });
  fireEvent.change(screen.getByPlaceholderText('••••••••'), {
    target: { value: 'Enva@2024' },
  });
  fireEvent.click(screen.getByText('Giriş Yap →'));
}

test('renders login page with ENVA branding', () => {
  render(<App />);
  expect(screen.getByText(/PENTATLON SPORCU TAKİBİ/i)).toBeInTheDocument();
});

test('renders login form with username and password inputs', () => {
  render(<App />);
  expect(screen.getByPlaceholderText(/ahmet\.antrenor/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
});

test('shows error message on invalid login', () => {
  render(<App />);
  fireEvent.click(screen.getByText('Giriş Yap →'));
  expect(screen.getByText(/kullanıcı adı veya şifre hatalı/i)).toBeInTheDocument();
});

test('role selector switches between coach and parent', () => {
  render(<App />);
  fireEvent.click(screen.getByText('Veli'));
  expect(screen.getByPlaceholderText(/fatma\.yilmaz/i)).toBeInTheDocument();
});

test('coach can login and sees coach name in header', () => {
  loginAsCoach();
  // name appears in header badge and on dash page — both should be present
  const matches = screen.getAllByText(/Arap Metin Yıldız/i);
  expect(matches.length).toBeGreaterThan(0);
});

test('Athletes page renders without crash after login', () => {
  loginAsCoach();
  const navLinks = screen.getAllByText(/Sporcular/i);
  fireEvent.click(navLinks[0]);
  // list heading contains "Sporcular" and count in a child span
  const heading = screen.getAllByText(/Sporcular/i);
  expect(heading.length).toBeGreaterThan(0);
  // search input proves list view rendered
  expect(screen.getByPlaceholderText(/İsimle ara/i)).toBeInTheDocument();
});

test('Reports individual view renders without crash', () => {
  loginAsCoach();
  const navLinks = screen.getAllByText('Analiz');
  fireEvent.click(navLinks[0]);
  expect(screen.getByText('Gelişim Analizi')).toBeInTheDocument();
});

test('Reports comparison view renders without crash', () => {
  loginAsCoach();
  const navLinks = screen.getAllByText('Analiz');
  fireEvent.click(navLinks[0]);
  // switch to comparison tab
  fireEvent.click(screen.getByText(/Karşılaştırma/i));
  // chip section heading is unique within comparison
  expect(screen.getByText(/tıkla ekle\/çıkar/i)).toBeInTheDocument();
});
