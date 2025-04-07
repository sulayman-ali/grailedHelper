function showToast(message, duration = 3000) {
    // Create toast element
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: -100px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(8px);
        color: #333;
        padding: 16px; 
        border-radius: 8px;
        box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        opacity: 0;
        transition: all 0.3s ease-out;
        border: 1px solid rgba(255, 255, 255, 0.2);
        max-width: 80%;
        width: max-content;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.bottom = '20px';
    }, 10);

    // Animate out and remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.bottom = '-100px';
        setTimeout(() => document.body.removeChild(toast), 300);
    }, duration);
}

function scrapeAndSortListings() {
    console.log("Scraping listings...");
    window.scrollTo(0,0); // reset back to top of page
    const listingsContainer = document.querySelector('.fitting-room-wrapper');
    if (!listingsContainer) {
        console.error("Listings container not found!");
        return;
    }

    const listings = Array.from(document.querySelectorAll('.carousel-listing-item'));
    console.log(`Found ${listings.length} listings`);

    // Instead of cloning, store the original elements and their prices
    const sortedListings = listings.map((listing, index) => {
        const priceElement = listing.querySelector('[class^="Money-module__root"]');
        const priceText = priceElement ? priceElement.innerText.trim() : 'N/A';
        const price = parseFloat(priceText.replace(/[^0-9.-]+/g, "")) || 0;

        return { element: listing, price: price };
    });

    sortedListings.sort((a, b) => a.price - b.price);
    console.log('Sorted Data', sortedListings);

    try {
        // Reorder elements without clearing the container
        sortedListings.forEach(item => {
            listingsContainer.appendChild(item.element);
        });
        showToast('🔃 Listings sorted by price!');
    } catch (exc) {
        console.error('Error reordering listings:', exc);
        showToast('❌ Error sorting listings', 4000);
    }
}

function scrollToBottom(callback) {
    let lastHeight = document.body.scrollHeight;
    console.log("Scrolling to bottom");
    console.log("lastHeight", lastHeight);
    const interval = setInterval(() => {
        window.scrollTo(0, document.body.scrollHeight); // Scrolls the window to the bottom of the page by setting vertical scroll position (y) to the total scrollable height
        const newHeight = document.body.scrollHeight;
        console.log("newHeight", newHeight);
        if (newHeight === lastHeight) {
            console.log("Reached bottom");
            clearInterval(interval);
            callback();
        } else{
            console.log("Scrolling");
            lastHeight = newHeight;
        }
    }, 300);
}

// Create a mutation observer to watch for new listings
function setupPaginationObserver() {
    const listingsContainer = document.querySelector('.fitting-room-wrapper');
    if (!listingsContainer) {
        console.error("Listings container not found!");
        return;
    }

    let isSorting = false;  // Add flag to prevent recursive sorting

    const observer = new MutationObserver((mutations) => {
        // Skip if we're currently sorting
        if (isSorting) return;

        // Check if new listings were added
        const hasNewListings = mutations.some(mutation => 
            Array.from(mutation.addedNodes).some(node => 
                node.classList && node.classList.contains('carousel-listing-item')
            )
        );

        if (hasNewListings) {
            console.log("New listings detected, resorting...");
            isSorting = true;  // Set flag before sorting
            scrapeAndSortListings();
            setTimeout(() => {  // Reset flag after DOM updates are complete
                isSorting = false;
            }, 100);
        } 
    });

    // Configure and start the observer
    observer.observe(listingsContainer, {
        childList: true,
        subtree: true
    });
}

// Modify the message listener to setup the observer when sorting is first triggered
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scrape') { 
        scrapeAndSortListings();
        setupPaginationObserver();  // Start watching for new items
        sendResponse({status: 'success'});
    }
});

// scrollToBottom(scrapeAndSortListings);