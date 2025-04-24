export type MorphLoadDataProps = {
  loadData?: string;
  alias?: string;
  variables?: Record<string, unknown>;
  loadDataUrl?: (loadData: string) => string | string;
};

export type MorphPostDataProps = {
  postData: string;
  postDataUrl?: (loadData: string) => string;
  variables?: Record<string, unknown>;
};
