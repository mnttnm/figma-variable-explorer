import { useContext } from "preact/hooks";
import {
  SearchContext,
  SearchContextState,
} from "../contexts/SearchContext";
import styles from "../style.css";
import IconButton from "./IconButton";
import { CloseIcon } from "./icons";
import { useEscape } from "../hooks/hooks";
import { VariablesContext } from "../contexts/VariablesContext";
import React from "preact/compat";
import { h } from "preact";

const SearchBar = () => {
  const {
    currentSearchTerm,
    setCurrentSearchTerm,
    setIsSearchActive,
  } = useContext(SearchContext) as SearchContextState;

  useEscape(() => setIsSearchActive(false));
  const { activeCollection, collections } =
    useContext(VariablesContext)!;

  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        id="search"
        placeholder={`Searching in ${
          collections[activeCollection!].name
        }`}
        value={currentSearchTerm}
        onChange={(e) =>
          setCurrentSearchTerm((e.target as HTMLSelectElement).value)
        }
        className={styles.searchInput}
      />
      <IconButton
        showBorder
        onClick={() => setIsSearchActive(false)}
        title="
        Cancel Search"
      >
        <CloseIcon />
      </IconButton>
    </div>
  );
};

export default SearchBar;
