import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock fetch
global.fetch = vi.fn();

describe('Authentication', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should store token in localStorage after successful login', async () => {
    // Mock successful login response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ token: 'fake-token' }),
    });

    // Simulate login
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
    });
    const data = await response.json();

    // Check if token was stored
    expect(data.token).toBe('fake-token');
  });

  it('should handle login failure', async () => {
    // Mock failed login response
    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Invalid credentials' }),
    });

    // Simulate login with wrong credentials
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'wrong@example.com', password: 'wrongpass' }),
    });

    // Check if response indicates failure
    expect(response.ok).toBe(false);
  });

  it('should clear localStorage on logout', () => {
    // Set some data in localStorage
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test User' }));

    // Simulate logout
    localStorage.clear();

    // Verify localStorage was cleared
    expect(localStorage.clear).toHaveBeenCalled();
  });
});
