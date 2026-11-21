"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import TechIcon from "../tech-icon";

const filters = [
  { id: "all", label: "All work" },
  { id: "mobile", label: "Mobile apps" },
  { id: "web", label: "Web systems" },
  { id: "engineering", label: "Others" },
];

function categoryOf(project) {
  if (project.project_type === "mobile") return "mobile";
  if (project.project_type === "web" && !/pipeline|katalon|automation/i.test(project.title)) return "web";
  return "engineering";
}

function mediaLabel(project) {
  return project.project_type === "mobile" ? "MOBILE APPLICATION" : project.project_type === "web" ? "WEB SYSTEM" : "OTHERS";
}

function DemoIcon({ url }) {
  if (/youtu\.be|youtube\.com/i.test(url)) return <TechIcon name="YouTube" />;
  return <span className="demo-link-icon" aria-hidden="true">▶</span>;
}

export default function WorksBrowser({ projects }) {
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(projects[0]?.id || "");
  const galleryRef = useRef(null);
  const filtered = useMemo(() => filter === "all" ? projects : projects.filter((project) => categoryOf(project) === filter), [filter, projects]);
  const selected = filtered.find((project) => project.id === selectedId) || filtered[0];
  const selectedIndex = Math.max(0, filtered.findIndex((project) => project.id === selected?.id));

  useEffect(() => {
    galleryRef.current?.scrollTo({ left: 0 });
  }, [filter]);

  function chooseFilter(id) {
    setFilter(id);
    const next = id === "all" ? projects : projects.filter((project) => categoryOf(project) === id);
    if (next[0]) setSelectedId(next[0].id);
  }

  function stepProject(direction) {
    const nextIndex = (selectedIndex + direction + filtered.length) % filtered.length;
    setSelectedId(filtered[nextIndex].id);
  }

  function chooseProject(id) {
    setSelectedId(id);
    document.getElementById("featured-project")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function moveGallery(direction) {
    const gallery = galleryRef.current;
    const card = gallery?.querySelector(".works-card");
    if (!gallery || !card) return;
    const gap = Number.parseFloat(window.getComputedStyle(gallery).columnGap) || 0;
    gallery.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: "smooth" });
  }

  if (!selected) return <section className="works-browser"><p>No projects yet. Add one in the admin panel.</p></section>;

  return <div className="works-browser">
    <section className="works-spotlight" id="featured-project" aria-live="polite">
      <div className="works-stage-head"><span>FEATURED PROJECT</span><span>{String(selectedIndex + 1).padStart(2, "0")} <i>/</i> {String(filtered.length).padStart(2, "0")}</span></div>
      <div className="works-stage">
        <div className={`works-visual ${selected.project_type === "mobile" ? "works-visual-mobile" : "works-visual-wide"}`}>
          <div className="works-visual-grid" aria-hidden="true" />
          {selected.image_urls?.length ? <div className="works-media-stack">{selected.image_urls.map((url, index) => <div className={selected.project_type === "mobile" ? "works-phone" : "works-browser-shot"} key={`${selected.id}-${index}`}>
            {selected.project_type === "mobile" && <span className="works-phone-sensor" />}
            <Image src={url} alt={`${selected.title} screenshot ${index + 1}`} width={selected.project_type === "mobile" ? 420 : 1280} height={selected.project_type === "mobile" ? 860 : 800} unoptimized />
            {selected.project_type !== "mobile" && <div className="works-browser-top"><i /><i /><i /><span>{mediaLabel(selected)}</span></div>}
          </div>)}</div> : <div className="works-art-card"><span className="works-art-index">{String(selectedIndex + 1).padStart(2, "0")}</span><div className="works-art-lines"><i /><i /><i /><i /></div><p>{mediaLabel(selected)}</p><strong>{selected.title.split(" · ")[0]}</strong><small>{(selected.technologies || []).slice(0, 4).join(" / ")}</small></div>}
          <span className="works-visual-caption">{mediaLabel(selected)}</span>
        </div>
        <div className="works-detail">
          <div className="works-detail-meta"><span>{String(selected.sort_order || selectedIndex + 1).padStart(2, "0")} / 2022—2026</span><span>{categoryOf(selected).toUpperCase()}</span></div>
          <h2>{selected.title.split(" · ")[0]}</h2>
          <p className="works-detail-summary">{selected.summary}</p>
          <div className="works-stack-list"><div><span>FRONTEND</span><b>{selected.frontend || "—"}</b></div><div><span>BACKEND</span><b>{selected.backend || "—"}</b></div></div>
          <div className="works-tools"><span>TOOLS & METHODS</span><p>{(selected.technologies || []).map((technology) => <i key={technology}>{technology}</i>)}</p></div>
          <div className="works-detail-foot"><div className="works-project-links">{selected.repo_url && <a className="works-link works-link-github" href={selected.repo_url} target="_blank" rel="noreferrer"><TechIcon name="GitHub" /><span>GitHub</span><b aria-hidden="true">↗</b></a>}{selected.demo_url && <a className="works-link works-link-demo" href={selected.demo_url} target="_blank" rel="noreferrer"><DemoIcon url={selected.demo_url} /><span>Demo</span><b aria-hidden="true">↗</b></a>}{selected.figma_url && <a className="works-link works-link-figma" href={selected.figma_url} target="_blank" rel="noreferrer"><TechIcon name="Figma" /><span>Figma</span><b aria-hidden="true">↗</b></a>}</div><div className="works-step-controls"><button type="button" onClick={() => stepProject(-1)} aria-label="Previous project">←</button><button type="button" onClick={() => stepProject(1)} aria-label="Next project">→</button></div></div>
        </div>
      </div>
    </section>

    <section className="works-index" aria-labelledby="works-index-title"><div className="works-index-head"><div><p className="eyebrow">BROWSE THE COLLECTION</p><h2 id="works-index-title">Project gallery</h2></div><div className="works-gallery-controls"><span>{String(filtered.length).padStart(2, "0")} PROJECTS</span><button type="button" onClick={() => moveGallery(-1)} aria-label="Previous projects">←</button><button type="button" onClick={() => moveGallery(1)} aria-label="Next projects">→</button></div></div>
      <div className="works-filters" role="group" aria-label="Filter projects">{filters.map((item) => <button type="button" key={item.id} className={filter === item.id ? "active" : ""} aria-pressed={filter === item.id} onClick={() => chooseFilter(item.id)}>{item.label}<span>{String(item.id === "all" ? projects.length : projects.filter((project) => categoryOf(project) === item.id).length).padStart(2, "0")}</span></button>)}</div>
      <div className="works-card-grid" ref={galleryRef} role="region" aria-label="Project gallery slider" tabIndex={0}>{filtered.map((project, index) => <button type="button" className={`works-card ${selected.id === project.id ? "selected" : ""}`} key={project.id} onClick={() => chooseProject(project.id)} aria-pressed={selected.id === project.id}>
        <span className={`works-card-visual ${project.project_type === "mobile" ? "mobile-card-visual" : ""}`}>
          {project.image_urls?.[0] ? project.project_type === "mobile" ? <span className="works-card-phone"><Image src={project.image_urls[0]} alt="" width={320} height={620} unoptimized /><i /></span> : <Image className="works-card-image" src={project.image_urls[0]} alt="" width={900} height={520} unoptimized /> : <span className="works-card-cover"><i>{String(index + 1).padStart(2, "0")}</i><b>{mediaLabel(project)}</b><strong>{project.title.split(" · ")[0]}</strong><small>{(project.technologies || []).slice(0, 3).join(" · ")}</small></span>}
          {project.image_urls?.length > 1 && <span className="works-card-count">{String(project.image_urls.length).padStart(2, "0")} IMAGES</span>}
        </span>
        <span className="works-card-meta"><i>{String(index + 1).padStart(2, "0")}</i><span>{mediaLabel(project)}</span><b aria-hidden="true">↗</b></span>
        <strong className="works-card-title">{project.title.split(" · ")[0]}</strong>
        <span className="works-card-stack">{project.frontend || (project.technologies || []).slice(0, 3).join(" · ")}</span>
      </button>)}</div>
    </section>
  </div>;
}
