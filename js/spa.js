document.addEventListener('DOMContentLoaded', () => {
    const music = document.getElementById('background-music');
    // Function to handle link clicks
    const handleLinkClick = (e) => {
        const link = e.currentTarget;
        const url = link.getAttribute('href');

        // Check if it's an internal link
        if (url && !url.startsWith('http') && !url.startsWith('#')) {
            e.preventDefault();
            loadPage(url);
        }
    };

    // Attach initial event listeners
    const attachMenuListeners = () => {
        document.querySelectorAll('#menu a').forEach(link => {
            link.removeEventListener('click', handleLinkClick); // Remove old listener
            link.addEventListener('click', handleLinkClick); // Add new listener
        });
    };
    
    attachMenuListeners();


    // Handle browser back/forward buttons
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.path) {
            loadPage(e.state.path, false);
        }
    });

    async function loadPage(url, pushState = true) {
        try {
            // Add a class to body to indicate loading
            document.body.classList.add('page-loading');
            
            const response = await fetch(url);
            if (!response.ok) {
                // If the fetch fails, fall back to standard navigation
                window.location.href = url;
                return;
            }
            const text = await response.text();

            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');

            const newLeft = doc.querySelector('#left');
            const newRight = doc.querySelector('#right');
            const newTitle = doc.querySelector('title');

            if (newLeft && newRight) {
                document.querySelector('#left').innerHTML = newLeft.innerHTML;
                document.querySelector('#right').innerHTML = newRight.innerHTML;
                document.title = newTitle ? newTitle.innerText : '';

                if (pushState) {
                    history.pushState({ path: url }, '', url);
                }

                // Play music if it's paused
                if (music && music.paused) {
                    music.play().catch(e => console.error("Autoplay was prevented:", e));
                }
                
                // Re-trigger animations
                const leftEl = document.querySelector('#left');
                const rightEl = document.querySelector('#right');
                leftEl.classList.remove('slide-in-left');
                rightEl.classList.remove('slide-in-right');
                void leftEl.offsetWidth; // Trigger reflow
                leftEl.classList.add('slide-in-left');
                rightEl.classList.add('slide-in-right');

                // Re-attach listeners to any new content if necessary
                // Since the menu is not replaced, we don't need to re-attach for it
                // unless other dynamic content requires it.

            } else {
                // Fallback for pages with unexpected structure
                window.location.href = url;
            }

        } catch (error) {
            console.error('Error loading page, falling back to standard navigation:', error);
            window.location.href = url; // Fallback
        } finally {
            // Remove loading indicator
            document.body.classList.remove('page-loading');
        }
    }

    // Set initial state for history
    history.replaceState({ path: window.location.pathname }, '', window.location.href);

    // Try to play music on first load
    if (music) {
        music.play().catch(e => {
            console.log("Browser prevented initial autoplay. User interaction needed.");
            // Optional: Show a "click to play" button
        });
    }
});
