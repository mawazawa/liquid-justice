import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  triggerHaptic,
  cancelHaptic,
  isHapticsSupported,
  getHapticPreference,
  setHapticPreference,
} from './haptics';

describe('Haptics', () => {
  let vibrateMock: ReturnType<typeof vi.fn>;
  let matchMediaMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Setup vibrate mock
    vibrateMock = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      writable: true,
      value: vibrateMock,
    });

    // Setup matchMedia mock (simulate mobile device)
    matchMediaMock = vi.fn().mockImplementation((query) => ({
      matches: query === '(hover: none)', // True for mobile
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });

    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('triggerHaptic', () => {
    it('triggers light haptic pattern', () => {
      triggerHaptic('light');
      expect(vibrateMock).toHaveBeenCalledWith(10);
    });

    it('triggers medium haptic pattern', () => {
      triggerHaptic('medium');
      expect(vibrateMock).toHaveBeenCalledWith(15);
    });

    it('triggers heavy haptic pattern', () => {
      triggerHaptic('heavy');
      expect(vibrateMock).toHaveBeenCalledWith(25);
    });

    it('triggers success haptic pattern', () => {
      triggerHaptic('success');
      expect(vibrateMock).toHaveBeenCalledWith([10, 50, 10]);
    });

    it('triggers error haptic pattern', () => {
      triggerHaptic('error');
      expect(vibrateMock).toHaveBeenCalledWith([25, 50, 25]);
    });

    it('triggers selection haptic pattern', () => {
      triggerHaptic('selection');
      expect(vibrateMock).toHaveBeenCalledWith(5);
    });

    it('respects enabled flag', () => {
      triggerHaptic('medium', { enabled: false });
      expect(vibrateMock).not.toHaveBeenCalled();
    });

    it('respects localStorage preference when disabled', () => {
      localStorage.setItem('haptics-enabled', 'false');
      triggerHaptic('medium');
      expect(vibrateMock).not.toHaveBeenCalled();
    });

    it('triggers when localStorage preference is enabled', () => {
      localStorage.setItem('haptics-enabled', 'true');
      triggerHaptic('medium');
      expect(vibrateMock).toHaveBeenCalled();
    });

    it('triggers by default when no preference is set', () => {
      triggerHaptic('medium');
      expect(vibrateMock).toHaveBeenCalled();
    });

    it('does not crash when vibration fails', () => {
      vibrateMock.mockImplementation(() => {
        throw new Error('Vibration failed');
      });

      expect(() => triggerHaptic('medium')).not.toThrow();
    });

    it('does not trigger on desktop devices', () => {
      // Mock desktop (has hover capability)
      matchMediaMock.mockImplementation((query) => ({
        matches: query !== '(hover: none)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      triggerHaptic('medium');
      expect(vibrateMock).not.toHaveBeenCalled();
    });
  });

  describe('cancelHaptic', () => {
    it('cancels ongoing vibration', () => {
      cancelHaptic();
      expect(vibrateMock).toHaveBeenCalledWith(0);
    });

    it('does not crash when cancel fails', () => {
      vibrateMock.mockImplementation(() => {
        throw new Error('Cancel failed');
      });

      expect(() => cancelHaptic()).not.toThrow();
    });
  });

  describe('isHapticsSupported', () => {
    it('returns true on mobile devices with vibration API', () => {
      expect(isHapticsSupported()).toBe(true);
    });

    it('returns false on desktop devices', () => {
      matchMediaMock.mockImplementation((query) => ({
        matches: query !== '(hover: none)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      // Need to clear the cache by resetting the module
      expect(isHapticsSupported()).toBe(false);
    });

    it('returns false when vibrate is not available', () => {
      Object.defineProperty(navigator, 'vibrate', {
        writable: true,
        value: undefined,
      });

      expect(isHapticsSupported()).toBe(false);
    });
  });

  describe('getHapticPreference', () => {
    it('returns true by default', () => {
      expect(getHapticPreference()).toBe(true);
    });

    it('returns false when preference is disabled', () => {
      localStorage.setItem('haptics-enabled', 'false');
      expect(getHapticPreference()).toBe(false);
    });

    it('returns true when preference is enabled', () => {
      localStorage.setItem('haptics-enabled', 'true');
      expect(getHapticPreference()).toBe(true);
    });
  });

  describe('setHapticPreference', () => {
    it('saves enabled preference', () => {
      setHapticPreference(true);
      expect(localStorage.getItem('haptics-enabled')).toBe('true');
    });

    it('saves disabled preference', () => {
      setHapticPreference(false);
      expect(localStorage.getItem('haptics-enabled')).toBe('false');
    });

    it('persists preference across calls', () => {
      setHapticPreference(false);
      expect(getHapticPreference()).toBe(false);

      setHapticPreference(true);
      expect(getHapticPreference()).toBe(true);
    });
  });
});
