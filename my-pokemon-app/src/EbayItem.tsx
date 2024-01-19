type EbayItem = {
    itemId: string;
    title: string;
    globalId: string;
    primaryCategory: { categoryId: string, categoryName: string };
    galleryURL: string;
    viewItemURL: string;
    autoPay: string;
    postalCode: string;
    location: string;
    country: string;
    shippingInfo: any; // Consider defining a more specific type
    sellingStatus: any; // Consider defining a more specific type
    listingInfo: any; // Consider defining a more specific type
    returnsAccepted: string;
    condition: { conditionId: string, conditionDisplayName: string };
    isMultiVariationListing: string;
    topRatedListing: string;
};

export default EbayItem;