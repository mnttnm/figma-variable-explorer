import { h } from "preact";
import React from "preact/compat";
import styles from "../style.css";

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

export const Skeleton = ({ width = "100%", height = "16px", className = "" }: SkeletonProps) => {
  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={{
        width,
        height,
      }}
    />
  );
};

export const SkeletonTableRow = () => {
  return (
    <tr className={styles.tableRowContainer}>
      <td className={styles.tableValueItemContainer} style={{ width: "220px" }}>
        <Skeleton width="80%" height="14px" />
      </td>
      <td className={styles.tableValueItemContainer} style={{ width: "190px" }}>
        <div className={styles.colorValueContainer}>
          <Skeleton width="24px" height="24px" className={styles.skeletonColorSwatch} />
          <Skeleton width="60%" height="14px" />
        </div>
      </td>
      <td className={styles.tableValueItemContainer} style={{ width: "190px" }}>
        <div className={styles.colorValueContainer}>
          <Skeleton width="24px" height="24px" className={styles.skeletonColorSwatch} />
          <Skeleton width="70%" height="14px" />
        </div>
      </td>
    </tr>
  );
};

export const SkeletonTableHeader = () => {
  return (
    <thead className={styles.tableHead}>
      <tr className={styles.tableHeaderContainer}>
        <th className={styles.tableHeaderItemContainer} style={{ width: "220px" }}>
          <Skeleton width="50%" height="12px" />
        </th>
        <th className={styles.tableHeaderItemContainer} style={{ width: "190px" }}>
          <Skeleton width="40%" height="12px" />
        </th>
        <th className={styles.tableHeaderItemContainer} style={{ width: "190px" }}>
          <Skeleton width="40%" height="12px" />
        </th>
      </tr>
    </thead>
  );
};

export const SkeletonTable = () => {
  return (
    <main className={styles.tableContainer}>
      <table>
        <SkeletonTableHeader />
        <tbody>
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonTableRow key={index} />
          ))}
        </tbody>
      </table>
    </main>
  );
};