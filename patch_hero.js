import fs from 'fs';
let content = fs.readFileSync('src/components/Hero.tsx', 'utf8');

content = content.replace(
  /<div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">/,
  '<div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start lg:items-stretch">'
);

content = content.replace(
  /<div className="lg:col-span-5 flex flex-col gap-4">/,
  '<div className="lg:col-span-5 flex flex-col gap-4 lg:h-full">'
);

content = content.replace(
  /<div className="relative">\n\s*\{\/\* The Carousel \*\/\}/,
  '<div className="relative lg:h-full flex flex-col">\n              {/* The Carousel */}'
);

content = content.replace(
  /<ActionCarousel /,
  '<ActionCarousel className="lg:h-full flex flex-col flex-1" '
);

fs.writeFileSync('src/components/Hero.tsx', content);
