import { spawn } from "child_process";
import chalk from "chalk";

interface runCMDArgs {
	cwd: string;
	args: string[];
	cmd?: string;
}

export const logger = {
	info: (text: string) => console.log(chalk.cyanBright(text)),
	error: (text: string) => console.log(chalk.red(text)),
};

export async function runCMD({ cmd = "npm", args, cwd }: runCMDArgs) {
	await new Promise<void>((resolve, reject) => {
		const child = spawn(cmd, args, {
			cwd,
		});

		child.stdout.on("data", (chunk) => console.log(chalk.green(chunk)));
		child.stderr.on("data", (chunk) => console.log(chalk.red(chunk)));

		child.on("close", () => resolve());
	});
}
