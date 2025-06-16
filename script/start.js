import { execSync } from "child_process";
import { existsSync, mkdirSync, readdirSync, copyFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import path from "path";

function stringToBoolean(str) {
  return str === "true"; // "true" → true, всё остальное → false
}

const basePath = process.env.BASE_PATH || "../";
const git_reset = stringToBoolean(process.env.SETTINGS_GIT_RESET) || true;
const git_pull = stringToBoolean(process.env.SETTINGS_GIT_PULL) || true;
const install_packages =
  stringToBoolean(process.env.SETTINGS_INSTALL_PACKAGES) || true;

let serverProcess;
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);
const pathToProject = join(_dirname, basePath);
const pathToRoot = join(pathToProject);

const copyDir = (src, dest) => {
  console.log("----------------COPY DIR----------------");

  if (!existsSync(src)) {
    console.error(`Source directory ${src} does not exist.`);
    return;
  }

  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
    console.log(`Created destination directory ${dest}`);
  }

  const entries = readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      // Recursively copy directories
      copyDir(srcPath, destPath);
    } else {
      // Copy files
      copyFileSync(srcPath, destPath);
      console.log(`Copied ${srcPath} to ${destPath}`);
    }
  }
};

const pull = () => {
  console.log("----------------PULL AND RESET----------------");
  try {
    if (git_reset) {
      console.log("Starting git reset...");
      execSync("git reset --hard", { stdio: "inherit", cwd: pathToRoot });
    }
    if (git_pull) {
      console.log("Starting git pull...");
      execSync("git pull", { stdio: "inherit", cwd: pathToRoot });
    }
    console.log("Pull completed successfully.");
  } catch (error) {
    console.error("Error during git pull:", error.message);
    return;
  }

  installDependencies();
};

const installDependencies = () => {
  if (install_packages) {
    console.log("----------------INSTALL DEPS----------------");
    try {
      console.log("Installing dependencies from package-lock.json...");
      // execSync('npm install --global typescript', {
      //   stdio: 'inherit',
      // });
      // execSync('npm install --global tsc-alias', {
      //   stdio: 'inherit',
      // });
      execSync("npm i", {
        stdio: "inherit",
        cwd: pathToRoot,
      });
      console.log("Dependencies installed successfully.");
    } catch (error) {
      console.error("Error installing dependencies:", error.message);
      return;
    }
  } else {
    console.log("Skipping dependency installation.");
  }
  build();
};

const build = () => {
  console.log("----------------BUILD----------------");
  try {
    console.log("Build");
    execSync(`npm run build`, {
      stdio: "inherit",
      cwd: pathToRoot,
    });
    console.log("Build successfully.");
  } catch (error) {
    console.error("Error Build:", error.message);
    return;
  }
  startServer();
};

const startServer = () => {
  console.log("----------------START SERVER----------------");
  try {
    console.log(`Starting the server for project`);

    serverProcess = execSync(`dotenv -e .env -- node dist/server.js`, {
      stdio: "inherit",
      cwd: pathToRoot,
    });

    serverProcess.on("exit", code => {
      console.log(`Server exited with code ${code}`);
    });
  } catch (error) {
    console.error("Error starting server:", error.message);
  }
};

const handleTermination = signal => {
  console.log(`Received signal ${signal}. Stopping the server...`);
  if (serverProcess) {
    serverProcess.kill(); // Kill the server process
    console.log("Server process killed.");
  }
  process.exit(0); // Exit the process
};

process.on("SIGINT", handleTermination);
process.on("SIGTERM", handleTermination);

pull();
