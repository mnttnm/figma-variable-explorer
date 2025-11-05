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

  // Smart truncation for long collection names
  const getPlaceholderText = () => {
    const collectionName = collections[activeCollection!].name;
    const maxLength = 20;
    if (collectionName.length > maxLength) {
      return `Search ${collectionName.substring(0, maxLength)}... (Cmd/Ctrl+F)`;
    }
    return `Search ${collectionName} (Cmd/Ctrl+F)`;
  };

  const handleClear = () => {
    setCurrentSearchTerm("");
  };

  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        id="search"
        placeholder={getPlaceholderText()}
        value={currentSearchTerm}
        onChange={(e) =>
          setCurrentSearchTerm((e.target as HTMLInputElement).value)
        }
        className={styles.searchInput}
        autoFocus
      />
      {currentSearchTerm && (
        <IconButton
          showBorder={false}
          onClick={handleClear}
          title="Clear search"
        >
          <CloseIcon />
        </IconButton>
      )}
      <IconButton
        showBorder
        onClick={() => setIsSearchActive(false)}
        title="Exit Search"
      >
        <CloseIcon />
      </IconButton>
    </div>
  );
};

export default SearchBar;
