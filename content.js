function scrapeListings() {
    console.log("Scraping listings...");
    const listings = document.querySelectorAll('.carousel-listing-item');
    console.log(`Found ${listings.length} listings`);

    const scrapedData = Array.from(listings).map((listing, index) => {
        console.log(`\nScraping listing ${index + 1}...`, listing);

        const linkElement = listing.querySelector('.listing-item-link');
        if (!linkElement) {
            console.warn(`Listing ${index + 1}: Missing link element`);
            return null;
        }

        const titleElement = linkElement.querySelector('[data-cy="listing-title"]');
        const title = titleElement ? titleElement.innerText.trim() : 'N/A';

        const priceElement = listing.querySelector('.Money-module__root___jRyq5');
        const price = priceElement ? priceElement.innerText.trim() : 'N/A';

        const designerElement = listing.querySelector('.ListingMetadata-module__designer___h3Tc\\+'); // Escaping the `+`
        const designer = designerElement ? designerElement.innerText.trim() : 'N/A';

        const sizeElement = listing.querySelector('.ListingMetadata-module__size___e9naE');
        const size = sizeElement ? sizeElement.innerText.trim() : 'N/A';

        console.log(`Listing ${index + 1} Details:`, { title, price, designer, size });

        return { title, price, designer, size,};
    }).filter(item => item !== null); // Remove null values if any listings were skipped

    console.log("\nFinal Scraped Data:", scrapedData);
}

scrapeListings();