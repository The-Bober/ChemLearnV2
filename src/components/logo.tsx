import { FlaskConical } from 'lucide-react';
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
  href?: string;
}

export function Logo({ className, iconSize = 24, textSize = "text-xl", href = "/" }: LogoProps) {
  return (
    <Link href={href} className={`flex items-center gap-2 font-semibold ${className}`}>
      <FlaskConical size={iconSize} className="text-primary" />
      <span className={textSize}>{APP_NAME}</span>
    </Link>
  );
}
