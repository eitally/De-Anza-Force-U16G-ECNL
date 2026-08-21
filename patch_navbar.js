import fs from 'fs';

let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Add masterAlbumInfo to NavbarProps
content = content.replace(
  /interface NavbarProps \{/,
  `import { MasterAlbumInfo } from '../types';\n\ninterface NavbarProps {\n  masterAlbumInfo?: MasterAlbumInfo;`
);

// Destructure masterAlbumInfo
content = content.replace(
  /export const Navbar: React\.FC<NavbarProps> = \(\{/,
  `export const Navbar: React.FC<NavbarProps> = ({\n  masterAlbumInfo,`
);

// Update navLinks logic to include Media Hub if masterAlbumInfo has a url
const navLinksLogic = `
  const navLinks = [
    { label: 'Roster', href: '#roster', icon: Users, badge: \`\${playerCount}\` },
    { label: 'Schedule', href: '#schedule', icon: Calendar },
    { label: 'Standings', href: '#standings', icon: Trophy },
    { label: 'Recruiting Hub', href: '#recruiting', icon: GraduationCap },
    { label: 'Staff', href: '#staff', icon: ShieldCheck },
  ];

  const mediaHubUrl = masterAlbumInfo?.url || 'https://linktr.ee/willow_glen_photography';
  
  navLinks.push({ label: 'Media Hub', href: mediaHubUrl, icon: ImageIcon, isExternal: true });
`;

content = content.replace(
  /const navLinks = \[\s*\{ label: 'Roster'[\s\S]*?\];/,
  navLinksLogic
);

// Update nav rendering logic to open in new tab if isExternal
content = content.replace(
  /<a\n\s*key=\{item.label\}\n\s*href=\{item.href\}\n\s*className="text-sm font-semibold/g,
  `<a\n                key={item.label}\n                href={item.href}\n                {...(item.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}\n                className="text-sm font-semibold`
);

content = content.replace(
  /<a\n\s*key=\{item.label\}\n\s*href=\{item.href\}\n\s*onClick=\{[^\}]*\}\n\s*className="flex items-center/g,
  `<a\n                    key={item.label}\n                    href={item.href}\n                    {...(item.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}\n                    onClick={() => setMobileMenuOpen(false)}\n                    className="flex items-center`
);

fs.writeFileSync('src/components/Navbar.tsx', content);
