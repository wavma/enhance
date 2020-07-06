export const disableDefault = (e) => {
  (e.ctrlKey || e.metaKey) && e.preventDefault();
};
