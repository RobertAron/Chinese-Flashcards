type AppServerPageCallback = (param: {
  params: Promise<Record<string, unknown>>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => Promise<React.ReactNode> | React.ReactNode;

export function AppServerPageEntrypoint(cb: AppServerPageCallback) {
  return cb;
}
type AppServerLayoutCallback = (param: {
  params: Promise<Record<string, unknown>>;
  children: React.ReactNode
}) => Promise<React.ReactNode> | React.ReactNode;

export function AppServerLayoutEntrypoint(cb: AppServerLayoutCallback) {
  return cb;
}
