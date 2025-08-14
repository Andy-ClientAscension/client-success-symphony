import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  announceToScreenReader,
  setFocusToElement,
  getKeyboardShortcut,
  setupFocusTrap,
  hasSufficientContrast
} from '../../../lib/accessibility';

// Mock DOM methods
const mockCreateElement = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockGetElementById = vi.fn();
const mockQuerySelector = vi.fn();
const mockQuerySelectorAll = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  
  // Mock document methods
  Object.defineProperty(document, 'createElement', {
    value: mockCreateElement,
    writable: true
  });
  
  Object.defineProperty(document, 'getElementById', {
    value: mockGetElementById,
    writable: true
  });
  
  Object.defineProperty(document, 'querySelector', {
    value: mockQuerySelector,
    writable: true
  });
  
  Object.defineProperty(document, 'querySelectorAll', {
    value: mockQuerySelectorAll,
    writable: true
  });
  
  Object.defineProperty(document.body, 'appendChild', {
    value: mockAppendChild,
    writable: true
  });
  
  Object.defineProperty(document.body, 'removeChild', {
    value: mockRemoveChild,
    writable: true
  });
});

describe('Accessibility Utilities', () => {
  describe('announceToScreenReader', () => {
    it('should create and manage screen reader announcements', () => {
      const mockElement = {
        setAttribute: vi.fn(),
        textContent: '',
        remove: vi.fn()
      };
      
      mockCreateElement.mockReturnValue(mockElement);
      
      announceToScreenReader('Test message', 'assertive');
      
      expect(mockCreateElement).toHaveBeenCalledWith('div');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'assertive');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-atomic', 'true');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('class', 'sr-only');
      expect(mockElement.textContent).toBe('Test message');
      expect(mockAppendChild).toHaveBeenCalledWith(mockElement);
    });

    it('should use polite priority by default', () => {
      const mockElement = {
        setAttribute: vi.fn(),
        textContent: '',
        remove: vi.fn()
      };
      
      mockCreateElement.mockReturnValue(mockElement);
      
      announceToScreenReader('Default message');
      
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'polite');
    });
  });

  describe('setFocusToElement', () => {
    it('should focus element by ID when found', () => {
      const mockElement = {
        focus: vi.fn(),
        scrollIntoView: vi.fn()
      };
      
      mockGetElementById.mockReturnValue(mockElement);
      
      const result = setFocusToElement('test-id');
      
      expect(mockGetElementById).toHaveBeenCalledWith('test-id');
      expect(mockElement.focus).toHaveBeenCalled();
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center'
      });
      expect(result).toBe(true);
    });

    it('should try common main content IDs when element not found', () => {
      mockGetElementById
        .mockReturnValueOnce(null) // target element not found
        .mockReturnValueOnce(null) // main-content not found
        .mockReturnValueOnce(null) // main not found
        .mockReturnValueOnce({ focus: vi.fn(), scrollIntoView: vi.fn() }); // content found
      
      const result = setFocusToElement('non-existent');
      
      expect(mockGetElementById).toHaveBeenCalledWith('non-existent');
      expect(mockGetElementById).toHaveBeenCalledWith('main-content');
      expect(mockGetElementById).toHaveBeenCalledWith('main');
      expect(mockGetElementById).toHaveBeenCalledWith('content');
      expect(result).toBe(true);
    });

    it('should use fallback selector when provided', () => {
      const mockElement = {
        focus: vi.fn(),
        scrollIntoView: vi.fn()
      };
      
      mockGetElementById.mockReturnValue(null);
      mockQuerySelector.mockReturnValue(mockElement);
      
      const result = setFocusToElement('non-existent', '.fallback');
      
      expect(mockQuerySelector).toHaveBeenCalledWith('.fallback');
      expect(mockElement.focus).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when no element is found', () => {
      mockGetElementById.mockReturnValue(null);
      mockQuerySelector.mockReturnValue(null);
      
      const result = setFocusToElement('non-existent');
      
      expect(result).toBe(false);
    });
  });

  describe('getKeyboardShortcut', () => {
    it('should return Mac shortcuts when on Mac platform', () => {
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        configurable: true
      });
      
      const shortcut = getKeyboardShortcut('s', true);
      
      expect(shortcut).toBe('⌘+S');
    });

    it('should return Windows/Linux shortcuts when not on Mac', () => {
      Object.defineProperty(navigator, 'platform', {
        value: 'Win32',
        configurable: true
      });
      
      const shortcut = getKeyboardShortcut('s', true);
      
      expect(shortcut).toBe('Ctrl+S');
    });

    it('should handle multiple modifiers', () => {
      Object.defineProperty(navigator, 'platform', {
        value: 'Win32',
        configurable: true
      });
      
      const shortcut = getKeyboardShortcut('s', true, true, true);
      
      expect(shortcut).toBe('Ctrl+Shift+Alt+S');
    });
  });

  describe('setupFocusTrap', () => {
    it('should setup focus trap for container', () => {
      const mockContainer = {
        querySelectorAll: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      };
      
      const mockFocusableElements = [
        { focus: vi.fn() },
        { focus: vi.fn() },
        { focus: vi.fn() }
      ];
      
      mockGetElementById.mockReturnValue(mockContainer);
      mockContainer.querySelectorAll.mockReturnValue(mockFocusableElements);
      
      const cleanup = setupFocusTrap('test-container');
      
      expect(mockGetElementById).toHaveBeenCalledWith('test-container');
      expect(mockContainer.querySelectorAll).toHaveBeenCalledWith(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      expect(mockContainer.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      // Test cleanup
      expect(typeof cleanup).toBe('function');
      cleanup();
      expect(mockContainer.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should return null cleanup when container not found', () => {
      mockGetElementById.mockReturnValue(null);
      
      const cleanup = setupFocusTrap('non-existent');
      
      expect(cleanup).toBeNull();
    });
  });

  describe('hasSufficientContrast', () => {
    it('should calculate contrast ratio for colors', () => {
      // Test with high contrast colors
      const highContrast = hasSufficientContrast('#000000', '#ffffff');
      expect(highContrast).toBe(true);
      
      // Test with low contrast colors  
      const lowContrast = hasSufficientContrast('#888888', '#999999');
      expect(lowContrast).toBe(false);
    });

    it('should handle hex color format', () => {
      const result = hasSufficientContrast('#ff0000', '#00ff00');
      expect(typeof result).toBe('boolean');
    });

    it('should handle invalid color input gracefully', () => {
      const result = hasSufficientContrast('invalid', 'invalid');
      expect(typeof result).toBe('boolean');
    });
  });
});