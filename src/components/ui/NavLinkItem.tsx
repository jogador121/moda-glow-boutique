import { Link } from "react-router-dom";
import React from "react";

interface NavLinkItemProps {
  to: string;
  label: string;
  isMobile?: boolean;
  onClick?: () => void; // Adicionado para lidar com o fechamento do menu mobile
}

const NavLinkItem: React.FC<NavLinkItemProps> = ({ to, label, isMobile, onClick }) => {
  const baseClasses = "font-body font-medium text-foreground hover:text-primary transition-smooth";
  const mobileClasses = "block px-4 py-3 text-base hover:bg-accent rounded-md min-h-[44px] flex items-center";

  return (
    <Link
      to={to}
      className={`${baseClasses} ${isMobile ? mobileClasses : ""}`.trim()}
      onClick={onClick}
    >
      {label}
    </Link>
  );
};

export default NavLinkItem;