import { h, JSX } from "preact";
import styles from "../style.css";
import React from "preact/compat";

function NavItem({
  icon,
  title,
  isActive,
  onClick,
}: {
  icon: JSX.Element;
  title: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <li
      className={[styles.navItemContainer].join(" ")}
      onClick={() => onClick()}
    >
      {icon}
      <span className={styles.navItemLabel}>{title}</span>
    </li>
  );
}

export default NavItem;
