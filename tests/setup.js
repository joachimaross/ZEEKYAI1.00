// Jest Test Setup for Zeeky AI
// Global test configuration and mocks

// Mock browser APIs
global.fetch = jest.fn();
global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};

global.sessionStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};

// Mock Web APIs
global.navigator = {
    userAgent: 'Mozilla/5.0 (Test Environment)',
    language: 'en-US',
    languages: ['en-US', 'en'],
    onLine: true,
    serviceWorker: {
        register: jest.fn().mockResolvedValue({}),
        ready: Promise.resolve({})
    },
    mediaDevices: {
        getUserMedia: jest.fn().mockResolvedValue({})
    },
    clipboard: {
        writeText: jest.fn().mockResolvedValue(),
        readText: jest.fn().mockResolvedValue('')
    }
};

global.location = {
    href: 'http://localhost:3000',
    hostname: 'localhost',
    protocol: 'http:',
    pathname: '/',
    search: '',
    hash: ''
};

global.history = {
    pushState: jest.fn(),
    replaceState: jest.fn(),
    back: jest.fn(),
    forward: jest.fn()
};

// Mock performance API
global.performance = {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    memory: {
        usedJSHeapSize: 1000000,
        totalJSHeapSize: 2000000,
        jsHeapSizeLimit: 4000000
    }
};

// Mock WebRTC
global.RTCPeerConnection = jest.fn().mockImplementation(() => ({
    createOffer: jest.fn().mockResolvedValue({}),
    createAnswer: jest.fn().mockResolvedValue({}),
    setLocalDescription: jest.fn().mockResolvedValue(),
    setRemoteDescription: jest.fn().mockResolvedValue(),
    addIceCandidate: jest.fn().mockResolvedValue(),
    createDataChannel: jest.fn().mockReturnValue({
        send: jest.fn(),
        close: jest.fn(),
        addEventListener: jest.fn()
    }),
    close: jest.fn(),
    addEventListener: jest.fn()
}));

// Mock WebSocket
global.WebSocket = jest.fn().mockImplementation(() => ({
    send: jest.fn(),
    close: jest.fn(),
    addEventListener: jest.fn(),
    readyState: 1 // OPEN
}));

// Mock File API
global.File = jest.fn().mockImplementation((parts, filename, options) => ({
    name: filename,
    size: parts.join('').length,
    type: options?.type || 'text/plain',
    lastModified: Date.now()
}));

global.FileReader = jest.fn().mockImplementation(() => ({
    readAsText: jest.fn(),
    readAsDataURL: jest.fn(),
    addEventListener: jest.fn(),
    result: null
}));

global.Blob = jest.fn().mockImplementation((parts, options) => ({
    size: parts.join('').length,
    type: options?.type || 'text/plain'
}));

// Mock Canvas API
global.HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(),
    putImageData: jest.fn(),
    createImageData: jest.fn(),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    measureText: jest.fn().mockReturnValue({ width: 0 }),
    fillText: jest.fn(),
    strokeText: jest.fn()
});

// Mock Audio API
global.Audio = jest.fn().mockImplementation(() => ({
    play: jest.fn().mockResolvedValue(),
    pause: jest.fn(),
    load: jest.fn(),
    addEventListener: jest.fn(),
    currentTime: 0,
    duration: 0,
    volume: 1
}));

// Mock Speech API
global.SpeechSynthesis = jest.fn().mockImplementation(() => ({
    speak: jest.fn(),
    cancel: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    getVoices: jest.fn().mockReturnValue([])
}));

global.SpeechSynthesisUtterance = jest.fn().mockImplementation((text) => ({
    text: text,
    voice: null,
    volume: 1,
    rate: 1,
    pitch: 1,
    addEventListener: jest.fn()
}));

global.webkitSpeechRecognition = jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    abort: jest.fn(),
    addEventListener: jest.fn(),
    continuous: false,
    interimResults: false,
    lang: 'en-US'
}));

