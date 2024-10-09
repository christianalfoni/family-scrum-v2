export const WeekdaySlideContent = ({
  title,
  date,
  children,
}: {
  title: string;
  date: string;
  children: React.ReactNode;
}) => (
  <div className="px-6 h-full">
    <div className="flex items-center">
      <h1 className="text-xl">{title}</h1>
      <span className="text-md text-gray-500 ml-auto">{date}</span>
    </div>
    <div className="h-full overflow-y-scroll">
      <div className="pb-12">{children}</div>
    </div>
  </div>
);
