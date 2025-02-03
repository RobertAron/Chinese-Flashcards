type AppServerEntrypointProps = {
  children?: React.ReactNode;
  params: Promise<Record<string, unknown>>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

type AppServerEntrypointCallback = (
  param: AppServerEntrypointProps,
) => Promise<React.ReactNode> | React.ReactNode;

export function AppServerEntrypoint(cb: AppServerEntrypointCallback) {
  return cb;
}
