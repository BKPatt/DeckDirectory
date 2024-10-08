import { CardList } from "./CardList";
import CardType from "./CardType";

type ListsState = {
    lists: CardList[];
    newListName: string;
    newListType: CardType;
    dialogOpen: boolean;
    selectedList: CardList | null;
    deleteDialogOpen: boolean;
    listToDelete: CardList | null;
    addCardsDialogOpen: boolean;
    isInAddMode: boolean;
};

export default ListsState;