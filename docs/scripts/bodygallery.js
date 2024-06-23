// Gallery HTML structure as a template literal
const galleryHTML = `
    
        
        <div class="center-container">
            <div id="ascii-art-container">
                <!-- Your ASCII art content goes here -->
            </div>
        </div>


        <div id="loading-progress-container">
            <svg viewBox="0 0 36 36" class="circular-chart">
                <path class="circle-bg"
                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#eeeeee"
                    stroke-width="2.5"
                />

                <path class="circle"
                    stroke-dasharray="100, 100"
                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#00ffcc"
                    stroke-width="2.5"
                    id="loading-progress"
                />
            </svg>
        </div>

        

        <div class="centered-container">
            <div id="notification-popup" style="display: none;">Message goes here</div>
            <div id="notification-popup2" style="display: none;">Message goes here</div>
            <div class="hover-effect-wrapper" id="hover-effect-wrapper">
                <div class="hover-effect-container" id="hover-effect"></div>
            </div>
            <div class="slides" id="slideshow">
                <div class="button-container">
                    <div class="toggle-button" onclick="toggleTextInfo()">Toggle Prompt</div>
                </div>

                <div class="btn-nav" id="btn-prev">‹</div>
                <div class="btn-nav" id="btn-next">›</div>
                <div class="close" onclick="toggleSlideshow()">×</div>
               
                <div id="text-info2" class="adjust-width">
                    <p id="text-prompt2"></p>
                    <p id="text-seed2"></p>
                    <p id="text-creator2"></p>
                </div>
                <div id="text-info" class="adjust-width">
                    <p id="text-prompt"></p>
                    <p id="text-seed"></p>
                    <p id="text-creator"></p>
                </div>
            </div>

        </div>

        <div id="search-container">
            <input type="text" id="search-bar" placeholder="Loading please wait..." disabled>
        </div>


        <div id="gallery-container"></div>


`;

        let globalLinkUrl = "";
        let loadingPercentage = 0;
        let loadingprePercentage = 0;
        var dynamicImages = [];
        var currentImageIndex = 0;
        var hoverEffectInstance;
        const TOTAL_IMAGES_FOR_PRE_PERCENTAGE = 144;
        let loadCallCount = 0;



  
        
        function loadGallery() {
            loadingPercentage = 0;
            scrollToTop();

            const bodyGalleryContainer = document.getElementById('bodyGalleryContainer');

            if (bodyGalleryContainer) {
                bodyGalleryContainer.innerHTML = galleryHTML; // Inject the gallery HTML
                initializePage(); // Initialize the gallery components
                calculateAspectRatio();
                
            }
            document.getElementById('search-bar').addEventListener('input', toggleOverlayContainers);
            document.getElementById('btn-next').addEventListener('click', showNextSlide);
            document.getElementById('btn-prev').addEventListener('click', showPrevSlide);
            document.querySelector('.close').addEventListener('click', toggleSlideshow);
            toggleOverlayContainers();
            document.getElementById('search-bar').addEventListener('input', function () {
                const query = this.value.trim().toLowerCase();
                if (query.length > 0) {
                    this.style.animation = 'none'; // Stop blinking cursor when typing starts
                    filterImagesAndOverlays(query);
                } else {
                    this.style.animation = ''; // Resume blinking cursor when input is empty
                    showAllImages();
                }
            });
        }



        const galleryContainer = document.getElementById('gallery-container');

        function sendHeightToParent() {
            const height = document.body.scrollHeight;
            window.parent.postMessage({
                'messageType': 'setHeight',
                'height': height
            }, '*'); // Using '*' is fine in this same-origin scenario
        }
        // Function to calculate aspect ratio
        function calculateAspectRatio() {
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            const aspectRatio = screenWidth / screenHeight;
            
        
            // Check if the aspect ratio is less than or equal to 1 (square or nearly square)
            if (aspectRatio <= 1) {
                document.body.classList.add('square-aspect-ratio');
                adjustNavButtonsForAspectRatio(true);
            } else {
                document.body.classList.remove('square-aspect-ratio');
                adjustNavButtonsForAspectRatio(false);
            }
        }


        let lastHeight = window.innerHeight;
        let lastOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
        const heightChangeThresholdG = 96;

        window.addEventListener('resize', function() {
            const currentHeight = window.innerHeight;
            const currentOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';

            if (isIOS) {
                const heightDifference = Math.abs(currentHeight - lastHeight);
                if (heightDifference > heightChangeThresholdG) {
                    //console.log('Height change is significant.');
                    if (currentOrientation !== lastOrientation) {
                        //console.log('Orientation change detected, scrolling to the left.');
                        window.scrollTo({ left: 0 });
                        lastOrientation = currentOrientation;
                    }
                    //console.log('Recalculating aspect ratio.');
                    calculateAspectRatio();
                    lastHeight = currentHeight;
                } else {
                    //console.log('Height change is not significant, skipping recalculation.');
                }
            } else {
                //console.log('Non-iOS device, recalculating aspect ratio.');
                calculateAspectRatio();
            }
        });


        function adjustNavButtonsForAspectRatio(isSquare) {
            const btnPrev = document.getElementById('btn-prev');
            const btnNext = document.getElementById('btn-next');
            const buttonOverlay = document.getElementById('button-overlay'); // Get the button overlay
            const originalParentElement = document.getElementById('slideshow');

            if (!btnPrev || !btnNext) {
                // If buttons don't exist, exit the function
                return;
            }

            if (isSquare) {
                // In square aspect ratio, move buttons to the button overlay
                if (buttonOverlay) {
                    buttonOverlay.appendChild(btnPrev);
                    buttonOverlay.appendChild(btnNext);

                    // Adjust button positioning for the overlay
                    btnPrev.style.position = 'absolute';
                    btnNext.style.position = 'absolute';
                    btnPrev.style.top = '50%';
                    btnNext.style.top = '50%';
                    btnPrev.style.transform = 'translateY(-50%)';
                    btnNext.style.transform = 'translateY(-50%)';
                }
                // Set a high z-index to ensure buttons are above the hover effect
                btnPrev.style.zIndex = "1111010";
                btnNext.style.zIndex = "1111010";
            } else {
                // In non-square aspect ratio, move buttons back to original parent
                originalParentElement.appendChild(btnPrev);
                originalParentElement.appendChild(btnNext);

                // Reset styles to default
                btnPrev.style.position = '';
                btnNext.style.position = '';
                btnPrev.style.top = '';
                btnNext.style.top = '';
                btnPrev.style.transform = '';
                btnNext.style.transform = '';
                btnPrev.style.zIndex = ""; // Reset to stylesheet value
                btnNext.style.zIndex = ""; // Reset to stylesheet value
            }
        }


        function createBackgroundSurface() {
            var centeredContainer = document.querySelector('.centered-container');
            var backgroundSurface = document.createElement('div');
            backgroundSurface.id = 'background-surface';
            backgroundSurface.style.position = 'absolute';
            backgroundSurface.style.top = '-25%'; // Start at -25% of the container size
            backgroundSurface.style.left = '-25%';
            backgroundSurface.style.width = '150%'; // 50% larger than the container size
            backgroundSurface.style.height = '150%'; // 50% larger than the container size
            backgroundSurface.style.backgroundColor = 'black';
            backgroundSurface.style.zIndex = '-1'; // Ensure it's below other elements in the container
            centeredContainer.appendChild(backgroundSurface);
        }

        

        // Add this script below your existing JavaScript code
        let textInfoVisible = true; // Tracks whether text info is allowed to be shown

        function toggleTextInfo() {
            const textInfo = document.getElementById('text-info');
            const textInfo2 = document.getElementById('text-info2'); // Get the text-info2 element

            if (textInfoVisible) {
                hideTextInfo().then(() => {
                    //console.log('Text info hidden by toggle');
                    textInfo2.style.pointerEvents = 'none'; // Make text-info2 ignore mouse events
                });
                textInfoVisible = false;  // After toggling off, prevent showing until toggled on
            } else {
                textInfoVisible = true;   // Allow hide and show functions to operate normally
                showTextInfo().then(() => {
                    //console.log('Text info shown by toggle');
                    textInfo2.style.pointerEvents = 'auto'; // Make text-info2 respond to mouse events
                });
            }
        }




        // Function to toggle overlay containers based on search bar input
        function toggleOverlayContainers() {
            const searchInput = document.getElementById('search-bar');
            const imageContainers = document.querySelectorAll('.image-container');

            if (searchInput.value.trim() === '') {
                imageContainers.forEach(container => {
                    const overlay = container.querySelector('.word-overlay');
                    overlay.style.display = 'none'; // Hide the overlay container when input is empty
                });
            } else {
                imageContainers.forEach(container => {
                    const overlay = container.querySelector('.word-overlay');
                    overlay.style.display = 'block'; // Show the overlay container when there is text in the input
                });
            }
        }


     
        




        //LOADING SCREEN


        function initializeLoadingScreen() {

            blockInteractions();

                
            const asciiArt = [
                "                 /^ ^\\                ", 
                "                / 111 \\               ", 
                "                V\\ Y /V               ", 
                "                 / - \\                ", 
                "                /    |                ", 
                "               V__) ||                ",
                "**************************************",
                "*** LOADING DATA *** IMAGE LIBRARY ***",
                "**************************************"
            ];
            const background = document.createElement('div');
            background.style.position = 'absolute';
            background.style.top = '0';
            background.style.left = '0';
            background.style.width = '100%';
            background.style.height = '500vh';
            background.style.zIndex = '-1';
            background.style.backgroundColor = 'rgba(0, 0, 0, 1)'; // 10% grey
            // Add more styles or content to the background as needed

            document.body.insertBefore(background, document.body.firstChild);
            
            setTimeout(function() {
                fetchImageFilenames();
            }, 10);

            const container = document.getElementById('ascii-art-container');
            const numberOfCharacters = asciiArt[0].length;

            asciiArt.forEach((line, lineIndex) => {
                const lineDiv = document.createElement('div');
                lineDiv.className = 'ascii-line';
                line.split('').forEach((char, charIndex) => {
                    const span = document.createElement('span');
                    span.setAttribute('data-original-char', char);
                    if (char === ' ' || char === '') {
                        span.classList.add('hidden-char');
                    }
                    lineDiv.appendChild(span);
                });
                container.appendChild(lineDiv);
            });

            

            function preventDefault(e) {
                e.preventDefault();
            }

            function disableScroll() {
                if (!isScrollDisabled) {
                    // Add event listeners to prevent scrolling
                    window.addEventListener('wheel', preventDefault, { passive: false });
                    window.addEventListener('touchmove', preventDefault, { passive: false });
                    isScrollDisabled = true;
                }
            }

            function enableScroll() {
                if (isScrollDisabled) {
                    // Remove event listeners to re-enable scrolling
                    window.removeEventListener('wheel', preventDefault);
                    window.removeEventListener('touchmove', preventDefault);
                    isScrollDisabled = false;
                }
            }
            


            function generateRandomCharacter() {
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*()[]{}|';
                disableScroll();
                return characters.charAt(Math.floor(Math.random() * characters.length));
            }

            function generateRandomColor() {
                const hue = Math.floor(Math.random() * 360); // Hue: 0-359
                const saturation = 100; // Saturation: percentage
                const lightness = 50; // Lightness: percentage (50% is a balanced brightness)

                return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            }
            
            let lastIntervalValue = 0;
            const shuffleWidth = 7;


            

            const shuffleInterval = setInterval(function() {
                document.querySelectorAll('.ascii-line').forEach(line => {
                    for (let charIndex = 0; charIndex < numberOfCharacters; charIndex++) {
                        const span = line.childNodes[charIndex];
                        if (span) {
                            if (charIndex >= loadingprePercentage && charIndex < loadingprePercentage + shuffleWidth) {
                                span.textContent = generateRandomCharacter();
                                span.style.color = generateRandomColor(); // Apply random color
                            } else if (charIndex >= loadingprePercentage - shuffleWidth && charIndex < loadingprePercentage) {
                                span.textContent = span.getAttribute('data-original-char');
                                span.style.color = ""; // Reset to original color
                            }
                        }
                    }
                });
            }, 30);

            const shortInterval = setInterval(function() {
                if (lastIntervalValue < loadingprePercentage) {
                    lastIntervalValue = loadingprePercentage;
                }
                loadingPercentage++; // Increment loadingPercentage
            }, 100000);


            const loadingInterval = setInterval(function() {
                if (loadingprePercentage >= 40) {
                    // Loading is complete
                    shuffleOnes(); // Start shuffling spans with '1'
                    clearInterval(loadingInterval);
                    clearInterval(shuffleInterval); // Optionally clear the shuffle interval too
                }
            }, 10);

        // Function to shuffle spans with '1'
            function shuffleOnes() {
                const spansWithOne = Array.from(document.querySelectorAll('span')).filter(span => span.getAttribute('data-original-char') === '1');
                const shuffleDuration = 150; // Duration for each span to shuffle
                const delayBetweenSpans = 50; // Delay between spans

                spansWithOne.forEach((span, index) => {
                    setTimeout(() => {
                        shuffleSpan(span, index === spansWithOne.length - 1);
                    }, delayBetweenSpans * index);
                });

                function shuffleSpan(span, isLastSpan) {
                    let timeElapsed = 0;
                    const shuffleFrequency = 420;

                    const shuffle = setInterval(() => {
                        if (timeElapsed >= shuffleDuration) {
                            clearInterval(shuffle);
                            span.textContent = '1'; // Reset to original character
                            span.style.color = ""; // Reset to original color
                            if (isLastSpan) {
                                removeCenterContainer();
                            }
                            return;
                        }

                        span.textContent = generateRandomCharacter();
                        span.style.color = generateRandomColor(); // Apply random color
                        timeElapsed += 1000 / shuffleFrequency;
                    }, 1000 / shuffleFrequency);
                }

            }


            function removeCenterContainer() {
                const centerContainer = document.querySelector('.center-container');
                if (centerContainer) {
                    // Start fading out the center container smoothly
                    centerContainer.style.transition = 'opacity 1s ease-out';
                    centerContainer.style.opacity = '0';

                    // Delay removing the center container until the fade-out animation completes
                    setTimeout(() => {
                        centerContainer.remove();
                        enableScroll(); // Re-enable scrolling if it was disabled
                        unblockInteractions();

                        
                    }, 1000); // Adjust timing as needed based on the duration of the fade-out animation
                }
            }



        }



        
        //GALLERY CODE
        
        let abortController = new AbortController();

        function fetchImageFilenames() {
            // Create a new AbortController instance for each fetch
            abortController = new AbortController();
            const signal = abortController.signal;

            let imageMetadata = {};
            const galleryContainer = document.getElementById('gallery-container');
            let db; // Reference for IndexedDB database

            if (!window.indexedDB) {
                console.log("Your browser doesn't support IndexedDB.");
                return;
            }
            let request = window.indexedDB.open('MyDatabase', 1); // Use the same database name

            request.onerror = function(event) {
                console.error("Database error: ", event.target.errorCode);
            };

            request.onsuccess = function(event) {
                db = event.target.result;
                fetchMetadataAndImages();
            };

            request.onupgradeneeded = function(event) {
                let db = event.target.result;
                if (!db.objectStoreNames.contains('assets')) { // Use the same store name
                    db.createObjectStore('assets', { keyPath: 'url' }); // Use 'url' as the keyPath
                }
            };

            function fetchMetadataAndImages() {
                fetch('https://raw.githubusercontent.com/Mischlichter/data/main/index.json', { signal })
                    .then(response => response.json())
                    .then(indexData => {
                        fetch('https://raw.githubusercontent.com/Mischlichter/data/main/lib/metadata.json', { signal })
                            .then(response => response.json())
                            .then(data => {
                                imageMetadata = data;

                                fetch('https://api.github.com/repos/Mischlichter/data/contents/gallerycom', { signal })
                                    .then(response => response.json())
                                    .then(files => {
                                        const totalImages = files.length;
                                        let loadedImages = 0;
                                        // Reset variables
                                        loadingPercentage = 0;
                                        loadingprePercentage = 0;
                                        loadCallCount = 0;
                                        loadedImages = 0;

                                        function loadImage(index) {
                                            if (index >= totalImages) {
                                                return; // All images loaded
                                            }

                                            const file = files[index];
                                            const imageContainer = document.createElement('div');
                                            imageContainer.classList.add('image-container');

                                            const img = document.createElement('img');
                                            img.classList.add('grid-image');
                                            img.alt = 'Scene Image'; // Add this line

                                            const metadata = imageMetadata[file.name] || {};
                                            const wordOverlay = document.createElement('div');
                                            wordOverlay.classList.add('word-overlay');

                                            imageContainer.appendChild(img);
                                            imageContainer.appendChild(wordOverlay);
                                            img.dataset.metadata = JSON.stringify(metadata);

                                            let transaction = db.transaction('assets', 'readonly');
                                            let store = transaction.objectStore('assets');
                                            let dbRequest = store.get(file.download_url);

                                            dbRequest.onsuccess = function(event) {
                                                let dbResult = event.target.result;
                                                let lastModifiedInDB = dbResult ? new Date(dbResult.lastModified) : new Date(0);
                                                let dateStr = indexData[file.name]?.lastModified;
                                                let lastModifiedCurrent;

                                                // Ensure the date string is correctly parsed
                                                if (dateStr) {
                                                    let parts = dateStr.split(/[- :]/);
                                                    lastModifiedCurrent = new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
                                                } else {
                                                    lastModifiedCurrent = new Date(0);  // Default to epoch start if no date is provided
                                                }

                                                if (!dbResult || lastModifiedInDB < lastModifiedCurrent) {
                                                    fetch(file.download_url, { signal })
                                                        .then(response => response.blob())
                                                        .then(blob => {
                                                            db.transaction('assets', 'readwrite')
                                                                .objectStore('assets')
                                                                .put({
                                                                    url: file.download_url,
                                                                    blob: blob,
                                                                    lastModified: lastModifiedCurrent.toISOString()
                                                                });

                                                            const dataUrl = URL.createObjectURL(blob);
                                                            img.src = dataUrl; // Load new image source
                                                            dynamicImages.push(img.src); // Store the image URL
                                                        })
                                                        .catch(error => {
                                                            if (error.name === 'AbortError') {
                                                                //console.log('Image fetch aborted.');
                                                            } else {
                                                                console.error(`Error loading image ${index} (${file.name}):`, error);
                                                            }
                                                        });
                                                } else {
                                                    const blob = dbResult.blob;
                                                    if (blob instanceof Blob) {
                                                        img.src = URL.createObjectURL(blob); // Load image from DB
                                                        dynamicImages.push(img.src); // Store the image URL
                                                    } else {
                                                        console.error(`Blob is not an instance of Blob for image ${index} (${file.name})`);
                                                        loadImage(index + 1); // Continue loading the next image
                                                    }
                                                }

                                                img.onload = () => {
                                                    loadedImages++;
                                                    updateLoadingStatus((loadedImages / totalImages) * 100);

                                                    img.onclick = () => onImageClick(img.src);
                                                    if (currentImageIndex !== -1) {
                                                        showSlideshow();
                                                    } else {
                                                        console.error("Clicked image index not found in dynamicImages array.");
                                                    }
                                                    if (loadedImages === totalImages) {
                                                        // Full load handling
                                                    }

                                                    galleryContainer.appendChild(imageContainer);
                                                    setTimeout(() => loadImage(index + 1), 7);
                                                };

                                                img.onerror = () => {
                                                    console.error(`Error loading image ${index} (${file.name})`);
                                                    loadImage(index + 1);
                                                };
                                            };

                                            dbRequest.onerror = function() {
                                                console.error("Error fetching image from database");
                                            };
                                        }

                                        loadImage(0); // Start loading images
                                    })
                                    .catch(error => {
                                        if (error.name === 'AbortError') {
                                            //console.log('Gallery fetch aborted.');
                                        } else {
                                            console.error('Error fetching file names:', error);
                                        }
                                    });
                            })
                            .catch(error => {
                                if (error.name === 'AbortError') {
                                    //console.log('Metadata fetch aborted.');
                                } else {
                                    console.error('Error fetching metadata:', error);
                                }
                            });
                    })
                    .catch(error => {
                        if (error.name === 'AbortError') {
                            //console.log('Index fetch aborted.');
                        } else {
                            console.error('Error fetching index data:', error);
                        }
                    });
            }
        }




        function updateVisibleImages() {
            // Fetch all image elements that might be in dynamicImages
            const allImages = document.querySelectorAll('img');
            const newVisibleImages = [];

            allImages.forEach(img => {
                // Check if the image's container is not hidden
                const container = img.closest('.image-container');
                const isVisible = container && !container.classList.contains('hidden-image');

                if (isVisible) {
                    newVisibleImages.push(img.src); // Add visible images to the new list
                }
            });

            // Compare new list with the current dynamicImages to log changes
            const newImagesHidden = dynamicImages.filter(src => !newVisibleImages.includes(src));
            const newImagesShown = newVisibleImages.filter(src => !dynamicImages.includes(src));

            if (newImagesHidden.length > 0) {
                //console.log('Images hidden:', newImagesHidden);
            }
            if (newImagesShown.length > 0) {
                //console.log('New images shown:', newImagesShown);
            }

            // Update the dynamicImages array
            dynamicImages = newVisibleImages;
        }




        function onImageClick(imgSrc) {
            updateVisibleImages();
            currentImageIndex = dynamicImages.indexOf(imgSrc);
            //console.log("Current Image Index:", currentImageIndex);
          

            if (currentImageIndex !== -1) {
                const centeredContainer = document.querySelector('.centered-container');
                centeredContainer.style.display = 'flex'; // Show the centered-container

                // Set the CSS properties to position the centered container on top
                centeredContainer.style.position = 'fixed';
                centeredContainer.style.top = '0';
                centeredContainer.style.left = '0';
                centeredContainer.style.width = '100%';
                centeredContainer.style.height = '100%';
                centeredContainer.style.zIndex = '9999';
                centeredContainer.style.backgroundColor = 'rgba(0, 0, 0, 0)'; // Start with transparent background
                centeredContainer.style.opacity = '0'; // Start with 0 opacity

                // Enable opacity transition
                centeredContainer.style.transition = 'opacity 0.5s ease-in-out';

                // Delay the opacity change to trigger the transition effect
                setTimeout(() => {
                    centeredContainer.style.backgroundColor = 'rgba(0, 0, 0, 1)'; // Set the background color to opaque
                    centeredContainer.style.opacity = '1'; // Fade in the container

                    disableScroll(); // Disable scrolling
                    recreateHoverEffectini(); // Recreate the hover effect with the selected image

                    // Delay the execution of updateTextInfo
                    setTimeout(() => {
                        updateTextInfo(); // Update the text info based on the current image
                    }, 5); // Adjust the delay value as needed
                }, 50); // Adjust the delay value as needed

            } else {
                console.error("Clicked image index not found in dynamicImages array.");
            }
        }






        function updateLoadingStatus(percentage) {
            // Ensure the percentage is between 0 and 100
            loadingPercentage = Math.min(Math.max(percentage, 0), 100);
            sendHeightToParent();

            // Update the pre-loading percentage based on the load call count
            loadCallCount++;
            loadingprePercentage = Math.min((loadCallCount / TOTAL_IMAGES_FOR_PRE_PERCENTAGE) * 100, 100);
            //console.log(`Pre-loading Percentage: ${loadingprePercentage}%`); // Print the pre-loading percentage

            // Select the SVG circle path element
            var loadingProgress = document.getElementById('loading-progress');

            if (loadingProgress) {
                // Calculate the length of the path
                const pathLength = loadingProgress.getTotalLength();

                // Calculate the stroke dash offset for loading percentage
                const offset = pathLength - (pathLength * loadingPercentage / 100);

                // Update the stroke-dasharray and stroke-dashoffset
                loadingProgress.style.strokeDasharray = pathLength;
                loadingProgress.style.strokeDashoffset = offset;

                if (loadingPercentage >= 100) {
                    const searchBar = document.getElementById('search-bar');

                    
                    // Step 1: Fade out
                    searchBar.style.opacity = 0;

                    // Step 2: Wait for fade out to complete, change placeholder, and fade in
                    setTimeout(() => {
                        searchBar.placeholder = "Search...";
                        searchBar.disabled = false; // Enable the search bar
                        searchBar.style.opacity = 1; // Fade in
                        stopGif();

                        // Optional: Focus on the search bar after loading is complete and it's visible
                        //searchBar.focus();

                    }, 150); // Match the timeout with your CSS transition time

                    hideLoadingProgress(); // Hide the loading indicator, if applicable

                    loadingprePercentage = 0;
                    loadingPercentage = 0;

                }
            }
        }

        function resetLoadingStatus() {
            loadingPercentage = 0;
            loadingprePercentage = 0;
            loadCallCount = 0;
            loadedImages = 0;
        }
 



        function simulateWindowResize() {
            const originalWidth = window.outerWidth;
            const originalHeight = window.outerHeight;

            // Attempt to resize the window by a small amount
            window.resizeTo(originalWidth - 10, originalHeight - 10);

            // Then, revert back to the original dimensions
            setTimeout(() => {
                window.resizeTo(originalWidth, originalHeight);
            }, 100); // Short delay before reverting
        }

        // Run the function every 5 seconds for testing
        setInterval(simulateWindowResize, 5000);

        function hideLoadingProgress() {
            const loadingContainer = document.getElementById('loading-progress-container');
            if (loadingContainer) {
                loadingContainer.style.opacity = '0'; // Start fade-out

             

                // After the transition is complete, set display to 'none'
                setTimeout(() => {
                    loadingContainer.style.display = 'none';
                }, 1000); // 1000ms = 1s (same as the CSS transition duration)
            }
        }

        function calculateImagesPerRow() {
            const minGridItemWidth = 180; // Minimum width of each grid item in pixels
            return Math.floor(window.innerWidth / minGridItemWidth);
        }

        function calculateRowsPerViewport() {
            const minGridItemWidth = 180; // Assuming square items for simplicity
            return Math.ceil(window.innerHeight / minGridItemWidth);
        }

        


        function updateTextInfo() {
            const imgSrc = dynamicImages[currentImageIndex];
            const imageElement = document.querySelector(`img[src="${imgSrc}"]`);

            if (imageElement) {
                try {
                    const metadata = JSON.parse(imageElement.getAttribute('data-metadata') || '{}');
                    const promptElement = document.getElementById('text-prompt');
                    const seedElement = document.getElementById('text-seed');
                    const creatorElement = document.getElementById('text-creator');

                    promptElement.textContent = `Prompt: ${metadata['Prompt'] || 'N/A'}`;
                    seedElement.textContent = `Seed: ${metadata['Seed'] || 'N/A'}`;
                    creatorElement.textContent = `Creator: ${metadata['Creator'] || 'N/A'}`;

                    // Set the visibility to hidden
                    promptElement.style.visibility = 'hidden';
                    //promptElement.style.pointerEvents = 'none';   
                    seedElement.style.visibility = 'hidden';
                    //seedElement.style.pointerEvents = 'none';
                    creatorElement.style.visibility = 'hidden';
                    //creatorElement.style.pointerEvents = 'none';
                    updateTextInfo2();
                    
                    startTextInfoAnimation();
                    createLinkFromTextInfo();

                } catch (error) {
                    console.error('Error parsing metadata JSON:', error);
                }
            } else {
                console.error(`Image element not found for source: ${imgSrc}`);
            }
        }
        
         // Global variable to store the link
        
        function createLinkFromTextInfo() {
            const seedElement = document.getElementById('text-seed2');
            const seed = seedElement.textContent.replace('Seed: ', '').trim();
            globalLinkUrl = `https://www.hogeai.com/sharing/${seed}.html`; // Store URL in global variable

            //console.log(`Generated Link: ${globalLinkUrl}`);
            createClickableLink(globalLinkUrl); // Call to create a clickable link element
        }

        function createClickableLink(url) {
            const linkElement = document.createElement('a');
            linkElement.href = url;
            linkElement.textContent = 'Access Shared Content';
            document.body.appendChild(linkElement);
        }

        function disposeLinks() {
            const links = document.querySelectorAll('a');
            links.forEach(link => {
                if (link.textContent === 'Access Shared Content') {
                    link.remove();
                }
            });
        }


        function updateTextInfo2() {
            const imgSrc = dynamicImages[currentImageIndex];
            const imageElement = document.querySelector(`img[src="${imgSrc}"]`); // Find the img element by its src
            
            showTextInfo();

            if (imageElement) {
                try {
                    const metadata = JSON.parse(imageElement.getAttribute('data-metadata') || '{}');
                    document.getElementById('text-prompt2').textContent = `Prompt: ${metadata['Prompt'] || 'N/A'}`;
                    document.getElementById('text-seed2').textContent = `Seed: ${metadata['Seed'] || 'N/A'}`;
                    document.getElementById('text-creator2').textContent = `Creator: ${metadata['Creator'] || 'N/A'}`;

                } catch (error) {
                    console.error('Error parsing metadata JSON:', error);
                    // Handle the error appropriately
                }
            } else {
                console.error(`Image element not found for source: ${imgSrc}`);
                // Handle the missing image element appropriately
            }
        }

        ////animate text


        // New functions for text animation
        function generateRandomString2(length) {
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*()[]{}|';
            var randomString = '';
            for (var i = 0; i < length; i++) {
                randomString += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return randomString;
        }

        function createSpansForTextInfo(textInfoId, text) {
            const container = document.getElementById(textInfoId);
            container.innerHTML = '';

            text.split('\n').forEach(line => {
                const lineSpan = document.createElement('span');
                lineSpan.className = 'line-span';

                const lineContainer = document.createElement('div');
                lineContainer.className = 'line-container';
                lineSpan.appendChild(lineContainer);

                const words = line.split(' ');
                words.forEach((word, index) => {
                    const wordSpan = document.createElement('span');
                    wordSpan.className = 'dynamic-text';
                    wordSpan.setAttribute('data-final-text', word);

                    // Set with scrambled text for animation
                    wordSpan.textContent = generateRandomString2(word.length);
                    lineContainer.appendChild(wordSpan);

                    if (index < words.length - 1) {  // Add a space if it's not the last word
                        lineContainer.appendChild(document.createTextNode(' '));
                    }
                });

                container.appendChild(lineSpan);
            });

            // Call fixLayout after the browser has had a chance to lay out the text
            setTimeout(() => fixLayout(container), 0);
        }

        function fixLayout(container) {
            Array.from(container.getElementsByClassName('dynamic-text')).forEach(span => {
                const originalText = span.getAttribute('data-final-text');
                const measureSpan = document.createElement('span');
                measureSpan.textContent = originalText;
                measureSpan.className = 'measure-span'; // Apply same styling as dynamic-text for accurate measurement
                measureSpan.style.visibility = 'hidden';

                // Append to the same parent to maintain similar text environment
                span.parentNode.appendChild(measureSpan);

                // Apply strict width controls to ensure no layout change
                const exactWidth = `${measureSpan.offsetWidth}px`;
                span.style.width = exactWidth;
                span.style.minWidth = exactWidth;
                span.style.maxWidth = exactWidth;
                span.style.display = 'inline-block';

                // Optionally, ensure no text wrapping occurs within spans
                span.style.whiteSpace = 'nowrap';

                // Cleanup by removing the measurement span
                span.parentNode.removeChild(measureSpan);
            });
        }







        function animateTextInfoSpans(textInfoId, duration = 500, baseDelay = 10) {
            const container = document.getElementById(textInfoId);
            const lineSpans = container.getElementsByClassName('line-span');
            let totalWordIndex = 0; // Counter for overall word position in the text

            Array.from(lineSpans).forEach((lineSpan, lineIndex) => {
                const spans = lineSpan.getElementsByClassName('dynamic-text');
                Array.from(spans).forEach((span, wordIndex) => {
                    // Calculate the delay based on both word and line position
                    let delay = baseDelay * (totalWordIndex++);
                    
                    setTimeout(() => {
                        const finalText = span.getAttribute('data-final-text');
                        animateText3(span, finalText, duration);
                    }, delay);
                });
            });
        }


        function animateText3(span, finalText, duration) {
            let startTime = null;
            span.style.visibility = 'visible';

            // Set a fixed speed factor
            const speedFactor = 1;  // Increase or decrease this value to control the speed
            const baseInterval = 50;  // Base interval for milliseconds per frame
            const minInterval = baseInterval / speedFactor;  // Minimum interval for updates

            let lastUpdate = 0; // Time since last update

            function animate(currentTime) {
                if (!startTime) {
                    startTime = currentTime;
                    lastUpdate = currentTime;
                }
                const elapsedTime = currentTime - startTime;

                if (elapsedTime >= duration) {
                    span.innerText = finalText; // Set to final text when duration is met or exceeded
                    return false; // Return false to remove this animation from the AnimationManager
                }

                // Check if the time since the last update exceeds minInterval
                if (currentTime - lastUpdate >= minInterval) {
                    lastUpdate = currentTime; // Update the last update time

                    const progress = elapsedTime / duration;
                    const mixIndex = Math.floor(progress * finalText.length);
                    let randomizedPart = generateRandomString2(finalText.length - mixIndex);
                    span.innerText = finalText.substring(0, mixIndex) + randomizedPart;
                }

                return true; // Return true to keep this animation in the AnimationManager
            }

            // Register the animation with the AnimationManager
            AnimationManager.registerAnimation(animate);
        }


        function startTextInfoAnimation() {
            const textPrompt = document.getElementById('text-prompt').textContent;
            const textSeed = document.getElementById('text-seed').textContent;
            const textCreator = document.getElementById('text-creator').textContent;

            createSpansForTextInfo('text-prompt', textPrompt);
            createSpansForTextInfo('text-seed', textSeed);
            createSpansForTextInfo('text-creator', textCreator);

            // Calculate the total number of words in all elements
            let totalWords = countTotalWords22(['text-prompt', 'text-seed', 'text-creator']);

            // Start the animation for each text element
            animateTextInfoSpans('text-prompt', 700, 10, 0, totalWords);
            animateTextInfoSpans('text-seed', 700, 10, countWords22('text-prompt'), totalWords);
            animateTextInfoSpans('text-creator', 700, 10, countWords22('text-prompt') + countWords22('text-seed'), totalWords);
        }

        function countWords22(textInfoId) {
            const container = document.getElementById(textInfoId);
            return container.getElementsByClassName('dynamic-text').length;
        }

        function countTotalWords22(ids) {
            return ids.reduce((total, id) => total + countWords22(id), 0);
        }

        function animateTextInfoSpans(textInfoId, duration, baseDelay, startIndex, totalWords) {
            const container = document.getElementById(textInfoId);
            const spans = container.getElementsByClassName('dynamic-text');

            Array.from(spans).forEach((span, index) => {
                // Calculate the delay based on the global index of the word
                let globalIndex = startIndex + index;
                let delay = baseDelay * globalIndex / totalWords;

                setTimeout(() => {
                    const finalText = span.getAttribute('data-final-text');
                    animateText3(span, finalText, duration);
                }, delay);
            });
        }



        function hideTextInfo() {
            return new Promise((resolve, reject) => {
                const textInfo = document.getElementById('text-info');
                if (!textInfoVisible || !textInfo) return resolve(); // Do nothing if toggled off or not found

                if (isMobileDevice()) {
                    // Skip transitions for mobile devices
                    textInfo.style.opacity = "0";
                    textInfo.style.transition = "none"; // Disable CSS transitions
                    
                    resolve();
                } else {
                    // Introduce an asynchronous delay before starting the transition
                    setTimeout(() => {
                        textInfo.style.opacity = "0"; // Start the opacity transition after the delay
                        // Wait for the CSS transition to complete before resolving
                        setTimeout(() => {
                            resolve(); // Resolve the promise after the opacity transition duration
                        }, 200); // Assuming your CSS transition duration for opacity is 300ms
                    }, 30); // Delay of 1 second
                }
            });
        }




        function showTextInfo() {
            return new Promise((resolve, reject) => {
                const textInfo = document.getElementById('text-info');
                if (!textInfoVisible || !textInfo) return resolve(); // Do nothing if toggled off or not found

                textInfo.style.display = 'block'; // Ensure it's part of the layout
                if (isMobileDevice()) {
                    // Skip transitions for mobile devices
                    textInfo.style.opacity = "1";
                    textInfo.style.transition = "none"; // Disable CSS transitions
                    resolve(); // Resolve immediately after setting opacity
                } else {
                    setTimeout(() => {
                        textInfo.style.opacity = "1";
                        resolve(); // Resolve once fully visible
                    }, 100); // Delay to ensure display property applies first
                }
            });
        }



        

        
        function createButtonOverlay() {
            var existingOverlay = document.getElementById('button-overlay');

            if (!existingOverlay) {
                var bodyElement = document.body; // Get the body element
                var buttonOverlay = document.createElement('div');
                buttonOverlay.id = 'button-overlay'; // Set the ID for CSS targeting
                bodyElement.appendChild(buttonOverlay); // Append the overlay to the body element
                return buttonOverlay;
            } else {
                existingOverlay.style.display = ''; // Unhide the existing overlay
                return existingOverlay; // Return the existing overlay
            }
        }



        function createNewHoverEffectContainer() {
            var wrapper = document.getElementById('hover-effect-wrapper');
            var newContainer = document.createElement('div');
            newContainer.className = 'hover-effect-container';
            wrapper.appendChild(newContainer);
            return newContainer;

        }

        function removeOldHoverEffectContainer() {
            var wrapper = document.getElementById('hover-effect-wrapper');
            var oldContainers = wrapper.getElementsByClassName('hover-effect-container');
            if (oldContainers.length > 1) {
                var oldContainer = oldContainers[0];
                oldContainer.classList.add('fade-out');

                // Dispose of the hover effect instance before removal
                if (oldContainer.hoverEffectInstance) {
                    disposeHoverEffectInstance(oldContainer.hoverEffectInstance);
                }

                setTimeout(function() {
                    if (oldContainer.parentNode) {
                        oldContainer.parentNode.removeChild(oldContainer);

                    }
                }, 2000); // Duration should match the CSS transition
            }
        }

        function recreateHoverEffectini() {
            removeOldHoverEffectContainer(); // Fade out and remove old containers
            createButtonOverlay();
            calculateAspectRatio();
            

            var newContainer = createNewHoverEffectContainer(); // Create a new container

            if (isMobileDevice()) {
                // If it's a mobile device, just display the image directly
                newContainer.style.backgroundImage = 'url(' + dynamicImages[currentImageIndex] + ')';
                newContainer.style.backgroundSize = 'cover';  // Cover the entire area of the container
                newContainer.style.backgroundPosition = 'center';  // Center the image
                newContainer.style.backgroundRepeat = 'no-repeat';  // Do not repeat the image
            } else {
                // If it's not a mobile device, create hover effect
                hoverEffectInstance = new hoverEffect({
                    parent: newContainer,
                    intensity: 0.3,
                    image1: dynamicImages[currentImageIndex],
                    image2: dynamicImages[currentImageIndex],
                    displacementImage: dynamicImages[currentImageIndex]
                });
            }
        }

        // Utility function to detect mobile devices based on user agent
        function isMobileDevice() {
            var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            //console.log("Mobile device detected: " + isMobile);
            return isMobile;
        }





        function recreateHoverEffectnext() {
            removeOldHoverEffectContainer(); // Fade out and remove old containers

            var newContainer = createNewHoverEffectContainer(); // Create a new container
            var nextImageIndex = (currentImageIndex + 1) % dynamicImages.length;

            if (isMobileDevice()) {
                // Set initial style for fading in
                newContainer.style.opacity = '0';
                newContainer.style.transition = 'opacity 0.5s ease';

                // Set the background with new image
                newContainer.style.backgroundImage = 'url(' + dynamicImages[nextImageIndex] + ')';
                newContainer.style.backgroundSize = 'cover';  // Cover the entire area of the container
                newContainer.style.backgroundPosition = 'center';  // Center the image
                newContainer.style.backgroundRepeat = 'no-repeat';  // Do not repeat the image

                // Trigger fade in
                setTimeout(function() {
                    newContainer.style.opacity = '1';
                }, 11); // Small delay to ensure the style is applied

            } else {
                // Non-mobile effect with hoverEffect plugin
                hoverEffectInstance = new hoverEffect({
                    parent: newContainer,
                    intensity: 0.3,
                    image1: dynamicImages[currentImageIndex],
                    image2: dynamicImages[nextImageIndex],
                    displacementImage: dynamicImages[nextImageIndex],
                    angle2: Math.PI / 4
                });
            }
        }

        function recreateHoverEffectprev() {
            removeOldHoverEffectContainer(); // Fade out and remove old containers

            var newContainer = createNewHoverEffectContainer(); // Create a new container
            var prevImageIndex = (currentImageIndex - 1 + dynamicImages.length) % dynamicImages.length;

            if (isMobileDevice()) {
                // Set initial style for fading in
                newContainer.style.opacity = '0';
                newContainer.style.transition = 'opacity 0.5s ease';

                // Set the background with new image
                newContainer.style.backgroundImage = 'url(' + dynamicImages[prevImageIndex] + ')';
                newContainer.style.backgroundSize = 'cover';  // Cover the entire area of the container
                newContainer.style.backgroundPosition = 'center';  // Center the image
                newContainer.style.backgroundRepeat = 'no-repeat';  // Do not repeat the image

                // Trigger fade in
                setTimeout(function() {
                    newContainer.style.opacity = '1';
                }, 11); // Small delay to ensure the style is applied
            } else {
                // Non-mobile effect with hoverEffect plugin
                hoverEffectInstance = new hoverEffect({
                    parent: newContainer,
                    intensity: 0.3,
                    image1: dynamicImages[currentImageIndex],
                    image2: dynamicImages[prevImageIndex],
                    displacementImage: dynamicImages[prevImageIndex]
                });
            }
        }


        function showNextSlide() {
            // Create a new hover effect instance with the current image
            hideTextInfo();
            recreateHoverEffectnext();

            // Delay hover effect by 2 seconds
            setTimeout(function() {
                // Update the index after the new viewer has been created
                currentImageIndex = (currentImageIndex + 1) % dynamicImages.length;
                if (isMobileDevice()) {
                    // For mobile devices, update text information immediately
                    updateTextInfo();
                } else {
                    // For non-mobile devices, apply hover effect and delay text update
                    hoverEffectInstance.next();
                    setTimeout(updateTextInfo, 850);
                }
            }, 30); // Adjust the delay here as needed
        }

        function showPrevSlide() {
            // Create a new hover effect instance with the current image
            hideTextInfo();
            recreateHoverEffectprev();

            // Delay hover effect by 2 seconds
            setTimeout(function() {
                // Update the index after the new viewer has been created
                currentImageIndex = (currentImageIndex - 1 + dynamicImages.length) % dynamicImages.length;
                if (isMobileDevice()) {
                    // For mobile devices, update text information immediately
                    updateTextInfo();
                } else {
                    // For non-mobile devices, apply hover effect and delay text update
                    hoverEffectInstance.next();
                    setTimeout(updateTextInfo, 850);
                }
            }, 30);
        }


      



        function disposeHoverEffectInstance(instance) {
            if (!instance || !instance.scene || !instance.renderer) {
                return;
            }

            // Dispose of textures used in the hover effect
            if (instance.uniforms) {
                disposeTexture(instance.uniforms.texture1);
                disposeTexture(instance.uniforms.texture2);
                disposeTexture(instance.uniforms.disp);
            }

            // Traverse the scene and dispose of all geometries, materials, and textures
            instance.scene.traverse(object => {
                if (object.isMesh) {
                    if (object.geometry) object.geometry.dispose();
                    if (object.material) {
                        if (Array.isArray(object.material)) {
                            object.material.forEach(disposeMaterial);
                        } else {
                            disposeMaterial(object.material);
                        }
                    }
                }
            });

            // Dispose of the renderer and its WebGL context
            const gl = instance.renderer.getContext();
            const ext = gl.getExtension('WEBGL_lose_context');
            if (ext) ext.loseContext();
            instance.renderer.dispose();

            // Optional: Remove the renderer's DOM element
            if (instance.renderer.domElement && instance.renderer.domElement.parentNode) {
                instance.renderer.domElement.parentNode.removeChild(instance.renderer.domElement);
            }
        }

        function disposeMaterial(material) {
            if (material.map) material.map.dispose();
            if (material.lightMap) material.lightMap.dispose();
            if (material.bumpMap) material.bumpMap.dispose();
            if (material.normalMap) material.normalMap.dispose();
            if (material.specularMap) material.specularMap.dispose();
            if (material.envMap) material.envMap.dispose();
            material.dispose();
        }

        function disposeTexture(textureUniform) {
            if (textureUniform && textureUniform.value) textureUniform.value.dispose();
        }





//search

        function filterImagesAndOverlays(query, maxMatches = 1) {
            const queryWords = query.toLowerCase().trim().split(/\s+/);
            const imageContainers = document.querySelectorAll('#gallery-container .image-container');
            const overlayContainers = document.querySelectorAll('#gallery-container .word-overlay');

            imageContainers.forEach((container, index) => {
                const img = container.querySelector('img');
                const overlay = overlayContainers[index];
                const metadata = JSON.parse(img.dataset.metadata || '{}');

                delete metadata["File Name"];
                delete metadata["Directory"];

                const metadataString = Object.values(metadata).join(' ').toLowerCase();
                const words = metadataString.split(' ');
                const promptText = metadata["Prompt"] || '';
                const promptWords = promptText.toLowerCase().split(' ');

                let matchingWords = [];
                // Match individual words or word groups based on the query
                if (queryWords.length === 1) {
                    matchingWords = words.filter(word => word.toLowerCase().startsWith(queryWords[0]));
                } else {
                    for (let i = 0; i < words.length; i++) {
                        if (words[i].toLowerCase().startsWith(queryWords[0])) {
                            let wordGroup = words.slice(i, i + queryWords.length);
                            if (wordGroup.length === queryWords.length && wordGroup.every((w, idx) => w.toLowerCase().startsWith(queryWords[idx]))) {
                                matchingWords.push(wordGroup.join(' '));
                            }
                        }
                    }
                }

                // Limit the number of matching words and randomly select if necessary
                if (matchingWords.length > maxMatches) {
                    shuffleArray(matchingWords);
                    matchingWords = matchingWords.slice(0, maxMatches);
                }

                matchingWords = matchingWords
                    .filter((value, index, self) => self.indexOf(value) === index)
                    .sort();

                if (matchingWords.length > 0) {
                    const displayedWords = [];
                    matchingWords.forEach((matchingWord) => {
                        // Check if the matching word is in the "Prompt" category
                        const isWordInPrompt = promptWords.includes(matchingWord);

                        const index = words.findIndex(word => word === matchingWord);
                        const maxDistance = isWordInPrompt ? 3 : 0; // Neighbors only if in "Prompt"
                        const opacityStep = 1 / (maxDistance + 1);

                        const leftWords = [];
                        const rightWords = [];

                        for (let i = index - maxDistance; i <= index + maxDistance; i++) {
                                let distance = Math.abs(index - i);
                                let opacity = 1 - distance * opacityStep;
                                const wordStyle = `opacity: ${opacity}; color: white;`;

                                if (i < 0 || i >= words.length) {
                                    const placeholderWord = '   ';
                                    const placeholder = `<span style='${wordStyle}'>${placeholderWord}</span>`;
                                    if (i < index) leftWords.push(' ' + placeholder); // Space added before placeholder
                                    else if (i > index) rightWords.push(placeholder + ' '); // Space added after placeholder
                                } else {
                                    const actualWord = words[i];
                                    const wordSpan = `<span style='${wordStyle}'>${actualWord}</span>`;
                                    if (i < index) leftWords.push(' ' + wordSpan); // Space added before word
                                    else if (i > index) rightWords.push(wordSpan + ' '); // Space added after word
                                }
                            }


                        const leftWidth = leftWords.join('').length;
                        const rightWidth = rightWords.join('').length;
                        const widthDifference = Math.abs(leftWidth - rightWidth);

                        if (leftWidth < rightWidth) {
                            leftWords.unshift('&nbsp;'.repeat(widthDifference));
                        } else if (rightWidth < leftWidth) {
                            rightWords.push('&nbsp;'.repeat(widthDifference));
                        }

                        const transparentDots = `<span style='opacity: 0;'>${'.'.repeat(11)}</span>`;
                        leftWords.unshift(transparentDots);
                        rightWords.push(transparentDots);

                        const mainWordStyle = `opacity: 1; color: white;`;
                        const mainWordWithSpaces = ` <span style='${mainWordStyle}'>${matchingWord}</span> `;
                        const fullLine = [...leftWords, `<span style='${mainWordStyle}'>${mainWordWithSpaces}</span>`, ...rightWords].join('');

                        displayedWords.push(fullLine);
                    });

                    overlay.innerHTML = displayedWords.join('<br>');

                    container.classList.remove('hidden-image');
                    
                  

          
                    
                } else {
                    container.classList.add('hidden-image');
                    overlay.textContent = '';
                    

                    
                    
                }

            });
        }

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]]; // Swap elements
            }
        }



        

        function showAllImages() {
            const imageContainers = document.querySelectorAll('#gallery-container .image-container');
            const overlayContainers = document.querySelectorAll('#gallery-container .word-overlay');

            imageContainers.forEach((container, index) => {
                resetStyles(container);
                container.classList.remove('hidden-image');
                overlayContainers[index].textContent = '';
            });
        }

        function resetStyles(container) {
            // Reset the styles of the container
            container.style.transition = '';
            container.style.transform = '';
            container.style.opacity = '';
        }



        function initializePage() {
            document.getElementById('search-bar').value = ''; // Reset the search bar value
            window.scrollTo(0, 0); // Scroll to the top of the page
            createBackgroundSurface();
            initializeLoadingScreen();
        }

        function showSlideshow() {

            const slideshow = document.getElementById('slideshow');
            if (!slideshow) {
                return; // Exit the function early if the slideshow does not exist
            }
            slideshow.style.display = 'block'; // Show the slideshow only if it exists
        }




        function toggleSlideshow() {
            const centeredContainer = document.querySelector('.centered-container');
            hideButtonOverlay()

            if (centeredContainer.style.display !== 'none') {
                // Set the opacity to 0 to initiate the fade-out effect
                centeredContainer.style.opacity = '0';

                // Enable opacity transition for the fade-out effect
                centeredContainer.style.transition = 'opacity 0.3s ease-in-out';

                // Delay removing the container until the transition completes
                setTimeout(() => {
                    centeredContainer.style.display = 'none'; // Hide the centered-container
                    centeredContainer.style.backgroundColor = 'rgba(0, 0, 0, 0)'; // Set background to transparent
                    centeredContainer.style.opacity = '1'; // Reset opacity for future use
                    enableScroll(); // Re-enable scrolling
                    removeHoverEffect(); // Remove the hover effect
                    disposeLinks();
                    
              
                }, 200); // Adjust the delay value (0.3s) to match the transition duration
            }
        }

        function hideButtonOverlay() {
            var buttonOverlay = document.getElementById('button-overlay');
            if (buttonOverlay) {
                buttonOverlay.style.display = 'none'; // Hide the overlay
            }
        }

        // Attach the click event listener to the #text-info2 element
        document.addEventListener('DOMContentLoaded', function() {
            document.body.addEventListener('click', function(event) {
                if (textInfoVisible) { // Check if actions should be taken
                    if (event.target.closest('#text-info2')) {
                        const promptElement = document.getElementById('text-prompt2');
                        if (promptElement) {
                            const promptText = promptElement.textContent.replace('Prompt:', '').trim();
                            if (promptText) {
                                navigator.clipboard.writeText(promptText)
                                    .then(() => {
                                        showNotification('Prompt Text copied!');  // Notification text adjusted for clarity
                                    })
                                    .catch(err => {
                                        showNotification('Failed to copy prompt text. Please try again.');
                                    });
                            } else {
                                console.log('No prompt text found to copy');
                            }
                        } else {
                            console.log('Prompt element not found');
                        }
                    }
                }
            });
        });

        function showNotification(message) {
            let popup = document.getElementById('notification-popup');
            if (!popup) {
                //console.log('Creating new notification popup');
                popup = document.createElement('div');
                popup.id = 'notification-popup';
                document.body.appendChild(popup);
                applyStyles(popup);
            }

            popup.textContent = message;
            popup.style.display = 'block';
            popup.style.opacity = 1;

            //console.log('Notification should now be visible');

            setTimeout(() => {
                popup.style.opacity = 0;
                //console.log('Fading out notification');
                setTimeout(() => {
                    popup.style.display = 'none';
                    //console.log('Notification hidden');
                }, 500);
            }, 3000);
        }

        function applyStyles(element) {
            element.style.position = 'fixed';
            element.style.bottom = '20px';
            element.style.left = '50%';
            element.style.transform = 'translateX(-50%)';
            element.style.fontFamily = 'JetBrainsMono-Bold, sans-serif';
            element.style.fontSize = '16px';
            element.style.border = '2px solid #00ffcc';
            element.style.borderRadius = '20px';
            element.style.padding = '8px 15px';
            element.style.backgroundColor = 'black';
            element.style.color = '#00ffcc';
            element.style.textAlign = 'center';
            element.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.6)';
            element.style.zIndex = '10000000000000000000';
            element.style.opacity = '0'; // Initial opacity set to 0 for fade-in effect
            element.style.transition = 'opacity 0.5s ease-in-out';
            element.style.width = 'auto'; // Ensure width is auto to accommodate text width
            element.style.maxWidth = '80%'; // Prevents the popup from being too wide on the screen
        }

        document.addEventListener('DOMContentLoaded', function() {
            let clickCount = 0; // Initialize clickCount here, outside any function
            let isNotificationVisible = false; // Track whether the notification is visible

            document.body.addEventListener('click', function(event) {
                if (event.target.closest('#hover-effect-wrapper')) {
                    clickCount++;  // Increment the click count on each click within the wrapper

                    // First click - handle the URL copying
                    if (clickCount === 1) {
                        if (globalLinkUrl) {
                            navigator.clipboard.writeText(globalLinkUrl)
                                .then(() => {
                                    //console.log('Successfully copied URL to clipboard');
                                    showNotification2('Sharing Link copied! Click again to open.', 'notification-popup2');
                                })
                                .catch(err => {
                                    //console.error('Failed to copy URL:', err);
                                    showNotification2('Failed to copy link. Please try again.', 'notification-popup2');
                                });
                        } else {
                            console.log('No URL found to copy');
                        }
                    } else if (clickCount === 2 && isNotificationVisible) {
                        // Second click - open the URL if the notification is visible
                        if (globalLinkUrl) {
                            window.open(globalLinkUrl, '_blank');
                            clickCount = 0; // Reset the click count after opening the link
                        }
                    }
                } else if (!event.target.closest('#notification-popup2')) {
                    // Reset the click count if clicking outside the notification and wrapper
                    clickCount = 0;
                }
            });

            function showNotification2(message, elementId) {
                let popup2 = document.getElementById(elementId);
                if (!popup2) {
                    popup2 = document.createElement('div');
                    popup2.id = elementId;
                    document.body.appendChild(popup2);
                    applyStyles2(popup2);
                }

                popup2.textContent = message;
                popup2.style.display = 'block';
                popup2.style.opacity = 1;
                isNotificationVisible = true;  // Set visibility to true

                setTimeout(() => {
                    popup2.style.opacity = 0;
                    setTimeout(() => {
                        popup2.style.display = 'none';
                        console.log('Notification hidden');
                        isNotificationVisible = false; // Set visibility to false after hiding
                        clickCount = 0; // Reset click count here too, to be safe
                    }, 500);
                }, 2500); // 10 seconds to allow for a second click
            }

            function applyStyles2(element) {
                element.style.position = 'fixed';
                element.style.bottom = '50%';
                element.style.left = '50%';
                element.style.transform = 'translateX(-50%) translateY(-50%)';
                element.style.fontFamily = 'JetBrainsMono-Bold, sans-serif';
                element.style.fontSize = '16px';
                element.style.border = '2px solid #00ffcc';
                element.style.borderRadius = '20px';
                element.style.padding = '8px 15px';
                element.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                element.style.color = '#00ffcc';
                element.style.textAlign = 'center';
                element.style.zIndex = '1000';
                element.style.opacity = '0'; // Start with fade-in effect
                element.style.transition = 'opacity 0.5s ease-in-out';
                element.style.width = 'auto';
                element.style.maxWidth = '80%';
                element.style.cursor = 'pointer'; // Indicate it's clickable
            }
        });




        function removeButtonOverlay() {
            var buttonOverlay = document.getElementById('button-overlay'); // Get the button overlay by its ID
            if (buttonOverlay && buttonOverlay.parentNode) {
                buttonOverlay.parentNode.removeChild(buttonOverlay); // Remove the overlay from its parent node
            }
        }

        document.addEventListener("keydown", function(event) {
            if (event.key === "Escape" || event.key === "Esc") {
                // Call your toggleSlideshow function here
                toggleSlideshow();
            }
        });

        function removeHoverEffect() {
            const wrapper = document.getElementById('hover-effect-wrapper');
            while (wrapper.firstChild) {
                wrapper.removeChild(wrapper.firstChild);
            }
            hoverEffectInstance = null; // Set hoverEffectInstance to null
        }


        function preventDefault(e) {
                e.preventDefault();
            }

        function disableScroll() {
                // Add event listeners to prevent scrolling
            window.addEventListener('wheel', preventDefault, { passive: false });
            window.addEventListener('touchmove', preventDefault, { passive: false });
        }

        function enableScroll() {
                // Remove event listeners to re-enable scrolling
            window.removeEventListener('wheel', preventDefault);
            window.removeEventListener('touchmove', preventDefault);
        }



        !function(e, t) {
            "object" == typeof exports && "undefined" != typeof module ? module.exports = t(require("three"), require("gsap/TweenMax")) : "function" == typeof define && define.amd ? define(["three", "gsap/TweenMax"], t) : e.hoverEffect = t(e.THREE, e.TweenMax)
        }(this, function(e, t) {
            return t = t && t.hasOwnProperty("default") ? t.default : t,
            function(n) {
                function i() {
                    for (var e = arguments, t = 0; t < arguments.length; t++)
                        if (void 0 !== e[t]) return e[t]
                }
                //console.log("%c Hover effect by Robin Delaporte: https://github.com/robin-dela/hover-effect ", "color: #bada55; font-size: 0.8rem");
                var r = n.parent,
                    o = n.displacementImage,
                    a = n.image1,
                    s = n.image2,
                    f = i(n.imagesRatio, 1),
                    d = i(n.intensity1, n.intensity, 1),
                    l = i(n.intensity2, n.intensity, 1),
                    u = i(n.angle, Math.PI / 4),
                    v = i(n.angle1, u),
                    m = i(n.angle2, 3 * -u),
                    c = i(n.speedIn, n.speed, 1.2), //1.6
                    p = i(n.speedOut, n.speed, 1.2),
                    g = i(n.hover, !0),
                    h = i(n.easing, Expo.easeOut),
                    y = i(n.video, !1);
                if (r)
                    if (a && s && o) {
                        var x = new e.Scene,
                            F = new e.OrthographicCamera(r.offsetWidth / -2, r.offsetWidth / 2, r.offsetHeight / 2, r.offsetHeight / -2, 1, 1e3);
                        F.position.z = 1;
                        var w = new e.WebGLRenderer({
                            antialias: !1,
                            alpha: !0
                        });
                        w.setPixelRatio(2), w.setClearColor(16777215, 0), w.setSize(r.offsetWidth, r.offsetHeight), r.appendChild(w.domElement);
                        var L = function() {
                            w.render(x, F)
                        },
                        H = new e.TextureLoader;
                        H.crossOrigin = "";
                        var E, W, V = H.load(o, L);
                        if (V.magFilter = V.minFilter = e.LinearFilter, y) {
                            var M = function() {
                                requestAnimationFrame(M), w.render(x, F)
                            };
                            M(), (y = document.createElement("video")).autoplay = !0, y.loop = !0, y.src = a, y.load();
                            var P = document.createElement("video");
                            P.autoplay = !0, P.loop = !0, P.src = s, P.load();
                            var R = new e.VideoTexture(y),
                                T = new e.VideoTexture(P);
                            R.magFilter = T.magFilter = e.LinearFilter, R.minFilter = T.minFilter = e.LinearFilter, P.addEventListener("loadeddata", function() {
                                P.play(), (T = new e.VideoTexture(P)).magFilter = e.LinearFilter, T.minFilter = e.LinearFilter, C.uniforms.texture2.value = T
                            }, !1), y.addEventListener("loadeddata", function() {
                                y.play(), (R = new e.VideoTexture(y)).magFilter = e.LinearFilter, R.minFilter = e.LinearFilter, C.uniforms.texture1.value = R
                            }, !1)
                        } else R = H.load(a, L), T = H.load(s, L), R.magFilter = T.magFilter = e.LinearFilter, R.minFilter = T.minFilter = e.LinearFilter;
                        var U = f;
                        r.offsetHeight / r.offsetWidth < U ? (E = 1, W = r.offsetHeight / r.offsetWidth / U) : (E = r.offsetWidth / r.offsetHeight * U, W = 1);
                        var C = new e.ShaderMaterial({
                            uniforms: {
                                intensity1: {
                                    type: "f",
                                    value: d
                                },
                                intensity2: {
                                    type: "f",
                                    value: l
                                },
                                dispFactor: {
                                    type: "f",
                                    value: 0
                                },
                                angle1: {
                                    type: "f",
                                    value: v
                                },
                                angle2: {
                                    type: "f",
                                    value: m
                                },
                                texture1: {
                                    type: "t",
                                    value: R
                                },
                                texture2: {
                                    type: "t",
                                    value: T
                                },
                                disp: {
                                    type: "t",
                                    value: V
                                },
                                res: {
                                    type: "vec4",
                                    value: new e.Vector4(r.offsetWidth, r.offsetHeight, E, W)
                                },
                                dpr: {
                                    type: "f",
                                    value: window.devicePixelRatio
                                }
                            },
                            vertexShader: "\nvarying vec2 vUv;\nvoid main() {\n  vUv = uv;\n  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}\n",
                            fragmentShader: "\nvarying vec2 vUv;\n\nuniform float dispFactor;\nuniform float dpr;\nuniform sampler2D disp;\n\nuniform sampler2D texture1;\nuniform sampler2D texture2;\nuniform float angle1;\nuniform float angle2;\nuniform float intensity1;\nuniform float intensity2;\nuniform vec4 res;\nuniform vec2 parent;\n\nmat2 getRotM(float angle) {\n  float s = sin(angle);\n  float c = cos(angle);\n  return mat2(c, -s, s, c);\n}\n\nvoid main() {\n  vec4 disp = texture2D(disp, vUv);\n  vec2 dispVec = vec2(disp.r, disp.g);\n\n  vec2 uv = 0.5 * gl_FragCoord.xy / (res.xy) ;\n  vec2 myUV = (uv - vec2(0.5))*res.zw + vec2(0.5);\n\n\n  vec2 distortedPosition1 = myUV + getRotM(angle1) * dispVec * intensity1 * dispFactor;\n  vec2 distortedPosition2 = myUV + getRotM(angle2) * dispVec * intensity2 * (1.0 - dispFactor);\n  vec4 _texture1 = texture2D(texture1, distortedPosition1);\n  vec4 _texture2 = texture2D(texture2, distortedPosition2);\n  gl_FragColor = mix(_texture1, _texture2, dispFactor);\n}\n",
                            transparent: !0,
                            opacity: 1
                        }),
                        b = new e.PlaneBufferGeometry(r.offsetWidth, r.offsetHeight, 1),
                        D = new e.Mesh(b, C);
                        x.add(D), window.addEventListener("resize", function(t) {
                            r.offsetHeight / r.offsetWidth < U ? (E = 1, W = r.offsetHeight / r.offsetWidth / U) : (E = r.offsetWidth / r.offsetHeight * U, W = 1), D.material.uniforms.res.value = new e.Vector4(r.offsetWidth, r.offsetHeight, E, W), w.setSize(r.offsetWidth, r.offsetHeight), L()
                        }), this.next = _, this.previous = z
                    } else console.warn("One or more images are missing");
                else console.warn("Parent missing");
                function _() {
                    t.to(C.uniforms.dispFactor, c, {
                        value: 1,
                        ease: h,
                        onUpdate: L,
                        onComplete: L
                    })
                }
                function z() {
                    t.to(C.uniforms.dispFactor, p, {
                        value: 0,
                        ease: h,
                        onUpdate: L,
                        onComplete: L
                    })
                }
            }
        });

 
        
    