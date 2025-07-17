// HomeScreen tests
import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import HomeScreen from '../HomeScreen';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

// Mock ApiService
jest.mock('../../services/ApiService', () => ({
  getUserData: jest.fn().mockResolvedValue({ username: 'testuser' }),
  trackUserAction: jest.fn().mockResolvedValue({ success: true }),
}));

const renderWithProvider = (component) => {
  return render(
    <PaperProvider>
      {component}
    </PaperProvider>
  );
};

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly', () => {
    const { getByText } = renderWithProvider(
      <HomeScreen navigation={mockNavigation} />
    );

    expect(getByText('Quick Actions')).toBeTruthy();
    expect(getByText('Your Activity')).toBeTruthy();
  });

  test('displays welcome message', () => {
    const { getByText } = renderWithProvider(
      <HomeScreen navigation={mockNavigation} />
    );

    expect(getByText(/Welcome back/)).toBeTruthy();
  });

  test('shows quick action buttons', () => {
    const { getByText } = renderWithProvider(
      <HomeScreen navigation={mockNavigation} />
    );

    expect(getByText('Start Chat')).toBeTruthy();
    expect(getByText('Generate Image')).toBeTruthy();
    expect(getByText('Voice Command')).toBeTruthy();
    expect(getByText('Process File')).toBeTruthy();
  });

  test('displays activity statistics', () => {
    const { getByText } = renderWithProvider(
      <HomeScreen navigation={mockNavigation} />
    );

    expect(getByText('Chats')).toBeTruthy();
    expect(getByText('Images')).toBeTruthy();
    expect(getByText('Files')).toBeTruthy();
    expect(getByText('Voice')).toBeTruthy();
  });
});
