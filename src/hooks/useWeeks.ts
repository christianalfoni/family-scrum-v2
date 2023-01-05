import { collection, Firestore, getDocs } from "firebase/firestore";
import { useCache } from "../useCache";
import { FAMILY_DATA_COLLECTION } from "../useFirebase";
import { getPreviousWeekId, getCurrentWeekId, getNextWeekId } from "../utils";
import { User } from "./useCurrentUser";

// Each user has an array representing each day of the week,
// which holds a boolean if the todo is active or not
export type WeekTodoActivity = [
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean
];

export type WeekDinnersDTO = [
  string | null,
  string | null,
  string | null,
  string | null,
  string | null,
  string | null,
  string | null
];

export type WeekDTO = {
  // Week id is the date of each Monday (YYYYMMDD)
  id: string;
  todos: {
    [todoId: string]: {
      [userId: string]: WeekTodoActivity;
    };
  };
  dinners: WeekDinnersDTO;
};

export type Weeks = Record<string, WeekDTO>;

const WEEKS_COLLECTION = "weeks";
const WEEKS_TODOS_COLLECTION = "todos";

const weekIds = [getPreviousWeekId(), getCurrentWeekId(), getNextWeekId()];

const fetchWeeks = async (firestore: Firestore, familyId: string) => {
  const weeksRef = collection(
    firestore,
    FAMILY_DATA_COLLECTION,
    familyId,
    WEEKS_COLLECTION
  );

  return getDocs(weeksRef);
};

export const useWeeks = (user: User) => {
  const weeksCache = useCache("weeks", () => {});

  const [, setWeeks] = weeksCache;

  return weeksCache;
};

/*
    const cache = useCache('user')
    
    cache.read()
    cache.suspend()
    cache.write()
    
    const userCache = useCurrentUser()
    const user = userCache.suspend()
    
    const data = useSuspendCaches([
        userCache
    ])
*/
