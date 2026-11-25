# 비코 UX 개선안 로컬 서버 (캐시 없음)
#  8775: 쇼케이스 쉘(index.html) + TO-BE 화면(tobe/)
#  8776: AS-IS 앱 사본(asis-app/) — 없는 주소는 index.html로 돌려 줌(SPA)
import http.server, os, threading
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

def run(handler, port):
    http.server.ThreadingHTTPServer(('', port), handler).serve_forever()

threading.Thread(target=run, args=(Spa, 8776), daemon=True).start()
run(Base, 8775)
