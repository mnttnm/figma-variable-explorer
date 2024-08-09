export const createFileFromContent = (
  fileName: string,
  content: string
) => {
  // this need to go via UI layer?

  const blob = new Blob([content], {
    type: "text/plain;charset=utf-8",
  });
  const link = document.createElement("a");
  link.download = fileName;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
};
