import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WeatherStation } from '../widgets/WeatherStation';

const { setWeatherLocation, useAppStore } = vi.hoisted(() => ({
  setWeatherLocation: vi.fn(),
  useAppStore: vi.fn(() => ({
    weatherLocation: '',
    setWeatherLocation: vi.fn(),
  })),
}));

vi.mock('../store', () => ({
  useAppStore,
}));

describe('WeatherStation', () => {
  beforeEach(() => {
    setWeatherLocation.mockReset();
    useAppStore.mockReturnValue({
      weatherLocation: '',
      setWeatherLocation,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

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

  it('does not refetch while typing in local input', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        current_condition: [
          { temp_C: '12', weatherDesc: [{ value: 'Cloudy' }], humidity: '70', windspeedKmph: '12' },
        ],
        nearest_area: [{ areaName: [{ value: 'Tokyo' }], country: [{ value: 'Japan' }] }],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    useAppStore.mockReturnValue({
      weatherLocation: 'Tokyo',
      setWeatherLocation,
    });

    render(<WeatherStation />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const input = screen.getByPlaceholderText(/City or Postcode/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Oslo' } });
    expect(input.value).toBe('Oslo');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
