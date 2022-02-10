import { ExecuteCommandSignature } from "vscode-languageclient"

import { LinterCommands } from "../lib/constant"

const DisableLineMiddleware = (args: any[], next: ExecuteCommandSignature) =>
{
	next(LinterCommands.DisableLine, args)
}

export default DisableLineMiddleware