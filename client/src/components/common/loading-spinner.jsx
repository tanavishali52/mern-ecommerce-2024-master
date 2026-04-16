export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-16 h-16 rounded-full border-4 border-t-orange-500 border-r-blue-500 border-b-orange-500 border-l-blue-500 animate-spin" />
        {/* Inner ring */}
        <div className="absolute top-1/2 left-1/2 w-8 h-8 -mt-4 -ml-4 rounded-full border-4 border-t-blue-500 border-r-orange-500 border-b-blue-500 border-l-orange-500 animate-spin-reverse" />
      </div>
    </div>
  );
}