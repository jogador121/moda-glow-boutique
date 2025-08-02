// src/components/ui/IconButtonWithBadge.tsx
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import React from "react";

interface IconButtonWithBadgeProps {
  to: string;
  icon: React.ElementType; // Componente do ícone (ex: ShoppingCart, Heart)
  badgeContent?: number; // Conteúdo opcional para o badge
  ariaLabel: string; // Rótulo para acessibilidade
  onClick?: () => void; // Adicionado para lidar com eventos de clique
}

const IconButtonWithBadge: React.FC<IconButtonWithBadgeProps> = ({
  to,
  icon: Icon,
  badgeContent,
  ariaLabel,
  onClick,
}) => (
  <Button variant="ghost" size="icon" asChild className="hover-lift relative min-h-[44px] min-w-[44px]">
    <Link to={to} aria-label={ariaLabel} onClick={onClick}>
      <Icon className="h-5 w-5" />
      {badgeContent !== undefined && badgeContent > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {badgeContent}
        </Badge>
      )}
    </Link>
  </Button>
);

export default IconButtonWithBadge;