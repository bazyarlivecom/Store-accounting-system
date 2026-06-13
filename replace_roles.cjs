const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/p\.role === 'customer' \? 'مشتری' : p\.role === 'supplier' \? 'تامین کننده' : 'کارمند'/g, 'getRoleName(p.role)');
content = content.replace(/p\.role === 'customer' \? 'مشتری' : p\.role === 'employee' \? 'کارمند' : 'تامین کننده'/g, 'getRoleName(p.role)');
content = content.replace(/p\.role === 'customer' \? 'مشتری' : p\.role === 'employee' \? 'کارمند' : 'مشتری'/g, 'getRoleName(p.role)');

content = content.replace(/p\.role === 'customer' \? 'bg-emerald-50 text-emerald-800 border-emerald-100' : p\.role === 'supplier' \? 'bg-orange-50 text-orange-850 border-orange-100' : 'bg-purple-50 text-purple-800 border-purple-100'/g, 'getRoleBadgeClasses(p.role)');

fs.writeFileSync('src/App.tsx', content);
console.log("Done");
