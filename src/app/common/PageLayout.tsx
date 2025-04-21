import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router";

type Props = {
  title: React.ReactNode;
  action?: React.ReactNode;
  onBackClick?: () => void;
  children: React.ReactNode;
};

export function PageLayout({ title, action, onBackClick, children }: Props) {
  const navigate = useNavigate();

  return (
    <div className="bg-white flex flex-col h-screen  font-sans">
      <div className="pl-4 pr-6 pt-4 pb-4 border-b border-t border-gray-200 sm:pl-6 lg:pl-8 xl:pl-6 xl:pt-6 xl:border-t-0">
        <div className="flex items-center">
          <div className="flex-1">
            <button
              onClick={() => (onBackClick ? onBackClick() : navigate(-1))}
              className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              <ChevronLeftIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          {typeof title === "string" ? (
            <h1 className="flex-2 text-lg font-medium text-center">{title}</h1>
          ) : (
            title
          )}
          <span className="flex-1" />
          {action}
        </div>
      </div>
      {children}
    </div>
  );
}
