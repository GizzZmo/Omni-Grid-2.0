import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeatherStation } from '../widgets/WeatherStation';

vi.mock('../store', () => ({
  useAppStore: () => ({
    weatherLocation: '',
    setWeatherLocation: vi.fn(),
  }),
}));

describe('WeatherStation', () => {
  it('renders the city search input', () => {
    render(<WeatherStation />);
    expect(screen.getByPlaceholderText(/City or Postcode/i)).toBeTruthy();
  });

  it('renders a search form', () => {
    render(<WeatherStation />);
    const form = document.querySelector('form');
    expect(form).toBeTruthy();
  });

  it('has a search button', () => {
    render(<WeatherStation />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('allows typing a city name', () => {
    render(<WeatherStation />);
    const input = screen.getByPlaceholderText(/City or Postcode/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Oslo' } });
    expect(input.value).toBe('Oslo');
  });

  it('shows location pin icon in input', () => {
    render(<WeatherStation />);
    // MapPin is rendered as an SVG
    const svgIcon = document.querySelector('svg');
    expect(svgIcon).toBeTruthy();
  });
});
