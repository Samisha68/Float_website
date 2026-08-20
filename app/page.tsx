const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_063509_7d167302-4fd4-480b-8260-18ab572333d4.mp4";

function FloatMark() {
  return (
    <svg aria-hidden="true" className="h-5 w-7" viewBox="2 18 130 74">
      <g fill="currentColor">
        <path
          clipRule="evenodd"
          d="M8 88V56h46V42h36V28h36v60H8Zm10 0V77a13 13 0 0 1 26 0v11H18Zm36 0V63a13 13 0 0 1 26 0v25H54Zm36 0V49a13 13 0 0 1 26 0v39H90Z"
          fillRule="evenodd"
        />
        <path d="M4 50h54v7H4zm46-14h44v7H50zm36-14h44v7H86z" />
      </g>
    </svg>
  );
}

export default function Home() {
  return (
    <main className="relative h-screen min-h-[560px] w-full overflow-hidden bg-black text-white">
      <video
        aria-hidden="true"
        autoPlay
        className="absolute inset-0 h-full w-full object-cover"
        loop
        muted
        playsInline
        src={VIDEO_URL}
      />
      <div className="absolute inset-0 bg-black/20" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-black" />

      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 pt-6 md:px-10">
        <div className="flex items-center gap-3 rounded-full bg-neutral-900/90 py-3 pl-4 pr-6 backdrop-blur">
          <FloatMark />
          <span className="text-sm font-normal tracking-tight">float</span>
        </div>
        <div className="rounded-full bg-white px-6 py-3 text-sm font-normal text-black">
          coming soon
        </div>
      </header>

      <section className="relative z-10 h-full w-full" aria-labelledby="hero-title">
        <h1 id="hero-title" className="sr-only">
          just float — coming soon
        </h1>
        <p className="hero-title absolute left-4 top-[27%] text-[27vw] font-medium lowercase md:left-10 md:top-[17%] md:text-[18vw]">
          just
        </p>
        <p className="hero-title absolute right-4 top-[51%] text-[27vw] font-medium lowercase md:right-10 md:top-[45%] md:text-[18vw]">
          float
        </p>
        <p className="absolute bottom-8 left-6 max-w-[210px] text-sm leading-snug text-white/70 md:bottom-10 md:left-10">
          credit that grows with you.
        </p>
        <p className="absolute bottom-8 right-6 text-right text-sm text-white/70 md:bottom-10 md:right-10">
          coming soon
        </p>
      </section>
    </main>
  );
}
