(function() {
    const trackedElements = new Set();
    let initialSnapshot = new Set();
    let finalSnapshot = new Set();

    // Function to log element details
    function logElementDetails(element) {
        const tagName = element.tagName.toLowerCase();
        const classes = element.className ? `.${element.className.split(' ').join('.')}` : '';
        const parentTag = element.parentElement ? element.parentElement.tagName.toLowerCase() : 'none';
        const parentClasses = element.parentElement && element.parentElement.className ? `.${element.parentElement.className.split(' ').join('.')}` : '';
        const id = element.id ? `#${element.id}` : '';
        const text = element.innerText ? ` Text: "${element.innerText.trim()}"` : '';
        const creationTime = element.dataset.creationTime ? ` Created: ${element.dataset.creationTime}` : '';
        console.log(`Leaked element: <${tagName}${id}${classes}> Parent: <${parentTag}${parentClasses}>${text}${creationTime}`);
    }

    // Function to track element creation with context
    function trackElementCreation(element, context = '') {
        element.dataset.creationTime = new Date().toISOString();
        element.dataset.stackTrace = new Error().stack;
        element.dataset.context = context;
        trackedElements.add(element);
    }

    // Function to track element removal
    function trackElementRemoval(element) {
        if (trackedElements.has(element)) {
            trackedElements.delete(element);
        }
    }

    // Override document.createElement to track created elements
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName, options) {
        const element = originalCreateElement.call(document, tagName, options);
        trackElementCreation(element, 'default'); // Default context if none specified
        return element;
    };

    // Override element.remove to track removed elements
    const originalRemove = Element.prototype.remove;
    Element.prototype.remove = function() {
        trackElementRemoval(this);
        originalRemove.call(this);
    };

    // Function to take a snapshot of currently tracked elements
    function takeSnapshot() {
        return new Set(trackedElements);
    }

    // Function to compare two snapshots and log differences
    function compareSnapshots(initialSnapshot, finalSnapshot) {
        const leakedElements = new Set([...finalSnapshot].filter(element => !initialSnapshot.has(element)));
        if (leakedElements.size === 0) {
            console.log('No memory leaks detected.');
        } else {
            console.warn('Memory leaks detected:', leakedElements.size, 'elements remaining.');
            leakedElements.forEach(element => logElementDetails(element));
        }
    }

    // Function to check for unresolved leaks after scene switch
    function checkForLeaks() {
        finalSnapshot = takeSnapshot();
        compareSnapshots(initialSnapshot, finalSnapshot);
    }

    // Function to reset tracked elements
    function resetTrackedElements() {
        trackedElements.clear();
        console.log('Tracked elements reset.');
    }

    // Function to save the initial snapshot
    function saveInitialSnapshot() {
        initialSnapshot = takeSnapshot();
    }

    // Override specific element creation methods to add context
    document.createElementWithContext = function(tagName, context, options) {
        const element = originalCreateElement.call(document, tagName, options);
        trackElementCreation(element, context);
        return element;
    };

    // Start tracking elements after the page loads
    window.addEventListener('load', () => {
        console.log('Tracking element creation and removal');
    });

    // Expose the checkForLeaks, resetTrackedElements, and saveInitialSnapshot functions for external use
    window.checkForLeaks = checkForLeaks;
    window.resetTrackedElements = resetTrackedElements;
    window.saveInitialSnapshot = saveInitialSnapshot;
})();

// Test case: Intentionally create a leak for testing
document.addEventListener('DOMContentLoaded', () => {
    window.saveInitialSnapshot();

    // Create test elements that should be cleaned up
    const testDiv = document.createElement('div');
    testDiv.className = 'test-leak';
    document.body.appendChild(testDiv);

    // Call the cleanup function
    resetPageStyles();

    // Check for leaks
    window.checkForLeaks();
});
