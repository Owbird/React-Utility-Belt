import { input, select } from "@inquirer/prompts";
import { Command } from "commander";
import ora from "ora";
import { join } from "path";
import { addTailwindCss, logger, runCMD } from "../utils/index.js";

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
      createReactProject({
        typescript: options.typescript,
        tailwindcss: options.tailwindcss
      });
      break;
    default:
      break;
  }
}

async function createReactProject(options: CreateOptionsArgs) {
  const { tailwindcss, typescript } = options;

  const cwd = process.cwd();

  const projectName = await input({
    required: true,
    message: "Enter project name"
  });

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

  if (tailwindcss) {
    await addTailwindCss({ spinner, fullPath, typescript });
  }

  spinner.succeed("Installed dependencies");
  spinner.stop();
}
