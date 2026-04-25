import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GeneralTab } from '../components/SettingsPanel/GeneralTab';
import { AdvancedTab } from '../components/SettingsPanel/AdvancedTab';
import { WidgetsTab } from '../components/SettingsPanel/WidgetsTab';
import { DataTab } from '../components/SettingsPanel/DataTab';

// Use vi.hoisted so these fn refs are available inside vi.mock factory (which is hoisted)
const {
  mockToggleSetting,
  mockSetStartupBehavior,
  mockSetGeminiApiKey,
  mockSetE2bApiKey,
  mockToggleWidget,
  mockSetGlobalState,
} = vi.hoisted(() => ({
  mockToggleSetting: vi.fn(),
  mockSetStartupBehavior: vi.fn(),
  mockSetGeminiApiKey: vi.fn(),
  mockSetE2bApiKey: vi.fn(),
  mockToggleWidget: vi.fn(),
  mockSetGlobalState: vi.fn(),
}));

vi.mock('../store', () => {
  const state = {
    settings: {
      scanlines: true,
      sound: false,
      geminiApiKey: 'test-gemini-key',
      e2bApiKey: 'test-e2b-key',
      startupBehavior: 'restore' as const,
    },
    toggleSetting: mockToggleSetting,
    setStartupBehavior: mockSetStartupBehavior,
    setGeminiApiKey: mockSetGeminiApiKey,
    setE2bApiKey: mockSetE2bApiKey,
    visibleWidgets: ['SYSTEM', 'HELP'],
    toggleWidget: mockToggleWidget,
    setGlobalState: mockSetGlobalState,
  };
  const selectorFn = vi.fn(selector => {
    return typeof selector === 'function' ? selector(state) : state;
  }) as any;
  selectorFn.getState = vi.fn(() => state);
  return { useAppStore: selectorFn };
});

vi.mock('../utils', () => ({
  downloadJson: vi.fn(),
  uploadJson: vi.fn(),
}));

import * as utils from '../utils';

describe('GeneralTab', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the General Settings header', () => {
    render(<GeneralTab />);
    expect(screen.getByText(/General Settings/i)).toBeTruthy();
  });

  it('renders two switch toggles for scanlines and sound', () => {
    render(<GeneralTab />);
    const switches = screen.getAllByRole('switch');
    expect(switches.length).toBe(2);
  });

  it('scanlines switch has aria-checked=true (initial: scanlines=true)', () => {
    render(<GeneralTab />);
    const [scanlinesSwitch] = screen.getAllByRole('switch');
    expect(scanlinesSwitch.getAttribute('aria-checked')).toBe('true');
  });

  it('sound switch has aria-checked=false (initial: sound=false)', () => {
    render(<GeneralTab />);
    const [, soundSwitch] = screen.getAllByRole('switch');
    expect(soundSwitch.getAttribute('aria-checked')).toBe('false');
  });

  it('calls toggleSetting("scanlines") when scanlines toggle is clicked', () => {
    render(<GeneralTab />);
    const [scanlinesSwitch] = screen.getAllByRole('switch');
    fireEvent.click(scanlinesSwitch);
    expect(mockToggleSetting).toHaveBeenCalledWith('scanlines');
  });

  it('calls toggleSetting("sound") when sound toggle is clicked', () => {
    render(<GeneralTab />);
    const [, soundSwitch] = screen.getAllByRole('switch');
    fireEvent.click(soundSwitch);
    expect(mockToggleSetting).toHaveBeenCalledWith('sound');
  });

  it('renders startup behavior section with radio inputs', () => {
    render(<GeneralTab />);
    const radioInputs = screen.getAllByRole('radio');
    expect(radioInputs.length).toBeGreaterThanOrEqual(3);
  });

  it('calls setStartupBehavior when a startup option is selected', () => {
    render(<GeneralTab />);
    const defaultRadio = screen.getByDisplayValue('default');
    fireEvent.click(defaultRadio);
    expect(mockSetStartupBehavior).toHaveBeenCalledWith('default');
  });
});

