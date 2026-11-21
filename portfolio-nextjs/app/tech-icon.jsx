"use client";

import Image from "next/image";
import { useState } from "react";

const brandIcons = {
  JavaScript: ["javascript", "F7DF1E"], Java: ["openjdk", "ED8B00"], Python: ["python", "3776AB"],
  "C++": ["cplusplus", "00599C"], PHP: ["php", "777BB4"], Dart: ["dart", "0175C2"],
  HTML5: ["html5", "E34F26"], CSS3: ["css", "1572B6"], React: ["react", "61DAFB"], "Vue.js": ["vuedotjs", "4FC08D"],
  "Spring Boot": ["springboot", "6DB33F"], "Node.js": ["nodedotjs", "5FA04E"], Flutter: ["flutter", "02569B"],
  "Android Studio": ["androidstudio", "3DDC84"], MySQL: ["mysql", "4479A1"], "Firebase Firestore": ["firebase", "DD2C00"],
  MongoDB: ["mongodb", "47A248"], Git: ["git", "F05032"], GitHub: ["github", "8054B5"], LinkedIn: ["linkedin", "0A66C2"], YouTube: ["youtube", "FF0033"], "VS Code": ["visualstudiocode", "007ACC"],
  Figma: ["figma", "F24E1E"], Tableau: ["tableau", "E97627"], Jira: ["jira", "0052CC"], Clockify: ["clockify", "03A9F4"],
};

const letterMarks = {
  "REST APIs": ["API", "#52766A"], "Microsoft SQL Server": ["SQL", "#A4262C"], "Enterprise Architect": ["EA", "#416C7A"],
  Katalon: ["K", "#00A3A3"], Agile: ["Ag", "#4C856D"], "MVC Architecture": ["MVC", "#8367AF"],
  "Layered Architecture": ["LA", "#5587A8"], "MVVM Architecture": ["MV", "#D46C48"], "NoSQL Database Design": ["NoSQL", "#487F63"],
};

export default function TechIcon({ name, iconSlug }) {
  const [failed, setFailed] = useState(false);
  const [brandSlug, brandColor] = brandIcons[name] || [];
  const manualMark = letterMarks[name];
  const inferredSlug = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const slug = iconSlug?.trim() || brandSlug || (manualMark ? "" : inferredSlug);
  const color = brandColor || "52766A";
  const [mark, accent] = manualMark || [name.slice(0, 2).toUpperCase(), "#52766A"];

  if (!slug || failed) return <span className="tech-icon tech-icon--monogram" style={{ "--icon-accent": accent }} aria-hidden="true">{mark}</span>;

  return <span className="tech-icon" aria-hidden="true">
    <Image src={`https://cdn.simpleicons.org/${encodeURIComponent(slug)}/${color}`} alt="" width={20} height={20} unoptimized onError={() => setFailed(true)} />
  </span>;
}
