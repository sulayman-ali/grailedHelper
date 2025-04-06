function scrapeAndSortListings() {
    console.log("Scraping listings...");
    window.scrollTo(0,0); // reset back to top of page
    const listingsContainer = document.querySelector('.fitting-room-wrapper');
    if (!listingsContainer) {
        console.error("Listings container not found!");
        return;
    }

    const listings = Array.from(document.querySelectorAll('.carousel-listing-item')); // Convert NodeList to an Array
    console.log(`Found ${listings.length} listings`);

    const sortedListings = listings.map((listing, index) => {
        const linkElement = listing.querySelector('.listing-item-link');
        if (!linkElement) {
            console.warn(`Listing ${index + 1}: Missing link element`);
            return null;
        }

        const priceElement = listing.querySelector('[class^="Money-module__root"]');
        console.log("priceElement", priceElement);
        const priceText = priceElement ? priceElement.innerText.trim() : 'N/A';
        const price = parseFloat(priceText.replace(/[^0-9.-]+/g, "")) || 0; // Handle cases where price might be NaN

        // Clone the element to avoid reference issues during pagination
        return { element: listing.cloneNode(true), price: price };
    }).filter(item => item !== null); // Remove null values

    sortedListings.sort((a, b) => a.price - b.price); // Sort by price ascending
    console.log('Sorted Data', sortedListings);

    try {
        // Clear and repopulate the container
        listingsContainer.innerHTML = ''; // Clear existing listings
        sortedListings.forEach(item => {
            try {
                listingsContainer.appendChild(item.element);
            } catch (e) {
                console.warn('Failed to append listing:', e);
            }
        });
    } catch (e) {
        console.error('Error reordering listings:', e);
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scrape') {
        scrollToBottom(() => {
            scrapeAndSortListings();
            sendResponse({status: 'success'});
        });
        return true; // Required for async response
    }
});

// scrollToBottom(scrapeAndSortListings);