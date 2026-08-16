import re
import tldextract
from urllib.parse import urlparse

SUSPICIOUS_KEYWORDS = ['login','secure','verify','account','update','bank','confirm','password']
SUSPICIOUS_TLDS     = ['xyz','tk','ml','ga','cf','gq','top','click','win']
URL_SHORTENERS      = ['bit.ly','tinyurl.com','goo.gl','t.co','ow.ly']

def analyze_url(url):
    if not url.startswith(('http://','https://')):
        url = 'http://' + url
    
    parsed  = urlparse(url)
    extract = tldextract.extract(url)
    flags   = []
    score   = 0

    # 1. HTTPS
    if parsed.scheme == 'http':
        flags.append({'flag': 'No HTTPS', 'severity': 'high', 'points': 25})
        score += 25

    # 2. IP address as host
    if re.match(r'^\d{1,3}(\.\d{1,3}){3}$', parsed.hostname or ''):
        flags.append({'flag': 'IP address used as host', 'severity': 'high', 'points': 30})
        score += 30

    # 3. Subdomain depth
    sub_depth = len(extract.subdomain.split('.')) if extract.subdomain else 0
    if sub_depth >= 3:
        flags.append({'flag': f'Excessive subdomains ({sub_depth})', 'severity': 'high', 'points': 20})
        score += 20

    # 4. Suspicious TLD
    if extract.suffix in SUSPICIOUS_TLDS:
        flags.append({'flag': f'Suspicious TLD (.{extract.suffix})', 'severity': 'medium', 'points': 15})
        score += 15

    # 5. Keywords in URL
    found_kw = [k for k in SUSPICIOUS_KEYWORDS if k in url.lower()]
    if len(found_kw) >= 3:
        flags.append({'flag': f'Multiple suspicious keywords: {found_kw[:3]}', 'severity': 'high', 'points': 20})
        score += 20
    elif found_kw:
        flags.append({'flag': f'Suspicious keywords: {found_kw}', 'severity': 'medium', 'points': 10})
        score += 10

    # 6. URL shortener
    if parsed.hostname in URL_SHORTENERS:
        flags.append({'flag': 'URL shortener detected', 'severity': 'medium', 'points': 15})
        score += 15

    # 7. @ symbol in URL
    if '@' in url:
        flags.append({'flag': '@ symbol in URL', 'severity': 'high', 'points': 20})
        score += 20

    return {
        'url': url,
        'score': min(score, 100),
        'risk': 'high' if score>=65 else 'medium' if score>=35 else 'low',
        'flags': flags
    }

if __name__ == '__main__':
    test_urls = [
        'http://paypa1.com/secure/verify/account',
        'https://google.com',
        'http://login.verify.secure.paypal.evil.xyz',
        'http://192.168.1.1/login'
    ]
    for u in test_urls:
        result = analyze_url(u)
        print(f"\n{result['url']}")
        print(f"  Score: {result['score']}/100 — {result['risk'].upper()} RISK")
        for f in result['flags']:
            print(f"  [{f['severity'].upper()}] {f['flag']}")