# asis-app 로컬 서버: 파일이 없으면 index.html 로 돌려 줌(SPA), 캐시 끔
import http.server, sys, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'asis-app')
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=ROOT, **k)
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store'); super().end_headers()
    def send_head(self):
        p = self.translate_path(self.path.split('?')[0])
        if not os.path.exists(p) or os.path.isdir(p) and not os.path.exists(os.path.join(p, 'index.html')):
            self.path = '/index.html'
        return super().send_head()
    def log_message(self, *a): pass
http.server.ThreadingHTTPServer(('', int(sys.argv[1]) if len(sys.argv) > 1 else 8766), H).serve_forever()
