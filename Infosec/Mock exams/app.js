const exams = [
  {
    id: 1,
    title: "Mock Exam 01 — Foundations + Incident Thinking",
    difficulty: "Balanced",
    focus: "Core understanding",
    description:
      "Good first pass. Emphasizes cryptography mechanics, access-control reasoning, and distributed systems analysis using breach-style prompts.",
    overview: [
      { title: "Part 1 — Cryptography (50 pts)", body: "One major problem covering ASCII mapping, basic substitution logic, step-by-step encryption/decryption, and short pseudocode reasoning." },
      { title: "Part 2 — Access Control (25 pts)", body: "One essay asking you to diagnose policy failures and propose a secure redesign using least privilege, separation of duties, and mitigation strategies." },
      { title: "Part 3 — Distributed Systems (25 pts)", body: "Two case-based questions focusing on SSRF, cloud/data breaches, replication, backups, consistency, and secure distributed design." }
    ],
    questions: [
      {
        section: "Part 1 — Cryptography",
        points: 50,
        title: "ASCII-driven Caesar variant with implementation logic",
        body: `<p>A message is prepared using uppercase ASCII characters only. The plaintext is <code>SECUREDATA</code>. A developer uses this custom encryption process:</p><ol><li>Convert each character to its ASCII value.</li><li>Add <code>+4</code> to characters in odd positions and <code>+1</code> to characters in even positions.</li><li>Convert the resulting ASCII values back to characters.</li></ol><h4>Tasks</h4><ul><li>Show the ASCII mapping of the original plaintext.</li><li>Show the encrypted output character by character.</li><li>Demonstrate the full decryption process.</li><li>Write pseudocode for both encryption and decryption.</li><li>Briefly explain one limitation of this scheme from a security perspective.</li></ul>`,
        answer: `<strong>Study angle:</strong> Start by building a 4-column table: position, plaintext char, ASCII, modified ASCII. In the explanation, mention that this is deterministic, low-entropy, and weak against frequency analysis or reverse engineering once the rule is known.`
      },
      {
        section: "Part 2 — Access Control",
        points: 25,
        title: "Case analysis: student information system privilege abuse",
        body: `<p>A university student information system gives department assistants broad access to student records. One assistant exports full grade histories, personal details, and discipline notes for students outside their department because the system only checks whether the user is “staff.”</p><h4>Tasks</h4><ul><li>Identify the core access-control failures.</li><li>Name at least three violated security principles.</li><li>Propose a mitigation strategy and a more secure access-control design.</li><li>Explain how auditing and monitoring should support the redesign.</li></ul>`,
        answer: `<strong>Study angle:</strong> Your essay should hit least privilege, need-to-know, role granularity, separation of duties, and accountability. A strong redesign usually combines RBAC with contextual restrictions such as department scope, data classification, and logging of exports.`
      },
      {
        section: "Part 3 — Distributed Systems",
        points: 12.5,
        title: "Case A: SSRF in a cloud document service",
        body: `<p>A cloud document preview service fetches user-supplied URLs to generate file previews. An attacker submits an internal metadata endpoint URL instead of a normal document link and obtains cloud credentials. The service then uses those credentials to enumerate internal storage buckets.</p><h4>Tasks</h4><ul><li>Explain what SSRF is and how it works in this case.</li><li>Describe why distributed/cloud environments make SSRF especially dangerous.</li><li>Give at least four mitigations.</li></ul>`,
        answer: `<strong>Study angle:</strong> Stress that SSRF abuses the server as a proxy to reach internal-only resources. In cloud systems, metadata services, service-to-service trust, and broad IAM permissions make the blast radius much larger.`
      },
      {
        section: "Part 3 — Distributed Systems",
        points: 12.5,
        title: "Case B: replication, consistency, and backup failure",
        body: `<p>An online ordering platform replicates inventory data across three regional nodes. During a network partition, two nodes accept conflicting stock updates. At the same time, the team discovers that backups only covered the primary database and not the regional caches or event logs.</p><h4>Tasks</h4><ul><li>Explain the consistency problem.</li><li>Discuss how concurrency and replication caused divergence.</li><li>Explain why incomplete backups worsen recovery.</li><li>Recommend a safer design for convergence and disaster recovery.</li></ul>`,
        answer: `<strong>Study angle:</strong> Mention eventual consistency, conflicting writes, missing coordination, and backup incompleteness. Good answers usually discuss versioning, quorum strategies, conflict resolution rules, event-log protection, and tested recovery procedures.`
      }
    ]
  },
  {
    id: 2,
    title: "Mock Exam 02 — More Applied and Design-Oriented",
    difficulty: "Intermediate",
    focus: "Architecture + mitigation",
    description: "This version pushes you harder on secure redesign, not just identifying problems.",
    overview: [
      { title: "Cryptography", body: "Focus on process tracing, ASCII transformations, and writing clear algorithmic pseudocode." },
      { title: "Access Control", body: "Essay pushes toward system redesign using stronger models like RBAC, ABAC, and auditing." },
      { title: "Distributed Systems", body: "Cases connect breaches to architecture choices, including metadata abuse, replication lag, and resilient backups." }
    ],
    questions: [
      { section: "Part 1 — Cryptography", points: 50, title: "Two-stage text transformation cipher", body: `<p>Given plaintext <code>INF0SEC</code>, a system performs:</p><ol><li>Convert characters to ASCII.</li><li>Reverse the full ASCII sequence order.</li><li>Add <code>+2</code> to each value.</li><li>Output the resulting characters.</li></ol><h4>Tasks</h4><ul><li>Show the original ASCII values.</li><li>Show the reversed sequence.</li><li>Compute the ciphertext.</li><li>Write decryption logic in pseudocode.</li><li>State whether obscurity alone makes this secure and explain why.</li></ul>`, answer: `<strong>Study angle:</strong> Always reverse the operation order when decrypting. In the final explanation, point out that custom reversible transformations without strong keys do not provide modern cryptographic security.` },
      { section: "Part 2 — Access Control", points: 25, title: "Case analysis: hospital portal overexposure", body: `<p>A hospital web portal allows doctors, nurses, billing staff, and contractors to log in. Due to rapid deployment, everyone with an authenticated session can query patient treatment plans, insurance details, and internal case notes through a shared API. Contractors should only see maintenance tickets.</p><h4>Tasks</h4><ul><li>Analyze the access-control problem.</li><li>Recommend a secure model for permissions.</li><li>Describe how to prevent horizontal and vertical privilege abuse.</li><li>Suggest monitoring, review, and emergency-access controls.</li></ul>`, answer: `<strong>Study angle:</strong> This is a strong RBAC/ABAC essay. Tie your answer to least privilege, contextual authorization, API-level enforcement, sensitive-data segmentation, and break-glass access with auditing.` },
      { section: "Part 3 — Distributed Systems", points: 12.5, title: "Case A: breach chain from SSRF to secret exposure", body: `<p>A media processing microservice accepts external image URLs. Attackers use SSRF to target internal admin endpoints, then pivot into a service that stores API keys used by other microservices. The company later discovers that internal service authentication trusted any request from the private network.</p><h4>Tasks</h4><ul><li>Trace the attack chain clearly.</li><li>Explain why “internal network = trusted” is unsafe in distributed systems.</li><li>Give architectural mitigations.</li></ul>`, answer: `<strong>Study angle:</strong> Connect SSRF with implicit trust failures. Strong answers mention service identity, zero trust between services, metadata protection, egress filtering, and narrow token scopes.` },
      { section: "Part 3 — Distributed Systems", points: 12.5, title: "Case B: stale replicas and broken failover", body: `<p>A fintech app maintains a write-primary database and two read replicas. During failover, one stale replica is promoted. Users then see missing transactions, and later reconciliation shows conflicting balances. Backup snapshots were taken nightly, but point-in-time logs were not retained.</p><h4>Tasks</h4><ul><li>Explain the risks of stale replication.</li><li>Discuss convergence and reconciliation issues.</li><li>Explain why backup frequency and log retention matter.</li><li>Recommend safer failover and backup practices.</li></ul>`, answer: `<strong>Study angle:</strong> You want to talk about replication lag, RPO/RTO, point-in-time recovery, validation before failover, and consistency checks after recovery.` }
    ]
  },
  {
    id: 3,
    title: "Mock Exam 03 — Essay-Heavy and Analytical",
    difficulty: "Challenging",
    focus: "Long-form reasoning",
    description: "Closer to a professor who rewards depth, structure, and clean case analysis.",
    overview: [
      { title: "Cryptography", body: "Emphasis on showing complete process logic and explaining weaknesses of naive ciphers." },
      { title: "Access Control", body: "Essay asks for principle-based diagnosis plus practical redesign." },
      { title: "Distributed Systems", body: "More emphasis on security implications of architecture choices and real-world failures." }
    ],
    questions: [
      { section: "Part 1 — Cryptography", points: 50, title: "ASCII block grouping and reversible transformation", body: `<p>Plaintext: <code>TRUSTBUTVERIFY</code>. Split the text into 3-character blocks. For each block:</p><ol><li>Map characters to ASCII.</li><li>Add block index (<code>1</code> for first block, <code>2</code> for second, etc.) to every ASCII value in that block.</li><li>Swap the first and third values inside each block before converting back.</li></ol><h4>Tasks</h4><ul><li>Encrypt the full message step by step.</li><li>Show how to decrypt it correctly.</li><li>Write clear pseudocode for both operations.</li><li>Identify at least two reasons this is not strong cryptography.</li></ul>`, answer: `<strong>Study angle:</strong> Focus on procedural clarity. For weaknesses, mention predictability, no strong secret key, and low resistance to known-plaintext or pattern-based attacks.` },
      { section: "Part 2 — Access Control", points: 25, title: "Case analysis: startup admin panel crisis", body: `<p>A startup merged engineering and support tools into one admin panel. Support staff can reset passwords, read audit logs, and modify customer subscription tiers. Engineers can impersonate customers for debugging without approval. No formal review exists for privileged role assignment.</p><h4>Tasks</h4><ul><li>Analyze the security and governance failures.</li><li>Explain which access-control principles were ignored.</li><li>Propose a secure redesign for privileges, approvals, and monitoring.</li><li>Explain how to reduce insider abuse and accidental misuse.</li></ul>`, answer: `<strong>Study angle:</strong> This invites separation of duties, just-in-time access, approval workflows, scoped impersonation, logging, and periodic access review.` },
      { section: "Part 3 — Distributed Systems", points: 12.5, title: "Case A: cloud metadata abuse in a distributed app", body: `<p>A distributed analytics platform lets users import datasets by URL. Attackers exploit SSRF to query the instance metadata service and steal temporary credentials. They then access object storage containing log shards from multiple microservices.</p><h4>Tasks</h4><ul><li>Explain the SSRF path and why metadata services are high-risk.</li><li>Describe the impact in a distributed logging architecture.</li><li>Recommend technical and architectural safeguards.</li></ul>`, answer: `<strong>Study angle:</strong> Mention that temporary credentials can still be highly damaging if over-scoped. Tie the answer to IAM least privilege, metadata protection, network rules, allowlists, and service isolation.` },
      { section: "Part 3 — Distributed Systems", points: 12.5, title: "Case B: eventual consistency and backup blind spots", body: `<p>A collaborative note-taking app replicates updates asynchronously across regions. After a regional outage, some users lose their latest edits while others see duplicate or out-of-order updates. Management argues backups are fine because the main database was backed up every night, but the synchronization queue and object store snapshots were not.</p><h4>Tasks</h4><ul><li>Explain the data consistency issues.</li><li>Explain how asynchronous replication contributed to the failure.</li><li>Analyze why the backup argument is incomplete.</li><li>Recommend a recovery-aware distributed design.</li></ul>`, answer: `<strong>Study angle:</strong> The strongest answers mention queues, logs, object stores, metadata, and dependent state. Backups must cover the full distributed system, not just the core relational database.` }
    ]
  },
  {
    id: 4,
    title: "Mock Exam 04 — Breach-Inspired Distributed Systems",
    difficulty: "Challenging",
    focus: "Real-world breach linkage",
    description: "This one leans harder into incident-style material, especially SSRF, cloud control failures, and supply-chain/runtime boundaries.",
    overview: [
      { title: "Cryptography", body: "Classic process problem to preserve exam balance." },
      { title: "Access Control", body: "Essay built around excessive privilege and policy breakdown." },
      { title: "Distributed Systems", body: "Cases borrow patterns from Capital One, Codecov, and runtime/supply-chain failures." }
    ],
    questions: [
      { section: "Part 1 — Cryptography", points: 50, title: "Shift-and-mask exam problem", body: `<p>Plaintext: <code>ASSURANCE</code>. For each character:</p><ol><li>Convert to ASCII.</li><li>Add <code>+3</code>.</li><li>If the resulting position is divisible by 3, subtract <code>1</code>.</li><li>Convert back to characters.</li></ol><h4>Tasks</h4><ul><li>Show the full encryption table.</li><li>Decrypt the output correctly.</li><li>Write pseudocode.</li><li>Explain why a deterministic rule-based cipher is weak.</li></ul>`, answer: `<strong>Study angle:</strong> Keep your table clean and position-aware. In the weakness section, connect deterministic transforms to poor secrecy and easy reversal once the rule leaks.` },
      { section: "Part 2 — Access Control", points: 25, title: "Case analysis: CI/CD and internal secrets access", body: `<p>A software company stores deployment secrets in CI variables accessible to multiple pipeline jobs. Temporary contractors can trigger some jobs, and several jobs can call internal scripts that reveal environment variables in debug mode. A recent third-party tool compromise raises concern that tokens may have been exposed.</p><h4>Tasks</h4><ul><li>Analyze the access-control and governance problems.</li><li>Explain how least privilege applies to pipelines and secrets.</li><li>Recommend a mitigation and secure redesign plan.</li></ul>`, answer: `<strong>Study angle:</strong> This is where you connect access control to supply-chain security. Talk about scoped secrets, job isolation, secret redaction, approvals, environment separation, and rotation after compromise.` },
      { section: "Part 3 — Distributed Systems", points: 12.5, title: "Case A: SSRF + overprivileged cloud role", body: `<p>A cloud-hosted web application uses a fetch service to pull remote resources for users. Attackers abuse SSRF to reach internal metadata, obtain temporary credentials, and enumerate object storage. Those permissions are broader than necessary, exposing logs, backups, and customer exports.</p><h4>Tasks</h4><ul><li>Explain how SSRF leads to cloud credential theft.</li><li>Explain why overprivileged roles magnify impact.</li><li>Recommend safeguards at application, network, and IAM layers.</li></ul>`, answer: `<strong>Study angle:</strong> This is the most exam-direct distributed-systems case for your guide. Mention metadata protection, output filtering, URL allowlists, private endpoint restrictions, and least-privilege IAM roles.` },
      { section: "Part 3 — Distributed Systems", points: 12.5, title: "Case B: what the backup missed in a distributed platform", body: `<p>Following a compromise, a company restores its primary database from backup but later discovers that message brokers, artifact storage, CI logs, and edge caches were not part of the recovery plan. The restored system comes back inconsistent and leaks previously revoked content.</p><h4>Tasks</h4><ul><li>Explain why distributed backups must cover more than one database.</li><li>Describe the consistency and integrity risks after partial restoration.</li><li>Recommend a more complete backup and recovery strategy.</li></ul>`, answer: `<strong>Study angle:</strong> Think system-wide state. A good answer covers coordinated backups, dependency mapping, log retention, artifact versioning, cache invalidation, and restoration testing.` }
    ]
  },
  {
    id: 5,
    title: "Mock Exam 05 — Final Stretch / Hard Mode",
    difficulty: "Hard",
    focus: "Exam-pressure simulation",
    description: "Most demanding version. Best used after you’ve already gone through the other four.",
    overview: [
      { title: "Cryptography", body: "Longer transform chain requiring careful reversal and pseudocode precision." },
      { title: "Access Control", body: "Essay expects principle-based analysis plus realistic enterprise controls." },
      { title: "Distributed Systems", body: "Cases combine SSRF, cloud trust boundaries, convergence, concurrency, and recovery design." }
    ],
    questions: [
      { section: "Part 1 — Cryptography", points: 50, title: "Multi-rule encryption and decryption logic", body: `<p>Encrypt <code>CONFIDENTIAL</code> using the following scheme:</p><ol><li>Convert all characters to ASCII.</li><li>Add <code>+5</code> to vowels and <code>+2</code> to consonants.</li><li>Reverse every 4-character group of resulting ASCII values.</li><li>Convert back to characters.</li></ol><h4>Tasks</h4><ul><li>Show full encryption work.</li><li>Show full decryption work.</li><li>Write encryption and decryption pseudocode.</li><li>State at least two design flaws from a cryptographic standpoint.</li></ul>`, answer: `<strong>Study angle:</strong> Your decryption must reverse the group reversal first, then undo the character-specific shift. Weaknesses include deterministic behavior, shallow keying, and predictability.` },
      { section: "Part 2 — Access Control", points: 25, title: "Case analysis: enterprise platform with mixed human and service identities", body: `<p>An enterprise SaaS platform has human admins, support engineers, automated service accounts, and partner integrations. Over time, exceptions were added informally: some support engineers inherited admin APIs, service accounts gained broad tenant-read permissions, and partners reused shared tokens. A breach review shows the company cannot clearly state who should access what.</p><h4>Tasks</h4><ul><li>Analyze the access-control failures.</li><li>Explain why identity sprawl increases risk.</li><li>Recommend a secure access model for humans, services, and partners.</li><li>Include review, logging, and key/token management in your answer.</li></ul>`, answer: `<strong>Study angle:</strong> Great answer structure: problem diagnosis -> violated principles -> redesign by identity type -> operational safeguards. Be explicit about least privilege, token rotation, service identity, and partner isolation.` },
      { section: "Part 3 — Distributed Systems", points: 12.5, title: "Case A: distributed trust boundary collapse after SSRF", body: `<p>A recommendation engine in a microservices environment can fetch external profile images for analysis. Attackers exploit SSRF to reach internal configuration services, extract temporary credentials, and then invoke other internal APIs because those APIs trust requests carrying valid internal tokens without checking caller identity deeply.</p><h4>Tasks</h4><ul><li>Trace the attack path.</li><li>Explain the distributed security design failures.</li><li>Recommend mitigations for SSRF, service identity, and internal authorization.</li></ul>`, answer: `<strong>Study angle:</strong> Focus on broken trust boundaries. Internal tokens are not enough if services do not validate source identity, scope, and authorization context.` },
      { section: "Part 3 — Distributed Systems", points: 12.5, title: "Case B: convergence and disaster recovery under concurrent writes", body: `<p>A globally distributed collaboration platform allows concurrent edits in multiple regions. During a cross-region outage, clients continue writing locally. Once connectivity returns, the merge logic duplicates some operations, drops others, and restores from a backup that predates a subset of region-local writes.</p><h4>Tasks</h4><ul><li>Explain the convergence issue.</li><li>Discuss the role of concurrency and conflict resolution.</li><li>Explain how backup age affects recovery correctness.</li><li>Recommend better design choices for distributed consistency and backup strategy.</li></ul>`, answer: `<strong>Study angle:</strong> Use terms like eventual consistency, conflict resolution, idempotency, version vectors or timestamps, RPO, and coordinated recovery. Show that recovery correctness matters as much as raw availability.` }
    ]
  }
];

