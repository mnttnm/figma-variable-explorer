import { createContext, JSX, h } from "preact";
import { useState } from "preact/hooks";
import { NavItemId } from "../types/types";
import React from "preact/compat";

interface NavbarContext {
  showNavbar: boolean;
  toggleNavbar: () => void;
  activeNavItem: string;
  setActiveNavItem: (activeNavItem: NavItemId) => void;
}

const NavbarContext = createContext<NavbarContext | null>(null);

export const NavbarContextProvider = ({
  children,
}: {
  children: JSX.Element;
}) => {
  const [showNavbar, setShowNavbar] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState(
    NavItemId.variables
  );

  function toggleNavbar() {
    setShowNavbar(!showNavbar);
  }

  return (
    <NavbarContext.Provider
      value={{
        showNavbar,
        toggleNavbar,
        activeNavItem,
        setActiveNavItem,
      }}
    >
      {children}
    </NavbarContext.Provider>
  );
};

export default NavbarContext;
