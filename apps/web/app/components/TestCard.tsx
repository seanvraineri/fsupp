"use client";
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';

interface Props {
  logoSrc: string;
  title: string;
  description: string;
  href: string;
  price?: string;
}

export default function TestCard({ logoSrc, title, description, href, price }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      className="flex flex-col gap-3 p-4 border rounded-lg hover:shadow transition dark:border-gray-700"
      rel="noopener noreferrer"
    >
      {logoSrc && (
        <div className="relative h-8 w-28">
          <Image src={logoSrc} alt={title} fill className="object-contain" />
        </div>
      )}
      <h3 className="font-semibold text-sm">{title}</h3>
      {price && <p className="text-xs text-gray-500">Starting at {price}</p>}
      <p className="text-xs text-gray-600 dark:text-gray-400 flex-1">{description}</p>
      <span className="inline-flex items-center text-primary-from text-sm font-medium">
        Order <ExternalLink className="w-4 h-4 ml-1" />
      </span>
    </a>
  );
} 