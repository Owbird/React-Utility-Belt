import {
  copyFileSync,
  existsSync,
  readFileSync,
  unlinkSync,
  writeFileSync
} from "fs";
import ora from "ora";
import { basename, join, resolve } from "path";
import { Options } from "../types/index.js";
import { logger, runCMD } from "../utils/index.js";

export async function CRAToVite(path: Options["path"]) {
  const fullPath = resolve(path);

  const project = basename(fullPath);

  logger.info(`[!] Migrating ${project} to Vite`);

  const spinner = ora("Uninstalling react-scripts").start();

  spinner.color = "green";

  await runCMD({
    cwd: fullPath,
    args: ["uninstall", "react-scripts"]
  });

  spinner.succeed("Uninstalled react-scripts");
  spinner.stop();

  spinner.text = "Installing vite";
  spinner.start();

  await runCMD({
    cwd: fullPath,
    args: ["install", "vite", "@vitejs/plugin-react"]
  });

  spinner.succeed("Installed vite");
  spinner.stop();

  spinner.text = "Restructring project";
  spinner.start();

  try {
    const jsFiles = ["index.js", "App.js"];

    for (let file of jsFiles) {
      const filePath = join(fullPath, "src", file);

      if (existsSync(filePath)) {
        copyFileSync(filePath, filePath.replace(".js", ".jsx"));

        unlinkSync(filePath);
      }
    }

    let data = readFileSync(join(fullPath, "public/index.html"), "utf8");

    data = data.replaceAll("%PUBLIC_URL%", "");

    const splitData = data.split(`<div id="root"></div>`);

    data = `${splitData[0]}
			<div id="root"></div>
		  <script type="module" src="/src/index.jsx"></script>
		  ${splitData[1]}
		`;

    writeFileSync(join(fullPath, "index.html"), data);

    unlinkSync(join(fullPath, "public/index.html"));

    spinner.succeed("Restructured project");
    spinner.stop();
  } catch (err) {
    if (err instanceof Error) {
      spinner.fail(err.message);
      spinner.stop();
    }
  }

  spinner.text = "Writting Vite config";
  spinner.start();

  const viteConfig = `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    plugins: [react()],
  };
});`;

  try {
    writeFileSync(join(fullPath, "vite.config.js"), viteConfig);

    spinner.succeed("Written Vite config");
    spinner.stop();
  } catch (err) {
    if (err instanceof Error) {
      spinner.fail(err.message);
      spinner.stop();
    }
  }

  spinner.text = "Updating package.json";
  spinner.start();

  try {
    const data = readFileSync(join(fullPath, "package.json"), "utf8");

    const jsonData = JSON.parse(data);

    jsonData["scripts"] = {
      start: "vite",
      build: "vite build",
      serve: "vite preview"
    };

    writeFileSync(
      join(fullPath, "package.json"),
      JSON.stringify(jsonData, null, 4)
    );

    spinner.succeed("Updated package.json");
    spinner.stop();
  } catch (err) {
    if (err instanceof Error) {
      spinner.fail(err.message);
      spinner.stop();
    }
  }
}
