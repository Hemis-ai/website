export function ProductsHero() {
  return (
    <section className="text-center pt-20 pb-14 px-6">
      <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-1.5 mb-6">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
        <span className="text-xs font-semibold text-indigo-400">AI-Native Security Platform</span>
      </div>

      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-100 leading-tight mb-5">
        Three products.{' '}
        <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          One unified platform.
        </span>
      </h1>

      <p className="text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
        Enterprise-grade AI security built for SMBs — offensive simulation, autonomous defense, and
        cloud posture management.
      </p>
    </section>
  )
}
