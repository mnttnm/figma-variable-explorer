import { h } from "preact";
import styles from "../style.css";
import React from "preact/compat";

export const OptionsPopover = () => {
  return (
    <ul className={styles.optionsPopover}>
      <li>
        <a href="https://forms.gle/FyMVqcuTrzJiX9zA9" target="_blank">
          Submit Feedback
        </a>
      </li>
      <li>
        <a
          href={"https://www.buymeacoffee.com/tatermohit"}
          target="_blank"
        >
          Support my Work
        </a>
      </li>
      <li className={styles.hireMeItem}>
        <a
          href={"https://docs.google.com/forms/d/e/1FAIpQLScaC89mjFKPybT2Bj5eOYSvB7quRf-xXtFXErVasQk5AXh3zg/viewform?usp=sf_link"}
          target="_blank"
          className={styles.hireMeButton}
        >
          Hire Me
        </a>
      </li>
    </ul>
  );
};
