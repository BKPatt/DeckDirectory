type CardFace = {
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

export default CardFace;