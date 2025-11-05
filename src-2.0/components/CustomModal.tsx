import {
  Button,
  RadioButtons,
  RadioButtonsOption,
  Text,
} from "@create-figma-plugin/ui";
import { JSX, h } from "preact";
import styles from "../style.css";
import {
  forwardRef,
  ForwardedRef,
  useState,
  useContext,
  useEffect,
} from "preact/compat";
import { VariablesContext } from "../contexts/VariablesContext";
import React from "preact/compat";
import { useEscape } from "../hooks/hooks";
import { ExportScope, ExportContentType } from "../types";

interface CustomModalProps {
  showModal: boolean;
  onClose: () => void;
  exportContentType: ExportContentType;
}

export const CustomModal = forwardRef<
  HTMLDivElement,
  CustomModalProps
>(
  (
    { showModal, onClose, exportContentType }: CustomModalProps,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const [exportScope, setExportScope] = useState<ExportScope>("all");
    const { handleExport } = useContext(VariablesContext)!;

    // Prevent body scroll when modal is open
    useEffect(() => {
      if (showModal) {
        // Save current scroll position
        const scrollY = window.scrollY;

        // Prevent scroll
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';

        return () => {
          // Restore scroll
          document.body.style.overflow = '';
          document.body.style.position = '';
          document.body.style.top = '';
          document.body.style.width = '';
          window.scrollTo(0, scrollY);
        };
      }
    }, [showModal]);

    function handleOverlayClick(
      event: JSX.TargetedMouseEvent<HTMLDivElement>
    ) {
      // Only close if clicking the overlay itself, not the modal content
      if (event.target === event.currentTarget) {
        onClose();
      }
    }

    const exportOptions: Array<RadioButtonsOption> = [
      {
        children: <Text>Export All Variables</Text>,
        value: "all",
      },
      {
        children: <Text>Export Current Collection</Text>,
        value: "current",
      },
    ];

    useEscape(onClose);

    return (
      showModal && (
        <div
          ref={ref}
          className={styles.modalContainer}
          onClick={handleOverlayClick}
        >
          <section className={styles.confirmationPopover}>
            <h3>Export Variables</h3>
            <form>
              <RadioButtons
                onChange={(e) =>
                  setExportScope(e.currentTarget.value as ExportScope)
                }
                options={exportOptions}
                value={exportScope}
              />
              <footer className={styles.optionsPopoverFooter}>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    onClose();
                  }}
                  secondary
                  style={{ cursor: "pointer" }}
                >
                  Close
                </Button>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    handleExport(exportContentType, exportScope === "current");
                    onClose();
                  }}
                  style={{ cursor: "pointer" }}
                >
                  Export
                </Button>
              </footer>
            </form>
          </section>
          {/* </Modal> */}
        </div>
      )
    );
  }
);
