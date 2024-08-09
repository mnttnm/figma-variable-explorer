import { h, JSX } from "preact";

import React, { useContext } from "preact/compat";
import { IconButton } from "@create-figma-plugin/ui";

import {
  VariablesIcon,
  ExportIcon,
  SettingsIcon,
  UserIcon,
  MenuIcon,
} from "../../components/icons";
import NavItem from "../../components/NavItem";
import NavbarContext from "../../contexts/NavbarContext";
import styles from "../../style.css";
import { NavItemInfo, NavItemId } from "../../types/types";

const navItems: NavItemInfo[] = [
  {
    icon: <VariablesIcon />,
    title: "Variables",
    isActive: true,
    id: NavItemId.variables,
  },
  {
    icon: <ExportIcon />,
    title: "Export",
    isActive: false,
    id: NavItemId.export,
  },
  {
    icon: <SettingsIcon />,
    title: "Configuration",
    isActive: false,
    id: NavItemId.config,
  },
  {
    icon: <UserIcon />,
    title: "Help & Support",
    isActive: false,
    id: NavItemId.help,
  },
];

const Navbar = () => {
  const { activeNavItem, toggleNavbar, setActiveNavItem } =
    useContext(NavbarContext) as NavbarContext;

  const handleNavItemClick = (id: NavItemId) => {
    setActiveNavItem(id);
    toggleNavbar();
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarTitleContainer}>
        <IconButton showBorder={false} onClick={() => toggleNavbar()}>
          <MenuIcon />
        </IconButton>
      </div>
      <ul className={styles.navItemsContainer}>
        {navItems.map((navItem) => (
          <NavItem
            onClick={() => handleNavItemClick(navItem.id)}
            isActive={activeNavItem === navItem.id}
            icon={navItem.icon}
            title={navItem.title}
          />
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
