type PageParam = {
  params: Promise<Record<string, unknown>>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

type AppPage = (param: PageParam) => Promise<React.ReactNode> | React.ReactNode;

export function AppPage(cb: AppPage) {
  return cb;
}
