"use client";
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function AppPage() {
  useEffect(() => {
    redirect('/learn');
  }, []);
  return null; // Or a loading spinner
}
