import EbayItem from '../Types/EbayItem';

/**
 * Formats raw eBay item data into a consistent EbayItem structure
 * @param items - An array of raw eBay item data
 * @returns An array of formatted EbayItem objects
 */
export const formatEbay = (items: any[]): EbayItem[] => {
    return items.map((item: any) => ({
        // Extract basic item information
        itemId: item.itemId?.[0] || '',
        title: item.title?.[0] || 'No title',
        globalId: item.globalId?.[0] || '',

        // Extract primary category information
        primaryCategory: {
            categoryId: item.primaryCategory?.[0].categoryId?.[0] || '',
            categoryName: item.primaryCategory?.[0].categoryName?.[0] || ''
        },

        // Extract image and item URLs
        galleryURL: item.galleryURL?.[0] || '',
        viewItemURL: item.viewItemURL?.[0] || '',

        // Extract additional item details
        autoPay: item.autoPay?.[0] || 'false',
        postalCode: item.postalCode?.[0] || '',
        location: item.location?.[0] || '',
        country: item.country?.[0] || '',

        // Extract complex objects
        shippingInfo: item.shippingInfo?.[0] || {},
        sellingStatus: item.sellingStatus?.[0] || {},
        listingInfo: item.listingInfo?.[0] || {},

        // Extract additional flags and conditions
        returnsAccepted: item.returnsAccepted?.[0] || 'false',
        condition: {
            conditionId: item.condition?.[0].conditionId?.[0] || '',
            conditionDisplayName: item.condition?.[0].conditionDisplayName?.[0] || ''
        },
        isMultiVariationListing: item.isMultiVariationListing?.[0] || 'false',
        topRatedListing: item.topRatedListing?.[0] || 'false'
    }));
};