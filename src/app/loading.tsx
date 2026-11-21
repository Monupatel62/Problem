export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500 dark:text-white/40">Loading...</p>
      </div>
    </div>
  );
}
