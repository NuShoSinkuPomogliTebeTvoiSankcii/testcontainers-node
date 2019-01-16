"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dev_null_1 = __importDefault(require("dev-null"));
const dockerode_1 = __importDefault(require("dockerode"));
const logger_1 = require("./logger");
class DockerodeClient {
    constructor(dockerode = new dockerode_1.default(), log = new logger_1.DebugLogger()) {
        this.dockerode = dockerode;
        this.log = log;
    }
    pull(repoTag) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log.info(`Pulling image: ${repoTag}`);
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const stream = yield this.dockerode.pull(repoTag.toString(), {});
                stream.pipe(dev_null_1.default());
                stream.on("end", resolve);
            }));
        });
    }
    create(repoTag, portBindings) {
        this.log.info(`Creating container for image: ${repoTag}`);
        return this.dockerode.createContainer({
            Image: repoTag.toString(),
            ExposedPorts: this.getExposedPorts(portBindings),
            HostConfig: {
                PortBindings: this.getPortBindings(portBindings)
            }
        });
    }
    start(container) {
        this.log.info(`Starting container with ID: ${container.id}`);
        return container.start();
    }
    exec(container, command) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log.debug(`Executing command "${command.join(" ")}" on container with ID: ${container.id}`);
            const exec = yield container.exec({
                Cmd: command,
                AttachStdout: true,
                AttachStderr: true
            });
            return new Promise((resolve, reject) => {
                exec.start((startErr, stream) => {
                    const chunks = [];
                    stream.on("data", chunk => chunks.push(chunk));
                    stream.on("end", () => {
                        const output = Buffer.concat(chunks).toString();
                        exec.inspect((inspectErr, data) => {
                            if (inspectErr) {
                                return reject(inspectErr);
                            }
                            return resolve({ output, exitCode: data.ExitCode });
                        });
                    });
                });
            });
        });
    }
    getExposedPorts(portBindings) {
        const dockerodeExposedPorts = {};
        for (const [internalPort] of portBindings.iterator()) {
            dockerodeExposedPorts[internalPort.toString()] = {};
        }
        return dockerodeExposedPorts;
    }
    getPortBindings(portBindings) {
        const dockerodePortBindings = {};
        for (const [internalPort, hostPort] of portBindings.iterator()) {
            dockerodePortBindings[internalPort.toString()] = [{ HostPort: hostPort.toString() }];
        }
        return dockerodePortBindings;
    }
}
exports.DockerodeClient = DockerodeClient;