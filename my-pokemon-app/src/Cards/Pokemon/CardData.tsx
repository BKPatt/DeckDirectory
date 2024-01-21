export type CardData = {
    id: string;
    name: string;
    supertype: string;
    subtypes: string[];
    level: string;
    hp: string;
    types: EnergyType[];
    evolvesFrom?: string;
    abilities?: Ability[];
    attacks: Attack[];
    weaknesses: Weakness[];
    retreatCost: EnergyType[];
    convertedRetreatCost: number;
    set: CardSet;
    rules?: string[];
    number: string;
    artist: string;
    rarity: string;
    flavorText: string;
    nationalPokedexNumbers: number[];
    legalities: Legalities;
    images: {
        small: string;
        large: string;
    };
    tcgplayer?: Tcgplayer;
    cardmarket?: Cardmarket;
};

export type Attack = {
    name: string;
    cost: EnergyType[];
    convertedEnergyCost: number;
    damage: string;
    text: string;
};

export type Cardmarket = {
    url: string;
    updatedAt: string;
    prices: CardmarketPrices;
};

export type Legalities = {
    unlimited: 'Legal' | 'Banned' | 'Restricted';
    standard: 'Legal' | 'Banned' | 'Restricted';
    expanded: 'Legal' | 'Banned' | 'Restricted';
};

export type CardImage = {
    id: number;
    image_url: string;
    image_url_small: string;
    image_url_cropped: string;
};

export type CardmarketPrices = {
    averageSellPrice: number;
    lowPrice: number;
    trendPrice: number;
    germanProLow: number | null;
    suggestedPrice: number | null;
    reverseHoloSell: number | null;
    reverseHoloLow: number | null;
    reverseHoloTrend: number | null;
    lowPriceExPlus: number;
    avg1: number;
    avg7: number;
    avg30: number;
    reverseHoloAvg1: number | null;
    reverseHoloAvg7: number | null;
    reverseHoloAvg30: number | null;
};

export type CardSet = {
    id: string;
    name: string;
    series: string;
    printedTotal: number;
    total: number;
    legalities: Legalities;
    ptcgoCode: string;
    releaseDate: string;
    updatedAt: string;
    images: {
        symbol: string;
        logo: string;
    };
};

export type EnergyType = 'Colorless' | 'Darkness' | 'Fairy' | 'Fighting' | 'Fire' | 'Grass' | 'Lightning' | 'Metal' | 'Psychic' | 'Water';

export type Ability = {
    name: string;
    text: string;
    type: 'Ability';
};

export type Weakness = {
    type: EnergyType;
    value: string;
};

export type Tcgplayer = {
    url: string;
    updatedAt: string;
    prices: {
        normal: Prices;
        reverseHolofoil: Prices;
    };
};

export type Prices = {
    low: number;
    mid: number;
    high: number;
    market: number;
    directLow?: number;
};