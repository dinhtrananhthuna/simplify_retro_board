export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-800/50 bg-black/20 backdrop-blur-sm text-center py-4 text-xs text-gray-500">
      &copy; {new Date().getFullYear()} Retro Board. Made with ❤️ in Dalat by{" "}
      <a href="mailto:vudinh@simplifydalat.com" className="text-blue-400 hover:underline">
        Vu Dinh
      </a>
    </footer>
  );
} 