import { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────
   הוסף לקובץ index.html שלך (בתוך <head>):

   <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
   <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
   <script src="https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js"></script>
   <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet"/>
───────────────────────────────────────────── */

declare const gsap: any;
declare const ScrollTrigger: any;
declare const Lenis: any;

const PROJECTS = [
  { num: "01", name: "Nexus Studio",       tag: "עיצוב מותג",    img: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80" },
  { num: "02", name: "Aura Capital",       tag: "אתר + מותג",    img: "https://images.unsplash.com/photo-1555421689-d68471e189f2?w=600&q=80" },
  { num: "03", name: "Forma Architecture", tag: "חוויית משתמש",  img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80" },
  { num: "04", name: "Velo Finance",       tag: "זהות ויזואלית", img: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80" },
];

const H_CARDS = [
  { letter: "A", title: "Atlas Branding",   tag: "מותג — 2024" },
  { letter: "B", title: "Bloom Health",     tag: "אתר — 2024" },
  { letter: "C", title: "Craft Agency",     tag: "מותג + אתר — 2023" },
  { letter: "D", title: "Delta Tech",       tag: "חוויית משתמש — 2023" },
  { letter: "E", title: "Echo Studio",      tag: "זהות — 2023" },
];

const SERVICES = [
  { num: "01", title: "אסטרטגיית מותג",  desc: "בנייה של זהות מותגית חזקה מהיסוד — מחקר, פוזיציונינג, וסיפור המותג שלך." },
  { num: "02", title: "עיצוב ויזואלי",   desc: "לוגו, פלטת צבעים, טיפוגרפיה וכל מערכת הזהות החזותית של המותג שלך." },
  { num: "03", title: "עיצוב אתרים",     desc: "אתרים מותאמים אישית עם אנימציות מתקדמות וחוויית משתמש חלקה." },
  { num: "04", title: "מערכות עיצוב",    desc: "מערכת עיצוב שלמה וסקלבילית שתצמח עם העסק שלך לאורך שנים." },
];

export default function MonologPage() {
  const cursorRef   = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const loaderRef   = useRef<HTMLDivElement>(null);
  const hoverImgRef = useRef<HTMLDivElement>(null);
  const hoverImgSrcRef = useRef<HTMLImageElement>(null);
  const marqueeRef  = useRef<HTMLDivElement>(null);
  const hScrollRef  = useRef<HTMLDivElement>(null);
  const navRef      = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof gsap === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    /* ── Smooth Scroll ── */
    let lenis: any;
    if (typeof Lenis !== "undefined") {
      lenis = new Lenis({ lerp: 0.075 });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t: number) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    /* ── Cursor ── */
    let mx = -200, my = -200, fx = -200, fy = -200;
    const onMouseMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener("mousemove", onMouseMove);

    const cursorTick = gsap.ticker.add(() => {
      fx += (mx - fx) * 0.12;
      fy += (my - fy) * 0.12;
      if (cursorRef.current)   gsap.set(cursorRef.current,   { x: mx, y: my });
      if (followerRef.current) gsap.set(followerRef.current, { x: fx, y: fy });
    });

    /* ── Magnetic Button ── */
    const magWraps = document.querySelectorAll<HTMLElement>(".mag-btn-wrap");
    const magCleanup: (() => void)[] = [];

    magWraps.forEach(wrap => {
      const btn = wrap.querySelector<HTMLElement>(".mag-btn");
      if (!btn) return;
      const onMove = (e: MouseEvent) => {
        const r = wrap.getBoundingClientRect();
        gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * 0.35, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.4, ease: "power3.out" });
      };
      const onLeave = () => gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1,0.4)" });
      wrap.addEventListener("mousemove", onMove);
      wrap.addEventListener("mouseleave", onLeave);
      magCleanup.push(() => { wrap.removeEventListener("mousemove", onMove); wrap.removeEventListener("mouseleave", onLeave); });
    });

    /* ── Loader → Hero ── */
    const tl = gsap.timeline({ onComplete: () => {
      if (loaderRef.current) loaderRef.current.style.display = "none";

      /* hero words */
      gsap.to(".hero-word", { y: "0%", duration: 1.1, ease: "power4.out", stagger: 0.08 });
      gsap.to(".hero-eyebrow", { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: "power3.out" });
      gsap.to(".hero-desc",    { opacity: 1, y: 0, duration: 0.8, delay: 0.5, ease: "power3.out" });
      gsap.to(".hero-scroll",  { opacity: 1, duration: 0.8, delay: 0.9, ease: "power3.out" });
    }});

    tl.to(".loader-logo-inner", { y: "0%", duration: 0.8, ease: "power4.out", delay: 0.2 })
      .to(".loader-bar-fill", { width: "100%", duration: 1.6, ease: "power2.inOut",
        onUpdate() {
          const el = document.getElementById("loader-count");
          if (el) el.textContent = Math.round((this as any).progress() * 100) + "%";
        }
      }, "-=0.4")
      .to(loaderRef.current, { yPercent: -100, duration: 0.9, ease: "power4.inOut", delay: 0.15 });

    /* ── Scroll Text Reveal ── */
    document.querySelectorAll<HTMLElement>(".reveal-text:not(.hero-title)").forEach(el => {
      const words = el.innerText.trim().split(/\s+/);
      el.innerHTML = words.map(w =>
        `<span style="display:inline-block;overflow:hidden;vertical-align:bottom"><span class="reveal-word" style="display:inline-block;transform:translateY(110%)">${w}</span></span>`
      ).join(" ");

      ScrollTrigger.create({
        trigger: el, start: "top 82%",
        onEnter: () => gsap.to(el.querySelectorAll(".reveal-word"), { y: "0%", duration: 0.9, ease: "power4.out", stagger: 0.04 })
      });
    });

    /* ── Fade-up Cards ── */
    gsap.utils.toArray<HTMLElement>(".service-card, .process-step, .h-card").forEach((el, i) => {
      gsap.fromTo(el, { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: (i % 4) * 0.1,
        scrollTrigger: { trigger: el, start: "top 85%" }
      });
    });

    /* ── Counters ── */
    document.querySelectorAll<HTMLElement>("[data-count]").forEach(el => {
      const target = Number(el.dataset.count);
      ScrollTrigger.create({
        trigger: el, start: "top 80%",
        onEnter: () => gsap.to({ val: 0 }, {
          val: target, duration: 1.8, ease: "power2.out",
          onUpdate(this: any) { el.textContent = Math.round(this.targets()[0].val).toString(); }
        })
      });
    });

    /* ── Marquee ── */
    let xPos = 0;
    let rafId: number;
    const track = marqueeRef.current;
    const animateMarquee = () => {
      if (track) {
        xPos -= 0.5;
        const itemWidth = (track.children[0] as HTMLElement)?.offsetWidth ?? 0;
        if (itemWidth && Math.abs(xPos) >= itemWidth) xPos = 0;
        gsap.set(track, { x: xPos });
      }
      rafId = requestAnimationFrame(animateMarquee);
    };
    rafId = requestAnimationFrame(animateMarquee);

    /* ── Horizontal Scroll ── */
    const hTrack = hScrollRef.current;
    if (hTrack && hTrack.parentElement) {
      const totalW = hTrack.scrollWidth - hTrack.parentElement.offsetWidth;
      gsap.to(hTrack, {
        x: () => -totalW, ease: "none",
        scrollTrigger: {
          trigger: ".h-scroll-section", start: "top top",
          end: () => "+=" + totalW, pin: true, scrub: 1, anticipatePin: 1
        }
      });
    }

    /* ── Project Hover Image ── */
    const projectCleanup: (() => void)[] = [];
    document.querySelectorAll<HTMLElement>(".project-item").forEach(item => {
      const onEnter = () => {
        if (hoverImgSrcRef.current) hoverImgSrcRef.current.src = item.dataset.img ?? "";
        gsap.to(hoverImgRef.current, { opacity: 1, scale: 1, duration: 0.4, ease: "power3.out" });
      };
      const onLeave = () => gsap.to(hoverImgRef.current, { opacity: 0, scale: 0.95, duration: 0.3, ease: "power2.in" });
      const onMove  = (e: MouseEvent) => {
        if (hoverImgRef.current) gsap.to(hoverImgRef.current, {
          x: e.clientX + 24, y: e.clientY - hoverImgRef.current.offsetHeight / 2,
          duration: 0.5, ease: "power3.out"
        });
      };
      item.addEventListener("mouseenter", onEnter);
      item.addEventListener("mouseleave", onLeave);
      item.addEventListener("mousemove",  onMove);
      projectCleanup.push(() => {
        item.removeEventListener("mouseenter", onEnter);
        item.removeEventListener("mouseleave", onLeave);
        item.removeEventListener("mousemove",  onMove);
      });
    });

    /* ── CTA Parallax ── */
    gsap.to(".cta-bg-text", {
      yPercent: -15, ease: "none",
      scrollTrigger: { trigger: ".cta-section", start: "top bottom", end: "bottom top", scrub: 1 }
    });

    /* ── Nav hide/show ── */
    let lastScroll = 0;
    const onScroll = lenis
      ? (s: any) => {
          const nav = navRef.current;
          if (!nav) return;
          if (s.scroll > lastScroll && s.scroll > 100) gsap.to(nav, { yPercent: -120, duration: 0.5, ease: "power2.inOut" });
          else gsap.to(nav, { yPercent: 0, duration: 0.5, ease: "power2.out" });
          lastScroll = s.scroll;
        }
      : null;
    if (lenis && onScroll) lenis.on("scroll", onScroll);

    /* ── Section labels ── */
    gsap.utils.toArray<HTMLElement>(".section-label").forEach(el => {
      gsap.fromTo(el, { opacity: 0, x: -20 }, {
        opacity: 1, x: 0, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%" }
      });
    });

    /* ── Cursor hover state ── */
    const addHover = (el: Element) => {
      el.addEventListener("mouseenter", () => document.body.classList.add("mlg-cursor-hover"));
      el.addEventListener("mouseleave", () => document.body.classList.remove("mlg-cursor-hover"));
    };
    document.querySelectorAll("a, button, .mag-btn").forEach(addHover);

    /* ── Cleanup ── */
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      gsap.ticker.remove(cursorTick);
      cancelAnimationFrame(rafId);
      magCleanup.forEach(f => f());
      projectCleanup.forEach(f => f());
      if (lenis) lenis.destroy();
      ScrollTrigger.getAll().forEach((st: any) => st.kill());
    };
  }, []);

  const ArrowSvg = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
    </svg>
  );

  return (
    <>
      {/* ── Global Styles ── */}
      <style>{`
        :root{--bg:#0a0a0a;--bg2:#111;--fg:#f0ede8;--muted:#7a7570;--accent:#c8b89a;--border:rgba(240,237,232,0.08);--ease:cubic-bezier(0.16,1,0.3,1);}
        body{background:var(--bg);color:var(--fg);font-family:'DM Sans',sans-serif;cursor:none;overflow-x:hidden;}
        body::before{content:'';position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:.035;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size:128px;}
        body.mlg-cursor-hover .mlg-cursor{width:56px!important;height:56px!important;background:var(--accent)!important;}
        body.mlg-cursor-hover .mlg-follower{opacity:0!important;}
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        a{color:inherit;text-decoration:none;}

        /* loader */
        .loader-logo-inner{display:inline-block;transform:translateY(110%);}
        .loader-bar-fill{height:100%;background:var(--accent);width:0;}

        /* hero */
        .hero-word{display:inline-block;transform:translateY(110%);}
        .hero-eyebrow,.hero-desc,.hero-scroll{opacity:0;transform:translateY(20px);}
        .hero-scroll{transform:none;}

        /* scroll line */
        @keyframes scrollLine{0%{left:-100%}50%{left:0}100%{left:100%}}

        /* project item bg reveal */
        .project-item::before{content:'';position:absolute;inset:0;background:var(--bg2);transform:scaleY(0);transform-origin:bottom;transition:transform .5s var(--ease);z-index:0;}
        .project-item:hover::before{transform:scaleY(1);}
        .project-item>*{position:relative;z-index:1;}
        .project-item:hover .project-name{letter-spacing:.01em!important;}
        .project-item:hover .project-tag{border-color:var(--accent)!important;color:var(--accent)!important;}
        .project-item:hover .project-arrow{transform:translate(4px,-4px) rotate(45deg)!important;background:var(--accent)!important;border-color:var(--accent)!important;}

        /* service card */
        .service-card::after{content:'';position:absolute;inset:0;background:radial-gradient(circle at 0% 100%,rgba(200,184,154,.08) 0%,transparent 60%);opacity:0;transition:opacity .5s;}
        .service-card:hover{background:var(--bg2)!important;}
        .service-card:hover::after{opacity:1;}
        .service-card:hover .step-num{color:var(--accent)!important;}

        /* h-card */
        .h-card:hover .h-card-img-inner{transform:scale(1.04);}

        /* mag btn */
        .mag-btn::before{content:'';position:absolute;inset:0;background:var(--fg);border-radius:100px;transform:scale(0);transition:transform .5s var(--ease);}
        .mag-btn:hover::before{transform:scale(1.1);}
        .mag-btn:hover{color:var(--bg)!important;}
        .mag-btn:hover .mag-arrow{transform:translate(4px,-4px)!important;}

        /* footer link */
        .footer-email::after{content:'';position:absolute;bottom:-2px;left:0;width:100%;height:1px;background:var(--accent);transform:scaleX(0);transform-origin:right;transition:transform .4s var(--ease);}
        .footer-email:hover::after{transform:scaleX(1);transform-origin:left;}

        /* nav link */
        .nav-link::after{content:'';position:absolute;bottom:-2px;left:0;width:0%;height:1px;background:var(--fg);transition:width .4s var(--ease);}
        .nav-link:hover{color:var(--fg)!important;}
        .nav-link:hover::after{width:100%;}

        @media(max-width:768px){body{cursor:auto;}.mlg-cursor,.mlg-follower{display:none!important;}.about-grid{grid-template-columns:1fr!important;}.nav-links-wrap{display:none!important;}}
      `}</style>

      {/* ── Cursor ── */}
      <div ref={cursorRef} className="mlg-cursor" style={{ position:"fixed",top:0,left:0,width:12,height:12,background:"var(--fg)",borderRadius:"50%",pointerEvents:"none",zIndex:10000,transform:"translate(-50%,-50%)",transition:"width .3s,height .3s,background .3s",mixBlendMode:"difference" }} />
      <div ref={followerRef} className="mlg-follower" style={{ position:"fixed",top:0,left:0,width:36,height:36,border:"1px solid rgba(240,237,232,0.35)",borderRadius:"50%",pointerEvents:"none",zIndex:9999,transform:"translate(-50%,-50%)",transition:"opacity .3s",mixBlendMode:"difference" }} />

      {/* ── Loader ── */}
      <div ref={loaderRef} style={{ position:"fixed",inset:0,background:"var(--bg)",zIndex:9998,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:"2rem" }}>
        <div style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(2rem,5vw,4rem)",fontWeight:800,letterSpacing:"-0.03em",overflow:"hidden" }}>
          <span className="loader-logo-inner">STUDIO</span>
        </div>
        <div style={{ width:"clamp(120px,20vw,200px)",height:1,background:"var(--border)",overflow:"hidden" }}>
          <div className="loader-bar-fill" />
        </div>
        <div id="loader-count" style={{ fontFamily:"'Syne',sans-serif",fontSize:"0.75rem",letterSpacing:"0.15em",color:"var(--muted)" }}>0%</div>
      </div>

      {/* ── Hover Image ── */}
      <div ref={hoverImgRef} style={{ position:"fixed",pointerEvents:"none",zIndex:200,width:"clamp(200px,22vw,340px)",aspectRatio:"4/5",overflow:"hidden",opacity:0,borderRadius:4,transform:"scale(0.95)" }}>
        <img ref={hoverImgSrcRef} src="" alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }} />
      </div>

      {/* ── Nav ── */}
      <nav ref={navRef} style={{ position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"clamp(1.5rem,2.5vw,2rem) clamp(1.5rem,4vw,4rem)",display:"flex",alignItems:"center",justifyContent:"space-between",mixBlendMode:"difference" }}>
        <a href="#" style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"clamp(1.1rem,1.5vw,1.3rem)",letterSpacing:"-0.02em" }}>STUDIO</a>
        <ul className="nav-links-wrap" style={{ display:"flex",gap:"clamp(1.5rem,3vw,3rem)",listStyle:"none" }}>
          {["עבודות","שירותים","תהליך","אודות"].map(l => (
            <li key={l}><a href="#" className="nav-link" style={{ fontSize:"0.8rem",letterSpacing:"0.08em",textTransform:"uppercase",color:"var(--muted)",position:"relative" }}>{l}</a></li>
          ))}
        </ul>
        <a href="#contact" style={{ fontSize:"0.8rem",letterSpacing:"0.08em",textTransform:"uppercase" }}>צור קשר →</a>
      </nav>

      {/* ── Hero ── */}
      <section style={{ minHeight:"100svh",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"clamp(1.5rem,4vw,4rem)",paddingBottom:"clamp(3rem,6vw,6rem)",position:"relative",overflow:"hidden" }}>
        <p className="hero-eyebrow" style={{ fontSize:"0.75rem",letterSpacing:"0.18em",textTransform:"uppercase",color:"var(--accent)",marginBottom:"2rem" }}>סטודיו לעיצוב מותג וחוויית אתר</p>
        <h1 className="hero-title" style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(3.5rem,10vw,11rem)",fontWeight:800,lineHeight:0.9,letterSpacing:"-0.04em",marginBottom:"3rem" }}>
          {[["אנחנו"],["בונים","חוויות"],["דיגיטליות."]].map((line, li) => (
            <span key={li} style={{ display:"block",overflow:"hidden" }}>
              {line.map((w, wi) => (
                <span key={wi} className="hero-word" style={{ display:"inline-block",marginInlineEnd:"0.25em",fontStyle: w==="חוויות"?"italic":"normal",color:w==="חוויות"?"var(--accent)":"inherit" }}>{w}</span>
              ))}
            </span>
          ))}
        </h1>
        <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:"2rem",flexWrap:"wrap" }}>
          <p className="hero-desc" style={{ maxWidth:340,color:"var(--muted)",fontSize:"0.95rem",lineHeight:1.7 }}>
            סטודיו לעיצוב מותגים ואתרים לחברות B2B. אנחנו לוקחים פחות פרויקטים כדי לתת לכל אחד את מלוא הקשב.
          </p>
          <div className="hero-scroll" style={{ display:"flex",alignItems:"center",gap:"1rem" }}>
            <div style={{ width:60,height:1,background:"var(--muted)",position:"relative",overflow:"hidden" }}>
              <span style={{ position:"absolute",top:0,left:"-100%",width:"100%",height:"100%",background:"var(--fg)",animation:"scrollLine 2s cubic-bezier(0.16,1,0.3,1) infinite 1.5s",display:"block" }} />
            </div>
            <span style={{ fontSize:"0.7rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"var(--muted)" }}>גלול למטה</span>
          </div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <div style={{ borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)",padding:"1.5rem 0",overflow:"hidden" }}>
        <div ref={marqueeRef} style={{ display:"flex",whiteSpace:"nowrap",willChange:"transform" }}>
          {[0,1].map(k => (
            <div key={k} aria-hidden={k===1} style={{ display:"flex",alignItems:"center",gap:"3rem",padding:"0 3rem",fontFamily:"'Syne',sans-serif",fontSize:"clamp(1.2rem,2.5vw,2rem)",fontWeight:700,letterSpacing:"-0.02em",flexShrink:0 }}>
              {["עיצוב מותג","חוויית משתמש","פיתוח אתרים","אסטרטגיה דיגיטלית","זהות ויזואלית"].map(t => (
                <><span key={t}>{t}</span><span style={{ width:6,height:6,borderRadius:"50%",background:"var(--accent)",display:"inline-block",flexShrink:0 }} /></>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── About ── */}
      <section id="about" style={{ padding:"clamp(5rem,10vw,10rem) clamp(1.5rem,4vw,4rem)" }}>
        <div className="section-label" style={{ fontSize:"0.7rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--muted)",marginBottom:"4rem",display:"flex",alignItems:"center",gap:"1rem" }}>
          <span style={{ width:30,height:1,background:"var(--muted)",display:"block" }} />אודותינו
        </div>
        <div className="about-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"clamp(3rem,6vw,8rem)",alignItems:"start" }}>
          <h2 className="reveal-text" style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(2.5rem,5vw,5.5rem)",fontWeight:800,lineHeight:1,letterSpacing:"-0.03em" }}>
            אנחנו לא סתם סטודיו. אנחנו שותפים להצלחה.
          </h2>
          <div style={{ paddingTop:"clamp(1rem,4vw,5rem)" }}>
            <p className="reveal-text" style={{ fontSize:"clamp(1rem,1.4vw,1.2rem)",lineHeight:1.8,color:"var(--muted)",marginBottom:"3rem" }}>
              אנחנו מאמינים שמותג חזק הוא הנכס החשוב ביותר של עסק. לכן אנחנו מגיעים לכל פרויקט עם מחויבות מלאה, מחשבה אסטרטגית ויצירתיות שאין לה גבול.
            </p>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2rem",borderTop:"1px solid var(--border)",paddingTop:"2rem" }}>
              {[{n:40,l:"פרויקטים"},{n:98,l:"% שביעות רצון"},{n:5,l:"שנות ניסיון"},{n:12,l:"פרסים"}].map(s => (
                <div key={s.l}>
                  <div data-count={s.n} style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(2.5rem,4vw,4rem)",fontWeight:800,lineHeight:1,letterSpacing:"-0.04em" }}>0</div>
                  <div style={{ fontSize:"0.75rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--muted)",marginTop:"0.5rem" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Projects ── */}
      <section id="work" style={{ padding:0 }}>
        <div style={{ padding:"0 clamp(1.5rem,4vw,4rem)",display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:"4rem",paddingTop:"clamp(5rem,10vw,10rem)" }}>
          <h2 className="reveal-text" style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(2.5rem,5vw,5.5rem)",fontWeight:800,lineHeight:1,letterSpacing:"-0.03em" }}>עבודות נבחרות</h2>
        </div>
        <div style={{ borderTop:"1px solid var(--border)" }}>
          {PROJECTS.map(p => (
            <a key={p.num} href="#" className="project-item" data-img={p.img}
              style={{ display:"grid",gridTemplateColumns:"auto 1fr auto auto",alignItems:"center",gap:"3rem",padding:"2rem clamp(1.5rem,4vw,4rem)",borderBottom:"1px solid var(--border)",position:"relative",overflow:"hidden",transition:"border-color .3s" }}>
              <span style={{ fontFamily:"'Syne',sans-serif",fontSize:"0.75rem",color:"var(--muted)",letterSpacing:"0.1em" }}>{p.num}</span>
              <span className="project-name" style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(1.5rem,3vw,2.8rem)",fontWeight:700,letterSpacing:"-0.02em",transition:"letter-spacing .4s" }}>{p.name}</span>
              <span className="project-tag" style={{ fontSize:"0.7rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--muted)",border:"1px solid var(--border)",padding:"0.4em 1em",borderRadius:100,transition:"border-color .3s,color .3s" }}>{p.tag}</span>
              <div className="project-arrow" style={{ width:40,height:40,border:"1px solid var(--border)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",transition:"transform .4s,border-color .3s,background .3s" }}>
                <ArrowSvg />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── Horizontal Cards ── */}
      <div className="h-scroll-section" style={{ position:"relative" }}>
        <h2 className="reveal-text" style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(2.5rem,5vw,5.5rem)",fontWeight:800,letterSpacing:"-0.03em",lineHeight:1,padding:"clamp(4rem,8vw,8rem) clamp(1.5rem,4vw,4rem) 0",marginBottom:"3rem" }}>עוד עבודות</h2>
        <div style={{ overflow:"hidden" }}>
          <div ref={hScrollRef} style={{ display:"flex",gap:"1.5rem",padding:"0 clamp(1.5rem,4vw,4rem) clamp(4rem,8vw,8rem)",width:"max-content" }}>
            {H_CARDS.map(c => (
              <div key={c.title} className="h-card" style={{ flexShrink:0,width:"clamp(260px,30vw,420px)" }}>
                <div className="h-card-img" style={{ width:"100%",aspectRatio:"3/4",background:"var(--bg2)",border:"1px solid var(--border)",overflow:"hidden",borderRadius:4,marginBottom:"1.5rem",position:"relative" }}>
                  <div className="h-card-img-inner" style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Syne',sans-serif",fontSize:"4rem",fontWeight:800,color:"var(--border)",transition:"transform .6s cubic-bezier(0.16,1,0.3,1)" }}>{c.letter}</div>
                </div>
                <div style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(1.2rem,2vw,1.6rem)",fontWeight:700,letterSpacing:"-0.02em",marginBottom:"0.5rem" }}>{c.title}</div>
                <div style={{ fontSize:"0.75rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--muted)" }}>{c.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Services ── */}
      <section id="services" style={{ padding:"clamp(5rem,10vw,10rem) clamp(1.5rem,4vw,4rem)" }}>
        <div className="section-label" style={{ fontSize:"0.7rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--muted)",marginBottom:"4rem",display:"flex",alignItems:"center",gap:"1rem" }}>
          <span style={{ width:30,height:1,background:"var(--muted)",display:"block" }} />מה אנחנו עושים
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:1,background:"var(--border)",border:"1px solid var(--border)" }}>
          {SERVICES.map(s => (
            <div key={s.num} className="service-card" style={{ background:"var(--bg)",padding:"clamp(2rem,3vw,3rem)",position:"relative",overflow:"hidden",transition:"background .4s" }}>
              <div style={{ fontSize:"0.65rem",letterSpacing:"0.15em",color:"var(--muted)",marginBottom:"3rem" }}>{s.num}</div>
              <div style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(1.3rem,2vw,1.8rem)",fontWeight:700,letterSpacing:"-0.02em",marginBottom:"1.5rem",lineHeight:1.1 }}>{s.title}</div>
              <div style={{ fontSize:"0.9rem",color:"var(--muted)",lineHeight:1.8 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Process ── */}
      <section id="process" style={{ padding:"clamp(5rem,10vw,10rem) clamp(1.5rem,4vw,4rem)" }}>
        <div className="section-label" style={{ fontSize:"0.7rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--muted)",marginBottom:"4rem",display:"flex",alignItems:"center",gap:"1rem" }}>
          <span style={{ width:30,height:1,background:"var(--muted)",display:"block" }} />התהליך שלנו
        </div>
        {[
          { n:"01", t:"גילוי והבנה",       d:"מתחילים עם שיחה עמוקה על העסק, הקהל, והמטרות שלך. מחקר תחרותי ומיפוי הזדמנויות." },
          { n:"02", t:"אסטרטגיה ועיצוב",   d:"בניית הבסיס האסטרטגי ועיצוב הקונספט הויזואלי. שיתוף פעולה הדוק איתך בכל שלב." },
          { n:"03", t:"פיתוח ובנייה",       d:"הבאת העיצוב לחיים עם קוד נקי, אנימציות חלקות, ואתר שמדבר לקהל שלך." },
          { n:"04", t:"השקה ותמיכה",        d:"90 יום של תמיכה אחרי ההשקה — כי אנחנו לא עוזבים עד שהמותג שלך ממריא." },
        ].map(st => (
          <div key={st.n} className="process-step" style={{ display:"grid",gridTemplateColumns:"auto 1fr",gap:"3rem",padding:"3rem 0",borderBottom:"1px solid var(--border)" }}>
            <div className="step-num" style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(3rem,5vw,5rem)",fontWeight:800,lineHeight:1,letterSpacing:"-0.04em",color:"var(--border)",minWidth:80,transition:"color .4s" }}>{st.n}</div>
            <div>
              <div className="reveal-text" style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(1.5rem,2.5vw,2.2rem)",fontWeight:700,letterSpacing:"-0.02em",marginBottom:"1rem" }}>{st.t}</div>
              <div style={{ fontSize:"0.9rem",color:"var(--muted)",lineHeight:1.8,maxWidth:480 }}>{st.d}</div>
            </div>
          </div>
        ))}
      </section>

      {/* ── Testimonial ── */}
      <section style={{ padding:"clamp(5rem,10vw,10rem) clamp(1.5rem,4vw,4rem)",textAlign:"center" }}>
        <div className="section-label" style={{ justifyContent:"center",fontSize:"0.7rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--muted)",marginBottom:"4rem",display:"flex",alignItems:"center",gap:"1rem" }}>
          <span style={{ width:30,height:1,background:"var(--muted)",display:"block" }} />מה אומרים עלינו
        </div>
        <blockquote className="reveal-text" style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(1.8rem,4vw,4rem)",fontWeight:700,letterSpacing:"-0.03em",lineHeight:1.15,marginBottom:"3rem",maxWidth:900,margin:"0 auto 3rem" }}>
          "הם לא רק עיצבו לנו אתר — הם <em style={{ fontStyle:"italic",fontWeight:400,color:"var(--accent)" }}>שינו את הדרך</em> שהלקוחות שלנו תופסים אותנו."
        </blockquote>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:"1rem" }}>
          <img src="https://i.pravatar.cc/88?img=12" alt="" style={{ width:44,height:44,borderRadius:"50%",objectFit:"cover",border:"1px solid var(--border)" }} />
          <div style={{ textAlign:"start" }}>
            <div style={{ fontWeight:500,fontSize:"0.9rem" }}>דנה כהן</div>
            <div style={{ fontSize:"0.75rem",color:"var(--muted)" }}>מנכ"לית, Nexus Studio</div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="contact" className="cta-section" style={{ textAlign:"center",padding:"clamp(6rem,12vw,14rem) clamp(1.5rem,4vw,4rem)",position:"relative",overflow:"hidden" }}>
        <div className="cta-bg-text" style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontFamily:"'Syne',sans-serif",fontSize:"clamp(6rem,20vw,22rem)",fontWeight:800,letterSpacing:"-0.05em",color:"transparent",WebkitTextStroke:"1px var(--border)",whiteSpace:"nowrap",userSelect:"none",pointerEvents:"none" }}>LET'S TALK</div>
        <p style={{ fontSize:"0.75rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--accent)",marginBottom:"2rem",position:"relative" }}>מוכן להתחיל?</p>
        <h2 className="reveal-text" style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(3rem,8vw,9rem)",fontWeight:800,letterSpacing:"-0.04em",lineHeight:0.95,marginBottom:"3rem",position:"relative" }}>בואנו<br/>לעבוד.</h2>
        <div className="mag-btn-wrap" style={{ display:"inline-block",position:"relative" }}>
          <a href="mailto:hello@studio.com" className="mag-btn" style={{ display:"inline-flex",alignItems:"center",gap:"1rem",padding:"1.2em 2.5em",border:"1px solid var(--fg)",borderRadius:100,fontFamily:"'Syne',sans-serif",fontSize:"clamp(0.9rem,1.2vw,1.1rem)",fontWeight:600,color:"var(--fg)",background:"transparent",position:"relative",overflow:"hidden",transition:"color .4s" }}>
            <span style={{ position:"relative",zIndex:1 }}>שלח הודעה</span>
            <svg className="mag-arrow" style={{ width:18,height:18,position:"relative",zIndex:1,transition:"transform .4s" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
            </svg>
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop:"1px solid var(--border)",padding:"clamp(3rem,5vw,5rem) clamp(1.5rem,4vw,4rem)" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"3rem",flexWrap:"wrap",marginBottom:"4rem" }}>
          <div style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(1.5rem,3vw,2.5rem)",fontWeight:800,letterSpacing:"-0.03em" }}>STUDIO</div>
          <div style={{ display:"flex",gap:"clamp(1.5rem,3vw,4rem)",flexWrap:"wrap" }}>
            {["עבודות","שירותים","תהליך","אודות","בלוג"].map(l => (
              <a key={l} href="#" style={{ fontSize:"0.8rem",letterSpacing:"0.08em",textTransform:"uppercase",color:"var(--muted)",transition:"color .3s" }} onMouseEnter={e => (e.currentTarget.style.color="var(--fg)")} onMouseLeave={e => (e.currentTarget.style.color="var(--muted)")}>{l}</a>
            ))}
          </div>
        </div>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"1rem",paddingTop:"2rem",borderTop:"1px solid var(--border)" }}>
          <span style={{ fontSize:"0.75rem",color:"var(--muted)" }}>© 2024 Studio. כל הזכויות שמורות.</span>
          <a href="mailto:hello@studio.com" className="footer-email" style={{ fontFamily:"'Syne',sans-serif",fontWeight:600,color:"var(--fg)",position:"relative" }}>hello@studio.com</a>
        </div>
      </footer>
    </>
  );
}
