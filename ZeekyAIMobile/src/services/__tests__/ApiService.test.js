// ApiService tests
import ApiService from '../ApiService';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    post: jest.fn(),
    get: jest.fn(),
  })),
}));

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize with correct base URL in development', () => {
    expect(ApiService).toBeDefined();
    expect(ApiService.baseURL).toBeDefined();
  });

  test('should handle error correctly', () => {
    const mockError = {
      response: {
        status: 400,
        data: { message: 'Bad request' }
      }
    };

    const result = ApiService.handleError(mockError);
    
    expect(result).toEqual({
      message: 'Bad request',
      status: 400,
      data: { message: 'Bad request' }
    });
  });

  test('should handle network error correctly', () => {
    const mockError = {
      request: {}
    };

    const result = ApiService.handleError(mockError);
    
    expect(result).toEqual({
      message: 'Network error - please check your connection',
      status: 0,
      data: null
    });
  });

  test('should handle unknown error correctly', () => {
    const mockError = {
      message: 'Unknown error'
    };

    const result = ApiService.handleError(mockError);
    
    expect(result).toEqual({
      message: 'Unknown error',
      status: -1,
      data: null
    });
  });
});
