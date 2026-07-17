import { Univer, LocaleType, LogLevel } from '@univerjs/core'
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula'
import { UniverRPCWorkerThreadPlugin } from '@univerjs/rpc'
import { UniverSheetsPlugin } from '@univerjs/sheets'
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula'

// Create a new Univer instance for the worker
const univer = new Univer({
  theme: {},
  locale: LocaleType.EN_US,
  logLevel: LogLevel.VERBOSE,
})

// Core Plugins required in worker
univer.registerPlugin(UniverSheetsPlugin)
univer.registerPlugin(UniverFormulaEnginePlugin)
univer.registerPlugin(UniverSheetsFormulaPlugin)

// Register RPC Worker to communicate with Main Thread
univer.registerPlugin(UniverRPCWorkerThreadPlugin)

console.log('[Univer Web Worker] Formula Engine initialized successfully.')
