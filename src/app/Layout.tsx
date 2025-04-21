import { Avatar } from "@/components/avatar";
import { Button } from "@/components/button";
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from "@/components/dropdown";
import {
  Navbar,
  NavbarItem,
  NavbarSection,
  NavbarSpacer,
} from "@/components/navbar";
import { Strong } from "@/components/text";

import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/16/solid";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import { Outlet, useLocation, useNavigate } from "react-router";

export function Layout({ avatar }: { avatar: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const showBackButton = location.pathname !== "/";

  return (
    <div className="relative isolate flex min-h-svh w-full flex-col bg-white lg:bg-zinc-100 dark:bg-zinc-900 dark:lg:bg-zinc-950">
      <header className="flex items-center px-4">
        {showBackButton ? (
          <Button plain onClick={() => navigate(-1)}>
            <ChevronLeftIcon /> Back
          </Button>
        ) : (
          <Strong className="text-lg">FamilyScrum</Strong>
        )}
        <div className="min-w-0 flex-1">
          <Navbar>
            <NavbarSpacer />
            <NavbarSection>
              <Dropdown>
                <DropdownButton as={NavbarItem}>
                  <Avatar src={avatar} square />
                </DropdownButton>
                <DropdownMenu className="min-w-64" anchor="bottom end">
                  <DropdownItem href="/logout">
                    <ArrowRightStartOnRectangleIcon />
                    <DropdownLabel>Sign out</DropdownLabel>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </NavbarSection>
          </Navbar>
        </div>
      </header>

      <main className="flex flex-1 flex-col pb-2 lg:px-2">
        <div className="grow p-6 lg:rounded-lg lg:bg-white lg:p-10 lg:shadow-xs lg:ring-1 lg:ring-zinc-950/5 dark:lg:bg-zinc-900 dark:lg:ring-white/10">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
