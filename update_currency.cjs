const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf-8');

const search = `  return (
    <div className="w-full relative">
      <input
        type="text"
        dir="ltr"
        value={localVal}
        onChange={handleChange}
        placeholder={placeholder}
        className={\`\${className} text-left\`}
        {...props}
      />
    </div>
  );`;

const replace = `  const parsedVal = Number(localVal.replace(/,/g, ''));
  return (
    <div className="w-full relative">
      <input
        type="text"
        dir="ltr"
        value={localVal}
        onChange={handleChange}
        placeholder={placeholder}
        className={\`\${className} text-left\`}
        {...props}
      />
      {parsedVal > 0 ? (
         <div className="text-[11px] font-semibold text-gray-500 mt-1.5 text-right pr-2">
           {numToPersianWords(parsedVal)} تومان
         </div>
      ) : null}
    </div>
  );`;

c = c.replace(search, replace);
fs.writeFileSync('src/App.tsx', c);
