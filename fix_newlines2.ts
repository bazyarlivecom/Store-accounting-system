import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// The earlier script erroneously replaced \n string literal. Let's fix that.
// The compiler error was at line 2351: 
// finalMsg += duplicateMsgs.slice(0, 10).join("
// ");

// We can replace `"\\n"` in broken forms, but since we replaced \n to literal newline everywhere,
// it might have broken other string literals like `join("\n")` or `split("\n")` or `msg += "\n"`.
// Actually, it's easier to find literal newlines inside quotes and convert them back to `\\n` if they are part of string operations.

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  // If a line ends with `join("` or `split("` or `+= "` or `+"` and next line starts with `")` or `"`
  if (lines[i].match(/join\("$/) && lines[i+1].match(/^"\)/)) {
    lines[i] = lines[i].replace(/join\("$/, 'join("\\n")');
    lines.splice(i+1, 1);
  } else if (lines[i].match(/join\('$/) && lines[i+1].match(/^'\)/)) {
    lines[i] = lines[i].replace(/join\('$/, 'join(\'\\n\')');
    lines.splice(i+1, 1);
  } else if (lines[i].match(/\+= "$/) && lines[i+1].match(/^"/)) {
    lines[i] = lines[i].replace(/\+= "$/, '+= "\\n"');
    lines.splice(i+1, 1);
  } else if (lines[i].match(/ \+ "$/) && lines[i+1].match(/^"/)) {
    lines[i] = lines[i].replace(/ \+ "$/, ' + "\\n"');
    lines.splice(i+1, 1);
  }
}
fs.writeFileSync('src/App.tsx', lines.join('\n'));
