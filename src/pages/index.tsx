import React from "react";
import Link from "next/link";

const Button = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <Link href={href}>
    <a className="bg-gray-200 p-8 m-4 rounded-md shadow-md text-2xl font-bold text-gray-800 w-80 text-center">
      {children}
    </a>
  </Link>
);

function HomePage() {
  return (
    <div className="bg-gray-100 h-screen w-screen flex items-center justify-center">
      <Button href="/family">Family</Button>
      <Button href="/me">Me</Button>
    </div>
  );
}

export default HomePage;
