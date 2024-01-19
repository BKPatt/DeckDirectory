import EbayItem from '../Types/EbayItem';

export const formatEbay = (items: any[]): EbayItem[] => {
    return items.map((item: any) => ({
        itemId: item.itemId?.[0] || '',
        title: item.title?.[0] || 'No title',
        globalId: item.globalId?.[0] || '',
        primaryCategory: {
            categoryId: item.primaryCategory?.[0].categoryId?.[0] || '',
            categoryName: item.primaryCategory?.[0].categoryName?.[0] || ''
        },
        galleryURL: item.galleryURL?.[0] || '',
        viewItemURL: item.viewItemURL?.[0] || '',
        autoPay: item.autoPay?.[0] || 'false',
        postalCode: item.postalCode?.[0] || '',
        location: item.location?.[0] || '',
        country: item.country?.[0] || '',
        shippingInfo: item.shippingInfo?.[0] || {}, // Default to an empty object
        sellingStatus: item.sellingStatus?.[0] || {}, // Default to an empty object
        listingInfo: item.listingInfo?.[0] || {}, // Default to an empty object
        returnsAccepted: item.returnsAccepted?.[0] || 'false',
        condition: {
            conditionId: item.condition?.[0].conditionId?.[0] || '',
            conditionDisplayName: item.condition?.[0].conditionDisplayName?.[0] || ''
        },
        isMultiVariationListing: item.isMultiVariationListing?.[0] || 'false',
        topRatedListing: item.topRatedListing?.[0] || 'false'
    }));
};