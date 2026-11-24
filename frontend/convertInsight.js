const fs = require('fs');
const origin = 'c:/Users/Anshu/Desktop/github/finsight/frontend/src/app/insights/page.tsx';
const dest = 'c:/Users/Anshu/Desktop/github/finsight/frontend/src/app/transactions/InsightsTab.tsx';

let text = fs.readFileSync(origin, 'utf8');

// Strip AppShell imports and wrapping
text = text.replace(/import AppShell from '@\/components\/layout\/AppShell';\n/, '');
text = text.replace(/<AppShell>([\s\S]*?)<\/AppShell>/, '$1');
text = text.replace(/export default function InsightsPage\(\)/, 'export function InsightsTab()');

fs.writeFileSync(dest, text);
