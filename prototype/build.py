"""Builds index.html from template.html: cuts the emblem and eye masks from img/avatar.png,
embeds the St Andrews VCS picture, and draws the grain and star tiles. Run: python3 build.py"""
import base64, io, random
from PIL import Image, ImageFilter
import numpy as np
s=open('template.html').read()
s=s.replace("{name:'nand-evolver',        priv:true}","{name:'nand-evolver',        priv:true, pushed:'2026-11-24'}")
s=s.replace("  {name:'compendium',          missing:true},","  {name:'compendium'},").replace("  {name:'roll-call',           missing:true},","  {name:'roll-call'},")
s=s.replace("org:true, url:'https://github.com/standrewsvcs'","pic:'__VCS__', url:'https://github.com/standrewsvcs'")
s=s.replace("a private or missing one is plain text","one without a link is plain text")
def uri(im,fmt='PNG'):
    b=io.BytesIO(); im.save(b,fmt,optimize=True); return 'data:image/%s;base64,'%fmt.lower()+base64.b64encode(b.getvalue()).decode()
a=np.asarray(Image.open('img/avatar.png').convert('RGB')).astype(float)
bg=np.array([46,34,47.]); d=np.abs(a-bg).max(axis=2)
alpha=np.clip((d-18)/70,0,1)
yy,xx=np.mgrid[0:460,0:460]
centre=(xx>150)&(xx<310)&(yy>150)&(yy<280)
eye=np.clip((a[:,:,0]-95)/60,0,1)*centre          # the eyes are the only place the red channel rises
print('eye px',int((eye>0.5).sum()))
eyeim=Image.fromarray((eye*255).astype('uint8'))
halo=np.asarray(eyeim.filter(ImageFilter.GaussianBlur(5))).astype(float)/255
eyea=np.clip(eye+halo*1.6,0,1)
def rgba(al): 
    o=np.zeros((460,460,4),'uint8'); o[...,3]=(al*255).astype('uint8'); o[...,:3]=255; return Image.fromarray(o).resize((300,300),Image.LANCZOS)
s=s.replace('__MASK__',uri(rgba(alpha))).replace('__EYES__',uri(rgba(eyea)))
v=Image.open('img/vcs-pfp.png').convert('RGB').resize((84,84),Image.LANCZOS)
s=s.replace('__VCS__',uri(v))
rng=np.random.default_rng(3)
g=np.zeros((128,128,4),'uint8'); n=rng.random((128,128)); w=rng.random((128,128))<.5
g[...,:3]=np.where(w,255,10)[...,None]; g[...,3]=(n*np.where(w,7,4.5)).astype('uint8')
s=s.replace('__GRAIN__',uri(Image.fromarray(g)))
W,H=400,240; t=np.zeros((H,W,4),'uint8')
def px(x,y,al,c=(225,242,249)):
    if 0<=x<W and 0<=y<H and al>t[y,x,3]: t[y,x]=(*c,al)
for i in range(46):
    x=int(rng.integers(0,W)); y=int((rng.random()**2.2)*H*.95); al=int(rng.integers(70,170)*(1-y/H*.7))
    px(x,y,al)
for x,y in [(52,18),(301,40),(188,9),(356,96)]:      # four sparkles, the same plus shape as the emblem's
    px(x,y,235,(255,255,255))
    for dx,dy in [(1,0),(-1,0),(0,1),(0,-1)]: px(x+dx,y+dy,110)
s=s.replace('__STARS__',uri(Image.fromarray(t)))
assert '__' not in s.replace('__proto__','')
open('index.html','w').write('<!doctype html>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'+s)
print(len(s))
