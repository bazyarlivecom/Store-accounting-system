import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// First update the searchStr in mapPersonToOption
content = content.replace(
  /searchStr: \`\$\{p\.alias \|\| ""\} \$\{p\.name \|\| ""\} \$\{p\.title \|\| ""\} \$\{p\.firstName \|\| ""\} \$\{p\.lastName \|\| ""\} \$\{p\.phone \|\| ""\} \$\{p\.nationalId \|\| ""\} \$\{p\.personCode \|\| ""\} \$\{p\.companyName \|\| ""\}\`,/,
  'searchStr: `${p.alias || ""} ${p.name || ""} ${p.title || ""} ${p.firstName || ""} ${p.lastName || ""} ${p.phone || ""} ${p.nationalId || ""} ${p.personCode || ""} ${p.companyName || ""} ${p.fatherName || ""}`,'
);

// Second, update searchStr for filteredPersons
content = content.replace(
  /searchStr: \`\$\{p\.alias \|\| ""\} \$\{p\.name \|\| ""\} \$\{p\.title \|\| ""\} \$\{p\.firstName \|\| ""\} \$\{p\.lastName \|\| ""\} \$\{p\.phone \|\| ""\} \$\{p\.nationalId \|\| ""\} \$\{p\.personCode \|\| ""\} \$\{p\.companyName \|\| ""\}\`,\n  \}\);/g,
  'searchStr: `${p.alias || ""} ${p.name || ""} ${p.title || ""} ${p.firstName || ""} ${p.lastName || ""} ${p.phone || ""} ${p.nationalId || ""} ${p.personCode || ""} ${p.companyName || ""} ${p.fatherName || ""}`,\n  });'
);

// We need to find all occurrences of:
// options={activePersonsOnly.map((p) => ({
//   value: p.id,
//   label: p.alias || p.name,
//   subLabel: p.phone || undefined,
//   badge: getRoleName(p.role),
//   imageUrl: p.imageUrl,
// }))}
// And add searchStr to them.

content = content.replace(
  /options=\{activePersonsOnly\.map\(\(p\) => \(\{\n\s*value: p\.id,\n\s*label: p\.alias \|\| p\.name,\n\s*subLabel: p\.phone \|\| undefined,\n\s*badge: getRoleName\(p\.role\),\n\s*imageUrl: p\.imageUrl,\n\s*\}\)\)\}/g,
  `options={activePersonsOnly.map((p) => ({
                        value: p.id,
                        label: p.alias || p.name,
                        subLabel: p.phone || undefined,
                        badge: getRoleName(p.role),
                        imageUrl: p.imageUrl,
                        searchStr: \`\${p.alias || ""} \${p.name || ""} \${p.title || ""} \${p.firstName || ""} \${p.lastName || ""} \${p.phone || ""} \${p.nationalId || ""} \${p.personCode || ""} \${p.companyName || ""} \${p.fatherName || ""}\`,
                      }))}`
);

// What about the one for salaryPersonId?
// options={activePersonsOnly.map((p) => ({
//   value: p.id,
//   label: p.alias || p.name,
//   subLabel: p.personCode
//     ? `کد: ${p.personCode} | ${getRoleName(p.role)}`
//     : getRoleName(p.role),
//   badge: getRoleName(p.role),
//   imageUrl: p.imageUrl,
// }))}

content = content.replace(
  /options=\{activePersonsOnly\.map\(\(p\) => \(\{\n\s*value: p\.id,\n\s*label: p\.alias \|\| p\.name,\n\s*subLabel: p\.personCode\n\s*\? \`کد: \$\{p\.personCode\} \| \$\{getRoleName\(p\.role\)\}\`\n\s*: getRoleName\(p\.role\),\n\s*badge: getRoleName\(p\.role\),\n\s*imageUrl: p\.imageUrl,\n\s*\}\)\)\}/g,
  `options={activePersonsOnly.map((p) => ({
                        value: p.id,
                        label: p.alias || p.name,
                        subLabel: p.personCode
                          ? \`کد: \${p.personCode} | \${getRoleName(p.role)}\`
                          : getRoleName(p.role),
                        badge: getRoleName(p.role),
                        imageUrl: p.imageUrl,
                        searchStr: \`\${p.alias || ""} \${p.name || ""} \${p.title || ""} \${p.firstName || ""} \${p.lastName || ""} \${p.phone || ""} \${p.nationalId || ""} \${p.personCode || ""} \${p.companyName || ""} \${p.fatherName || ""}\`,
                      }))}`
);

fs.writeFileSync('src/App.tsx', content);
