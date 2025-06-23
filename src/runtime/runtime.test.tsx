import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Link } from './components/Link';
import { useRouter } from './hooks/useRouter';

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
};

describe('Runtime: <Link />', () => {
  it('should render a link and navigate on click', async () => {
    render(
      <MemoryRouter initialEntries={['/start']}>
        <Link href="/target">Go to Target</Link>
        <LocationDisplay />
      </MemoryRouter>
    );

    expect(screen.getByTestId('location-display')).toHaveTextContent('/start');

    const link = screen.getByRole('link', { name: /go to target/i });
    expect(link).toHaveAttribute('href', '/target');

    await userEvent.click(link);

    expect(screen.getByTestId('location-display')).toHaveTextContent('/target');
  });
});

describe('Runtime: useRouter()', () => {
  const RouterTester = () => {
    const router = useRouter();
    return (
      <div>
        <div data-testid="pathname">{router.pathname}</div>
        <div data-testid="params">{JSON.stringify(router.params)}</div>
        <button onClick={() => router.push('/new-page')}>Go to New Page</button>
      </div>
    );
  };

  it('should return correct pathname and params', () => {
    const route = '/users/123';
    render(
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/users/:id" element={<RouterTester />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('pathname')).toHaveTextContent(route);
    expect(screen.getByTestId('params')).toHaveTextContent(JSON.stringify({ id: '123' }));
  });

  it('should navigate when push() is called', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<RouterTester />} />
          <Route path="/new-page" element={<div>Navigated</div>} />
        </Routes>
      </MemoryRouter>
    );
    
    const button = screen.getByRole('button', { name: /go to new page/i });
    await userEvent.click(button);

    expect(screen.getByText('Navigated')).toBeInTheDocument();
  });
});