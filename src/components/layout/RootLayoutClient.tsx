'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { CommandMenu } from '../CommandMenu';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();


  return (
    <>
      <Suspense fallback={<div className="w-72 bg-card/40 border-r border-border/40 flex flex-col h-full shrink-0" />}>
        <Sidebar />
      </Suspense>
      <main className="flex-1 overflow-y-auto bg-background/50 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="p-8 max-w-[1600px] mx-auto w-full px-4 md:px-12 relative z-10">
          {children}
        </div>
      </main>
      <CommandMenu />
    </>
  );
}
