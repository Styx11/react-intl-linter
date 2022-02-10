import { ExecuteCommandSignature } from "vscode-languageclient"

import { LinterCommands } from "../lib/constant"

const DisableFileMiddleware = (args: any[], next: ExecuteCommandSignature) =>
{
	next(LinterCommands.DisableFile, args)
}

export default DisableFileMiddleware