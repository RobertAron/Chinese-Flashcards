type AppServerPageProps = {
  params: Promise<Record<string, unknown>>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

type AppServerPageCallback = (param: AppServerPageProps) => Promise<React.ReactNode> | React.ReactNode;

export function AppServerPageEntrypoint(cb: AppServerPageCallback) {
  return cb;
}
type AppServerLayoutProps = AppServerPageProps & { children: React.ReactNode };

type AppServerLayoutCallback = (param: AppServerLayoutProps) => Promise<React.ReactNode> | React.ReactNode;

export function AppServerLayoutEntrypoint(cb: AppServerLayoutCallback) {
  return cb;
}
