import Card from "./Card";
import CardType from "./CardType";

type CardList = {
    id: string;
    created_by: string;
    created_on: string;
    name: string;
    type: CardType;
    cards: Card[];
    market_value: number;
};

export default CardList;