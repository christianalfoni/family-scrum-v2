import { ChevronLeftIcon, PlusIcon } from "@heroicons/react/24/solid";
import { DinnerDTO } from "../environment/Persistence";
import { useFamilyScrum } from "./FamilyScrumContext";
import { useNavigate } from "react-router";
import { PageLayout } from "./common/PageLayout";

function Dinner({
  dinner,
  onClick,
}: {
  dinner: DinnerDTO;
  onClick: (id: string) => void;
}) {
  const familyScrum = useFamilyScrum();
  const dinnerImageQuery = dinner.imageRef
    ? familyScrum.dinners.queryDinnerImage(dinner.imageRef)
    : null;
  return (
    <li
      key={dinner.id}
      onClick={() => {
        onClick(dinner.id);
      }}
    >
      <div className="flex items-center py-4 px-8 space-x-3 h-24">
        <div className="flex-shrink-0 h-16 w-16">
          {dinnerImageQuery?.value ? (
            <img
              className="h-16 w-16 rounded"
              src={dinnerImageQuery.value}
              alt=""
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-md font-medium text-gray-900">{dinner.name}</p>
          <p className="text-sm text-gray-500">{dinner.description}</p>
        </div>
      </div>
    </li>
  );
}

export function Dinners() {
  const navigate = useNavigate();
  const familyScrum = useFamilyScrum();
  const dinnersQuery = familyScrum.dinners.dinnersQuery;

  return (
    <PageLayout
      title="Dinners"
      action={
        <button className="ml-auto" onClick={() => navigate("/dinners/new")}>
          <PlusIcon className="w-6 h-6" />
        </button>
      }
    >
      {dinnersQuery.isFetching ? (
        <div className="flex items-center justify-center h-full">Loading..</div>
      ) : dinnersQuery.value?.length ? (
        <ul className="relative z-0 divide-y divide-gray-200 border-b border-gray-200 overflow-y-scroll">
          {dinnersQuery.value.map((dinner) => (
            <Dinner
              key={dinner.id}
              dinner={dinner}
              onClick={() => navigate(`/dinners/${dinner.id}`)}
            />
          ))}
        </ul>
      ) : (
        <div className="flex items-center justify-center h-full">
          <a
            onClick={() => navigate("/dinners/new")}
            className="ml-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            New Dinner
          </a>
        </div>
      )}
    </PageLayout>
  );
}
