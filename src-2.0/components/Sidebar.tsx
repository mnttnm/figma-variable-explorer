import { h } from "preact";
import { useContext } from "preact/hooks";
import styles from "../style.css";
import { VariablesContext, VariableStatus } from "../contexts/VariablesContext";
import { CollectionIcon } from "./icons";

const Sidebar = () => {
  const { collections, activeCollection, changeActiveCollection, status } =
    useContext(VariablesContext)!;

  if (status !== VariableStatus.SUCCESS || collections.length === 0) {
    return null;
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <span className={styles.sidebarTitle}>Collections</span>
      </div>
      <nav className={styles.sidebarNav}>
        <ul className={styles.collectionList}>
          {collections.map((collection, index) => (
            <li key={collection.id}>
              <button
                className={`${styles.collectionItem} ${
                  activeCollection === index ? styles.collectionItemActive : ""
                }`}
                onClick={() => changeActiveCollection(index)}
                title={collection.name}
              >
                <CollectionIcon />
                <span className={styles.collectionName}>{collection.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
