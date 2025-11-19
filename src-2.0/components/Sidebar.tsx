import { h } from "preact";
import { useContext } from "preact/hooks";
import styles from "../style.css";
import { VariablesContext, VariableStatus } from "../contexts/VariablesContext";
import { CollectionIcon } from "./icons";

const Sidebar = () => {
  const { collections, activeCollection, changeActiveCollection, status } =
    useContext(VariablesContext)!;

  const isLoading = status === VariableStatus.LOADING;
  const hasCollections = collections && collections.length > 0;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <span className={styles.sidebarTitle}>Collections</span>
      </div>
      <nav className={styles.sidebarNav}>
        <ul className={styles.collectionList}>
          {isLoading ? (
            <li>
              <div className={styles.collectionItem} style={{ opacity: 0.5, cursor: 'default' }}>
                <CollectionIcon />
                <span className={styles.collectionName}>Loading...</span>
              </div>
            </li>
          ) : hasCollections ? (
            collections.map((collection, index) => (
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
            ))
          ) : null}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
