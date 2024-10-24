import chalk from "chalk";
import { spawn } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { Ora } from "ora";
import { join } from "path";

interface runCMDArgs {
  cwd: string;
  args: string[];
  cmd?: string;
}

export const logger = {
  info: (text: string) => console.log(chalk.cyanBright(text)),
  error: (text: string) => console.log(chalk.red(text))
};

export async function runCMD({ cmd = "pnpm", args, cwd }: runCMDArgs) {
  await new Promise<void>((resolve, _) => {
    if (cmd === "pnpm") {
      cmd = "npx";

      args = ["--yes", "pnpm", ...args];
    }

    const child = spawn(cmd, args, {
      cwd,
      shell: true
    });

    child.stdout.on("data", (chunk) => console.log(chalk.green(chunk)));
    child.stderr.on("data", (chunk) => console.log(chalk.red(chunk)));

    child.on("close", () => resolve());
  });
}

export class ProjectValidator {
  public static exists(path: string) {
    if (!existsSync(path)) {
      logger.error(`[!] Path "${path}" does not exist`);

      process.exit(1);
    }
  }

  private static isValidProject(path: string) {
    this.exists(path);

    const packageJsonPath = join(path, "package.json");

    this.exists(packageJsonPath);
  }

  public static isCRAProject(path: string) {
    this.isValidProject(path);

    const packageJsonPath = join(path, "package.json");

    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));

    const scripts = Object.values(packageJson.scripts);

    const craExists = scripts.some((script) =>
      (script as string).includes("react-scripts")
    );

    if (!craExists) {
      logger.error(`[!] Path "${path}" is not a CRA project`);

      process.exit(1);
    }
  }
}

type AddArgParams = {
  typescript: boolean | undefined;
  fullPath: string;
  spinner: Ora;
};
export const addTailwindCss = async ({
  typescript,
  fullPath,
  spinner
}: AddArgParams) => {
  await runCMD({
    args: ["add", "-D", "tailwindcss", "postcss", "autoprefixer"],
    cwd: fullPath
  });

  spinner.succeed("Installed dependencies");
  spinner.stop();

  spinner.text = "Initing tailwind";
  spinner.start();

  await runCMD({
    cmd: "npx",
    args: ["tailwindcss", "init", "-p"],
    cwd: fullPath
  });

  spinner.succeed("Tailwind config generated");
  spinner.stop();

  const tailwindConfig = `
         /** @type {import('tailwindcss').Config} */
export default {
content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;

  spinner.text = "Updating tailwind config";
  spinner.start();

  try {
    writeFileSync(join(fullPath, "tailwind.config.js"), tailwindConfig);

    spinner.succeed("Updated tailwind config");
    spinner.stop();
  } catch (err) {
    if (err instanceof Error) {
      spinner.fail(err.message);
      spinner.stop();
    }
  }

  const viteConfig = `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';

export default defineConfig(() => {
  return {
    plugins: [react()],
    css: { postcss: { plugins: [tailwindcss()] } },
  };
});`;

  spinner.text = "Updating vite config";
  spinner.start();

  try {
    writeFileSync(
      join(fullPath, `vite.config.${typescript ? "ts" : "js"}`),
      viteConfig
    );

    spinner.succeed("Updated Vite config");
    spinner.stop();
  } catch (err) {
    if (err instanceof Error) {
      spinner.fail(err.message);
      spinner.stop();
    }
  }

  spinner.succeed("Tailwind configured");
  spinner.stop();

  spinner.text = "Updating index.css";
  spinner.start();

  try {
    const indexCss = readFileSync(join(fullPath, "src/index.css"), "utf8");

    writeFileSync(
      join(fullPath, "src/index.css"),
      `
      @tailwind base;
@tailwind components;
@tailwind utilities;
${indexCss}`
    );

    spinner.succeed("Updated index.css");
    spinner.stop();
  } catch (err) {
    if (err instanceof Error) {
      spinner.fail(err.message);
      spinner.stop();
    }
  }

  spinner.succeed("Tailwind configured");
  spinner.stop();
};

export const addClerk = async ({
  fullPath,
  spinner
}: Omit<AddArgParams, "typescript">) => {
  spinner.text = "Installing clerk dependencies";
  spinner.start();

  await runCMD({
    args: ["add", "@clerk/clerk-react"],
    cwd: fullPath
  });

  spinner.succeed("Installed clerk dependencies");
  spinner.stop();

  try {
    writeFileSync(
      join(fullPath, "src/main.tsx"),
      `
 import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ClerkProvider } from '@clerk/clerk-react'

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <App />
    </ClerkProvider>
  </React.StrictMode>,
)`
    );
  } catch (err) {
    if (err instanceof Error) {
      spinner.fail(err.message);
      spinner.stop();
    }
  }
};
