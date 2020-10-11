import { orderBy } from "lodash-es";
import { IDashboardsCard } from "./logic/reducer";

const filterEvents = (cards: IDashboardsCard[]) => {
    return orderBy(
        cards,
        [
          ({ event }: IDashboardsCard) => {
            return event.is_published_YN;
          },
          ({ event }: IDashboardsCard) => {
            return event.event_startdate;
          },
        ],
        ['desc', 'desc']
      );
}

export { filterEvents };