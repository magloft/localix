#!/usr/bin/env node

import { CLI, Shim } from 'clime'
import * as Path from 'path'

if (process.env.TS_NODE === 'true') {
  CLI.commandModuleExtension = '.ts'
}

const cli = new CLI('localix', Path.join(__dirname, 'commands'))
const shim = new Shim(cli)
shim.execute(process.argv)
