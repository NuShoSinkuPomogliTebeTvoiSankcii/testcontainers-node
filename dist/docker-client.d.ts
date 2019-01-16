import Dockerode, { Container } from "dockerode";
import { Logger } from "./logger";
import { PortBindings } from "./port-bindings";
import { RepoTag } from "./repo-tag";
declare type Command = string;
declare type ExitCode = number;
declare type ExecOutput = string;
declare type ExecResult = {
    output: ExecOutput;
    exitCode: ExitCode;
};
export interface DockerClient {
    pull(repoTag: RepoTag): Promise<void>;
    create(repoTag: RepoTag, portBindings: PortBindings): Promise<Container>;
    start(container: Container): Promise<void>;
    exec(container: Container, command: Command[]): Promise<ExecResult>;
}
export declare class DockerodeClient implements DockerClient {
    private readonly dockerode;
    private readonly log;
    constructor(dockerode?: Dockerode, log?: Logger);
    pull(repoTag: RepoTag): Promise<void>;
    create(repoTag: RepoTag, portBindings: PortBindings): Promise<Container>;
    start(container: Container): Promise<void>;
    exec(container: Container, command: Command[]): Promise<ExecResult>;
    private getExposedPorts;
    private getPortBindings;
}
export {};