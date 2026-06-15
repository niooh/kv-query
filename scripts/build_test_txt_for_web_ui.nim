import random, strformat, sequtils, strutils

# randomize()  # if need 

var lines: seq[string] = @[]

for i in 1..9999:
  let suffix = (0..2).mapIt(chr(rand(26) + ord('a'))).join()
  lines.add(fmt""""tag{i} | tag{i+1}" {suffix}""")

let resultText = lines.join("\n")
writeFile("dist/test_for_web_ui.txt", resultText)

echo "✓ dist/test_for_web_ui.txt"