describe('AdvancedTab', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders Advanced Settings header', () => {
    render(<AdvancedTab />);
    expect(screen.getByText(/Advanced Settings/i)).toBeTruthy();
  });

  it('renders Gemini API Key input with current value', () => {
    render(<AdvancedTab />);
    const geminiInput = screen.getByPlaceholderText(/AIza/i) as HTMLInputElement;
    expect(geminiInput).toBeTruthy();
    expect(geminiInput.value).toBe('test-gemini-key');
  });

  it('renders E2B API Key input with current value', () => {
    render(<AdvancedTab />);
    const e2bInput = screen.getByPlaceholderText(/e2b_/i) as HTMLInputElement;
    expect(e2bInput).toBeTruthy();
    expect(e2bInput.value).toBe('test-e2b-key');
  });

  it('calls setGeminiApiKey when Gemini input changes', () => {
    render(<AdvancedTab />);
    const geminiInput = screen.getByPlaceholderText(/AIza/i);
    fireEvent.change(geminiInput, { target: { value: 'new-gemini-key' } });
    expect(mockSetGeminiApiKey).toHaveBeenCalledWith('new-gemini-key');
  });

  it('calls setE2bApiKey when E2B input changes', () => {
    render(<AdvancedTab />);
    const e2bInput = screen.getByPlaceholderText(/e2b_/i);
    fireEvent.change(e2bInput, { target: { value: 'new-e2b-key' } });
    expect(mockSetE2bApiKey).toHaveBeenCalledWith('new-e2b-key');
  });

  it('renders developer options section', () => {
    render(<AdvancedTab />);
    expect(screen.getByText(/Developer Mode/i)).toBeTruthy();
  });

  it('renders performance metrics section', () => {
    render(<AdvancedTab />);
    expect(screen.getByText(/Bundle Size/i)).toBeTruthy();
    expect(screen.getByText(/Target FPS/i)).toBeTruthy();
  });
});

describe('WidgetsTab', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<WidgetsTab />);
    expect(container).toBeTruthy();
  });

  it('renders Widget Management header', () => {
    render(<WidgetsTab />);
    expect(screen.getByText(/Widget Management/i)).toBeTruthy();
  });

  it('renders widget category names', () => {
    render(<WidgetsTab />);
    // Use queryAllByText to avoid "multiple elements" errors since category names
    // appear both in the tab heading and in the widget list
    expect(document.querySelector('.space-y-6')).toBeTruthy();
    expect(screen.getAllByText(/Productivity/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Developer/i).length).toBeGreaterThan(0);
  });

  it('shows visible widgets with enabled indicator', () => {
    render(<WidgetsTab />);
    // SYSTEM and HELP are in visibleWidgets - their names should appear
    expect(screen.getByText('System Core')).toBeTruthy();
    expect(screen.getByText('Help Desk')).toBeTruthy();
  });

  it('calls toggleWidget when a widget toggle button is clicked', () => {
    render(<WidgetsTab />);
    const toggleBtns = screen.getAllByRole('button');
    fireEvent.click(toggleBtns[0]);
    expect(mockToggleWidget).toHaveBeenCalledOnce();
  });
});

describe('DataTab', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<DataTab />);
    expect(container).toBeTruthy();
  });

  it('renders the Data Management header', () => {
    render(<DataTab />);
    expect(screen.getByText(/Data Management/i)).toBeTruthy();
  });

  it('renders Export Data button', () => {
    render(<DataTab />);
    expect(screen.getByText('Export Data')).toBeTruthy();
  });

  it('renders Import Data button', () => {
    render(<DataTab />);
    expect(screen.getByText('Import Data')).toBeTruthy();
  });

  it('renders Share Layout section', () => {
    render(<DataTab />);
    expect(screen.getByText('Share Layout')).toBeTruthy();
  });

  it('renders Clear All Data section', () => {
    render(<DataTab />);
    expect(screen.getByText(/Danger Zone/i)).toBeTruthy();
  });

  it('calls downloadJson when Export Data button is clicked', () => {
    render(<DataTab />);
    const exportBtn = screen.getByText('Export Data').closest('button')!;
    fireEvent.click(exportBtn);
    expect(vi.mocked(utils.downloadJson)).toHaveBeenCalledOnce();
  });
});
