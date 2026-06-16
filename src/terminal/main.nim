import std/[os, strformat, strutils]
import ../../data/raw
import index
import query
import clipboard

const idx = buildIndex(KV_DATA)

const
  colorBlue = "\e[34m"
  colorReset = "\e[0m"

type
  QueryMode = object
    strict: bool
    andMode: bool

# mode 分类
const queryModes = [
  ("-s",  QueryMode(strict: true,  andMode: false), " Strict match (OR)"),
  ("-sa", QueryMode(strict: true,  andMode: true),  "Strict match (AND)"),
  ("-c",  QueryMode(strict: false, andMode: false), " Contains match (OR)"),
  ("-ca", QueryMode(strict: false, andMode: true),  "Contains match (AND)")
]

# 条目展示
proc formatEntry(r: KVEntry): string =
  &"{colorBlue}{r.compositeKey}{colorReset}  {r.value}"

proc parseMode(mode: string): QueryMode =
  for item in queryModes:
    if item[0] == mode:
      return item[1]

  stderr.writeLine &"Unknown mode: {mode}"
  quit(1)

proc runQuery(mode: string; terms: seq[string]): seq[KVEntry] =
  let m = parseMode(mode)
  query(idx, terms, strict = m.strict, andMode = m.andMode)

proc printResults(results: seq[KVEntry]) =
  if results.len == 0:
    echo "  No matches."
    return

  for r in results:
    echo "  " & formatEntry(r)

proc selectResult(results: seq[KVEntry]): KVEntry =
  for i, r in results:
    stderr.writeLine &"  {i + 1} {formatEntry(r)}"

  stderr.write &"\nSelect (1-{results.len}): "

  let input = stdin.readLine().strip()
  let choice = try:
    parseInt(input)
  except ValueError:
    0

  if choice < 1 or choice > results.len:
    stderr.writeLine "Invalid selection."
    quit(1)

  results[choice - 1]

proc handleCopyResults(results: seq[KVEntry]) =
  if results.len == 0:
    echo "  No matches."
    return

  let selected =
    if results.len == 1:
      echo "  " & formatEntry(results[0])
      results[0]
    else:
      selectResult(results)

  osc52Copy(selected.value)
  stderr.writeLine "Copied."

proc printModeUsage() =
  stderr.writeLine "Usage: kv_query c <mode> [terms]"
  stderr.writeLine "<mode>:"

  for item in queryModes:
    stderr.writeLine &"  {item[0]}  {item[2]}"

proc printHelp() =
  echo &"Usage: kv_query {colorBlue}<command>{colorReset} [options] [terms]"
  echo ""
  echo "Commands:"
  echo &"  {colorBlue}ls{colorReset}        List all"

  for item in queryModes:
    echo &"  {colorBlue}{item[0]}{colorReset} ...   {item[2]}"

  echo &"  {colorBlue}c{colorReset} <mode> ...  Query + copy"
  echo &"  {colorBlue}-h{colorReset}        Show help"

proc main() =
  let args = commandLineParams()

  if args.len < 1 or args[0] == "-h":
    printHelp()
    return

  case args[0]
  of "ls":
    printResults(idx.v)

  of "c":  # clipboard 功能
    if args.len < 3:
      printModeUsage()
      quit(1)

    let mode = args[1]
    let terms = args[2..^1]
    handleCopyResults(runQuery(mode, terms))

  else:
    let mode = parseMode(args[0])
    let terms = args[1..^1]
    printResults(query(idx, terms, strict = mode.strict, andMode = mode.andMode))

when isMainModule:
  main()
