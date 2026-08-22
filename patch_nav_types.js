import fs from 'fs';
let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

content = content.replace(
  'const navLinks = [',
  'const navLinks: Array<{label: string; href: string; icon: any; badge?: string; isExternal?: boolean}> = ['
);

fs.writeFileSync('src/components/Navbar.tsx', content);
