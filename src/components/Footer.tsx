export default function Footer() {
  return (
    <footer className="w-full border-t bg-background/80 text-center py-4 text-xs text-muted-foreground">
      &copy; {new Date().getFullYear()} Retro Board. All rights reserved.
    </footer>
  );
} 