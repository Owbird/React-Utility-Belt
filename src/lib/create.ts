import { select } from "@inquirer/prompts";
import { Command } from "commander";
import { readFileSync, writeFileSync } from "fs";
import ora from "ora";
import { basename, join } from "path";
import { logger, runCMD } from "../utils/index.js";

const supportedProjects = ["react"] as const;

type SupportedProject = (typeof supportedProjects)[number];

export function generateCreateCmd() {
  return new Command("create")
    .description("Create new project")
    .option("-p, --path <VALUE>", "Path to initialize project")
    .option("-t, --type <VALUE>", "Type of project")
    .option("-tcss, --tailwindcss", "Add Tailwind CSS")
    .option("-ts, --typescript", "Add Typescript")
    .showHelpAfterError()
    .action((args) => {
      const options = args as CreateOptions;

      handleCreate(options);
    });
}

async function handleCreate(options: CreateOptions) {
  const { type } = options;

  const hasProjectType = typeof type === "string";

  let choice = type;

  if (!hasProjectType) {
    choice = await select({
      message: "Select project type",
      choices: supportedProjects.map((type) => ({
        value: type
      }))
    });
  }

  const isSupportedProject = supportedProjects.includes(
    type?.toString().toLowerCase() as SupportedProject
  );

  if (!isSupportedProject && hasProjectType) {
    logger.error(`"${type}" is not supported yet\n`);

    choice = await select({
      message: "Select project type",
      choices: supportedProjects.map((type) => ({
        value: type
      }))
    });
  }

  switch (choice as SupportedProject) {
    case "react":
      createReactProject(options);
      break;
    default:
      break;
  }
}

async function createReactProject(options: CreateOptions) {
  const { tailwindcss, typescript } = options;

  const cwd = process.cwd();

  const args = process.argv;

  let projectName;

  if (args.length > 3) {
    projectName = args[3];
  } else {
    projectName = basename(cwd);
  }

  logger.info(`[+] Creating new project "${projectName}"`);

  const spinner = ora("").start();

  spinner.color = "green";

  await runCMD({
    cmd: "npm",
    args: [
      "create",
      "vite@latest",
      projectName,
      "--",
      "--template",
      typescript ? "react-ts" : "react"
    ],
    cwd
  });

  spinner.succeed("Created new project");
  spinner.stop();

  spinner.text = "Installing dependencies";
  spinner.start();

  const fullPath = join(cwd, projectName);

  await runCMD({
    args: ["install"],
    cwd: fullPath
  });

  await runCMD({
    args: ["add", "-D", "tailwindcss", "postcss", "autoprefixer"],
    cwd: fullPath
  });

  spinner.succeed("Installed dependencies");
  spinner.stop();

  if (tailwindcss) {
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
${tailwindcss ? "import tailwindcss from 'tailwindcss';" : ""}

export default defineConfig(() => {
  return {
    plugins: [react()],
    ${tailwindcss ? "css: { postcss: { plugins: [tailwindcss()] } }," : ""}
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

      writeFileSync(join(fullPath, "src/index.css"), `
      @tailwind base;
@tailwind components;
@tailwind utilities;
${indexCss}`);


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
  }
}
