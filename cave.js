'use strict';
// The gloomy pixel room (the page background), shared by the home page and the coin pages.
// The class keeps the name Cave so the pages need no wiring change: same options (bears, ambient, glow, fps).
(function(){
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function rng(seed){var a=seed>>>0;return function(){a=(a+0x6d2b79f5)|0;var t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
  // The page background: a gloomy but cosy room on a rainy night. A little rain cloud sulks above a bucket, a ghost stands by, rain runs down the window.
  function Cave(canvas,opts){
    var scale=0,w=0,h=0,ctx=canvas.getContext('2d'),base=null,fall=null,drops=[],stars=[],fx=0,fy=0,ly=0,floorY=0,t0=0,raf=0,last=0,self=this,rain=[];
    function R(c,x,y,ww,hh,col){c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(ww)),Math.max(1,Math.round(hh)))}
    function ell(c,cx,cy,rx,ry,col){c.fillStyle=col;for(var y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++){var dy=(y+.5-cy)/ry;if(dy*dy>1)continue;var dx=Math.sqrt(1-dy*dy)*rx;c.fillRect(Math.round(cx-dx),y,Math.max(1,Math.round(dx*2)),1)}}
    function drop(c,x,y,col){R(c,x,y+1,3,2,col);R(c,x+1,y,1,1,col)}
    function size(){
      var vw=canvas.clientWidth||window.innerWidth,vh=canvas.clientHeight||window.innerHeight;
      scale=vw>900?4:3;w=Math.max(80,Math.ceil(vw/scale));h=Math.max(80,Math.ceil(vh/scale));canvas.width=w;canvas.height=h;
      floorY=Math.round(h*.74);fx=Math.round(w*.5);var tableTop=floorY-Math.round(h*.09);fy=tableTop;ly=tableTop-Math.round(h*.11);
      var oc=document.createElement('canvas');oc.width=w;oc.height=h;var c=oc.getContext('2d'),r=rng(11);
      // wallpaper: faded blue stripes with little raindrops
      for(var y=0;y<floorY;y++)for(var x=0;x<w;x++){var st=((x/6)|0)%2,n=r()*.08;var k=1+n+(st?.04:0);c.fillStyle='rgb('+(48*k|0)+','+(62*k|0)+','+(92*k|0)+')';c.fillRect(x,y,1,1)}
      for(var gy=8,row=0;gy<floorY-20;gy+=18,row++)for(var gx=(row%2?14:4);gx<w;gx+=26)drop(c,gx,gy,'#586f9a');
      // panelling and skirting
      var wt=floorY-Math.round(h*.13);R(c,0,wt,w,floorY-wt,'#38424f');for(var px=0;px<w;px+=Math.round(w/12)+4){R(c,px,wt+3,1,floorY-wt-5,'#2a323d')}
      R(c,0,wt,w,2,'#566272');R(c,0,floorY-3,w,3,'#606d80');
      // floor boards, damp and dark
      for(var fy2=floorY;fy2<h;fy2++){for(var fx2=0;fx2<w;fx2++){var pl=Math.floor((fy2-floorY)/9),sm=((fx2+pl*37)%53)===0,nn=r()*.1;var kk=(sm?.7:1)*(1+nn);c.fillStyle='rgb('+(78*kk|0)+','+(66*kk|0)+','+(64*kk|0)+')';c.fillRect(fx2,fy2,1,1)}if((fy2-floorY)%9===0)R(c,0,fy2,w,1,'#3a3234')}
      // the rug
      var ryc=floorY+Math.round((h-floorY)*.52),rrx=Math.round(w*.3),rry=Math.round((h-floorY)*.36);
      ell(c,fx,ryc,rrx,rry,'#2f3d63');ell(c,fx,ryc,rrx*.92,rry*.88,'#46588a');ell(c,fx,ryc,rrx*.7,rry*.66,'#8a93b3');ell(c,fx,ryc,rrx*.6,rry*.56,'#5a6a9c');
      // the window, with a grey curtain
      var wx=Math.round(w*.07),wy=Math.round(h*.11),ww=Math.round(w*.17),wh=Math.round(h*.3);
      R(c,wx-3,wy-3,ww+6,wh+6,'#566272');
      for(var sy=0;sy<wh;sy++){var q=sy/wh;R(c,wx,wy+sy,ww,1,'rgb('+(18+22*q|0)+','+(26+24*q|0)+','+(44+30*q|0)+')')}
      ell(c,wx+ww*.72,wy+wh*.3,Math.max(5,ww*.14),Math.max(4,ww*.1),'#2c3652');ell(c,wx+ww*.6,wy+wh*.34,Math.max(6,ww*.16),Math.max(4,ww*.1),'#262f48');
      R(c,wx+ww/2-1,wy,2,wh,'#566272');R(c,wx,wy+wh*.55,ww,2,'#566272');R(c,wx-3,wy+wh-1,ww+6,4,'#6b788c');
      R(c,wx-6,wy-4,Math.round(ww*.2),wh+10,'#4a5366');R(c,wx+ww-Math.round(ww*.2)+6,wy-4,Math.round(ww*.2),wh+10,'#4a5366');R(c,wx-8,wy-6,ww+16,3,'#6b788c');
      rain=[];for(var s=0;s<16;s++)rain.push({x:wx+2+r()*(ww-4),y:wy+r()*wh,v:.8+r()*1.2,l:3+r()*4});
      stars=[wx,wy,ww,wh];
      // frames: a frowning face and a rain cloud
      var f1x=Math.round(w*.34),f1y=Math.round(h*.13);R(c,f1x,f1y,18,15,'#566272');R(c,f1x+2,f1y+2,14,11,'#e8d9b5');R(c,f1x+5,f1y+5,2,2,'#222');R(c,f1x+11,f1y+5,2,2,'#222');R(c,f1x+6,f1y+10,6,1,'#222');R(c,f1x+5,f1y+11,1,1,'#222');R(c,f1x+12,f1y+11,1,1,'#222');
      var f2x=Math.round(w*.63),f2y=Math.round(h*.17);R(c,f2x,f2y,18,13,'#566272');R(c,f2x+2,f2y+2,14,9,'#8aa0c4');ell(c,f2x+9,f2y+5,5,2.5,'#e8edf5');R(c,f2x+5,f2y+8,1,2,'#3b6fd6');R(c,f2x+9,f2y+8,1,2,'#3b6fd6');R(c,f2x+13,f2y+8,1,2,'#3b6fd6');
      // a shelf with a plant that has given up
      var shx=Math.round(w*.43),shy=Math.round(h*.4);R(c,shx,shy,Math.round(w*.15),3,'#6b788c');R(c,shx+4,shy-7,8,7,'#7a5a4a');R(c,shx+7,shy-12,2,5,'#5f8a5a');R(c,shx+5,shy-10,2,2,'#5f8a5a');R(c,shx+3,shy-9,2,4,'#5f8a5a');R(c,shx+9,shy-11,2,2,'#5f8a5a');R(c,shx+10,shy-9,2,5,'#5f8a5a');
      R(c,shx+Math.round(w*.15)-12,shy-6,9,6,'#e8d9b5');R(c,shx+Math.round(w*.15)-11,shy-5,7,1,'#8aa0c4');
      // the ghost's corner: a coat stand with a limp umbrella
      var tx=Math.round(w*.84);R(c,tx-9,floorY-3,18,5,'#3a4254');R(c,tx-1,Math.round(h*.4),3,floorY-Math.round(h*.4),'#6b788c');R(c,tx-6,Math.round(h*.4),13,3,'#6b788c');
      R(c,tx+8,Math.round(h*.4),2,12,'#2a3040');R(c,tx+4,Math.round(h*.4)+10,10,3,'#2f3a5c');R(c,tx+3,Math.round(h*.4)+12,3,3,'#2f3a5c');
      // the bucket under the leak
      var bx=Math.round(w*.27),by=floorY+Math.round((h-floorY)*.5),bw2=Math.round(w*.07);
      ell(c,bx,by+3,bw2+2,Math.round(bw2*.35)+2,'#1c2a40');R(c,bx-bw2,by-Math.round(bw2*.9),bw2*2,Math.round(bw2*.9)+2,'#4a6fa8');R(c,bx-bw2,by-Math.round(bw2*.9),bw2*2,2,'#7a9fd6');ell(c,bx,by-Math.round(bw2*.9),bw2,Math.round(bw2*.25),'#2c3f66');
      // tissues and a mug
      var bwx=Math.round(w*.63),bwy=floorY+Math.round((h-floorY)*.7);
      R(c,bwx-9,bwy-6,16,8,'#6ea0d6');R(c,bwx-6,bwy-10,6,5,'#f4f6fa');R(c,bwx-1,bwy-12,5,7,'#f4f6fa');R(c,bwx+12,bwy-4,8,6,'#e8d9b5');R(c,bwx+20,bwy-3,2,3,'#e8d9b5');
      // a side table and the lamp
      R(c,fx-12,fy,24,3,'#566272');R(c,fx-10,fy+3,3,floorY-fy,'#3d4655');R(c,fx+7,fy+3,3,floorY-fy,'#3d4655');R(c,fx-9,fy+Math.round((floorY-fy)*.6),18,2,'#3d4655');
      R(c,fx-1,fy-Math.round(h*.06),3,Math.round(h*.06),'#6a5a48');R(c,fx-4,fy-3,9,3,'#6a5a48');
      var sw=Math.round(w*.05);for(var sy3=0;sy3<Math.round(h*.06);sy3++){var half=sw*.5+sy3*.55;R(c,fx-half,ly+sy3,half*2,1,'#ffe0a0')}
      base=oc;
      fall=new Float32Array(w*h);var sig=Math.max(w,h)*.5;
      for(var yy=0;yy<h;yy++)for(var xx=0;xx<w;xx++){var dx=(xx-fx)/(sig*1.1),dy=(yy-ly)/(sig*.9);fall[yy*w+xx]=Math.exp(-(dx*dx+dy*dy)*2.0)}
    }
    // a small rain cloud above the bucket: it sulks, blinks slowly, and drips into the bucket
    function cloud(c,t){
      var bx=Math.round(w*.27),cy=floorY-Math.round(h*.2),u=Math.max(5,Math.round(w*.04)),bob=Math.round(Math.sin(t*1.3)*1.5);
      ell(c,bx,cy+bob,u*2,u*.9,'#8a93a8');ell(c,bx-u*1.1,cy+bob+1,u*1.1,u*.8,'#8a93a8');ell(c,bx+u*1.2,cy+bob+1,u*1.1,u*.8,'#8a93a8');ell(c,bx,cy+bob-u*.5,u*1.3,u*.7,'#a3abbc');
      var blink=(t%5)>4.8;R(c,bx-u*.8,cy+bob,2,blink?1:2,'#1d1d2e');R(c,bx+u*.4,cy+bob,2,blink?1:2,'#1d1d2e');
      R(c,bx-u*.8-1,cy+bob-3,3,1,'#1d1d2e');R(c,bx+u*.4+1,cy+bob-3,3,1,'#1d1d2e');R(c,bx-1,cy+bob+u*.55,3,1,'#1d1d2e');
      for(var k=0;k<3;k++){var ph=((t*.9+k*.33)%1),dy=Math.round(cy+bob+u*.9+ph*(floorY+Math.round((h-floorY)*.5)-Math.round(w*.063)-cy-u));R(c,bx-u+k*u+ (k%2),dy,1,2,'#8fd3ff')}
    }
    // the ghost by the coat stand: white sheet, droopy eyes and a tear
    function ghost(c,t){
      var tx=Math.round(w*.84),gy=floorY+2,u=Math.max(5,Math.round(w*.035)),sway=Math.round(Math.sin(t*1.1)*1);
      R(c,tx-u*1.1+sway,gy-u*3.6,u*2.2,u*3.2,'#e9ebf6');ell(c,tx+sway,gy-u*3.6,u*1.1,u*.9,'#e9ebf6');
      for(var k=0;k<4;k++)R(c,tx-u*1.1+sway+k*u*.55,gy-u*.5,Math.max(2,u*.5),k%2?3:5,'#e9ebf6');
      var blink=(t%6)>5.8;R(c,tx-u*.5+sway,gy-u*3.5,2,blink?1:3,'#1d1d2e');R(c,tx+u*.2+sway,gy-u*3.5,2,blink?1:3,'#1d1d2e');R(c,tx-u*.3+sway,gy-u*2.6,u*.6,1,'#1d1d2e');
      var tp=(t*.8)%1;R(c,tx+u*.2+sway,gy-u*3.5+3+tp*u*2,1,2,'#8fd3ff');
    }
    function frame(ts){
      if(!ctx)return;
      var t=(ts-t0)/1000;
      if(!frame.buf||frame.buf.width!==w||frame.buf.height!==h){frame.buf=document.createElement('canvas');frame.buf.width=w;frame.buf.height=h}
      var bc=frame.buf.getContext('2d');bc.drawImage(base,0,0);
      cloud(bc,t);ghost(bc,t);
      // rain on the window, a ripple in the bucket
      var wx=stars[0],wy=stars[1],ww=stars[2],wh=stars[3];
      rain.forEach(function(q){q.y+=q.v;if(q.y>wy+wh){q.y=wy;q.x=wx+2+Math.random()*(ww-4)}R(bc,q.x,q.y,1,q.l,'#7da2d6')});
      var bx=Math.round(w*.27),by=floorY+Math.round((h-floorY)*.5),bw2=Math.round(w*.07),rp=(t*.9)%.33;if(rp<.12){var rr=1+rp*30;ell(bc,bx,by-Math.round(bw2*.9),Math.min(bw2,rr),Math.min(bw2*.25,rr*.3),'#4a6fa8')}
      var img=bc.getImageData(0,0,w,h),d=img.data;
      var fl=.92+.05*Math.sin(t*2.1)+.03*Math.sin(t*5.3+1.3)+(Math.random()-.5)*.02,amb=opts.ambient*1.15;
      for(var p=0,n=w*h;p<n;p++){var g=fall[p]*fl*opts.glow,o=p*4;
        d[o]=Math.min(255,d[o]*(amb*1.0+g*1.3));d[o+1]=Math.min(255,d[o+1]*(amb*1.02+g*1.05));d[o+2]=Math.min(255,d[o+2]*(amb*1.15+g*.8))}
      ctx.putImageData(img,0,0);
      ell(ctx,fx,ly+Math.round(h*.03),Math.round(w*.03),Math.round(h*.03),'rgba(255,230,170,.45)');
    }
    function loop(ts){raf=requestAnimationFrame(loop);if(ts-last<(opts.fps?1000/opts.fps:33))return;last=ts;frame(ts)}
    this.start=function(){size();t0=performance.now();if(reduce){frame(t0+1500);return}
      window.addEventListener('resize',self.resize);raf=requestAnimationFrame(loop)};
    this.stop=function(){cancelAnimationFrame(raf);raf=0;window.removeEventListener('resize',self.resize)};
    this.resize=function(){size()};
  }

  /* ---------- the 2D intro for slow devices: a pixel park where a dog and a cat chase each other ---------- */
  function Matrix(canvas,opts){
    var w=0,h=0,ctx=canvas.getContext('2d'),t0=0,raf=0,last=0,self=this,rd=rng(5),fl=[],tr=[];
    function size(){
      var vw=canvas.clientWidth||window.innerWidth,vh=canvas.clientHeight||window.innerHeight,scale=vw>900?4:3;
      w=Math.max(80,Math.ceil(vw/scale));h=Math.max(80,Math.ceil(vh/scale));canvas.width=w;canvas.height=h;
      fl=[];for(var i=0;i<Math.round(w/5);i++)fl.push({x:rd()*w,y:.5+rd()*.5,c:['#ff6f91','#ffd166','#fff','#c9a0ff'][i%4]});
      tr=[];for(var k=0;k<Math.ceil(w/46)+1;k++)tr.push({x:k*46+rd()*18,s:.8+rd()*.5})}
    // two sad friends: a ghost and a blob. dir is the way they face; step swaps the feet; the tear runs down
    function friend(c,x,gy,dir,blob,col,dk,step,t){
      var f=function(rx,ry,rw,rh,cl){c.fillStyle=cl;c.fillRect(Math.round(x+dir*rx-(dir<0?rw-1:0)),gy+ry,rw,rh)};
      if(blob){f(-9,-9,18,9,col);f(-7,-12,14,4,col);f(-4,-14,8,3,col);f(-10,-1,20,2,dk);f(-6,-14,3,2,'#ffffff');
        f(2,-8,2,3,'#ffffff');f(-5,-8,2,3,'#ffffff');f(3,-6,1,1,'#222');f(-4,-6,1,1,'#222');f(-2,-3,5,1,'#222');f(-3,-4,1,1,'#222');f(3,-4,1,1,'#222')}
      else{var w2=Math.round(Math.sin(t*6)*1);f(-6,-16,12,15,col);f(-4,-19,8,4,col);f(-3,-21,4,2,col);
        for(var k=0;k<4;k++)f(-6+k*3,-1+((k+step)%2),3,2+((k+step)%2),col);
        f(-3,-14,2,3,'#222');f(2,-14,2,3,'#222');f(-2,-9,5,1,'#222');f(-3,-8,1,1,'#222');f(3,-8,1,1,'#222');f(3,-11+Math.round((t*3)%1*5),1,2,'#8fd3ff');f(7,-9+w2,3,4,col)}
    }
    function tree(c,x,gy,s){c.fillStyle='#4a3a2b';c.fillRect(x-2,gy-Math.round(16*s),4,Math.round(16*s));
      c.fillStyle='#24563a';c.fillRect(x-Math.round(10*s),gy-Math.round(30*s),Math.round(20*s),Math.round(12*s));c.fillStyle='#2d6a47';c.fillRect(x-Math.round(7*s),gy-Math.round(38*s),Math.round(14*s),Math.round(10*s));c.fillStyle='#38805a';c.fillRect(x-Math.round(4*s),gy-Math.round(42*s),Math.round(8*s),Math.round(5*s))}
    function frame(ts){
      if(!ctx)return;var t=(ts-t0)/1000;
      ctx.fillStyle='#5d6b82';ctx.fillRect(0,0,w,h);
      ctx.fillStyle='#7b8aa1';ctx.fillRect(0,Math.round(h*.4),w,Math.round(h*.12));
      for(var c=0;c<4;c++){var cx=Math.round(((t*(3+c)+c*w*.3)%(w+60))-30),cy=Math.round(h*(.12+c*.07));ctx.fillStyle='#8e9bb0';ctx.fillRect(cx,cy,30,6);ctx.fillRect(cx+5,cy-3,16,4)}
      var hy=Math.round(h*.58);ctx.fillStyle='#2f5a45';ctx.fillRect(0,hy,w,h-hy);
      for(var s=0;s<w;s+=16){ctx.fillStyle=(s/16|0)%2?'#35644e':'#2f5a45';ctx.fillRect(s,hy,8,h-hy)}
      tr.forEach(function(q){tree(ctx,Math.round(q.x),hy+2,q.s)});
      ctx.fillStyle='#6f7684';ctx.fillRect(0,Math.round(h*.8),w,Math.round(h*.06));
      fl.forEach(function(q){var y=Math.round(hy+6+q.y*(h-hy-10));ctx.fillStyle='#2f8a3e';ctx.fillRect(Math.round(q.x),y+1,1,2);ctx.fillStyle='#6a7390';ctx.fillRect(Math.round(q.x)-1,y+Math.round(Math.sin(t*2+q.x)),3,2)});
      for(var rI=0;rI<Math.round(w/3);rI++){var rx=(rI*37)%w,ry=((t*60+rI*23)%h);ctx.fillStyle='rgba(180,210,255,.55)';ctx.fillRect(rx,ry,1,4)}
      // two chases on two lanes. They run out to the right, turn, and the chaser and the chased swap.
      [[.8,.09,0],[.9,.075,.37]].forEach(function(ln,i){
        var gy=Math.round(h*ln[0]),ph=(t*ln[1]+ln[2])%1,fwd=ph<.5,k=fwd?ph*2:(1-ph)*2,e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
        var L=14,R=w-32,lead=Math.round(Math.min(w*.18,26)),x1=L+(R-L)*e,dir=fwd?1:-1,step=((t*10+i)%1)<.5;
        var x2=x1-dir*lead,a=i%2?x1:x2,b=i%2?x2:x1; // a: the dog, b: the cat
        friend(ctx,Math.round(a),gy,dir,false,i%2?'#e1d6f5':'#f1f2fa','#b8bdd8',step,t);
        friend(ctx,Math.round(b),gy,dir,true,i%2?'#9a6ad6':'#4fc2b4','#2f8c82',!step,t)})
    }
    function loop(ts){raf=requestAnimationFrame(loop);if(ts-last<(opts&&opts.fps?1000/opts.fps:33))return;last=ts;frame(ts)}
    this.start=function(){size();t0=performance.now();
      if(reduce){frame(t0+3500);return}
      window.addEventListener('resize',self.resize);raf=requestAnimationFrame(loop)};
    this.stop=function(){cancelAnimationFrame(raf);raf=0;window.removeEventListener('resize',self.resize)};
    this.resize=function(){size()};
  }

  window.Matrix=Matrix;

  window.Cave=Cave;window.caveReduce=reduce;
})();
