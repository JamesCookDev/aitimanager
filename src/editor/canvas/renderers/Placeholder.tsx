export function Placeholder({ icon: Icon, label, gradient }: { icon: any; label: string; gradient: string }) {
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center gap-2 ${gradient} rounded-lg`}>
      <Icon className="w-8 h-8 text-white/60" />
      <span className="text-[11px] text-white/50 font-medium">{label}</span>
    </div>
  );
}
