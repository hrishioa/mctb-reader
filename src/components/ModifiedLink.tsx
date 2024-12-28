// src/components/ModifiedLink.tsx
import Link from "next/link";
import { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
};

const ModifiedLink = ({ href, children }: Props) => {
  const isExternalLink = href.startsWith("http");

  if (isExternalLink) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  // For internal links, make sure they start with a slash
  const formattedHref = href.startsWith("/") ? href : `/${href}`;

  return <Link href={formattedHref}>{children}</Link>;
};

export default ModifiedLink;