const STORAGE_KEY = "it323-midterm-mock-state-v1";
const timerValue = document.getElementById("timerValue");
const progressValue = document.getElementById("progressValue");
const saveChip = document.getElementById("saveChip");
const examNav = document.getElementById("examNav");
const heroTitle = document.getElementById("heroTitle");
const heroDescription = document.getElementById("heroDescription");
const difficultyChip = document.getElementById("difficultyChip");
const focusChip = document.getElementById("focusChip");
const overviewContainer = document.getElementById("examOverview");
const questionsContainer = document.getElementById("questionsContainer");
const template = document.getElementById("questionTemplate");
const toggleTimerBtn = document.getElementById("toggleTimerBtn");
const resetExamBtn = document.getElementById("resetExamBtn");
const exportBtn = document.getElementById("exportBtn");
const printBtn = document.getElementById("printBtn");

let appState = loadState();
let timerHandle = null;

function createDefaultState() {
  const examAnswers = {};
  exams.forEach((exam) => {
    examAnswers[exam.id] = { answers: {}, updatedAt: null };
  });
  return {
    currentExamId: 1,
    timerSeconds: 0,
    timerRunning: true,
    examAnswers,
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed = JSON.parse(raw);
    const base = createDefaultState();
    return {
      ...base,
      ...parsed,
      examAnswers: { ...base.examAnswers, ...(parsed.examAnswers || {}) },
    };
  } catch {
    return createDefaultState();
  }
}

