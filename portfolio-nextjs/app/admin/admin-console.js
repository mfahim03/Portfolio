"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "../theme-toggle";

const resources = [
  { key: "education", label: "Education", fields: [["degree", "Degree"], ["school", "School"], ["detail", "Details"], ["period", "Period"], ["sort_order", "Sort order", "number"]] },
  { key: "work-experience", label: "Work experience", fields: [["role", "Role"], ["organization", "Organization"], ["period", "Period"], ["summary", "Summary", "textarea"], ["sort_order", "Sort order", "number"]] },
  { key: "certifications", label: "Certifications", fields: [["name", "Certification"], ["issuer", "Issuer"], ["date", "Date"], ["sort_order", "Sort order", "number"]] },
  { key: "tech-categories", label: "Tech categories", fields: [["name", "Category"], ["sort_order", "Sort order", "number"]] },
  { key: "tech-items", label: "Tech items", fields: [["name", "Technology"], ["category_id", "Category", "category"], ["icon_slug", "Simple Icons slug (optional)"], ["sort_order", "Sort order", "number"]] },
  { key: "projects", label: "Projects", fields: [["title", "Project title"], ["project_type", "Project type", "project-type"], ["summary", "Summary", "textarea"], ["frontend", "Frontend"], ["backend", "Backend"], ["technologies", "Technologies (comma separated)"], ["demo_url", "Demo URL"], ["repo_url", "Repository URL"], ["figma_url", "Figma URL"], ["sort_order", "Sort order", "number"]] },
];

