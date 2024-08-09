import { h } from "preact";
import styles from "../style.css";
import { createClassName, Divider } from "@create-figma-plugin/ui";
import { useContext } from "preact/hooks";
import ConfigurationContext from "../contexts/ConfigurationContext";
import React from "preact/compat";

export const OptionsPopover = ({
  openModal,
}: {
  openModal: () => void;
}) => {
  const { setCurrentPopoverType } = useContext(ConfigurationContext)!;

  return (
    <ul className={createClassName([styles.optionsPopover])}>
      <li
        onClick={() => {
          openModal();
          setCurrentPopoverType("none");
        }}
      >
        Export data as Markdown
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
      <li className={styles.disabledOption}>Help (Coming Soon)</li>
    </ul>
  );
};
