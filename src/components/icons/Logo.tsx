import type React from 'react';

const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 200 50"
    width="120"
    height="30"
    aria-label="PlatePilot Logo"
    {...props}
  >
    <rect width="200" height="50" fill="transparent" />
    <text
      x="10"
      y="35"
      fontFamily="Playfair Display, serif"
      fontSize="30"
      fontWeight="bold"
      fill="currentColor"
    >
      PlatePilot
    </text>
  </svg>
);

export default Logo;
