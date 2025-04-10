export const useAlias = (props: {
  alias?: string;
  loadData?: string;
}): string => {
  const { alias, loadData } = props;

  if (!loadData && !alias) {
    throw new Error("Either alias or loadData must be provided");
  }

  return loadData || alias || "";
};
