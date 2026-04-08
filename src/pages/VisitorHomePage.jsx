import { Link } from "react-router-dom";

const VisitorHomePage = () => {
  return (
    <div className="min-h-screen bg-[#F6F8FB]">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="font-semibold text-[15px] text-[#2F3B8A]">
            Connect
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/signin"
              className="h-9 px-4 rounded-lg bg-[#2F3B8A] text-white text-[13px] font-medium inline-flex items-center justify-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="mt-5 text-[42px] leading-[1.05] font-extrabold text-slate-900">
              Let&apos;s <span className="text-[#2F3B8A]">figure it out.</span>
            </h1>

            <div className="mt-3 text-[13px] font-semibold text-slate-700">
              A Scheduling System
            </div>

            {/* Flow chart / stepper */}
            <div className="mt-5">
              {/* Desktop (horizontal) */}
              <div className="hidden sm:flex items-center gap-3">
                {/* DISCOVERY (active) */}
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-9 w-9 rounded-full bg-[#2F3B8A] text-white text-[12px] font-bold grid place-items-center shadow-sm">
                      1
                    </div>
                    <div className="mt-2 text-[11px] font-semibold tracking-wide text-[#2F3B8A]">
                      DISCOVERY
                    </div>
                  </div>
                  <div className="h-[2px] w-10 bg-slate-200 rounded-full" />
                </div>

                {/* SELECTION */}
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-9 w-9 rounded-full bg-white border border-slate-200 text-slate-600 text-[12px] font-bold grid place-items-center">
                      2
                    </div>
                    <div className="mt-2 text-[11px] font-semibold tracking-wide text-slate-500">
                      SELECTION
                    </div>
                  </div>
                  <div className="h-[2px] w-10 bg-slate-200 rounded-full" />
                </div>

                {/* CONFIRMATION */}
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-9 w-9 rounded-full bg-white border border-slate-200 text-slate-600 text-[12px] font-bold grid place-items-center">
                      3
                    </div>
                    <div className="mt-2 text-[11px] font-semibold tracking-wide text-slate-500">
                      CONFIRMATION
                    </div>
                  </div>
                  <div className="h-[2px] w-10 bg-slate-200 rounded-full" />
                </div>

                {/* CONSULTATION */}
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-9 w-9 rounded-full bg-white border border-slate-200 text-slate-600 text-[12px] font-bold grid place-items-center">
                      4
                    </div>
                    <div className="mt-2 text-[11px] font-semibold tracking-wide text-slate-500">
                      CONSULTATION
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile (vertical) */}
              <div className="sm:hidden rounded-2xl border border-slate-200 bg-white p-4">
                {[
                  { n: 1, label: "DISCOVERY", active: true },
                  { n: 2, label: "SELECTION" },
                  { n: 3, label: "CONFIRMATION" },
                  { n: 4, label: "CONSULTATION" },
                ].map((s, idx, arr) => (
                  <div key={s.label} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={[
                          "h-9 w-9 rounded-full text-[12px] font-bold grid place-items-center",
                          s.active
                            ? "bg-[#2F3B8A] text-white"
                            : "bg-white border border-slate-200 text-slate-600",
                        ].join(" ")}
                      >
                        {s.n}
                      </div>
                      {idx < arr.length - 1 && (
                        <div className="w-[2px] h-6 bg-slate-200" />
                      )}
                    </div>
                    <div className="pt-2">
                      <div
                        className={[
                          "text-[11px] font-semibold tracking-wide",
                          s.active ? "text-[#2F3B8A]" : "text-slate-600",
                        ].join(" ")}
                      >
                        {s.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-4 text-[13px] leading-6 text-slate-600 max-w-[520px]">
              A simple scheduling platform where users share their availability and
              visitors can easily find a time that works — no back-and-forth, just
              smooth booking.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/users"
                className="h-11 px-5 rounded-xl bg-[#2F3B8A] text-white text-[13px] font-semibold inline-flex items-center justify-center shadow-sm hover:shadow transition"
              >
                Discover <span className="ml-2">→</span>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-br from-[#2F3B8A]/10 to-sky-200/30 blur-2xl rounded-[32px]" />
            <div className="relative rounded-[22px] overflow-hidden shadow-lg border border-slate-200 bg-white">
              <img
                src="/hr_services_graphic.svg"
                alt="Scheduling illustration"
                className="w-full h-[340px] md:h-[420px] object-contain bg-white p-6"
                loading="eager"
              />
            </div>
          </div>
        </div>


      </main>
    </div>
  );
};

export default VisitorHomePage;

