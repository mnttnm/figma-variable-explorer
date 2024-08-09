import { h } from "preact";
import { useContext } from "preact/hooks";
import { VariablesContext } from "../contexts/VariablesContext";
import styles from "../style.css";
import React from "preact/compat";

const CollectionsSelector = () => {
  const { activeCollection, collections, changeActiveCollection } =
    useContext(VariablesContext)!;

  if (activeCollection === undefined || collections.length === 0) {
    return null;
  }

  const handleChange = (
    e: h.JSX.TargetedEvent<HTMLSelectElement, Event>
  ): void => {
    const selectedCollection = Number(
      (e.target as HTMLSelectElement).value
    ); // Use type assertion here
    changeActiveCollection(selectedCollection);
    e.preventDefault();
  };

  return (
    <select
      title={"Collections"}
      value={activeCollection}
      className={styles.collectionSelectorBox}
      onChange={handleChange}
    >
      {collections.map((collection, index) => (
        <option key={collection.id} value={index}>
          {collection.name}
        </option>
      ))}
    </select>
  );
};

export default CollectionsSelector;
