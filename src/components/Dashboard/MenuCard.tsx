import { Link } from "react-router";

export function MenuCard({
  color,
  Icon,
  children,
  to,
}: {
  color: string;
  Icon: React.FC<{ className: string }>;
  children: React.ReactNode;
  to?: string;
}) {
  const disabled = !to;
  const content: React.ReactNode = (
    <>
      <div
        className={`${
          disabled ? "bg-gray-400" : color
        } flex-shrink-0 flex items-center justify-center w-16 text-white text-sm font-medium rounded-l-md`}
      >
        <Icon
          className={`${disabled ? "text-gray-200" : "text-white"} h-6 w-6`}
          aria-hidden="true"
        />
      </div>
      <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
        <div
          className={`${
            disabled ? "text-gray-400" : "text-gray-900"
          } flex-1 px-4 py-4 text-md truncate font-medium hover:text-gray-600`}
        >
          {children}
        </div>
      </div>
    </>
  );

  return (
    <li className="relative col-span-1 flex shadow-sm rounded-md mb-3">
      {disabled ? (
        content
      ) : (
        <Link className="relative w-full flex" to={to}>
          {content}
        </Link>
      )}
    </li>
  );
}
