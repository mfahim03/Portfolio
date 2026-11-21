export const initialContent = {
  education: [
    { id: "education-1", degree: "Bachelor of Computer Science (Software Engineering) with Honours", school: "Universiti Teknologi Malaysia (UTM)", detail: "CGPA 3.76", period: "2022–2026", sort_order: 1 },
    { id: "education-2", degree: "Foundation in Engineering", school: "Kolej MARA Kuala Nerang", detail: "CGPA 3.95", period: "2021–2022", sort_order: 2 },
    { id: "education-3", degree: "Secondary education", school: "MRSM Baling", detail: "SPM", period: "2016–2021", sort_order: 3 },
  ],
  "work-experience": [
    { id: "work-1", role: "Full Stack Developer Intern", organization: "ALPS Electric (Malaysia) Sdn Bhd", period: "September 2025–February 2026", summary: "Built and enhanced full-stack applications with PHP, HTML, CSS, JavaScript and Microsoft SQL Server. Developed HR systems for more than 500 foreign worker records, with passport and permit tracking and visual dashboards.", sort_order: 1 },
  ],
  certifications: [
    { id: "cert-1", name: "Full Stack Java with AI", issuer: "CCSD Council / Yayasan Peneraju", date: "August 2026", sort_order: 1 },
    { id: "cert-2", name: "iOS and Android Mobile App Developer Professional Certificate", issuer: "IBM / Coursera", date: "October 2026", sort_order: 2 },
    { id: "cert-3", name: "Generative AI for Software Developers Specialization", issuer: "IBM / Coursera", date: "October 2026", sort_order: 3 },
    { id: "cert-4", name: "Google UX Design Professional Certificate", issuer: "Google / Coursera", date: "October 2026", sort_order: 4 },
  ],
  "tech-categories": [
    { id: "languages", name: "Languages", sort_order: 1 }, { id: "frontend", name: "Frontend", sort_order: 2 },
    { id: "backend", name: "Backend", sort_order: 3 }, { id: "mobile", name: "Mobile Development", sort_order: 4 },
    { id: "databases", name: "Databases", sort_order: 5 }, { id: "tools", name: "Tools", sort_order: 6 },
    { id: "concepts", name: "Concepts & Architecture", sort_order: 7 },
  ],
  "tech-items": [
    ...["JavaScript", "Java", "Python", "C++", "PHP", "Dart"].map((name, i) => ({ id: `lang-${i + 1}`, name, category_id: "languages", sort_order: i + 1 })),
    ...["HTML5", "CSS3", "React", "Vue.js"].map((name, i) => ({ id: `front-${i + 1}`, name, category_id: "frontend", sort_order: i + 1 })),
    ...["Spring Boot", "Node.js", "REST APIs"].map((name, i) => ({ id: `back-${i + 1}`, name, category_id: "backend", sort_order: i + 1 })),
    ...["Flutter", "Android Studio"].map((name, i) => ({ id: `mobile-${i + 1}`, name, category_id: "mobile", sort_order: i + 1 })),
    ...["MySQL", "Firebase Firestore", "Microsoft SQL Server", "MongoDB"].map((name, i) => ({ id: `db-${i + 1}`, name, category_id: "databases", sort_order: i + 1 })),
    ...["Git", "GitHub", "VS Code", "Figma", "Enterprise Architect", "Tableau", "Jira", "Clockify", "Katalon"].map((name, i) => ({ id: `tool-${i + 1}`, name, category_id: "tools", sort_order: i + 1 })),
    ...["Agile", "MVC Architecture", "Layered Architecture", "MVVM Architecture", "NoSQL Database Design"].map((name, i) => ({ id: `concept-${i + 1}`, name, category_id: "concepts", sort_order: i + 1 })),
  ],
  projects: [
    { id: "project-utmsports", title: "UTMSports+ · Sports facility management", project_type: "mobile", summary: "Final year project: a mobile app for sports facility bookings, events, achievements and feedback, with Mapbox navigation and a Firebase-backed MVVM design.", frontend: "Flutter", backend: "Firebase / Cloud Firestore", technologies: ["Flutter", "Dart", "Firebase", "Mapbox", "MVVM"], demo_url: "https://youtu.be/9oNvz9kTZqM?si=Bsod_n1puFYx-870", repo_url: "https://github.com/mfahim03/utmsportsV2", figma_url: "", image_urls: [], sort_order: 1 },
    { id: "project-voluntier", title: "VolunTier · Volunteer activity registration", project_type: "web", summary: "A capstone web system for discovering volunteer activities and managing registrations, built with a React frontend and Java Spring Boot services.", frontend: "React", backend: "Java · Spring Boot · Node.js", technologies: ["React", "Java", "Spring Boot", "Node.js", "MongoDB", "JWT", "REST APIs"], demo_url: "", repo_url: "https://github.com/mfahim03/VolunTier", figma_url: "", image_urls: [], sort_order: 2 },
    { id: "project-fcw", title: "Foreign Contract Worker Masterlist", project_type: "web", summary: "An internship system for managing more than 500 foreign-worker records, passport and permit details, and operational dashboards.", frontend: "HTML · CSS · JavaScript", backend: "PHP · Microsoft SQL Server", technologies: ["PHP", "HTML", "CSS", "JavaScript", "Microsoft SQL Server"], demo_url: "", repo_url: "https://github.com/mfahim03/FCW-Masterlist", figma_url: "", image_urls: [], sort_order: 3 },
    { id: "project-door-access", title: "Door Access Management System", project_type: "web", summary: "An internship web system for monitoring and managing employee access activity.", frontend: "HTML · CSS · JavaScript", backend: "PHP · Microsoft SQL Server", technologies: ["PHP", "HTML", "CSS", "JavaScript", "Microsoft SQL Server"], demo_url: "", repo_url: "https://github.com/mfahim03/ALMA-Door-Access-Management-System", figma_url: "", image_urls: [], sort_order: 4 },
    { id: "project-speed-trials", title: "Speed Trials 2D", project_type: "desktop", summary: "A real-time and concurrent software project simulating a self-driving vehicle in a 2D trial environment.", frontend: "Python · ASP.NET", backend: "Real-time / concurrent systems", technologies: ["Python", "ASP.NET", "RTOS", "Multithreading"], demo_url: "https://youtu.be/25N8Iu907-I?si=Rr0qkDIRut_Qp_Lt", repo_url: "https://github.com/mfahim03/Speed-Trials-2D", figma_url: "", image_urls: [], sort_order: 5 },
    { id: "project-utmrunify", title: "UTMRunify · Running event management", project_type: "mobile", summary: "A Flutter application for running event registration and management, created with an Agile Scrum team.", frontend: "Flutter", backend: "Firebase", technologies: ["Flutter", "Firebase", "Figma", "Jira", "Agile Scrum"], demo_url: "", repo_url: "https://github.com/Apps-Builder/utmrunify", figma_url: "https://figma.com/design/5TkYW1QUPPZmD9E0Alapsx/UTM-Running-App?node-id=0-1&t=TQzSOG5N317OGjp0-1", image_urls: [], sort_order: 6 },
    { id: "project-cicd", title: "CI/CD pipeline implementation", project_type: "web", summary: "A deployment workflow integrating GitLab, Docker, DigitalOcean, Jira and SonarQube.", frontend: "—", backend: "GitLab CI/CD · Docker · DigitalOcean", technologies: ["GitLab", "Docker", "DigitalOcean", "Jira", "SonarQube"], demo_url: "https://youtu.be/kj-iIkXi068?si=AtxGno6scQUO9EBV", repo_url: "", figma_url: "", image_urls: [], sort_order: 7 },
    { id: "project-katalon", title: "Katalon test execution and reporting", project_type: "other", summary: "Test automation and reporting workflows covering web and mobile app testing.", frontend: "Web and mobile test flows", backend: "Katalon Studio · TestLink", technologies: ["Katalon Studio", "TestLink", "Test automation"], demo_url: "https://youtu.be/WQMt6xD8cLE", repo_url: "", figma_url: "", image_urls: [], sort_order: 8 },
  ],
};
