import CardImage from "./CardImage";
import CardPrice from "./CardPrice";
import CardSet from "./CardSet";

type YugiohCardData = {
    id: number;
    name: string;
    type: string;
    frameType: string;
    desc: string;
    atk: number;
    def: number;
    level: number;
    race: string;
    attribute: string;
    card_sets: CardSet[];
    card_images: CardImage[];
    card_prices: CardPrice[];
};

export default YugiohCardData;