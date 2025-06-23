import React from 'react';
import { Link as RouterLink, type LinkProps } from 'react-router-dom';

interface CustomLinkProps extends Omit<LinkProps, 'to'> {
  href: string;
}

export const Link: React.FC<CustomLinkProps> = ({ href, children, ...props }) => {
  return (
    <RouterLink to={href} {...props}>
      {children}
    </RouterLink>
  );
};