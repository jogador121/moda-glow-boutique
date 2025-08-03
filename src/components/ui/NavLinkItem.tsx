import { Link } from "react-router-dom";
import React from "react";

interface NavLinkItemProps {
  to: string;
  label: string;
  isMobile?: boolean;
  onClick?: () => void; // Adicionado para lidar com o fechamento do menu mobile
}

const NavLinkItem: React.FC<NavLinkItemProps> = ({ to, label, isMobile, onClick }) => {
  return (
    <Link
      to={to}
      className={isMobile ? "nav-link-mobile" : "nav-link-desktop"}
      onClick={onClick}
    >
      {label}
    </Link>
  );
};

export default NavLinkItem;