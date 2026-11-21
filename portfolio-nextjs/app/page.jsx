import Image from "next/image";
import { getPortraitUrl, listResource } from "@/models/portfolio-model";
import { initialContent } from "@/lib/portfolio-content";
import TechIcon from "./tech-icon";
import ProjectsDeck from "./works/projects-deck";
import ThemeToggle from "./theme-toggle";
import GlowCard from "./glow-card";
import { codeProfilePortrait, codeProjectImages } from "@/lib/project-media";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function load(resource) {
  try { return await listResource(resource); }
  catch { return initialContent[resource]; }
}

async function loadPortrait() { try { return await getPortraitUrl(); } catch { return ""; } }

function SectionIntro({ eyebrow, title, number }) {
  return <div className="section-intro"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><span className="section-number">{number}</span></div>;
}

export default async function Home() {
  const [education, experience, certifications, categories, technologies, projects, storedPortraitUrl] = await Promise.all([
    load("education"), load("work-experience"), load("certifications"), load("tech-categories"), load("tech-items"), load("projects"), loadPortrait(),
  ]);
  const portraitUrl = codeProfilePortrait || storedPortraitUrl;
  const visibleProjects = projects.map((project) => ({ ...project, image_urls: codeProjectImages[project.id] || project.image_urls || [] }));
  const technologiesByCategory = new Map(categories.map((category) => [category.id, []]));
  for (const item of technologies) technologiesByCategory.get(item.category_id)?.push(item);

  return <>
    <header className="site-header"><div className="nav-wrap">
      <a className="wordmark" href="#top" aria-label="Muhammad Fahim home"><span className="wordmark-mark">F</span><span>MUHAMMAD FAHIM</span></a>
      <nav aria-label="Main navigation"><a href="#about">About</a><a href="#projects">Projects</a><a href="#stack">Tech stack</a><ThemeToggle /></nav>
    </div></header>
    <main id="top">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-inner page-wrap">
          <div className="hero-copy" data-enter>
            <p className="eyebrow"><span className="status-dot" /> SOFTWARE ENGINEER · MALAYSIA</p>
            <div className="hero-name-row"><h1 id="hero-title">Muhammad<br /><span>Fahim.</span></h1>{portraitUrl ? <Image className="hero-portrait" src={portraitUrl} alt="Muhammad Fahim" width={168} height={200} unoptimized priority /> : <div className="hero-portrait hero-portrait-placeholder" aria-label="Profile photo can be added in Admin">F</div>}</div>
            <p className="hero-lead">Software engineering graduate building full-stack applications, mobile products and the systems behind them.</p>
            <div className="hero-actions"><a className="button button-primary" href="#about">About me <span>↓</span></a><div className="hero-social-actions"><a className="text-link" href="https://github.com/mfahim03" target="_blank" rel="noreferrer"><TechIcon name="GitHub" />View GitHub <span>↗</span></a><a className="text-link" href="https://linkedin.com/in/muhammadfahim03" target="_blank" rel="noreferrer"><TechIcon name="LinkedIn" />LinkedIn <span>↗</span></a></div></div>
            <div className="hero-meta"><span>UTM · B.Comp.Sc. Software Engineering</span><span>2022 — 2026</span></div>
          </div>
          <div className="hero-art" aria-label="Code editor showing a software engineering profile">
            <div className="art-topbar"><div className="window-dots"><i /><i /><i /></div><span>fahim.config.js</span><span className="art-live">● LIVE PROFILE</span></div>
            <div className="art-body"><div className="line-numbers">01<br />02<br />03<br />04<br />05<br />06<br />07<br />08<br />09</div><pre><span className="code-purple">const</span> <span className="code-blue">developer</span> = {'{'}<br />&nbsp; name: <span className="code-green">&apos;Muhammad Fahim&apos;</span>,<br />&nbsp; degree: <span className="code-green">&apos;Software Engineering&apos;</span>,<br />&nbsp; cgpa: <span className="code-orange">3.76</span>,<br />&nbsp; focus: [<br />&nbsp;&nbsp; <span className="code-green">&apos;full-stack&apos;</span>,<br />&nbsp;&nbsp; <span className="code-green">&apos;mobile development&apos;</span>,<br />&nbsp;&nbsp; <span className="code-green">&apos;database design&apos;</span><br />&nbsp; ]<br />{'}'};</pre></div>
            <div className="art-footer"><span><b /> Available for opportunities</span><span>MY · 11.2026</span></div>
            <div className="art-stamp"><span>UTM</span><small>COMPUTER<br />SCIENCE</small></div>
          </div>
        </div>
        <div className="hero-bottom page-wrap"><span>01 / 03</span><span>SCROLL TO EXPLORE</span><span>↓</span></div>
      </section>

      <section id="about" className="content-section about-section">
        <div className="page-wrap"><SectionIntro eyebrow="BACKGROUND & EXPERIENCE" title="About me" number="01" />
          <div className="about-layout">
            <div className="timeline-column">
              <GlowCard className="timeline-group"><div className="group-label"><span>01</span><h3>Education</h3></div><ol className="timeline-list" aria-label="Education">{education.map((item, index) => <li className="timeline-entry" key={item.id}><span className="entry-index">{String(index + 1).padStart(2, "0")}</span><div className="entry-content"><div className="entry-top"><h4>{item.degree}</h4><span>{item.period}</span></div><p>{item.school}{item.detail ? ` · ${item.detail}` : ""}</p></div></li>)}</ol></GlowCard>
              <GlowCard className="timeline-group"><div className="group-label"><span>02</span><h3>Work experience (Fresh Graduate)</h3></div><ol className="timeline-list" aria-label="Work experience">{experience.map((item, index) => <li className="timeline-entry" key={item.id}><span className="entry-index">{String(index + 1).padStart(2, "0")}</span><div className="entry-content"><div className="entry-top"><h4>{item.role}</h4><span>{item.period}</span></div><p className="entry-org">{item.organization}</p><p>{item.summary}</p></div></li>)}</ol></GlowCard>
              <GlowCard className="timeline-group"><div className="group-label"><span>03</span><h3>Certifications</h3></div><ol className="timeline-list" aria-label="Certifications">{certifications.map((item, index) => <li className="timeline-entry cert-entry" key={item.id}><span className="entry-index">{String(index + 1).padStart(2, "0")}</span><div className="entry-content"><div className="entry-top"><h4>{item.name}</h4><span>{item.date}</span></div><p>{item.issuer}</p></div></li>)}</ol></GlowCard>
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="content-section projects-section works-section">
        <div className="page-wrap"><div className="section-intro"><p className="eyebrow">SELECTED WORK · FRONTEND & BACKEND</p><h2>Projects I’ve built</h2><span className="section-number">02</span></div>
          <div className="projects-intro"><p>Mobile apps, web systems and others work. Each folder shows the project image, stack and details together.</p><span>{String(visibleProjects.length).padStart(2, "0")} PROJECTS</span></div>
          <ProjectsDeck projects={visibleProjects} />
        </div>
      </section>

      <section id="stack" className="content-section stack-section">
        <div className="page-wrap"><SectionIntro eyebrow="TOOLS & METHODS" title="My tech stack" number="03" />
          <div className="stack-heading"><p>Tools I use to turn requirements into working software, from interface to data layer.</p><span>{technologies.length.toString().padStart(2, "0")} SKILLS</span></div>
          <div className="stack-grid">{categories.map((category, index) => <article className="stack-group" key={category.id}><div className="stack-group-head"><span>{String(index + 1).padStart(2, "0")}</span><h3>{category.name}</h3></div><ul>{(technologiesByCategory.get(category.id) || []).map((item) => <li key={item.id}><TechIcon name={item.name} iconSlug={item.icon_slug} />{item.name}</li>)}</ul></article>)}</div>
        </div>
      </section>

      <footer id="contact" className="site-footer"><div className="page-wrap"><div className="footer-top"><div><p className="eyebrow">GET IN TOUCH</p><h2>Find me on</h2></div><div className="footer-contact-links"><a href="mailto:fahim.mfza@gmail.com"><span className="contact-icon contact-icon-mail" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg></span><span className="contact-label"><strong>fahim.mfza@gmail.com</strong><small>Email</small></span><b aria-hidden="true">↗</b></a><a href="https://www.linkedin.com/in/muhammadfahim03" target="_blank" rel="noreferrer"><span className="contact-icon"><TechIcon name="LinkedIn" /></span><span className="contact-label"><strong>LinkedIn</strong><small>Professional profile</small></span><b aria-hidden="true">↗</b></a><a href="https://github.com/mfahim03" target="_blank" rel="noreferrer"><span className="contact-icon"><TechIcon name="GitHub" /></span><span className="contact-label"><strong>GitHub</strong><small>Code and projects</small></span><b aria-hidden="true">↗</b></a></div></div><div className="footer-bottom"><a className="wordmark footer-mark" href="#top"><span className="wordmark-mark">F</span><span>MUHAMMAD FAHIM</span></a><span>Software engineer · Malaysia</span><span>© 2026</span></div></div></footer>
    </main>
  </>;
}
