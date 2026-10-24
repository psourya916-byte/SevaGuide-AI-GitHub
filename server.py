"""SevaGuide AI demo server: static frontend plus retrieval-based service guidance."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import os
import re
from difflib import SequenceMatcher
from urllib.parse import parse_qs, urlencode, urlparse

ROOT = Path(__file__).resolve().parent
PORT = int(os.environ.get("PORT", "8000"))
SERVICES = [
    {"id": 1, "name": "Scholarship programmes", "category": "Education", "icon": "🎓", "description": "Explore scholarships and financial support for students. Check the official scheme rules for current eligibility and deadlines.", "keywords": ["student", "scholarship", "college", "education", "fees", "tuition", "school", "study"], "eligibility": "Eligibility varies by scholarship and may depend on education level, household income, academic performance and other scheme conditions.", "documents": ["Identity proof, if required", "Educational records", "Income certificate, if required", "Bank account details, if required"], "steps": ["Browse available scholarships.", "Review the official eligibility rules and dates.", "Prepare the documents listed by the scheme.", "Apply through the official portal and save your acknowledgement."], "officialUrl": "https://scholarships.gov.in/"},
    {"id": 2, "name": "Old age pension and social assistance", "category": "Social Welfare", "icon": "👴", "description": "Find government pension and social assistance information for older adults.", "keywords": ["senior", "elderly", "old age", "pension", "retired", "senior citizen", "monthly assistance", "welfare"], "eligibility": "Age, income, residence and pension conditions depend on the central or state programme.", "documents": ["Age or identity proof", "Residence proof", "Income-related evidence, if required", "Bank account details"], "steps": ["Check the central and state pension options.", "Confirm eligibility with the relevant authority.", "Find the application route for your location.", "Submit the documents required by that programme."], "officialUrl": "https://nsap.nic.in/"},
    {"id": 3, "name": "Income certificate", "category": "Citizen Services", "icon": "📄", "description": "Find how to request an income certificate from the relevant state or local authority.", "keywords": ["income", "certificate", "salary proof", "family income", "income proof", "revenue department"], "eligibility": "The issuing authority, application conditions and acceptable evidence depend on your state or jurisdiction.", "documents": ["Identity proof", "Residence proof", "Income evidence specified by the authority", "Application form, if required"], "steps": ["Select your state or jurisdiction.", "Open the official state service portal.", "Review evidence and fee requirements.", "Submit the application and follow official status instructions."], "officialUrl": "https://serviceonline.gov.in/"},
    {"id": 4, "name": "Agricultural assistance", "category": "Agriculture", "icon": "🌾", "description": "Explore farmer support programmes and agricultural services.", "keywords": ["farmer", "farming", "agriculture", "agricultural", "crop", "subsidy", "farm", "irrigation", "fertilizer", "pm kisan"], "eligibility": "Requirements vary and may depend on the programme, land or cultivation records and location.", "documents": ["Identity proof", "Land or cultivation records, if required", "Bank account details", "Other scheme-specific evidence"], "steps": ["Identify the programme that fits your need.", "Check the official rules and state-specific guidance.", "Prepare the listed supporting records.", "Apply through the designated official channel."], "officialUrl": "https://pmkisan.gov.in/"},
    {"id": 5, "name": "Employment and skill development", "category": "Employment", "icon": "💼", "description": "Find employment services, job search support and skill development opportunities.", "keywords": ["job", "employment", "unemployed", "career", "skill", "training", "work", "job seeker", "vocational"], "eligibility": "Eligibility depends on the selected programme, including any age, qualification or residence requirements.", "documents": ["Identity proof", "Educational certificates, if required", "Resume or employment details", "Residence proof, if required"], "steps": ["Browse employment and training services.", "Review programme requirements.", "Create a profile or prepare requested documents.", "Follow the official registration instructions."], "officialUrl": "https://www.ncs.gov.in/"},
    {"id": 6, "name": "Public healthcare and health coverage", "category": "Healthcare", "icon": "🏥", "description": "Explore public healthcare programmes and health coverage information.", "keywords": ["health", "healthcare", "hospital", "medical", "treatment", "health insurance", "health scheme", "doctor", "medicine", "ayushman"], "eligibility": "Programme access and eligibility depend on the service and official rules. For urgent medical needs, contact local emergency services or a health facility.", "documents": ["Identity proof, if required", "Beneficiary or health records, if required", "Residence or eligibility evidence", "Other programme-specific documents"], "steps": ["Identify the programme or healthcare service.", "Check its official eligibility and coverage details.", "Locate an approved facility or service channel.", "Follow the programme's official instructions."], "officialUrl": "https://pmjay.gov.in/"},
    {"id": 7, "name": "Voter registration, voter ID and electoral roll", "category": "Voting & Elections", "icon": "🗳️", "description": "Find official services to register as a voter, check your name in the electoral roll, update voter details, download e-EPIC, and track an application.", "keywords": ["voter", "voters", "voting", "vote", "voter id", "voter card", "elector", "electoral", "electoral roll", "voter list", "register to vote", "new voter", "voter registration", "epic", "e epic", "epic card", "polling booth", "polling station", "election card", "apply for voter id", "new voter id", "voter correction", "change address voter", "voter status", "election commission", "eci"], "eligibility": "For general voter registration, the Election Commission says applicants must be Indian citizens, at least 18 on a qualifying date, ordinarily resident in the relevant constituency and not disqualified. Confirm current requirements on the ECI portal.", "documents": ["Recent photograph", "Age proof, such as a birth certificate or other document accepted by ECI", "Address proof accepted by ECI", "Any additional documents requested in the official form"], "steps": ["For a new general voter registration, open the ECI Voters’ Services Portal and choose Form 6.", "For an overseas elector, use Form 6A.", "For correction, replacement EPIC or shifting residence, use Form 8.", "To check your name or polling details, use the electoral roll search.", "Track the application through the official portal."], "officialUrl": "https://voters.eci.gov.in/", "officialSources": [ {"title": "ECI Voters’ Services Portal and forms", "url": "https://voters.eci.gov.in/home/forms"}, {"title": "Search the electoral roll", "url": "https://electoralsearch.eci.gov.in/"}, {"title": "ECI voter registration guidance", "url": "https://www.eci.gov.in/faq/en/how-to-register/"}]},
    {"id": 8, "name": "Passport application and renewal", "category": "Travel & Identity", "icon": "🛂", "description": "Start or renew an Indian passport application through the Ministry of External Affairs’ Passport Seva portal.", "keywords": ["passport", "passport application", "apply passport", "new passport", "renew passport", "passport renewal", "reissue passport", "tatkaal passport", "travel document", "passport appointment"], "eligibility": "Passport application requirements depend on the applicant and service. Review the official Passport Seva guidance for your case.", "documents": ["Proof of address and date of birth as specified by Passport Seva", "Existing passport for re-issue, if applicable", "Additional documents listed in the official document advisor"], "steps": ["Create an account on Passport Seva.", "Choose fresh passport or re-issue and complete the application.", "Pay the applicable fee and schedule an appointment.", "Attend the appointment with the required original documents."], "officialUrl": "https://www.passportindia.gov.in/", "officialSources": [{"title": "Passport Seva — Government of India", "url": "https://www.passportindia.gov.in/"}, {"title": "Passport application process", "url": "https://www.passportindia.gov.in/psp/Apply"}]},
    {"id": 9, "name": "Aadhaar services", "category": "Identity Services", "icon": "🪪", "description": "Find official Aadhaar services for download, update requests, status checks and related help.", "keywords": ["aadhaar", "aadhar", "uidai", "aadhaar card", "aadhar card", "aadhaar update", "update aadhaar", "aadhaar address", "aadhaar download", "aadhaar status", "biometric update", "lost aadhaar"], "eligibility": "Available services and update requirements depend on the request. Follow UIDAI instructions and use only its official portal.", "documents": ["Aadhaar number or enrolment ID, as applicable", "Supporting documents specified by UIDAI for the requested update"], "steps": ["Open the UIDAI MyAadhaar or official UIDAI website.", "Choose the service you need.", "Follow the identity verification and document instructions shown by UIDAI.", "Use the official status check to follow a request."], "officialUrl": "https://myaadhaar.uidai.gov.in/", "officialSources": [{"title": "UIDAI official website", "url": "https://uidai.gov.in/en/"}, {"title": "MyAadhaar portal", "url": "https://myaadhaar.uidai.gov.in/"}]},
    {"id": 10, "name": "Driving licence and learner licence", "category": "Transport", "icon": "🚘", "description": "Find services for learner licences, new driving licences, renewals, replacements and application tracking.", "keywords": ["driving licence", "driving license", "learner licence", "learner license", "dl", "ll", "licence renewal", "license renewal", "renew driving licence", "new driving license", "parivahan", "sarathi", "duplicate licence", "driving test"], "eligibility": "Age, documents, fees and process vary by licence category and state. Select your state on the official Parivahan/Sarathi portal.", "documents": ["Age and address proof accepted for the chosen service", "Learner licence or existing driving licence, if applicable", "Medical or other documents if required for your category"], "steps": ["Open the official Parivahan/Sarathi service.", "Select your state and the licence service.", "Complete the application and follow document and fee instructions.", "Book a test or appointment when required and track the application."], "officialUrl": "https://sarathi.parivahan.gov.in/", "officialSources": [{"title": "Sarathi driving licence services", "url": "https://sarathi.parivahan.gov.in/"}, {"title": "Parivahan — Ministry of Road Transport and Highways", "url": "https://parivahan.gov.in/"}]},
]

STOP_WORDS = {"a", "an", "and", "for", "from", "get", "give", "help", "i", "in", "me", "my", "of", "please", "the", "to", "want", "with", "how", "where", "can", "could", "need", "do", "find", "looking"}

QUERY_SUGGESTIONS = {
    1: [("Find scholarships for students", "student scholarship"), ("Check scholarship eligibility", "scholarship eligibility")],
    2: [("Find old-age pension support", "old age pension"), ("Check senior citizen benefits", "senior citizen benefits")],
    3: [("Apply for an income certificate", "income certificate"), ("Find certificate services for my state", "income certificate state service")],
    4: [("Find farmer support schemes", "farmer government assistance"), ("Check PM-KISAN services", "PM-KISAN registration status")],
    5: [("Search for jobs", "government jobs employment"), ("Find skill training", "skill training programme")],
    6: [("Find government health coverage", "government health coverage"), ("Check Ayushman Bharat services", "Ayushman Bharat health service")],
    7: [("New voter registration — Form 6", "new voter registration Form 6"), ("Check my name in the voter list", "search name in electoral roll"), ("Correct voter ID or change address", "voter ID correction change address"), ("Find my polling station", "find polling station")],
    8: [("Apply for a new passport", "new passport application"), ("Renew or re-issue a passport", "passport renewal reissue")],
    9: [("Update Aadhaar details", "update Aadhaar details"), ("Download Aadhaar or check update status", "download Aadhaar check status")],
    10: [("Apply for a learner licence", "learner driving licence"), ("Apply for or renew a driving licence", "apply renew driving licence")],
}

GENERIC_PREFIXES = {"ap", "app", "appl", "apply", "applying", "new", "check", "find", "service", "services", "government", "govt", "card", "id"}

def normalize_token(token):
    """Small English normalization for common citizen wording and inflections."""
    token = token.lower()
    if token.endswith("ies") and len(token) > 5:
        return token[:-3] + "y"
    for suffix in ("ing", "ed", "es", "s"):
        if token.endswith(suffix) and len(token) > len(suffix) + 3:
            base = token[:-len(suffix)]
            if base.endswith(base[-1:] * 2):
                base = base[:-1]
            return base
    return token

def score_services(query):
    text = re.sub(r"[^\w\s]", " ", query.lower(), flags=re.UNICODE)
    raw_words = [word for word in text.split() if word not in STOP_WORDS]
    words = {normalize_token(word) for word in raw_words}
    ranked = []
    for service in SERVICES:
        score = 0
        weak_overlaps = set()
        for keyword in service["keywords"]:
            phrase = re.sub(r"[^\w\s]", " ", keyword.lower(), flags=re.UNICODE).strip()
            phrase_tokens = [normalize_token(part) for part in phrase.split()]
            if phrase and phrase in text:
                score += 7 if " " in phrase else 4
            elif set(phrase_tokens) & words:
                weak_overlaps.update(set(phrase_tokens) & words)
        score += min(len(weak_overlaps), 2)
        # Permit one-character typos in meaningful words (for example, "votter").
        key_tokens = {normalize_token(part) for keyword in service["keywords"] for part in keyword.lower().split() if len(part) >= 5}
        for word in words:
            if len(word) >= 5 and not (word in key_tokens):
                if any(SequenceMatcher(None, word, key).ratio() >= 0.82 for key in key_tokens):
                    score += 3
        name_tokens = {normalize_token(part) for part in service["name"].lower().split()}
        if name_tokens & words:
            score += 2 * len(name_tokens & words)
        # A lone overlap with a generic verb such as "apply" is not enough to
        # recommend a service; require at least one meaningful topic signal.
        if score >= 4:
            ranked.append((score, service))
    return [row[1] for row in sorted(ranked, key=lambda row: row[0], reverse=True)[:4]]

def service_payload(service):
    """Return a service with links to its responsible department or programme."""
    result = dict(service)
    source_map = {
        1: ("https://scholarships.gov.in/Students", [
            ("National Scholarship Portal — Students", "https://scholarships.gov.in/Students"),
            ("Scholarship schemes on NSP", "https://scholarships.gov.in/All-Scholarships"),
        ]),
        2: ("https://www.pib.gov.in/PressReleasePage.aspx?PRID=2323266&lang=1&reg=3", [
            ("Ministry of Rural Development", "https://rural.gov.in/en/"),
            ("Pension programme update — Press Information Bureau", "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2323266&lang=1&reg=3"),
        ]),
        3: ("https://serviceonline.gov.in/", [
            ("ServicePlus — state and local services", "https://serviceonline.gov.in/"),
        ]),
        4: ("https://pmkisan.gov.in/", [
            ("PM-KISAN — Department of Agriculture and Farmers Welfare", "https://pmkisan.gov.in/"),
            ("New farmer registration", "https://pmkisan.gov.in/RegistrationFormNew.aspx"),
        ]),
        5: ("https://www.ncs.gov.in/", [
            ("National Career Service — Ministry of Labour and Employment", "https://www.ncs.gov.in/"),
        ]),
        6: ("https://beneficiary.nha.gov.in/", [
            ("PM-JAY beneficiary portal — National Health Authority", "https://beneficiary.nha.gov.in/"),
            ("National Health Authority", "https://nha.gov.in/"),
        ]),
        7: ("https://voters.eci.gov.in/home/forms", [
            ("ECI Voters’ Services Portal and forms", "https://voters.eci.gov.in/home/forms"),
            ("Search the electoral roll", "https://electoralsearch.eci.gov.in/"),
            ("ECI voter registration guidance", "https://www.eci.gov.in/faq/en/how-to-register/"),
        ]),
        8: ("https://www.passportindia.gov.in/psp/Apply", [
            ("Passport Seva — Ministry of External Affairs", "https://www.passportindia.gov.in/"),
            ("Passport application process", "https://www.passportindia.gov.in/psp/Apply"),
        ]),
        9: ("https://myaadhaar.uidai.gov.in/", [
            ("MyAadhaar online services", "https://myaadhaar.uidai.gov.in/"),
            ("UIDAI — Aadhaar services and guidance", "https://uidai.gov.in/en/my-aadhaar"),
        ]),
        10: ("https://sarathi.parivahan.gov.in/", [
            ("Sarathi driving licence services", "https://sarathi.parivahan.gov.in/"),
            ("Parivahan — Ministry of Road Transport and Highways", "https://parivahan.gov.in/"),
        ]),
    }
    url, sources = source_map.get(service["id"], (service["officialUrl"], service.get("officialSources", [])))
    result["officialUrl"] = url
    result["officialSources"] = [{"title": title, "url": source_url} for title, source_url in sources]
    return result

def suggest_services(query):
    text = re.sub(r"[^\w\s]", " ", query.lower(), flags=re.UNICODE)
    parts = [normalize_token(word) for word in text.split() if word not in STOP_WORDS]
    if not parts or len(parts[-1]) < 2 or parts[-1] in GENERIC_PREFIXES:
        return []
    last = parts[-1]
    full_scores = {service["id"]: i for i, service in enumerate(score_services(query))}
    ranked = []
    for service in SERVICES:
        tokens = {normalize_token(part) for keyword in service["keywords"] for part in keyword.lower().split()}
        prefix_score = max((3 if token == last else 2 if token.startswith(last) else 1 if len(last) >= 4 and SequenceMatcher(None, last, token).ratio() >= .82 else 0 for token in tokens), default=0)
        if not prefix_score:
            continue
        score = prefix_score + (5 if service["id"] in full_scores else 0)
        ranked.append((score, service))
    ranked.sort(key=lambda row: row[0], reverse=True)
    suggestions = []
    seen = set()
    for _, service in ranked[:3]:
        for label, search_query in QUERY_SUGGESTIONS.get(service["id"], [(service["name"], service["name"])]):
            if label not in seen:
                suggestions.append({"label": label, "query": search_query, "service": service["name"]})
                seen.add(label)
            if len(suggestions) == 6:
                return suggestions
    return suggestions

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        print("%s - %s" % (self.address_string(), fmt % args))

    def send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def end_headers(self):
        # The same Python service can serve both the website and its API on Render.
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/suggest":
            query = parse_qs(parsed.query).get("q", [""])[0][:120].strip()
            return self.send_json(200, {"suggestions": suggest_services(query)})
        return super().do_GET()

    def do_POST(self):
        if urlparse(self.path).path not in ("/api/search", "/api/chat"):
            return self.send_json(404, {"error": "Not found"})
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length < 1 or length > 8192:
                return self.send_json(400, {"error": "Request must be under 8 KB."})
            data = json.loads(self.rfile.read(length))
            query = str(data.get("query", data.get("message", ""))).strip()[:500]
            if len(query) < 3:
                return self.send_json(400, {"error": "Please describe what you need in a few words."})
            matches = score_services(query)
            if self.path == "/api/search":
                return self.send_json(200, {"services": [service_payload(service) for service in matches]})
            if matches:
                titles = ", ".join(service["name"] for service in matches[:3])
                reply = f"Based on what you shared, these services may be a useful starting point: {titles}. The exact rules depend on the programme and your location, so please confirm eligibility and documents with the official department."
                links = []
                for match in matches[:3]:
                    service = service_payload(match)
                    sources = service.get("officialSources", [{"title": service["name"], "url": service["officialUrl"]}])
                    links.extend(sources[:3])
            else:
                reply = "I couldn’t identify a close match in my current service guide. Try related terms such as voter ID or electoral roll, passport, Aadhaar, driving licence, scholarship, pension, farming support or healthcare. You can also search for the responsible ministry or state department."
                links = []
            return self.send_json(200, {"reply": reply, "links": links, "matches": [service_payload(service) for service in matches]})
        except (ValueError, json.JSONDecodeError):
            return self.send_json(400, {"error": "Invalid request."})

if __name__ == "__main__":
    print(f"SevaGuide AI listening on 0.0.0.0:{PORT}")
    print("Press Ctrl+C to stop.")
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
