#!/usr/bin/env python3
"""Build one self-contained reveal.js HTML deck; Python standard library only."""
from pathlib import Path
import argparse,base64,html,json,mimetypes,re


def text(value):
    return re.sub(r'\*\*(.+?)\*\*',r'<strong>\1</strong>',html.escape(str(value)))

def build(deck_path,output):
    deck_path=Path(deck_path).resolve();root=deck_path.parent;data=json.loads(deck_path.read_text())
    def uri(path):
        if path.startswith(('data:','https://','http://')):return path
        p=root/path
        if not p.is_file():raise FileNotFoundError(f'Missing media: {p}')
        return 'data:'+(mimetypes.guess_type(str(p))[0] or 'application/octet-stream')+';base64,'+base64.b64encode(p.read_bytes()).decode()
    def media(spec):
        src=html.escape(uri(spec['src']),quote=True);alt=html.escape(spec.get('alt','Slide media'),quote=True)
        if spec.get('kind')=='video':
            identity=html.escape(spec.get('id',spec['src']),quote=True)
            return f'<video data-id="{identity}" data-ignore muted loop playsinline controls preload="auto" aria-label="{alt}"><source src="{src}"></video>'
        return f'<img src="{src}" alt="{alt}">'
    def diagram(body):return '<svg class="slide-diagram" viewBox="0 0 1280 720" role="img" aria-label="Illustrative process diagram">'+body+'</svg>'
    def svg_label(title,x,y,size=24,attrs=''):
        lines=title if isinstance(title,list) else [title]
        body=''.join(f'<tspan x="{x}" y="{y+28*i}">{html.escape(line)}</tspan>' for i,line in enumerate(lines))
        return f'<text x="{x}" y="{y}" text-anchor="middle" font-size="{size}" font-weight="700" {attrs}>{body}</text>'
    slides=[]
    for i,s in enumerate(data['slides'],1):
        kind=s['type'];attrs='';cls=kind;heading=f'<h2>{text(s.get("title",""))}</h2>';body=''
        if kind=='cover':
            heading='';body=f'<h1>{text(s["title"])}</h1><p class="subtitle">{text(s.get("subtitle",""))}</p><p class="byline">{text(s.get("author","[Name]"))} &nbsp; / &nbsp; {text(s.get("date","[Date]"))}</p>'
        elif kind in ('question','closing'):
            heading='';body=f'<div class="central">'+(f'<p>{text(s["title"])}</p>' if kind=='question' else f'<p class="name">{text(s["title"])}</p><p class="invite">{text(s.get("invite","Join me!"))}</p>')+'</div>'
        elif kind=='bullets':
            items=''.join(f'<li'+(f' class="fragment" data-fragment-index="{j}"' if s.get('reveal')=='click' else '')+f'>{text(item)}</li>' for j,item in enumerate(s['items']))
            body=f'<ul class="bullet-list'+(' enter' if s.get('reveal')!='click' else '')+f'">{items}</ul>'
        elif kind=='cards':
            cards=''
            for j,c in enumerate(s['cards']):
                fragment=f' fragment" data-fragment-index="{c.get("click",j)}' if s.get('reveal')=='click' else ''
                cards+=f'<div class="card{fragment}"><h3>{text(c["title"])}</h3><p class="metric">{text(c.get("value",""))}</p><p class="caption">{text(c.get("caption",""))}</p></div>'
            body=f'<div class="card-grid'+(' enter' if s.get('reveal')!='click' else '')+f'">{cards}</div>'
        elif kind=='comparison':
            body='<div class="compare enter">'+''.join(f'<div class="card"><h3>{text(c["title"])}</h3>{media(c["media"])}</div>' for c in s['cards'])+'</div>'
        elif kind=='media':body='<div class="media-stage enter">'+media(s['media'])+'</div>'
        elif kind=='media-focus':
            cls+=' compact' if s.get('compact') else ''
            attrs=f' data-auto-animate data-auto-animate-id="{html.escape(s["motion_key"])}" data-auto-animate-duration="0.9" data-auto-animate-unmatched="false" data-auto-animate-easing="cubic-bezier(.22,1,.36,1)"'
            body='<div class="media-stage">'+media(s['media'])+'</div>'
            if s.get('annotation'):body+=f'<p class="annotation">{text(s["annotation"])}</p>'
        elif kind=='pipeline':
            groups=''
            for j,stage in enumerate(s['stages']):
                x=80+j*300;group=''
                if j:group+=f'<path class="edge" d="M{x-80} 410 H{x-8} M{x-16} 404 L{x-8} 410 L{x-16} 416"/>'
                group+=svg_label(stage['title'],x+110,208)
                group+=f'<rect x="{x}" y="240" width="220" height="342" rx="16" fill="{stage.get("color","#e6eefb")}"/>'
                for k,item in enumerate(stage.get('items',[])):
                    y=275+k*75;group+=f'<rect x="{x+15}" y="{y}" width="190" height="55" rx="10" fill="#fafcfd"/><text x="{x+110}" y="{y+34}" text-anchor="middle" font-size="22">{html.escape(item)}</text>'
                groups+=f'<g class="fragment" data-fragment-index="{j}">{group}</g>'
            body=diagram(groups)
        elif kind=='overview':
            attrs=f' data-focus-key="{html.escape(s["focus_key"])}"';body=''
            for j,c in enumerate(s['cards']):
                x=80+j*390;key=html.escape(c['key']);body+=f'<rect data-panel="{key}" x="{x}" y="260" width="340" height="190" rx="16" fill="{c.get("color","#e6eefb")}"/>'+svg_label(c['title'],x+170,332 if isinstance(c['title'],list) else 345,attrs=f'data-heading="{key}"')
                if j:body+=f'<path class="edge" d="M{x-50} 355 H{x-8} M{x-16} 349 L{x-8} 355 L{x-16} 361"/>'
            body=diagram(body)
        elif kind=='detail':
            cls='focus-detail';key=html.escape(s['focus_key']);attrs=f' data-focus-key="{key}"';body=f'<rect data-panel="{key}" x="60" y="174" width="1160" height="460" rx="18" fill="#eaf0f5"/>'+svg_label(s['panel_title'],640,205,30,attrs=f'data-heading="{key}"')
            for j,c in enumerate(s['cards']):
                x=85+j*565
                body+=f'<g class="detail-body"><g class="fragment" data-fragment-index="{j}"><rect x="{x}" y="236" width="545" height="370" rx="14" fill="{c.get("color","#f2f5ef")}"/>'+svg_label(c['title'],x+272.5,277)
                for k,item in enumerate(c['items']):
                    y=311+k*78;body+=f'<rect x="{x+22}" y="{y}" width="501" height="57" rx="10" fill="#fafcfd"/><text x="{x+272.5}" y="{y+35}" text-anchor="middle" font-size="23">{html.escape(item)}</text>'
                body+='</g></g>'
            body=diagram(body)
        elif kind=='code':
            code=(root/s['text_file']).read_text() if s.get('text_file') else s.get('text','')
            rows=''.join(f'<div class="code-row"><span class="line-number" aria-hidden="true">{j}</span><span class="code-text'+(' code-comment' if line.startswith('#') else '')+f'">{html.escape(line) or " "}</span></div>' for j,line in enumerate(code.splitlines(),1))
            scrolling=f' data-scroll-ms="{int(s["scroll_ms"])}"' if s.get('scroll_ms') else ''
            body=f'<div class="editor enter"><div class="editor-tab">{text(s.get("filename","prompt.txt"))}</div><div class="prompt-scroll" tabindex="0"{scrolling}>{rows}</div></div>'
        elif kind=='custom':body=(root/s['html_file']).read_text() if s.get('html_file') else s['html']
        else:raise ValueError('Unknown slide type: '+kind)
        if s.get('shrink_note'):body=f'<div class="shrink-group">{body}</div><p class="after-shrink fragment" data-fragment-index="0">{text(s["shrink_note"])}</p>'
        notes=f'<aside class="notes">{html.escape(s["notes"])}</aside>' if s.get('notes') else ''
        slides.append(f'<section class="{cls}"{attrs}>{heading}{body}{notes}<span class="page">{i:02}</span></section>')
    css=(root/'vendor/reveal.css').read_text()+'\n'+(root/'theme.css').read_text()
    js='\n'.join((root/p).read_text() for p in ['vendor/reveal.js','runtime.js','media-preview.js']).replace('</script','<\\/script')
    page='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+html.escape(data.get('title','Slides'))+'</title><style>'+css+'</style></head><body><!-- '+(root/'vendor/LICENSE').read_text()+' --><div class="reveal"><div class="slides">'+''.join(slides)+'</div></div><script>'+js+'</script></body></html>'
    output=Path(output).resolve();output.parent.mkdir(parents=True,exist_ok=True);output.write_text(page);print(f'{len(slides)} slides → {output}')

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('deck',type=Path);p.add_argument('--output',type=Path,required=True);a=p.parse_args();build(a.deck,a.output)