function saveState(message = "Autosave: Saved") {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  saveChip.textContent = message;
  clearTimeout(saveState._t);
  saveState._t = setTimeout(() => {
    saveChip.textContent = "Autosave: Ready";
  }, 1200);
}

function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const secs = (totalSeconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function startTimer() {
  if (timerHandle) clearInterval(timerHandle);
  timerHandle = setInterval(() => {
    if (!appState.timerRunning) return;
    appState.timerSeconds += 1;
    timerValue.textContent = formatTime(appState.timerSeconds);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  }, 1000);
}

function setTimerUI() {
  timerValue.textContent = formatTime(appState.timerSeconds);
  toggleTimerBtn.textContent = appState.timerRunning ? "Pause Timer" : "Resume Timer";
}

function getCurrentExam() {
  return exams.find((exam) => exam.id === appState.currentExamId) || exams[0];
}

function currentAnswers() {
  return appState.examAnswers[appState.currentExamId]?.answers || {};
}

function answeredCount(examId = appState.currentExamId) {
  const answers = appState.examAnswers[examId]?.answers || {};
  return Object.values(answers).filter((value) => value && value.trim().length > 0).length;
}

function renderNav() {
  examNav.innerHTML = exams
    .map((exam) => {
      const done = answeredCount(exam.id);
      return `
        <button class="exam-button ${exam.id === appState.currentExamId ? "active" : ""}" data-id="${exam.id}">
          <strong>${exam.title}</strong>
          <small>${exam.difficulty} · ${done}/${exam.questions.length} answered</small>
        </button>`;
    })
    .join("");

  examNav.querySelectorAll(".exam-button").forEach((button) => {
    button.addEventListener("click", () => {
      appState.currentExamId = Number(button.dataset.id);
      saveState("Autosave: Exam switched");
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function renderOverview(exam) {
  heroTitle.textContent = exam.title;
  heroDescription.textContent = exam.description;
  difficultyChip.textContent = `Difficulty: ${exam.difficulty}`;
  focusChip.textContent = `Focus: ${exam.focus}`;
  progressValue.textContent = `${answeredCount()}/${exam.questions.length}`;

  overviewContainer.innerHTML = exam.overview
    .map((item) => `
      <article class="overview-card">
        <h3>${item.title}</h3>
        <p>${item.body}</p>
      </article>`)
    .join("");
}

function renderQuestions(exam) {
  const answers = currentAnswers();
  questionsContainer.innerHTML = "";

  exam.questions.forEach((question, index) => {
    const clone = template.content.cloneNode(true);
    clone.querySelector(".question-tag").textContent = question.section;
    clone.querySelector(".question-title").textContent = question.title;
    clone.querySelector(".question-points").textContent = `${question.points} pts`;
    clone.querySelector(".question-body").innerHTML = `${question.body}<div class="answer-box">${question.answer}</div>`;

    const textarea = clone.querySelector(".answer-input");
    const label = clone.querySelector(".answer-label");
    const saveStateEl = clone.querySelector(".save-state");
    const key = `q${index + 1}`;
    const id = `exam-${exam.id}-q-${index + 1}`;

    label.setAttribute("for", id);
    textarea.id = id;
    textarea.value = answers[key] || "";
    setQuestionFooter(saveStateEl, textarea.value);

    textarea.addEventListener("input", (event) => {
      const value = event.target.value;
      appState.examAnswers[exam.id].answers[key] = value;
      appState.examAnswers[exam.id].updatedAt = new Date().toISOString();
      setQuestionFooter(saveStateEl, value);
      progressValue.textContent = `${answeredCount()}/${exam.questions.length}`;
      renderNav();
      saveState("Autosave: Answer saved");
    });

    questionsContainer.appendChild(clone);
  });
}

function setQuestionFooter(el, value) {
  const trimmed = value.trim();
  if (!trimmed) {
    el.textContent = "Not answered yet";
    el.className = "save-state empty";
    return;
  }
  const words = trimmed.split(/\s+/).filter(Boolean).length;
  el.textContent = `${words} words saved locally`;
  el.className = "save-state done";
}

function render() {
  const exam = getCurrentExam();
  renderNav();
  renderOverview(exam);
  renderQuestions(exam);
  setTimerUI();
}

function resetCurrentExam() {
  const exam = getCurrentExam();
  appState.examAnswers[exam.id] = { answers: {}, updatedAt: new Date().toISOString() };
  saveState("Autosave: Current exam reset");
  render();
}

function exportCurrentExam() {
  const exam = getCurrentExam();
  const answers = appState.examAnswers[exam.id].answers || {};
  let output = `${exam.title}\n${"=".repeat(exam.title.length)}\n\n`;
  output += `Difficulty: ${exam.difficulty}\nFocus: ${exam.focus}\nElapsed time: ${formatTime(appState.timerSeconds)}\n\n`;

  exam.questions.forEach((question, index) => {
    const key = `q${index + 1}`;
    output += `${question.section} — ${question.title}\n`;
    output += `${"-".repeat((question.section + question.title).length + 3)}\n`;
    output += `Points: ${question.points}\n\n`;
    output += `Prompt summary: ${stripHtml(question.body).replace(/\s+/g, " ").trim()}\n\n`;
    output += `Your answer:\n${(answers[key] || "[No answer written]").trim() || "[No answer written]"}\n\n`;
  });

  const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${exam.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-answers.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

function stripHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

toggleTimerBtn.addEventListener("click", () => {
  appState.timerRunning = !appState.timerRunning;
  saveState(appState.timerRunning ? "Autosave: Timer resumed" : "Autosave: Timer paused");
  setTimerUI();
});

resetExamBtn.addEventListener("click", () => {
  if (confirm("Reset answers for the current mock exam? This only clears this exam.")) {
    resetCurrentExam();
  }
});

exportBtn.addEventListener("click", exportCurrentExam);
printBtn.addEventListener("click", () => window.print());

startTimer();
render();
