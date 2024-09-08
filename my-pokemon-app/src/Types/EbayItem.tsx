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
    shippingInfo: any; // TODO: Consider defining a more specific type
    sellingStatus: any; // TODO: Consider defining a more specific type
    listingInfo: any; // TODO: Consider defining a more specific type
    returnsAccepted: string;
    condition: { conditionId: string, conditionDisplayName: string };
    isMultiVariationListing: string;
    topRatedListing: string;
};

export default EbayItem;