export default function AdminConsole() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [verificationPrompt, setVerificationPrompt] = useState(false);
  const [resourceKey, setResourceKey] = useState("education");
  const [records, setRecords] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [portraitUrl, setPortraitUrl] = useState("");
  const [imageUrls, setImageUrls] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const resource = useMemo(() => resources.find((item) => item.key === resourceKey), [resourceKey]);

  const loadRecords = useCallback(async (key = resourceKey) => {
    const response = await fetch(`/api/${key}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not load records.");
    setRecords(data);
  }, [resourceKey]);

  useEffect(() => {
    fetch("/api/admin/session").then((response) => response.json()).then((data) => setAuthenticated(data.authenticated)).catch(() => {}).finally(() => setChecking(false));
    fetch("/api/tech-categories", { cache: "no-store" }).then((response) => response.json()).then((data) => { if (Array.isArray(data)) setCategories(data); }).catch(() => {});
  }, []);
  useEffect(() => {
    if (!authenticated) return;
    fetch("/api/admin/portrait", { cache: "no-store" }).then((response) => response.json()).then((data) => setPortraitUrl(data.portrait_url || "")).catch(() => {});
  }, [authenticated]);
  useEffect(() => {
    if (!authenticated || resourceKey === "portrait") return;
    let ignore = false;
    fetch(`/api/${resourceKey}`, { cache: "no-store" }).then((response) => response.json()).then((data) => {
      if (!ignore) {
        if (Array.isArray(data)) setRecords(data);
        else setError(data.error || "Could not load records.");
      }
    }).catch((requestError) => { if (!ignore) setError(requestError.message); });
    return () => { ignore = true; };
  }, [authenticated, resourceKey]);

  async function signIn(event) {
    event.preventDefault(); setError(""); setStatusMessage(""); setSaving(true);
    try {
      const response = await fetch("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Sign in failed.");
      setAuthenticated(true); setPassword(""); setVerificationPrompt(false);
    } catch (requestError) { setError(requestError.message); setVerificationPrompt(requestError.message.includes("Verify this account’s email")); }
    finally { setSaving(false); }
  }

  async function requestVerificationEmail() {
    setError(""); setStatusMessage(""); setSaving(true);
    try {
      const response = await fetch("/api/admin/verification-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not request a verification email.");
      setVerificationPrompt(false);
      setStatusMessage(result.alreadyVerified ? "This account is already verified. Sign in again." : "Verification link sent. Check your inbox and spam folder, follow the link, then sign in again.");
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  }

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" });
    setAuthenticated(false); setRecords([]); setEditing(null);
  }

  async function saveRecord(event) {
    event.preventDefault(); setError(""); setSaving(true);
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    if (resourceKey === "projects") {
      try {
        const uploaded = [];
        for (const file of newImages) uploaded.push(await upload(file, "projects"));
        data.image_urls = [...imageUrls, ...uploaded];
      } catch (requestError) { setError(requestError.message); setSaving(false); return; }
    }
    if (Object.hasOwn(data, "sort_order")) data.sort_order = Number(data.sort_order) || 0;
    const url = editing?.id ? `/api/${resourceKey}/${editing.id}` : `/api/${resourceKey}`;
    try {
      const response = await fetch(url, { method: editing?.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save this record.");
      setEditing(null); await loadRecords();
      setNewImages([]); setImageUrls([]);
      if (resourceKey === "tech-categories") {
        const categoryResponse = await fetch("/api/tech-categories", { cache: "no-store" });
        setCategories(await categoryResponse.json());
      }
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  }

  async function upload(file, folder) {
    const form = new FormData(); form.append("file", file); form.append("folder", folder);
    const response = await fetch("/api/admin/upload", { method: "POST", body: form });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Image upload failed.");
    return result.url;
  }

  async function savePortrait(event) {
    event.preventDefault(); setError(""); setSaving(true);
    try {
      const form = event.currentTarget;
      const file = form.elements.portrait.files[0];
      const url = file ? await upload(file, "profile") : portraitUrl;
      const response = await fetch("/api/admin/portrait", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ portrait_url: url }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save portrait.");
      setPortraitUrl(result.portrait_url); form.reset(); setStatusMessage("Profile photo saved.");
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  }

  async function removePortrait() {
    setError(""); setSaving(true);
    try {
      const response = await fetch("/api/admin/portrait", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ portrait_url: "" }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not remove portrait.");
      setPortraitUrl(""); setStatusMessage("Profile photo removed.");
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  }

  async function deleteRecord(record) {
    if (!window.confirm(`Delete “${record[resource.fields[0][0]]}”?`)) return;
    setError("");
    try {
      const response = await fetch(`/api/${resourceKey}/${record.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not delete this record.");
      await loadRecords();
      if (resourceKey === "tech-categories") setCategories((current) => current.filter((category) => category.id !== record.id));
    } catch (requestError) { setError(requestError.message); }
  }

  if (checking) return <main className="admin-shell"><p className="admin-loading">Checking admin session…</p></main>;
  if (!authenticated) return <main className="admin-shell"><div className="admin-login-card"><div className="admin-login-top"><Link href="/" className="admin-back">← Back to portfolio</Link><ThemeToggle /></div><span className="wordmark-mark admin-monogram">F</span><p className="eyebrow">PRIVATE PORTFOLIO</p><h1>Admin sign in</h1><p className="admin-intro">Use the verified Firebase admin account to manage portfolio content.</p><form onSubmit={signIn} className="admin-form"><label>Email address<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>{error && <p className="form-error" role="alert">{error}</p>}{statusMessage && <p className="form-status" role="status">{statusMessage}</p>}<button className="button button-primary" type="submit" disabled={saving}>{saving ? "Signing in…" : "Sign in"}<span>→</span></button>{verificationPrompt && <button className="verification-button" type="button" disabled={saving || !email || !password} onClick={requestVerificationEmail}>{saving ? "Sending…" : "Send verification email"}</button>}</form></div></main>;

  return <main className="admin-dashboard"><header className="admin-header"><Link href="/" className="wordmark"><span className="wordmark-mark">F</span><span>Muhammad Fahim</span></Link><div><ThemeToggle /><span className="admin-state"><i /> Admin session</span><button className="admin-signout" onClick={signOut}>Sign out</button></div></header><div className="admin-main"><div className="admin-title-row"><div><p className="eyebrow">CONTENT MANAGEMENT</p><h1>Portfolio records</h1><p>Changes save directly to your Firebase Firestore collections.</p></div><Link href="/" className="admin-preview">View portfolio ↗</Link></div><div className="admin-workspace"><aside className="resource-nav"><span className="resource-nav-label">COLLECTIONS</span><button className={resourceKey === "portrait" ? "active" : ""} onClick={() => { setResourceKey("portrait"); setEditing(null); setError(""); }}>Profile photo</button>{resources.map((item) => <button key={item.key} className={resourceKey === item.key ? "active" : ""} onClick={() => { setResourceKey(item.key); setEditing(null); setError(""); }}><span>{item.label}</span><span>{item.key === resourceKey ? "↗" : ""}</span></button>)}</aside><section className="resource-panel">{resourceKey === "portrait" ? <><div className="resource-panel-head"><div><p className="eyebrow">HERO PROFILE PHOTO</p><h2>Your portrait</h2></div></div>{error && <p className="admin-message" role="alert">{error}</p>}{statusMessage && <p className="form-status" role="status">{statusMessage}</p>}<form className="record-editor" onSubmit={savePortrait}><p className="upload-hint">Upload a clear portrait to show beside your name in the hero. JPEG, PNG, WebP or AVIF, up to 3.5 MB.</p><p className="code-media-note">Code option: put the image under <code>public/</code> and set <code>codeProfilePortrait</code> in <code>lib/project-media.js</code>. That path stays out of Firestore.</p><input name="portrait" type="file" accept="image/jpeg,image/png,image/webp,image/avif" />{portraitUrl && <Image className="portrait-preview" src={portraitUrl} alt="Current profile portrait" width={128} height={160} unoptimized />}<div className="editor-actions"><button type="button" className="cancel-button" onClick={removePortrait} disabled={saving}>Remove photo</button><button type="submit" className="button button-primary small-button" disabled={saving}>{saving ? "Saving…" : "Save photo"}<span>→</span></button></div></form></> : <><div className="resource-panel-head"><div><p className="eyebrow">FIRESTORE COLLECTION</p><h2>{resource.label}</h2></div><button className="button button-primary small-button" onClick={() => { setEditing({}); setImageUrls([]); setNewImages([]); setError(""); }}>Add record <span>+</span></button></div>{error && <p className="admin-message" role="alert">{error}</p>}{editing !== null && <form className="record-editor" onSubmit={saveRecord}><div className="editor-head"><h3>{editing.id ? "Edit record" : "New record"}</h3><button type="button" className="close-editor" onClick={() => setEditing(null)} aria-label="Close editor">×</button></div><div className="editor-grid">{resource.fields.map(([field, label, type]) => <label key={field} className={type === "textarea" ? "wide-field" : ""}>{label}{type === "category" ? <select name={field} defaultValue={editing[field] || categories[0]?.id || ""} required>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select> : type === "project-type" ? <select name={field} defaultValue={editing[field] || "web"}><option value="mobile">Mobile app</option><option value="web">Web app</option><option value="desktop">Desktop / simulation</option><option value="other">Other</option></select> : type === "textarea" ? <textarea name={field} rows={4} required defaultValue={editing[field] || ""} /> : <input name={field} type={type === "number" ? "number" : "text"} required={field !== "detail" && !["demo_url", "repo_url", "figma_url"].includes(field)} defaultValue={Array.isArray(editing[field]) ? editing[field].join(", ") : editing[field] ?? (type === "number" ? "0" : "")} />}</label>)}</div>{resourceKey === "projects" && <div className="project-upload"><label>Project screenshots<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={(event) => setNewImages(Array.from(event.target.files || []))} /></label><p>{imageUrls.length + newImages.length} photo(s) selected. Uploads are added when you save.</p><p className="code-media-note">Code option: put images under <code>public/projects/</code> and map their paths by project ID in <code>codeProjectImages</code> in <code>lib/project-media.js</code>. The image files and paths stay out of Firestore.</p><div className="upload-thumbs">{imageUrls.map((url, index) => <div key={url}><Image src={url} alt={`Project screenshot ${index + 1}`} width={88} height={88} unoptimized /><button type="button" onClick={() => setImageUrls((current) => current.filter((item) => item !== url))}>Remove</button></div>)}{newImages.map((file, index) => <div key={`${file.name}-${index}`}><span>{file.name}</span><button type="button" onClick={() => setNewImages((current) => current.filter((_, i) => i !== index))}>Remove</button></div>)}</div></div>}<div className="editor-actions"><button type="button" className="cancel-button" onClick={() => setEditing(null)}>Cancel</button><button type="submit" className="button button-primary small-button" disabled={saving}>{saving ? "Saving…" : "Save record"}<span>→</span></button></div></form>}<div className="record-list">{records.length ? records.map((record) => <article className="record-row" key={record.id}><div><h3>{record[resource.fields[0][0]]}</h3><p>{record.frontend ? `Frontend: ${record.frontend} · Backend: ${record.backend}` : record.school || record.organization || record.issuer || record.category || record.name || record.period || ""}</p></div><div className="record-actions"><button onClick={() => { setEditing(record); setImageUrls(record.image_urls || []); setNewImages([]); }}>Edit</button><button className="delete-action" onClick={() => deleteRecord(record)}>Delete</button></div></article>) : <p className="empty-state">No records yet. Add the first record to this collection.</p>}</div></>}</section></div><p className="admin-footnote">Your sign-in is checked by Firebase Authentication. Only the configured verified admin email can make changes.</p></div></main>;
}
