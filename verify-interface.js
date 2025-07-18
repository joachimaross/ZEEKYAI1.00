// Interface Verification Script
// Run this in the browser console to check if sci-fi interface is working

console.log('🔍 ZEEKY AI INTERFACE VERIFICATION STARTING...');

// Test 1: Check if body has correct class
const body = document.body;
console.log('📋 Body class:', body.className);

if (body.classList.contains('sci-fi-container')) {
    console.log('✅ Body has sci-fi-container class');
} else {
    console.log('❌ Body missing sci-fi-container class');
}

// Test 2: Check if sci-fi elements exist
const sciFiElements = {
    loader: document.querySelector('.sci-fi-loader'),
    background: document.querySelector('.sci-fi-bg'),
    interface: document.querySelector('.sci-fi-interface'),
    header: document.querySelector('.sci-fi-header'),
    avatar: document.querySelector('.ai-avatar-container'),
    matrix: document.querySelector('.personality-matrix'),
    nav: document.querySelector('.sci-fi-nav'),
    main: document.querySelector('.sci-fi-main'),
    chat: document.querySelector('.chat-display'),
    input: document.querySelector('.neural-interface')
};

console.log('🧩 Checking sci-fi elements:');
Object.entries(sciFiElements).forEach(([name, element]) => {
    if (element) {
        console.log(`✅ ${name}: Found`);
    } else {
        console.log(`❌ ${name}: Missing`);
    }
});

// Test 3: Check CSS loading
const testElement = document.createElement('div');
testElement.className = 'sci-fi-container';
testElement.style.display = 'none';
document.body.appendChild(testElement);

const computedStyle = window.getComputedStyle(testElement);
console.log('🎨 CSS Test:');
console.log('Font Family:', computedStyle.fontFamily);
console.log('Background Color:', computedStyle.backgroundColor);
console.log('Color:', computedStyle.color);

document.body.removeChild(testElement);

// Test 4: Check CSS variables
const rootStyles = window.getComputedStyle(document.documentElement);
const cssVars = [
    '--matrix-green',
    '--neon-blue',
    '--cyber-purple',
    '--plasma-pink',
    '--hologram-cyan',
    '--neural-orange'
];

console.log('🎨 CSS Variables:');
cssVars.forEach(varName => {
    const value = rootStyles.getPropertyValue(varName);
    if (value) {
        console.log(`✅ ${varName}: ${value}`);
    } else {
        console.log(`❌ ${varName}: Not found`);
    }
});

// Test 5: Check JavaScript loading
console.log('⚡ JavaScript Test:');
if (typeof window.SciFiInterface !== 'undefined') {
    console.log('✅ SciFiInterface class loaded');
} else {
    console.log('❌ SciFiInterface class not found');
}

if (typeof window.sciFiInterface !== 'undefined') {
    console.log('✅ SciFiInterface instance created');
    console.log('Current personality:', window.sciFiInterface.getCurrentPersonality());
} else {
    console.log('❌ SciFiInterface instance not found');
}

// Test 6: Check for conflicts
const allStylesheets = Array.from(document.styleSheets);
console.log('📄 Loaded Stylesheets:');
allStylesheets.forEach((sheet, index) => {
    try {
        console.log(`${index + 1}. ${sheet.href || 'Inline styles'}`);
    } catch (e) {
        console.log(`${index + 1}. [Cross-origin stylesheet]`);
    }
});

// Test 7: Check for old elements that might be conflicting
const oldElements = {
    'dashboard-container': document.querySelector('.dashboard-container'),
    'modern-sidebar': document.querySelector('.modern-sidebar'),
    'main-content': document.querySelector('.main-content'),
    'chat-container': document.querySelector('.chat-container'),
    'welcome-screen': document.querySelector('.welcome-screen')
};

console.log('🔍 Checking for conflicting old elements:');
Object.entries(oldElements).forEach(([name, element]) => {
    if (element) {
        console.log(`⚠️ ${name}: Found (potential conflict)`);
    } else {
        console.log(`✅ ${name}: Not found (good)`);
    }
});

// Test 8: Force apply sci-fi styles
console.log('🔧 Attempting to force apply sci-fi styles...');
if (body) {
    body.className = 'sci-fi-container theme-default';
    body.style.background = '#000000';
    body.style.color = '#00ff41';
    body.style.fontFamily = "'Orbitron', 'Courier New', monospace";
    console.log('✅ Forced sci-fi styles applied to body');
}

// Test 9: Check if animations are working
const animatedElements = document.querySelectorAll('.hologram-logo, .logo-3d, .avatar-display');
console.log('🎬 Animated elements found:', animatedElements.length);

// Test 10: Summary
console.log('📊 VERIFICATION SUMMARY:');
const sciFiElementsCount = Object.values(sciFiElements).filter(el => el).length;
const totalSciFiElements = Object.keys(sciFiElements).length;
const conflictingElements = Object.values(oldElements).filter(el => el).length;

console.log(`Sci-Fi Elements: ${sciFiElementsCount}/${totalSciFiElements}`);
console.log(`Conflicting Elements: ${conflictingElements}`);
console.log(`CSS Variables: ${cssVars.filter(v => rootStyles.getPropertyValue(v)).length}/${cssVars.length}`);

if (sciFiElementsCount === totalSciFiElements && conflictingElements === 0) {
    console.log('🎉 VERIFICATION PASSED: Sci-Fi interface is working correctly!');
} else {
    console.log('⚠️ VERIFICATION ISSUES DETECTED: Some elements are missing or conflicting');
}

console.log('🔍 VERIFICATION COMPLETE');

// Return verification object for further inspection
window.zeekyVerification = {
    sciFiElements,
    oldElements,
    cssVars: cssVars.map(v => ({ name: v, value: rootStyles.getPropertyValue(v) })),
    stylesheets: allStylesheets.map(s => s.href || 'inline'),
    summary: {
        sciFiElementsFound: sciFiElementsCount,
        totalSciFiElements,
        conflictingElements,
        passed: sciFiElementsCount === totalSciFiElements && conflictingElements === 0
    }
};

console.log('💾 Verification data saved to window.zeekyVerification');
