import { h } from "preact";
import styles from "../style.css";
import { createClassName, Divider } from "@create-figma-plugin/ui";
import { useContext, useEffect, useRef } from "preact/hooks";
import ConfigurationContext from "../contexts/ConfigurationContext";
import React from "preact/compat";
import { ExportContentType } from "../types";

export const OptionsPopover = ({
  openModal,
}: {
    openModal: (exportContentType: ExportContentType) => void;
}) => {
  const { setCurrentPopoverType } = useContext(ConfigurationContext)!;

  return (
    <ul className={styles.optionsPopover}>
      <li
        onClick={() => {
          openModal("markdown");
          setCurrentPopoverType("none");
        }}
      >
        Export data as Markdown
      </li>
      <li
        onClick={() => {
          openModal("json");
          setCurrentPopoverType("none");
        }}
      >
        Export data as JSON
      </li>
      <li
        onClick={() => {
          openModal("css");
          setCurrentPopoverType("none");
        }}
      >
        Export data as CSS
      </li>
      <Divider />
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