// Mock Notification API
global.Notification = jest.fn().mockImplementation((title, options) => ({
    title: title,
    body: options?.body || '',
    icon: options?.icon || '',
    close: jest.fn(),
    addEventListener: jest.fn()
}));

global.Notification.permission = 'granted';
global.Notification.requestPermission = jest.fn().mockResolvedValue('granted');

// Mock IndexedDB
global.indexedDB = {
    open: jest.fn().mockReturnValue({
        addEventListener: jest.fn(),
        result: {
            createObjectStore: jest.fn(),
            transaction: jest.fn().mockReturnValue({
                objectStore: jest.fn().mockReturnValue({
                    add: jest.fn(),
                    get: jest.fn(),
                    put: jest.fn(),
                    delete: jest.fn(),
                    getAll: jest.fn()
                })
            })
        }
    }),
    deleteDatabase: jest.fn()
};

// Mock Crypto API
global.crypto = {
    getRandomValues: jest.fn().mockImplementation((array) => {
        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }
        return array;
    }),
    subtle: {
        encrypt: jest.fn().mockResolvedValue(new ArrayBuffer(16)),
        decrypt: jest.fn().mockResolvedValue(new ArrayBuffer(16)),
        generateKey: jest.fn().mockResolvedValue({}),
        importKey: jest.fn().mockResolvedValue({}),
        exportKey: jest.fn().mockResolvedValue(new ArrayBuffer(16))
    }
};

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation((callback) => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
}));

// Mock MutationObserver
global.MutationObserver = jest.fn().mockImplementation((callback) => ({
    observe: jest.fn(),
    disconnect: jest.fn(),
    takeRecords: jest.fn().mockReturnValue([])
}));

// Mock URL API
global.URL = jest.fn().mockImplementation((url, base) => ({
    href: url,
    protocol: 'http:',
    hostname: 'localhost',
    pathname: '/',
    search: '',
    hash: '',
    toString: () => url
}));

global.URLSearchParams = jest.fn().mockImplementation((params) => ({
    get: jest.fn(),
    set: jest.fn(),
    append: jest.fn(),
    delete: jest.fn(),
    has: jest.fn(),
    toString: jest.fn().mockReturnValue('')
}));

// Mock FormData
global.FormData = jest.fn().mockImplementation(() => ({
    append: jest.fn(),
    delete: jest.fn(),
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    set: jest.fn(),
    entries: jest.fn().mockReturnValue([]),
    keys: jest.fn().mockReturnValue([]),
    values: jest.fn().mockReturnValue([])
}));

// Test utilities
global.testUtils = {
    // Create mock DOM element
    createElement: (tag, attributes = {}) => {
        const element = document.createElement(tag);
        Object.assign(element, attributes);
        return element;
    },
    
    // Wait for async operations
    waitFor: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    
    // Mock API response
    mockApiResponse: (data, status = 200) => {
        global.fetch.mockResolvedValueOnce({
            ok: status >= 200 && status < 300,
            status: status,
            json: jest.fn().mockResolvedValue(data),
            text: jest.fn().mockResolvedValue(JSON.stringify(data))
        });
    },
    
    // Mock API error
    mockApiError: (error, status = 500) => {
        global.fetch.mockRejectedValueOnce(new Error(error));
    },
    
    // Clear all mocks
    clearAllMocks: () => {
        jest.clearAllMocks();
        localStorage.getItem.mockClear();
        localStorage.setItem.mockClear();
        localStorage.removeItem.mockClear();
        localStorage.clear.mockClear();
    }
};

// Setup and teardown
beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
    
    // Reset DOM
    document.body.innerHTML = '';
    document.head.innerHTML = '';
    
    // Reset localStorage
    localStorage.clear();
    sessionStorage.clear();
});

afterEach(() => {
    // Clean up any timers
    jest.clearAllTimers();
    
    // Clean up any event listeners
    document.removeEventListener = jest.fn();
    window.removeEventListener = jest.fn();
});

// Console suppression for tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
});

afterAll(() => {
    console.error = originalError;
    console.warn = originalWarn;
});

console.log('✅ Zeeky AI test environment initialized');
