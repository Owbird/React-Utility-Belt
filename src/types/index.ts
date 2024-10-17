interface MigrationOptions {
  type?: boolean | string;
  path: string;
}

type CreateOptions = {
  type?: string;
} & CreateOptionsArgs;

interface CreateOptionsArgs {
  tailwindcss?: boolean;
  typescript?: boolean;
  clerk?: boolean;
}
