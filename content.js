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
    // if (request.action === 'scrape') {
    //     scrollToBottom(() => {
    //         scrapeAndSortListings();
    //         sendResponse({status: 'success'});
    //     });
    //     return true; // Required for async response
    // }
    if (request.action === 'scrape') { 
        scrapeAndSortListings();
        sendResponse({status: 'success'});
    }
});

// scrollToBottom(scrapeAndSortListings);