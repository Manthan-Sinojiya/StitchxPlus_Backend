export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 mt-16 text-center text-sm text-slate-500">
      <div className="max-w-7xl mx-auto px-[8px]">
        <p>&copy; {new Date().getFullYear()} Stitchx Plus LLC. All rights reserved.</p>
        <p className="mt-1 text-xs text-slate-400">
          Built with React 18, TypeScript, Tailwind CSS, Express & Mongoose.
        </p>
      </div>
    </footer>
  );
}
