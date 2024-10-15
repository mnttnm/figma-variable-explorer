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

    function handleOverlayClick(
      event: JSX.TargetedMouseEvent<HTMLDivElement>
    ) {
      onClose();
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
        <div ref={ref} className={styles.modalContainer}>
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
