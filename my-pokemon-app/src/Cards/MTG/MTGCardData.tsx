export type MTGCardData = {
    id: string;
    oracle_id: string;
    name: string;
    lang: string;
    released_at: string;
    uri: string;
    layout: string;
    image_uris?: {
        small: string;
        normal: string;
        large: string;
        png: string;
        art_crop: string;
        border_crop: string;
    };
    cmc: number;
    type_line: string;
    color_identity: string[];
    keywords: string[];
    legalities: Record<string, string>;
    games: string[];
    set: string;
    set_name: string;
    set_type: string;
    rarity: string;
    artist: string;
    prices: Record<string, string | null>;
    related_uris: Record<string, string>;
    card_faces?: CardFace[];
    all_parts?: RelatedCard[];
};

export type RelatedCard = {
    id: string;
    component: string;
    name: string;
    type_line: string;
    uri: string;
};

export type CardFace = {
    name: string;
    mana_cost: string;
    type_line: string;
    oracle_text: string;
    colors: string[];
    power: string;
    toughness: string;
    artist: string;
    image_uris: {
        small: string;
        normal: string;
        large: string;
    };
};

