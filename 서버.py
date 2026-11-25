# 비코 UX 개선안 로컬 서버 (캐시 없음)
#  8775: 쇼케이스 쉘(index.html) + TO-BE 화면(tobe/)
#  8776: AS-IS 앱 사본(asis-app/) — 없는 주소는 index.html로 돌려 줌(SPA)
import http.server, os, threading, urllib.request, urllib.error
HERE = os.path.dirname(os.path.abspath(__file__))

class Base(http.server.SimpleHTTPRequestHandler):
    root = HERE
    def __init__(self, *a, **k): super().__init__(*a, directory=self.root, **k)
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Access-Control-Allow-Origin', '*')   # 글꼴을 다른 포트에서 불러올 때 필요
        super().end_headers()
    def log_message(self, *a): pass

class Spa(Base):
    root = os.path.join(HERE, 'asis-app')
    def translate_path(self, path):
        name = path.split('?')[0].lstrip('/')
        if name in ('ux-bridge.js', 'ux-pins.js'):     # 브리지와 점 정의는 쉘 폴더 것을 그대로 씀
            return os.path.join(HERE, name)
        return super().translate_path(path)
    def send_head(self):
        p = self.translate_path(self.path)
        if not os.path.exists(p) or (os.path.isdir(p) and not os.path.exists(os.path.join(p, 'index.html'))):
            self.path = '/index.html'
        return super().send_head()

# 8776 프록시 모드: 배포된 https://bico-renewal.expo.app 을 그대로 가져오되 HTML에만 연동 스크립트를 끼워 넣음(배포본은 건드리지 않음)
UPSTREAM = 'https://bico-renewal.expo.app'
INJECT = b'<script src="/ux-pins.js"></script><script src="/ux-bridge.js"></script></head>'
CACHE = {}   # 해시가 붙은 정적 파일(/_expo/, /assets/)은 한 번 받아 두고 계속 씀
class Proxy(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def do_GET(self):
        name = self.path.split('?')[0].lstrip('/')
        static = name.startswith(('_expo/', 'assets/'))
        if name in ('ux-bridge.js', 'ux-pins.js'):
            body = open(os.path.join(HERE, name), 'rb').read(); code, ctype = 200, 'application/javascript; charset=utf-8'
        elif static and name in CACHE:
            code, body, ctype = CACHE[name]
        else:
            try:
                req = urllib.request.Request(UPSTREAM + self.path, headers={'User-Agent': 'Mozilla/5.0', 'Accept-Encoding': 'identity'})
                r = urllib.request.urlopen(req, timeout=30); code, body, ctype = r.status, r.read(), r.headers.get('Content-Type', 'application/octet-stream')
            except urllib.error.HTTPError as e:
                code, body, ctype = e.code, e.read(), e.headers.get('Content-Type', 'text/plain')
            except Exception:
                code, body, ctype = 502, b'proxy error', 'text/plain'
            if 'text/html' in ctype: body = body.replace(b'</head>', INJECT, 1)
            elif static and code == 200: CACHE[name] = (code, body, ctype)
        self.send_response(code); self.send_header('Content-Type', ctype); self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'max-age=86400' if static and code == 200 else 'no-store'); self.send_header('Access-Control-Allow-Origin', '*'); self.end_headers(); self.wfile.write(body)

def run(handler, port):
    http.server.ThreadingHTTPServer(('', port), handler).serve_forever()

threading.Thread(target=run, args=(Spa, 8776), daemon=True).start()   # 11/23: AS-IS를 처음 앱(asis-app 사본)으로 되돌림. 라이브 앱 프록시로 돌리려면 Spa 대신 Proxy
run(Base, 8775)
