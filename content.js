function scrapeAndSortListings() {
    console.log("Scraping listings...");
    
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

        const priceElement = listing.querySelector('.Money-module__root___jRyq5');
        const priceText = priceElement ? priceElement.innerText.trim() : 'N/A';
        const price = parseFloat(priceText.replace(/[^0-9.-]+/g, "")) || 0; // Handle cases where price might be NaN

        return { element: listing, price: price };
    }).filter(item => item !== null); // Remove null values

    sortedListings.sort((a, b) => a.price - b.price); // Sort by price ascending
    console.log('Sorted Data', sortedListings);

    // Sort listings in DOM
    listingsContainer.innerHTML = ''; // Clear existing listings
    sortedListings.forEach(item => {
        listingsContainer.appendChild(item.element);
    });
}

scrapeAndSortListings();