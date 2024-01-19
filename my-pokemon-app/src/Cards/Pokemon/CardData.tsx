import Attack from "./Attack";
import CardSet from "./CardSet";
import Weakness from "./Weakness";

type CardData = {
    id: string;
    name: string;
    supertype: string;
    subtypes: string[];
    level: string;
    hp: string;
    types: string[];
    attacks: Attack[];
    weaknesses: Weakness[];
    retreatCost: string[];
    convertedRetreatCost: number;
    set: CardSet;
    number: string;
    artist: string;
    rarity: string;
    flavorText: string;
    nationalPokedexNumbers: number[];
    legalities: Record<string, string>;
    images: {
        small: string;
        large: string;
    };
    tcgplayer?: {
        url: string;
        updatedAt: string;
        prices: Record<string, any>;
    };
    cardmarket?: {
        url: string;
        updatedAt: string;
        prices: Record<string, any>;
    };
};

export default CardData;