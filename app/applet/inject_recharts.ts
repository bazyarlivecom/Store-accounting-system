const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
if(!code.includes('recharts')) {
  code = code.replace(
    "import { motion, AnimatePresence } from 'motion/react';",
    "import { motion, AnimatePresence } from 'motion/react';\nimport { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Line, ComposedChart, Cell } from 'recharts';"
  );
  fs.writeFileSync('src/App.tsx', code);
  console.log('Recharts imported');
} else {
  console.log('Already imported');
}
