/* Vero Scan 3D mark | three.js r186 (0.186.1), MIT License, Copyright 2010-2026 three.js authors */
(()=>{var vc=0,Fo=1,_c=2;var ys=1,yc=2,zi=3,wn=0,ye=1,Ve=2,xn=0,Ji=1,No=2,Oo=3,Go=4,$r=5;var Pn=100,Mc=101,Sc=102,Ec=103,Cc=104,ta=200,Ms=201,bc=202,Tc=203,Ss=204,Qo=205,Ic=206,Pc=207,Bc=208,Lc=209,Rc=210,Uc=211,Dc=212,Fc=213,Nc=214,mr=0,gr=1,wr=2,Li=3,xr=4,vr=5,_r=6,yr=7,ko=0,Oc=1,Gc=2,rn=0,Ho=1,zo=2,Jo=3,Vo=4,Wo=5,Xo=6,Es=7;var Yo=300,Xn=301,li=302,ea=303,na=304,Cs=306,Mr=1e3,fn=1001,Sr=1002,_e=1003,Qc=1004;var bs=1005;var Me=1006,ia=1007;var Yn=1008;var ke=1009,Ko=1010,qo=1011,Vi=1012,sa=1013,an=1014,on=1015,ln=1016,ra=1017,aa=1018,Wi=1020,Zo=35902,jo=35899,$o=1021,tl=1022,Ke=1023,pn=1026,Kn=1027,el=1028,oa=1029,qn=1030,la=1031;var ca=1033,Ts=33776,Is=33777,Ps=33778,Bs=33779,ha=35840,ua=35841,da=35842,fa=35843,pa=36196,Aa=37492,ma=37496,ga=37488,wa=37489,Ls=37490,xa=37491,va=37808,_a=37809,ya=37810,Ma=37811,Sa=37812,Ea=37813,Ca=37814,ba=37815,Ta=37816,Ia=37817,Pa=37818,Ba=37819,La=37820,Ra=37821,Ua=36492,Da=36494,Fa=36495,Na=36283,Oa=36284,Rs=36285,Ga=36286;var rs=2300,Er=2301,pr=2302,bo=2303,To=2400,Io=2401,Po=2402;var kc=3200;var Qa=0,Hc=1,qe="",De="srgb",as="srgb-linear",os="linear",Kt="srgb";var Ar=7680;var zc=519,Jc=512,Vc=513,Wc=514,ka=515,Xc=516,Yc=517,Ha=518,Kc=519,nl=35044;var il="300 es",sn=2e3,Ri=2001;function lu(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function cu(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function ls(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function qc(){let i=ls("canvas");return i.style.display="block",i}var Kl={},Ui=null;function Bo(...i){let t="THREE."+i.shift();Ui?Ui("log",t,...i):console.log(t,...i)}function Zc(i){let t=i[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=i[1];e&&e.isStackTrace?i[0]+=" "+e.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Pt(...i){i=Zc(i);let t="THREE."+i.shift();if(Ui)Ui("warn",t,...i);else{let e=i[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...i)}}function It(...i){i=Zc(i);let t="THREE."+i.shift();if(Ui)Ui("error",t,...i);else{let e=i[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...i)}}function si(...i){let t=i.join(" ");t in Kl||(Kl[t]=!0,Pt(...i))}function jc(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}var $c={[mr]:gr,[wr]:_r,[xr]:yr,[Li]:vr,[gr]:mr,[_r]:wr,[yr]:xr,[vr]:Li},An=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){let n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){let n=this._listeners;if(n===void 0)return;let s=n[t];if(s!==void 0){let r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let n=e[t.type];if(n!==void 0){t.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,t);t.target=null}}},Ie=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var no=Math.PI/180,Cr=180/Math.PI;function Gn(){let i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ie[i&255]+Ie[i>>8&255]+Ie[i>>16&255]+Ie[i>>24&255]+"-"+Ie[t&255]+Ie[t>>8&255]+"-"+Ie[t>>16&15|64]+Ie[t>>24&255]+"-"+Ie[e&63|128]+Ie[e>>8&255]+"-"+Ie[e>>16&255]+Ie[e>>24&255]+Ie[n&255]+Ie[n>>8&255]+Ie[n>>16&255]+Ie[n>>24&255]).toLowerCase()}function Ht(i,t,e){return Math.max(t,Math.min(e,i))}function hu(i,t){return(i%t+t)%t}function io(i,t,e){return(1-e)*i+e*t}function dn(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function jt(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var ll=class ll{constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Ht(this.x,t.x,e.x),this.y=Ht(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=Ht(this.x,t,e),this.y=Ht(this.y,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ht(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(Ht(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*n-a*s+t.x,this.y=r*s+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};ll.prototype.isVector2=!0;var Bt=ll,mn=class{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,a,o){let c=n[s+0],l=n[s+1],u=n[s+2],f=n[s+3],h=r[a+0],p=r[a+1],w=r[a+2],S=r[a+3];if(f!==S||c!==h||l!==p||u!==w){let g=c*h+l*p+u*w+f*S;g<0&&(h=-h,p=-p,w=-w,S=-S,g=-g);let d=1-o;if(g<.9995){let b=Math.acos(g),T=Math.sin(b);d=Math.sin(d*b)/T,o=Math.sin(o*b)/T,c=c*d+h*o,l=l*d+p*o,u=u*d+w*o,f=f*d+S*o}else{c=c*d+h*o,l=l*d+p*o,u=u*d+w*o,f=f*d+S*o;let b=1/Math.sqrt(c*c+l*l+u*u+f*f);c*=b,l*=b,u*=b,f*=b}}t[e]=c,t[e+1]=l,t[e+2]=u,t[e+3]=f}static multiplyQuaternionsFlat(t,e,n,s,r,a){let o=n[s],c=n[s+1],l=n[s+2],u=n[s+3],f=r[a],h=r[a+1],p=r[a+2],w=r[a+3];return t[e]=o*w+u*f+c*p-l*h,t[e+1]=c*w+u*h+l*f-o*p,t[e+2]=l*w+u*p+o*h-c*f,t[e+3]=u*w-o*f-c*h-l*p,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,s=t._y,r=t._z,a=t._order,o=Math.cos,c=Math.sin,l=o(n/2),u=o(s/2),f=o(r/2),h=c(n/2),p=c(s/2),w=c(r/2);switch(a){case"XYZ":this._x=h*u*f+l*p*w,this._y=l*p*f-h*u*w,this._z=l*u*w+h*p*f,this._w=l*u*f-h*p*w;break;case"YXZ":this._x=h*u*f+l*p*w,this._y=l*p*f-h*u*w,this._z=l*u*w-h*p*f,this._w=l*u*f+h*p*w;break;case"ZXY":this._x=h*u*f-l*p*w,this._y=l*p*f+h*u*w,this._z=l*u*w+h*p*f,this._w=l*u*f-h*p*w;break;case"ZYX":this._x=h*u*f-l*p*w,this._y=l*p*f+h*u*w,this._z=l*u*w-h*p*f,this._w=l*u*f+h*p*w;break;case"YZX":this._x=h*u*f+l*p*w,this._y=l*p*f+h*u*w,this._z=l*u*w-h*p*f,this._w=l*u*f-h*p*w;break;case"XZY":this._x=h*u*f-l*p*w,this._y=l*p*f-h*u*w,this._z=l*u*w+h*p*f,this._w=l*u*f+h*p*w;break;default:Pt("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],s=e[4],r=e[8],a=e[1],o=e[5],c=e[9],l=e[2],u=e[6],f=e[10],h=n+o+f;if(h>0){let p=.5/Math.sqrt(h+1);this._w=.25/p,this._x=(u-c)*p,this._y=(r-l)*p,this._z=(a-s)*p}else if(n>o&&n>f){let p=2*Math.sqrt(1+n-o-f);this._w=(u-c)/p,this._x=.25*p,this._y=(s+a)/p,this._z=(r+l)/p}else if(o>f){let p=2*Math.sqrt(1+o-n-f);this._w=(r-l)/p,this._x=(s+a)/p,this._y=.25*p,this._z=(c+u)/p}else{let p=2*Math.sqrt(1+f-n-o);this._w=(a-s)/p,this._x=(r+l)/p,this._y=(c+u)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Ht(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,s=t._y,r=t._z,a=t._w,o=e._x,c=e._y,l=e._z,u=e._w;return this._x=n*u+a*o+s*l-r*c,this._y=s*u+a*c+r*o-n*l,this._z=r*u+a*l+n*c-s*o,this._w=a*u-n*o-s*c-r*l,this._onChangeCallback(),this}slerp(t,e){let n=t._x,s=t._y,r=t._z,a=t._w,o=this.dot(t);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let c=1-e;if(o<.9995){let l=Math.acos(o),u=Math.sin(l);c=Math.sin(c*l)/u,e=Math.sin(e*l)/u,this._x=this._x*c+n*e,this._y=this._y*c+s*e,this._z=this._z*c+r*e,this._w=this._w*c+a*e,this._onChangeCallback()}else this._x=this._x*c+n*e,this._y=this._y*c+s*e,this._z=this._z*c+r*e,this._w=this._w*c+a*e,this.normalize();return this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},cl=class cl{constructor(t=0,e=0,n=0){this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(ql.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(ql.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=t.elements,a=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(t){let e=this.x,n=this.y,s=this.z,r=t.x,a=t.y,o=t.z,c=t.w,l=2*(a*s-o*n),u=2*(o*e-r*s),f=2*(r*n-a*e);return this.x=e+c*l+a*f-o*u,this.y=n+c*u+o*l-r*f,this.z=s+c*f+r*u-a*l,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Ht(this.x,t.x,e.x),this.y=Ht(this.y,t.y,e.y),this.z=Ht(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=Ht(this.x,t,e),this.y=Ht(this.y,t,e),this.z=Ht(this.z,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ht(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,s=t.y,r=t.z,a=e.x,o=e.y,c=e.z;return this.x=s*c-r*o,this.y=r*a-n*c,this.z=n*o-s*a,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return so.copy(this).projectOnVector(t),this.sub(so)}reflect(t){return this.sub(so.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(Ht(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};cl.prototype.isVector3=!0;var F=cl,so=new F,ql=new mn,hl=class hl{constructor(t,e,n,s,r,a,o,c,l){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,c,l)}set(t,e,n,s,r,a,o,c,l){let u=this.elements;return u[0]=t,u[1]=s,u[2]=o,u[3]=e,u[4]=r,u[5]=c,u[6]=n,u[7]=a,u[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[3],c=n[6],l=n[1],u=n[4],f=n[7],h=n[2],p=n[5],w=n[8],S=s[0],g=s[3],d=s[6],b=s[1],T=s[4],y=s[7],_=s[2],x=s[5],E=s[8];return r[0]=a*S+o*b+c*_,r[3]=a*g+o*T+c*x,r[6]=a*d+o*y+c*E,r[1]=l*S+u*b+f*_,r[4]=l*g+u*T+f*x,r[7]=l*d+u*y+f*E,r[2]=h*S+p*b+w*_,r[5]=h*g+p*T+w*x,r[8]=h*d+p*y+w*E,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],c=t[6],l=t[7],u=t[8];return e*a*u-e*o*l-n*r*u+n*o*c+s*r*l-s*a*c}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],c=t[6],l=t[7],u=t[8],f=u*a-o*l,h=o*c-u*r,p=l*r-a*c,w=e*f+n*h+s*p;if(w===0)return this.set(0,0,0,0,0,0,0,0,0);let S=1/w;return t[0]=f*S,t[1]=(s*l-u*n)*S,t[2]=(o*n-s*a)*S,t[3]=h*S,t[4]=(u*e-s*c)*S,t[5]=(s*r-o*e)*S,t[6]=p*S,t[7]=(n*c-l*e)*S,t[8]=(a*e-n*r)*S,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,a,o){let c=Math.cos(r),l=Math.sin(r);return this.set(n*c,n*l,-n*(c*a+l*o)+a+t,-s*l,s*c,-s*(-l*a+c*o)+o+e,0,0,1),this}scale(t,e){return si("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(ro.makeScale(t,e)),this}rotate(t){return si("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(ro.makeRotation(-t)),this}translate(t,e){return si("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(ro.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}};hl.prototype.isMatrix3=!0;var Lt=hl,ro=new Lt,Zl=new Lt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),jl=new Lt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function uu(){let i={enabled:!0,workingColorSpace:as,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===Kt&&(s.r=Tn(s.r),s.g=Tn(s.g),s.b=Tn(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===Kt&&(s.r=Bi(s.r),s.g=Bi(s.g),s.b=Bi(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===qe?os:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return si("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return si("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[as]:{primaries:t,whitePoint:n,transfer:os,toXYZ:Zl,fromXYZ:jl,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:De},outputColorSpaceConfig:{drawingBufferColorSpace:De}},[De]:{primaries:t,whitePoint:n,transfer:Kt,toXYZ:Zl,fromXYZ:jl,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:De}}}),i}var kt=uu();function Tn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Bi(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var pi,br=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{pi===void 0&&(pi=ls("canvas")),pi.width=t.width,pi.height=t.height;let s=pi.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),n=pi}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=ls("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Tn(r[a]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Tn(e[n]/255)*255):e[n]=Tn(e[n]);return{data:e,width:t.width,height:t.height}}else return Pt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},du=0,Di=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:du++}),this.uuid=Gn(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(ao(s[a].image)):r.push(ao(s[a]))}else r=ao(s);n.url=r}return e||(t.images[this.uuid]=n),n}};function ao(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?br.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Pt("Texture: Unable to serialize Texture."),{})}var fu=0,oo=new F,Ne=class i extends An{constructor(t=i.DEFAULT_IMAGE,e=i.DEFAULT_MAPPING,n=fn,s=fn,r=Me,a=Yn,o=Ke,c=ke,l=i.DEFAULT_ANISOTROPY,u=qe){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:fu++}),this.uuid=Gn(),this.name="",this.source=new Di(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=c,this.offset=new Bt(0,0),this.repeat=new Bt(1,1),this.center=new Bt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Lt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(oo).x}get height(){return this.source.getSize(oo).y}get depth(){return this.source.getSize(oo).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let n=t[e];if(n===void 0){Pt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Pt(`Texture.setValues(): property '${e}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Yo)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Mr:t.x=t.x-Math.floor(t.x);break;case fn:t.x=t.x<0?0:1;break;case Sr:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Mr:t.y=t.y-Math.floor(t.y);break;case fn:t.y=t.y<0?0:1;break;case Sr:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Ne.DEFAULT_IMAGE=null;Ne.DEFAULT_MAPPING=Yo;Ne.DEFAULT_ANISOTROPY=1;var ul=class ul{constructor(t=0,e=0,n=0,s=1){this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*e+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*e+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*e+a[7]*n+a[11]*s+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r,c=t.elements,l=c[0],u=c[4],f=c[8],h=c[1],p=c[5],w=c[9],S=c[2],g=c[6],d=c[10];if(Math.abs(u-h)<.01&&Math.abs(f-S)<.01&&Math.abs(w-g)<.01){if(Math.abs(u+h)<.1&&Math.abs(f+S)<.1&&Math.abs(w+g)<.1&&Math.abs(l+p+d-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let T=(l+1)/2,y=(p+1)/2,_=(d+1)/2,x=(u+h)/4,E=(f+S)/4,A=(w+g)/4;return T>y&&T>_?T<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(T),s=x/n,r=E/n):y>_?y<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(y),n=x/s,r=A/s):_<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(_),n=E/r,s=A/r),this.set(n,s,r,e),this}let b=Math.sqrt((g-w)*(g-w)+(f-S)*(f-S)+(h-u)*(h-u));return Math.abs(b)<.001&&(b=1),this.x=(g-w)/b,this.y=(f-S)/b,this.z=(h-u)/b,this.w=Math.acos((l+p+d-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Ht(this.x,t.x,e.x),this.y=Ht(this.y,t.y,e.y),this.z=Ht(this.z,t.z,e.z),this.w=Ht(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=Ht(this.x,t,e),this.y=Ht(this.y,t,e),this.z=Ht(this.z,t,e),this.w=Ht(this.w,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ht(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};ul.prototype.isVector4=!0;var le=ul,Tr=class extends An{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Me,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new le(0,0,t,e),this.scissorTest=!1,this.viewport=new le(0,0,t,e),this.textures=[];let s={width:t,height:e,depth:n.depth},r=new Ne(s),a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:Me,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let s=Object.assign({},t.textures[e].image);this.textures[e].source=new Di(s)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Qe=class extends Tr{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},cs=class extends Ne{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=_e,this.minFilter=_e,this.wrapR=fn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var Ir=class extends Ne{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=_e,this.minFilter=_e,this.wrapR=fn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var jr=class jr{constructor(t,e,n,s,r,a,o,c,l,u,f,h,p,w,S,g){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,c,l,u,f,h,p,w,S,g)}set(t,e,n,s,r,a,o,c,l,u,f,h,p,w,S,g){let d=this.elements;return d[0]=t,d[4]=e,d[8]=n,d[12]=s,d[1]=r,d[5]=a,d[9]=o,d[13]=c,d[2]=l,d[6]=u,d[10]=f,d[14]=h,d[3]=p,d[7]=w,d[11]=S,d[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new jr().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),n.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,n=t.elements,s=1/Ai.setFromMatrixColumn(t,0).length(),r=1/Ai.setFromMatrixColumn(t,1).length(),a=1/Ai.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*a,e[9]=n[9]*a,e[10]=n[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,s=t.y,r=t.z,a=Math.cos(n),o=Math.sin(n),c=Math.cos(s),l=Math.sin(s),u=Math.cos(r),f=Math.sin(r);if(t.order==="XYZ"){let h=a*u,p=a*f,w=o*u,S=o*f;e[0]=c*u,e[4]=-c*f,e[8]=l,e[1]=p+w*l,e[5]=h-S*l,e[9]=-o*c,e[2]=S-h*l,e[6]=w+p*l,e[10]=a*c}else if(t.order==="YXZ"){let h=c*u,p=c*f,w=l*u,S=l*f;e[0]=h+S*o,e[4]=w*o-p,e[8]=a*l,e[1]=a*f,e[5]=a*u,e[9]=-o,e[2]=p*o-w,e[6]=S+h*o,e[10]=a*c}else if(t.order==="ZXY"){let h=c*u,p=c*f,w=l*u,S=l*f;e[0]=h-S*o,e[4]=-a*f,e[8]=w+p*o,e[1]=p+w*o,e[5]=a*u,e[9]=S-h*o,e[2]=-a*l,e[6]=o,e[10]=a*c}else if(t.order==="ZYX"){let h=a*u,p=a*f,w=o*u,S=o*f;e[0]=c*u,e[4]=w*l-p,e[8]=h*l+S,e[1]=c*f,e[5]=S*l+h,e[9]=p*l-w,e[2]=-l,e[6]=o*c,e[10]=a*c}else if(t.order==="YZX"){let h=a*c,p=a*l,w=o*c,S=o*l;e[0]=c*u,e[4]=S-h*f,e[8]=w*f+p,e[1]=f,e[5]=a*u,e[9]=-o*u,e[2]=-l*u,e[6]=p*f+w,e[10]=h-S*f}else if(t.order==="XZY"){let h=a*c,p=a*l,w=o*c,S=o*l;e[0]=c*u,e[4]=-f,e[8]=l*u,e[1]=h*f+S,e[5]=a*u,e[9]=p*f-w,e[2]=w*f-p,e[6]=o*u,e[10]=S*f+h}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(pu,t,Au)}lookAt(t,e,n){let s=this.elements;return He.subVectors(t,e),He.lengthSq()===0&&(He.z=1),He.normalize(),Un.crossVectors(n,He),Un.lengthSq()===0&&(Math.abs(n.z)===1?He.x+=1e-4:He.z+=1e-4,He.normalize(),Un.crossVectors(n,He)),Un.normalize(),Js.crossVectors(He,Un),s[0]=Un.x,s[4]=Js.x,s[8]=He.x,s[1]=Un.y,s[5]=Js.y,s[9]=He.y,s[2]=Un.z,s[6]=Js.z,s[10]=He.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[4],c=n[8],l=n[12],u=n[1],f=n[5],h=n[9],p=n[13],w=n[2],S=n[6],g=n[10],d=n[14],b=n[3],T=n[7],y=n[11],_=n[15],x=s[0],E=s[4],A=s[8],M=s[12],I=s[1],R=s[5],N=s[9],k=s[13],B=s[2],H=s[6],K=s[10],W=s[14],nt=s[3],J=s[7],j=s[11],tt=s[15];return r[0]=a*x+o*I+c*B+l*nt,r[4]=a*E+o*R+c*H+l*J,r[8]=a*A+o*N+c*K+l*j,r[12]=a*M+o*k+c*W+l*tt,r[1]=u*x+f*I+h*B+p*nt,r[5]=u*E+f*R+h*H+p*J,r[9]=u*A+f*N+h*K+p*j,r[13]=u*M+f*k+h*W+p*tt,r[2]=w*x+S*I+g*B+d*nt,r[6]=w*E+S*R+g*H+d*J,r[10]=w*A+S*N+g*K+d*j,r[14]=w*M+S*k+g*W+d*tt,r[3]=b*x+T*I+y*B+_*nt,r[7]=b*E+T*R+y*H+_*J,r[11]=b*A+T*N+y*K+_*j,r[15]=b*M+T*k+y*W+_*tt,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],a=t[1],o=t[5],c=t[9],l=t[13],u=t[2],f=t[6],h=t[10],p=t[14],w=t[3],S=t[7],g=t[11],d=t[15],b=c*p-l*h,T=o*p-l*f,y=o*h-c*f,_=a*p-l*u,x=a*h-c*u,E=a*f-o*u;return e*(S*b-g*T+d*y)-n*(w*b-g*_+d*x)+s*(w*T-S*_+d*E)-r*(w*y-S*x+g*E)}determinantAffine(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[1],a=t[5],o=t[9],c=t[2],l=t[6],u=t[10];return e*(a*u-o*l)-n*(r*u-o*c)+s*(r*l-a*c)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],c=t[6],l=t[7],u=t[8],f=t[9],h=t[10],p=t[11],w=t[12],S=t[13],g=t[14],d=t[15],b=e*o-n*a,T=e*c-s*a,y=e*l-r*a,_=n*c-s*o,x=n*l-r*o,E=s*l-r*c,A=u*S-f*w,M=u*g-h*w,I=u*d-p*w,R=f*g-h*S,N=f*d-p*S,k=h*d-p*g,B=b*k-T*N+y*R+_*I-x*M+E*A;if(B===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let H=1/B;return t[0]=(o*k-c*N+l*R)*H,t[1]=(s*N-n*k-r*R)*H,t[2]=(S*E-g*x+d*_)*H,t[3]=(h*x-f*E-p*_)*H,t[4]=(c*I-a*k-l*M)*H,t[5]=(e*k-s*I+r*M)*H,t[6]=(g*y-w*E-d*T)*H,t[7]=(u*E-h*y+p*T)*H,t[8]=(a*N-o*I+l*A)*H,t[9]=(n*I-e*N-r*A)*H,t[10]=(w*x-S*y+d*b)*H,t[11]=(f*y-u*x-p*b)*H,t[12]=(o*M-a*R-c*A)*H,t[13]=(e*R-n*M+s*A)*H,t[14]=(S*T-w*_-g*b)*H,t[15]=(u*_-f*T+h*b)*H,this}scale(t){let e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),s=Math.sin(e),r=1-n,a=t.x,o=t.y,c=t.z,l=r*a,u=r*o;return this.set(l*a+n,l*o-s*c,l*c+s*o,0,l*o+s*c,u*o+n,u*c-s*a,0,l*c-s*o,u*c+s*a,r*c*c+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,a){return this.set(1,n,r,0,t,1,a,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){let s=this.elements,r=e._x,a=e._y,o=e._z,c=e._w,l=r+r,u=a+a,f=o+o,h=r*l,p=r*u,w=r*f,S=a*u,g=a*f,d=o*f,b=c*l,T=c*u,y=c*f,_=n.x,x=n.y,E=n.z;return s[0]=(1-(S+d))*_,s[1]=(p+y)*_,s[2]=(w-T)*_,s[3]=0,s[4]=(p-y)*x,s[5]=(1-(h+d))*x,s[6]=(g+b)*x,s[7]=0,s[8]=(w+T)*E,s[9]=(g-b)*E,s[10]=(1-(h+S))*E,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){let s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),e.identity(),this;let a=Ai.set(s[0],s[1],s[2]).length(),o=Ai.set(s[4],s[5],s[6]).length(),c=Ai.set(s[8],s[9],s[10]).length();r<0&&(a=-a),$e.copy(this);let l=1/a,u=1/o,f=1/c;return $e.elements[0]*=l,$e.elements[1]*=l,$e.elements[2]*=l,$e.elements[4]*=u,$e.elements[5]*=u,$e.elements[6]*=u,$e.elements[8]*=f,$e.elements[9]*=f,$e.elements[10]*=f,e.setFromRotationMatrix($e),n.x=a,n.y=o,n.z=c,this}makePerspective(t,e,n,s,r,a,o=sn,c=!1){let l=this.elements,u=2*r/(e-t),f=2*r/(n-s),h=(e+t)/(e-t),p=(n+s)/(n-s),w,S;if(c)w=r/(a-r),S=a*r/(a-r);else if(o===sn)w=-(a+r)/(a-r),S=-2*a*r/(a-r);else if(o===Ri)w=-a/(a-r),S=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=u,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=f,l[9]=p,l[13]=0,l[2]=0,l[6]=0,l[10]=w,l[14]=S,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,s,r,a,o=sn,c=!1){let l=this.elements,u=2/(e-t),f=2/(n-s),h=-(e+t)/(e-t),p=-(n+s)/(n-s),w,S;if(c)w=1/(a-r),S=a/(a-r);else if(o===sn)w=-2/(a-r),S=-(a+r)/(a-r);else if(o===Ri)w=-1/(a-r),S=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=u,l[4]=0,l[8]=0,l[12]=h,l[1]=0,l[5]=f,l[9]=0,l[13]=p,l[2]=0,l[6]=0,l[10]=w,l[14]=S,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}};jr.prototype.isMatrix4=!0;var ae=jr,Ai=new F,$e=new ae,pu=new F(0,0,0),Au=new F(1,1,1),Un=new F,Js=new F,He=new F,$l=new ae,tc=new mn,In=class i{constructor(t=0,e=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let s=t.elements,r=s[0],a=s[4],o=s[8],c=s[1],l=s[5],u=s[9],f=s[2],h=s[6],p=s[10];switch(e){case"XYZ":this._y=Math.asin(Ht(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,p),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(h,l),this._z=0);break;case"YXZ":this._x=Math.asin(-Ht(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-f,r),this._z=0);break;case"ZXY":this._x=Math.asin(Ht(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-f,p),this._z=Math.atan2(-a,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-Ht(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(h,p),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-a,l));break;case"YZX":this._z=Math.asin(Ht(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-u,l),this._y=Math.atan2(-f,r)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-Ht(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(h,l),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,p),this._y=0);break;default:Pt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return $l.makeRotationFromQuaternion(t),this.setFromRotationMatrix($l,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return tc.setFromEuler(this),this.setFromQuaternion(tc,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};In.DEFAULT_ORDER="XYZ";var hs=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},mu=0,ec=new F,mi=new mn,yn=new ae,Vs=new F,ji=new F,gu=new F,wu=new mn,nc=new F(1,0,0),ic=new F(0,1,0),sc=new F(0,0,1),rc={type:"added"},xu={type:"removed"},gi={type:"childadded",child:null},lo={type:"childremoved",child:null},Se=class i extends An{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:mu++}),this.uuid=Gn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let t=new F,e=new In,n=new mn,s=new F(1,1,1);function r(){n.setFromEuler(e,!1)}function a(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new ae},normalMatrix:{value:new Lt}}),this.matrix=new ae,this.matrixWorld=new ae,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new hs,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return mi.setFromAxisAngle(t,e),this.quaternion.multiply(mi),this}rotateOnWorldAxis(t,e){return mi.setFromAxisAngle(t,e),this.quaternion.premultiply(mi),this}rotateX(t){return this.rotateOnAxis(nc,t)}rotateY(t){return this.rotateOnAxis(ic,t)}rotateZ(t){return this.rotateOnAxis(sc,t)}translateOnAxis(t,e){return ec.copy(t).applyQuaternion(this.quaternion),this.position.add(ec.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(nc,t)}translateY(t){return this.translateOnAxis(ic,t)}translateZ(t){return this.translateOnAxis(sc,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(yn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?Vs.copy(t):Vs.set(t,e,n);let s=this.parent;this.updateWorldMatrix(!0,!1),ji.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?yn.lookAt(ji,Vs,this.up):yn.lookAt(Vs,ji,this.up),this.quaternion.setFromRotationMatrix(yn),s&&(yn.extractRotation(s.matrixWorld),mi.setFromRotationMatrix(yn),this.quaternion.premultiply(mi.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(It("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(rc),gi.child=t,this.dispatchEvent(gi),gi.child=null):It("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(xu),lo.child=t,this.dispatchEvent(lo),lo.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),yn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),yn.multiply(t.parent.matrixWorld)),t.applyMatrix4(yn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(rc),gi.child=t,this.dispatchEvent(gi),gi.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ji,t,gu),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ji,wu,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,n=t.y,s=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*n-r[8]*s,r[13]+=n-r[1]*e-r[5]*n-r[9]*s,r[14]+=s-r[2]*e-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e,n=!1){let s=this.parent;if(t===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),e===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(t)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let c=o.shapes;if(Array.isArray(c))for(let l=0,u=c.length;l<u;l++){let f=c[l];r(t.shapes,f)}else r(t.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let c=0,l=this.material.length;c<l;c++)o.push(r(t.materials,this.material[c]));s.material=o}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let c=this.animations[o];s.animations.push(r(t.animations,c))}}if(e){let o=a(t.geometries),c=a(t.materials),l=a(t.textures),u=a(t.images),f=a(t.shapes),h=a(t.skeletons),p=a(t.animations),w=a(t.nodes);o.length>0&&(n.geometries=o),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),u.length>0&&(n.images=u),f.length>0&&(n.shapes=f),h.length>0&&(n.skeletons=h),p.length>0&&(n.animations=p),w.length>0&&(n.nodes=w)}return n.object=s,n;function a(o){let c=[];for(let l in o){let u=o[l];delete u.metadata,c.push(u)}return c}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let s=t.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Se.DEFAULT_UP=new F(0,1,0);Se.DEFAULT_MATRIX_AUTO_UPDATE=!0;Se.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Ge=class extends Se{constructor(){super(),this.isGroup=!0,this.type="Group"}},vu={type:"move"},Fi=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ge,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ge,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new F,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new F),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ge,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new F,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new F,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,a=null,o=this._targetRay,c=this._grip,l=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(l&&t.hand){a=!0;for(let S of t.hand.values()){let g=e.getJointPose(S,n),d=this._getHandJoint(l,S);g!==null&&(d.matrix.fromArray(g.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=g.radius),d.visible=g!==null}let u=l.joints["index-finger-tip"],f=l.joints["thumb-tip"],h=u.position.distanceTo(f.position),p=.02,w=.005;l.inputState.pinching&&h>p+w?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!l.inputState.pinching&&h<=p-w&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else c!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:t,target:this})));o!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(vu)))}return o!==null&&(o.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new Ge;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}},th={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Dn={h:0,s:0,l:0},Ws={h:0,s:0,l:0};function co(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}var yt=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=De){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,kt.colorSpaceToWorking(this,e),this}setRGB(t,e,n,s=kt.workingColorSpace){return this.r=t,this.g=e,this.b=n,kt.colorSpaceToWorking(this,s),this}setHSL(t,e,n,s=kt.workingColorSpace){if(t=hu(t,1),e=Ht(e,0,1),n=Ht(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,a=2*n-r;this.r=co(a,r,t+1/3),this.g=co(a,r,t),this.b=co(a,r,t-1/3)}return kt.colorSpaceToWorking(this,s),this}setStyle(t,e=De){function n(r){r!==void 0&&parseFloat(r)<1&&Pt("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:Pt("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);Pt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=De){let n=th[t.toLowerCase()];return n!==void 0?this.setHex(n,e):Pt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Tn(t.r),this.g=Tn(t.g),this.b=Tn(t.b),this}copyLinearToSRGB(t){return this.r=Bi(t.r),this.g=Bi(t.g),this.b=Bi(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=De){return kt.workingToColorSpace(Pe.copy(this),t),Math.round(Ht(Pe.r*255,0,255))*65536+Math.round(Ht(Pe.g*255,0,255))*256+Math.round(Ht(Pe.b*255,0,255))}getHexString(t=De){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=kt.workingColorSpace){kt.workingToColorSpace(Pe.copy(this),e);let n=Pe.r,s=Pe.g,r=Pe.b,a=Math.max(n,s,r),o=Math.min(n,s,r),c,l,u=(o+a)/2;if(o===a)c=0,l=0;else{let f=a-o;switch(l=u<=.5?f/(a+o):f/(2-a-o),a){case n:c=(s-r)/f+(s<r?6:0);break;case s:c=(r-n)/f+2;break;case r:c=(n-s)/f+4;break}c/=6}return t.h=c,t.s=l,t.l=u,t}getRGB(t,e=kt.workingColorSpace){return kt.workingToColorSpace(Pe.copy(this),e),t.r=Pe.r,t.g=Pe.g,t.b=Pe.b,t}getStyle(t=De){kt.workingToColorSpace(Pe.copy(this),t);let e=Pe.r,n=Pe.g,s=Pe.b;return t!==De?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(Dn),this.setHSL(Dn.h+t,Dn.s+e,Dn.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(Dn),t.getHSL(Ws);let n=io(Dn.h,Ws.h,e),s=io(Dn.s,Ws.s,e),r=io(Dn.l,Ws.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Pe=new yt;yt.NAMES=th;var ri=class extends Se{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new In,this.environmentIntensity=1,this.environmentRotation=new In,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}},tn=new F,Mn=new F,ho=new F,Sn=new F,wi=new F,xi=new F,ac=new F,uo=new F,fo=new F,po=new F,Ao=new le,mo=new le,go=new le,bn=class i{constructor(t=new F,e=new F,n=new F){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),tn.subVectors(t,e),s.cross(tn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){tn.subVectors(s,e),Mn.subVectors(n,e),ho.subVectors(t,e);let a=tn.dot(tn),o=tn.dot(Mn),c=tn.dot(ho),l=Mn.dot(Mn),u=Mn.dot(ho),f=a*l-o*o;if(f===0)return r.set(0,0,0),null;let h=1/f,p=(l*c-o*u)*h,w=(a*u-o*c)*h;return r.set(1-p-w,w,p)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,Sn)===null?!1:Sn.x>=0&&Sn.y>=0&&Sn.x+Sn.y<=1}static getInterpolation(t,e,n,s,r,a,o,c){return this.getBarycoord(t,e,n,s,Sn)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,Sn.x),c.addScaledVector(a,Sn.y),c.addScaledVector(o,Sn.z),c)}static getInterpolatedAttribute(t,e,n,s,r,a){return Ao.setScalar(0),mo.setScalar(0),go.setScalar(0),Ao.fromBufferAttribute(t,e),mo.fromBufferAttribute(t,n),go.fromBufferAttribute(t,s),a.setScalar(0),a.addScaledVector(Ao,r.x),a.addScaledVector(mo,r.y),a.addScaledVector(go,r.z),a}static isFrontFacing(t,e,n,s){return tn.subVectors(n,e),Mn.subVectors(t,e),tn.cross(Mn).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return tn.subVectors(this.c,this.b),Mn.subVectors(this.a,this.b),tn.cross(Mn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return i.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return i.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return i.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return i.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return i.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,s=this.b,r=this.c,a,o;wi.subVectors(s,n),xi.subVectors(r,n),uo.subVectors(t,n);let c=wi.dot(uo),l=xi.dot(uo);if(c<=0&&l<=0)return e.copy(n);fo.subVectors(t,s);let u=wi.dot(fo),f=xi.dot(fo);if(u>=0&&f<=u)return e.copy(s);let h=c*f-u*l;if(h<=0&&c>=0&&u<=0)return a=c/(c-u),e.copy(n).addScaledVector(wi,a);po.subVectors(t,r);let p=wi.dot(po),w=xi.dot(po);if(w>=0&&p<=w)return e.copy(r);let S=p*l-c*w;if(S<=0&&l>=0&&w<=0)return o=l/(l-w),e.copy(n).addScaledVector(xi,o);let g=u*w-p*f;if(g<=0&&f-u>=0&&p-w>=0)return ac.subVectors(r,s),o=(f-u)/(f-u+(p-w)),e.copy(s).addScaledVector(ac,o);let d=1/(g+S+h);return a=S*d,o=h*d,e.copy(n).addScaledVector(wi,a).addScaledVector(xi,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},Qn=class{constructor(t=new F(1/0,1/0,1/0),e=new F(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(en.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(en.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=en.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,en):en.fromBufferAttribute(r,a),en.applyMatrix4(t.matrixWorld),this.expandByPoint(en);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Xs.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Xs.copy(n.boundingBox)),Xs.applyMatrix4(t.matrixWorld),this.union(Xs)}let s=t.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,en),en.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter($i),Ys.subVectors(this.max,$i),vi.subVectors(t.a,$i),_i.subVectors(t.b,$i),yi.subVectors(t.c,$i),Fn.subVectors(_i,vi),Nn.subVectors(yi,_i),ti.subVectors(vi,yi);let e=[0,-Fn.z,Fn.y,0,-Nn.z,Nn.y,0,-ti.z,ti.y,Fn.z,0,-Fn.x,Nn.z,0,-Nn.x,ti.z,0,-ti.x,-Fn.y,Fn.x,0,-Nn.y,Nn.x,0,-ti.y,ti.x,0];return!wo(e,vi,_i,yi,Ys)||(e=[1,0,0,0,1,0,0,0,1],!wo(e,vi,_i,yi,Ys))?!1:(Ks.crossVectors(Fn,Nn),e=[Ks.x,Ks.y,Ks.z],wo(e,vi,_i,yi,Ys))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,en).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(en).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(En[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),En[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),En[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),En[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),En[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),En[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),En[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),En[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(En),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},En=[new F,new F,new F,new F,new F,new F,new F,new F],en=new F,Xs=new Qn,vi=new F,_i=new F,yi=new F,Fn=new F,Nn=new F,ti=new F,$i=new F,Ys=new F,Ks=new F,ei=new F;function wo(i,t,e,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){ei.fromArray(i,r);let o=s.x*Math.abs(ei.x)+s.y*Math.abs(ei.y)+s.z*Math.abs(ei.z),c=t.dot(ei),l=e.dot(ei),u=n.dot(ei);if(Math.max(-Math.max(c,l,u),Math.min(c,l,u))>o)return!1}return!0}var Ae=new F,qs=new Bt,_u=0,he=class extends An{constructor(t,e,n=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:_u++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=nl,this.updateRanges=[],this.gpuType=on,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)qs.fromBufferAttribute(this,e),qs.applyMatrix3(t),this.setXY(e,qs.x,qs.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Ae.fromBufferAttribute(this,e),Ae.applyMatrix3(t),this.setXYZ(e,Ae.x,Ae.y,Ae.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Ae.fromBufferAttribute(this,e),Ae.applyMatrix4(t),this.setXYZ(e,Ae.x,Ae.y,Ae.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Ae.fromBufferAttribute(this,e),Ae.applyNormalMatrix(t),this.setXYZ(e,Ae.x,Ae.y,Ae.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Ae.fromBufferAttribute(this,e),Ae.transformDirection(t),this.setXYZ(e,Ae.x,Ae.y,Ae.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=dn(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=jt(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=dn(e,this.array)),e}setX(t,e){return this.normalized&&(e=jt(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=dn(e,this.array)),e}setY(t,e){return this.normalized&&(e=jt(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=dn(e,this.array)),e}setZ(t,e){return this.normalized&&(e=jt(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=dn(e,this.array)),e}setW(t,e){return this.normalized&&(e=jt(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=jt(e,this.array),n=jt(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=jt(e,this.array),n=jt(n,this.array),s=jt(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=jt(e,this.array),n=jt(n,this.array),s=jt(s,this.array),r=jt(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}};var us=class extends he{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var ds=class extends he{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var Fe=class extends he{constructor(t,e,n){super(new Float32Array(t),e,n)}},yu=new Qn,ts=new F,xo=new F,ai=class{constructor(t=new F,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):yu.setFromPoints(t).getCenter(n);let s=0;for(let r=0,a=t.length;r<a;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;ts.subVectors(t,this.center);let e=ts.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(ts,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(xo.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(ts.copy(t.center).add(xo)),this.expandByPoint(ts.copy(t.center).sub(xo))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},Mu=0,Ye=new ae,vo=new Se,Mi=new F,ze=new Qn,es=new Qn,ve=new F,Ee=class i extends An{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Mu++}),this.uuid=Gn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(lu(t)?ds:us)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Lt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return Ye.makeRotationFromQuaternion(t),this.applyMatrix4(Ye),this}rotateX(t){return Ye.makeRotationX(t),this.applyMatrix4(Ye),this}rotateY(t){return Ye.makeRotationY(t),this.applyMatrix4(Ye),this}rotateZ(t){return Ye.makeRotationZ(t),this.applyMatrix4(Ye),this}translate(t,e,n){return Ye.makeTranslation(t,e,n),this.applyMatrix4(Ye),this}scale(t,e,n){return Ye.makeScale(t,e,n),this.applyMatrix4(Ye),this}lookAt(t){return vo.lookAt(t),vo.updateMatrix(),this.applyMatrix4(vo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Mi).negate(),this.translate(Mi.x,Mi.y,Mi.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let n=[];for(let s=0,r=t.length;s<r;s++){let a=t[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Fe(n,3))}else{let n=Math.min(t.length,e.count);for(let s=0;s<n;s++){let r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}t.length>e.count&&Pt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Qn);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){It("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new F(-1/0,-1/0,-1/0),new F(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){let r=e[n];ze.setFromBufferAttribute(r),this.morphTargetsRelative?(ve.addVectors(this.boundingBox.min,ze.min),this.boundingBox.expandByPoint(ve),ve.addVectors(this.boundingBox.max,ze.max),this.boundingBox.expandByPoint(ve)):(this.boundingBox.expandByPoint(ze.min),this.boundingBox.expandByPoint(ze.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&It('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ai);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){It("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new F,1/0);return}if(t){let n=this.boundingSphere.center;if(ze.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){let o=e[r];es.setFromBufferAttribute(o),this.morphTargetsRelative?(ve.addVectors(ze.min,es.min),ze.expandByPoint(ve),ve.addVectors(ze.max,es.max),ze.expandByPoint(ve)):(ze.expandByPoint(es.min),ze.expandByPoint(es.max))}ze.getCenter(n);let s=0;for(let r=0,a=t.count;r<a;r++)ve.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(ve));if(e)for(let r=0,a=e.length;r<a;r++){let o=e[r],c=this.morphTargetsRelative;for(let l=0,u=o.count;l<u;l++)ve.fromBufferAttribute(o,l),c&&(Mi.fromBufferAttribute(t,l),ve.add(Mi)),s=Math.max(s,n.distanceToSquared(ve))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&It('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){It("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,s=e.normal,r=e.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new he(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));let o=[],c=[];for(let A=0;A<n.count;A++)o[A]=new F,c[A]=new F;let l=new F,u=new F,f=new F,h=new Bt,p=new Bt,w=new Bt,S=new F,g=new F;function d(A,M,I){l.fromBufferAttribute(n,A),u.fromBufferAttribute(n,M),f.fromBufferAttribute(n,I),h.fromBufferAttribute(r,A),p.fromBufferAttribute(r,M),w.fromBufferAttribute(r,I),u.sub(l),f.sub(l),p.sub(h),w.sub(h);let R=1/(p.x*w.y-w.x*p.y);isFinite(R)&&(S.copy(u).multiplyScalar(w.y).addScaledVector(f,-p.y).multiplyScalar(R),g.copy(f).multiplyScalar(p.x).addScaledVector(u,-w.x).multiplyScalar(R),o[A].add(S),o[M].add(S),o[I].add(S),c[A].add(g),c[M].add(g),c[I].add(g))}let b=this.groups;b.length===0&&(b=[{start:0,count:t.count}]);for(let A=0,M=b.length;A<M;++A){let I=b[A],R=I.start,N=I.count;for(let k=R,B=R+N;k<B;k+=3)d(t.getX(k+0),t.getX(k+1),t.getX(k+2))}let T=new F,y=new F,_=new F,x=new F;function E(A){_.fromBufferAttribute(s,A),x.copy(_);let M=o[A];T.copy(M),T.sub(_.multiplyScalar(_.dot(M))).normalize(),y.crossVectors(x,M);let R=y.dot(c[A])<0?-1:1;a.setXYZW(A,T.x,T.y,T.z,R)}for(let A=0,M=b.length;A<M;++A){let I=b[A],R=I.start,N=I.count;for(let k=R,B=R+N;k<B;k+=3)E(t.getX(k+0)),E(t.getX(k+1)),E(t.getX(k+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==e.count)n=new he(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let h=0,p=n.count;h<p;h++)n.setXYZ(h,0,0,0);let s=new F,r=new F,a=new F,o=new F,c=new F,l=new F,u=new F,f=new F;if(t)for(let h=0,p=t.count;h<p;h+=3){let w=t.getX(h+0),S=t.getX(h+1),g=t.getX(h+2);s.fromBufferAttribute(e,w),r.fromBufferAttribute(e,S),a.fromBufferAttribute(e,g),u.subVectors(a,r),f.subVectors(s,r),u.cross(f),o.fromBufferAttribute(n,w),c.fromBufferAttribute(n,S),l.fromBufferAttribute(n,g),o.add(u),c.add(u),l.add(u),n.setXYZ(w,o.x,o.y,o.z),n.setXYZ(S,c.x,c.y,c.z),n.setXYZ(g,l.x,l.y,l.z)}else for(let h=0,p=e.count;h<p;h+=3)s.fromBufferAttribute(e,h+0),r.fromBufferAttribute(e,h+1),a.fromBufferAttribute(e,h+2),u.subVectors(a,r),f.subVectors(s,r),u.cross(f),n.setXYZ(h+0,u.x,u.y,u.z),n.setXYZ(h+1,u.x,u.y,u.z),n.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)ve.fromBufferAttribute(t,e),ve.normalize(),t.setXYZ(e,ve.x,ve.y,ve.z)}toNonIndexed(){function t(o,c){let l=o.array,u=o.itemSize,f=o.normalized,h=new l.constructor(c.length*u),p=0,w=0;for(let S=0,g=c.length;S<g;S++){o.isInterleavedBufferAttribute?p=c[S]*o.data.stride+o.offset:p=c[S]*u;for(let d=0;d<u;d++)h[w++]=l[p++]}return new he(h,u,f)}if(this.index===null)return Pt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new i,n=this.index.array,s=this.attributes;for(let o in s){let c=s[o],l=t(c,n);e.setAttribute(o,l)}let r=this.morphAttributes;for(let o in r){let c=[],l=r[o];for(let u=0,f=l.length;u<f;u++){let h=l[u],p=t(h,n);c.push(p)}e.morphAttributes[o]=c}e.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,c=a.length;o<c;o++){let l=a[o];e.addGroup(l.start,l.count,l.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(t[l]=c[l]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let c in n){let l=n[c];t.data.attributes[c]=l.toJSON(t.data)}let s={},r=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],u=[];for(let f=0,h=l.length;f<h;f++){let p=l[f];u.push(p.toJSON(t.data))}u.length>0&&(s[c]=u,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone());let s=t.attributes;for(let l in s){let u=s[l];this.setAttribute(l,u.clone(e))}let r=t.morphAttributes;for(let l in r){let u=[],f=r[l];for(let h=0,p=f.length;h<p;h++)u.push(f[h].clone(e));this.morphAttributes[l]=u}this.morphTargetsRelative=t.morphTargetsRelative;let a=t.groups;for(let l=0,u=a.length;l<u;l++){let f=a[l];this.addGroup(f.start,f.count,f.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let c=t.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},Pr=class{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=nl,this.updateRanges=[],this.version=0,this.uuid=Gn()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,n){t*=this.stride,n*=e.stride;for(let s=0,r=this.stride;s<r;s++)this.array[t+s]=e.array[n+s];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Gn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(e,this.stride);return n.setUsage(this.usage),n}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Gn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let e={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return e.usage=this.usage,e}},Ue=new F,fs=class i{constructor(t,e,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,n=this.data.count;e<n;e++)Ue.fromBufferAttribute(this,e),Ue.applyMatrix4(t),this.setXYZ(e,Ue.x,Ue.y,Ue.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Ue.fromBufferAttribute(this,e),Ue.applyNormalMatrix(t),this.setXYZ(e,Ue.x,Ue.y,Ue.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Ue.fromBufferAttribute(this,e),Ue.transformDirection(t),this.setXYZ(e,Ue.x,Ue.y,Ue.z);return this}getComponent(t,e){let n=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(n=dn(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=jt(n,this.array)),this.data.array[t*this.data.stride+this.offset+e]=n,this}setX(t,e){return this.normalized&&(e=jt(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=jt(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=jt(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=jt(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=dn(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=dn(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=dn(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=dn(e,this.array)),e}setXY(t,e,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=jt(e,this.array),n=jt(n,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this}setXYZ(t,e,n,s){return t=t*this.data.stride+this.offset,this.normalized&&(e=jt(e,this.array),n=jt(n,this.array),s=jt(s,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=jt(e,this.array),n=jt(n,this.array),s=jt(s,this.array),r=jt(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this.data.array[t+3]=r,this}clone(t){if(t===void 0){Bo("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return new he(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new i(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){Bo("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},_o=new F,Su=new F,Eu=new Lt,nn=class{constructor(t=new F(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let s=_o.subVectors(n,e).cross(Su.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,n=!0){let s=t.delta(_o),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let a=-(t.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:e.copy(t.start).addScaledVector(s,a)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||Eu.getNormalMatrix(t),s=this.coplanarPoint(_o).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},Cu=0,gn=class extends An{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Cu++}),this.uuid=Gn(),this.name="",this.type="Material",this.blending=Ji,this.side=wn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Ss,this.blendDst=Qo,this.blendEquation=Pn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new yt(0,0,0),this.blendAlpha=0,this.depthFunc=Li,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=zc,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ar,this.stencilZFail=Ar,this.stencilZPass=Ar,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){Pt(`Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Pt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let c=r[o];delete c.metadata,a.push(c)}return a}if(e){let r=s(t.textures),a=s(t.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new yt().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(n=>new nn().fromJSON(n))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let n=t.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Bt().fromArray(n)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Bt().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}},Ni=class extends gn{constructor(t){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new yt(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},Si,ns=new F,Ei=new F,Ci=new F,bi=new Bt,is=new Bt,eh=new ae,Zs=new F,ss=new F,js=new F,oc=new Bt,yo=new Bt,lc=new Bt,ps=class extends Se{constructor(t=new Ni){if(super(),this.isSprite=!0,this.type="Sprite",Si===void 0){Si=new Ee;let e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Pr(e,5);Si.setIndex([0,1,2,0,2,3]),Si.setAttribute("position",new fs(n,3,0,!1)),Si.setAttribute("uv",new fs(n,2,3,!1))}this.geometry=Si,this.material=t,this.center=new Bt(.5,.5),this.count=1}intersectsFrustum(t){return t.intersectsSprite(this)}raycast(t,e){t.camera===null&&It('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Ei.setFromMatrixScale(this.matrixWorld),eh.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),Ci.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Ei.multiplyScalar(-Ci.z);let n=this.material.rotation,s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));let a=this.center;$s(Zs.set(-.5,-.5,0),Ci,a,Ei,s,r),$s(ss.set(.5,-.5,0),Ci,a,Ei,s,r),$s(js.set(.5,.5,0),Ci,a,Ei,s,r),oc.set(0,0),yo.set(1,0),lc.set(1,1);let o=t.ray.intersectTriangle(Zs,ss,js,!1,ns);if(o===null&&($s(ss.set(-.5,.5,0),Ci,a,Ei,s,r),yo.set(0,1),o=t.ray.intersectTriangle(Zs,js,ss,!1,ns),o===null))return;let c=t.ray.origin.distanceTo(ns);c<t.near||c>t.far||e.push({distance:c,point:ns.clone(),uv:bn.getInterpolation(ns,Zs,ss,js,oc,yo,lc,new Bt),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}};function $s(i,t,e,n,s,r){bi.subVectors(i,e).addScalar(.5).multiply(n),s!==void 0?(is.x=r*bi.x-s*bi.y,is.y=s*bi.x+r*bi.y):is.copy(bi),i.copy(t),i.x+=is.x,i.y+=is.y,i.applyMatrix4(eh)}var Cn=new F,Mo=new F,tr=new F,er=new F,As=class{constructor(t=new F,e=new F(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Cn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=Cn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Cn.copy(this.origin).addScaledVector(this.direction,e),Cn.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){Mo.copy(t).add(e).multiplyScalar(.5),tr.copy(e).sub(t).normalize(),er.copy(this.origin).sub(Mo);let r=t.distanceTo(e)*.5,a=-this.direction.dot(tr),o=er.dot(this.direction),c=-er.dot(tr),l=er.lengthSq(),u=Math.abs(1-a*a),f,h,p,w;if(u>0)if(f=a*c-o,h=a*o-c,w=r*u,f>=0)if(h>=-w)if(h<=w){let S=1/u;f*=S,h*=S,p=f*(f+a*h+2*o)+h*(a*f+h+2*c)+l}else h=r,f=Math.max(0,-(a*h+o)),p=-f*f+h*(h+2*c)+l;else h=-r,f=Math.max(0,-(a*h+o)),p=-f*f+h*(h+2*c)+l;else h<=-w?(f=Math.max(0,-(-a*r+o)),h=f>0?-r:Math.min(Math.max(-r,-c),r),p=-f*f+h*(h+2*c)+l):h<=w?(f=0,h=Math.min(Math.max(-r,-c),r),p=h*(h+2*c)+l):(f=Math.max(0,-(a*r+o)),h=f>0?r:Math.min(Math.max(-r,-c),r),p=-f*f+h*(h+2*c)+l);else h=a>0?-r:r,f=Math.max(0,-(a*h+o)),p=-f*f+h*(h+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,f),s&&s.copy(Mo).addScaledVector(tr,h),p}intersectSphere(t,e){if(t.radius<0)return null;Cn.subVectors(t.center,this.origin);let n=Cn.dot(this.direction),s=Cn.dot(Cn)-n*n,r=t.radius*t.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,c=n+a;return c<0?null:o<0?this.at(c,e):this.at(o,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,a,o,c,l=1/this.direction.x,u=1/this.direction.y,f=1/this.direction.z,h=this.origin;return l>=0?(n=(t.min.x-h.x)*l,s=(t.max.x-h.x)*l):(n=(t.max.x-h.x)*l,s=(t.min.x-h.x)*l),u>=0?(r=(t.min.y-h.y)*u,a=(t.max.y-h.y)*u):(r=(t.max.y-h.y)*u,a=(t.min.y-h.y)*u),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),f>=0?(o=(t.min.z-h.z)*f,c=(t.max.z-h.z)*f):(o=(t.max.z-h.z)*f,c=(t.min.z-h.z)*f),n>c||o>s)||((o>n||n!==n)&&(n=o),(c<s||s!==s)&&(s=c),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,Cn)!==null}intersectTriangle(t,e,n,s,r){let a=this.origin,o=this.direction,c=o.x,l=o.y,u=o.z,f=t.x-a.x,h=t.y-a.y,p=t.z-a.z,w=e.x-a.x,S=e.y-a.y,g=e.z-a.z,d=n.x-a.x,b=n.y-a.y,T=n.z-a.z,y=Math.abs(c),_=Math.abs(l),x=Math.abs(u),E,A,M,I,R,N,k,B,H,K,W,nt;if(y>=_&&y>=x?(M=c,N=f,H=w,nt=d,c>=0?(E=l,A=u,I=h,R=p,k=S,B=g,K=b,W=T):(E=u,A=l,I=p,R=h,k=g,B=S,K=T,W=b)):_>=x?(M=l,N=h,H=S,nt=b,l>=0?(E=u,A=c,I=p,R=f,k=g,B=w,K=T,W=d):(E=c,A=u,I=f,R=p,k=w,B=g,K=d,W=T)):(M=u,N=p,H=g,nt=T,u>=0?(E=c,A=l,I=f,R=h,k=w,B=S,K=d,W=b):(E=l,A=c,I=h,R=f,k=S,B=w,K=b,W=d)),M===0)return null;let J=E/M,j=A/M,tt=1/M,Mt=I-J*N,Ct=R-j*N,te=k-J*H,zt=B-j*H,Wt=K-J*nt,X=W-j*nt,$=Wt*zt-X*te,gt=Mt*X-Ct*Wt,Rt=te*Ct-zt*Mt;if(s){if($<0||gt<0||Rt<0)return null}else if(($<0||gt<0||Rt<0)&&($>0||gt>0||Rt>0))return null;let At=$+gt+Rt;if(At===0)return null;let Nt=tt*($*N+gt*H+Rt*nt);return(At>0?Nt<0:Nt>0)?null:this.at(Nt/At,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},kn=class extends gn{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new yt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new In,this.combine=ko,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},cc=new ae,ni=new As,nr=new ai,hc=new F,ir=new F,sr=new F,rr=new F,So=new F,ar=new F,uc=new F,or=new F,de=class extends Se{constructor(t=new Ee,e=new kn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;e.fromBufferAttribute(s,t);let o=this.morphTargetInfluences;if(r&&o){ar.set(0,0,0);for(let c=0,l=r.length;c<l;c++){let u=o[c],f=r[c];u!==0&&(So.fromBufferAttribute(f,t),a?ar.addScaledVector(So,u):ar.addScaledVector(So.sub(e),u))}e.add(ar)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),nr.copy(n.boundingSphere),nr.applyMatrix4(r),ni.copy(t.ray).recast(t.near),!(nr.containsPoint(ni.origin)===!1&&(ni.intersectSphere(nr,hc)===null||ni.origin.distanceToSquared(hc)>(t.far-t.near)**2))&&(cc.copy(r).invert(),ni.copy(t.ray).applyMatrix4(cc),!(n.boundingBox!==null&&ni.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,ni)))}_computeIntersections(t,e,n){let s,r=this.geometry,a=this.material,o=r.index,c=r.attributes.position,l=r.attributes.uv,u=r.attributes.uv1,f=r.attributes.normal,h=r.groups,p=r.drawRange;if(o!==null)if(Array.isArray(a))for(let w=0,S=h.length;w<S;w++){let g=h[w],d=a[g.materialIndex],b=Math.max(g.start,p.start),T=Math.min(o.count,Math.min(g.start+g.count,p.start+p.count));for(let y=b,_=T;y<_;y+=3){let x=o.getX(y),E=o.getX(y+1),A=o.getX(y+2);s=lr(this,d,t,n,l,u,f,x,E,A),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=g.materialIndex,e.push(s))}}else{let w=Math.max(0,p.start),S=Math.min(o.count,p.start+p.count);for(let g=w,d=S;g<d;g+=3){let b=o.getX(g),T=o.getX(g+1),y=o.getX(g+2);s=lr(this,a,t,n,l,u,f,b,T,y),s&&(s.faceIndex=Math.floor(g/3),e.push(s))}}else if(c!==void 0)if(Array.isArray(a))for(let w=0,S=h.length;w<S;w++){let g=h[w],d=a[g.materialIndex],b=Math.max(g.start,p.start),T=Math.min(c.count,Math.min(g.start+g.count,p.start+p.count));for(let y=b,_=T;y<_;y+=3){let x=y,E=y+1,A=y+2;s=lr(this,d,t,n,l,u,f,x,E,A),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=g.materialIndex,e.push(s))}}else{let w=Math.max(0,p.start),S=Math.min(c.count,p.start+p.count);for(let g=w,d=S;g<d;g+=3){let b=g,T=g+1,y=g+2;s=lr(this,a,t,n,l,u,f,b,T,y),s&&(s.faceIndex=Math.floor(g/3),e.push(s))}}}};function bu(i,t,e,n,s,r,a,o){let c;if(t.side===ye?c=n.intersectTriangle(a,r,s,!0,o):c=n.intersectTriangle(s,r,a,t.side===wn,o),c===null)return null;or.copy(o),or.applyMatrix4(i.matrixWorld);let l=e.ray.origin.distanceTo(or);return l<e.near||l>e.far?null:{distance:l,point:or.clone(),object:i}}function lr(i,t,e,n,s,r,a,o,c,l){i.getVertexPosition(o,ir),i.getVertexPosition(c,sr),i.getVertexPosition(l,rr);let u=bu(i,t,e,n,ir,sr,rr,uc);if(u){let f=new F;bn.getBarycoord(uc,ir,sr,rr,f),s&&(u.uv=bn.getInterpolatedAttribute(s,o,c,l,f,new Bt)),r&&(u.uv1=bn.getInterpolatedAttribute(r,o,c,l,f,new Bt)),a&&(u.normal=bn.getInterpolatedAttribute(a,o,c,l,f,new F),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let h={a:o,b:c,c:l,normal:new F,materialIndex:0};bn.getNormal(ir,sr,rr,h.normal),u.face=h,u.barycoord=f}return u}var Br=class extends Ne{constructor(t=null,e=1,n=1,s,r,a,o,c,l=_e,u=_e,f,h){super(null,a,o,c,l,u,s,r,f,h),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var ii=new ai,Tu=new Bt(.5,.5),cr=new F,Oi=class{constructor(t=new nn,e=new nn,n=new nn,s=new nn,r=new nn,a=new nn){this.planes=[t,e,n,s,r,a]}set(t,e,n,s,r,a){let o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=sn,n=!1){let s=this.planes,r=t.elements,a=r[0],o=r[1],c=r[2],l=r[3],u=r[4],f=r[5],h=r[6],p=r[7],w=r[8],S=r[9],g=r[10],d=r[11],b=r[12],T=r[13],y=r[14],_=r[15];if(s[0].setComponents(l-a,p-u,d-w,_-b).normalize(),s[1].setComponents(l+a,p+u,d+w,_+b).normalize(),s[2].setComponents(l+o,p+f,d+S,_+T).normalize(),s[3].setComponents(l-o,p-f,d-S,_-T).normalize(),n)s[4].setComponents(c,h,g,y).normalize(),s[5].setComponents(l-c,p-h,d-g,_-y).normalize();else if(s[4].setComponents(l-c,p-h,d-g,_-y).normalize(),e===sn)s[5].setComponents(l+c,p+h,d+g,_+y).normalize();else if(e===Ri)s[5].setComponents(c,h,g,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),ii.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),ii.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(ii)}intersectsSprite(t){ii.center.set(0,0,0);let e=Tu.distanceTo(t.center);return ii.radius=.7071067811865476+e,ii.applyMatrix4(t.matrixWorld),this.intersectsSphere(ii)}intersectsSphere(t){let e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let s=e[n];if(cr.x=s.normal.x>0?t.max.x:t.min.x,cr.y=s.normal.y>0?t.max.y:t.min.y,cr.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(cr)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var Lr=class extends gn{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new yt(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},dc=new ae,Lo=new As,hr=new ai,ur=new F,ms=class extends Se{constructor(t=new Ee,e=new Lr){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,s=this.matrixWorld,r=t.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),hr.copy(n.boundingSphere),hr.applyMatrix4(s),hr.radius+=r,t.ray.intersectsSphere(hr)===!1)return;dc.copy(s).invert(),Lo.copy(t.ray).applyMatrix4(dc);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=n.index,f=n.attributes.position;if(l!==null){let h=Math.max(0,a.start),p=Math.min(l.count,a.start+a.count);for(let w=h,S=p;w<S;w++){let g=l.getX(w);ur.fromBufferAttribute(f,g),fc(ur,g,c,s,t,e,this)}}else{let h=Math.max(0,a.start),p=Math.min(f.count,a.start+a.count);for(let w=h,S=p;w<S;w++)ur.fromBufferAttribute(f,w),fc(ur,w,c,s,t,e,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function fc(i,t,e,n,s,r,a){let o=Lo.distanceSqToPoint(i);if(o<e){let c=new F;Lo.closestPointToPoint(i,c),c.applyMatrix4(n);let l=s.ray.origin.distanceTo(c);if(l<s.near||l>s.far)return;r.push({distance:l,distanceToRay:Math.sqrt(o),point:c,index:t,face:null,faceIndex:null,barycoord:null,object:a})}}var gs=class extends Ne{constructor(t=[],e=Xn,n,s,r,a,o,c,l,u){super(t,e,n,s,r,a,o,c,l,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},Gi=class extends Ne{constructor(t,e,n,s,r,a,o,c,l){super(t,e,n,s,r,a,o,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}};var Hn=class extends Ne{constructor(t,e,n=an,s,r,a,o=_e,c=_e,l,u=pn,f=1){if(u!==pn&&u!==Kn)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let h={width:t,height:e,depth:f};super(h,s,r,a,o,c,u,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new Di(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}},Rr=class extends Hn{constructor(t,e=an,n=Xn,s,r,a=_e,o=_e,c,l=pn){let u={width:t,height:t,depth:1},f=[u,u,u,u,u,u];super(t,t,e,n,s,r,a,o,c,l),this.image=f,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},ws=class extends Ne{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},Qi=class i extends Ee{constructor(t=1,e=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let c=[],l=[],u=[],f=[],h=0,p=0;w("z","y","x",-1,-1,n,e,t,a,r,0),w("z","y","x",1,-1,n,e,-t,a,r,1),w("x","z","y",1,1,t,n,e,s,a,2),w("x","z","y",1,-1,t,n,-e,s,a,3),w("x","y","z",1,-1,t,e,n,s,r,4),w("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(c),this.setAttribute("position",new Fe(l,3)),this.setAttribute("normal",new Fe(u,3)),this.setAttribute("uv",new Fe(f,2));function w(S,g,d,b,T,y,_,x,E,A,M){let I=y/E,R=_/A,N=y/2,k=_/2,B=x/2,H=E+1,K=A+1,W=0,nt=0,J=new F;for(let j=0;j<K;j++){let tt=j*R-k;for(let Mt=0;Mt<H;Mt++){let Ct=Mt*I-N;J[S]=Ct*b,J[g]=tt*T,J[d]=B,l.push(J.x,J.y,J.z),J[S]=0,J[g]=0,J[d]=x>0?1:-1,u.push(J.x,J.y,J.z),f.push(Mt/E),f.push(1-j/A),W+=1}}for(let j=0;j<A;j++)for(let tt=0;tt<E;tt++){let Mt=h+tt+H*j,Ct=h+tt+H*(j+1),te=h+(tt+1)+H*(j+1),zt=h+(tt+1)+H*j;c.push(Mt,Ct,zt),c.push(Ct,te,zt),nt+=6}o.addGroup(p,nt,M),p+=nt,h+=W}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var zn=class i extends Ee{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};let r=t/2,a=e/2,o=Math.floor(n),c=Math.floor(s),l=o+1,u=c+1,f=t/o,h=e/c,p=[],w=[],S=[],g=[];for(let d=0;d<u;d++){let b=d*h-a;for(let T=0;T<l;T++){let y=T*f-r;w.push(y,-b,0),S.push(0,0,1),g.push(T/o),g.push(1-d/c)}}for(let d=0;d<c;d++)for(let b=0;b<o;b++){let T=b+l*d,y=b+l*(d+1),_=b+1+l*(d+1),x=b+1+l*d;p.push(T,y,x),p.push(y,_,x)}this.setIndex(p),this.setAttribute("position",new Fe(w,3)),this.setAttribute("normal",new Fe(S,3)),this.setAttribute("uv",new Fe(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.widthSegments,t.heightSegments)}};var xs=class i extends Ee{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));let c=Math.min(a+o,Math.PI),l=0,u=[],f=new F,h=new F,p=[],w=[],S=[],g=[];for(let d=0;d<=n;d++){let b=[],T=d/n,y=a+T*o,_=t*Math.cos(y),x=Math.sqrt(t*t-_*_),E=0;d===0&&a===0?E=.5/e:d===n&&c===Math.PI&&(E=-.5/e);for(let A=0;A<=e;A++){let M=A/e,I=s+M*r;f.x=-x*Math.cos(I),f.y=_,f.z=x*Math.sin(I),w.push(f.x,f.y,f.z),h.copy(f).normalize(),S.push(h.x,h.y,h.z),g.push(M+E,1-T),b.push(l++)}u.push(b)}for(let d=0;d<n;d++)for(let b=0;b<e;b++){let T=u[d][b+1],y=u[d][b],_=u[d+1][b],x=u[d+1][b+1];(d!==0||a>0)&&p.push(T,y,x),(d!==n-1||c<Math.PI)&&p.push(y,_,x)}this.setIndex(p),this.setAttribute("position",new Fe(w,3)),this.setAttribute("normal",new Fe(S,3)),this.setAttribute("uv",new Fe(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};function ci(i){let t={};for(let e in i){t[e]={};for(let n in i[e]){let s=i[e][n];if(pc(s))s.isRenderTargetTexture?(Pt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone();else if(Array.isArray(s))if(pc(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();t[e][n]=r}else t[e][n]=s.slice();else t[e][n]=s}}return t}function Le(i){let t={};for(let e=0;e<i.length;e++){let n=ci(i[e]);for(let s in n)t[s]=n[s]}return t}function pc(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function Iu(i){let t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function sl(i){let t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:kt.workingColorSpace}var nh={clone:ci,merge:Le},Pu=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Bu=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Ce=class extends gn{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Pu,this.fragmentShader=Bu,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=ci(t.uniforms),this.uniformsGroups=Iu(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?e.uniforms[s]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[s]={type:"m4",value:a.toArray()}:e.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let n in t.uniforms){let s=t.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=e[s.value]||null;break;case"c":this.uniforms[n].value=new yt().setHex(s.value);break;case"v2":this.uniforms[n].value=new Bt().fromArray(s.value);break;case"v3":this.uniforms[n].value=new F().fromArray(s.value);break;case"v4":this.uniforms[n].value=new le().fromArray(s.value);break;case"m3":this.uniforms[n].value=new Lt().fromArray(s.value);break;case"m4":this.uniforms[n].value=new ae().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let n in t.extensions)this.extensions[n]=t.extensions[n];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},Ur=class extends Ce{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Dr=class extends gn{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new yt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new yt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Qa,this.normalScale=new Bt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new In,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},ki=class extends Dr{constructor(t){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Bt(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Ht(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new yt(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new yt(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new yt(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){this._anisotropy>0!=t>0&&this.version++,this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){this._clearcoat>0!=t>0&&this.version++,this._clearcoat=t}get iridescence(){return this._iridescence}set iridescence(t){this._iridescence>0!=t>0&&this.version++,this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){this._dispersion>0!=t>0&&this.version++,this._dispersion=t}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(t){this._retroreflectivity>0!=t>0&&this.version++,this._retroreflectivity=t}get sheen(){return this._sheen}set sheen(t){this._sheen>0!=t>0&&this.version++,this._sheen=t}get transmission(){return this._transmission}set transmission(t){this._transmission>0!=t>0&&this.version++,this._transmission=t}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessRange=[...t.iridescenceThicknessRange],this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.retroreflectivity=t.retroreflectivity,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}};var Fr=class extends gn{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=kc,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},Nr=class extends gn{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function Ti(i,t){return!i||i.constructor===t?i:typeof t.BYTES_PER_ELEMENT=="number"?new t(i):Array.prototype.slice.call(i)}function Eo(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}var Jn=class{constructor(t,e,n,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,s=e[n],r=e[n-1];n:{t:{let a;e:{i:if(!(t<s)){for(let o=n+2;;){if(s===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=e[++n],t<s)break t}a=e.length;break e}if(!(t>=r)){let o=e[1];t<o&&(n=2,r=o);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(s=r,r=e[--n-1],t>=r)break t}a=n,n=0;break e}break n}for(;n<a;){let o=n+a>>>1;t<e[o]?a=o:n=o+1}if(s=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=t*s;for(let a=0;a!==s;++a)e[a]=n[r+a];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Or=class extends Jn{constructor(t,e,n,s){super(t,e,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:To,endingEnd:To}}intervalChanged_(t,e,n){let s=this.parameterPositions,r=t-2,a=t+1,o=s[r],c=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case Io:r=t,o=2*e-n;break;case Po:r=s.length-2,o=e+s[r]-s[r+1];break;default:r=t,o=n}if(c===void 0)switch(this.getSettings_().endingEnd){case Io:a=t,c=2*n-e;break;case Po:a=1,c=n+s[1]-s[0];break;default:a=t-1,c=e}let l=(n-e)*.5,u=this.valueSize;this._weightPrev=l/(e-o),this._weightNext=l/(c-n),this._offsetPrev=r*u,this._offsetNext=a*u}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=t*o,l=c-o,u=this._offsetPrev,f=this._offsetNext,h=this._weightPrev,p=this._weightNext,w=(n-e)/(s-e),S=w*w,g=S*w,d=-h*g+2*h*S-h*w,b=(1+h)*g+(-1.5-2*h)*S+(-.5+h)*w+1,T=(-1-p)*g+(1.5+p)*S+.5*w,y=p*g-p*S;for(let _=0;_!==o;++_)r[_]=d*a[u+_]+b*a[l+_]+T*a[c+_]+y*a[f+_];return r}},Gr=class extends Jn{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=t*o,l=c-o,u=(n-e)/(s-e),f=1-u;for(let h=0;h!==o;++h)r[h]=a[l+h]*f+a[c+h]*u;return r}},Qr=class extends Jn{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t){return this.copySampleValue_(t-1)}},kr=class extends Jn{interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=t*o,l=c-o,u=this.inTangents,f=this.outTangents;if(!u||!f){let w=(n-e)/(s-e),S=1-w;for(let g=0;g!==o;++g)r[g]=a[l+g]*S+a[c+g]*w;return r}let h=o*2,p=t-1;for(let w=0;w!==o;++w){let S=a[l+w],g=a[c+w],d=p*h+w*2,b=f[d],T=f[d+1],y=t*h+w*2,_=u[y],x=u[y+1],E=Ru(n,e,b,_,s);r[w]=ih(E,S,T,x,g)}return r}};function ih(i,t,e,n,s){let r=1-i;return r*r*r*t+3*r*r*i*e+3*r*i*i*n+i*i*i*s}function Lu(i,t,e,n,s){let r=1-i;return 3*r*r*(e-t)+6*r*i*(n-e)+3*i*i*(s-n)}function Ru(i,t,e,n,s){let r=(i-t)/(s-t);for(let a=0;a<8;a++){let o=ih(r,t,e,n,s)-i;if(Math.abs(o)<1e-10)break;let c=Lu(r,t,e,n,s);if(Math.abs(c)<1e-10)break;r=Math.max(0,Math.min(1,r-o/c))}return r}var Je=class{constructor(t,e,n,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=Ti(e,this.TimeBufferType),this.values=Ti(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:Ti(t.times,Array),values:Ti(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(n.interpolation=s),Eo(t.settings)&&(n.settings={inTangents:Ti(t.settings.inTangents,Array),outTangents:Ti(t.settings.outTangents,Array)})}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new Qr(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new Gr(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new Or(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new kr(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case rs:e=this.InterpolantFactoryMethodDiscrete;break;case Er:e=this.InterpolantFactoryMethodLinear;break;case pr:e=this.InterpolantFactoryMethodSmooth;break;case bo:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Pt("KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return rs;case this.InterpolantFactoryMethodLinear:return Er;case this.InterpolantFactoryMethodSmooth:return pr;case this.InterpolantFactoryMethodBezier:return bo}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]*=t;Eo(this.settings)&&(Ac(this.settings.inTangents,t),Ac(this.settings.outTangents,t))}return this}trim(t,e){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<t;)++r;for(;a!==-1&&n[a]>e;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(It("KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,s=this.values,r=n.length;r===0&&(It("KeyframeTrack: Track is empty.",this),t=!1);let a=null;for(let o=0;o!==r;o++){let c=n[o];if(typeof c=="number"&&isNaN(c)){It("KeyframeTrack: Time is not a valid number.",this,o,c),t=!1;break}if(a!==null&&a>c){It("KeyframeTrack: Out of order keys.",this,o,c,a),t=!1;break}a=c}if(s!==void 0&&cu(s))for(let o=0,c=s.length;o!==c;++o){let l=s[o];if(isNaN(l)){It("KeyframeTrack: Value is not a valid number.",this,o,l),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===pr,r=t.length-1,a=1;for(let o=1;o<r;++o){let c=!1,l=t[o],u=t[o+1];if(l!==u&&(o!==1||l!==t[0]))if(s)c=!0;else{let f=o*n,h=f-n,p=f+n;for(let w=0;w!==n;++w){let S=e[f+w];if(S!==e[h+w]||S!==e[p+w]){c=!0;break}}}if(c){if(o!==a){t[a]=t[o];let f=o*n,h=a*n;for(let p=0;p!==n;++p)e[h+p]=e[f+p]}++a}}if(r>0){t[a]=t[r];for(let o=r*n,c=a*n,l=0;l!==n;++l)e[c+l]=e[o+l];++a}return a!==t.length?(this.times=t.slice(0,a),this.values=e.slice(0,a*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,s=new n(this.name,t,e);return s.createInterpolant=this.createInterpolant,Eo(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function Ac(i,t){for(let e=0,n=i.length;e!==n;e+=2)i[e]*=t}Je.prototype.ValueTypeName="";Je.prototype.TimeBufferType=Float32Array;Je.prototype.ValueBufferType=Float32Array;Je.prototype.DefaultInterpolation=Er;var Vn=class extends Je{constructor(t,e,n){super(t,e,n)}};Vn.prototype.ValueTypeName="bool";Vn.prototype.ValueBufferType=Array;Vn.prototype.DefaultInterpolation=rs;Vn.prototype.InterpolantFactoryMethodLinear=void 0;Vn.prototype.InterpolantFactoryMethodSmooth=void 0;var Hr=class extends Je{constructor(t,e,n,s){super(t,e,n,s)}};Hr.prototype.ValueTypeName="color";var zr=class extends Je{constructor(t,e,n,s){super(t,e,n,s)}};zr.prototype.ValueTypeName="number";var Jr=class extends Jn{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=(n-e)/(s-e),l=t*o;for(let u=l+o;l!==u;l+=4)mn.slerpFlat(r,0,a,l-o,a,l,c);return r}},vs=class extends Je{constructor(t,e,n,s){super(t,e,n,s)}InterpolantFactoryMethodLinear(t){return new Jr(this.times,this.values,this.getValueSize(),t)}};vs.prototype.ValueTypeName="quaternion";vs.prototype.InterpolantFactoryMethodSmooth=void 0;var Wn=class extends Je{constructor(t,e,n){super(t,e,n)}};Wn.prototype.ValueTypeName="string";Wn.prototype.ValueBufferType=Array;Wn.prototype.DefaultInterpolation=rs;Wn.prototype.InterpolantFactoryMethodLinear=void 0;Wn.prototype.InterpolantFactoryMethodSmooth=void 0;var Vr=class extends Je{constructor(t,e,n,s){super(t,e,n,s)}};Vr.prototype.ValueTypeName="vector";var Wr=class{constructor(t,e,n){let s=this,r=!1,a=0,o=0,c,l=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this._abortController=null,this.itemStart=function(u){o++,r===!1&&s.onStart!==void 0&&s.onStart(u,a,o),r=!0},this.itemEnd=function(u){a++,s.onProgress!==void 0&&s.onProgress(u,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),c?c(u):u},this.setURLModifier=function(u){return c=u,this},this.addHandler=function(u,f){return l.push(u,f),this},this.removeHandler=function(u){let f=l.indexOf(u);return f!==-1&&l.splice(f,2),this},this.getHandler=function(u){for(let f=0,h=l.length;f<h;f+=2){let p=l[f],w=l[f+1];if(p.global&&(p.lastIndex=0),p.test(u))return w}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},sh=new Wr,Xr=class{constructor(t){this.manager=t!==void 0?t:sh,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let n=this;return new Promise(function(s,r){n.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};Xr.DEFAULT_MATERIAL_NAME="__DEFAULT";var Yr=class extends Se{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new yt(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}};var Co=new ae,mc=new F,gc=new F,Kr=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Bt(512,512),this.mapType=ke,this.map=null,this.mapPass=null,this.matrix=new ae,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Oi,this._frameExtents=new Bt(1,1),this._viewportCount=1,this._viewports=[new le(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;mc.setFromMatrixPosition(t.matrixWorld),e.position.copy(mc),gc.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(gc),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,n,s){Co.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),n.setFromProjectionMatrix(Co,t.coordinateSystem,t.reversedDepth);let r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,c=s?s.x/r.x:0,l=s?s.y/r.y:0;t.coordinateSystem===Ri||t.reversedDepth?e.set(.5*a,0,0,.5*a+c,0,.5*o,0,.5*o+l,0,0,1,0,0,0,0,1):e.set(.5*a,0,0,.5*a+c,0,.5*o,0,.5*o+l,0,0,.5,.5,0,0,0,1),e.multiply(Co)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},dr=new F,fr=new mn,un=new F,_s=class extends Se{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ae,this.projectionMatrix=new ae,this.projectionMatrixInverse=new ae,this.coordinateSystem=sn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(dr,fr,un),un.x===1&&un.y===1&&un.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(dr,fr,un.set(1,1,1)).invert()}updateWorldMatrix(t,e,n=!1){super.updateWorldMatrix(t,e,n),this.matrixWorld.decompose(dr,fr,un),un.x===1&&un.y===1&&un.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(dr,fr,un.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},On=new F,wc=new Bt,xc=new Bt,Be=class extends _s{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=Cr*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(no*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Cr*2*Math.atan(Math.tan(no*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){On.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(On.x,On.y).multiplyScalar(-t/On.z),On.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(On.x,On.y).multiplyScalar(-t/On.z)}getViewSize(t,e){return this.getViewBounds(t,wc,xc),e.subVectors(xc,wc)}setViewOffset(t,e,n,s,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(no*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let c=a.fullWidth,l=a.fullHeight;r+=a.offsetX*s/c,e-=a.offsetY*n/l,s*=a.width/c,n*=a.height/l}let o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}};var Hi=class extends _s{constructor(t=-1,e=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-t,a=n+t,o=s+e,c=s-e;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,a=r+l*this.view.width,o-=u*this.view.offsetY,c=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},Ro=class extends Kr{constructor(){super(new Hi(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},oi=class extends Yr{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Se.DEFAULT_UP),this.updateMatrix(),this.target=new Se,this.shadow=new Ro}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}};var Ii=-90,Pi=1,qr=class extends Se{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Be(Ii,Pi,t,e);s.layers=this.layers,this.add(s);let r=new Be(Ii,Pi,t,e);r.layers=this.layers,this.add(r);let a=new Be(Ii,Pi,t,e);a.layers=this.layers,this.add(a);let o=new Be(Ii,Pi,t,e);o.layers=this.layers,this.add(o);let c=new Be(Ii,Pi,t,e);c.layers=this.layers,this.add(c);let l=new Be(Ii,Pi,t,e);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,s,r,a,o,c]=e;for(let l of e)this.remove(l);if(t===sn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(t===Ri)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let l of e)this.add(l),l.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,c,l,u]=this.children,f=t.getRenderTarget(),h=t.getActiveCubeFace(),p=t.getActiveMipmapLevel(),w=t.xr.enabled;t.xr.enabled=!1;let S=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let g=!1;t.isWebGLRenderer===!0?g=t.state.buffers.depth.getReversed():g=t.reversedDepthBuffer,t.setRenderTarget(n,0,s),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(n,1,s),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(n,2,s),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(n,3,s),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),t.setRenderTarget(n,4,s),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),n.texture.generateMipmaps=S,t.setRenderTarget(n,5,s),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,u),t.setRenderTarget(f,h,p),t.xr.enabled=w,n.texture.needsPMREMUpdate=!0}},Zr=class extends Be{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var rl="\\[\\]\\.:\\/",Uu=new RegExp("["+rl+"]","g"),al="[^"+rl+"]",Du="[^"+rl.replace("\\.","")+"]",Fu=/((?:WC+[\/:])*)/.source.replace("WC",al),Nu=/(WCOD+)?/.source.replace("WCOD",Du),Ou=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",al),Gu=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",al),Qu=new RegExp("^"+Fu+Nu+Ou+Gu+"$"),ku=["material","materials","bones","map"],Uo=class{constructor(t,e,n){let s=n||re.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},re=class i{constructor(t,e,n){this.path=e,this.parsedPath=n||i.parseTrackName(e),this.node=i.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new i.Composite(t,e,n):new i(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Uu,"")}static parseTrackName(t){let e=Qu.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);ku.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===e||o.uuid===e)return o;let c=n(o.children);if(c)return c}return null},s=n(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)t[e++]=n[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,s=e.propertyName,r=e.propertyIndex;if(t||(t=i.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Pt("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=e.objectIndex;switch(n){case"materials":if(!t.material){It("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){It("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){It("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let u=0;u<t.length;u++)if(t[u].name===l){l=u;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){It("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){It("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){It("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(l!==void 0){if(t[l]===void 0){It("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[l]}}let a=t[s];if(a===void 0){let l=e.nodeName;It("PropertyBinding: Trying to update property for track: "+l+"."+s+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?o=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){It("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){It("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(c=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};re.Composite=Uo;re.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};re.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};re.prototype.GetterByBindingType=[re.prototype._getValue_direct,re.prototype._getValue_array,re.prototype._getValue_arrayElement,re.prototype._getValue_toArray];re.prototype.SetterByBindingTypeAndVersioning=[[re.prototype._setValue_direct,re.prototype._setValue_direct_setNeedsUpdate,re.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[re.prototype._setValue_array,re.prototype._setValue_array_setNeedsUpdate,re.prototype._setValue_array_setMatrixWorldNeedsUpdate],[re.prototype._setValue_arrayElement,re.prototype._setValue_arrayElement_setNeedsUpdate,re.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[re.prototype._setValue_fromArray,re.prototype._setValue_fromArray_setNeedsUpdate,re.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Jm=new Float32Array(1);var dl=class dl{constructor(t,e,n,s){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let n=0;n<4;n++)this.elements[n]=t[n+e];return this}set(t,e,n,s){let r=this.elements;return r[0]=t,r[2]=e,r[1]=n,r[3]=s,this}};dl.prototype.isMatrix2=!0;var Do=dl;function ol(i,t,e,n){let s=Hu(n);switch(e){case $o:return i*t;case el:return i*t/s.components*s.byteLength;case oa:return i*t/s.components*s.byteLength;case qn:return i*t*2/s.components*s.byteLength;case la:return i*t*2/s.components*s.byteLength;case tl:return i*t*3/s.components*s.byteLength;case Ke:return i*t*4/s.components*s.byteLength;case ca:return i*t*4/s.components*s.byteLength;case Ts:case Is:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Ps:case Bs:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case ua:case fa:return Math.max(i,16)*Math.max(t,8)/4;case ha:case da:return Math.max(i,8)*Math.max(t,8)/2;case pa:case Aa:case ga:case wa:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case ma:case Ls:case xa:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case va:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case _a:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case ya:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case Ma:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case Sa:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case Ea:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case Ca:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case ba:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case Ta:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case Ia:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case Pa:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case Ba:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case La:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case Ra:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case Ua:case Da:case Fa:return Math.ceil(i/4)*Math.ceil(t/4)*16;case Na:case Oa:return Math.ceil(i/4)*Math.ceil(t/4)*8;case Rs:case Ga:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Hu(i){switch(i){case ke:case Ko:return{byteLength:1,components:1};case Vi:case qo:case ln:return{byteLength:2,components:1};case ra:case aa:return{byteLength:2,components:4};case an:case sa:case on:return{byteLength:4,components:1};case Zo:case jo:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));function Ch(){let i=null,t=!1,e=null,n=null;function s(r,a){n=i.requestAnimationFrame(s),e(r,a)}return{start:function(){t!==!0&&e!==null&&i!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function Ju(i){let t=new WeakMap;function e(o,c){let l=o.array,u=o.usage,f=l.byteLength,h=i.createBuffer();i.bindBuffer(c,h),i.bufferData(c,l,u),o.onUploadCallback();let p;if(l instanceof Float32Array)p=i.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)p=i.HALF_FLOAT;else if(l instanceof Uint16Array)o.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(l instanceof Int16Array)p=i.SHORT;else if(l instanceof Uint32Array)p=i.UNSIGNED_INT;else if(l instanceof Int32Array)p=i.INT;else if(l instanceof Int8Array)p=i.BYTE;else if(l instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:h,type:p,bytesPerElement:l.BYTES_PER_ELEMENT,version:o.version,size:f}}function n(o,c,l){let u=c.array,f=c.updateRanges;if(i.bindBuffer(l,o),f.length===0)i.bufferSubData(l,0,u);else{f.sort((p,w)=>p.start-w.start);let h=0;for(let p=1;p<f.length;p++){let w=f[h],S=f[p];S.start<=w.start+w.count+1?w.count=Math.max(w.count,S.start+S.count-w.start):(++h,f[h]=S)}f.length=h+1;for(let p=0,w=f.length;p<w;p++){let S=f[p];i.bufferSubData(l,S.start*u.BYTES_PER_ELEMENT,u,S.start,S.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let c=t.get(o);c&&(i.deleteBuffer(c.buffer),t.delete(o))}function a(o,c){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let u=t.get(o);(!u||u.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let l=t.get(o);if(l===void 0)t.set(o,e(o,c));else if(l.version<o.version){if(l.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,o,c),l.version=o.version}}return{get:s,remove:r,update:a}}var Vu=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Wu=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Xu=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Yu=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Ku=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,qu=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Zu=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,ju=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,$u=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,td=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,ed=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,nd=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,id=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,sd=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,rd=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,ad=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,od=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,ld=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,cd=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,hd=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,ud=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,dd=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,fd=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,pd=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Ad=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,md=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,gd=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,wd=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,xd=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,vd=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,_d="gl_FragColor = linearToOutputTexel( gl_FragColor );",yd=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Md=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Sd=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Ed=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Cd=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,bd=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Td=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Id=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Pd=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Bd=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Ld=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Rd=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Ud=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Dd=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Fd=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Nd=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,Od=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Gd=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Qd=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,kd=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Hd=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,zd=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Jd=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Vd=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Wd=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Xd=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,Yd=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Kd=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,qd=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Zd=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,jd=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,$d=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,tf=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,ef=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,nf=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,sf=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,rf=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,af=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,of=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,lf=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,cf=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,hf=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,uf=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,df=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,ff=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,pf=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Af=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,mf=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,gf=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,wf=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,xf=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,vf=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,_f=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,yf=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Mf=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Sf=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Ef=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Cf=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,bf=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Tf=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,If=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Pf=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Bf=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Lf=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Rf=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Uf=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Df=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Ff=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Nf=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Of=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Gf=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Qf=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,kf=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Hf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,zf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Jf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Vf=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Wf=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Xf=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Yf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Kf=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,qf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Zf=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,jf=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,$f=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,tp=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,ep=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,np=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,ip=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,sp=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,rp=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,ap=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,op=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,lp=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,cp=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,hp=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,up=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,dp=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,fp=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,pp=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Ap=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,mp=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,gp=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,wp=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,xp=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,vp=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,_p=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,yp=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Mp=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Sp=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Ep=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ft={alphahash_fragment:Vu,alphahash_pars_fragment:Wu,alphamap_fragment:Xu,alphamap_pars_fragment:Yu,alphatest_fragment:Ku,alphatest_pars_fragment:qu,aomap_fragment:Zu,aomap_pars_fragment:ju,batching_pars_vertex:$u,batching_vertex:td,begin_vertex:ed,beginnormal_vertex:nd,bsdfs:id,iridescence_fragment:sd,bumpmap_pars_fragment:rd,clipping_planes_fragment:ad,clipping_planes_pars_fragment:od,clipping_planes_pars_vertex:ld,clipping_planes_vertex:cd,color_fragment:hd,color_pars_fragment:ud,color_pars_vertex:dd,color_vertex:fd,common:pd,cube_uv_reflection_fragment:Ad,defaultnormal_vertex:md,displacementmap_pars_vertex:gd,displacementmap_vertex:wd,emissivemap_fragment:xd,emissivemap_pars_fragment:vd,colorspace_fragment:_d,colorspace_pars_fragment:yd,envmap_fragment:Md,envmap_common_pars_fragment:Sd,envmap_pars_fragment:Ed,envmap_pars_vertex:Cd,envmap_physical_pars_fragment:Nd,envmap_vertex:bd,fog_vertex:Td,fog_pars_vertex:Id,fog_fragment:Pd,fog_pars_fragment:Bd,gradientmap_pars_fragment:Ld,lightmap_pars_fragment:Rd,lights_lambert_fragment:Ud,lights_lambert_pars_fragment:Dd,lights_pars_begin:Fd,lights_toon_fragment:Od,lights_toon_pars_fragment:Gd,lights_phong_fragment:Qd,lights_phong_pars_fragment:kd,lights_physical_fragment:Hd,lights_physical_pars_fragment:zd,lights_fragment_begin:Jd,lights_fragment_maps:Vd,lights_fragment_end:Wd,lightprobes_pars_fragment:Xd,logdepthbuf_fragment:Yd,logdepthbuf_pars_fragment:Kd,logdepthbuf_pars_vertex:qd,logdepthbuf_vertex:Zd,map_fragment:jd,map_pars_fragment:$d,map_particle_fragment:tf,map_particle_pars_fragment:ef,metalnessmap_fragment:nf,metalnessmap_pars_fragment:sf,morphinstance_vertex:rf,morphcolor_vertex:af,morphnormal_vertex:of,morphtarget_pars_vertex:lf,morphtarget_vertex:cf,normal_fragment_begin:hf,normal_fragment_maps:uf,normal_pars_fragment:df,normal_pars_vertex:ff,normal_vertex:pf,normalmap_pars_fragment:Af,clearcoat_normal_fragment_begin:mf,clearcoat_normal_fragment_maps:gf,clearcoat_pars_fragment:wf,iridescence_pars_fragment:xf,opaque_fragment:vf,packing:_f,premultiplied_alpha_fragment:yf,project_vertex:Mf,dithering_fragment:Sf,dithering_pars_fragment:Ef,roughnessmap_fragment:Cf,roughnessmap_pars_fragment:bf,shadowmap_pars_fragment:Tf,shadowmap_pars_vertex:If,shadowmap_vertex:Pf,shadowmask_pars_fragment:Bf,skinbase_vertex:Lf,skinning_pars_vertex:Rf,skinning_vertex:Uf,skinnormal_vertex:Df,specularmap_fragment:Ff,specularmap_pars_fragment:Nf,tonemapping_fragment:Of,tonemapping_pars_fragment:Gf,transmission_fragment:Qf,transmission_pars_fragment:kf,uv_pars_fragment:Hf,uv_pars_vertex:zf,uv_vertex:Jf,worldpos_vertex:Vf,background_vert:Wf,background_frag:Xf,backgroundCube_vert:Yf,backgroundCube_frag:Kf,cube_vert:qf,cube_frag:Zf,depth_vert:jf,depth_frag:$f,distance_vert:tp,distance_frag:ep,equirect_vert:np,equirect_frag:ip,linedashed_vert:sp,linedashed_frag:rp,meshbasic_vert:ap,meshbasic_frag:op,meshlambert_vert:lp,meshlambert_frag:cp,meshmatcap_vert:hp,meshmatcap_frag:up,meshnormal_vert:dp,meshnormal_frag:fp,meshphong_vert:pp,meshphong_frag:Ap,meshphysical_vert:mp,meshphysical_frag:gp,meshtoon_vert:wp,meshtoon_frag:xp,points_vert:vp,points_frag:_p,shadow_vert:yp,shadow_frag:Mp,sprite_vert:Sp,sprite_frag:Ep},ht={common:{diffuse:{value:new yt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Lt},alphaMap:{value:null},alphaMapTransform:{value:new Lt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Lt}},envmap:{envMap:{value:null},envMapRotation:{value:new Lt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Lt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Lt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Lt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Lt},normalScale:{value:new Bt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Lt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Lt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Lt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Lt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new yt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new F},probesMax:{value:new F},probesResolution:{value:new F}},points:{diffuse:{value:new yt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Lt},alphaTest:{value:0},uvTransform:{value:new Lt}},sprite:{diffuse:{value:new yt(16777215)},opacity:{value:1},center:{value:new Bt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Lt},alphaMap:{value:null},alphaMapTransform:{value:new Lt},alphaTest:{value:0}}},_n={basic:{uniforms:Le([ht.common,ht.specularmap,ht.envmap,ht.aomap,ht.lightmap,ht.fog]),vertexShader:Ft.meshbasic_vert,fragmentShader:Ft.meshbasic_frag},lambert:{uniforms:Le([ht.common,ht.specularmap,ht.envmap,ht.aomap,ht.lightmap,ht.emissivemap,ht.bumpmap,ht.normalmap,ht.displacementmap,ht.fog,ht.lights,{emissive:{value:new yt(0)},envMapIntensity:{value:1}}]),vertexShader:Ft.meshlambert_vert,fragmentShader:Ft.meshlambert_frag},phong:{uniforms:Le([ht.common,ht.specularmap,ht.envmap,ht.aomap,ht.lightmap,ht.emissivemap,ht.bumpmap,ht.normalmap,ht.displacementmap,ht.fog,ht.lights,{emissive:{value:new yt(0)},specular:{value:new yt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Ft.meshphong_vert,fragmentShader:Ft.meshphong_frag},standard:{uniforms:Le([ht.common,ht.envmap,ht.aomap,ht.lightmap,ht.emissivemap,ht.bumpmap,ht.normalmap,ht.displacementmap,ht.roughnessmap,ht.metalnessmap,ht.fog,ht.lights,{emissive:{value:new yt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ft.meshphysical_vert,fragmentShader:Ft.meshphysical_frag},toon:{uniforms:Le([ht.common,ht.aomap,ht.lightmap,ht.emissivemap,ht.bumpmap,ht.normalmap,ht.displacementmap,ht.gradientmap,ht.fog,ht.lights,{emissive:{value:new yt(0)}}]),vertexShader:Ft.meshtoon_vert,fragmentShader:Ft.meshtoon_frag},matcap:{uniforms:Le([ht.common,ht.bumpmap,ht.normalmap,ht.displacementmap,ht.fog,{matcap:{value:null}}]),vertexShader:Ft.meshmatcap_vert,fragmentShader:Ft.meshmatcap_frag},points:{uniforms:Le([ht.points,ht.fog]),vertexShader:Ft.points_vert,fragmentShader:Ft.points_frag},dashed:{uniforms:Le([ht.common,ht.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ft.linedashed_vert,fragmentShader:Ft.linedashed_frag},depth:{uniforms:Le([ht.common,ht.displacementmap]),vertexShader:Ft.depth_vert,fragmentShader:Ft.depth_frag},normal:{uniforms:Le([ht.common,ht.bumpmap,ht.normalmap,ht.displacementmap,{opacity:{value:1}}]),vertexShader:Ft.meshnormal_vert,fragmentShader:Ft.meshnormal_frag},sprite:{uniforms:Le([ht.sprite,ht.fog]),vertexShader:Ft.sprite_vert,fragmentShader:Ft.sprite_frag},background:{uniforms:{uvTransform:{value:new Lt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ft.background_vert,fragmentShader:Ft.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Lt}},vertexShader:Ft.backgroundCube_vert,fragmentShader:Ft.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ft.cube_vert,fragmentShader:Ft.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ft.equirect_vert,fragmentShader:Ft.equirect_frag},distance:{uniforms:Le([ht.common,ht.displacementmap,{referencePosition:{value:new F},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ft.distance_vert,fragmentShader:Ft.distance_frag},shadow:{uniforms:Le([ht.lights,ht.fog,{color:{value:new yt(0)},opacity:{value:1}}]),vertexShader:Ft.shadow_vert,fragmentShader:Ft.shadow_frag}};_n.physical={uniforms:Le([_n.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Lt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Lt},clearcoatNormalScale:{value:new Bt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Lt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Lt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Lt},sheen:{value:0},sheenColor:{value:new yt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Lt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Lt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Lt},transmissionSamplerSize:{value:new Bt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Lt},attenuationDistance:{value:0},attenuationColor:{value:new yt(0)},specularColor:{value:new yt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Lt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Lt},anisotropyVector:{value:new Bt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Lt}}]),vertexShader:Ft.meshphysical_vert,fragmentShader:Ft.meshphysical_frag};var za={r:0,b:0,g:0},Cp=new ae,bh=new Lt;bh.set(-1,0,0,0,1,0,0,0,1);function bp(i,t,e,n,s,r){let a=new yt(0),o=s===!0?0:1,c,l,u=null,f=0,h=null;function p(b){let T=b.isScene===!0?b.background:null;if(T&&T.isTexture){let y=b.backgroundBlurriness>0;T=t.get(T,y)}return T}function w(b){let T=!1,y=p(b);y===null?g(a,o):y&&y.isColor&&(g(y,1),T=!0);let _=i.xr.getEnvironmentBlendMode();_==="additive"?e.buffers.color.setClear(0,0,0,1,r):_==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(i.autoClear||T)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function S(b,T){let y=p(T);y&&(y.isCubeTexture||y.mapping===Cs)?(l===void 0&&(l=new de(new Qi(1,1,1),new Ce({name:"BackgroundCubeMaterial",uniforms:ci(_n.backgroundCube.uniforms),vertexShader:_n.backgroundCube.vertexShader,fragmentShader:_n.backgroundCube.fragmentShader,side:ye,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(_,x,E){this.matrixWorld.copyPosition(E.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(l)),l.material.uniforms.envMap.value=y,l.material.uniforms.backgroundBlurriness.value=T.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(Cp.makeRotationFromEuler(T.backgroundRotation)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(bh),l.material.toneMapped=kt.getTransfer(y.colorSpace)!==Kt,(u!==y||f!==y.version||h!==i.toneMapping)&&(l.material.needsUpdate=!0,u=y,f=y.version,h=i.toneMapping),l.layers.enableAll(),b.unshift(l,l.geometry,l.material,0,0,null)):y&&y.isTexture&&(c===void 0&&(c=new de(new zn(2,2),new Ce({name:"BackgroundMaterial",uniforms:ci(_n.background.uniforms),vertexShader:_n.background.vertexShader,fragmentShader:_n.background.fragmentShader,side:wn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(c)),c.material.uniforms.t2D.value=y,c.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,c.material.toneMapped=kt.getTransfer(y.colorSpace)!==Kt,y.matrixAutoUpdate===!0&&y.updateMatrix(),c.material.uniforms.uvTransform.value.copy(y.matrix),(u!==y||f!==y.version||h!==i.toneMapping)&&(c.material.needsUpdate=!0,u=y,f=y.version,h=i.toneMapping),c.layers.enableAll(),b.unshift(c,c.geometry,c.material,0,0,null))}function g(b,T){b.getRGB(za,sl(i)),e.buffers.color.setClear(za.r,za.g,za.b,T,r)}function d(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(b,T=1){a.set(b),o=T,g(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(b){o=b,g(a,o)},render:w,addToRenderList:S,dispose:d}}function Tp(i,t){let e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=h(null),r=s,a=!1;function o(R,N,k,B,H){let K=!1,W=f(R,B,k,N);r!==W&&(r=W,l(r.object)),K=p(R,B,k,H),K&&w(R,B,k,H),H!==null&&t.update(H,i.ELEMENT_ARRAY_BUFFER),(K||a)&&(a=!1,y(R,N,k,B),H!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(H).buffer))}function c(){return i.createVertexArray()}function l(R){return i.bindVertexArray(R)}function u(R){return i.deleteVertexArray(R)}function f(R,N,k,B){let H=B.wireframe===!0,K=n[N.id];K===void 0&&(K={},n[N.id]=K);let W=R.isInstancedMesh===!0?R.id:0,nt=K[W];nt===void 0&&(nt={},K[W]=nt);let J=nt[k.id];J===void 0&&(J={},nt[k.id]=J);let j=J[H];return j===void 0&&(j=h(c()),J[H]=j),j}function h(R){let N=[],k=[],B=[];for(let H=0;H<e;H++)N[H]=0,k[H]=0,B[H]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:N,enabledAttributes:k,attributeDivisors:B,object:R,attributes:{},index:null}}function p(R,N,k,B){let H=r.attributes,K=N.attributes,W=0,nt=k.getAttributes();for(let J in nt)if(nt[J].location>=0){let tt=H[J],Mt=K[J];if(Mt===void 0&&(J==="instanceMatrix"&&R.instanceMatrix&&(Mt=R.instanceMatrix),J==="instanceColor"&&R.instanceColor&&(Mt=R.instanceColor)),tt===void 0||tt.attribute!==Mt||Mt&&tt.data!==Mt.data)return!0;W++}return r.attributesNum!==W||r.index!==B}function w(R,N,k,B){let H={},K=N.attributes,W=0,nt=k.getAttributes();for(let J in nt)if(nt[J].location>=0){let tt=K[J];tt===void 0&&(J==="instanceMatrix"&&R.instanceMatrix&&(tt=R.instanceMatrix),J==="instanceColor"&&R.instanceColor&&(tt=R.instanceColor));let Mt={};Mt.attribute=tt,tt&&tt.data&&(Mt.data=tt.data),H[J]=Mt,W++}r.attributes=H,r.attributesNum=W,r.index=B}function S(){let R=r.newAttributes;for(let N=0,k=R.length;N<k;N++)R[N]=0}function g(R){d(R,0)}function d(R,N){let k=r.newAttributes,B=r.enabledAttributes,H=r.attributeDivisors;k[R]=1,B[R]===0&&(i.enableVertexAttribArray(R),B[R]=1),H[R]!==N&&(i.vertexAttribDivisor(R,N),H[R]=N)}function b(){let R=r.newAttributes,N=r.enabledAttributes;for(let k=0,B=N.length;k<B;k++)N[k]!==R[k]&&(i.disableVertexAttribArray(k),N[k]=0)}function T(R,N,k,B,H,K,W){W===!0?i.vertexAttribIPointer(R,N,k,H,K):i.vertexAttribPointer(R,N,k,B,H,K)}function y(R,N,k,B){S();let H=B.attributes,K=k.getAttributes(),W=N.defaultAttributeValues;for(let nt in K){let J=K[nt];if(J.location>=0){let j=H[nt];if(j===void 0&&(nt==="instanceMatrix"&&R.instanceMatrix&&(j=R.instanceMatrix),nt==="instanceColor"&&R.instanceColor&&(j=R.instanceColor)),j!==void 0){let tt=j.normalized,Mt=j.itemSize,Ct=t.get(j);if(Ct===void 0)continue;let te=Ct.buffer,zt=Ct.type,Wt=Ct.bytesPerElement,X=zt===i.INT||zt===i.UNSIGNED_INT||j.gpuType===sa;if(j.isInterleavedBufferAttribute){let $=j.data,gt=$.stride,Rt=j.offset;if($.isInstancedInterleavedBuffer){for(let At=0;At<J.locationSize;At++)d(J.location+At,$.meshPerAttribute);R.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=$.meshPerAttribute*$.count)}else for(let At=0;At<J.locationSize;At++)g(J.location+At);i.bindBuffer(i.ARRAY_BUFFER,te);for(let At=0;At<J.locationSize;At++)T(J.location+At,Mt/J.locationSize,zt,tt,gt*Wt,(Rt+Mt/J.locationSize*At)*Wt,X)}else{if(j.isInstancedBufferAttribute){for(let $=0;$<J.locationSize;$++)d(J.location+$,j.meshPerAttribute);R.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=j.meshPerAttribute*j.count)}else for(let $=0;$<J.locationSize;$++)g(J.location+$);i.bindBuffer(i.ARRAY_BUFFER,te);for(let $=0;$<J.locationSize;$++)T(J.location+$,Mt/J.locationSize,zt,tt,Mt*Wt,Mt/J.locationSize*$*Wt,X)}}else if(W!==void 0){let tt=W[nt];if(tt!==void 0)switch(tt.length){case 2:i.vertexAttrib2fv(J.location,tt);break;case 3:i.vertexAttrib3fv(J.location,tt);break;case 4:i.vertexAttrib4fv(J.location,tt);break;default:i.vertexAttrib1fv(J.location,tt)}}}}b()}function _(){M();for(let R in n){let N=n[R];for(let k in N){let B=N[k];for(let H in B){let K=B[H];for(let W in K)u(K[W].object),delete K[W];delete B[H]}}delete n[R]}}function x(R){if(n[R.id]===void 0)return;let N=n[R.id];for(let k in N){let B=N[k];for(let H in B){let K=B[H];for(let W in K)u(K[W].object),delete K[W];delete B[H]}}delete n[R.id]}function E(R){for(let N in n){let k=n[N];for(let B in k){let H=k[B];if(H[R.id]===void 0)continue;let K=H[R.id];for(let W in K)u(K[W].object),delete K[W];delete H[R.id]}}}function A(R){for(let N in n){let k=n[N],B=R.isInstancedMesh===!0?R.id:0,H=k[B];if(H!==void 0){for(let K in H){let W=H[K];for(let nt in W)u(W[nt].object),delete W[nt];delete H[K]}delete k[B],Object.keys(k).length===0&&delete n[N]}}}function M(){I(),a=!0,r!==s&&(r=s,l(r.object))}function I(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:M,resetDefaultState:I,dispose:_,releaseStatesOfGeometry:x,releaseStatesOfObject:A,releaseStatesOfProgram:E,initAttributes:S,enableAttribute:g,disableUnusedAttributes:b}}function Ip(i,t,e){let n;function s(c){n=c}function r(c,l){i.drawArrays(n,c,l),e.update(l,n,1)}function a(c,l,u){u!==0&&(i.drawArraysInstanced(n,c,l,u),e.update(l,n,u))}function o(c,l,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,l,0,u);let h=0;for(let p=0;p<u;p++)h+=l[p];e.update(h,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function Pp(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let E=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(E.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(E){return!(E!==Ke&&n.convert(E)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(E){let A=E===ln&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(E!==ke&&E!==on&&!A&&n.convert(E)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function c(E){if(E==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";E="mediump"}return E==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=e.precision!==void 0?e.precision:"highp",u=c(l);u!==l&&(Pt("WebGLRenderer:",l,"not supported, using",u,"instead."),l=u);let f=e.logarithmicDepthBuffer===!0,h=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&h===!1&&Pt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),w=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),S=i.getParameter(i.MAX_TEXTURE_SIZE),g=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),d=i.getParameter(i.MAX_VERTEX_ATTRIBS),b=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),T=i.getParameter(i.MAX_VARYING_VECTORS),y=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),_=i.getParameter(i.MAX_SAMPLES),x=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:a,textureTypeReadable:o,precision:l,logarithmicDepthBuffer:f,reversedDepthBuffer:h,maxTextures:p,maxVertexTextures:w,maxTextureSize:S,maxCubemapSize:g,maxAttributes:d,maxVertexUniforms:b,maxVaryings:T,maxFragmentUniforms:y,maxSamples:_,samples:x}}function Bp(i){let t=this,e=null,n=0,s=!1,r=!1,a=new nn,o=new Lt,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(f,h){let p=f.length!==0||h||n!==0||s;return s=h,n=f.length,p},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(f,h){e=u(f,h,0)},this.setState=function(f,h,p){let w=f.clippingPlanes,S=f.clipIntersection,g=f.clipShadows,d=i.get(f);if(!s||w===null||w.length===0||r&&!g)r?u(null):l();else{let b=r?0:n,T=b*4,y=d.clippingState||null;c.value=y,y=u(w,h,T,p);for(let _=0;_!==T;++_)y[_]=e[_];d.clippingState=y,this.numIntersection=S?this.numPlanes:0,this.numPlanes+=b}};function l(){c.value!==e&&(c.value=e,c.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function u(f,h,p,w){let S=f!==null?f.length:0,g=null;if(S!==0){if(g=c.value,w!==!0||g===null){let d=p+S*4,b=h.matrixWorldInverse;o.getNormalMatrix(b),(g===null||g.length<d)&&(g=new Float32Array(d));for(let T=0,y=p;T!==S;++T,y+=4)a.copy(f[T]).applyMatrix4(b,o),a.normal.toArray(g,y),g[y+3]=a.constant}c.value=g,c.needsUpdate=!0}return t.numPlanes=S,t.numIntersection=0,g}}var Yi=4,Lp=6,Rp=20,Up=256,Us=new Hi,rh=new yt,fl=null,pl=0,Al=0,ml=!1,Dp=new F,hi=new F,qi=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,n=.1,s=100,r={}){let{size:a=256,position:o=Dp}=r;fl=this._renderer.getRenderTarget(),pl=this._renderer.getActiveCubeFace(),Al=this._renderer.getActiveMipmapLevel(),ml=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(t,n,s,c,o),e>0&&this._blur(c,0,0,e),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=lh(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=oh(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(fl,pl,Al),this._renderer.xr.enabled=ml,t.scissorTest=!1,Xi(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Xn||t.mapping===li?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),fl=this._renderer.getRenderTarget(),pl=this._renderer.getActiveCubeFace(),Al=this._renderer.getActiveMipmapLevel(),ml=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:Me,minFilter:Me,generateMipmaps:!1,type:ln,format:Ke,colorSpace:as,depthBuffer:!1},s=ah(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=ah(t,e,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=Fp(r)),this._blurMaterial=Op(r,t,e),this._ggxMaterial=Np(r,t,e)}return s}_compileMaterial(t){let e=new de(new Ee,t);this._renderer.compile(e,Us)}_sceneToCubeUV(t,e,n,s,r){let c=new Be(90,1,e,n),l=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],f=this._renderer,h=f.autoClear,p=f.toneMapping;f.getClearColor(rh),f.toneMapping=rn,f.autoClear=!1,f.state.buffers.depth.getReversed()&&(f.setRenderTarget(s),f.clearDepth(),f.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new de(new Qi,new kn({name:"PMREM.Background",side:ye,depthWrite:!1,depthTest:!1})));let S=this._backgroundBox,g=S.material,d=!1,b=t.background;b?b.isColor&&(g.color.copy(b),t.background=null,d=!0):(g.color.copy(rh),d=!0);for(let T=0;T<6;T++){let y=T%3;y===0?(c.up.set(0,l[T],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+u[T],r.y,r.z)):y===1?(c.up.set(0,0,l[T]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+u[T],r.z)):(c.up.set(0,l[T],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+u[T]));let _=this._cubeSize;Xi(s,y*_,T>2?_:0,_,_),f.setRenderTarget(s),d&&f.render(S,c),f.render(t,c)}f.toneMapping=p,f.autoClear=h,t.background=b}_textureToCubeUV(t,e){let n=this._renderer,s=t.mapping===Xn||t.mapping===li;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=lh()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=oh());let r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=t;let c=this._cubeSize;Xi(e,0,0,3*c,2*c),n.setRenderTarget(e),n.render(a,Us)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(t,r-1,r);e.autoClear=n}_applyGGXFilter(t,e,n){let s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let c=a.uniforms,l=n/(this._lodMeshes.length-1),u=e/(this._lodMeshes.length-1),f=Math.sqrt(l*l-u*u),h=l*1.25,p=f*h,{_lodMax:w}=this,S=this._sizeLods[n],g=3*S*(n>w-Yi?n-w+Yi:0),d=4*(this._cubeSize-S);c.envMap.value=t.texture,c.roughness.value=p,c.mipInt.value=w-e,Xi(r,g,d,3*S,2*S),s.setRenderTarget(r),s.render(o,Us),c.envMap.value=r.texture,c.roughness.value=0,c.mipInt.value=w-n,Xi(t,g,d,3*S,2*S),s.setRenderTarget(t),s.render(o,Us)}_blur(t,e,n,s){let r=this._pingPongRenderTarget,a=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(t,r,e,n,a),this._blurPass(r,t,n,n,a)}_blurPass(t,e,n,s,r){let a=this._renderer,o=this._blurMaterial,c=this._lodMeshes[s];c.material=o;let l=o.uniforms;l.envMap.value=t.texture,l.sigma.value=r,l.mipInt.value=this._lodMax-n;let u=this._sizeLods[s],f=3*u*(s>this._lodMax-Yi?s-this._lodMax+Yi:0),h=4*(this._cubeSize-u);Xi(e,f,h,3*u,2*u),a.setRenderTarget(e),a.render(c,Us)}};function Fp(i){let t=[],e=[],n=i,s=i-Yi+1+Lp;for(let r=0;r<s;r++){let a=Math.pow(2,n);t.push(a);let o=1/(a-2),c=-o,l=1+o,u=[c,c,l,c,l,l,c,c,l,l,c,l],f=6,h=6,p=3,w=new Float32Array(p*h*f),S=new Float32Array(p*h*f);for(let d=0;d<f;d++){let b=d%3*2/3-1,T=d>2?0:-1,y=[b,T,0,b+2/3,T,0,b+2/3,T+1,0,b,T,0,b+2/3,T+1,0,b,T+1,0];w.set(y,p*h*d);for(let _=0;_<h;_++){let x=u[_*2]*2-1,E=u[_*2+1]*2-1;d===0?hi.set(1,E,x):d===1?hi.set(-x,1,-E):d===2?hi.set(-x,E,1):d===3?hi.set(-1,E,-x):d===4?hi.set(-x,-1,E):hi.set(x,E,-1),hi.toArray(S,(d*h+_)*p)}}let g=new Ee;g.setAttribute("position",new he(w,p)),g.setAttribute("outputDirection",new he(S,p)),e.push(new de(g,null)),n>Yi&&n--}return{lodMeshes:e,sizeLods:t}}function ah(i,t,e){let n=new Qe(i,t,e);return n.texture.mapping=Cs,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Xi(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function Np(i,t,e){return new Ce({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Up,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Xa(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:xn,depthTest:!1,depthWrite:!1})}function Op(i,t,e){return new Ce({name:"SphericalGaussianBlur",defines:{SAMPLES:Rp,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Xa(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:xn,depthTest:!1,depthWrite:!1})}function oh(){return new Ce({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Xa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:xn,depthTest:!1,depthWrite:!1})}function lh(){return new Ce({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Xa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:xn,depthTest:!1,depthWrite:!1})}function Xa(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var Va=class extends Qe{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new gs(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Qi(5,5,5),r=new Ce({name:"CubemapFromEquirect",uniforms:ci(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:ye,blending:xn});r.uniforms.tEquirect.value=e;let a=new de(s,r),o=e.minFilter;return e.minFilter===Yn&&(e.minFilter=Me),new qr(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e=!0,n=!0,s=!0){let r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,n,s);t.setRenderTarget(r)}};function Gp(i){let t=new WeakMap,e=new WeakMap,n=null;function s(h,p=!1){return h==null?null:p?a(h):r(h)}function r(h){if(h&&h.isTexture){let p=h.mapping;if(p===ea||p===na)if(t.has(h)){let w=t.get(h).texture;return o(w,h.mapping)}else{let w=h.image;if(w&&w.height>0){let S=new Va(w.height);return S.fromEquirectangularTexture(i,h),t.set(h,S),h.addEventListener("dispose",l),o(S.texture,h.mapping)}else return null}}return h}function a(h){if(h&&h.isTexture){let p=h.mapping,w=p===ea||p===na,S=p===Xn||p===li;if(w||S){let g=e.get(h),d=g!==void 0?g.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==d)return n===null&&(n=new qi(i)),g=w?n.fromEquirectangular(h,g):n.fromCubemap(h,g),g.texture.pmremVersion=h.pmremVersion,e.set(h,g),g.texture;if(g!==void 0)return g.texture;{let b=h.image;return w&&b&&b.height>0||S&&b&&c(b)?(n===null&&(n=new qi(i)),g=w?n.fromEquirectangular(h):n.fromCubemap(h),g.texture.pmremVersion=h.pmremVersion,e.set(h,g),h.addEventListener("dispose",u),g.texture):null}}}return h}function o(h,p){return p===ea?h.mapping=Xn:p===na&&(h.mapping=li),h}function c(h){let p=0,w=6;for(let S=0;S<w;S++)h[S]!==void 0&&p++;return p===w}function l(h){let p=h.target;p.removeEventListener("dispose",l);let w=t.get(p);w!==void 0&&(t.delete(p),w.dispose())}function u(h){let p=h.target;p.removeEventListener("dispose",u);let w=e.get(p);w!==void 0&&(e.delete(p),w.dispose())}function f(){t=new WeakMap,e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:f}}function Qp(i){let t={};function e(n){if(t[n]!==void 0)return t[n];let s=i.getExtension(n);return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){let s=e(n);return s===null&&si("WebGLRenderer: "+n+" extension not supported."),s}}}function kp(i,t,e,n){let s={},r=new WeakMap;function a(f){let h=f.target;h.index!==null&&t.remove(h.index);for(let w in h.attributes)t.remove(h.attributes[w]);h.removeEventListener("dispose",a),delete s[h.id];let p=r.get(h);p&&(t.remove(p),r.delete(h)),n.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,e.memory.geometries--}function o(f,h){return s[h.id]===!0||(h.addEventListener("dispose",a),s[h.id]=!0,e.memory.geometries++),h}function c(f){let h=f.attributes;for(let p in h)t.update(h[p],i.ARRAY_BUFFER)}function l(f){let h=[],p=f.index,w=f.attributes.position,S=0;if(w===void 0)return;if(p!==null){let b=p.array;S=p.version;for(let T=0,y=b.length;T<y;T+=3){let _=b[T+0],x=b[T+1],E=b[T+2];h.push(_,x,x,E,E,_)}}else{let b=w.array;S=w.version;for(let T=0,y=b.length/3-1;T<y;T+=3){let _=T+0,x=T+1,E=T+2;h.push(_,x,x,E,E,_)}}let g=new(w.count>=65535?ds:us)(h,1);g.version=S;let d=r.get(f);d&&t.remove(d),r.set(f,g)}function u(f){let h=r.get(f);if(h){let p=f.index;p!==null&&h.version<p.version&&l(f)}else l(f);return r.get(f)}return{get:o,update:c,getWireframeAttribute:u}}function Hp(i,t,e){let n;function s(f){n=f}let r,a;function o(f){r=f.type,a=f.bytesPerElement}function c(f,h){i.drawElements(n,h,r,f*a),e.update(h,n,1)}function l(f,h,p){p!==0&&(i.drawElementsInstanced(n,h,r,f*a,p),e.update(h,n,p))}function u(f,h,p){if(p===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,h,0,r,f,0,p);let S=0;for(let g=0;g<p;g++)S+=h[g];e.update(S,n,1)}this.setMode=s,this.setIndex=o,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function zp(i){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(e.calls++,a){case i.TRIANGLES:e.triangles+=o*(r/3);break;case i.LINES:e.lines+=o*(r/2);break;case i.LINE_STRIP:e.lines+=o*(r-1);break;case i.LINE_LOOP:e.lines+=o*r;break;case i.POINTS:e.points+=o*r;break;default:It("WebGLInfo: Unknown draw mode:",a);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function Jp(i,t,e){let n=new WeakMap,s=new le;function r(a,o,c){let l=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,f=u!==void 0?u.length:0,h=n.get(o);if(h===void 0||h.count!==f){let M=function(){E.dispose(),n.delete(o),o.removeEventListener("dispose",M)};h!==void 0&&h.texture.dispose();let p=o.morphAttributes.position!==void 0,w=o.morphAttributes.normal!==void 0,S=o.morphAttributes.color!==void 0,g=o.morphAttributes.position||[],d=o.morphAttributes.normal||[],b=o.morphAttributes.color||[],T=0;p===!0&&(T=1),w===!0&&(T=2),S===!0&&(T=3);let y=o.attributes.position.count*T,_=1;y>t.maxTextureSize&&(_=Math.ceil(y/t.maxTextureSize),y=t.maxTextureSize);let x=new Float32Array(y*_*4*f),E=new cs(x,y,_,f);E.type=on,E.needsUpdate=!0;let A=T*4;for(let I=0;I<f;I++){let R=g[I],N=d[I],k=b[I],B=y*_*4*I;for(let H=0;H<R.count;H++){let K=H*A;p===!0&&(s.fromBufferAttribute(R,H),x[B+K+0]=s.x,x[B+K+1]=s.y,x[B+K+2]=s.z,x[B+K+3]=0),w===!0&&(s.fromBufferAttribute(N,H),x[B+K+4]=s.x,x[B+K+5]=s.y,x[B+K+6]=s.z,x[B+K+7]=0),S===!0&&(s.fromBufferAttribute(k,H),x[B+K+8]=s.x,x[B+K+9]=s.y,x[B+K+10]=s.z,x[B+K+11]=k.itemSize===4?s.w:1)}}h={count:f,texture:E,size:new Bt(y,_)},n.set(o,h),o.addEventListener("dispose",M)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)c.getUniforms().setValue(i,"morphTexture",a.morphTexture,e);else{let p=0;for(let S=0;S<l.length;S++)p+=l[S];let w=o.morphTargetsRelative?1:1-p;c.getUniforms().setValue(i,"morphTargetBaseInfluence",w),c.getUniforms().setValue(i,"morphTargetInfluences",l)}c.getUniforms().setValue(i,"morphTargetsTexture",h.texture,e),c.getUniforms().setValue(i,"morphTargetsTextureSize",h.size)}return{update:r}}function Vp(i,t,e,n,s){let r=new WeakMap;function a(l){let u=s.render.frame,f=l.geometry,h=t.get(l,f);if(r.get(h)!==u&&(t.update(h),r.set(h,u)),l.isInstancedMesh&&(l.hasEventListener("dispose",c)===!1&&l.addEventListener("dispose",c),r.get(l)!==u&&(e.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,i.ARRAY_BUFFER),r.set(l,u))),l.isSkinnedMesh){let p=l.skeleton;r.get(p)!==u&&(p.update(),r.set(p,u))}return h}function o(){r=new WeakMap}function c(l){let u=l.target;u.removeEventListener("dispose",c),n.releaseStatesOfObject(u),e.remove(u.instanceMatrix),u.instanceColor!==null&&e.remove(u.instanceColor)}return{update:a,dispose:o}}var Wp={[Ho]:"LINEAR_TONE_MAPPING",[zo]:"REINHARD_TONE_MAPPING",[Jo]:"CINEON_TONE_MAPPING",[Vo]:"ACES_FILMIC_TONE_MAPPING",[Xo]:"AGX_TONE_MAPPING",[Es]:"NEUTRAL_TONE_MAPPING",[Wo]:"CUSTOM_TONE_MAPPING"};function Xp(i,t,e,n,s,r){let a=new Qe(t,e,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,c=null,l=new Ee;l.setAttribute("position",new Fe([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute("uv",new Fe([0,2,0,0,2,0],2));let u=new Ur({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),f=new de(l,u),h=new Hi(-1,1,1,-1,0,1),p=null,w=null,S=!1,g,d=null,b=[],T=!1;this.setSize=function(y,_){a.setSize(y,_),o!==null&&o.setSize(y,_),c!==null&&c.setSize(y,_);for(let x=0;x<b.length;x++){let E=b[x];E.setSize&&E.setSize(y,_)}},this.setEffects=function(y){b=y,T=b.length>0&&b[0].isRenderPass===!0;let _=a.width,x=a.height;b.length>0&&o===null&&(o=new Qe(_,x,{type:ln,depthBuffer:!1,stencilBuffer:!1}),c=new Qe(_,x,{type:ln,depthBuffer:!1,stencilBuffer:!1}));for(let E=0;E<b.length;E++){let A=b[E];A.setSize&&A.setSize(_,x)}},this.begin=function(y,_){if(S||y.toneMapping===rn&&b.length===0)return!1;if(d=_,_!==null){let x=_.width,E=_.height;(a.width!==x||a.height!==E)&&this.setSize(x,E)}return T===!1&&y.setRenderTarget(a),g=y.toneMapping,y.toneMapping=rn,!0},this.hasRenderPass=function(){return T},this.end=function(y,_){y.toneMapping=g,S=!0;let x=a,E=o;for(let A=0;A<b.length;A++){let M=b[A];M.enabled!==!1&&(M.render(y,E,x,_),M.needsSwap!==!1&&(x=E,E=E===o?c:o))}if(p!==y.outputColorSpace||w!==y.toneMapping){p=y.outputColorSpace,w=y.toneMapping,u.defines={},kt.getTransfer(p)===Kt&&(u.defines.SRGB_TRANSFER="");let A=Wp[w];A&&(u.defines[A]=""),u.needsUpdate=!0}u.uniforms.tDiffuse.value=x.texture,y.setRenderTarget(d),y.render(f,h),d=null,S=!1},this.isCompositing=function(){return S},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),c!==null&&c.dispose(),l.dispose(),u.dispose()}}var Th=new Ne,xl=new Hn(1,1),Ih=new cs,Ph=new Ir,Bh=new gs,ch=[],hh=[],uh=new Float32Array(16),dh=new Float32Array(9),fh=new Float32Array(4);function Zi(i,t,e){let n=i[0];if(n<=0||n>0)return i;let s=t*e,r=ch[s];if(r===void 0&&(r=new Float32Array(s),ch[s]=r),t!==0){n.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,i[a].toArray(r,o)}return r}function ge(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function we(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function Ya(i,t){let e=hh[t];e===void 0&&(e=new Int32Array(t),hh[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function Yp(i,t){let e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function Kp(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(ge(e,t))return;i.uniform2fv(this.addr,t),we(e,t)}}function qp(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(ge(e,t))return;i.uniform3fv(this.addr,t),we(e,t)}}function Zp(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(ge(e,t))return;i.uniform4fv(this.addr,t),we(e,t)}}function jp(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(ge(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),we(e,t)}else{if(ge(e,n))return;fh.set(n),i.uniformMatrix2fv(this.addr,!1,fh),we(e,n)}}function $p(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(ge(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),we(e,t)}else{if(ge(e,n))return;dh.set(n),i.uniformMatrix3fv(this.addr,!1,dh),we(e,n)}}function tA(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(ge(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),we(e,t)}else{if(ge(e,n))return;uh.set(n),i.uniformMatrix4fv(this.addr,!1,uh),we(e,n)}}function eA(i,t){let e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function nA(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(ge(e,t))return;i.uniform2iv(this.addr,t),we(e,t)}}function iA(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(ge(e,t))return;i.uniform3iv(this.addr,t),we(e,t)}}function sA(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(ge(e,t))return;i.uniform4iv(this.addr,t),we(e,t)}}function rA(i,t){let e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function aA(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(ge(e,t))return;i.uniform2uiv(this.addr,t),we(e,t)}}function oA(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(ge(e,t))return;i.uniform3uiv(this.addr,t),we(e,t)}}function lA(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(ge(e,t))return;i.uniform4uiv(this.addr,t),we(e,t)}}function cA(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(xl.compareFunction=e.isReversedDepthBuffer()?Ha:ka,r=xl):r=Th,e.setTexture2D(t||r,s)}function hA(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||Ph,s)}function uA(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||Bh,s)}function dA(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||Ih,s)}function fA(i){switch(i){case 5126:return Yp;case 35664:return Kp;case 35665:return qp;case 35666:return Zp;case 35674:return jp;case 35675:return $p;case 35676:return tA;case 5124:case 35670:return eA;case 35667:case 35671:return nA;case 35668:case 35672:return iA;case 35669:case 35673:return sA;case 5125:return rA;case 36294:return aA;case 36295:return oA;case 36296:return lA;case 35678:case 36198:case 36298:case 36306:case 35682:return cA;case 35679:case 36299:case 36307:return hA;case 35680:case 36300:case 36308:case 36293:return uA;case 36289:case 36303:case 36311:case 36292:return dA}}function pA(i,t){i.uniform1fv(this.addr,t)}function AA(i,t){let e=Zi(t,this.size,2);i.uniform2fv(this.addr,e)}function mA(i,t){let e=Zi(t,this.size,3);i.uniform3fv(this.addr,e)}function gA(i,t){let e=Zi(t,this.size,4);i.uniform4fv(this.addr,e)}function wA(i,t){let e=Zi(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function xA(i,t){let e=Zi(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function vA(i,t){let e=Zi(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function _A(i,t){i.uniform1iv(this.addr,t)}function yA(i,t){i.uniform2iv(this.addr,t)}function MA(i,t){i.uniform3iv(this.addr,t)}function SA(i,t){i.uniform4iv(this.addr,t)}function EA(i,t){i.uniform1uiv(this.addr,t)}function CA(i,t){i.uniform2uiv(this.addr,t)}function bA(i,t){i.uniform3uiv(this.addr,t)}function TA(i,t){i.uniform4uiv(this.addr,t)}function IA(i,t,e){let n=this.cache,s=t.length,r=Ya(e,s);ge(n,r)||(i.uniform1iv(this.addr,r),we(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=xl:a=Th;for(let o=0;o!==s;++o)e.setTexture2D(t[o]||a,r[o])}function PA(i,t,e){let n=this.cache,s=t.length,r=Ya(e,s);ge(n,r)||(i.uniform1iv(this.addr,r),we(n,r));for(let a=0;a!==s;++a)e.setTexture3D(t[a]||Ph,r[a])}function BA(i,t,e){let n=this.cache,s=t.length,r=Ya(e,s);ge(n,r)||(i.uniform1iv(this.addr,r),we(n,r));for(let a=0;a!==s;++a)e.setTextureCube(t[a]||Bh,r[a])}function LA(i,t,e){let n=this.cache,s=t.length,r=Ya(e,s);ge(n,r)||(i.uniform1iv(this.addr,r),we(n,r));for(let a=0;a!==s;++a)e.setTexture2DArray(t[a]||Ih,r[a])}function RA(i){switch(i){case 5126:return pA;case 35664:return AA;case 35665:return mA;case 35666:return gA;case 35674:return wA;case 35675:return xA;case 35676:return vA;case 5124:case 35670:return _A;case 35667:case 35671:return yA;case 35668:case 35672:return MA;case 35669:case 35673:return SA;case 5125:return EA;case 36294:return CA;case 36295:return bA;case 36296:return TA;case 35678:case 36198:case 36298:case 36306:case 35682:return IA;case 35679:case 36299:case 36307:return PA;case 35680:case 36300:case 36308:case 36293:return BA;case 36289:case 36303:case 36311:case 36292:return LA}}var vl=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=fA(e.type)}},_l=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=RA(e.type)}},yl=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(t,e[o.id],n)}}},gl=/(\w+)(\])?(\[|\.)?/g;function ph(i,t){i.seq.push(t),i.map[t.id]=t}function UA(i,t,e){let n=i.name,s=n.length;for(gl.lastIndex=0;;){let r=gl.exec(n),a=gl.lastIndex,o=r[1],c=r[2]==="]",l=r[3];if(c&&(o=o|0),l===void 0||l==="["&&a+2===s){ph(e,l===void 0?new vl(o,i,t):new _l(o,i,t));break}else{let f=e.map[o];f===void 0&&(f=new yl(o),ph(e,f)),e=f}}}var Ki=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=t.getActiveUniform(e,a),c=t.getUniformLocation(e,o.name);UA(o,c,this)}let s=[],r=[];for(let a of this.seq)a.type===t.SAMPLER_2D_SHADOW||a.type===t.SAMPLER_CUBE_SHADOW||a.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(t,e,n,s){let r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){let s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,a=e.length;r!==a;++r){let o=e[r],c=n[o.id];c.needsUpdate!==!1&&o.setValue(t,c.value,s)}}static seqWithValue(t,e){let n=[];for(let s=0,r=t.length;s!==r;++s){let a=t[s];a.id in e&&n.push(a)}return n}};function Ah(i,t,e){let n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}var DA=37297,FA=0;function NA(i,t){let e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return n.join(`
`)}var mh=new Lt;function OA(i){kt._getMatrix(mh,kt.workingColorSpace,i);let t=`mat3( ${mh.elements.map(e=>e.toFixed(4))} )`;switch(kt.getTransfer(i)){case os:return[t,"LinearTransferOETF"];case Kt:return[t,"sRGBTransferOETF"];default:return Pt("WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function gh(i,t,e){let n=i.getShaderParameter(t,i.COMPILE_STATUS),r=(i.getShaderInfoLog(t)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return e.toUpperCase()+`

`+r+`

`+NA(i.getShaderSource(t),o)}else return r}function GA(i,t){let e=OA(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var QA={[Ho]:"Linear",[zo]:"Reinhard",[Jo]:"Cineon",[Vo]:"ACESFilmic",[Xo]:"AgX",[Es]:"Neutral",[Wo]:"Custom"};function kA(i,t){let e=QA[t];return e===void 0?(Pt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var Ja=new F;function HA(){kt.getLuminanceCoefficients(Ja);let i=Ja.x.toFixed(4),t=Ja.y.toFixed(4),e=Ja.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function zA(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Fs).join(`
`)}function JA(i){let t=[];for(let e in i){let n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function VA(i,t){let e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(t,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:i.getAttribLocation(t,a),locationSize:o}}return e}function Fs(i){return i!==""}function wh(i,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function xh(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var WA=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ml(i){return i.replace(WA,YA)}var XA=new Map;function YA(i,t){let e=Ft[t];if(e===void 0){let n=XA.get(t);if(n!==void 0)e=Ft[n],Pt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return Ml(e)}var KA=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function vh(i){return i.replace(KA,qA)}function qA(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function _h(i){let t=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}var ZA={[ys]:"SHADOWMAP_TYPE_PCF",[zi]:"SHADOWMAP_TYPE_VSM"};function jA(i){return ZA[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var $A={[Xn]:"ENVMAP_TYPE_CUBE",[li]:"ENVMAP_TYPE_CUBE",[Cs]:"ENVMAP_TYPE_CUBE_UV"};function tm(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":$A[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var em={[li]:"ENVMAP_MODE_REFRACTION"};function nm(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":em[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var im={[ko]:"ENVMAP_BLENDING_MULTIPLY",[Oc]:"ENVMAP_BLENDING_MIX",[Gc]:"ENVMAP_BLENDING_ADD"};function sm(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":im[i.combine]||"ENVMAP_BLENDING_NONE"}function rm(i){let t=i.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function am(i,t,e,n){let s=i.getContext(),r=e.defines,a=e.vertexShader,o=e.fragmentShader,c=jA(e),l=tm(e),u=nm(e),f=sm(e),h=rm(e),p=zA(e),w=JA(r),S=s.createProgram(),g,d,b=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(g=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,w].filter(Fs).join(`
`),g.length>0&&(g+=`
`),d=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,w].filter(Fs).join(`
`),d.length>0&&(d+=`
`)):(g=[_h(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,w,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+u:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Fs).join(`
`),d=[_h(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,w,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+l:"",e.envMap?"#define "+u:"",e.envMap?"#define "+f:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==rn?"#define TONE_MAPPING":"",e.toneMapping!==rn?Ft.tonemapping_pars_fragment:"",e.toneMapping!==rn?kA("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Ft.colorspace_pars_fragment,GA("linearToOutputTexel",e.outputColorSpace),HA(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Fs).join(`
`)),a=Ml(a),a=wh(a,e),a=xh(a,e),o=Ml(o),o=wh(o,e),o=xh(o,e),a=vh(a),o=vh(o),e.isRawShaderMaterial!==!0&&(b=`#version 300 es
`,g=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,d=["#define varying in",e.glslVersion===il?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===il?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);let T=b+g+a,y=b+d+o,_=Ah(s,s.VERTEX_SHADER,T),x=Ah(s,s.FRAGMENT_SHADER,y);s.attachShader(S,_),s.attachShader(S,x),e.index0AttributeName!==void 0?s.bindAttribLocation(S,0,e.index0AttributeName):e.hasPositionAttribute===!0&&s.bindAttribLocation(S,0,"position"),s.linkProgram(S);function E(R){if(i.debug.checkShaderErrors){let N=s.getProgramInfoLog(S)||"",k=s.getShaderInfoLog(_)||"",B=s.getShaderInfoLog(x)||"",H=N.trim(),K=k.trim(),W=B.trim(),nt=!0,J=!0;if(s.getProgramParameter(S,s.LINK_STATUS)===!1)if(nt=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,S,_,x);else{let j=gh(s,_,"vertex"),tt=gh(s,x,"fragment");It("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(S,s.VALIDATE_STATUS)+`

Material Name: `+R.name+`
Material Type: `+R.type+`

Program Info Log: `+H+`
`+j+`
`+tt)}else H!==""?Pt("WebGLProgram: Program Info Log:",H):(K===""||W==="")&&(J=!1);J&&(R.diagnostics={runnable:nt,programLog:H,vertexShader:{log:K,prefix:g},fragmentShader:{log:W,prefix:d}})}s.deleteShader(_),s.deleteShader(x),A=new Ki(s,S),M=VA(s,S)}let A;this.getUniforms=function(){return A===void 0&&E(this),A};let M;this.getAttributes=function(){return M===void 0&&E(this),M};let I=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return I===!1&&(I=s.getProgramParameter(S,DA)),I},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(S),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=FA++,this.cacheKey=t,this.usedTimes=1,this.program=S,this.vertexShader=_,this.fragmentShader=x,this}var om=0,Sl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,n){let s=this._getShaderCacheForMaterial(t);return s.has(e)===!1&&(s.add(e),e.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new El(t),e.set(t,n)),n}},El=class{constructor(t){this.id=om++,this.code=t,this.usedTimes=0}};function lm(i){return i===qn||i===Ls||i===Rs}function cm(i,t,e,n,s,r){let a=new hs,o=new Sl,c=new Set,l=[],u=new Map,f=n.logarithmicDepthBuffer,h=n.precision,p={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function w(A){return c.add(A),A===0?"uv":`uv${A}`}function S(A,M,I,R,N,k){let B=R.fog,H=N.geometry,K=A.isMeshStandardMaterial||A.isMeshLambertMaterial||A.isMeshPhongMaterial?R.environment:null,W=A.isMeshStandardMaterial||A.isMeshLambertMaterial&&!A.envMap||A.isMeshPhongMaterial&&!A.envMap,nt=t.get(A.envMap||K,W),J=nt&&nt.mapping===Cs?nt.image.height:null,j=p[A.type];A.precision!==null&&(h=n.getMaxPrecision(A.precision),h!==A.precision&&Pt("WebGLProgram.getParameters:",A.precision,"not supported, using",h,"instead."));let tt=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,Mt=tt!==void 0?tt.length:0,Ct=0;H.morphAttributes.position!==void 0&&(Ct=1),H.morphAttributes.normal!==void 0&&(Ct=2),H.morphAttributes.color!==void 0&&(Ct=3);let te,zt,Wt,X;if(j){let ne=_n[j];te=ne.vertexShader,zt=ne.fragmentShader}else{te=A.vertexShader,zt=A.fragmentShader;let ne=o.getVertexShaderStage(A),Xt=o.getFragmentShaderStage(A);o.update(A,ne,Xt),Wt=ne.id,X=Xt.id}let $=i.getRenderTarget(),gt=i.state.buffers.depth.getReversed(),Rt=N.isInstancedMesh===!0,At=N.isBatchedMesh===!0,Nt=!!A.map,me=!!A.matcap,Ot=!!nt,Vt=!!A.aoMap,ee=!!A.lightMap,Qt=!!A.bumpMap&&A.wireframe===!1,oe=!!A.normalMap,xe=!!A.displacementMap,Oe=!!A.emissiveMap,ce=!!A.metalnessMap,fe=!!A.roughnessMap,U=A.anisotropy>0,be=A.clearcoat>0,qt=A.dispersion>0,C=A.retroreflectivity>0,m=A.iridescence>0,D=A.sheen>0,Q=A.transmission>0,V=U&&!!A.anisotropyMap,it=be&&!!A.clearcoatMap,st=be&&!!A.clearcoatNormalMap,Y=be&&!!A.clearcoatRoughnessMap,Z=m&&!!A.iridescenceMap,rt=m&&!!A.iridescenceThicknessMap,St=D&&!!A.sheenColorMap,ct=D&&!!A.sheenRoughnessMap,at=!!A.specularMap,Et=!!A.specularColorMap,Tt=!!A.specularIntensityMap,Ut=Q&&!!A.transmissionMap,L=Q&&!!A.thicknessMap,ot=!!A.gradientMap,q=!!A.alphaMap,lt=A.alphaTest>0,ft=!!A.alphaHash,et=!!A.extensions,bt=rn;A.toneMapped&&($===null||$.isXRRenderTarget===!0)&&(bt=i.toneMapping);let vt={shaderID:j,shaderType:A.type,shaderName:A.name,vertexShader:te,fragmentShader:zt,defines:A.defines,customVertexShaderID:Wt,customFragmentShaderID:X,isRawShaderMaterial:A.isRawShaderMaterial===!0,glslVersion:A.glslVersion,precision:h,batching:At,batchingColor:At&&N._colorsTexture!==null,instancing:Rt,instancingColor:Rt&&N.instanceColor!==null,instancingMorph:Rt&&N.morphTexture!==null,outputColorSpace:$===null?i.outputColorSpace:$.isXRRenderTarget===!0?$.texture.colorSpace:kt.workingColorSpace,alphaToCoverage:!!A.alphaToCoverage,map:Nt,matcap:me,envMap:Ot,envMapMode:Ot&&nt.mapping,envMapCubeUVHeight:J,aoMap:Vt,lightMap:ee,bumpMap:Qt,normalMap:oe,displacementMap:xe,emissiveMap:Oe,normalMapObjectSpace:oe&&A.normalMapType===Hc,normalMapTangentSpace:oe&&A.normalMapType===Qa,packedNormalMap:oe&&A.normalMapType===Qa&&lm(A.normalMap.format),metalnessMap:ce,roughnessMap:fe,anisotropy:U,anisotropyMap:V,clearcoat:be,clearcoatMap:it,clearcoatNormalMap:st,clearcoatRoughnessMap:Y,dispersion:qt,retroreflection:C,iridescence:m,iridescenceMap:Z,iridescenceThicknessMap:rt,sheen:D,sheenColorMap:St,sheenRoughnessMap:ct,specularMap:at,specularColorMap:Et,specularIntensityMap:Tt,transmission:Q,transmissionMap:Ut,thicknessMap:L,gradientMap:ot,opaque:A.transparent===!1&&A.blending===Ji&&A.alphaToCoverage===!1,alphaMap:q,alphaTest:lt,alphaHash:ft,combine:A.combine,mapUv:Nt&&w(A.map.channel),aoMapUv:Vt&&w(A.aoMap.channel),lightMapUv:ee&&w(A.lightMap.channel),bumpMapUv:Qt&&w(A.bumpMap.channel),normalMapUv:oe&&w(A.normalMap.channel),displacementMapUv:xe&&w(A.displacementMap.channel),emissiveMapUv:Oe&&w(A.emissiveMap.channel),metalnessMapUv:ce&&w(A.metalnessMap.channel),roughnessMapUv:fe&&w(A.roughnessMap.channel),anisotropyMapUv:V&&w(A.anisotropyMap.channel),clearcoatMapUv:it&&w(A.clearcoatMap.channel),clearcoatNormalMapUv:st&&w(A.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Y&&w(A.clearcoatRoughnessMap.channel),iridescenceMapUv:Z&&w(A.iridescenceMap.channel),iridescenceThicknessMapUv:rt&&w(A.iridescenceThicknessMap.channel),sheenColorMapUv:St&&w(A.sheenColorMap.channel),sheenRoughnessMapUv:ct&&w(A.sheenRoughnessMap.channel),specularMapUv:at&&w(A.specularMap.channel),specularColorMapUv:Et&&w(A.specularColorMap.channel),specularIntensityMapUv:Tt&&w(A.specularIntensityMap.channel),transmissionMapUv:Ut&&w(A.transmissionMap.channel),thicknessMapUv:L&&w(A.thicknessMap.channel),alphaMapUv:q&&w(A.alphaMap.channel),vertexTangents:!!H.attributes.tangent&&(oe||U),vertexNormals:!!H.attributes.normal,vertexColors:A.vertexColors,vertexAlphas:A.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,pointsUvs:N.isPoints===!0&&!!H.attributes.uv&&(Nt||q),fog:!!B,useFog:A.fog===!0,fogExp2:!!B&&B.isFogExp2,flatShading:A.wireframe===!1&&(A.flatShading===!0||H.attributes.normal===void 0&&oe===!1&&(A.isMeshLambertMaterial||A.isMeshPhongMaterial||A.isMeshStandardMaterial||A.isMeshPhysicalMaterial)),sizeAttenuation:A.sizeAttenuation===!0,logarithmicDepthBuffer:f,reversedDepthBuffer:gt,skinning:N.isSkinnedMesh===!0,hasPositionAttribute:H.attributes.position!==void 0,morphTargets:H.morphAttributes.position!==void 0,morphNormals:H.morphAttributes.normal!==void 0,morphColors:H.morphAttributes.color!==void 0,morphTargetsCount:Mt,morphTextureStride:Ct,numSunLights:M.sun.length,numDirLights:M.directional.length,numPointLights:M.point.length,numSpotLights:M.spot.length,numSpotLightMaps:M.spotLightMap.length,numRectAreaLights:M.rectArea.length,numHemiLights:M.hemi.length,numSunLightShadows:M.sunShadowMap.length,numDirLightShadows:M.directionalShadowMap.length,numPointLightShadows:M.pointShadowMap.length,numSpotLightShadows:M.spotShadowMap.length,numSpotLightShadowsWithMaps:M.numSpotLightShadowsWithMaps,numLightProbes:M.numLightProbes,numLightProbeGrids:k.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:A.dithering,shadowMapEnabled:i.shadowMap.enabled&&I.length>0,shadowMapType:i.shadowMap.type,toneMapping:bt,decodeVideoTexture:Nt&&A.map.isVideoTexture===!0&&kt.getTransfer(A.map.colorSpace)===Kt,decodeVideoTextureEmissive:Oe&&A.emissiveMap.isVideoTexture===!0&&kt.getTransfer(A.emissiveMap.colorSpace)===Kt,premultipliedAlpha:A.premultipliedAlpha,doubleSided:A.side===Ve,flipSided:A.side===ye,useDepthPacking:A.depthPacking>=0,depthPacking:A.depthPacking||0,index0AttributeName:A.index0AttributeName,extensionClipCullDistance:et&&A.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(et&&A.extensions.multiDraw===!0||At)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:A.customProgramCacheKey()};return vt.vertexUv1s=c.has(1),vt.vertexUv2s=c.has(2),vt.vertexUv3s=c.has(3),c.clear(),vt}function g(A){let M=[];if(A.shaderID?M.push(A.shaderID):(M.push(A.customVertexShaderID),M.push(A.customFragmentShaderID)),A.defines!==void 0)for(let I in A.defines)M.push(I),M.push(A.defines[I]);return A.isRawShaderMaterial===!1&&(d(M,A),b(M,A),M.push(i.outputColorSpace)),M.push(A.customProgramCacheKey),M.join()}function d(A,M){A.push(M.precision),A.push(M.outputColorSpace),A.push(M.envMapMode),A.push(M.envMapCubeUVHeight),A.push(M.mapUv),A.push(M.alphaMapUv),A.push(M.lightMapUv),A.push(M.aoMapUv),A.push(M.bumpMapUv),A.push(M.normalMapUv),A.push(M.displacementMapUv),A.push(M.emissiveMapUv),A.push(M.metalnessMapUv),A.push(M.roughnessMapUv),A.push(M.anisotropyMapUv),A.push(M.clearcoatMapUv),A.push(M.clearcoatNormalMapUv),A.push(M.clearcoatRoughnessMapUv),A.push(M.iridescenceMapUv),A.push(M.iridescenceThicknessMapUv),A.push(M.sheenColorMapUv),A.push(M.sheenRoughnessMapUv),A.push(M.specularMapUv),A.push(M.specularColorMapUv),A.push(M.specularIntensityMapUv),A.push(M.transmissionMapUv),A.push(M.thicknessMapUv),A.push(M.combine),A.push(M.fogExp2),A.push(M.sizeAttenuation),A.push(M.morphTargetsCount),A.push(M.morphAttributeCount),A.push(M.numSunLights),A.push(M.numDirLights),A.push(M.numPointLights),A.push(M.numSpotLights),A.push(M.numSpotLightMaps),A.push(M.numHemiLights),A.push(M.numRectAreaLights),A.push(M.numSunLightShadows),A.push(M.numDirLightShadows),A.push(M.numPointLightShadows),A.push(M.numSpotLightShadows),A.push(M.numSpotLightShadowsWithMaps),A.push(M.numLightProbes),A.push(M.shadowMapType),A.push(M.toneMapping),A.push(M.numClippingPlanes),A.push(M.numClipIntersection),A.push(M.depthPacking)}function b(A,M){a.disableAll(),M.instancing&&a.enable(0),M.instancingColor&&a.enable(1),M.instancingMorph&&a.enable(2),M.matcap&&a.enable(3),M.envMap&&a.enable(4),M.normalMapObjectSpace&&a.enable(5),M.normalMapTangentSpace&&a.enable(6),M.clearcoat&&a.enable(7),M.iridescence&&a.enable(8),M.alphaTest&&a.enable(9),M.vertexColors&&a.enable(10),M.vertexAlphas&&a.enable(11),M.vertexUv1s&&a.enable(12),M.vertexUv2s&&a.enable(13),M.vertexUv3s&&a.enable(14),M.vertexTangents&&a.enable(15),M.anisotropy&&a.enable(16),M.alphaHash&&a.enable(17),M.batching&&a.enable(18),M.dispersion&&a.enable(19),M.retroreflection&&a.enable(24),M.batchingColor&&a.enable(20),M.gradientMap&&a.enable(21),M.packedNormalMap&&a.enable(22),M.vertexNormals&&a.enable(23),A.push(a.mask),a.disableAll(),M.fog&&a.enable(0),M.useFog&&a.enable(1),M.flatShading&&a.enable(2),M.logarithmicDepthBuffer&&a.enable(3),M.reversedDepthBuffer&&a.enable(4),M.skinning&&a.enable(5),M.morphTargets&&a.enable(6),M.morphNormals&&a.enable(7),M.morphColors&&a.enable(8),M.premultipliedAlpha&&a.enable(9),M.shadowMapEnabled&&a.enable(10),M.doubleSided&&a.enable(11),M.flipSided&&a.enable(12),M.useDepthPacking&&a.enable(13),M.dithering&&a.enable(14),M.transmission&&a.enable(15),M.sheen&&a.enable(16),M.opaque&&a.enable(17),M.pointsUvs&&a.enable(18),M.decodeVideoTexture&&a.enable(19),M.decodeVideoTextureEmissive&&a.enable(20),M.alphaToCoverage&&a.enable(21),M.numLightProbeGrids>0&&a.enable(22),M.hasPositionAttribute&&a.enable(23),A.push(a.mask)}function T(A){let M=p[A.type],I;if(M){let R=_n[M];I=nh.clone(R.uniforms)}else I=A.uniforms;return I}function y(A,M){let I=u.get(M);return I!==void 0?++I.usedTimes:(I=new am(i,M,A,s),l.push(I),u.set(M,I)),I}function _(A){if(--A.usedTimes===0){let M=l.indexOf(A);l[M]=l[l.length-1],l.pop(),u.delete(A.cacheKey),A.destroy()}}function x(A){o.remove(A)}function E(){o.dispose()}return{getParameters:S,getProgramCacheKey:g,getUniforms:T,acquireProgram:y,releaseProgram:_,releaseShaderCache:x,programs:l,dispose:E}}function hm(){let i=new WeakMap;function t(a){return i.has(a)}function e(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,c){i.get(a)[o]=c}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function um(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.materialVariant!==t.materialVariant?i.materialVariant-t.materialVariant:i.z!==t.z?i.z-t.z:i.id-t.id}function yh(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function Mh(){let i=[],t=0,e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function a(h){let p=0;return h.isInstancedMesh&&(p+=2),h.isSkinnedMesh&&(p+=1),p}function o(h,p,w,S,g,d){let b=i[t];return b===void 0?(b={id:h.id,object:h,geometry:p,material:w,materialVariant:a(h),groupOrder:S,renderOrder:h.renderOrder,z:g,group:d},i[t]=b):(b.id=h.id,b.object=h,b.geometry=p,b.material=w,b.materialVariant=a(h),b.groupOrder=S,b.renderOrder=h.renderOrder,b.z=g,b.group=d),t++,b}function c(h,p,w,S,g,d,b){b.reversedDepth===!0&&(g=-g);let T=o(h,p,w,S,g,d);w.transmission>0?n.push(T):w.transparent===!0?s.push(T):e.push(T)}function l(h,p,w,S,g,d){let b=o(h,p,w,S,g,d);w.transmission>0?n.unshift(b):w.transparent===!0?s.unshift(b):e.unshift(b)}function u(h,p){e.length>1&&e.sort(h||um),n.length>1&&n.sort(p||yh),s.length>1&&s.sort(p||yh)}function f(){for(let h=t,p=i.length;h<p;h++){let w=i[h];if(w.id===null)break;w.id=null,w.object=null,w.geometry=null,w.material=null,w.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:c,unshift:l,finish:f,sort:u}}function dm(){let i=new WeakMap;function t(n,s){let r=i.get(n),a;return r===void 0?(a=new Mh,i.set(n,[a])):s>=r.length?(a=new Mh,r.push(a)):a=r[s],a}function e(){i=new WeakMap}return{get:t,dispose:e}}function fm(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new F,color:new yt};break;case"SpotLight":e={position:new F,direction:new F,color:new yt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new F,color:new yt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new F,skyColor:new yt,groundColor:new yt};break;case"RectAreaLight":e={color:new yt,position:new F,halfWidth:new F,halfHeight:new F};break}return i[t.id]=e,e}}}function pm(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Bt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Bt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Bt,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}var Am=0;function mm(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function gm(i){let t=new fm,e=pm(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new F);let s=new F,r=new ae,a=new ae;function o(l){let u=0,f=0,h=0;for(let N=0;N<9;N++)n.probe[N].set(0,0,0);let p=0,w=0,S=0,g=0,d=0,b=0,T=0,y=0,_=0,x=0,E=0,A=0,M=0,I=0;l.sort(mm);for(let N=0,k=l.length;N<k;N++){let B=l[N],H=B.color,K=B.intensity,W=B.distance,nt=null;if(B.shadow&&B.shadow.map&&(B.shadow.map.texture.format===qn?nt=B.shadow.map.texture:nt=B.shadow.map.depthTexture||B.shadow.map.texture),B.isAmbientLight)u+=H.r*K,f+=H.g*K,h+=H.b*K;else if(B.isLightProbe){for(let J=0;J<9;J++)n.probe[J].addScaledVector(B.sh.coefficients[J],K);I++}else if(B.isSunLight){let J=t.get(B);if(J.color.copy(B.color).multiplyScalar(B.intensity),B.castShadow){let j=B.shadow,tt=e.get(B);tt.shadowIntensity=j.intensity,tt.shadowBias=j.bias,tt.shadowNormalBias=j.normalBias,tt.shadowRadius=j.radius,tt.shadowMapSize.copy(j.mapSize).multiply(j.getFrameExtents()),n.sunShadow[w]=tt,n.sunShadowMap[w]=nt;let Mt=j.getViewportCount();for(let Ct=0;Ct<Mt;Ct++)n.sunShadowMatrix[S+Ct]=j.getMatrix(Ct),n.sunShadowCascade[S+Ct]=j._cascadeData[Ct];S+=Mt,w++}n.sun[p]=J,p++}else if(B.isDirectionalLight){let J=t.get(B);if(J.color.copy(B.color).multiplyScalar(B.intensity),B.castShadow){let j=B.shadow,tt=e.get(B);tt.shadowIntensity=j.intensity,tt.shadowBias=j.bias,tt.shadowNormalBias=j.normalBias,tt.shadowRadius=j.radius,tt.shadowMapSize=j.mapSize,n.directionalShadow[g]=tt,n.directionalShadowMap[g]=nt,n.directionalShadowMatrix[g]=B.shadow.matrix,_++}n.directional[g]=J,g++}else if(B.isSpotLight){let J=t.get(B);J.position.setFromMatrixPosition(B.matrixWorld),J.color.copy(H).multiplyScalar(K),J.distance=W,J.coneCos=Math.cos(B.angle),J.penumbraCos=Math.cos(B.angle*(1-B.penumbra)),J.decay=B.decay,n.spot[b]=J;let j=B.shadow;if(B.map&&(n.spotLightMap[A]=B.map,A++,j.updateMatrices(B),B.castShadow&&M++),n.spotLightMatrix[b]=j.matrix,B.castShadow){let tt=e.get(B);tt.shadowIntensity=j.intensity,tt.shadowBias=j.bias,tt.shadowNormalBias=j.normalBias,tt.shadowRadius=j.radius,tt.shadowMapSize=j.mapSize,n.spotShadow[b]=tt,n.spotShadowMap[b]=nt,E++}b++}else if(B.isRectAreaLight){let J=t.get(B);J.color.copy(H).multiplyScalar(K),J.halfWidth.set(B.width*.5,0,0),J.halfHeight.set(0,B.height*.5,0),n.rectArea[T]=J,T++}else if(B.isPointLight){let J=t.get(B);if(J.color.copy(B.color).multiplyScalar(B.intensity),J.distance=B.distance,J.decay=B.decay,B.castShadow){let j=B.shadow,tt=e.get(B);tt.shadowIntensity=j.intensity,tt.shadowBias=j.bias,tt.shadowNormalBias=j.normalBias,tt.shadowRadius=j.radius,tt.shadowMapSize=j.mapSize,tt.shadowCameraNear=j.camera.near,tt.shadowCameraFar=j.camera.far,n.pointShadow[d]=tt,n.pointShadowMap[d]=nt,n.pointShadowMatrix[d]=B.shadow.matrix,x++}n.point[d]=J,d++}else if(B.isHemisphereLight){let J=t.get(B);J.skyColor.copy(B.color).multiplyScalar(K),J.groundColor.copy(B.groundColor).multiplyScalar(K),n.hemi[y]=J,y++}}T>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ht.LTC_FLOAT_1,n.rectAreaLTC2=ht.LTC_FLOAT_2):(n.rectAreaLTC1=ht.LTC_HALF_1,n.rectAreaLTC2=ht.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=f,n.ambient[2]=h;let R=n.hash;(R.sunLength!==p||R.directionalLength!==g||R.pointLength!==d||R.spotLength!==b||R.rectAreaLength!==T||R.hemiLength!==y||R.numSunShadows!==w||R.numDirectionalShadows!==_||R.numPointShadows!==x||R.numSpotShadows!==E||R.numSpotMaps!==A||R.numLightProbes!==I)&&(n.sun.length=p,n.directional.length=g,n.spot.length=b,n.rectArea.length=T,n.point.length=d,n.hemi.length=y,n.sunShadow.length=w,n.sunShadowMap.length=w,n.sunShadowMatrix.length=S,n.sunShadowCascade.length=S,n.directionalShadow.length=_,n.directionalShadowMap.length=_,n.directionalShadowMatrix.length=_,n.pointShadow.length=x,n.pointShadowMap.length=x,n.pointShadowMatrix.length=x,n.spotShadow.length=E,n.spotShadowMap.length=E,n.spotLightMatrix.length=E+A-M,n.spotLightMap.length=A,n.numSpotLightShadowsWithMaps=M,n.numLightProbes=I,R.sunLength=p,R.directionalLength=g,R.pointLength=d,R.spotLength=b,R.rectAreaLength=T,R.hemiLength=y,R.numSunShadows=w,R.numDirectionalShadows=_,R.numPointShadows=x,R.numSpotShadows=E,R.numSpotMaps=A,R.numLightProbes=I,n.version=Am++)}function c(l,u){let f=0,h=0,p=0,w=0,S=0,g=0,d=u.matrixWorldInverse;for(let b=0,T=l.length;b<T;b++){let y=l[b];if(y.isSunLight){let _=n.sun[f];_.direction.setFromMatrixPosition(y.matrixWorld),_.direction.transformDirection(d),f++}else if(y.isDirectionalLight){let _=n.directional[h];_.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),_.direction.sub(s),_.direction.transformDirection(d),h++}else if(y.isSpotLight){let _=n.spot[w];_.position.setFromMatrixPosition(y.matrixWorld),_.position.applyMatrix4(d),_.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),_.direction.sub(s),_.direction.transformDirection(d),w++}else if(y.isRectAreaLight){let _=n.rectArea[S];_.position.setFromMatrixPosition(y.matrixWorld),_.position.applyMatrix4(d),a.identity(),r.copy(y.matrixWorld),r.premultiply(d),a.extractRotation(r),_.halfWidth.set(y.width*.5,0,0),_.halfHeight.set(0,y.height*.5,0),_.halfWidth.applyMatrix4(a),_.halfHeight.applyMatrix4(a),S++}else if(y.isPointLight){let _=n.point[p];_.position.setFromMatrixPosition(y.matrixWorld),_.position.applyMatrix4(d),p++}else if(y.isHemisphereLight){let _=n.hemi[g];_.direction.setFromMatrixPosition(y.matrixWorld),_.direction.transformDirection(d),g++}}}return{setup:o,setupView:c,state:n}}function Sh(i){let t=new gm(i),e=[],n=[],s=[];function r(h){f.camera=h,e.length=0,n.length=0,s.length=0}function a(h){e.push(h)}function o(h){n.push(h)}function c(h){s.push(h)}function l(){t.setup(e)}function u(h){t.setupView(e,h)}let f={lightsArray:e,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:f,setupLights:l,setupLightsView:u,pushLight:a,pushShadow:o,pushLightProbeGrid:c}}function wm(i){let t=new WeakMap;function e(s,r=0){let a=t.get(s),o;return a===void 0?(o=new Sh(i),t.set(s,[o])):r>=a.length?(o=new Sh(i),a.push(o)):o=a[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}var xm=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,vm=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,_m=[new F(1,0,0),new F(-1,0,0),new F(0,1,0),new F(0,-1,0),new F(0,0,1),new F(0,0,-1)],ym=[new F(0,-1,0),new F(0,-1,0),new F(0,0,1),new F(0,0,-1),new F(0,-1,0),new F(0,-1,0)],Eh=new ae,Ds=new F,wl=new F;function Mm(i,t,e){let n=new Oi,s=new Bt,r=new Bt,a=new le,o=new Fr,c=new Nr,l={},u=e.maxTextureSize,f={[wn]:ye,[ye]:wn,[Ve]:Ve},h=new Ce({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Bt},radius:{value:4}},vertexShader:xm,fragmentShader:vm}),p=h.clone();p.defines.HORIZONTAL_PASS=1;let w=new Ee;w.setAttribute("position",new he(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let S=new de(w,h),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=ys;let d=this.type;this.render=function(x,E,A){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||x.length===0)return;this.type===yc&&(Pt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=ys);let M=i.getRenderTarget(),I=i.getActiveCubeFace(),R=i.getActiveMipmapLevel(),N=i.state;N.setBlending(xn),N.buffers.depth.getReversed()===!0?N.buffers.color.setClear(0,0,0,0):N.buffers.color.setClear(1,1,1,1),N.buffers.depth.setTest(!0),N.setScissorTest(!1);let k=d!==this.type;k&&E.traverse(function(B){B.material&&(Array.isArray(B.material)?B.material.forEach(H=>H.needsUpdate=!0):B.material.needsUpdate=!0)});for(let B=0,H=x.length;B<H;B++){let K=x[B],W=K.shadow;if(W===void 0){Pt("WebGLShadowMap:",K,"has no shadow.");continue}if(W.autoUpdate===!1&&W.needsUpdate===!1)continue;s.copy(W.mapSize);let nt=W.getFrameExtents();s.multiply(nt),r.copy(W.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/nt.x),s.x=r.x*nt.x,W.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/nt.y),s.y=r.y*nt.y,W.mapSize.y=r.y));let J=i.state.buffers.depth.getReversed();if(W.camera._reversedDepth=J,W.map===null||k===!0){if(W.map!==null&&(W.map.depthTexture!==null&&(W.map.depthTexture.dispose(),W.map.depthTexture=null),W.map.dispose()),this.type===zi){if(K.isPointLight){Pt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}W.map=new Qe(s.x,s.y,{format:qn,type:ln,minFilter:Me,magFilter:Me,generateMipmaps:!1}),W.map.texture.name=K.name+".shadowMap",W.map.depthTexture=new Hn(s.x,s.y,on),W.map.depthTexture.name=K.name+".shadowMapDepth",W.map.depthTexture.format=pn,W.map.depthTexture.compareFunction=null,W.map.depthTexture.minFilter=_e,W.map.depthTexture.magFilter=_e}else K.isPointLight?(W.map=new Va(s.x),W.map.depthTexture=new Rr(s.x,an)):(W.map=new Qe(s.x,s.y),W.map.depthTexture=new Hn(s.x,s.y,an)),W.map.depthTexture.name=K.name+".shadowMap",W.map.depthTexture.format=pn,this.type===ys?(W.map.depthTexture.compareFunction=J?Ha:ka,W.map.depthTexture.minFilter=Me,W.map.depthTexture.magFilter=Me):(W.map.depthTexture.compareFunction=null,W.map.depthTexture.minFilter=_e,W.map.depthTexture.magFilter=_e);W.camera.updateProjectionMatrix()}W.map.isWebGLCubeRenderTarget!==!0&&(W.map.width!==s.x||W.map.height!==s.y)&&W.map.setSize(s.x,s.y);let j=W.map.isWebGLCubeRenderTarget?6:W.getViewportCount();K.isPointLight!==!0&&W.updateMatrices(K,A);for(let tt=0;tt<j;tt++){let Mt=W.getCamera(tt);if(K.isPointLight){let Ct=W.camera,te=W.matrix,zt=K.distance||Ct.far;zt!==Ct.far&&(Ct.far=zt,Ct.updateProjectionMatrix()),Ds.setFromMatrixPosition(K.matrixWorld),Ct.position.copy(Ds),wl.copy(Ct.position),wl.add(_m[tt]),Ct.up.copy(ym[tt]),Ct.lookAt(wl),Ct.updateMatrixWorld(),te.makeTranslation(-Ds.x,-Ds.y,-Ds.z),Eh.multiplyMatrices(Ct.projectionMatrix,Ct.matrixWorldInverse),W._frustum.setFromProjectionMatrix(Eh,Ct.coordinateSystem,Ct.reversedDepth)}if(W.map.isWebGLCubeRenderTarget)i.setRenderTarget(W.map,tt),i.clear();else{tt===0&&(i.setRenderTarget(W.map),i.clear());let Ct=W.getViewport(tt);a.set(r.x*Ct.x,r.y*Ct.y,r.x*Ct.z,r.y*Ct.w),N.viewport(a)}n=W.getFrustum(tt),y(E,A,Mt,K,this.type)}W.isPointLightShadow!==!0&&this.type===zi&&b(W,A),W.needsUpdate=!1}d=this.type,g.needsUpdate=!1,i.setRenderTarget(M,I,R)};function b(x,E){let A=t.update(S);h.defines.VSM_SAMPLES!==x.blurSamples&&(h.defines.VSM_SAMPLES=x.blurSamples,p.defines.VSM_SAMPLES=x.blurSamples,h.needsUpdate=!0,p.needsUpdate=!0),x.mapPass===null?x.mapPass=new Qe(s.x,s.y,{format:qn,type:ln}):(x.mapPass.width!==x.map.width||x.mapPass.height!==x.map.height)&&x.mapPass.setSize(x.map.width,x.map.height),h.uniforms.shadow_pass.value=x.map.depthTexture,h.uniforms.resolution.value.set(x.map.width,x.map.height),h.uniforms.radius.value=x.radius,i.setRenderTarget(x.mapPass),i.clear(),i.renderBufferDirect(E,null,A,h,S,null),p.uniforms.shadow_pass.value=x.mapPass.texture,p.uniforms.resolution.value.set(x.map.width,x.map.height),p.uniforms.radius.value=x.radius,i.setRenderTarget(x.map),i.clear(),i.renderBufferDirect(E,null,A,p,S,null)}function T(x,E,A,M){let I=null,R=A.isPointLight===!0?x.customDistanceMaterial:x.customDepthMaterial;if(R!==void 0)I=R;else if(I=A.isPointLight===!0?c:o,i.localClippingEnabled&&E.clipShadows===!0&&Array.isArray(E.clippingPlanes)&&E.clippingPlanes.length!==0||E.displacementMap&&E.displacementScale!==0||E.alphaMap&&E.alphaTest>0||E.map&&E.alphaTest>0||E.alphaToCoverage===!0){let N=I.uuid,k=E.uuid,B=l[N];B===void 0&&(B={},l[N]=B);let H=B[k];H===void 0&&(H=I.clone(),B[k]=H,E.addEventListener("dispose",_)),I=H}if(I.visible=E.visible,I.wireframe=E.wireframe,M===zi?I.side=E.shadowSide!==null?E.shadowSide:E.side:I.side=E.shadowSide!==null?E.shadowSide:f[E.side],I.alphaMap=E.alphaMap,I.alphaTest=E.alphaToCoverage===!0?.5:E.alphaTest,I.map=E.map,I.clipShadows=E.clipShadows,I.clippingPlanes=E.clippingPlanes,I.clipIntersection=E.clipIntersection,I.displacementMap=E.displacementMap,I.displacementScale=E.displacementScale,I.displacementBias=E.displacementBias,I.wireframeLinewidth=E.wireframeLinewidth,I.linewidth=E.linewidth,A.isPointLight===!0&&I.isMeshDistanceMaterial===!0){let N=i.properties.get(I);N.light=A}return I}function y(x,E,A,M,I){if(x.visible===!1)return;if(x.layers.test(E.layers)&&(x.isMesh||x.isLine||x.isPoints)&&(x.castShadow||x.receiveShadow&&I===zi)&&(!x.frustumCulled||x.intersectsFrustum(n))){x.modelViewMatrix.multiplyMatrices(A.matrixWorldInverse,x.matrixWorld);let k=t.update(x),B=x.material;if(Array.isArray(B)){let H=k.groups;for(let K=0,W=H.length;K<W;K++){let nt=H[K],J=B[nt.materialIndex];if(J&&J.visible){let j=T(x,J,M,I);x.onBeforeShadow(i,x,E,A,k,j,nt),i.renderBufferDirect(A,null,k,j,x,nt),x.onAfterShadow(i,x,E,A,k,j,nt)}}}else if(B.visible){let H=T(x,B,M,I);x.onBeforeShadow(i,x,E,A,k,H,null),i.renderBufferDirect(A,null,k,H,x,null),x.onAfterShadow(i,x,E,A,k,H,null)}}let N=x.children;for(let k=0,B=N.length;k<B;k++)y(N[k],E,A,M,I)}function _(x){x.target.removeEventListener("dispose",_);for(let A in l){let M=l[A],I=x.target.uuid;I in M&&(M[I].dispose(),delete M[I])}}}function Sm(i,t){function e(){let L=!1,ot=new le,q=null,lt=new le(0,0,0,0);return{setMask:function(ft){q!==ft&&!L&&(i.colorMask(ft,ft,ft,ft),q=ft)},setLocked:function(ft){L=ft},setClear:function(ft,et,bt,vt,ne){ne===!0&&(ft*=vt,et*=vt,bt*=vt),ot.set(ft,et,bt,vt),lt.equals(ot)===!1&&(i.clearColor(ft,et,bt,vt),lt.copy(ot))},reset:function(){L=!1,q=null,lt.set(-1,0,0,0)}}}function n(){let L=!1,ot=!1,q=null,lt=null,ft=null;return{setReversed:function(et){if(ot!==et){let bt=t.get("EXT_clip_control");et?bt.clipControlEXT(bt.LOWER_LEFT_EXT,bt.ZERO_TO_ONE_EXT):bt.clipControlEXT(bt.LOWER_LEFT_EXT,bt.NEGATIVE_ONE_TO_ONE_EXT),ot=et;let vt=ft;ft=null,this.setClear(vt)}},getReversed:function(){return ot},setTest:function(et){et?$(i.DEPTH_TEST):gt(i.DEPTH_TEST)},setMask:function(et){q!==et&&!L&&(i.depthMask(et),q=et)},setFunc:function(et){if(ot&&(et=$c[et]),lt!==et){switch(et){case mr:i.depthFunc(i.NEVER);break;case gr:i.depthFunc(i.ALWAYS);break;case wr:i.depthFunc(i.LESS);break;case Li:i.depthFunc(i.LEQUAL);break;case xr:i.depthFunc(i.EQUAL);break;case vr:i.depthFunc(i.GEQUAL);break;case _r:i.depthFunc(i.GREATER);break;case yr:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}lt=et}},setLocked:function(et){L=et},setClear:function(et){ft!==et&&(ft=et,ot&&(et=1-et),i.clearDepth(et))},reset:function(){L=!1,q=null,lt=null,ft=null,ot=!1}}}function s(){let L=!1,ot=null,q=null,lt=null,ft=null,et=null,bt=null,vt=null,ne=null;return{setTest:function(Xt){L||(Xt?$(i.STENCIL_TEST):gt(i.STENCIL_TEST))},setMask:function(Xt){ot!==Xt&&!L&&(i.stencilMask(Xt),ot=Xt)},setFunc:function(Xt,je,cn){(q!==Xt||lt!==je||ft!==cn)&&(i.stencilFunc(Xt,je,cn),q=Xt,lt=je,ft=cn)},setOp:function(Xt,je,cn){(et!==Xt||bt!==je||vt!==cn)&&(i.stencilOp(Xt,je,cn),et=Xt,bt=je,vt=cn)},setLocked:function(Xt){L=Xt},setClear:function(Xt){ne!==Xt&&(i.clearStencil(Xt),ne=Xt)},reset:function(){L=!1,ot=null,q=null,lt=null,ft=null,et=null,bt=null,vt=null,ne=null}}}let r=new e,a=new n,o=new s,c=new WeakMap,l=new WeakMap,u={},f={},h={},p=new WeakMap,w=[],S=null,g=!1,d=null,b=null,T=null,y=null,_=null,x=null,E=null,A=new yt(0,0,0),M=0,I=!1,R=null,N=null,k=null,B=null,H=null,K=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),W=!1,nt=0,J=i.getParameter(i.VERSION);J.indexOf("WebGL")!==-1?(nt=parseFloat(/^WebGL (\d)/.exec(J)[1]),W=nt>=1):J.indexOf("OpenGL ES")!==-1&&(nt=parseFloat(/^OpenGL ES (\d)/.exec(J)[1]),W=nt>=2);let j=null,tt={},Mt=i.getParameter(i.SCISSOR_BOX),Ct=i.getParameter(i.VIEWPORT),te=new le().fromArray(Mt),zt=new le().fromArray(Ct);function Wt(L,ot,q,lt){let ft=new Uint8Array(4),et=i.createTexture();i.bindTexture(L,et),i.texParameteri(L,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(L,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let bt=0;bt<q;bt++)L===i.TEXTURE_3D||L===i.TEXTURE_2D_ARRAY?i.texImage3D(ot,0,i.RGBA,1,1,lt,0,i.RGBA,i.UNSIGNED_BYTE,ft):i.texImage2D(ot+bt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ft);return et}let X={};X[i.TEXTURE_2D]=Wt(i.TEXTURE_2D,i.TEXTURE_2D,1),X[i.TEXTURE_CUBE_MAP]=Wt(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),X[i.TEXTURE_2D_ARRAY]=Wt(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),X[i.TEXTURE_3D]=Wt(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),$(i.DEPTH_TEST),a.setFunc(Li),Qt(!1),oe(Fo),$(i.CULL_FACE),Vt(xn);function $(L){u[L]!==!0&&(i.enable(L),u[L]=!0)}function gt(L){u[L]!==!1&&(i.disable(L),u[L]=!1)}function Rt(L,ot){return h[L]!==ot?(i.bindFramebuffer(L,ot),h[L]=ot,L===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=ot),L===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=ot),!0):!1}function At(L,ot){let q=w,lt=!1;if(L){q=p.get(ot),q===void 0&&(q=[],p.set(ot,q));let ft=L.textures;if(q.length!==ft.length||q[0]!==i.COLOR_ATTACHMENT0){for(let et=0,bt=ft.length;et<bt;et++)q[et]=i.COLOR_ATTACHMENT0+et;q.length=ft.length,lt=!0}}else q[0]!==i.BACK&&(q[0]=i.BACK,lt=!0);lt&&i.drawBuffers(q)}function Nt(L){return S!==L?(i.useProgram(L),S=L,!0):!1}let me={[Pn]:i.FUNC_ADD,[Mc]:i.FUNC_SUBTRACT,[Sc]:i.FUNC_REVERSE_SUBTRACT};me[Ec]=i.MIN,me[Cc]=i.MAX;let Ot={[ta]:i.ZERO,[Ms]:i.ONE,[bc]:i.SRC_COLOR,[Ss]:i.SRC_ALPHA,[Rc]:i.SRC_ALPHA_SATURATE,[Bc]:i.DST_COLOR,[Ic]:i.DST_ALPHA,[Tc]:i.ONE_MINUS_SRC_COLOR,[Qo]:i.ONE_MINUS_SRC_ALPHA,[Lc]:i.ONE_MINUS_DST_COLOR,[Pc]:i.ONE_MINUS_DST_ALPHA,[Uc]:i.CONSTANT_COLOR,[Dc]:i.ONE_MINUS_CONSTANT_COLOR,[Fc]:i.CONSTANT_ALPHA,[Nc]:i.ONE_MINUS_CONSTANT_ALPHA};function Vt(L,ot,q,lt,ft,et,bt,vt,ne,Xt){if(L===xn){g===!0&&(gt(i.BLEND),g=!1);return}if(g===!1&&($(i.BLEND),g=!0),L!==$r){if(L!==d||Xt!==I){if((b!==Pn||_!==Pn)&&(i.blendEquation(i.FUNC_ADD),b=Pn,_=Pn),Xt)switch(L){case Ji:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case No:i.blendFunc(i.ONE,i.ONE);break;case Oo:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Go:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:It("WebGLState: Invalid blending: ",L);break}else switch(L){case Ji:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case No:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Oo:It("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Go:It("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:It("WebGLState: Invalid blending: ",L);break}T=null,y=null,x=null,E=null,A.set(0,0,0),M=0,d=L,I=Xt}return}ft=ft||ot,et=et||q,bt=bt||lt,(ot!==b||ft!==_)&&(i.blendEquationSeparate(me[ot],me[ft]),b=ot,_=ft),(q!==T||lt!==y||et!==x||bt!==E)&&(i.blendFuncSeparate(Ot[q],Ot[lt],Ot[et],Ot[bt]),T=q,y=lt,x=et,E=bt),(vt.equals(A)===!1||ne!==M)&&(i.blendColor(vt.r,vt.g,vt.b,ne),A.copy(vt),M=ne),d=L,I=!1}function ee(L,ot){L.side===Ve?gt(i.CULL_FACE):$(i.CULL_FACE);let q=L.side===ye;ot&&(q=!q),Qt(q),L.blending===Ji&&L.transparent===!1?Vt(xn):Vt(L.blending,L.blendEquation,L.blendSrc,L.blendDst,L.blendEquationAlpha,L.blendSrcAlpha,L.blendDstAlpha,L.blendColor,L.blendAlpha,L.premultipliedAlpha),a.setFunc(L.depthFunc),a.setTest(L.depthTest),a.setMask(L.depthWrite),r.setMask(L.colorWrite);let lt=L.stencilWrite;o.setTest(lt),lt&&(o.setMask(L.stencilWriteMask),o.setFunc(L.stencilFunc,L.stencilRef,L.stencilFuncMask),o.setOp(L.stencilFail,L.stencilZFail,L.stencilZPass)),Oe(L.polygonOffset,L.polygonOffsetFactor,L.polygonOffsetUnits),L.alphaToCoverage===!0?$(i.SAMPLE_ALPHA_TO_COVERAGE):gt(i.SAMPLE_ALPHA_TO_COVERAGE)}function Qt(L){R!==L&&(L?i.frontFace(i.CW):i.frontFace(i.CCW),R=L)}function oe(L){L!==vc?($(i.CULL_FACE),L!==N&&(L===Fo?i.cullFace(i.BACK):L===_c?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):gt(i.CULL_FACE),N=L}function xe(L){L!==k&&(W&&i.lineWidth(L),k=L)}function Oe(L,ot,q){L?($(i.POLYGON_OFFSET_FILL),(B!==ot||H!==q)&&(B=ot,H=q,a.getReversed()&&(ot=-ot),i.polygonOffset(ot,q))):gt(i.POLYGON_OFFSET_FILL)}function ce(L){L?$(i.SCISSOR_TEST):gt(i.SCISSOR_TEST)}function fe(L){L===void 0&&(L=i.TEXTURE0+K-1),j!==L&&(i.activeTexture(L),j=L)}function U(L,ot,q){q===void 0&&(j===null?q=i.TEXTURE0+K-1:q=j);let lt=tt[q];lt===void 0&&(lt={type:void 0,texture:void 0},tt[q]=lt),(lt.type!==L||lt.texture!==ot)&&(j!==q&&(i.activeTexture(q),j=q),i.bindTexture(L,ot||X[L]),lt.type=L,lt.texture=ot)}function be(){let L=tt[j];L!==void 0&&L.type!==void 0&&(i.bindTexture(L.type,null),L.type=void 0,L.texture=void 0)}function qt(){try{i.compressedTexImage2D(...arguments)}catch(L){It("WebGLState:",L)}}function C(){try{i.compressedTexImage3D(...arguments)}catch(L){It("WebGLState:",L)}}function m(){try{i.texSubImage2D(...arguments)}catch(L){It("WebGLState:",L)}}function D(){try{i.texSubImage3D(...arguments)}catch(L){It("WebGLState:",L)}}function Q(){try{i.compressedTexSubImage2D(...arguments)}catch(L){It("WebGLState:",L)}}function V(){try{i.compressedTexSubImage3D(...arguments)}catch(L){It("WebGLState:",L)}}function it(){try{i.texStorage2D(...arguments)}catch(L){It("WebGLState:",L)}}function st(){try{i.texStorage3D(...arguments)}catch(L){It("WebGLState:",L)}}function Y(){try{i.texImage2D(...arguments)}catch(L){It("WebGLState:",L)}}function Z(){try{i.texImage3D(...arguments)}catch(L){It("WebGLState:",L)}}function rt(L){return f[L]!==void 0?f[L]:i.getParameter(L)}function St(L,ot){f[L]!==ot&&(i.pixelStorei(L,ot),f[L]=ot)}function ct(L){te.equals(L)===!1&&(i.scissor(L.x,L.y,L.z,L.w),te.copy(L))}function at(L){zt.equals(L)===!1&&(i.viewport(L.x,L.y,L.z,L.w),zt.copy(L))}function Et(L,ot){let q=l.get(ot);q===void 0&&(q=new WeakMap,l.set(ot,q));let lt=q.get(L);lt===void 0&&(lt=i.getUniformBlockIndex(ot,L.name),q.set(L,lt))}function Tt(L,ot){let lt=l.get(ot).get(L);c.get(ot)!==lt&&(i.uniformBlockBinding(ot,lt,L.__bindingPointIndex),c.set(ot,lt))}function Ut(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),u={},f={},j=null,tt={},h={},p=new WeakMap,w=[],S=null,g=!1,d=null,b=null,T=null,y=null,_=null,x=null,E=null,A=new yt(0,0,0),M=0,I=!1,R=null,N=null,k=null,B=null,H=null,te.set(0,0,i.canvas.width,i.canvas.height),zt.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:$,disable:gt,bindFramebuffer:Rt,drawBuffers:At,useProgram:Nt,setBlending:Vt,setMaterial:ee,setFlipSided:Qt,setCullFace:oe,setLineWidth:xe,setPolygonOffset:Oe,setScissorTest:ce,activeTexture:fe,bindTexture:U,unbindTexture:be,compressedTexImage2D:qt,compressedTexImage3D:C,texImage2D:Y,texImage3D:Z,pixelStorei:St,getParameter:rt,updateUBOMapping:Et,uniformBlockBinding:Tt,texStorage2D:it,texStorage3D:st,texSubImage2D:m,texSubImage3D:D,compressedTexSubImage2D:Q,compressedTexSubImage3D:V,scissor:ct,viewport:at,reset:Ut}}function Em(i,t,e,n,s,r,a){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new Bt,u=new WeakMap,f=new Set,h,p=new WeakMap,w=!1;try{w=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function S(C,m){return w?new OffscreenCanvas(C,m):ls("canvas")}function g(C,m,D){let Q=1,V=qt(C);if((V.width>D||V.height>D)&&(Q=D/Math.max(V.width,V.height)),Q<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){let it=Math.floor(Q*V.width),st=Math.floor(Q*V.height);h===void 0&&(h=S(it,st));let Y=m?S(it,st):h;return Y.width=it,Y.height=st,Y.getContext("2d").drawImage(C,0,0,it,st),Pt("WebGLRenderer: Texture has been resized from ("+V.width+"x"+V.height+") to ("+it+"x"+st+")."),Y}else return"data"in C&&Pt("WebGLRenderer: Image in DataTexture is too big ("+V.width+"x"+V.height+")."),C;return C}function d(C){return C.generateMipmaps}function b(C){i.generateMipmap(C)}function T(C){return C.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?i.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function y(C,m,D,Q,V,it=!1){if(C!==null){if(i[C]!==void 0)return i[C];Pt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let st;Q&&(st=t.get("EXT_texture_norm16"),st||Pt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Y=m;if(m===i.RED&&(D===i.FLOAT&&(Y=i.R32F),D===i.HALF_FLOAT&&(Y=i.R16F),D===i.UNSIGNED_BYTE&&(Y=i.R8),D===i.UNSIGNED_SHORT&&st&&(Y=st.R16_EXT),D===i.SHORT&&st&&(Y=st.R16_SNORM_EXT)),m===i.RED_INTEGER&&(D===i.UNSIGNED_BYTE&&(Y=i.R8UI),D===i.UNSIGNED_SHORT&&(Y=i.R16UI),D===i.UNSIGNED_INT&&(Y=i.R32UI),D===i.BYTE&&(Y=i.R8I),D===i.SHORT&&(Y=i.R16I),D===i.INT&&(Y=i.R32I)),m===i.RG&&(D===i.FLOAT&&(Y=i.RG32F),D===i.HALF_FLOAT&&(Y=i.RG16F),D===i.UNSIGNED_BYTE&&(Y=i.RG8),D===i.UNSIGNED_SHORT&&st&&(Y=st.RG16_EXT),D===i.SHORT&&st&&(Y=st.RG16_SNORM_EXT)),m===i.RG_INTEGER&&(D===i.UNSIGNED_BYTE&&(Y=i.RG8UI),D===i.UNSIGNED_SHORT&&(Y=i.RG16UI),D===i.UNSIGNED_INT&&(Y=i.RG32UI),D===i.BYTE&&(Y=i.RG8I),D===i.SHORT&&(Y=i.RG16I),D===i.INT&&(Y=i.RG32I)),m===i.RGB_INTEGER&&(D===i.UNSIGNED_BYTE&&(Y=i.RGB8UI),D===i.UNSIGNED_SHORT&&(Y=i.RGB16UI),D===i.UNSIGNED_INT&&(Y=i.RGB32UI),D===i.BYTE&&(Y=i.RGB8I),D===i.SHORT&&(Y=i.RGB16I),D===i.INT&&(Y=i.RGB32I)),m===i.RGBA_INTEGER&&(D===i.UNSIGNED_BYTE&&(Y=i.RGBA8UI),D===i.UNSIGNED_SHORT&&(Y=i.RGBA16UI),D===i.UNSIGNED_INT&&(Y=i.RGBA32UI),D===i.BYTE&&(Y=i.RGBA8I),D===i.SHORT&&(Y=i.RGBA16I),D===i.INT&&(Y=i.RGBA32I)),m===i.RGB&&(D===i.UNSIGNED_SHORT&&st&&(Y=st.RGB16_EXT),D===i.SHORT&&st&&(Y=st.RGB16_SNORM_EXT),D===i.UNSIGNED_INT_5_9_9_9_REV&&(Y=i.RGB9_E5),D===i.UNSIGNED_INT_10F_11F_11F_REV&&(Y=i.R11F_G11F_B10F)),m===i.RGBA){let Z=it?os:kt.getTransfer(V);D===i.FLOAT&&(Y=i.RGBA32F),D===i.HALF_FLOAT&&(Y=i.RGBA16F),D===i.UNSIGNED_BYTE&&(Y=Z===Kt?i.SRGB8_ALPHA8:i.RGBA8),D===i.UNSIGNED_SHORT&&st&&(Y=st.RGBA16_EXT),D===i.SHORT&&st&&(Y=st.RGBA16_SNORM_EXT),D===i.UNSIGNED_SHORT_4_4_4_4&&(Y=i.RGBA4),D===i.UNSIGNED_SHORT_5_5_5_1&&(Y=i.RGB5_A1)}return(Y===i.R16F||Y===i.R32F||Y===i.RG16F||Y===i.RG32F||Y===i.RGBA16F||Y===i.RGBA32F)&&t.get("EXT_color_buffer_float"),Y}function _(C,m){let D;return C?m===null||m===an||m===Wi?D=i.DEPTH24_STENCIL8:m===on?D=i.DEPTH32F_STENCIL8:m===Vi&&(D=i.DEPTH24_STENCIL8,Pt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):m===null||m===an||m===Wi?D=i.DEPTH_COMPONENT24:m===on?D=i.DEPTH_COMPONENT32F:m===Vi&&(D=i.DEPTH_COMPONENT16),D}function x(C,m){return d(C)===!0||C.isFramebufferTexture&&C.minFilter!==_e&&C.minFilter!==Me?Math.log2(Math.max(m.width,m.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?m.mipmaps.length:1}function E(C){let m=C.target;m.removeEventListener("dispose",E),M(m),m.isVideoTexture&&u.delete(m),m.isHTMLTexture&&f.delete(m)}function A(C){let m=C.target;m.removeEventListener("dispose",A),R(m)}function M(C){let m=n.get(C);if(m.__webglInit===void 0)return;let D=C.source,Q=p.get(D);if(Q){let V=Q[m.__cacheKey];V.usedTimes--,V.usedTimes===0&&I(C),Object.keys(Q).length===0&&p.delete(D)}n.remove(C)}function I(C){let m=n.get(C);i.deleteTexture(m.__webglTexture);let D=C.source,Q=p.get(D);delete Q[m.__cacheKey],a.memory.textures--}function R(C){let m=n.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),n.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let Q=0;Q<6;Q++){if(Array.isArray(m.__webglFramebuffer[Q]))for(let V=0;V<m.__webglFramebuffer[Q].length;V++)i.deleteFramebuffer(m.__webglFramebuffer[Q][V]);else i.deleteFramebuffer(m.__webglFramebuffer[Q]);m.__webglDepthbuffer&&i.deleteRenderbuffer(m.__webglDepthbuffer[Q])}else{if(Array.isArray(m.__webglFramebuffer))for(let Q=0;Q<m.__webglFramebuffer.length;Q++)i.deleteFramebuffer(m.__webglFramebuffer[Q]);else i.deleteFramebuffer(m.__webglFramebuffer);if(m.__webglDepthbuffer&&i.deleteRenderbuffer(m.__webglDepthbuffer),m.__webglMultisampledFramebuffer&&i.deleteFramebuffer(m.__webglMultisampledFramebuffer),m.__webglColorRenderbuffer)for(let Q=0;Q<m.__webglColorRenderbuffer.length;Q++)m.__webglColorRenderbuffer[Q]&&i.deleteRenderbuffer(m.__webglColorRenderbuffer[Q]);m.__webglDepthRenderbuffer&&i.deleteRenderbuffer(m.__webglDepthRenderbuffer)}let D=C.textures;for(let Q=0,V=D.length;Q<V;Q++){let it=n.get(D[Q]);it.__webglTexture&&(i.deleteTexture(it.__webglTexture),a.memory.textures--),n.remove(D[Q])}n.remove(C)}let N=0;function k(){N=0}function B(){return N}function H(C){N=C}function K(){let C=N;return C>=s.maxTextures&&Pt("WebGLTextures: Trying to use "+(C+1)+" texture units while this GPU supports only "+s.maxTextures),N+=1,C}function W(C){let m=[];return m.push(C.wrapS),m.push(C.wrapT),m.push(C.wrapR||0),m.push(C.magFilter),m.push(C.minFilter),m.push(C.anisotropy),m.push(C.internalFormat),m.push(C.format),m.push(C.type),m.push(C.generateMipmaps),m.push(C.premultiplyAlpha),m.push(C.flipY),m.push(C.unpackAlignment),m.push(C.colorSpace),m.join()}function nt(C,m){let D=n.get(C);if(C.isVideoTexture&&U(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&D.__version!==C.version){let Q=C.image;if(Q===null)Pt("WebGLRenderer: Texture marked for update but no image data found.");else if(Q.complete===!1)Pt("WebGLRenderer: Texture marked for update but image is incomplete");else{gt(D,C,m);return}}else C.isExternalTexture&&(D.__webglTexture=C.sourceTexture?C.sourceTexture:null);e.bindTexture(i.TEXTURE_2D,D.__webglTexture,i.TEXTURE0+m)}function J(C,m){let D=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&D.__version!==C.version){gt(D,C,m);return}else C.isExternalTexture&&(D.__webglTexture=C.sourceTexture?C.sourceTexture:null);e.bindTexture(i.TEXTURE_2D_ARRAY,D.__webglTexture,i.TEXTURE0+m)}function j(C,m){let D=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&D.__version!==C.version){gt(D,C,m);return}e.bindTexture(i.TEXTURE_3D,D.__webglTexture,i.TEXTURE0+m)}function tt(C,m){let D=n.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&D.__version!==C.version){Rt(D,C,m);return}e.bindTexture(i.TEXTURE_CUBE_MAP,D.__webglTexture,i.TEXTURE0+m)}let Mt={[Mr]:i.REPEAT,[fn]:i.CLAMP_TO_EDGE,[Sr]:i.MIRRORED_REPEAT},Ct={[_e]:i.NEAREST,[Qc]:i.NEAREST_MIPMAP_NEAREST,[bs]:i.NEAREST_MIPMAP_LINEAR,[Me]:i.LINEAR,[ia]:i.LINEAR_MIPMAP_NEAREST,[Yn]:i.LINEAR_MIPMAP_LINEAR},te={[Jc]:i.NEVER,[Kc]:i.ALWAYS,[Vc]:i.LESS,[ka]:i.LEQUAL,[Wc]:i.EQUAL,[Ha]:i.GEQUAL,[Xc]:i.GREATER,[Yc]:i.NOTEQUAL};function zt(C,m){if(m.type===on&&t.has("OES_texture_float_linear")===!1&&(m.magFilter===Me||m.magFilter===ia||m.magFilter===bs||m.magFilter===Yn||m.minFilter===Me||m.minFilter===ia||m.minFilter===bs||m.minFilter===Yn)&&Pt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(C,i.TEXTURE_WRAP_S,Mt[m.wrapS]),i.texParameteri(C,i.TEXTURE_WRAP_T,Mt[m.wrapT]),(C===i.TEXTURE_3D||C===i.TEXTURE_2D_ARRAY)&&i.texParameteri(C,i.TEXTURE_WRAP_R,Mt[m.wrapR]),i.texParameteri(C,i.TEXTURE_MAG_FILTER,Ct[m.magFilter]),i.texParameteri(C,i.TEXTURE_MIN_FILTER,Ct[m.minFilter]),m.compareFunction&&(i.texParameteri(C,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(C,i.TEXTURE_COMPARE_FUNC,te[m.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(m.magFilter===_e||m.minFilter!==bs&&m.minFilter!==Yn||m.type===on&&t.has("OES_texture_float_linear")===!1)return;if(m.anisotropy>1||n.get(m).__currentAnisotropy){let D=t.get("EXT_texture_filter_anisotropic");i.texParameterf(C,D.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(m.anisotropy,s.getMaxAnisotropy())),n.get(m).__currentAnisotropy=m.anisotropy}}}function Wt(C,m){let D=!1;C.__webglInit===void 0&&(C.__webglInit=!0,m.addEventListener("dispose",E));let Q=m.source,V=p.get(Q);V===void 0&&(V={},p.set(Q,V));let it=W(m);if(it!==C.__cacheKey){V[it]===void 0&&(V[it]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,D=!0),V[it].usedTimes++;let st=V[C.__cacheKey];st!==void 0&&(V[C.__cacheKey].usedTimes--,st.usedTimes===0&&I(m)),C.__cacheKey=it,C.__webglTexture=V[it].texture}return D}function X(C,m,D){return Math.floor(Math.floor(C/D)/m)}function $(C,m,D,Q){let it=C.updateRanges;if(it.length===0)e.texSubImage2D(i.TEXTURE_2D,0,0,0,m.width,m.height,D,Q,m.data);else{it.sort((St,ct)=>St.start-ct.start);let st=0;for(let St=1;St<it.length;St++){let ct=it[st],at=it[St],Et=ct.start+ct.count,Tt=X(at.start,m.width,4),Ut=X(ct.start,m.width,4);at.start<=Et+1&&Tt===Ut&&X(at.start+at.count-1,m.width,4)===Tt?ct.count=Math.max(ct.count,at.start+at.count-ct.start):(++st,it[st]=at)}it.length=st+1;let Y=e.getParameter(i.UNPACK_ROW_LENGTH),Z=e.getParameter(i.UNPACK_SKIP_PIXELS),rt=e.getParameter(i.UNPACK_SKIP_ROWS);e.pixelStorei(i.UNPACK_ROW_LENGTH,m.width);for(let St=0,ct=it.length;St<ct;St++){let at=it[St],Et=Math.floor(at.start/4),Tt=Math.ceil(at.count/4),Ut=Et%m.width,L=Math.floor(Et/m.width),ot=Tt,q=1;e.pixelStorei(i.UNPACK_SKIP_PIXELS,Ut),e.pixelStorei(i.UNPACK_SKIP_ROWS,L),e.texSubImage2D(i.TEXTURE_2D,0,Ut,L,ot,q,D,Q,m.data)}C.clearUpdateRanges(),e.pixelStorei(i.UNPACK_ROW_LENGTH,Y),e.pixelStorei(i.UNPACK_SKIP_PIXELS,Z),e.pixelStorei(i.UNPACK_SKIP_ROWS,rt)}}function gt(C,m,D){let Q=i.TEXTURE_2D;(m.isDataArrayTexture||m.isCompressedArrayTexture)&&(Q=i.TEXTURE_2D_ARRAY),m.isData3DTexture&&(Q=i.TEXTURE_3D);let V=Wt(C,m),it=m.source;e.bindTexture(Q,C.__webglTexture,i.TEXTURE0+D);let st=n.get(it);if(it.version!==st.__version||V===!0){if(e.activeTexture(i.TEXTURE0+D),(typeof ImageBitmap<"u"&&m.image instanceof ImageBitmap)===!1){let q=kt.getPrimaries(kt.workingColorSpace),lt=m.colorSpace===qe?null:kt.getPrimaries(m.colorSpace),ft=m.colorSpace===qe||q===lt?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,m.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,m.premultiplyAlpha),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ft)}e.pixelStorei(i.UNPACK_ALIGNMENT,m.unpackAlignment);let Z=g(m.image,!1,s.maxTextureSize);Z=be(m,Z);let rt=r.convert(m.format,m.colorSpace),St=r.convert(m.type),ct=y(m.internalFormat,rt,St,m.normalized,m.colorSpace,m.isVideoTexture);zt(Q,m);let at,Et=m.mipmaps,Tt=m.isVideoTexture!==!0,Ut=st.__version===void 0||V===!0,L=it.dataReady,ot=x(m,Z);if(m.isDepthTexture)ct=_(m.format===Kn,m.type),Ut&&(Tt?e.texStorage2D(i.TEXTURE_2D,1,ct,Z.width,Z.height):e.texImage2D(i.TEXTURE_2D,0,ct,Z.width,Z.height,0,rt,St,null));else if(m.isDataTexture)if(Et.length>0){Tt&&Ut&&e.texStorage2D(i.TEXTURE_2D,ot,ct,Et[0].width,Et[0].height);for(let q=0,lt=Et.length;q<lt;q++)at=Et[q],Tt?L&&e.texSubImage2D(i.TEXTURE_2D,q,0,0,at.width,at.height,rt,St,at.data):e.texImage2D(i.TEXTURE_2D,q,ct,at.width,at.height,0,rt,St,at.data);m.generateMipmaps=!1}else Tt?(Ut&&e.texStorage2D(i.TEXTURE_2D,ot,ct,Z.width,Z.height),L&&$(m,Z,rt,St)):e.texImage2D(i.TEXTURE_2D,0,ct,Z.width,Z.height,0,rt,St,Z.data);else if(m.isCompressedTexture)if(m.isCompressedArrayTexture){Tt&&Ut&&e.texStorage3D(i.TEXTURE_2D_ARRAY,ot,ct,Et[0].width,Et[0].height,Z.depth);for(let q=0,lt=Et.length;q<lt;q++)if(at=Et[q],m.format!==Ke)if(rt!==null)if(Tt){if(L)if(m.layerUpdates.size>0){let ft=ol(at.width,at.height,m.format,m.type);for(let et of m.layerUpdates){let bt=at.data.subarray(et*ft/at.data.BYTES_PER_ELEMENT,(et+1)*ft/at.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,q,0,0,et,at.width,at.height,1,rt,bt)}}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,q,0,0,0,at.width,at.height,Z.depth,rt,at.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,q,ct,at.width,at.height,Z.depth,0,at.data,0,0);else Pt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Tt?L&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,q,0,0,0,at.width,at.height,Z.depth,rt,St,at.data):e.texImage3D(i.TEXTURE_2D_ARRAY,q,ct,at.width,at.height,Z.depth,0,rt,St,at.data);m.layerUpdates.size>0&&m.clearLayerUpdates()}else{Tt&&Ut&&e.texStorage2D(i.TEXTURE_2D,ot,ct,Et[0].width,Et[0].height);for(let q=0,lt=Et.length;q<lt;q++)at=Et[q],m.format!==Ke?rt!==null?Tt?L&&e.compressedTexSubImage2D(i.TEXTURE_2D,q,0,0,at.width,at.height,rt,at.data):e.compressedTexImage2D(i.TEXTURE_2D,q,ct,at.width,at.height,0,at.data):Pt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Tt?L&&e.texSubImage2D(i.TEXTURE_2D,q,0,0,at.width,at.height,rt,St,at.data):e.texImage2D(i.TEXTURE_2D,q,ct,at.width,at.height,0,rt,St,at.data)}else if(m.isDataArrayTexture)if(Tt){if(Ut&&e.texStorage3D(i.TEXTURE_2D_ARRAY,ot,ct,Z.width,Z.height,Z.depth),L)if(m.layerUpdates.size>0){let q=ol(Z.width,Z.height,m.format,m.type);for(let lt of m.layerUpdates){let ft=Z.data.subarray(lt*q/Z.data.BYTES_PER_ELEMENT,(lt+1)*q/Z.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,lt,Z.width,Z.height,1,rt,St,ft)}m.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,Z.width,Z.height,Z.depth,rt,St,Z.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,ct,Z.width,Z.height,Z.depth,0,rt,St,Z.data);else if(m.isData3DTexture)Tt?(Ut&&e.texStorage3D(i.TEXTURE_3D,ot,ct,Z.width,Z.height,Z.depth),L&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,Z.width,Z.height,Z.depth,rt,St,Z.data)):e.texImage3D(i.TEXTURE_3D,0,ct,Z.width,Z.height,Z.depth,0,rt,St,Z.data);else if(m.isFramebufferTexture){if(Ut)if(Tt)e.texStorage2D(i.TEXTURE_2D,ot,ct,Z.width,Z.height);else{let q=Z.width,lt=Z.height;for(let ft=0;ft<ot;ft++)e.texImage2D(i.TEXTURE_2D,ft,ct,q,lt,0,rt,St,null),q>>=1,lt>>=1}}else if(m.isHTMLTexture){if("texElementImage2D"in i){let q=i.canvas;if(q.hasAttribute("layoutsubtree")||q.setAttribute("layoutsubtree","true"),Z.parentNode!==q){q.appendChild(Z),f.add(m),q.onpaint=lt=>{let ft=lt.changedElements;for(let et of f)ft.includes(et.image)&&(et.needsUpdate=!0)},q.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,Z);else{let ft=i.RGBA,et=i.RGBA,bt=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,ft,et,bt,Z)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Et.length>0){if(Tt&&Ut){let q=qt(Et[0]);e.texStorage2D(i.TEXTURE_2D,ot,ct,q.width,q.height)}for(let q=0,lt=Et.length;q<lt;q++)at=Et[q],Tt?L&&e.texSubImage2D(i.TEXTURE_2D,q,0,0,rt,St,at):e.texImage2D(i.TEXTURE_2D,q,ct,rt,St,at);m.generateMipmaps=!1}else if(Tt){if(Ut){let q=qt(Z);e.texStorage2D(i.TEXTURE_2D,ot,ct,q.width,q.height)}L&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,rt,St,Z)}else e.texImage2D(i.TEXTURE_2D,0,ct,rt,St,Z);d(m)&&b(Q),st.__version=it.version,m.onUpdate&&m.onUpdate(m)}C.__version=m.version}function Rt(C,m,D){if(m.image.length!==6)return;let Q=Wt(C,m),V=m.source;e.bindTexture(i.TEXTURE_CUBE_MAP,C.__webglTexture,i.TEXTURE0+D);let it=n.get(V);if(V.version!==it.__version||Q===!0){e.activeTexture(i.TEXTURE0+D);let st=kt.getPrimaries(kt.workingColorSpace),Y=m.colorSpace===qe?null:kt.getPrimaries(m.colorSpace),Z=m.colorSpace===qe||st===Y?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,m.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,m.premultiplyAlpha),e.pixelStorei(i.UNPACK_ALIGNMENT,m.unpackAlignment),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Z);let rt=m.isCompressedTexture||m.image[0].isCompressedTexture,St=m.image[0]&&m.image[0].isDataTexture,ct=[];for(let et=0;et<6;et++)!rt&&!St?ct[et]=g(m.image[et],!0,s.maxCubemapSize):ct[et]=St?m.image[et].image:m.image[et],ct[et]=be(m,ct[et]);let at=ct[0],Et=r.convert(m.format,m.colorSpace),Tt=r.convert(m.type),Ut=y(m.internalFormat,Et,Tt,m.normalized,m.colorSpace),L=m.isVideoTexture!==!0,ot=it.__version===void 0||Q===!0,q=V.dataReady,lt=x(m,at);zt(i.TEXTURE_CUBE_MAP,m);let ft;if(rt){L&&ot&&e.texStorage2D(i.TEXTURE_CUBE_MAP,lt,Ut,at.width,at.height);for(let et=0;et<6;et++){ft=ct[et].mipmaps;for(let bt=0;bt<ft.length;bt++){let vt=ft[bt];m.format!==Ke?Et!==null?L?q&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+et,bt,0,0,vt.width,vt.height,Et,vt.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+et,bt,Ut,vt.width,vt.height,0,vt.data):Pt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):L?q&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+et,bt,0,0,vt.width,vt.height,Et,Tt,vt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+et,bt,Ut,vt.width,vt.height,0,Et,Tt,vt.data)}}}else{if(ft=m.mipmaps,L&&ot){ft.length>0&&lt++;let et=qt(ct[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,lt,Ut,et.width,et.height)}for(let et=0;et<6;et++)if(St){L?q&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+et,0,0,0,ct[et].width,ct[et].height,Et,Tt,ct[et].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+et,0,Ut,ct[et].width,ct[et].height,0,Et,Tt,ct[et].data);for(let bt=0;bt<ft.length;bt++){let ne=ft[bt].image[et].image;L?q&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+et,bt+1,0,0,ne.width,ne.height,Et,Tt,ne.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+et,bt+1,Ut,ne.width,ne.height,0,Et,Tt,ne.data)}}else{L?q&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+et,0,0,0,Et,Tt,ct[et]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+et,0,Ut,Et,Tt,ct[et]);for(let bt=0;bt<ft.length;bt++){let vt=ft[bt];L?q&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+et,bt+1,0,0,Et,Tt,vt.image[et]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+et,bt+1,Ut,Et,Tt,vt.image[et])}}}d(m)&&b(i.TEXTURE_CUBE_MAP),it.__version=V.version,m.onUpdate&&m.onUpdate(m)}C.__version=m.version}function At(C,m,D,Q,V,it){let st=r.convert(D.format,D.colorSpace),Y=r.convert(D.type),Z=y(D.internalFormat,st,Y,D.normalized,D.colorSpace),rt=n.get(m),St=n.get(D);if(St.__renderTarget=m,!rt.__hasExternalTextures){let ct=Math.max(1,m.width>>it),at=Math.max(1,m.height>>it);V===i.TEXTURE_3D||V===i.TEXTURE_2D_ARRAY?e.texImage3D(V,it,Z,ct,at,m.depth,0,st,Y,null):e.texImage2D(V,it,Z,ct,at,0,st,Y,null)}e.bindFramebuffer(i.FRAMEBUFFER,C),fe(m)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,Q,V,St.__webglTexture,0,ce(m)):(V===i.TEXTURE_2D||V>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&V<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,Q,V,St.__webglTexture,it),e.bindFramebuffer(i.FRAMEBUFFER,null)}function Nt(C,m,D){if(i.bindRenderbuffer(i.RENDERBUFFER,C),m.depthBuffer){let Q=m.depthTexture,V=Q&&Q.isDepthTexture?Q.type:null,it=_(m.stencilBuffer,V),st=m.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;fe(m)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ce(m),it,m.width,m.height):D?i.renderbufferStorageMultisample(i.RENDERBUFFER,ce(m),it,m.width,m.height):i.renderbufferStorage(i.RENDERBUFFER,it,m.width,m.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,st,i.RENDERBUFFER,C)}else{let Q=m.textures;for(let V=0;V<Q.length;V++){let it=Q[V],st=r.convert(it.format,it.colorSpace),Y=r.convert(it.type),Z=y(it.internalFormat,st,Y,it.normalized,it.colorSpace);fe(m)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ce(m),Z,m.width,m.height):D?i.renderbufferStorageMultisample(i.RENDERBUFFER,ce(m),Z,m.width,m.height):i.renderbufferStorage(i.RENDERBUFFER,Z,m.width,m.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function me(C,m,D){let Q=m.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(i.FRAMEBUFFER,C),!(m.depthTexture&&m.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let V=n.get(m.depthTexture);if(V.__renderTarget=m,(!V.__webglTexture||m.depthTexture.image.width!==m.width||m.depthTexture.image.height!==m.height)&&(m.depthTexture.image.width=m.width,m.depthTexture.image.height=m.height,m.depthTexture.needsUpdate=!0),Q){if(V.__webglInit===void 0&&(V.__webglInit=!0,m.depthTexture.addEventListener("dispose",E)),V.__webglTexture===void 0){V.__webglTexture=i.createTexture(),e.bindTexture(i.TEXTURE_CUBE_MAP,V.__webglTexture),zt(i.TEXTURE_CUBE_MAP,m.depthTexture);let rt=r.convert(m.depthTexture.format),St=r.convert(m.depthTexture.type),ct;m.depthTexture.format===pn?ct=i.DEPTH_COMPONENT24:m.depthTexture.format===Kn&&(ct=i.DEPTH24_STENCIL8);for(let at=0;at<6;at++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,0,ct,m.width,m.height,0,rt,St,null)}}else nt(m.depthTexture,0);let it=V.__webglTexture,st=ce(m),Y=Q?i.TEXTURE_CUBE_MAP_POSITIVE_X+D:i.TEXTURE_2D,Z=m.depthTexture.format===Kn?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(m.depthTexture.format===pn)fe(m)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,Z,Y,it,0,st):i.framebufferTexture2D(i.FRAMEBUFFER,Z,Y,it,0);else if(m.depthTexture.format===Kn)fe(m)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,Z,Y,it,0,st):i.framebufferTexture2D(i.FRAMEBUFFER,Z,Y,it,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Ot(C){let m=n.get(C),D=C.isWebGLCubeRenderTarget===!0;if(m.__boundDepthTexture!==C.depthTexture){let Q=C.depthTexture;if(m.__depthDisposeCallback&&m.__depthDisposeCallback(),Q){let V=()=>{delete m.__boundDepthTexture,delete m.__depthDisposeCallback,Q.removeEventListener("dispose",V)};Q.addEventListener("dispose",V),m.__depthDisposeCallback=V}m.__boundDepthTexture=Q}if(C.depthTexture&&!m.__autoAllocateDepthBuffer)if(D)for(let Q=0;Q<6;Q++)me(m.__webglFramebuffer[Q],C,Q);else{let Q=C.texture.mipmaps;Q&&Q.length>0?me(m.__webglFramebuffer[0],C,0):me(m.__webglFramebuffer,C,0)}else if(D){m.__webglDepthbuffer=[];for(let Q=0;Q<6;Q++)if(e.bindFramebuffer(i.FRAMEBUFFER,m.__webglFramebuffer[Q]),m.__webglDepthbuffer[Q]===void 0)m.__webglDepthbuffer[Q]=i.createRenderbuffer(),Nt(m.__webglDepthbuffer[Q],C,!1);else{let V=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,it=m.__webglDepthbuffer[Q];i.bindRenderbuffer(i.RENDERBUFFER,it),i.framebufferRenderbuffer(i.FRAMEBUFFER,V,i.RENDERBUFFER,it)}}else{let Q=C.texture.mipmaps;if(Q&&Q.length>0?e.bindFramebuffer(i.FRAMEBUFFER,m.__webglFramebuffer[0]):e.bindFramebuffer(i.FRAMEBUFFER,m.__webglFramebuffer),m.__webglDepthbuffer===void 0)m.__webglDepthbuffer=i.createRenderbuffer(),Nt(m.__webglDepthbuffer,C,!1);else{let V=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,it=m.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,it),i.framebufferRenderbuffer(i.FRAMEBUFFER,V,i.RENDERBUFFER,it)}}e.bindFramebuffer(i.FRAMEBUFFER,null)}function Vt(C,m,D){let Q=n.get(C);m!==void 0&&At(Q.__webglFramebuffer,C,C.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),D!==void 0&&Ot(C)}function ee(C){let m=C.texture,D=n.get(C),Q=n.get(m);C.addEventListener("dispose",A);let V=C.textures,it=C.isWebGLCubeRenderTarget===!0,st=V.length>1;if(st||(Q.__webglTexture===void 0&&(Q.__webglTexture=i.createTexture()),Q.__version=m.version,a.memory.textures++),it){D.__webglFramebuffer=[];for(let Y=0;Y<6;Y++)if(m.mipmaps&&m.mipmaps.length>0){D.__webglFramebuffer[Y]=[];for(let Z=0;Z<m.mipmaps.length;Z++)D.__webglFramebuffer[Y][Z]=i.createFramebuffer()}else D.__webglFramebuffer[Y]=i.createFramebuffer()}else{if(m.mipmaps&&m.mipmaps.length>0){D.__webglFramebuffer=[];for(let Y=0;Y<m.mipmaps.length;Y++)D.__webglFramebuffer[Y]=i.createFramebuffer()}else D.__webglFramebuffer=i.createFramebuffer();if(st)for(let Y=0,Z=V.length;Y<Z;Y++){let rt=n.get(V[Y]);rt.__webglTexture===void 0&&(rt.__webglTexture=i.createTexture(),a.memory.textures++)}if(C.samples>0&&fe(C)===!1){D.__webglMultisampledFramebuffer=i.createFramebuffer(),D.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,D.__webglMultisampledFramebuffer);for(let Y=0;Y<V.length;Y++){let Z=V[Y];D.__webglColorRenderbuffer[Y]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,D.__webglColorRenderbuffer[Y]);let rt=r.convert(Z.format,Z.colorSpace),St=r.convert(Z.type),ct=y(Z.internalFormat,rt,St,Z.normalized,Z.colorSpace,C.isXRRenderTarget===!0),at=ce(C);i.renderbufferStorageMultisample(i.RENDERBUFFER,at,ct,C.width,C.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Y,i.RENDERBUFFER,D.__webglColorRenderbuffer[Y])}i.bindRenderbuffer(i.RENDERBUFFER,null),C.depthBuffer&&(D.__webglDepthRenderbuffer=i.createRenderbuffer(),Nt(D.__webglDepthRenderbuffer,C,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(it){e.bindTexture(i.TEXTURE_CUBE_MAP,Q.__webglTexture),zt(i.TEXTURE_CUBE_MAP,m);for(let Y=0;Y<6;Y++)if(m.mipmaps&&m.mipmaps.length>0)for(let Z=0;Z<m.mipmaps.length;Z++)At(D.__webglFramebuffer[Y][Z],C,m,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,Z);else At(D.__webglFramebuffer[Y],C,m,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0);d(m)&&b(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(st){for(let Y=0,Z=V.length;Y<Z;Y++){let rt=V[Y],St=n.get(rt),ct=i.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(ct=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(ct,St.__webglTexture),zt(ct,rt),At(D.__webglFramebuffer,C,rt,i.COLOR_ATTACHMENT0+Y,ct,0),d(rt)&&b(ct)}e.unbindTexture()}else{let Y=i.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(Y=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(Y,Q.__webglTexture),zt(Y,m),m.mipmaps&&m.mipmaps.length>0)for(let Z=0;Z<m.mipmaps.length;Z++)At(D.__webglFramebuffer[Z],C,m,i.COLOR_ATTACHMENT0,Y,Z);else At(D.__webglFramebuffer,C,m,i.COLOR_ATTACHMENT0,Y,0);d(m)&&b(Y),e.unbindTexture()}C.depthBuffer&&Ot(C)}function Qt(C){let m=C.textures;for(let D=0,Q=m.length;D<Q;D++){let V=m[D];if(d(V)){let it=T(C),st=n.get(V).__webglTexture;e.bindTexture(it,st),b(it),e.unbindTexture()}}}let oe=[],xe=[];function Oe(C){if(C.samples>0){if(fe(C)===!1){let m=C.textures,D=C.width,Q=C.height,V=i.COLOR_BUFFER_BIT,it=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,st=n.get(C),Y=m.length>1;if(Y)for(let rt=0;rt<m.length;rt++)e.bindFramebuffer(i.FRAMEBUFFER,st.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+rt,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,st.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+rt,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,st.__webglMultisampledFramebuffer);let Z=C.texture.mipmaps;Z&&Z.length>0?e.bindFramebuffer(i.DRAW_FRAMEBUFFER,st.__webglFramebuffer[0]):e.bindFramebuffer(i.DRAW_FRAMEBUFFER,st.__webglFramebuffer);for(let rt=0;rt<m.length;rt++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(V|=i.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(V|=i.STENCIL_BUFFER_BIT)),Y){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,st.__webglColorRenderbuffer[rt]);let St=n.get(m[rt]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,St,0)}i.blitFramebuffer(0,0,D,Q,0,0,D,Q,V,i.NEAREST),c===!0&&(oe.length=0,xe.length=0,oe.push(i.COLOR_ATTACHMENT0+rt),C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&(oe.push(it),xe.push(it),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,xe)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,oe))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),Y)for(let rt=0;rt<m.length;rt++){e.bindFramebuffer(i.FRAMEBUFFER,st.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+rt,i.RENDERBUFFER,st.__webglColorRenderbuffer[rt]);let St=n.get(m[rt]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,st.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+rt,i.TEXTURE_2D,St,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,st.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&c){let m=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[m])}}}function ce(C){return Math.min(s.maxSamples,C.samples)}function fe(C){let m=n.get(C);return C.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&m.__useRenderToTexture!==!1}function U(C){let m=a.render.frame;u.get(C)!==m&&(u.set(C,m),C.update())}function be(C,m){let D=C.colorSpace,Q=C.format,V=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||D!==as&&D!==qe&&(kt.getTransfer(D)===Kt?(Q!==Ke||V!==ke)&&Pt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):It("WebGLTextures: Unsupported texture color space:",D)),m}function qt(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(l.width=C.naturalWidth||C.width,l.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(l.width=C.displayWidth,l.height=C.displayHeight):(l.width=C.width,l.height=C.height),l}this.allocateTextureUnit=K,this.resetTextureUnits=k,this.getTextureUnits=B,this.setTextureUnits=H,this.setTexture2D=nt,this.setTexture2DArray=J,this.setTexture3D=j,this.setTextureCube=tt,this.rebindTextures=Vt,this.setupRenderTarget=ee,this.updateRenderTargetMipmap=Qt,this.updateMultisampleRenderTarget=Oe,this.setupDepthRenderbuffer=Ot,this.setupFrameBufferTexture=At,this.useMultisampledRTT=fe,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function Cm(i,t){function e(n,s=qe){let r,a=kt.getTransfer(s);if(n===ke)return i.UNSIGNED_BYTE;if(n===ra)return i.UNSIGNED_SHORT_4_4_4_4;if(n===aa)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Zo)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===jo)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Ko)return i.BYTE;if(n===qo)return i.SHORT;if(n===Vi)return i.UNSIGNED_SHORT;if(n===sa)return i.INT;if(n===an)return i.UNSIGNED_INT;if(n===on)return i.FLOAT;if(n===ln)return i.HALF_FLOAT;if(n===$o)return i.ALPHA;if(n===tl)return i.RGB;if(n===Ke)return i.RGBA;if(n===pn)return i.DEPTH_COMPONENT;if(n===Kn)return i.DEPTH_STENCIL;if(n===el)return i.RED;if(n===oa)return i.RED_INTEGER;if(n===qn)return i.RG;if(n===la)return i.RG_INTEGER;if(n===ca)return i.RGBA_INTEGER;if(n===Ts||n===Is||n===Ps||n===Bs)if(a===Kt)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Ts)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Is)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Ps)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Bs)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Ts)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Is)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Ps)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Bs)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===ha||n===ua||n===da||n===fa)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===ha)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===ua)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===da)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===fa)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===pa||n===Aa||n===ma||n===ga||n===wa||n===Ls||n===xa)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===pa||n===Aa)return a===Kt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===ma)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===ga)return r.COMPRESSED_R11_EAC;if(n===wa)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Ls)return r.COMPRESSED_RG11_EAC;if(n===xa)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===va||n===_a||n===ya||n===Ma||n===Sa||n===Ea||n===Ca||n===ba||n===Ta||n===Ia||n===Pa||n===Ba||n===La||n===Ra)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===va)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===_a)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===ya)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Ma)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Sa)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Ea)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Ca)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===ba)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Ta)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Ia)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Pa)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Ba)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===La)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Ra)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Ua||n===Da||n===Fa)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===Ua)return a===Kt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Da)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Fa)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Na||n===Oa||n===Rs||n===Ga)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===Na)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Oa)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Rs)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Ga)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Wi?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}var bm=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Tm=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Cl=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let n=new ws(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,n=new Ce({vertexShader:bm,fragmentShader:Tm,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new de(new zn(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},bl=class extends An{constructor(t,e){super();let n=this,s=null,r=1,a=null,o="local-floor",c=1,l=null,u=null,f=null,h=null,p=null,w=null,S=typeof XRWebGLBinding<"u",g=new Cl,d={},b=e.getContextAttributes(),T=null,y=null,_=[],x=[],E=new Bt,A=null,M=null,I=new Be;I.viewport=new le;let R=new Be;R.viewport=new le;let N=[I,R],k=new Zr,B=null,H=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(X){let $=_[X];return $===void 0&&($=new Fi,_[X]=$),$.getTargetRaySpace()},this.getControllerGrip=function(X){let $=_[X];return $===void 0&&($=new Fi,_[X]=$),$.getGripSpace()},this.getHand=function(X){let $=_[X];return $===void 0&&($=new Fi,_[X]=$),$.getHandSpace()};function K(X){let $=x.indexOf(X.inputSource);if($===-1)return;let gt=_[$];gt!==void 0&&(gt.update(X.inputSource,X.frame,l||a),gt.dispatchEvent({type:X.type,data:X.inputSource}))}function W(){s.removeEventListener("select",K),s.removeEventListener("selectstart",K),s.removeEventListener("selectend",K),s.removeEventListener("squeeze",K),s.removeEventListener("squeezestart",K),s.removeEventListener("squeezeend",K),s.removeEventListener("end",W),s.removeEventListener("inputsourceschange",nt);for(let X=0;X<_.length;X++){let $=x[X];$!==null&&(x[X]=null,_[X].disconnect($))}B=null,H=null,g.reset();for(let X in d)delete d[X];if(t.setRenderTarget(T),p=null,h=null,f=null,s=null,y=null,Wt.stop(),n.isPresenting=!1,t.setPixelRatio(A),t.setSize(E.width,E.height,!1),M!==null){let X=M.camera;X.fov=M.fov,X.zoom=M.zoom,X.updateProjectionMatrix(),M=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(X){r=X,n.isPresenting===!0&&Pt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(X){o=X,n.isPresenting===!0&&Pt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||a},this.setReferenceSpace=function(X){l=X},this.getBaseLayer=function(){return h!==null?h:p},this.getBinding=function(){return f===null&&S&&(f=new XRWebGLBinding(s,e)),f},this.getFrame=function(){return w},this.getSession=function(){return s},this.setSession=async function(X){if(s=X,s!==null){if(T=t.getRenderTarget(),s.addEventListener("select",K),s.addEventListener("selectstart",K),s.addEventListener("selectend",K),s.addEventListener("squeeze",K),s.addEventListener("squeezestart",K),s.addEventListener("squeezeend",K),s.addEventListener("end",W),s.addEventListener("inputsourceschange",nt),b.xrCompatible!==!0&&await e.makeXRCompatible(),A=t.getPixelRatio(),t.getSize(E),S&&"createProjectionLayer"in XRWebGLBinding.prototype){let gt=null,Rt=null,At=null;b.depth&&(At=b.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,gt=b.stencil?Kn:pn,Rt=b.stencil?Wi:an);let Nt={colorFormat:e.RGBA8,depthFormat:At,scaleFactor:r};f=this.getBinding(),h=f.createProjectionLayer(Nt),s.updateRenderState({layers:[h]}),t.setPixelRatio(1),t.setSize(h.textureWidth,h.textureHeight,!1),y=new Qe(h.textureWidth,h.textureHeight,{format:Ke,type:ke,depthTexture:new Hn(h.textureWidth,h.textureHeight,Rt,void 0,void 0,void 0,void 0,void 0,void 0,gt),stencilBuffer:b.stencil,colorSpace:t.outputColorSpace,samples:b.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}else{let gt={antialias:b.antialias,alpha:!0,depth:b.depth,stencil:b.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,e,gt),s.updateRenderState({baseLayer:p}),t.setPixelRatio(1),t.setSize(p.framebufferWidth,p.framebufferHeight,!1),y=new Qe(p.framebufferWidth,p.framebufferHeight,{format:Ke,type:ke,colorSpace:t.outputColorSpace,stencilBuffer:b.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1,storeMultisampledDepthBuffer:p.ignoreDepthValues===!1,storeMultisampledStencilBuffer:p.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(c),l=null,a=await s.requestReferenceSpace(o),Wt.setContext(s),Wt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function nt(X){for(let $=0;$<X.removed.length;$++){let gt=X.removed[$],Rt=x.indexOf(gt);Rt>=0&&(x[Rt]=null,_[Rt].disconnect(gt))}for(let $=0;$<X.added.length;$++){let gt=X.added[$],Rt=x.indexOf(gt);if(Rt===-1){for(let Nt=0;Nt<_.length;Nt++)if(Nt>=x.length){x.push(gt),Rt=Nt;break}else if(x[Nt]===null){x[Nt]=gt,Rt=Nt;break}if(Rt===-1)break}let At=_[Rt];At&&At.connect(gt)}}let J=new F,j=new F;function tt(X,$,gt){J.setFromMatrixPosition($.matrixWorld),j.setFromMatrixPosition(gt.matrixWorld);let Rt=J.distanceTo(j),At=$.projectionMatrix.elements,Nt=gt.projectionMatrix.elements,me=At[14]/(At[10]-1),Ot=At[14]/(At[10]+1),Vt=(At[9]+1)/At[5],ee=(At[9]-1)/At[5],Qt=(At[8]-1)/At[0],oe=(Nt[8]+1)/Nt[0],xe=me*Qt,Oe=me*oe,ce=Rt/(-Qt+oe),fe=ce*-Qt;if($.matrixWorld.decompose(X.position,X.quaternion,X.scale),X.translateX(fe),X.translateZ(ce),X.matrixWorld.compose(X.position,X.quaternion,X.scale),X.matrixWorldInverse.copy(X.matrixWorld).invert(),At[10]===-1)X.projectionMatrix.copy($.projectionMatrix),X.projectionMatrixInverse.copy($.projectionMatrixInverse);else{let U=me+ce,be=Ot+ce,qt=xe-fe,C=Oe+(Rt-fe),m=Vt*Ot/be*U,D=ee*Ot/be*U;X.projectionMatrix.makePerspective(qt,C,m,D,U,be),X.projectionMatrixInverse.copy(X.projectionMatrix).invert()}}function Mt(X,$){$===null?X.matrixWorld.copy(X.matrix):X.matrixWorld.multiplyMatrices($.matrixWorld,X.matrix),X.matrixWorldInverse.copy(X.matrixWorld).invert()}this.updateCamera=function(X){if(s===null)return;let $=X.near,gt=X.far;g.texture!==null&&(g.depthNear>0&&($=g.depthNear),g.depthFar>0&&(gt=g.depthFar)),k.near=R.near=I.near=$,k.far=R.far=I.far=gt,(B!==k.near||H!==k.far)&&(s.updateRenderState({depthNear:k.near,depthFar:k.far}),B=k.near,H=k.far),k.layers.mask=X.layers.mask|6,I.layers.mask=k.layers.mask&-5,R.layers.mask=k.layers.mask&-3;let Rt=X.parent,At=k.cameras;Mt(k,Rt);for(let Nt=0;Nt<At.length;Nt++)Mt(At[Nt],Rt);At.length===2?tt(k,I,R):k.projectionMatrix.copy(I.projectionMatrix),M===null&&X.isPerspectiveCamera&&(M={camera:X,fov:X.fov,zoom:X.zoom}),Ct(X,k,Rt)};function Ct(X,$,gt){gt===null?X.matrix.copy($.matrixWorld):(X.matrix.copy(gt.matrixWorld),X.matrix.invert(),X.matrix.multiply($.matrixWorld)),X.matrix.decompose(X.position,X.quaternion,X.scale),X.updateMatrixWorld(!0),X.projectionMatrix.copy($.projectionMatrix),X.projectionMatrixInverse.copy($.projectionMatrixInverse),X.isPerspectiveCamera&&(X.fov=Cr*2*Math.atan(1/X.projectionMatrix.elements[5]),X.zoom=1)}this.getCamera=function(){return k},this.getFoveation=function(){if(!(h===null&&p===null))return c},this.setFoveation=function(X){c=X,h!==null&&(h.fixedFoveation=X),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=X)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(k)},this.getCameraTexture=function(X){return d[X]};let te=null;function zt(X,$){if(u=$.getViewerPose(l||a),w=$,u!==null){let gt=u.views;p!==null&&(t.setRenderTargetFramebuffer(y,p.framebuffer),t.setRenderTarget(y));let Rt=!1;gt.length!==k.cameras.length&&(k.cameras.length=0,Rt=!0);for(let Ot=0;Ot<gt.length;Ot++){let Vt=gt[Ot],ee=null;if(p!==null)ee=p.getViewport(Vt);else{let oe=f.getViewSubImage(h,Vt);ee=oe.viewport,Ot===0&&(t.setRenderTargetTextures(y,oe.colorTexture,oe.depthStencilTexture),t.setRenderTarget(y))}let Qt=N[Ot];Qt===void 0&&(Qt=new Be,Qt.layers.enable(Ot),Qt.viewport=new le,N[Ot]=Qt),Qt.matrix.fromArray(Vt.transform.matrix),Qt.matrix.decompose(Qt.position,Qt.quaternion,Qt.scale),Qt.projectionMatrix.fromArray(Vt.projectionMatrix),Qt.projectionMatrixInverse.copy(Qt.projectionMatrix).invert(),Qt.viewport.set(ee.x,ee.y,ee.width,ee.height),Ot===0&&(k.matrix.copy(Qt.matrix),k.matrix.decompose(k.position,k.quaternion,k.scale)),Rt===!0&&k.cameras.push(Qt)}let At=s.enabledFeatures;if(At&&At.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&S){f=n.getBinding();let Ot=f.getDepthInformation(gt[0]);Ot&&Ot.isValid&&Ot.texture&&g.init(Ot,s.renderState)}if(At&&At.includes("camera-access")&&S){t.state.unbindTexture(),f=n.getBinding();for(let Ot=0;Ot<gt.length;Ot++){let Vt=gt[Ot].camera;if(Vt){let ee=d[Vt];ee||(ee=new ws,d[Vt]=ee);let Qt=f.getCameraImage(Vt);ee.sourceTexture=Qt}}}}for(let gt=0;gt<_.length;gt++){let Rt=x[gt],At=_[gt];Rt!==null&&At!==void 0&&At.update(Rt,$,l||a)}te&&te(X,$),$.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:$}),w=null}let Wt=new Ch;Wt.setAnimationLoop(zt),this.setAnimationLoop=function(X){te=X},this.dispose=function(){}}},Im=new ae,Lh=new Lt;Lh.set(-1,0,0,0,1,0,0,0,1);function Pm(i,t){function e(g,d){g.matrixAutoUpdate===!0&&g.updateMatrix(),d.value.copy(g.matrix)}function n(g,d){d.color.getRGB(g.fogColor.value,sl(i)),d.isFog?(g.fogNear.value=d.near,g.fogFar.value=d.far):d.isFogExp2&&(g.fogDensity.value=d.density)}function s(g,d,b,T,y){d.isNodeMaterial?d.uniformsNeedUpdate=!1:d.isMeshBasicMaterial?r(g,d):d.isMeshLambertMaterial?(r(g,d),d.envMap&&(g.envMapIntensity.value=d.envMapIntensity)):d.isMeshToonMaterial?(r(g,d),f(g,d)):d.isMeshPhongMaterial?(r(g,d),u(g,d),d.envMap&&(g.envMapIntensity.value=d.envMapIntensity)):d.isMeshStandardMaterial?(r(g,d),h(g,d),d.isMeshPhysicalMaterial&&p(g,d,y)):d.isMeshMatcapMaterial?(r(g,d),w(g,d)):d.isMeshDepthMaterial?r(g,d):d.isMeshDistanceMaterial?(r(g,d),S(g,d)):d.isMeshNormalMaterial?r(g,d):d.isLineBasicMaterial?(a(g,d),d.isLineDashedMaterial&&o(g,d)):d.isPointsMaterial?c(g,d,b,T):d.isSpriteMaterial?l(g,d):d.isShadowMaterial?(g.color.value.copy(d.color),g.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function r(g,d){g.opacity.value=d.opacity,d.color&&g.diffuse.value.copy(d.color),d.emissive&&g.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(g.map.value=d.map,e(d.map,g.mapTransform)),d.alphaMap&&(g.alphaMap.value=d.alphaMap,e(d.alphaMap,g.alphaMapTransform)),d.bumpMap&&(g.bumpMap.value=d.bumpMap,e(d.bumpMap,g.bumpMapTransform),g.bumpScale.value=d.bumpScale,d.side===ye&&(g.bumpScale.value*=-1)),d.normalMap&&(g.normalMap.value=d.normalMap,e(d.normalMap,g.normalMapTransform),g.normalScale.value.copy(d.normalScale),d.side===ye&&g.normalScale.value.negate()),d.displacementMap&&(g.displacementMap.value=d.displacementMap,e(d.displacementMap,g.displacementMapTransform),g.displacementScale.value=d.displacementScale,g.displacementBias.value=d.displacementBias),d.emissiveMap&&(g.emissiveMap.value=d.emissiveMap,e(d.emissiveMap,g.emissiveMapTransform)),d.specularMap&&(g.specularMap.value=d.specularMap,e(d.specularMap,g.specularMapTransform)),d.alphaTest>0&&(g.alphaTest.value=d.alphaTest);let b=t.get(d),T=b.envMap,y=b.envMapRotation;T&&(g.envMap.value=T,g.envMapRotation.value.setFromMatrix4(Im.makeRotationFromEuler(y)).transpose(),T.isCubeTexture&&T.isRenderTargetTexture===!1&&g.envMapRotation.value.premultiply(Lh),g.reflectivity.value=d.reflectivity,g.ior.value=d.ior,g.refractionRatio.value=d.refractionRatio),d.lightMap&&(g.lightMap.value=d.lightMap,g.lightMapIntensity.value=d.lightMapIntensity,e(d.lightMap,g.lightMapTransform)),d.aoMap&&(g.aoMap.value=d.aoMap,g.aoMapIntensity.value=d.aoMapIntensity,e(d.aoMap,g.aoMapTransform))}function a(g,d){g.diffuse.value.copy(d.color),g.opacity.value=d.opacity,d.map&&(g.map.value=d.map,e(d.map,g.mapTransform))}function o(g,d){g.dashSize.value=d.dashSize,g.totalSize.value=d.dashSize+d.gapSize,g.scale.value=d.scale}function c(g,d,b,T){g.diffuse.value.copy(d.color),g.opacity.value=d.opacity,g.size.value=d.size*b,g.scale.value=T*.5,d.map&&(g.map.value=d.map,e(d.map,g.uvTransform)),d.alphaMap&&(g.alphaMap.value=d.alphaMap,e(d.alphaMap,g.alphaMapTransform)),d.alphaTest>0&&(g.alphaTest.value=d.alphaTest)}function l(g,d){g.diffuse.value.copy(d.color),g.opacity.value=d.opacity,g.rotation.value=d.rotation,d.map&&(g.map.value=d.map,e(d.map,g.mapTransform)),d.alphaMap&&(g.alphaMap.value=d.alphaMap,e(d.alphaMap,g.alphaMapTransform)),d.alphaTest>0&&(g.alphaTest.value=d.alphaTest)}function u(g,d){g.specular.value.copy(d.specular),g.shininess.value=Math.max(d.shininess,1e-4)}function f(g,d){d.gradientMap&&(g.gradientMap.value=d.gradientMap)}function h(g,d){g.metalness.value=d.metalness,d.metalnessMap&&(g.metalnessMap.value=d.metalnessMap,e(d.metalnessMap,g.metalnessMapTransform)),g.roughness.value=d.roughness,d.roughnessMap&&(g.roughnessMap.value=d.roughnessMap,e(d.roughnessMap,g.roughnessMapTransform)),d.envMap&&(g.envMapIntensity.value=d.envMapIntensity)}function p(g,d,b){g.ior.value=d.ior,d.sheen>0&&(g.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),g.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(g.sheenColorMap.value=d.sheenColorMap,e(d.sheenColorMap,g.sheenColorMapTransform)),d.sheenRoughnessMap&&(g.sheenRoughnessMap.value=d.sheenRoughnessMap,e(d.sheenRoughnessMap,g.sheenRoughnessMapTransform))),d.clearcoat>0&&(g.clearcoat.value=d.clearcoat,g.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(g.clearcoatMap.value=d.clearcoatMap,e(d.clearcoatMap,g.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,e(d.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(g.clearcoatNormalMap.value=d.clearcoatNormalMap,e(d.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===ye&&g.clearcoatNormalScale.value.negate())),d.dispersion>0&&(g.dispersion.value=d.dispersion),d.retroreflectivity>0&&(g.retroreflectivity.value=d.retroreflectivity),d.iridescence>0&&(g.iridescence.value=d.iridescence,g.iridescenceIOR.value=d.iridescenceIOR,g.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(g.iridescenceMap.value=d.iridescenceMap,e(d.iridescenceMap,g.iridescenceMapTransform)),d.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=d.iridescenceThicknessMap,e(d.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),d.transmission>0&&(g.transmission.value=d.transmission,g.transmissionSamplerMap.value=b.texture,g.transmissionSamplerSize.value.set(b.width,b.height),d.transmissionMap&&(g.transmissionMap.value=d.transmissionMap,e(d.transmissionMap,g.transmissionMapTransform)),g.thickness.value=d.thickness,d.thicknessMap&&(g.thicknessMap.value=d.thicknessMap,e(d.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=d.attenuationDistance,g.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(g.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(g.anisotropyMap.value=d.anisotropyMap,e(d.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=d.specularIntensity,g.specularColor.value.copy(d.specularColor),d.specularColorMap&&(g.specularColorMap.value=d.specularColorMap,e(d.specularColorMap,g.specularColorMapTransform)),d.specularIntensityMap&&(g.specularIntensityMap.value=d.specularIntensityMap,e(d.specularIntensityMap,g.specularIntensityMapTransform))}function w(g,d){d.matcap&&(g.matcap.value=d.matcap)}function S(g,d){let b=t.get(d).light;g.referencePosition.value.setFromMatrixPosition(b.matrixWorld),g.nearDistance.value=b.shadow.camera.near,g.farDistance.value=b.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Bm(i,t,e,n){let s={},r={},a=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function c(y,_){let x=_.program;n.uniformBlockBinding(y,x)}function l(y,_){let x=s[y.id];x===void 0&&(g(y),x=u(y),s[y.id]=x,y.addEventListener("dispose",b));let E=_.program;n.updateUBOMapping(y,E);let A=t.render.frame;r[y.id]!==A&&(h(y),r[y.id]=A)}function u(y){let _=f();y.__bindingPointIndex=_;let x=i.createBuffer(),E=y.__size,A=y.usage;return i.bindBuffer(i.UNIFORM_BUFFER,x),i.bufferData(i.UNIFORM_BUFFER,E,A),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,_,x),x}function f(){for(let y=0;y<o;y++)if(a.indexOf(y)===-1)return a.push(y),y;return It("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(y){let _=s[y.id],x=y.uniforms,E=y.__cache;i.bindBuffer(i.UNIFORM_BUFFER,_);for(let A=0,M=x.length;A<M;A++){let I=x[A];if(Array.isArray(I))for(let R=0,N=I.length;R<N;R++)p(I[R],A,R,E);else p(I,A,0,E)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(y,_,x,E){if(S(y,_,x,E)===!0){let A=y.__offset,M=y.value;if(Array.isArray(M)){let I=0;for(let R=0;R<M.length;R++){let N=M[R],k=d(N);w(N,y.__data,I),typeof N!="number"&&typeof N!="boolean"&&!N.isMatrix3&&!ArrayBuffer.isView(N)&&(I+=k.storage/Float32Array.BYTES_PER_ELEMENT)}}else w(M,y.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,A,y.__data)}}function w(y,_,x){typeof y=="number"||typeof y=="boolean"?_[0]=y:y.isMatrix3?(_[0]=y.elements[0],_[1]=y.elements[1],_[2]=y.elements[2],_[3]=0,_[4]=y.elements[3],_[5]=y.elements[4],_[6]=y.elements[5],_[7]=0,_[8]=y.elements[6],_[9]=y.elements[7],_[10]=y.elements[8],_[11]=0):ArrayBuffer.isView(y)?_.set(new y.constructor(y.buffer,y.byteOffset,_.length)):y.toArray(_,x)}function S(y,_,x,E){let A=y.value,M=_+"_"+x;if(E[M]===void 0)return typeof A=="number"||typeof A=="boolean"?E[M]=A:ArrayBuffer.isView(A)?E[M]=A.slice():E[M]=A.clone(),!0;{let I=E[M];if(typeof A=="number"||typeof A=="boolean"){if(I!==A)return E[M]=A,!0}else{if(ArrayBuffer.isView(A))return!0;if(I.equals(A)===!1)return I.copy(A),!0}}return!1}function g(y){let _=y.uniforms,x=0,E=16;for(let M=0,I=_.length;M<I;M++){let R=Array.isArray(_[M])?_[M]:[_[M]];for(let N=0,k=R.length;N<k;N++){let B=R[N],H=Array.isArray(B.value)?B.value:[B.value];for(let K=0,W=H.length;K<W;K++){let nt=H[K],J=d(nt),j=x%E,tt=j%J.boundary,Mt=j+tt;x+=tt,Mt!==0&&E-Mt<J.storage&&(x+=E-Mt),B.__data=new Float32Array(J.storage/Float32Array.BYTES_PER_ELEMENT),B.__offset=x,x+=J.storage}}}let A=x%E;return A>0&&(x+=E-A),y.__size=x,y.__cache={},this}function d(y){let _={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(_.boundary=4,_.storage=4):y.isVector2?(_.boundary=8,_.storage=8):y.isVector3||y.isColor?(_.boundary=16,_.storage=12):y.isVector4?(_.boundary=16,_.storage=16):y.isMatrix3?(_.boundary=48,_.storage=48):y.isMatrix4?(_.boundary=64,_.storage=64):y.isTexture?Pt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(_.boundary=16,_.storage=y.byteLength):Pt("WebGLRenderer: Unsupported uniform value type.",y),_}function b(y){let _=y.target;_.removeEventListener("dispose",b);let x=a.indexOf(_.__bindingPointIndex);a.splice(x,1),i.deleteBuffer(s[_.id]),delete s[_.id],delete r[_.id]}function T(){for(let y in s)i.deleteBuffer(s[y]);a=[],s={},r={}}return{bind:c,update:l,dispose:T}}var Lm=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),vn=null;function Rm(){return vn===null&&(vn=new Br(Lm,16,16,qn,ln),vn.name="DFG_LUT",vn.minFilter=Me,vn.magFilter=Me,vn.wrapS=fn,vn.wrapT=fn,vn.generateMipmaps=!1,vn.needsUpdate=!0),vn}var Wa=class{constructor(t={}){let{canvas:e=qc(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:h=!1,outputBufferType:p=ke}=t;this.isWebGLRenderer=!0;let w;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");w=n.getContextAttributes().alpha}else w=a;let S=p,g=new Set([ca,la,oa]),d=new Set([ke,an,Vi,Wi,ra,aa]),b=new Uint32Array(4),T=new Int32Array(4),y=new F,_=null,x=null,E=[],A=[],M=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=rn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let I=this,R=!1,N=null,k=null,B=null,H=null;this._outputColorSpace=De;let K=0,W=0,nt=null,J=-1,j=null,tt=new le,Mt=new le,Ct=null,te=new yt(0),zt=0,Wt=e.width,X=e.height,$=1,gt=null,Rt=null,At=new le(0,0,Wt,X),Nt=new le(0,0,Wt,X),me=!1,Ot=new Oi,Vt=!1,ee=!1,Qt=new ae,oe=new F,xe=new le,Oe={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},ce=!1;function fe(){return nt===null?$:1}let U=n;function be(v,P){return e.getContext(v,P)}let qt,C,m,D,Q,V,it,st,Y,Z,rt,St,ct,at,Et,Tt,Ut,L,ot,q,lt,ft,et;try{let v={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:u,failIfMajorPerformanceCaveat:f};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"186"}`),e.addEventListener("webglcontextlost",ne,!1),e.addEventListener("webglcontextrestored",Xt,!1),e.addEventListener("webglcontextcreationerror",je,!1),U===null){let P="webgl2";if(U=be(P,v),U===null)throw be(P)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}bt()}catch(v){throw e.removeEventListener("webglcontextlost",ne,!1),e.removeEventListener("webglcontextrestored",Xt,!1),e.removeEventListener("webglcontextcreationerror",je,!1),It("WebGLRenderer: "+v.message),v}function bt(){qt=new Qp(U),qt.init(),lt=new Cm(U,qt),C=new Pp(U,qt,t,lt),m=new Sm(U,qt),C.reversedDepthBuffer&&h&&m.buffers.depth.setReversed(!0),k=U.createFramebuffer(),B=U.createFramebuffer(),H=U.createFramebuffer(),D=new zp(U),Q=new hm,V=new Em(U,qt,m,Q,C,lt,D),it=new Gp(I),st=new Ju(U),ft=new Tp(U,st),Y=new kp(U,st,D,ft),Z=new Vp(U,Y,st,ft,D),L=new Jp(U,C,V),Et=new Bp(Q),rt=new cm(I,it,qt,C,ft,Et),St=new Pm(I,Q),ct=new dm,at=new wm(qt),Ut=new bp(I,it,m,Z,w,c),Tt=new Mm(I,Z,C),et=new Bm(U,D,C,m),ot=new Ip(U,qt,D),q=new Hp(U,qt,D),D.programs=rt.programs,I.capabilities=C,I.extensions=qt,I.properties=Q,I.renderLists=ct,I.shadowMap=Tt,I.state=m,I.info=D}S!==ke&&(M=new Xp(S,e.width,e.height,o,s,r));let vt=new bl(I,U);this.xr=vt,this.getContext=function(){return U},this.getContextAttributes=function(){return U.getContextAttributes()},this.forceContextLoss=function(){let v=qt.get("WEBGL_lose_context");v&&v.loseContext()},this.forceContextRestore=function(){let v=qt.get("WEBGL_lose_context");v&&v.restoreContext()},this.getPixelRatio=function(){return $},this.setPixelRatio=function(v){v!==void 0&&($=v,this.setSize(Wt,X,!1))},this.getSize=function(v){return v.set(Wt,X)},this.setSize=function(v,P,z=!0){if(vt.isPresenting){Pt("WebGLRenderer: Can't change size while VR device is presenting.");return}Wt=v,X=P,e.width=Math.floor(v*$),e.height=Math.floor(P*$),z===!0&&(e.style.width=v+"px",e.style.height=P+"px"),M!==null&&M.setSize(e.width,e.height),this.setViewport(0,0,v,P)},this.getDrawingBufferSize=function(v){return v.set(Wt*$,X*$).floor()},this.setDrawingBufferSize=function(v,P,z){Wt=v,X=P,$=z,e.width=Math.floor(v*z),e.height=Math.floor(P*z),this.setViewport(0,0,v,P)},this.setEffects=function(v){if(S===ke){It("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(v){for(let P=0;P<v.length;P++)if(v[P].isOutputPass===!0){Pt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}M.setEffects(v||[])},this.getCurrentViewport=function(v){return v.copy(tt)},this.getViewport=function(v){return v.copy(At)},this.setViewport=function(v,P,z,O){v.isVector4?At.set(v.x,v.y,v.z,v.w):At.set(v,P,z,O),m.viewport(tt.copy(At).multiplyScalar($).round())},this.getScissor=function(v){return v.copy(Nt)},this.setScissor=function(v,P,z,O){v.isVector4?Nt.set(v.x,v.y,v.z,v.w):Nt.set(v,P,z,O),m.scissor(Mt.copy(Nt).multiplyScalar($).round())},this.getScissorTest=function(){return me},this.setScissorTest=function(v){m.setScissorTest(me=v)},this.setOpaqueSort=function(v){gt=v},this.setTransparentSort=function(v){Rt=v},this.getClearColor=function(v){return v.copy(Ut.getClearColor())},this.setClearColor=function(){Ut.setClearColor(...arguments)},this.getClearAlpha=function(){return Ut.getClearAlpha()},this.setClearAlpha=function(){Ut.setClearAlpha(...arguments)},this.clear=function(v=!0,P=!0,z=!0){let O=0;if(v){let G=!1;if(nt!==null){let dt=nt.texture.format;G=g.has(dt)}if(G){let dt=nt.texture.type,mt=d.has(dt),ut=Ut.getClearColor(),wt=Ut.getClearAlpha(),_t=ut.r,Dt=ut.g,Gt=ut.b;mt?(b[0]=_t,b[1]=Dt,b[2]=Gt,b[3]=wt,U.clearBufferuiv(U.COLOR,0,b)):(T[0]=_t,T[1]=Dt,T[2]=Gt,T[3]=wt,U.clearBufferiv(U.COLOR,0,T))}else O|=U.COLOR_BUFFER_BIT}P&&(O|=U.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),z&&(O|=U.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),O!==0&&U.clear(O)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(v){v.setRenderer(this),N=v},this.dispose=function(){e.removeEventListener("webglcontextlost",ne,!1),e.removeEventListener("webglcontextrestored",Xt,!1),e.removeEventListener("webglcontextcreationerror",je,!1),Ut.dispose(),ct.dispose(),at.dispose(),Q.dispose(),it.dispose(),Z.dispose(),ft.dispose(),et.dispose(),rt.dispose(),vt.dispose(),vt.removeEventListener("sessionstart",Ql),vt.removeEventListener("sessionend",kl),$n.stop()};function ne(v){v.preventDefault(),R=!0}function Xt(){R=!1;let v=D.autoReset,P=Tt.enabled,z=Tt.autoUpdate,O=Tt.needsUpdate,G=Tt.type;bt(),D.autoReset=v,Tt.enabled=P,Tt.autoUpdate=z,Tt.needsUpdate=O,Tt.type=G}function je(v){It("WebGLRenderer: A WebGL context could not be created. Reason: ",v.statusMessage)}function cn(v){let P=v.target;P.removeEventListener("dispose",cn),eu(P)}function eu(v){nu(v),Q.remove(v)}function nu(v){let P=Q.get(v).programs;P!==void 0&&(P.forEach(function(z){rt.releaseProgram(z)}),v.isShaderMaterial&&rt.releaseShaderCache(v))}this.renderBufferDirect=function(v,P,z,O,G,dt){P===null&&(P=Oe);let mt=G.isMesh&&G.matrixWorld.determinantAffine()<0,ut=ru(v,P,z,O,G);m.setMaterial(O,mt);let wt=z.index,_t=1;if(O.wireframe===!0){if(wt=Y.getWireframeAttribute(z),wt===void 0)return;_t=2}let Dt=z.drawRange,Gt=z.attributes.position,xt=Dt.start*_t,Yt=(Dt.start+Dt.count)*_t;dt!==null&&(xt=Math.max(xt,dt.start*_t),Yt=Math.min(Yt,(dt.start+dt.count)*_t)),wt!==null?(xt=Math.max(xt,0),Yt=Math.min(Yt,wt.count)):Gt!=null&&(xt=Math.max(xt,0),Yt=Math.min(Yt,Gt.count));let pe=Yt-xt;if(pe<0||pe===1/0)return;ft.setup(G,O,ut,z,wt);let se,$t=ot;if(wt!==null&&(se=st.get(wt),$t=q,$t.setIndex(se)),G.isMesh)O.wireframe===!0?(m.setLineWidth(O.wireframeLinewidth*fe()),$t.setMode(U.LINES)):$t.setMode(U.TRIANGLES);else if(G.isLine){let Te=O.linewidth;Te===void 0&&(Te=1),m.setLineWidth(Te*fe()),G.isLineSegments?$t.setMode(U.LINES):G.isLineLoop?$t.setMode(U.LINE_LOOP):$t.setMode(U.LINE_STRIP)}else G.isPoints?$t.setMode(U.POINTS):G.isSprite&&$t.setMode(U.TRIANGLES);if(G.isBatchedMesh)if(qt.get("WEBGL_multi_draw"))$t.renderMultiDraw(G._multiDrawStarts,G._multiDrawCounts,G._multiDrawCount);else{let Te=G._multiDrawStarts,pt=G._multiDrawCounts,Re=G._multiDrawCount,Jt=wt?st.get(wt).bytesPerElement:1,Xe=Q.get(O).currentProgram.getUniforms();for(let hn=0;hn<Re;hn++)Xe.setValue(U,"_gl_DrawID",hn),$t.render(Te[hn]/Jt,pt[hn])}else if(G.isInstancedMesh)$t.renderInstances(xt,pe,G.count);else if(z.isInstancedBufferGeometry){let Te=z._maxInstanceCount!==void 0?z._maxInstanceCount:1/0,pt=Math.min(z.instanceCount,Te);$t.renderInstances(xt,pe,pt)}else $t.render(xt,pe)};function Gl(v,P,z,O){N!==null&&v.isNodeMaterial&&N.setObject(O,v),Vt===!0&&Et.setState(v,z,!1),v.transparent===!0&&v.side===Ve&&v.forceSinglePass===!1?(v.side=ye,v.needsUpdate=!0,zs(v,P,O),v.side=wn,v.needsUpdate=!0,zs(v,P,O),v.side=Ve):zs(v,P,O)}this.compile=function(v,P,z=null){z===null&&(z=v),N!==null&&N.renderStart(v,P,z),x=at.get(z),x.init(P),A.push(x),z.traverseVisible(function(G){G.isLight&&G.layers.test(P.layers)&&(x.pushLight(G),G.castShadow&&x.pushShadow(G))}),v!==z&&v.traverseVisible(function(G){G.isLight&&G.layers.test(P.layers)&&(x.pushLight(G),G.castShadow&&x.pushShadow(G))}),x.setupLights(),N!==null&&N.updateLights(x.state.lightsArray),ee=this.localClippingEnabled,Vt=Et.init(this.clippingPlanes,ee),Vt===!0&&Et.setGlobalState(this.clippingPlanes,P),N!==null&&Tt.render(x.state.shadowsArray,z,P);let O=new Set;return v.traverse(function(G){if(!(G.isMesh||G.isPoints||G.isLine||G.isSprite))return;let dt=G.material;if(dt)if(Array.isArray(dt))for(let mt=0;mt<dt.length;mt++){let ut=dt[mt];Gl(ut,z,P,G),O.add(ut)}else Gl(dt,z,P,G),O.add(dt)}),x=A.pop(),N!==null&&N.renderEnd(),O},this.compileAsync=function(v,P,z=null){let O=this.compile(v,P,z);return new Promise(G=>{function dt(){if(O.forEach(function(mt){let wt=Q.get(mt).currentProgram;(wt===void 0||wt.isReady())&&O.delete(mt)}),O.size===0){G(v);return}setTimeout(dt,10)}qt.get("KHR_parallel_shader_compile")!==null?dt():setTimeout(dt,10)})};let to=null;function iu(v){to&&to(v)}function Ql(){$n.stop()}function kl(){$n.start()}let $n=new Ch;$n.setAnimationLoop(iu),typeof self<"u"&&$n.setContext(self),this.setAnimationLoop=function(v){to=v,vt.setAnimationLoop(v),v===null?$n.stop():$n.start()},vt.addEventListener("sessionstart",Ql),vt.addEventListener("sessionend",kl),this.render=function(v,P){if(P!==void 0&&P.isCamera!==!0){It("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(R===!0)return;N!==null&&N.renderStart(v,P);let z=vt.enabled===!0&&vt.isPresenting===!0,O=M!==null&&(nt===null||z)&&M.begin(I,nt);if(v.matrixWorldAutoUpdate===!0&&v.updateMatrixWorld(),P.parent===null&&P.matrixWorldAutoUpdate===!0&&P.updateMatrixWorld(),vt.enabled===!0&&vt.isPresenting===!0&&(M===null||M.isCompositing()===!1)&&(vt.cameraAutoUpdate===!0&&vt.updateCamera(P),P=vt.getCamera()),v.isScene===!0&&v.onBeforeRender(I,v,P,nt),x=at.get(v,A.length),x.init(P),x.state.textureUnits=V.getTextureUnits(),A.push(x),Qt.multiplyMatrices(P.projectionMatrix,P.matrixWorldInverse),Ot.setFromProjectionMatrix(Qt,sn,P.reversedDepth),ee=this.localClippingEnabled,Vt=Et.init(this.clippingPlanes,ee),_=ct.get(v,E.length),_.init(),E.push(_),vt.enabled===!0&&vt.isPresenting===!0){let mt=I.xr.getDepthSensingMesh();mt!==null&&eo(mt,P,-1/0,I.sortObjects)}eo(v,P,0,I.sortObjects),_.finish(),N!==null&&N.updateLights(x.state.lightsArray),I.sortObjects===!0&&_.sort(gt,Rt),ce=vt.enabled===!1||vt.isPresenting===!1||vt.hasDepthSensing()===!1,ce&&Ut.addToRenderList(_,v),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Vt===!0&&Et.beginShadows();let G=x.state.shadowsArray;if(Tt.render(G,v,P),Vt===!0&&Et.endShadows(),(O&&M.hasRenderPass())===!1){let mt=_.opaque,ut=_.transmissive;if(x.setupLights(),P.isArrayCamera){let wt=P.cameras;if(ut.length>0)for(let _t=0,Dt=wt.length;_t<Dt;_t++){let Gt=wt[_t];zl(mt,ut,v,Gt)}ce&&Ut.render(v);for(let _t=0,Dt=wt.length;_t<Dt;_t++){let Gt=wt[_t];Hl(_,v,Gt,Gt.viewport)}}else ut.length>0&&zl(mt,ut,v,P),ce&&Ut.render(v),Hl(_,v,P)}nt!==null&&W===0&&(V.updateMultisampleRenderTarget(nt),V.updateRenderTargetMipmap(nt)),O&&M.end(I),v.isScene===!0&&v.onAfterRender(I,v,P),ft.resetDefaultState(),J=-1,j=null,A.pop(),A.length>0?(x=A[A.length-1],V.setTextureUnits(x.state.textureUnits),Vt===!0&&Et.setGlobalState(I.clippingPlanes,x.state.camera)):x=null,E.pop(),E.length>0?_=E[E.length-1]:_=null,N!==null&&N.renderEnd()};function eo(v,P,z,O){if(v.visible===!1)return;if(v.layers.test(P.layers)){if(v.isGroup)z=v.renderOrder;else if(v.isLOD)v.autoUpdate===!0&&v.update(P);else if(v.isLightProbeGrid)x.pushLightProbeGrid(v);else if(v.isLight)x.pushLight(v),v.castShadow&&x.pushShadow(v);else if(v.isSprite){if(!v.frustumCulled||v.intersectsFrustum(Ot)){O&&xe.setFromMatrixPosition(v.matrixWorld).applyMatrix4(Qt);let mt=Z.update(v),ut=v.material;ut.visible&&_.push(v,mt,ut,z,xe.z,null,P)}}else if((v.isMesh||v.isLine||v.isPoints)&&(!v.frustumCulled||v.intersectsFrustum(Ot))){let mt=Z.update(v),ut=v.material;if(O&&(v.boundingSphere!==void 0?(v.boundingSphere===null&&v.computeBoundingSphere(),xe.copy(v.boundingSphere.center)):(mt.boundingSphere===null&&mt.computeBoundingSphere(),xe.copy(mt.boundingSphere.center)),xe.applyMatrix4(v.matrixWorld).applyMatrix4(Qt)),Array.isArray(ut)){let wt=mt.groups;for(let _t=0,Dt=wt.length;_t<Dt;_t++){let Gt=wt[_t],xt=ut[Gt.materialIndex];xt&&xt.visible&&_.push(v,mt,xt,z,xe.z,Gt,P)}}else ut.visible&&_.push(v,mt,ut,z,xe.z,null,P)}}let dt=v.children;for(let mt=0,ut=dt.length;mt<ut;mt++)eo(dt[mt],P,z,O)}function Hl(v,P,z,O){let{opaque:G,transmissive:dt,transparent:mt}=v;x.setupLightsView(z),Vt===!0&&Et.setGlobalState(I.clippingPlanes,z),O&&m.viewport(tt.copy(O)),G.length>0&&Hs(G,P,z),dt.length>0&&Hs(dt,P,z),mt.length>0&&Hs(mt,P,z),m.buffers.depth.setTest(!0),m.buffers.depth.setMask(!0),m.buffers.color.setMask(!0),m.setPolygonOffset(!1)}function zl(v,P,z,O){if((z.isScene===!0?z.overrideMaterial:null)!==null)return;if(x.state.transmissionRenderTarget[O.id]===void 0){let xt=qt.has("EXT_color_buffer_half_float")||qt.has("EXT_color_buffer_float");x.state.transmissionRenderTarget[O.id]=new Qe(1,1,{generateMipmaps:!0,type:xt?ln:ke,minFilter:Yn,samples:Math.max(4,C.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:kt.workingColorSpace})}let dt=x.state.transmissionRenderTarget[O.id],mt=O.viewport||tt;dt.setSize(mt.z*I.transmissionResolutionScale,mt.w*I.transmissionResolutionScale);let ut=I.getRenderTarget(),wt=I.getActiveCubeFace(),_t=I.getActiveMipmapLevel();I.setRenderTarget(dt),I.getClearColor(te),zt=I.getClearAlpha(),zt<1&&I.setClearColor(16777215,.5),I.clear(),ce&&Ut.render(z);let Dt=I.toneMapping;I.toneMapping=rn;let Gt=O.viewport;if(O.viewport!==void 0&&(O.viewport=void 0),x.setupLightsView(O),Vt===!0&&Et.setGlobalState(I.clippingPlanes,O),Hs(v,z,O),V.updateMultisampleRenderTarget(dt),V.updateRenderTargetMipmap(dt),qt.has("WEBGL_multisampled_render_to_texture")===!1){let xt=!1;for(let Yt=0,pe=P.length;Yt<pe;Yt++){let se=P[Yt],{object:$t,geometry:Te,material:pt,group:Re}=se;if(pt.side===Ve&&$t.layers.test(O.layers)){let Jt=pt.side;pt.side=ye,pt.needsUpdate=!0,Jl($t,z,O,Te,pt,Re),pt.side=Jt,pt.needsUpdate=!0,xt=!0}}xt===!0&&(V.updateMultisampleRenderTarget(dt),V.updateRenderTargetMipmap(dt))}I.setRenderTarget(ut,wt,_t),I.setClearColor(te,zt),Gt!==void 0&&(O.viewport=Gt),I.toneMapping=Dt}function Hs(v,P,z){let O=P.isScene===!0?P.overrideMaterial:null;for(let G=0,dt=v.length;G<dt;G++){let mt=v[G],{object:ut,geometry:wt,group:_t}=mt,Dt=mt.material;Dt.allowOverride===!0&&O!==null&&(Dt=O),ut.layers.test(z.layers)&&Jl(ut,P,z,wt,Dt,_t)}}function Jl(v,P,z,O,G,dt){N!==null&&G.isNodeMaterial&&N.setObject(v,G),v.onBeforeRender(I,P,z,O,G,dt),v.modelViewMatrix.multiplyMatrices(z.matrixWorldInverse,v.matrixWorld),v.normalMatrix.getNormalMatrix(v.modelViewMatrix),G.onBeforeRender(I,P,z,O,v,dt),G.transparent===!0&&G.side===Ve&&G.forceSinglePass===!1?(G.side=ye,G.needsUpdate=!0,I.renderBufferDirect(z,P,O,G,v,dt),G.side=wn,G.needsUpdate=!0,I.renderBufferDirect(z,P,O,G,v,dt),G.side=Ve):I.renderBufferDirect(z,P,O,G,v,dt),v.onAfterRender(I,P,z,O,G,dt)}function zs(v,P,z){P.isScene!==!0&&(P=Oe);let O=Q.get(v),G=x.state.lights,dt=x.state.shadowsArray,mt=G.state.version,ut=rt.getParameters(v,G.state,dt,P,z,x.state.lightProbeGridArray),wt=rt.getProgramCacheKey(ut),_t=O.programs;O.environment=v.isMeshStandardMaterial||v.isMeshLambertMaterial||v.isMeshPhongMaterial?P.environment:null,O.fog=P.fog;let Dt=v.isMeshStandardMaterial||v.isMeshLambertMaterial&&!v.envMap||v.isMeshPhongMaterial&&!v.envMap;O.envMap=it.get(v.envMap||O.environment,Dt),O.envMapRotation=O.environment!==null&&v.envMap===null?P.environmentRotation:v.envMapRotation,_t===void 0&&(v.addEventListener("dispose",cn),_t=new Map,O.programs=_t);let Gt=_t.get(wt);if(Gt!==void 0){if(O.currentProgram===Gt&&O.lightsStateVersion===mt)return Wl(v,ut),Gt}else ut.uniforms=rt.getUniforms(v),N!==null&&v.isNodeMaterial&&N.build(v,z,ut),v.onBeforeCompile(ut,I),Gt=rt.acquireProgram(ut,wt),_t.set(wt,Gt),O.uniforms=ut.uniforms;let xt=O.uniforms;return(!v.isShaderMaterial&&!v.isRawShaderMaterial||v.clipping===!0)&&(xt.clippingPlanes=Et.uniform),Wl(v,ut),O.needsLights=ou(v),O.lightsStateVersion=mt,O.needsLights&&(xt.ambientLightColor.value=G.state.ambient,xt.lightProbe.value=G.state.probe,xt.sunLights.value=G.state.sun,xt.sunLightShadows.value=G.state.sunShadow,xt.directionalLights.value=G.state.directional,xt.directionalLightShadows.value=G.state.directionalShadow,xt.spotLights.value=G.state.spot,xt.spotLightShadows.value=G.state.spotShadow,xt.rectAreaLights.value=G.state.rectArea,xt.ltc_1.value=G.state.rectAreaLTC1,xt.ltc_2.value=G.state.rectAreaLTC2,xt.pointLights.value=G.state.point,xt.pointLightShadows.value=G.state.pointShadow,xt.hemisphereLights.value=G.state.hemi,xt.sunShadowMatrix.value=G.state.sunShadowMatrix,xt.sunShadowCascade.value=G.state.sunShadowCascade,xt.directionalShadowMatrix.value=G.state.directionalShadowMatrix,xt.spotLightMatrix.value=G.state.spotLightMatrix,xt.spotLightMap.value=G.state.spotLightMap,xt.pointShadowMatrix.value=G.state.pointShadowMatrix),O.lightProbeGrid=x.state.lightProbeGridArray.length>0,O.currentProgram=Gt,O.uniformsList=null,Gt}function Vl(v){if(v.uniformsList===null){let P=v.currentProgram.getUniforms();v.uniformsList=Ki.seqWithValue(P.seq,v.uniforms)}return v.uniformsList}function Wl(v,P){let z=Q.get(v);z.outputColorSpace=P.outputColorSpace,z.batching=P.batching,z.batchingColor=P.batchingColor,z.instancing=P.instancing,z.instancingColor=P.instancingColor,z.instancingMorph=P.instancingMorph,z.skinning=P.skinning,z.morphTargets=P.morphTargets,z.morphNormals=P.morphNormals,z.morphColors=P.morphColors,z.morphTargetsCount=P.morphTargetsCount,z.numClippingPlanes=P.numClippingPlanes,z.numIntersection=P.numClipIntersection,z.vertexAlphas=P.vertexAlphas,z.vertexTangents=P.vertexTangents,z.toneMapping=P.toneMapping}function su(v,P){if(v.length===0)return null;if(v.length===1)return v[0].texture!==null?v[0]:null;y.setFromMatrixPosition(P.matrixWorld);for(let z=0,O=v.length;z<O;z++){let G=v[z];if(G.texture!==null&&G.boundingBox.containsPoint(y))return G}return null}function ru(v,P,z,O,G){P.isScene!==!0&&(P=Oe),V.resetTextureUnits();let dt=P.fog,mt=O.isMeshStandardMaterial||O.isMeshLambertMaterial||O.isMeshPhongMaterial?P.environment:null,ut=nt===null?I.outputColorSpace:nt.isXRRenderTarget===!0?nt.texture.colorSpace:kt.workingColorSpace,wt=O.isMeshStandardMaterial||O.isMeshLambertMaterial&&!O.envMap||O.isMeshPhongMaterial&&!O.envMap,_t=it.get(O.envMap||mt,wt),Dt=O.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,Gt=!!z.attributes.tangent&&(!!O.normalMap||O.anisotropy>0),xt=!!z.morphAttributes.position,Yt=!!z.morphAttributes.normal,pe=!!z.morphAttributes.color,se=rn;O.toneMapped&&(nt===null||nt.isXRRenderTarget===!0)&&(se=I.toneMapping);let $t=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,Te=$t!==void 0?$t.length:0,pt=Q.get(O),Re=x.state.lights;if(Vt===!0&&(ee===!0||v!==j)){let ie=v===j&&O.id===J;Et.setState(O,v,ie)}let Jt=!1;O.version===pt.__version?(pt.needsLights&&pt.lightsStateVersion!==Re.state.version||pt.outputColorSpace!==ut||G.isBatchedMesh&&pt.batching===!1||!G.isBatchedMesh&&pt.batching===!0||G.isBatchedMesh&&pt.batchingColor===!0&&G._colorsTexture===null||G.isBatchedMesh&&pt.batchingColor===!1&&G._colorsTexture!==null||G.isInstancedMesh&&pt.instancing===!1||!G.isInstancedMesh&&pt.instancing===!0||G.isSkinnedMesh&&pt.skinning===!1||!G.isSkinnedMesh&&pt.skinning===!0||G.isInstancedMesh&&pt.instancingColor===!0&&G.instanceColor===null||G.isInstancedMesh&&pt.instancingColor===!1&&G.instanceColor!==null||G.isInstancedMesh&&pt.instancingMorph===!0&&G.morphTexture===null||G.isInstancedMesh&&pt.instancingMorph===!1&&G.morphTexture!==null||pt.envMap!==_t||O.fog===!0&&pt.fog!==dt||pt.numClippingPlanes!==void 0&&(pt.numClippingPlanes!==Et.numPlanes||pt.numIntersection!==Et.numIntersection)||pt.vertexAlphas!==Dt||pt.vertexTangents!==Gt||pt.morphTargets!==xt||pt.morphNormals!==Yt||pt.morphColors!==pe||pt.toneMapping!==se||pt.morphTargetsCount!==Te||!!pt.lightProbeGrid!=x.state.lightProbeGridArray.length>0)&&(Jt=!0):(Jt=!0,pt.__version=O.version);let Xe=pt.currentProgram;Jt===!0&&(Xe=zs(O,P,G),N&&O.isNodeMaterial&&N.onUpdateProgram(O,Xe,pt));let hn=!1,Bn=!1,di=!1,Zt=Xe.getUniforms(),ue=pt.uniforms;if(m.useProgram(Xe.program)&&(hn=!0,Bn=!0,di=!0),O.id!==J&&(J=O.id,Bn=!0),pt.needsLights){let ie=su(x.state.lightProbeGridArray,G);pt.lightProbeGrid!==ie&&(pt.lightProbeGrid=ie,Bn=!0)}if(hn||j!==v){m.buffers.depth.getReversed()&&v.reversedDepth!==!0&&(v._reversedDepth=!0,v.updateProjectionMatrix()),Zt.setValue(U,"projectionMatrix",v.projectionMatrix),Zt.setValue(U,"viewMatrix",v.matrixWorldInverse);let Rn=Zt.map.cameraPosition;Rn!==void 0&&Rn.setValue(U,oe.setFromMatrixPosition(v.matrixWorld)),C.logarithmicDepthBuffer&&Zt.setValue(U,"logDepthBufFC",2/(Math.log(v.far+1)/Math.LN2)),(O.isMeshPhongMaterial||O.isMeshToonMaterial||O.isMeshLambertMaterial||O.isMeshBasicMaterial||O.isMeshStandardMaterial||O.isShaderMaterial)&&Zt.setValue(U,"isOrthographic",v.isOrthographicCamera===!0),j!==v&&(j=v,Bn=!0,di=!0)}if(pt.needsLights&&(Re.state.sunShadowMap.length>0&&Zt.setValue(U,"sunShadowMap",Re.state.sunShadowMap,V),Re.state.directionalShadowMap.length>0&&Zt.setValue(U,"directionalShadowMap",Re.state.directionalShadowMap,V),Re.state.spotShadowMap.length>0&&Zt.setValue(U,"spotShadowMap",Re.state.spotShadowMap,V),Re.state.pointShadowMap.length>0&&Zt.setValue(U,"pointShadowMap",Re.state.pointShadowMap,V)),G.isSkinnedMesh){Zt.setOptional(U,G,"bindMatrix"),Zt.setOptional(U,G,"bindMatrixInverse");let ie=G.skeleton;ie&&(ie.boneTexture===null&&ie.computeBoneTexture(),Zt.setValue(U,"boneTexture",ie.boneTexture,V))}G.isBatchedMesh&&(Zt.setOptional(U,G,"batchingTexture"),Zt.setValue(U,"batchingTexture",G._matricesTexture,V),Zt.setOptional(U,G,"batchingIdTexture"),Zt.setValue(U,"batchingIdTexture",G._indirectTexture,V),Zt.setOptional(U,G,"batchingColorTexture"),G._colorsTexture!==null&&Zt.setValue(U,"batchingColorTexture",G._colorsTexture,V));let Ln=z.morphAttributes;if((Ln.position!==void 0||Ln.normal!==void 0||Ln.color!==void 0)&&L.update(G,z,Xe),(Bn||pt.receiveShadow!==G.receiveShadow)&&(pt.receiveShadow=G.receiveShadow,Zt.setValue(U,"receiveShadow",G.receiveShadow)),(O.isMeshStandardMaterial||O.isMeshLambertMaterial||O.isMeshPhongMaterial)&&O.envMap===null&&P.environment!==null&&(ue.envMapIntensity.value=P.environmentIntensity),ue.dfgLUT!==void 0&&(ue.dfgLUT.value=Rm()),Bn){if(Zt.setValue(U,"toneMappingExposure",I.toneMappingExposure),pt.needsLights&&au(ue,di),dt&&O.fog===!0&&St.refreshFogUniforms(ue,dt),St.refreshMaterialUniforms(ue,O,$,X,x.state.transmissionRenderTarget[v.id]),pt.needsLights&&pt.lightProbeGrid){let ie=pt.lightProbeGrid;ue.probesSH.value=ie.texture,ue.probesMin.value.copy(ie.boundingBox.min),ue.probesMax.value.copy(ie.boundingBox.max),ue.probesResolution.value.copy(ie.resolution)}Ki.upload(U,Vl(pt),ue,V)}if(O.isShaderMaterial&&O.uniformsNeedUpdate===!0&&(Ki.upload(U,Vl(pt),ue,V),O.uniformsNeedUpdate=!1),O.isSpriteMaterial&&Zt.setValue(U,"center",G.center),Zt.setValue(U,"modelViewMatrix",G.modelViewMatrix),Zt.setValue(U,"normalMatrix",G.normalMatrix),Zt.setValue(U,"modelMatrix",G.matrixWorld),O.uniformsGroups!==void 0){let ie=O.uniformsGroups;for(let Rn=0,fi=ie.length;Rn<fi;Rn++){let Yl=ie[Rn];et.update(Yl,Xe),et.bind(Yl,Xe)}}return Xe}function au(v,P){v.ambientLightColor.needsUpdate=P,v.lightProbe.needsUpdate=P,v.sunLights.needsUpdate=P,v.sunLightShadows.needsUpdate=P,v.directionalLights.needsUpdate=P,v.directionalLightShadows.needsUpdate=P,v.pointLights.needsUpdate=P,v.pointLightShadows.needsUpdate=P,v.spotLights.needsUpdate=P,v.spotLightShadows.needsUpdate=P,v.rectAreaLights.needsUpdate=P,v.hemisphereLights.needsUpdate=P}function ou(v){return v.isMeshLambertMaterial||v.isMeshToonMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isShadowMaterial||v.isShaderMaterial&&v.lights===!0}this.getActiveCubeFace=function(){return K},this.getActiveMipmapLevel=function(){return W},this.getRenderTarget=function(){return nt},this.setRenderTargetTextures=function(v,P,z){let O=Q.get(v);O.__autoAllocateDepthBuffer=v.resolveDepthBuffer===!1,O.__autoAllocateDepthBuffer===!1&&(O.__useRenderToTexture=!1),Q.get(v.texture).__webglTexture=P,Q.get(v.depthTexture).__webglTexture=O.__autoAllocateDepthBuffer?void 0:z,O.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(v,P){let z=Q.get(v);z.__webglFramebuffer=P,z.__useDefaultFramebuffer=P===void 0},this.setRenderTarget=function(v,P=0,z=0){nt=v,K=P,W=z;let O=null,G=!1,dt=!1;if(v){let ut=Q.get(v);if(ut.__useDefaultFramebuffer!==void 0){m.bindFramebuffer(U.FRAMEBUFFER,ut.__webglFramebuffer),tt.copy(v.viewport),Mt.copy(v.scissor),Ct=v.scissorTest,m.viewport(tt),m.scissor(Mt),m.setScissorTest(Ct),J=-1;return}else if(ut.__webglFramebuffer===void 0)V.setupRenderTarget(v);else if(ut.__hasExternalTextures)V.rebindTextures(v,Q.get(v.texture).__webglTexture,Q.get(v.depthTexture).__webglTexture);else if(v.depthBuffer){let Dt=v.depthTexture;if(ut.__boundDepthTexture!==Dt){if(Dt!==null&&Q.has(Dt)&&(v.width!==Dt.image.width||v.height!==Dt.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");V.setupDepthRenderbuffer(v)}}let wt=v.texture;(wt.isData3DTexture||wt.isDataArrayTexture||wt.isCompressedArrayTexture)&&(dt=!0);let _t=Q.get(v).__webglFramebuffer;v.isWebGLCubeRenderTarget?(Array.isArray(_t[P])?O=_t[P][z]:O=_t[P],G=!0):v.samples>0&&V.useMultisampledRTT(v)===!1?O=Q.get(v).__webglMultisampledFramebuffer:Array.isArray(_t)?O=_t[z]:O=_t,tt.copy(v.viewport),Mt.copy(v.scissor),Ct=v.scissorTest}else tt.copy(At).multiplyScalar($).floor(),Mt.copy(Nt).multiplyScalar($).floor(),Ct=me;if(z!==0&&(O=k),m.bindFramebuffer(U.FRAMEBUFFER,O)&&m.drawBuffers(v,O),m.viewport(tt),m.scissor(Mt),m.setScissorTest(Ct),G){let ut=Q.get(v.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_CUBE_MAP_POSITIVE_X+P,ut.__webglTexture,z)}else if(dt){let ut=P;for(let wt=0;wt<v.textures.length;wt++){let _t=Q.get(v.textures[wt]);U.framebufferTextureLayer(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0+wt,_t.__webglTexture,z,ut)}}else if(v!==null&&z!==0){let ut=Q.get(v.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,ut.__webglTexture,z)}J=-1};function Xl(v){let P=Q.get(v);return(P.__readFormat!==v.format||P.__readType!==v.type)&&(P.__readFormat=v.format,P.__readType=v.type,P.__formatReadable=C.textureFormatReadable(v.format),P.__typeReadable=C.textureTypeReadable(v.type)),P}this.readRenderTargetPixels=function(v,P,z,O,G,dt,mt,ut=0){if(!(v&&v.isWebGLRenderTarget)){It("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let wt=Q.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&mt!==void 0&&(wt=wt[mt]),wt){m.bindFramebuffer(U.FRAMEBUFFER,wt);try{let _t=v.textures[ut],Dt=_t.format,Gt=_t.type;v.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+ut);let xt=Xl(_t);if(xt.__formatReadable===!1){It("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(xt.__typeReadable===!1){It("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}P>=0&&P<=v.width-O&&z>=0&&z<=v.height-G&&U.readPixels(P,z,O,G,lt.convert(Dt),lt.convert(Gt),dt)}finally{let _t=nt!==null?Q.get(nt).__webglFramebuffer:null;m.bindFramebuffer(U.FRAMEBUFFER,_t)}}},this.readRenderTargetPixelsAsync=async function(v,P,z,O,G,dt,mt,ut=0){if(!(v&&v.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let wt=Q.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&mt!==void 0&&(wt=wt[mt]),wt)if(P>=0&&P<=v.width-O&&z>=0&&z<=v.height-G){m.bindFramebuffer(U.FRAMEBUFFER,wt);let _t=v.textures[ut],Dt=_t.format,Gt=_t.type;v.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+ut);let xt=Xl(_t);if(xt.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(xt.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Yt=U.createBuffer();U.bindBuffer(U.PIXEL_PACK_BUFFER,Yt),U.bufferData(U.PIXEL_PACK_BUFFER,dt.byteLength,U.STREAM_READ),U.readPixels(P,z,O,G,lt.convert(Dt),lt.convert(Gt),0),U.bindBuffer(U.PIXEL_PACK_BUFFER,null);let pe=nt!==null?Q.get(nt).__webglFramebuffer:null;m.bindFramebuffer(U.FRAMEBUFFER,pe);let se=U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE,0);return U.flush(),await jc(U,se,4),U.bindBuffer(U.PIXEL_PACK_BUFFER,Yt),U.getBufferSubData(U.PIXEL_PACK_BUFFER,0,dt),U.bindBuffer(U.PIXEL_PACK_BUFFER,null),U.deleteBuffer(Yt),U.deleteSync(se),dt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(v,P=null,z=0){let O=Math.pow(2,-z),G=Math.floor(v.image.width*O),dt=Math.floor(v.image.height*O),mt=P!==null?P.x:0,ut=P!==null?P.y:0;V.setTexture2D(v,0),U.copyTexSubImage2D(U.TEXTURE_2D,z,0,0,mt,ut,G,dt),m.unbindTexture()},this.copyTextureToTexture=function(v,P,z=null,O=null,G=0,dt=0){let mt,ut,wt,_t,Dt,Gt,xt,Yt,pe,se=v.isCompressedTexture?v.mipmaps[dt]:v.image;if(z!==null)mt=z.max.x-z.min.x,ut=z.max.y-z.min.y,wt=z.isBox3?z.max.z-z.min.z:1,_t=z.min.x,Dt=z.min.y,Gt=z.isBox3?z.min.z:0;else{let ue=Math.pow(2,-G);mt=Math.floor(se.width*ue),ut=Math.floor(se.height*ue),v.isDataArrayTexture?wt=se.depth:v.isData3DTexture?wt=Math.floor(se.depth*ue):wt=1,_t=0,Dt=0,Gt=0}O!==null?(xt=O.x,Yt=O.y,pe=O.z):(xt=0,Yt=0,pe=0);let $t=lt.convert(P.format),Te=lt.convert(P.type),pt;P.isData3DTexture?(V.setTexture3D(P,0),pt=U.TEXTURE_3D):P.isDataArrayTexture||P.isCompressedArrayTexture?(V.setTexture2DArray(P,0),pt=U.TEXTURE_2D_ARRAY):(V.setTexture2D(P,0),pt=U.TEXTURE_2D),m.activeTexture(U.TEXTURE0),m.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,P.flipY),m.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,P.premultiplyAlpha),m.pixelStorei(U.UNPACK_ALIGNMENT,P.unpackAlignment);let Re=m.getParameter(U.UNPACK_ROW_LENGTH),Jt=m.getParameter(U.UNPACK_IMAGE_HEIGHT),Xe=m.getParameter(U.UNPACK_SKIP_PIXELS),hn=m.getParameter(U.UNPACK_SKIP_ROWS),Bn=m.getParameter(U.UNPACK_SKIP_IMAGES);m.pixelStorei(U.UNPACK_ROW_LENGTH,se.width),m.pixelStorei(U.UNPACK_IMAGE_HEIGHT,se.height),m.pixelStorei(U.UNPACK_SKIP_PIXELS,_t),m.pixelStorei(U.UNPACK_SKIP_ROWS,Dt),m.pixelStorei(U.UNPACK_SKIP_IMAGES,Gt);let di=v.isDataArrayTexture||v.isData3DTexture,Zt=P.isDataArrayTexture||P.isData3DTexture;if(v.isDepthTexture){let ue=Q.get(v),Ln=Q.get(P),ie=Q.get(ue.__renderTarget),Rn=Q.get(Ln.__renderTarget);m.bindFramebuffer(U.READ_FRAMEBUFFER,ie.__webglFramebuffer),m.bindFramebuffer(U.DRAW_FRAMEBUFFER,Rn.__webglFramebuffer);for(let fi=0;fi<wt;fi++)di&&(U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Q.get(v).__webglTexture,G,Gt+fi),U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Q.get(P).__webglTexture,dt,pe+fi)),U.blitFramebuffer(_t,Dt,mt,ut,xt,Yt,mt,ut,U.DEPTH_BUFFER_BIT,U.NEAREST);m.bindFramebuffer(U.READ_FRAMEBUFFER,null),m.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else if(G!==0||v.isRenderTargetTexture||Q.has(v)){let ue=Q.get(v),Ln=Q.get(P);m.bindFramebuffer(U.READ_FRAMEBUFFER,B),m.bindFramebuffer(U.DRAW_FRAMEBUFFER,H);for(let ie=0;ie<wt;ie++)di?U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,ue.__webglTexture,G,Gt+ie):U.framebufferTexture2D(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,ue.__webglTexture,G),Zt?U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Ln.__webglTexture,dt,pe+ie):U.framebufferTexture2D(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,Ln.__webglTexture,dt),G!==0?U.blitFramebuffer(_t,Dt,mt,ut,xt,Yt,mt,ut,U.COLOR_BUFFER_BIT,U.NEAREST):Zt?U.copyTexSubImage3D(pt,dt,xt,Yt,pe+ie,_t,Dt,mt,ut):U.copyTexSubImage2D(pt,dt,xt,Yt,_t,Dt,mt,ut);m.bindFramebuffer(U.READ_FRAMEBUFFER,null),m.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else Zt?v.isDataTexture||v.isData3DTexture?U.texSubImage3D(pt,dt,xt,Yt,pe,mt,ut,wt,$t,Te,se.data):P.isCompressedArrayTexture?U.compressedTexSubImage3D(pt,dt,xt,Yt,pe,mt,ut,wt,$t,se.data):U.texSubImage3D(pt,dt,xt,Yt,pe,mt,ut,wt,$t,Te,se):v.isDataTexture?U.texSubImage2D(U.TEXTURE_2D,dt,xt,Yt,mt,ut,$t,Te,se.data):v.isCompressedTexture?U.compressedTexSubImage2D(U.TEXTURE_2D,dt,xt,Yt,se.width,se.height,$t,se.data):U.texSubImage2D(U.TEXTURE_2D,dt,xt,Yt,mt,ut,$t,Te,se);m.pixelStorei(U.UNPACK_ROW_LENGTH,Re),m.pixelStorei(U.UNPACK_IMAGE_HEIGHT,Jt),m.pixelStorei(U.UNPACK_SKIP_PIXELS,Xe),m.pixelStorei(U.UNPACK_SKIP_ROWS,hn),m.pixelStorei(U.UNPACK_SKIP_IMAGES,Bn),dt===0&&P.generateMipmaps&&U.generateMipmap(pt),m.unbindTexture()},this.initRenderTarget=function(v){Q.get(v).__webglFramebuffer===void 0&&V.setupRenderTarget(v)},this.initTexture=function(v){v.isCubeTexture?V.setTextureCube(v,0):v.isData3DTexture?V.setTexture3D(v,0):v.isDataArrayTexture||v.isCompressedArrayTexture?V.setTexture2DArray(v,0):V.setTexture2D(v,0),m.unbindTexture()},this.resetState=function(){K=0,W=0,nt=null,m.reset(),ft.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return sn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=kt._getDrawingBufferColorSpace(t),e.unpackColorSpace=kt._getUnpackColorSpace()}};var Rh="Zr5LPnv0AcBtPnv0u8FyPnv0VLtaPXv04LzuPXv0OrjmO3v0w7mqPHv0RLUpOnv0ubYOO3v0oLIiOHv05LMyOXv0WbCzNXv0cbH0Nnv0oK79Mnv0Zq9jNHv0ja3rL3v0BK59MXv0D62mLHv0PK1OLnv0C61DKXv0AK33Knv0aK3sJXv0Kq2SJ3v0OK6SInv0ya1CJHv0Ta9kH3v0s67yIHv01bB/HHv0A7DjHXv077IbGnv0zrE9G3v0lLUnGHv0NbQUGXv0kbirFnv0B7dbF3v0v7uQFXv0J7oPFnv0EL/3FHv0YL02FXv0d8KwFHv0xcDIFHv00cXcFHv0JMS2FHv0JslzFXv0gMceFXv0QMyMFnv0uMrqFXv0Ps8dGHv0x81KF3v0+tEXGnv0otAMGXv0jNRiHHv0SdM2G3v00dbcHnv0vNWYHXv0udixIXv0zNc5IHv0gN1IKXv0itzJJ3v0kdtFJnv0Wd9ULHv0bd7JKnv0PuLhMHv0S+FiL3v0T+DfLXv0FeVuNXv0IuTrM3v0LeNmMnv09+Z7OHv0BebzNnv0jenHPHv02+h5O3v07OcCOnv0h+kFPnv0t+mnPXv0WudyPnv0zOhXPnv0hcNyPnv0p9k3I3v0UMVyPnv0m9q/JHv0G8dyPnv058hyPnv0sspyPnv0nOVyPnv0fsxyPnv0Sc5yPnv00eNyPnv0FNByPnv0BuJyPnv04NFyPnv0OuByPnv0q9NyPnv0b95yPnv0dtVyPnv0pNxyPnv0QtdyPnv02NpyPnv0DdlyPnv0u8FyPoULAcBtPoULZr5LPoUL4LzuPYULVLtaPYULw7mqPIULOrjmO4ULubYOO4ULRLUpOoUL5LMyOYULoLIiOIULcbH0NoULWbCzNYULZq9jNIULoK79MoULBK59MYULja3rL4ULPK1OLoULD62mLIULAK33KoULC61DKYULKq2SJ4ULaK3sJYULya1CJIULOK6SIoULs67yIIULTa9kH4ULA7DjHYUL1bB/HIULzrE9G4UL77IbGoULNbQUGYULlLUnGIULB7dbF4ULkbirFoULJ7oPFoULv7uQFYULYL02FYULEL/3FIULxcDIFIULd8KwFIULJMS2FIUL0cXcFIULgMceFYULJslzFYULuMrqFYULQMyMFoULx81KF4ULPs8dGIULotAMGYUL+tEXGoULSdM2G4ULjNRiHIULvNWYHYUL0dbcHoULzNc5IIULudixIYULkdtFJoULitzJJ4ULgN1IKYULbd7JKoULWd9ULIULT+DfLYULS+FiL4ULPuLhMIULLeNmMoULIuTrM4ULFeVuNYULBebzNoUL9+Z7OIUL7OcCOoUL2+h5O4ULjenHPIULt+mnPYULh+kFPoULzOhXPoULWudyPoULhcNyPoULp9k3I4ULUMVyPoULm9q/JIULG8dyPoUL58hyPoULsspyPoULnOVyPoULfsxyPoULSc5yPoUL0eNyPoULFNByPoULBuJyPoUL4NFyPoULOuByPoULq9NyPoULb95yPoULdtVyPoULpNxyPoULQtdyPoUL2NpyPoULDdlyPoULOr5eP+70j7z4Pu70Or5eP+70j7z4Pu70KL7QPwT2bbxmPwT2KL7QP/wJbbxmP/wJOr5ePxILj7z4PhILOr5ePxILj7z4PhIL67pcPu7067pcPu70wLrGPgT2wLrGPvwJ67pcPhIL67pcPhILTbmmPe70TbmmPe70HLkOPgT2HLkOPvwJTbmmPRILTbmmPRILuLfbPO70uLfbPO70grdBPQT2grdBPfwJuLfbPBILuLfbPBILLLb+O+70LLb+O+708rVhPAT28rVhPPwJLLb+OxILLLb+OxILq7QRO+70q7QRO+70a7RxOwT2a7RxO/wJq7QROxILq7QROxILO7MPOu70O7MPOu709bJqOgT29bJqOvwJO7MPOhILO7MPOhIL5LHvOO705LHvOO70lrFEOQT2lrFEOfwJ5LHvOBIL5LHvOBILprCyN+70prCyN+70UrABOAT2UrABOPwJprCyNxILprCyNxILf69hNu70f69hNu70Ja+oNgT2Ja+oNvwJf69hNhILf69hNhILeq75NO70eq75NO70Ga42NQT2Ga42NfwJeq75NBILeq75NBILpa11M+70pa11M+70Pa2mMwT2Pa2mM/wJpa11MxILpa11MxIL/azZMe70/azZMe70kKz/MQT2kKz/MfwJ/azZMRIL/azZMRILfqwtMO70fqwtMO70DqxJMAT2DqxJMPwJfqwtMBILfqwtMBILKax3Lu70Kax3Lu70t6uILgT2t6uILvwJKax3LhILKax3LhIL+qu6LO70+qu6LO70h6vCLAT2h6vCLPwJ+qu6LBIL+qu6LBIL6qv4Ku706qv4Ku70d6v5KgT2d6v5KvwJ6qv4KhIL6qv4KhIL9as1Ke709as1Ke70gqswKQT2gqswKfwJ9as1KRIL9as1KRILFqx0J+70Fqx0J+70o6toJwT2o6toJ/wJFqx0JxILFqx0JxILVqy5Je70Vqy5Je705aukJQT25aukJfwJVqy5JRILVqy5JRILu6wAJO70u6wAJO70S6zlIwT2S6zlI/wJu6wAJBILu6wAJBILLK1IIu70LK1IIu70vawpIgT2vawpIvwJLK1IIhILLK1IIhILrK2ZIO70rK2ZIO70P61zIAT2P61zIPwJrK2ZIBILrK2ZIBILTa73Hu70Ta73Hu70463JHgT2463JHvwJTa73HhILTa73HhILDa9hHe70Da9hHe70p64rHQT2p64rHfwJDa9hHRILDa9hHRIL7q/iG+707q/iG+70j6+iGwT2j6+iG/wJ7q/iGxIL7q/iGxIL/bCFGu70/bCFGu70prA5GgT2prA5GvwJ/bCFGhIL/bCFGhILNbJMGe70NbJMGe706LH2GAT26LH2GPwJNbJMGRILNbJMGRILkLM0GO70kLM0GO70S7PXFwT2S7PXF/wJkLM0GBILkLM0GBILA7U6F+70A7U6F+70x7TYFgT2x7TYFvwJA7U6FxILA7U6FxILi7ZiFu70i7ZiFu70WLb7FQT2WLb7FfwJi7ZiFhILi7ZiFhILJriqFe70JriqFe70+rdAFQT2+rdAFfwJJriqFRILJriqFRILzLkIFe70zLkIFe70prmcFAT2prmcFPwJzLkIFRILzLkIFRILeLuDFO70eLuDFO70W7sTFAT2W7sTFPwJeLuDFBILeLuDFBILLr0kFO70Lr0kFO70Gr2zEwT2Gr2zE/wJLr0kFBILLr0kFBIL7b7jE+707b7jE+703r5xEwT23r5xE/wJ7b7jExIL7b7jExILr8CzE+70r8CzE+70pcBAEwT2pcBAE/wJr8CzExILr8CzExILccKaE+70ccKaE+70b8InEwT2b8InE/wJccKaExILccKaExILMsSgE+70MsSgE+70OMQtEwT2OMQtE/wJMsSgExILMsSgExIL8sXIE+708sXIE+70AMZWEwT2AMZWE/wJ8sXIExIL8sXIExILsMcMFO70sMcMFO70xMeaEwT2xMeaE/wJsMcMFBILsMcMFBILasllFO70asllFO70hcn1EwT2hcn1E/wJasllFBILasllFBILFcvkFO70FcvkFO70O8t3FAT2O8t3FPwJFcvkFBILFcvkFBILssyPFe70ssyPFe704cwmFQT24cwmFfwJssyPFRILssyPFRILSM5TFu70SM5TFu70fs7tFQT2fs7tFfwJSM5TFhILSM5TFhIL0M8wF+700M8wF+70DdDOFgT2DdDOFvwJ0M8wFxIL0M8wFxILRdErGO70RdErGO70idHOFwT2idHOF/wJRdErGBILRdErGBILqtJAGe70qtJAGe708tLnGAT28tLnGPwJqtJAGRILqtJAGRILAtRnGu70AtRnGu70TtQRGgT2TtQRGvwJAtRnGhILAtRnGhILTtWaG+70TtWaG+70ntVIGwT2ntVIG/wJTtWaGxILTtWaGxILidbcHO70idbcHO7039aOHAT239aOHPwJidbcHBILidbcHBILrNcxHu70rNcxHu70B9jqHQT2B9jqHfwJrNcxHhILrNcxHhILstieH+70stieH+70EtldHwT2EtldH/wJstieHxILstieHxILpdkeIe70pdkeIe70B9rhIAT2B9rhIPwJpdkeIRILpdkeIRILlNqlIu70lNqlIu709tppIgT29tppIvwJlNqlIhILlNqlIhILh9srJO70h9srJO706NvuIwT26NvuI/wJh9srJBILh9srJBILfNywJe70fNywJe703dxyJQT23dxyJfwJfNywJRILfNywJRILdN0zJ+70dN0zJ+701d30JgT21d30JvwJdN0zJxILdN0zJxILa960KO70a960KO70zd53KAT2zd53KPwJa960KBILa960KBILW985Ku70W985Ku70vd/9KQT2vd/9KfwJW985KhILW985KhILRuDDK+70RuDDK+70qeCHKwT2qeCHK/wJRuDDKxILRuDDKxILOuFKLe70OuFKLe70m+EMLQT2m+EMLfwJOuFKLRILOuFKLRILNOLLLu70NOLLLu70leKNLgT2leKNLvwJNOLLLhILNOLLLhILKeNNMO70KeNNMO70i+MQMAT2i+MQMPwJKeNNMBILKeNNMBILGuTTMe70GuTTMe70e+SWMQT2e+SWMfwJGuTTMRILGuTTMRILDuVXM+70DuVXM+70b+UaMwT2b+UaM/wJDuVXMxILDuVXMxILAebbNO70AebbNO70Y+aeNAT2Y+aeNPwJAebbNBILAebbNBIL8uZhNu708uZhNu70VOclNgT2VOclNvwJ8uZhNhIL8uZhNhIL4+foN+704+foN+70ReirNwT2ReirN/wJ4+foNxIL4+foNxIL1+htOe701+htOe70OekwOQT2OekwOfwJ1+htORIL1+htORILy+ntOu70y+ntOu70L+qzOgT2L+qzOvwJy+ntOhILy+ntOhILl+pqPO70l+pqPO70BOtDPAT2BOtDPPwJl+pqPBILl+pqPBIL2urQPe702urQPe70UuvhPQT2UuvhPQT2UuvhPfwJUuvhPfwJ2urQPRIL2urQPRILUurcPu70UurcPu70UuvhPQT2puo1PwT2UuvhPQT2UuvhPfwJpuo1P/wJUuvhPfwJUurcPhILUurcPhILEOlpP+70UurcPu70EOlpP+70puo1PwT2K+naPwT2puo1P/wJK+naP/wJUurcPhILEOlpPxILEOlpPxILZOeIP+70ZOeIP+70aOf7PwT2aOf7P/wJZOeIPxILZOeIPxILnOWIP+70nOWIP+70nOX7PwT2nOX7P/wJnOWIPxILnOWIPxIL0eOIP+700eOIP+700eP7PwT20eP7P/wJ0eOIPxIL0eOIPxILBuKIP+70BuKIP+70BuL7PwT2BuL7P/wJBuKIPxILBuKIPxILOuCIP+70OuCIP+70OuD7PwT2OuD7P/wJOuCIPxILOuCIPxILb96IP+70b96IP+70b977PwT2b977P/wJb96IPxILb96IPxILpNyIP+70pNyIP+70pNz7PwT2pNz7P/wJpNyIPxILpNyIPxIL2NqIP+702NqIP+702Nr7PwT22Nr7P/wJ2NqIPxIL2NqIPxILDdmIP+70DdmIP+70Ddn7PwT2Ddn7P/wJDdmIPxILDdmIPxILQteIP+70QteIP+70Qtf7PwT2Qtf7P/wJQteIPxILQteIPxILdtWIP+70dtWIP+70dtX7PwT2dtX7P/wJdtWIPxILdtWIPxILq9OIP+70q9OIP+70q9P7PwT2q9P7P/wJq9OIPxILq9OIPxIL4NGIP+704NGIP+704NH7PwT24NH7P/wJ4NGIPxIL4NGIPxILFNCIP+70FNCIP+70FND7PwT2FND7P/wJFNCIPxILFNCIPxILSc6IP+70Sc6IP+70Sc77PwT2Sc77P/wJSc6IPxILSc6IPxILfsyIP+70fsyIP+70fsz7PwT2fsz7P/wJfsyIPxILfsyIPxILssqIP+70ssqIP+70ssr7PwT2ssr7P/wJssqIPxILssqIPxIL58iIP+7058iIP+7058j7PwT258j7P/wJ58iIPxIL58iIPxILG8eIP+70G8eIP+70G8f7PwT2G8f7P/wJG8eIPxILG8eIPxILUMWIP+70UMWIP+70UMX7PwT2UMX7P/wJUMWIPxILUMWIPxILhcOIP+70hcOIP+70hcP7PwT2hcP7P/wJhcOIPxILhcOIPxILusGIP+70usGIP+70ucH7PwT2ucH7P/wJusGIPxILusGIPxIL9L+DP+709L+DP+707r/2PwT27r/2P/wJ9L+DPxIL9L+DPxILiidSPnv0NyltPnv09SpyPnv0OCS6PXv04iUTPnv0/SDDPHv0lCJKPXv0ER5QO3v0fR8dPHv0XRtTOXv0sRxfOnv04hgFN3v0FhoyOHv02RZnNHv00BfGNXv08hRsMXv05xXtMnv0ChNmLnv0/RPpL3v0JBFfK3v0FhLiLHv0RQ9VKHv0NBDbKXv0cwtDInv0ZwzCI3v0Xw1FJXv0mQk5H3v0hQrAIHv02gScF3v0zQUgGXv0wQakGnv09AKUFHv05wMYFnv0Mv2EC3v0JP4DDXv0Hf+CDnv0V/t5CHv0RfwBCnv0ofVa/3v0lfbdAHv0i/dfAnv00vFR+Xv0wvLR+nv0t/NT/Hv0B/A/9nv07PDO93v05M7l7nv088/C7nv0itFC7nv0bc5X7nv0jc657nv0e88G7Hv0s85e7Xv0RdP75Xv0VNJ853v0Y9EC6Xv0INfy33v0KtZ24Xv0M9X54nv099ll23v0Bdnm3Hv0Fdhs3nv05dtj2Hv07drl2Xv0rt9O0nv0vN7O03v00N1U1Xv0keLIzXv0muFKz3v0pODN0Hv0eeTrynv0hONNzHv0uOaDyHv0h+WryXv0XOlkxnv0Auhqx3v0OuyWxHv0xepyxXv0Se8sw3v0u+3Uw3v0fvIvwnv03/Cewnv0y/WrwXv0I/TewXv0JfmmwXv0dveawXv0b/wVwnv00PrNwXv0jv8bw3v0Av6Fwnv0fgKjxHv0EAHQw3v0LAWlxnv03AOYxXv0igcCyXv0ZwbIx3v0lQmzy3v0mQhRynv0dwuuznv0hgorzXv0XA230Xv0agwy0Hv0QRBA1nv0TA+/1Hv0Uw4+03v0JxJD2Xv0NRHC13v0ARZR33v0ChXU3Xv0DhRS3Hv05RdV4nv08xbR4Hv0vRtb6Hv0zBre5nv00hlg5Xv0jB9u7nv0mR7u7Hv0nx1s63v0WyN79Hv0ayL58nv0dCF48Xv0QiYD+Xv0SyWH93v0TyQE9nv0ISgM/Hv0MCeE+nv0AyuWAHv0DyoV/3v0FymT/Xv0yy8kCHv01i6kBnv04C0hBXv0ojMwDnv0rDKzDHv0sDExC3v0hTU5EXv0kjSyD3v0bTc9FHv0fDa7Env0STrJGHv0VTlFF3v0YDjCFXv0NDzLG3v0QTtKGnv0ED9VIHv0HD7SHnv0Jz1PHXv09UBdI3v0A0DYIXv0zURlKXv03EPlJ3v05UJmJnv0pkhxL3v0s0fwLXv0ukZyLHv0j0p4Mnv0m0n0MHv0dUx+NXv0g0v7M3v0OlCFO3v0UE8MOnv0W06KOHv0G1GuPXv08FDVPHv0MFBYPnv07VAHPnv0/0xyPnv0vE5yPnv0vixyPnv0FwAFEHv0rPTW/Xv0UNO/7Xv0O9R75Hv03tze1nv0qRzi6Xv0fiDz73v09SsaAnv0ujCoCXv07EHjJHv0v0XtKnv0iS5yPnv0VQ7NJnv0tQcpHHv0btCJ6nv0FxPK2nv02hja43v06yyeA3v0Zk0EN3v0NEtyPnv0UzByPnv0qAiwHXv0DQGKEXv0I9VS7Xv0HjJyPnv0Z/rxBnv0gfjkA3v0/9YE7Xv0aklyPnv06TNyPnv0AQIPE3v0dflqBXv029jU7Hv0tDVyPnv0DO+m9Hv0tdq87Hv0fjdyPnv0jNy27Hv0n0dyPnv0STlyPnv0ZN697Hv0FDtyPnv06O0Z83v01EVyPnv03zxyPnv0PuDZ7Hv0CURyPnv0qT5yPnv0FuIK7Xv0P0JyPnv0dEByPnv08+NS7Xv00+XE7Xv0rOds7nv0luym8Xv0b+lL73v0Fetf8Hv09SpyPoULNyltPoULiidSPoUL4iUTPoULOCS6PYULlCJKPYUL/SDDPIULfR8dPIULER5QO4ULsRxfOoULXRtTOYULFhoyOIUL4hgFN4UL0BfGNYUL2RZnNIUL5xXtMoUL8hRsMYUL/RPpL4ULChNmLoULFhLiLIULJBFfK4ULNBDbKYULRQ9VKIULXw1FJYULZwzCI4ULcwtDIoULhQrAIIULmQk5H4ULwQakGoULzQUgGYUL2gScF4UL5wMYFoUL9AKUFIULHf+CDoULJP4DDYULMv2EC4ULRfwBCoULV/t5CIULi/dfAoULlfbdAIULofVa/4ULt/NT/IULwvLR+oUL0vFR+YUL7PDO94ULB/A/9oULitFC7oUL88/C7oUL5M7l7oULjc657oULbc5X7oULs85e7YULe88G7IULY9EC6YULVNJ854ULRdP75YULM9X54oULKtZ24YULINfy34ULFdhs3oULBdnm3IUL99ll24UL7drl2YUL5dtj2IUL0N1U1YULvN7O04ULrt9O0oULpODN0IULmuFKz4ULkeLIzYULhONNzIULeeTryoULh+WryYULuOaDyIULAuhqx4ULXOlkxoULxepyxYULOuyWxIULu+3Uw4ULSe8sw4UL3/CewoULfvIvwoULI/TewYULy/WrwYULdveawYULJfmmwYUL0PrNwYULb/wVwoULAv6FwoULjv8bw4ULEAHQw4ULfgKjxIUL3AOYxYULLAWlxoULZwbIx4ULigcCyYULmQhRyoULlQmzy4ULhgorzYULdwuuzoULagwy0IULXA230YULUw4+04ULTA+/1IULQRBA1oULNRHC14ULJxJD2YULDhRS3IULChXU3YULARZR34UL8xbR4IUL5RdV4oUL0hlg5YULzBre5oULvRtb6IULnx1s64ULmR7u7IULjB9u7oULdCF48YULayL58oULWyN79IULTyQE9oULSyWH94ULQiYD+YULMCeE+oULISgM/IULFymT/YULDyoV/4ULAyuWAIUL4C0hBYUL1i6kBoULyy8kCIULsDExC4ULrDKzDIULojMwDoULkjSyD4ULhTU5EYULfDa7EoULbTc9FIULYDjCFYULVTlFF4ULSTrJGIULQTtKGoULNDzLG4ULJz1PHYULHD7SHoULED9VIIULA0DYIYUL9UBdI4UL5UJmJoUL3EPlJ4ULzURlKYULukZyLIULs0fwLYULpkhxL4ULm0n0MIULj0p4MoULg0v7M4ULdUx+NYULW06KOIULUE8MOoULOlCFO4UL8FDVPIULG1GuPYUL7VAHPoULMFBYPoULvE5yPoUL/0xyPoULvixyPoULFwAFEIULrPTW/YULUNO/7YULO9R75IUL3tze1oULqRzi6YULfiDz74UL9SsaAoULujCoCYUL7EHjJIULv0XtKoULiS5yPoULVQ7NJoULtQcpHIULbtCJ6oULFxPK2oUL2hja44UL6yyeA4ULZk0EN4ULNEtyPoULUzByPoULqAiwHYULDQGKEYULI9VS7YULHjJyPoULZ/rxBoULgfjkA4UL/9YE7YULaklyPoUL6TNyPoULAQIPE4ULdflqBYUL29jU7IULtDVyPoULDO+m9IULtdq87IULfjdyPoULjNy27IULn0dyPoULSTlyPoULZN697IULFDtyPoUL6O0Z84UL1EVyPoUL3zxyPoULPuDZ7IULCURyPoULqT5yPoULFuIK7YULP0JyPoULdEByPoUL8+NS7YUL0+XE7YULrOds7oULluym8YULb+lL74ULFetf8IULbSdmP+70sSUlP+70bSdmP+70sSUlP+70YSfZPwT2nSWXPwT2YSfZP/wJnSWXP/wJbSdmPxILsSUlPxILbSdmPxILsSUlPxIL+CPJPu70+CPJPu703SM5PwT23SM5P/wJ+CPJPhIL+CPJPhILRCJVPu70RCJVPu70IyLDPgT2IyLDPvwJRCJVPhILRCJVPhILmiDHPe70miDHPe70cSAzPgT2cSAzPvwJmiDHPRILmiDHPRILAh8XPe70Ah8XPe70zh5+PQT2zh5+PfwJAh8XPRILAh8XPRILfh08PO70fh08PO70QR2ePAT2QR2ePPwJfh08PBILfh08PBILDBw/O+70DBw/O+70yBucOwT2yBucO/wJDBw/OxILDBw/OxILqxopOu70qxopOu70YRqBOgT2YRqBOvwJqxopOhILqxopOhILWRn+OO70WRn+OO70ChlSOQT2ChlSOfwJWRn+OBILWRn+OBILFxjDN+70FxjDN+70wxcSOAT2wxcSOPwJFxjDNxILFxjDNxIL9BZxNu709BZxNu70mRa4NgT2mRa4NvwJ9BZxNhIL9BZxNhIL8hUCNe708hUCNe70khVDNQT2khVDNfwJ8hUCNRIL8hUCNRIL/BSDM+70/BSDM+70mxTBMwT2mxTBM/wJ/BSDMxIL/BSDMxILBxQAMu70BxQAMu70pRM+MgT2pRM+MvwJBxQAMhILBxQAMhILEhN9MO70EhN9MO70sBK7MAT2sBK7MPwJEhN9MBILEhN9MBILHhL6Lu70HhL6Lu70vRE3LwT2vRE3L/wJHhL6LhILHhL6LhILKxF2Le70KxF2Le70yRCzLQT2yRCzLfwJKxF2LRILKxF2LRILOBDyK+70OBDyK+701g8uLAT21g8uLPwJOBDyKxILOBDyKxILRw9tKu70Rw9tKu705Q6pKgT25Q6pKvwJRw9tKhILRw9tKhILWA7mKO70WA7mKO709g0iKQT29g0iKfwJWA7mKBILWA7mKBILaA1fJ+70aA1fJ+70Bw2cJwT2Bw2cJ/wJaA1fJxILaA1fJxILdQzaJe70dQzaJe70EwwXJgT2EwwXJvwJdQzaJRILdQzaJRILfQtYJO70fQtYJO70HAuWJAT2HAuWJPwJfQtYJBILfQtYJBILhwrWIu70hwrWIu70JgoTIwT2JgoTI/wJhwrWIhILhwrWIhILmAlRIe70mAlRIe70NgmNIQT2NgmNIfwJmAlRIRILmAlRIRILqwjJH+70qwjJH+70SQgFIAT2SQgFIPwJqwjJHxILqwjJHxILuwdCHu70uwdCHu70WQd+HgT2WQd+HvwJuwdCHhILuwdCHhILyQa8HO70yQa8HO70Zwb6HAT2Zwb6HPwJyQa8HBILyQa8HBIL1QU4G+701QU4G+70dAV1GwT2dAV1G/wJ1QU4GxIL1QU4GxIL4gS0Ge704gS0Ge70gATxGQT2gATxGfwJ4gS0GRIL4gS0GRIL7wMwGO707wMwGO70jQNtGAT2jQNtGPwJ7wMwGBIL7wMwGBIL/AKsFu70/AKsFu70mgLpFgT2mgLpFvwJ/AKsFhIL/AKsFhILCQInFe70CQInFe70pwFkFQT2pwFkFfwJCQInFRILCQInFRILFQGjE+70FQGjE+70tADgEwT2tADgE/wJFQGjExILFQGjExILIgAfEu70IgAfEu70wP9cEgT2wP9cEvwJIgAfEhILIgAfEhILLf+bEO70Lf+bEO70y/7ZEAT2y/7ZEPwJLf+bEBILLf+bEBILM/4ZD+70M/4ZD+700/1YDwT20/1YD/wJM/4ZDxILM/4ZDxILOv2ZDe70Ov2ZDe702fzXDQT22fzXDfwJOv2ZDRILOv2ZDRILRvwXDO70RvwXDO705PtUDAT25PtUDPwJRvwXDBILRvwXDBILV/uRCu70V/uRCu709frNCgT29frNCvwJV/uRChILV/uRChILavoKCe70avoKCe70B/pGCQT2B/pGCfwJavoKCRILavoKCRILevmDB+70evmDB+70GPm/BwT2GPm/B/wJevmDBxILevmDBxILifj9Be70ifj9Be70J/g6BgT2J/g6BvwJifj9BRILifj9BRILlfd4BO70lfd4BO70NPe1BAT2NPe1BPwJlfd4BBILlfd4BBILofb0Au70ofb0Au70P/YyAwT2P/YyA/wJofb0AhILofb0AhILqvVxAe70qvVxAe70SfWvAQT2SfWvAfwJqvVxARILqvVxARILtvTv/+70tvTv/+70VPQsAAT2VPQsAPwJtvTv/xILtvTv/xILwfNr/u70wfNr/u70YPOo/gT2YPOo/vwJwfNr/hILwfNr/hILzPLo/O70zPLo/O70a/Il/QT2a/Il/fwJzPLo/BILzPLo/BIL1/Fl++701/Fl++70dfGi+wT2dfGi+/wJ1/Fl+xIL1/Fl+xIL5fDi+e705fDi+e70g/Ae+gT2g/Ae+vwJ5fDi+RIL5fDi+RIL++9a+O70++9a+O70mO+V+AT2mO+V+PwJ++9a+BIL++9a+BILGO/M9u70GO/M9u70te4H9wT2te4H9/wJGO/M9hILGO/M9hILJe5C9e70Je5C9e70xu2C9QT2xu2C9fwJJe5C9RILJe5C9RILEe3J8+70Ee3J8+70t+wS9AT2t+wS9PwJEe3J8xILEe3J8xIL1etu8u701etu8u70hOvB8gT2hOvB8vwJ1etu8hIL1etu8hILb+o+8e70b+o+8e70Kuqa8QT2Kuqa8fwJb+o+8RILb+o+8RIL5eg98O705eg98O70rOih8AT2rOih8PwJ5eg98BIL5eg98BILP+dt7+70P+dt7+70EufX7wT2EufX7/wJP+dt7xILP+dt7xILheXP7u70heXP7u70ZOU+7wT2ZOU+7/wJheXP7hILheXP7hILvuNj7u70vuNj7u70qOPV7gT2qOPV7vwJvuNj7hILvuNj7hIL8+Ee7u708+Ee7u705OGQ7gT25OGQ7vwJ8+Ee7hIL8+Ee7hILJ+Du7e70J+Du7e70HuBh7gT2HuBh7vwJJ+Du7RILJ+Du7RILWt7T7e70Wt7T7e70Vt5G7gT2Vt5G7vwJWt7T7RILWt7T7RILjNzM7e70jNzM7e70jNw/7gT2jNw/7vwJjNzM7RILjNzM7RILvtrR7e70vtrR7e70wtpF7gT2wtpF7vwJvtrR7RILvtrR7RIL8Njp7e708Njp7e70+dhc7gT2+dhc7vwJ8Njp7RIL8Njp7RILJNcY7u70JNcY7u70M9eK7gT2M9eK7vwJJNcY7hILJNcY7hILWtVi7u70WtVi7u70cNXU7gT2cNXU7vwJWtVi7hILWtVi7hILltPN7u70ltPN7u70s9M87wT2s9M87/wJltPN7hILltPN7hIL2tFM7+702tFM7+70+9G67wT2+9G67/wJ2tFM7xIL2tFM7xILL9DS7+70L9DS7+70SNBD8AT2SNBD8PwJL9DS7xILL9DS7xILtM4E8O70tM4E8O70oM568AT2oM568AT2oM568PwJoM568PwJtM4E8BILtM4E8BILqc1+7+70qc1+7+70oM568AT2S83P7wT2oM568AT2oM568PwJS83P7/wJoM568PwJqc1+7xILqc1+7xILSs1d7u70qc1+7+70Ss1d7u70S83P7wT20sxg7gT20sxg7gT2S83P7/wJ0sxg7vwJ0sxg7vwJqc1+7xILSs1d7hILSs1d7hILsc3x7O70sc3x7O700sxg7gT2Rs3D7AT20sxg7gT20sxg7vwJRs3D7PwJ0sxg7vwJsc3x7BILsc3x7BILjc516+70jc516+70K8456wT2K8456/wJjc516xILjc516xILg8/06e70g8/06e70Is+36QT2Is+36fwJg8/06RILg8/06RILd9Bv6O70d9Bv6O70FdAz6AT2FdAz6PwJd9Bv6BILd9Bv6BILZ9Hq5u70Z9Hq5u70BtGt5gT2BtGt5vwJZ9Hq5hILZ9Hq5hILWtJm5e70WtJm5e70+dEp5QT2+dEp5fwJWtJm5RILWtJm5RILUdPl4+70UdPl4+708NKn4wT28NKn4/wJUdPl4xILUdPl4xILSdRj4u70SdRj4u706NMl4gT26NMl4vwJSdRj4hILSdRj4hILP9Xg4O70P9Xg4O703tSj4AT23tSj4PwJP9Xg4BILP9Xg4BILNdZe3+70NdZe3+701NUg3wT21NUg3/wJNdZe3xILNdZe3xILKdfZ3e70KdfZ3e70x9ac3QT2x9ac3fwJKdfZ3RILKdfZ3RILGdhT3O70GdhT3O70t9cX3AT2t9cX3PwJGdhT3BILGdhT3BILDNnQ2u70DNnQ2u70q9iT2gT2q9iT2vwJDNnQ2hILDNnQ2hILA9pP2e70A9pP2e70otkQ2QT2otkQ2fwJA9pP2RILA9pP2RIL+9rN1+70+9rN1+70mtqP1wT2mtqP1/wJ+9rN1xIL+9rN1xIL8ttK1u708ttK1u70kNsN1gT2kNsN1vwJ8ttK1hIL8ttK1hIL4tzD1O704tzD1O70gNyH1AT2gNyH1PwJ4tzD1BIL4tzD1BIL0N080+700N080+70bt3/0gT2bt3/0vwJ0N080xIL0N080xILw9650e70w9650e70Yt570QT2Yt570fwJw9650RILw9650RILut830O70ut830O70Wd/5zwT2Wd/5z/wJut830BILut830BILsOC1zu70sOC1zu70T+B3zgT2T+B3zvwJsOC1zhILsOC1zhILp+Ezze70p+Ezze70RuH1zAT2RuH1zPwJp+EzzRILp+EzzRILnOKyy+70nOKyy+70POJzywT2POJzy/wJnOKyyxILnOKyyxILnONByu70nONByu70QeP7yQT2QeP7yfwJnONByhILnONByhILvOTtyO70vOTtyO70Z+SfyAT2Z+SfyPwJvOTtyBILvOTtyBIL/OW1x+70/OW1x+70r+VgxwT2r+Vgx/wJ/OW1xxIL/OW1xxILVOeRxu70VOeRxu70DOc3xgT2DOc3xvwJVOeRxhILVOeRxhILu+iBxe70u+iBxe70eOgjxQT2eOgjxfwJu+iBxRILu+iBxRILMeqHxO70MeqHxO709OklxAT29OklxPwJMeqHxBILMeqHxBILteuiw+70teuiw+70fes9wwT2fes9w/wJteuiwxILteuiwxILRu3Xwu70Ru3Xwu70Fu1uwgT2Fu1uwvwJRu3XwhILRu3XwhIL5e4owu705e4owu70vO69wQT2vO69wfwJ5e4owhIL5e4owhILjvCUwe70jvCUwe70bPAmwQT2bPAmwfwJjvCUwRILjvCUwRILP/Igwe70P/Igwe70JvKwwAT2JvKwwPwJP/IgwRILP/IgwRIL+PPLwO70+PPLwO705vNZwAT25vNZwPwJ+PPLwBIL+PPLwBILtfWWwO70tfWWwO70rPUjwAT2rPUjwPwJtfWWwBILtfWWwBILdPeEwO70dPeEwO70dPcRwAT2dPcRwPwJdPeEwBILdPeEwBILNvmRwO70NvmRwO70PPkewAT2PPkewPwJNvmRwBILNvmRwBIL9Pq5wO709Pq5wO70A/tGwAT2A/tGwPwJ9Pq5wBIL9Pq5wBILrPwFwe70rPwFwe70xfyVwAT2xfyVwPwJrPwFwRILrPwFwRILWf59we70Wf59we70ff4PwQT2ff4PwfwJWf59wRILWf59wRIL+/8bwu70+/8bwu70KACxwQT2KACxwfwJ+/8bwhIL+/8bwhILkAHZwu70kAHZwu70xgFzwgT2xgFzwvwJkAHZwhILkAHZwhILFAO4w+70FAO4w+70UgNXwwT2UgNXw/wJFAO4wxILFAO4wxILgwS5xO70gwS5xO70yARdxAT2yARdxPwJgwS5xBILgwS5xBIL4QXTxe704QXTxe70LQZ7xQT2LQZ7xfwJ4QXTxRIL4QXTxRILKwcDx+70KwcDx+70fAexxgT2fAexxvwJKwcDxxILKwcDxxILXAhMyO70XAhMyO70swgAyAT2swgAyPwJXAhMyBILXAhMyBILdwmpye70dwmpye700wljyQT20wljyfwJdwmpyRILdwmpyRILewoYy+70ewoYy+702wrYygT22wrYyvwJewoYyxILewoYyxILcAuWzO70cAuWzO700gtZzAT20gtZzPwJcAuWzBILcAuWzBILYwwazu70Ywwazu70xAzdzQT2xAzdzfwJYwwazhILYwwazhILVg2fz+70Vg2fz+70uA1izwT2uA1iz/wJVg2fzxILVg2fzxILSA4k0e70SA4k0e70qg7n0AT2qg7n0PwJSA4k0RILSA4k0RILPQ+o0u70PQ+o0u70ng9q0gT2ng9q0vwJPQ+o0hILPQ+o0hILNhAp1O70NhAp1O70lhDr0wT2lhDr0/wJNhAp1BILNhAp1BILKxGr1e70KxGr1e70jRFt1QT2jRFt1fwJKxGr1RILKxGr1RILIBIt1+70IBIt1+70ghLw1gT2ghLw1vwJIBIt1xILIBIt1xILFBOw2O70FBOw2O70dRN02AT2dRN02PwJFBOw2BILFBOw2BILAxQ32u70AxQ32u70ZRT62QT2ZRT62fwJAxQ32hILAxQ32hIL+BS82+70+BS82+70WRV+2wT2WRV+2/wJ+BS82xIL+BS82xIL8xU83e708xU83e70VBb93AT2VBb93PwJ8xU83RIL8xU83RIL7Ba83u707Ba83u70TRd+3gT2TRd+3vwJ7Ba83hIL7Ba83hIL3hc94O703hc94O70QBgA4AT2QBgA4PwJ3hc94BIL3hc94BIL0RjB4e700RjB4e70MhmE4QT2MhmE4fwJ0RjB4RIL0RjB4RILxRlG4+70xRlG4+70JhoI4wT2JhoI4/wJxRlG4xILxRlG4xILuxrJ5O70uxrJ5O70HBuK5AT2HBuK5PwJuxrJ5BILuxrJ5BILthtI5u70thtI5u70FxwK5gT2FxwK5vwJthtI5hILthtI5hILqRzJ5+70qRzJ5+70Cx2N5wT2Cx2N5/wJqRzJ5xILqRzJ5xILlh1R6e70lh1R6e70+B0V6QT2+B0V6fwJlh1R6RILlh1R6RILiR7X6u70iR7X6u706x6Z6gT26x6Z6vwJiR7X6hILiR7X6hILgx9Y7O70gx9Y7O705B8a7AT25B8a7PwJgx9Y7BILgx9Y7BILeCDa7e70eCDa7e702SCd7QT22SCd7fwJeCDa7RILeCDa7RILaSFf7+70aSFf7+70yyEi7wT2yyEi7/wJaSFf7xILaSFf7xILXyLj8O70XyLj8O70wCKl8AT2wCKl8PwJXyLj8BILXyLj8BILViNk8u70ViNk8u70tyMn8gT2tyMn8vwJViNk8hILViNk8hILRyTo8+70RyTo8+70qSSs8wT2qSSs8/wJRyTo8xILRyTo8xILOiVv9e70OiVv9e70myUx9QT2myUx9fwJOiVv9RILOiVv9RILNCbv9u70NCbv9u70lSaw9gT2lSaw9vwJNCbv9hILNCbv9hILLSdu+O70LSdu+O70jicx+AT2jicx+PwJLSdu+BILLSdu+BILHSjy+e70HSjy+e70fyi2+QT2fyi2+fwJHSjy+RILHSjy+RILDSl5++70DSl5++70byk8+wT2byk8+/wJDSl5+xILDSl5+xILASr+/O70ASr+/O70YyrA/AT2YyrA/PwJASr+/BILASr+/BIL+SqA/u70+SqA/u70WitC/gT2WitC/vwJ+SqA/hIL+SqA/hIL7isCAO707isCAO70UCzF/wT2UCzF//wJ7isCABIL7isCABIL4CyGAe704CyGAe70Qi1JAQT2Qi1JAfwJ4CyGARIL4CyGARIL1S0JA+701S0JA+70Ny7LAgT2Ny7LAvwJ1S0JAxIL1S0JAxILyy6MBO70yy6MBO70LC9OBAT2LC9OBPwJyy6MBBILyy6MBBILwS8OBu70wS8OBu70IjDRBQT2IjDRBfwJwS8OBhILwS8OBhILtjCQB+70tjCQB+70GDFTBwT2GDFTB/wJtjCQBxILtjCQBxILpjEVCe70pjEVCe70CDLZCAT2CDLZCPwJpjEVCRILpjEVCRILmjKbCu70mjKbCu70+zJdCgT2+zJdCvwJmjKbChILmjKbChILlTMcDO70lTMcDO709jPdCwT29jPdC/wJlTMcDBILlTMcDBILjTSbDe70jTSbDe707jReDQT27jReDfwJjTSbDRILjTSbDRILfzUgD+70fzUgD+704DXjDgT24DXjDvwJfzUgDxILfzUgDxILcDalEO70cDalEO700jZnEAT20jZnEPwJcDalEBILcDalEBILZzcmEu70ZzcmEu70yDfoEQT2yDfoEfwJZzcmEhILZzcmEhILWTipE+70WTipE+70uzhsEwT2uzhsE/wJWTipExILWTipExILTDkuFe70TDkuFe70rTnxFAT2rTnxFPwJTDkuFRILTDkuFRILQTqwFu70QTqwFu70ojpzFgT2ojpzFvwJQTqwFhILQTqwFhILNDszGO70NDszGO70lTv2FwT2lTv2F/wJNDszGBILNDszGBILKzy1Ge70Kzy1Ge70jDx3GQT2jDx3GfwJKzy1GRILKzy1GRILID03G+70ID03G+70gT36GgT2gT36GvwJID03GxILID03GxILEj67HO70Ej67HO70dD5+HAT2dD5+HPwJEj67HBILEj67HBILBz8+Hu70Bz8+Hu70aT8AHgT2aT8AHvwJBz8+HhILBz8+HhIL+z/BH+70+z/BH+70XUCDHwT2XUCDH/wJ+z/BHxIL+z/BHxIL70BEIe7070BEIe70UUEHIQT2UUEHIfwJ70BEIRIL70BEIRIL4UHJIu704UHJIu70Q0KMIgT2Q0KMIvwJ4UHJIhIL4UHJIhIL1kJNJO701kJNJO70N0MPJAT2N0MPJPwJ1kJNJBIL1kJNJBILz0PPJe70z0PPJe70MESQJQT2MESQJfwJz0PPJRILz0PPJRILx0RPJ+70x0RPJ+70KEURJwT2KEURJ/wJx0RPJxILx0RPJxILukXSKO70ukXSKO70G0aWKAT2G0aWKPwJukXSKBILukXSKBILqkZZKu70qkZZKu70DEcbKgT2DEcbKvwJqkZZKhILqkZZKhILo0faK+70o0faK+70BEicKwT2BEicK/wJo0faKxILo0faKxILnUhaLe70nUhaLe70/kgcLQT2/kgcLfwJnUhaLRILnUhaLRILkUncLu70kUncLu7080mfLgT280mfLvwJkUncLhILkUncLhILhkpgMO70hkpgMO7050ojMAT250ojMPwJhkpgMBILhkpgMBILekvkMe70ekvkMe7020umMQT220umMfwJekvkMRILekvkMRILbkxnM+70bkxnM+700EwqMwT20EwqM/wJbkxnMxILbkxnMxILYU3rNO70YU3rNO70w02uNAT2w02uNPwJYU3rNBILYU3rNBILUk5xNu70Uk5xNu70tE40NgT2tE40NvwJUk5xNhILUk5xNhILRk/1N+70Rk/1N+70p0+4NwT2p0+4N/wJRk/1NxILRk/1NxILO1B4Oe70O1B4Oe70nVA7OQT2nVA7OfwJO1B4ORILO1B4ORILK1H5Ou70K1H5Ou70j1HAOgT2j1HAOvwJK1H5OhILK1H5OhIL+VF2PO70+VF2PO70ZlJPPAT2ZlJPPPwJ+VF2PBIL+VF2PBILPlLXPe70PlLXPe70t1LpPQT2t1LpPQT2t1LpPfwJt1LpPfwJPlLXPRILPlLXPRILtlHfPu70tlHfPu70t1LpPQT2CVI5PwT2t1LpPQT2t1LpPfwJCVI5P/wJt1LpPfwJtlHfPhILtlHfPhILclBqP+70tlHfPu70clBqP+70CVI5PwT2jVDbPwT2CVI5P/wJjVDbP/wJtlHfPhILclBqPxILclBqPxILxk6IP+70xk6IP+70yk77PwT2yk77P/wJxk6IPxILxk6IPxIL/0yIP+70/0yIP+70/0z7PwT2/0z7P/wJ/0yIPxIL/0yIPxILNEuIP+70NEuIP+70NEv7PwT2NEv7P/wJNEuIPxILNEuIPxILakmIP+70akmIP+70akn7PwT2akn7P/wJakmIPxILakmIPxILn0eIP+70n0eIP+70n0f7PwT2n0f7P/wJn0eIPxILn0eIPxIL1EWIP+701EWIP+701EX7PwT21EX7P/wJ1EWIPxIL1EWIPxILCUSIP+70CUSIP+70CUT7PwT2CUT7P/wJCUSIPxILCUSIPxILP0KIP+70P0KIP+70P0L7PwT2P0L7P/wJP0KIPxILP0KIPxILdECIP+70dECIP+70dED7PwT2dED7P/wJdECIPxILdECIPxILqT6IP+70qT6IP+70qT77PwT2qT77P/wJqT6IPxILqT6IPxIL3zyIP+703zyIP+703zz7PwT23zz7P/wJ3zyIPxIL3zyIPxILFDuIP+70FDuIP+70FDv7PwT2FDv7P/wJFDuIPxILFDuIPxILSTmIP+70STmIP+70STn7PwT2STn7P/wJSTmIPxILSTmIPxILfjeIP+70fjeIP+70fjf7PwT2fjf7P/wJfjeIPxILfjeIPxILtDWIP+70tDWIP+70tDX7PwT2tDX7P/wJtDWIPxILtDWIPxIL6TOIP+706TOIP+706TP7PwT26TP7P/wJ6TOIPxIL6TOIPxILHjKIP+70HjKIP+70HjL7PwT2HjL7P/wJHjKIPxILHjKIPxILUzCIP+70UzCIP+70UzD7PwT2UzD7P/wJUzCIPxILUzCIPxILiS6IP+70iS6IP+70iS77PwT2iS77P/wJiS6IPxILiS6IPxILviyIP+70viyIP+70viz7PwT2viz7P/wJviyIPxILviyIPxIL9CqIP+709CqIP+708yr7PwT28yr7P/wJ9CqIPxIL9CqIPxILLSmDP+70LSmDP+70KSn2PwT2KSn2P/wJLSmDPxILLSmDPxIL",Uh="AAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/IfcQMLSJzfB+LriJTvAqderO2t/FcfPOme7Hfkr97twRe0b94OjcfbgCb9iyebQCTOozdBYxJNtVcA0xbvluMEx2n/IML0h2Lu01Lb6Jm9T/bQHP69D+dkb97M4udrcChtInbf8wAu6LLUJ22+osLL6JuM59awLPkMpGdEf91ch3c7kC7Mymav4wlOuCLEJ2xOgcK76JhcnzaALP8sSHcUb9W8OvcLkC38cUaP4wbul2K0J27OYRKr6J2MRkZgPP5r/Bbkf9h77zbboCbMOOZf0wfudnKkJ2r+SjKL2JBMBxYwDPobqIa0j9rrhAaroC/b0bYgAxfuUrKUN2qeFqJryJVrnNXvzOWrN5Zkj9xrB+ZLkCpra9XAQxueI6J0R2ed6pI7yJgbFsWPzO46qPX0j9cahTXbgC9K4XVgQxet+VJER249sPIb2JoKrPUf/OfaNqWEj9rKF6VrgCvKjKTwExotzbIUN2R9nvHbuJpqQSS/vO+5wPUUr90JpWTrkCYqI5SAUxKtoMH0V2MtZjGbiJhJ1oQfPOOJWGRkr9rpKFQrcC25o2PQ0xOdcBG0h2ddM6FLiJUJb9NPTOeY0XOUn9i4sLNbYCSpS/MAwxPdTdFUh2lNF7D7qJGpEBKfnO5IcnLEn9poacKLcCzo9NJQcxFdLsEEZ2S9DpCruJpI0FHvnOKoRCIEn9SIOoHLgCuIxBGgcxp9BiDEV2f8+VBryJVos8E/zOtIGcFEj9N4FYEbcC04rTDwQxs8/tB0R2IM/mAr2JKYq+Cf/OdIBhCkf9RICxB7gC9onyBgExNc8CBEN2Cc/B/72JxYnNAQDPDIDOAUf9CYB3/7kCwole/wAxCs+6AEN2G88+/b6J2oko+wLPJYCl+kf9O4De+LkC8YlP+f4wEs/7/UJ2Zc8k+r2JTYqq9P7OpICN80j98YDJ8LkCnYrJ8QIxRc9J+0N2ANBk9ryJfYvd6/3O74EH6kb9foIH57gCEoy+6AMxxc+i90R2dNA+9L+J9Iyo5ATPhINa4kb9w4NW4bkCNY2b4/wwWtCr9EF239Ct8r+J1Y0y4QPPeYSU3kj92YQ83bsCOI7N3/0wt9A980F23dGi77yJj49u2/3OX4Y62Ej9XIdS1bkClpBn2AMxddHX8ER2PNMt7L2JwJLE0v7O1ongzkj984pIzLgC6pMP0AIxx9I/7UN2FtV46LuJrZZFyvvOHo6ixUr9wI+OwrkCYpgNxwUxa9S66UV2DdjJ47eJt5zRv/LOt5Q/ukr9aZdFtrcCip+muw4x9tZl5Ul28Nv33reJkKXcs/HOUZ5VrUn9iqGsqbYC8agEsA8xpNpx4El26d8Q27qJXq+IqffO66g8okj99qt/n7YCjbKrpgkxrd4t3EZ2e+M52LyJZbjpofzOrLIKmkj9VrUTmLcCLbvbnwQxZOIH2UR2HOfb1buJ4sAFnPvO4busk0j90L7hkbgC88MmmgUx6OWY1kV2werm07yJ0snnlv3OicUrjkf9VsjGjLgCvcxzlQMxmul61ER2ou2c0r6JodE5kwHP8M07ikf96c9pibgCrtNfkv8w0Ozz0kJ2aPCW0b2JBdi4kADP4tSEh0j9Kde5hrkCZdrljwAxdu/q0UN2O/R+0LuJJuAijvvOvt20hEj9GuHSg7kCp+M2jQUx2fLb0EV20/e6z72Jrunii//O/+dOgkb9guragbgCTOxpiwExyPbqz0N2Jfpgz7+JXfDKigPPK+8lgUb9ofD2gLkC4vGZiv0wifl0z0F2cvwpz76JZ/U6igHPqPSJgEf9o/ZggLoCdfcQiv8wn/s6z0J2g/8Lz72JKfzRif/OA/wYgEj9of4KgLkC4v7DiQExbv4Rz0N2IwMlz7yJkwTZif7OIwUjgEj9FAhKgLkCowcBigIx7AEVz0R2WQZzz72J/gx4igDPMw7TgEb9fRAZgbgCXw/CigAxZgVVz0N24wjYz76JlRNiiwLPUBXSgUj9JhclgrkCfxW5i/4wHwi1z0J2gQyu0LuJzRrXjPvOPR1rg0n9mSBBhLoCTh62jQUxIAtW0EV2GhEn0rqJjSXkj/jO4Si9hkf9lCwMiLcCailCkQgxlg+e0UZ2eRSF072JTS+hkwDPUjPGikf9aTW2i7cCezGblAAxnBMi00N2HRfV1L2JuDWplgDPRDoRjkj9Uzwlj7kC3DfIlwAxQhZj1EN2OBqp1ryJqTyBmv3O0kFCkkj9cETfk7kCYz8wnAMxIxn/1UR2KB2r2L2JPURvn//O+kmVl0f9G0wgmbgCc0YJoQExRhwH2EN2Qh9N2r6JCkrNowLPNlBKnEb9m1FunbkCfkv8pP4wrB7T2UJ2zCCh27+JDU4rpwPPiVTun0b9pVXroLoCNE8yqP0wVSA320F2ZSIk3b6JtFGEqgLPgViSo0f901ncpLoCE1Paq/4w2CGb3EJ2fSRc372JS1Ypr//Og12kqEj9UF+dqrkCK1g2sQExvyOL3kN28SZY4ryJDlzLtfzOwWPYr0f9uWVdsrgCG15quAQxISZO4UR24CgL5b2JZ2H0vADPe2mNt0X9wmpxubgCumLrvgAxWChB5EN2qylA5r+JS2RawQTPjGw7vET912yzvLoCmGTWwfwwiykN5kF2qylB5r+Jv2QUwgXPA237vET932zAvLwCmWTXwfswuyla5kF2fCn05b+JTWRcwQXPiGw0vET9Ymz3u7wCJmQewfswjCkO5kF2Symn5b+J12OiwAXPCWxqu0T94msuu7wCsGNkwPwwWynB5UF2OymP5b+JiWMowAXPt2vpukT9uGvrurwCi2MqwPswOymO5UF2iikM5r+J7GPCwATPJmyZu0X9g2wrvLwCS2RZwfwwYynO5UF27Cmq5r+J72RjwgTPPm1avUT9gW3JvbsCNWXWwvwwzyl75kF2vSle5r+JH2WywgTPaW2hvUP9EG0QvbwCxGQdwvww4ymc5kF2PCmR5b+J+2PbwATPLGyhu0T9wWv6ur0CjmMvwPwwainZ5UF2QSmX5b+JW2PgvwTPiGuhukX9w2v9urwCmGM+wPwwJylw5UF2likg5r+JHmQSwQTPXGztu0T9o2xfvLwCZ2SHwfwweCnv5UF2jSkQ5r+JgGSvwQXPv2yNvET9kWxCvLwCUWRiwfswoSkw5kF2eynz5b+JI2QZwQXPXWzvu0T9X2zyu7wCJWQdwfsweiny5UF2nykt5r+JUWRkwQXPkmxDvET9umyFvLwCfGSowfwwjikR5kF2sSlJ5r+JpmTswQXP6mzSvET96mzSvLwCpmTswfswsSlJ5kF2iSkK5r+JdmSfwQXPtWx7vET9hmwxvLwCR2RTwfswnSkq5kF2ZCnO5b+JAmTlwAXPOGy0u0b9I2yTu7wC7GPDwPswbSnc5UF2jSrK57yJVWURw/7OzW1GvlD9QW/FwLwC3GauxQIx9inI5kR2JC4K8Y2Jr2zU0Z3OZnZwz2r9X3qU2skCCXHo3W4xzyxE7W12Ki5uB9qIe3X4/jTNUX6n63P8z3166Jn+uX1+6OEEM37O6/0G6nFIHA8z+i52AQ53QBwxJdSIkGlMNQXP2nPuNbr4QHKwOZn+LnKnOU77QHKwOWcBLnKnObIE+XMANh4EkGlMNfswyCD1IEJ3bwi8L4qJOC9rbAXPryEdcXbOEjNEdSf7ByTKejL9GzNYdWcBPxfXfZECOC9rbPswvBNjdHkxmQy5Ln92IwHyML2JmwUcdv7O8gXUf0L9MAPuf64CtwI2dgExPgLoMEN2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7oCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2r//7ML+Jnv9BdgTPkP/3f0b9MP/3f7wCO/9Advww1//7MEF2KP3gML2J/Pstdv7Ocvvjf0v9nvjBf7sCCfkKdgIxU/7uMEN2AAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAAGAAAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/AAAAAP9/OfqcMLyJ7fYeML2JPPXAdf3Ob+yedADPJvRrf0f9r+oufkf9BvEXf7kCZOjFfbgC+/FodQMxDOoxdAAxhPu/MER24fdJMEN2RvSLL76JseVJcwHPaOO7fEf9cOFEfLkCpuPMcv8wF/W9L0J2hfHGLr2JU9+kcQDPftzxekj9PNpEerkC+tzxcAAxdPIOL0N27O18LbuJfNcVb/zO8NMleEn909D0drkCPNTXbQQxM+/5LUR2g+l1K7qJVs3UavjO7ciDc0n9UMW3cbgCj8n0aAkx/eowLEZ2leU1KbyJCcNPZfzO2L2KbUf9DrvOa7cCIMCAYwQxuubrKUR2leIjJ72JIbseYP/OVbXtZ0f9NbNeZrgC6rh+XgExduPIJ0N2Q+BKJb6JDrV3WwHPy67mYkf9Iq2DYbkCVbMGWv8w9ODeJUJ2V96SI76JLrA+VwLPhqlUXkj9GagAXbkCsq7cVf4w794fJEJ229sCIbyJ8aoiUvzOy6O7WEn9k6FeVrkCoairTwQxxdz7IUR28th9HbuJ/KM/SvnORJwuUEf9+Zk9TbcCl6EuRwcx49myHkV2JdcBG76JVp6sQgLPQpYSSEX9TpWmRrgCWZ0yQf4wi9eZG0J2r9ZPGr+JU5yhPwXPIpTZRET9EZS+RLsCQZyFP/swttZbGkF2oNY3Gr+JJpxZPwXP8ZONRET96JN+RLwCHJxKP/swpNY9GkF2jdYZGr+JAJwePwXPyJNMRET9t5MwRLwC7psBP/swlNYlGkF2g9YKGr+J2pvhPgXPoJMMRET9npMIRLwC2JvePvswhNYMGkF2ftYBGr+J0JvRPgXPlZP6Q0T9j5PxQ7wCypvIPvswgNYFGkF2Z9bdGb+JrJuYPgXPbJO6Q0T9VZOUQ7wCk5twPvswcdbtGUF2RdalGb+JXpsaPgXPGJMxQ0T9+5IDQ7wCQJvqPfswUda5GUF2OtaUGb+JJZu9PQXP3JLPQkT93ZLSQrwCJpvAPfswOdaTGUF2Z9bcGb+JXZsZPgTPHJM4Q0P9T5OLQ7wCkptvPvwwUda5GUF2rdZMGr+JApwgPwTPzpNVRET9BpSuRL0CPJx8P/wwldYmGkF2ttZbGr+JZJy8PwXPNZT2REX9JJTcRLwCU5ygP/swvtZmGkF2a9biGb+J7psBPwTPsZMnREX9YZOnQ7wCm5t9PvwwjdYZGkF2J9Z1Gb+JIZu3PQXP1ZLFQkT9rpKFQrsC+Zp1PfswONaQGUF2MNaDGb+J75plPQXPo5JzQkT9wZKjQrwCDZuXPfswI9ZuGUF2W9bKGb+JUZsGPgXPDpMhQ0T9M5NdQ7wCd5tDPvswTNaxGUF2eNb4Gb+JrZuZPgXPcJO/Q0T9f5PXQ7wCvJuyPvswctbuGUF2gdYHGr+Jz5vQPgXPlJP6Q0T9mJP/Q7wC0pvWPvswgNYFGkF2gdYGGr+J1JvYPgXPmZMBRET9l5P+Q7wC0pvVPvswgtYIGkF2fNb/Gb+Jy5vKPgXPkJPyQ0T9i5PqQ7wCxpvCPvswftYCGkF2etb7Gb+JwZu6PgXPhZPhQ0T9hJPgQ7wCwJu5Pvswetb7GUF2fdYAGr+JxJu/PgXPiZPnQ0T9jZPuQ7wCyZvGPvswe9b9GUF2gdYGGr+Jz5vQPgXPlJP6Q0T9l5P9Q7wC0ZvUPvswgNYFGkF2kNYfGr+J5ZvzPgXPrZMgRET9vpM7RLwC9psPP/swidYTGkF2xdZxGr+JP5yBPwTPEJS9RET9RZQQRbwCdpzXP/wwrtZOGkF26taqGr+JvZxGQAXPl5SPRUT9p5SoRbwCzpxgQPsw49agGkF2s9ZVGr+JlJwGQATPZZRBRUX9HJTQRLwCSZyRP/ww0daFGkF2WNbFGb+Jt5upPgTPdZPIQ0X9MJNYQ7sCb5s1Pvwwdtb0GUF2KtZ5Gb+JE5uhPQXPyJKvQkT9tJKOQrwC/5p/PfswMtaHGUF2L9aDGb+J/Jp6PQXPsJKIQkT9wZKkQrwCDZuWPfswKNZ3GUF2Uta6Gb+JP5voPQXP+pIBQ0T9GpM0Q7wCYJsdPvswRNakGUF2cNbsGb+JlZtzPgXPVpOWQ0T9apO2Q7wCqZuUPvswaNbeGUF2jdYZGr+J1pvbPgXPnZMHRET9tJMsRLwC7psCP/swg9YJGkF2ptZAGr+JGJxEPwXP5JN4RET99pOTRLwCKpxgP/swntY1GkF2otY7Gr+JL5xoPwXP+5OcRET975OJRLwCIpxUP/swqNZEGkF2lNYlGr+JC5wvPwXP1JNfRET9ypNPRLwCAJweP/swmdYsGkF2m9YvGr+JA5wjPwXPzZNTRET92pNoRLwCEJw3P/swldYnGkF2otY7Gr+JH5xPPwXP65ODRET97ZOGRLwCIZxTP/swodY5GkF2g9YJGr+J/JsYPwXPw5NDREX9nZMHRLwC1ZvaPvswk9YiGkF2G9ZhGb+JRJvxPQTP+JL9QkX9kpJWQrsC25pEPfwwR9aoGUF2odWSGL+JE5r1OwTPrpHZQET9UpE8QLsCtJlTO/wwyNXVGEF2AtY2Gb+J+ZnIOwPPnpG+QEH9PZLJQb0Cm5raPP0wvtXCGEF2ytfrG7yJB52xQPzO95QjRj79u5bCSMAC055cQwQxBNfDGkR2udqyH7qJQ6NWSffOvZuFTz39SJ6fUsIC1qV7TAkxl9lRHkZ2zt7rI7eJFqxHU/HOVKVNWjz91KivXcQCoa+zVg8xPd1nIkl2n+PVJ7eJVbdAXfHOh7EVZTv9abX7Z8QCQ7svYA8x4eGJJkl2qOj9KriJcsOKZfTOpb4Fbjz9m8JHcMQCdMfTZwwx5Ob7KUh22e1tLbmJ2s/6a/TOFcz2dD39LtCydsQCANS8bQwxBeynLEd2BfMsL7mJc9zCcPbOutkcej79v91Me8MChuD3cQoxPPGlLkd2YPcvMLyJ8+fFc/zOJOZUfUD9P+ntfcICHOthdAQxAvbrL0R2KPqfML6JIPAudQLP6u7SfkH9n/AKf8AC3/Fndf4wafmHMEJ2YvzXML6JdPXHdQLPrvR3f0H9bvacf78CPvftdf4wn/vHMEJ2jf70ML6Jx/oidgLPcfrZf0H9HPzof74CfPwydv4w1P3tMEJ2KAD6ML+JS/9AdgTPS//3f0L9WAD3f74CXwBAdvwwtP/6MEF24QHwML+J/gI2dgPPUQPsf0L9zgTgf74ChAQqdv0wPAH2MEF2IQTMML6JAwj6dQLPxAiqf0H9pwqGf78C8QnUdf4wTwPcMEJ26wZ5ML2JTQ5hdQDPmA8Df0D96hG1fr8CqxARdQAx6AWbMEN2GwroL72JvRU7dP/OqRfDfUD9PBpAfcACXRi1cwEx+wghMEN2vAxJL76J4hyrcgLPXB8RfEL9KiGYe78Cux4wcv4w8wt+L0J2Tg7YLr+JkSFjcQTPZSSvekn9WyVler8CjyIXcfww5g33LkF2vAnYL6+Jmh1ucuLOOh8afGb9nBiUfckCihYGdCIxLAxOL0924PdtLv+Ix/yWdYvNmg05f3786vnZf/z+luFQfPkBdg0YfwMHiOLDcbkydP1UL+Z2eturG32I88qvaQXPGcrdc7f4lMZjcpn+7Pe7f2f+ZN/Fe/IAncZRcq8EE8oCdDAE88qvafswBd/GH4Z3ztDt+xiJuY8dJQXPM4sGDUrNjYYlKE/7ZoWKJNz71IB7Dg3/eoYrKGcBb4Ck9Z4BioWFJEMHuY8dJfswKotn8ngy5NCPAQB3GtTq6qGJk5EL1rjONIRC4Pz4hIgv0jr9m4BADA3+m4Ck8wMBUoxHyZsCGIQa4IkDspV4zEIxwdIV7mJ2XdY45r6JlZoxwwLPSpIhvkT9IpO+vLMCd5u+wf4wBNbK5kJ2ktbe5b+JKJyjwAXP8pNyu0T9x5O2u7sC/JvpwPswpdbB5UF2YdYs5r+Jq5tqwQXPa5NJvET9R5ODvLwChpumwfswcdYT5kF2b9YW5r+JhJupwQXPRZOGvET9Z5NPvLwCp5tvwfswYdYt5kF2r9ay5b+JBZzawATP0pOlu0T9C5RLu7sCQJx9wPwwltbY5UF2x9aL5b+Je5whwAXPTpTiukT9TpTiurwCe5whwPswx9aL5UF2tdao5b+JZZxEwAXPNZQJu0T9H5Qru7wCT5xmwPswvtaa5UF2rNa25b+JOZyIwAXPB5RSu0T9B5RSu7wCOZyIwPswrNa25UF2jdbn5b+JE5zEwAXP3JOVu0T9t5PPu7wC7pv/wPswnNbP5UF2YdYs5r+Jp5twwQXPZ5NQvET9RpOEvLwChZumwfswb9YW5kF2c9YQ5r+JipufwQXPS5N8vET9cJNAvLwCsJtiwfswY9Yp5kF2qta55b+JBZzawAXP0ZOmu0T9/5Neu7sCNJyQwPswltbY5UF2zdaC5b+JdpwpwAXPSpTpukT9XJTMurwCiZwMwPswxdaO5UF2vtaa5b+JgJwawAXPUpTcukP9N5QGu7wCZJxEwPswydaI5UF2adYg5r+J8Jv7wATPs5PVu0P9XpNdvL0CmZuHwfwwjtbl5UF2L9Z/5r+JJptAwgXP3JIwvUT9wZJcvb0CC5ttwvswOtZs5kF2ZtYl5r+JQJsXwgTP/pL5vEX9TJN6vLwCkZuUwfwwRdZb5kF2q9a35b+JDZzOwAXP2ZOZu0T9ApRYu7sCN5yLwPswmdbT5UF2star5b+JVZxcwAXPJZQiu0T9GZQ1u7wCSZxvwPswt9aj5UF2ttam5b+JR5xywAXPFpQ5u0T9IJQpu7wCUZxiwPswsdat5UF2utag5b+JW5xSwAXPLJQXu0X9LJQXu7wCW5xSwPswutag5UF2Z9ec5L+JKZ0XvwPPF5WsuUj95JV4uLwC/Z3Xvf0wEdcd5UF2ntmk4buJA6GYufrOWJmas0n9kZuzsLkCVaORtgYxs9jW4kV2udwU3ruJM6jQsPrOIaEfqkf9qKNpp7cC16r7rQYxsdsx30V2dN9s272Jba92qf/O6qg8okf92Kp7oLgCb7GipwExqN4m3EN2suGJ2b6JHrV8pAHPEa/hnEf9u7CKm7kC2rYYo/8wAeEY2kJ2/ePX172JdLpeoADP2rRsmEf9tbYal7kCYrz/ngAxN+Nk2EN2TuZR1r6JH8B+nAHP/Lo9lEf9xrwdk7kC/MFSm/8wj+XJ1kJ29OjN1L2JFMbqmP/OdcFckEf9rMMlj7kCY8inlwExCOhO1UN27+tX072JGc1Glf/OEMltjEf9c8tSi7gClc8glAEx8urN00N25+4f0r2JXtQZkgDP7dABiUj9ONMgiLkCwdYukQAx9O180kN2KfIK0b2J2Ntsj/7OCtkchkj9udtIhbkCo96QjgIxDfFi0UN2jfUr0L2JE+Qajf/O8uGdg0j9lOQBg7kC0eZ4jAExdvRs0EN2BvmLz72JVexni/7O5erJgUj9qe1bgbkCN+/0igIx4ve4z0N2w/wnz7yJHfVDiv3OaPSPgEj9afdSgLgCPvgEigMxhftBz0R2QAAKz72J9v3Gif/O9f0NgEf9iwAJgLgCqADCiQExLv8Mz0N2WwMnz72JtAXkiQDPUwYwgEj9rghUgLkCKAgJigAxYQIYz0N2CQePz7yJyQ2RivzOIg/ugEn9ShJZgbkCFBEAiwQxvAVjz0R2hAtw0LqJFBg+jPnOTRrEgkn9/h2Zg7gC7hsdjQcxAgoZ0EZ28g+60buJHCMZj/vONybfhUj9jyn4hrcCmiY+kAUxkw5H0UV2ohMn07yJtyyKkv7OkDCbiUj9NzO7ircCey+2kwIxixKx0kR2Mxfm1LyJHzVdlvzOrjnFjUj9jDxDj7gCHTjslwQxBRZJ1ER23RoW17uJ+j1Pm/vOQ0Mik0j9H0b1lLgC9kA1nQUxsBlW1kV2yh0l2b2J50WhoADPx0vhmEf9xk1hmrgC+0cwogAx9xyG2EN2WyBC272JFkx9pf/OelIonkj9f1Tln7kCMU5NpwExhh+K2kN2/yLF3byJZ1Izq/7OUFlbpEj9ZltvprgCk1RerQIxIyLp3ER2VCVS4L2JbVh/sf/OzV8pq0j9f2EdrbkCMFqHswExoSSD30N2VCfW4r2Jc12MtwDPOWW2sUf9uWaws7kCAV+auQAxtSYE4kN20Cjv5L6JiWEkvQLPm2m7t0X9mGoyubkCjmKpvv4wZihS5EJ2cinl5b+JzWORwATPA2xhu0T9QmzFu7oCDmT5wPwwVym65UF2hSkD5r+JRmRRwQXPgmwqvET9eWwcvLwCPGRCwfswiSkJ5kF2kSkW5r+JRmRSwQXPhGwtvET9lmxLvLwCWWRwwfswiSkJ5kF2fSn25b+JSmRYwQXPhWwwvET9ZWz7u7wCKGQiwfswiykM5kF2PimT5b+JzGOQwATP+2tVu0T9wmv7ur0CkWM0wPwwVim55UF2QSmY5b+Jd2MMwAXPpWvOukT9xmsAu7wCmWNAwPswMymC5UF2WSm+5b+Jx2OIwAXP+mtSu0T9Bmxmu7wC1GOcwPswVCm25UF2cSnk5b+J92PTwAXPLmylu0T9RGzIu7wCDWT3wPswaCnV5UF2pSk35r+JV2RtwQTPmGxOvET9ymydvLwCimS/wfwwkCkV5kF2jCkO5r+JhWS3wQTPxGyVvEP9jmw9vLwCTWRewfwwoyk05kF2Kyl25b+JvWN4wATP6Ws4u0P9kmuxur0CY2Ptv/wwUCmw5UF2FClT5b+JG2N9vwXPQGsyukX9UWtMur0CLWOYv/swDSlH5UF2Vym75b+Jh2MkwATPuGvrukX9/WtYu7wCzmOUwPwwOimM5UF2gykA5r+JJ2QgwQXPYmz3u0T9c2wSvLsCOGQ7wfswfCn15UF2gin+5b+JP2RGwQXPemwevEP9cWwPvLwCNWQ2wfswhikF5kF2XSnE5b+JBGTowAXPOWy2u0T9E2x6u7wC3WOqwPswbSne5UF2Gilb5b+JeGMMwATPoGvGukT9ZGtour0COmOsv/wwMymD5UF2RCme5b+JTmPMvwTPfGuNukX9zGsLu7wComNOwPwwIilo5UF2wSll5r+JYmR+wQTPp2xlvET9EG0PvbsCzmQtwvwwlCkc5kF2rClD5r+J62RcwgTPMW1FvUP95WzJvLwCnGTcwfwwzSl45kF2RCmc5b+J92PTwATPKGybu0T902sVu70Cn2NKwPwwaCnV5UF2Qymc5b+Jc2MEwAXPoWvHukX9y2sJu7wCnmNJwPswMSl/5UF2iCkI5r+JB2TtwATPQmzEu0T9fGwhvLwCQ2RNwfwwbyng5UF2einx5b+JUWRiwQXPjGw6vET9Xmzxu7wCImQYwfswjSkQ5kF2Rimf5b+JzGOPwAXP/GtWu0T91msau7wCpGNSwPswVim55UF2eSnx5b+Jz2OVwATPB2xnu0T9V2zlu7wCImQXwfwwWCm85UF2nCkn5r+Jc2SawQXPtGx6vEP9tGx6vLwCc2SawfswnCkn5kF2OimO5b+J/mPgwATPL2ymu0P9vGvyur0CiWMnwPwwaynb5UF2EilP5b+JHGN/vwXPQWszukX9TGtEur0CJ2OQv/swDilI5UF2eCnw5b+JqWNawATP4Gspu0X9Umzeu7sCH2QUwfwwSCmj5UF2tylT5r+JpGTpwQXP6WzRvET9+mzrvLsCtWQEwvswsClI5kF2jikR5r+JjGTCwQTPy2ygvEP9k2xFvLwCUmRlwfwwpik45kF2Tims5b+J6GO8wAXPGmyGu0T97Gs9u70CuGNxwPswYinM5UF2USmx5b+JpGNSwAXP1WsZu0T98GtDu7wCwGN9wPswRimf5UF2fin45b+JBGTowAXPPWy9u0T9ZWz7u7wCLGQowfswbSne5UF2cCni5b+JL2QtwQXPaGwBvET9RGzHu7wCCmTywPswfyn65UF2XSnE5b+J4WOwwAXPFWx9u0T9EWx3u7wC3WOrwPswXynH5UF2VSm45b+J0mOZwAXPBGxju0T9/WtXu7wCymONwPswWSm95UF2Uimz5b+JwmOBwAXP9GtJu0T99GtJu7wCwmOBwPswUimz5UF2kCkV5r+JDWT3wATPSWzQu0T9kWxDvLwCV2RuwfwwcSnk5UF2kikZ5r+Jf2StwQXPv2yMvEP9nmxXvLwCXWR3wfswoSkv5kF2NCmE5b+J22OnwATPCWxru0P9q2vWur0CeWMPwPwwXCnD5UF2Gilb5b+JKGORvwXPT2tIukX9X2tiurwCOmOsv/swEylQ5UF2cSnk5b+JrWNfwATP4mstu0X9QGzBu7wCDWT3wPwwSSml5UF2mSkk5r+JbWSRwQXPrWxwvET9rmxwvLwCbmSRwfswmSkj5kF2XynI5b+JKGQiwQTPX2zyu0T9GmyGu70C4mOzwPwwfCn25UF2cSnk5b+J1GOdwATPC2xuu0T9Q2zFu7wCDmT4wPswWim/5UF2iykN5r+JSWRXwQXPhmwxvET9iWw1vLwCTGRbwfswiikL5kF2bSne5b+JKWQkwQXPYmz2u0T9PWy9u7wCBGTowPswfSn25UF2cCni5b+J9GPQwAXPLGyhu0T9QWzCu7wCCmTywPswZynU5UF2UCmv5b+J72PHwATPIWyRu0T98WtFu7wCvWN4wPwwZSnQ5UF2Vim55b+Jq2NcwAXP3Wslu0T9/GtWu7wCy2OPwPswSSmk5UF2fCn05b+JCGTvwAXPQmzEu0T9Xmzxu7wCJmQewfswbynh5UF2bine5b+JJGQbwQXPXGztu0T9PWy9u7wCBGTpwPsweynz5UF2aSnW5b+J7mPGwAXPJGyVu0T9Lmyku7wC+GPWwPswZSnQ5UF2cinl5b+JCWTwwAXPQWzCu0T9R2zMu7wCD2T6wPswbynh5UF2jSkQ5r+JM2QzwQXPb2wNvET9i2w5vLwCUGRhwfswgSn95UF2fCn15b+JSmRXwQXPhWwvvEP9Y2z5u7wCJ2QgwfswiikM5kF2PymU5b+JzGOQwAXP+2tVu0T9xWv/urwCk2M3wPswVim55UF2Jilu5b+JWWPdvwXPg2uYukT9gWuWurwCWGPbv/swJylv5UF2YynO5b+JoWNNwATP1WsYu0X9HGyJu7wC62PBwPwwRCme5UF2oCkv5r+JWmRxwQXPmmxRvET9vmyKvLwCf2StwfswkSkX5kF2VCm35b+JNmQ4wQTPbGwGvEP9AWxdu7wCyGOKwPwwgin/5UF2FylX5b+JRmO/vwXPbWt2ukT9WmtaurwCM2Oiv/swHylj5UF2SCmk5b+JZmPwvwTPlGuzukT912scu7wCq2NcwPwwLCl35UF2bCnb5b+J+GPVwAXPLmylu0T9Nmyxu7wCAGThwPswaCnW5UF2cCnh5b+JCGTvwAXPQGzBu0T9QWzCu7wCCWTwwPswbynh5UF2cSnk5b+JDGT0wAXPRGzHu0T9RWzJu7wCDWT3wPswcSnj5UF2fyn65b+JH2QTwQXPWWzpu0T9aGwBvLwCLmQswfsweSnv5UF2nSkq5r+JW2RzwQXPm2xSvET9tmx+vLwCd2ShwfswkSkX5kF2iikL5r+JbmSSwQXPrGxtvET9h2wyvLwCSGRVwfswmSkk5kF2ZinS5b+JCmTywAXPQGzCu0T9KWycu7wC8mPLwPswcCni5UF2hCkB5r+JCmTxwAXPRGzIu0b9c2wSvLwCOmQ+wfswcCni5UF2jyrJ572JnWWHwwDPEm67vlD9Pm/AwL0C12akxQAxFSr45kN2BC6h8I6JXWwQ0aDOD3afzmz9EXqX2csCwHD13Gwxrizu7Gt2Dy5XB86Ib3Vv/hvNJX6a6nP8mH1b55n+g31f598EB37E6v4GxnGkHCsz3i5bARl34xt7JdaIHmkqNgXPcXPPNr34xnGgOpn+tHGXOlD7xnGgOmcBtHGXOrAEj3PjNhwEHmkqNvswYiBZIUJ3QQjIL4uJay7DbAXPESFNcXvONTKkdSb7XiP7ejP9PTK3dWcBxRbufZECay7DbPswVBN2dHYxYAzNLn12GgHzML2JcAUedv/OxAXWf0P9GAPuf64CogI3dgExLQLpMEN2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7oCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2AAD7ML+JAABBdgXPAAD4f0T9AAD4f7wCAABBdvswAAD7MEF2rv/7ML+Jnv9BdgTPj//3f0b9L//3f7wCOv9Advww1//7MEF2xf3rML6Juvw0dgHPUvzqf0j9P/rWf7sCk/ofdv8wo/7zMEJ2",Dh="AAABAAIAAwAEAAAABQAGAAMABwAIAAUACQAKAAcACwAMAAkADQAOAAsADwAQAA0AEQASAA8AEwAUABEAFQAWABMAFwAYABUAGQAaABcAGwAcABkAHQAeABsAHwAgAB0AIQAiAB8AIwAkACEAJQAmACMAJwAoACUAKQAqACcAKwAsACkALQAuACsALwAwAC0AMQAyAC8AMwA0ADEANQA2ADMANwA4ADUAOQA6ADsAPAA9ADkAPgA/AEAAQQBCAEMARABFAEEARgBHAEgASQBKAEYASwBMAEkAAAACAE0ABQADAAAACQAHAAUADQALAAkAEQAPAA0AFQATABEAGQAXABUAHQAbABkAIQAfAB0AJQAjACEAKQAnACUALQArACkAMQAvAC0ANQAzADEATgA3ADUAPAA5ADsAQwA+AEAARABBAEMARgBIAEQASwBJAEYAAABNAE8ACQAFAAAAEQANAAkAGQAVABEAIQAdABkAKQAlACEAMQAtACkATgA1ADEAPAA7AFAARABDAEAASwBGAEQAAABPAFEAEQAJAAAAIQAZABEAMQApACEAUABOADEAQAA8AFAASwBEAEAAAABRAFIAIQARAAAAUAAxACEASwBAAFAAAABSAFMAUAAhAAAAVABLAFAAAABTAFUAVABQAAAAAABVAFYAVwBUAAAAAABWAFgAWQBXAAAAAABYAFoAWwBZAAAAAABaAFwAXQBbAAAAAABcAF4AXwBdAAAAAABeAGAAYQBfAAAAAABgAGIAYgBhAAAAYwBkAGUAZQBmAGcAZwBoAGkAaQBqAGsAawBsAG0AbQBuAG8AbwBwAHEAcQByAHMAcwB0AHUAdQB2AHcAdwB4AHkAeQB6AHsAewB8AH0AfQB+AH8AfwCAAIEAgQCCAIMAgwCEAIUAhQCGAIcAhwCIAIkAiQCKAIsAiwCMAI0AjQCOAI8AjwCQAJEAkQCSAJMAkwCUAJUAlQCWAJcAlwCYAJkAmQCaAJsAnACdAJ4AngCfAKAAoQCiAKMApAClAKYApgCnAKgAqQCqAKsAqwCsAK0ArQCuAK8AsABjAGUAZQBnAGkAaQBrAG0AbQBvAHEAcQBzAHUAdQB3AHkAeQB7AH0AfQB/AIEAgQCDAIUAhQCHAIkAiQCLAI0AjQCPAJEAkQCTAJUAlQCXAJkAmQCbALEAnACeAKAAoQCjAKQApACmAKgAqACpAKsAqwCtAK8AsgCwAGUAZQBpAG0AbQBxAHUAdQB5AH0AfQCBAIUAhQCJAI0AjQCRAJUAlQCZALEAswCcAKAAoQCkAKgAqACrAK8AtACyAGUAZQBtAHUAdQB9AIUAhQCNAJUAlQCxALMAswCgAKEAoQCoAK8AtQC0AGUAZQB1AIUAhQCVALMAswChAK8AtgC1AGUAZQCFALMAswCvALcAuAC2AGUAZQCzALcAuQC4AGUAZQC3ALoAuwC5AGUAZQC6ALwAvQC7AGUAZQC8AL4AvwC9AGUAZQC+AMAAwQC/AGUAZQDAAMIAwwDBAGUAZQDCAMQAxQDDAGUAZQDEAMUAAAAEAMYABADHAMYAyADJAMoAyQDLAMoAygDLAMwAywDNAMwAzADNAM4AzQDPAM4A0ADRAGUA0QBmAGUABAADAMcAAwDSAMcAyQDTAMsA0wDUAMsAywDUAM0A1ADVAM0AzQDVAM8A1QDWAM8A0QDXAGYA1wBnAGYAAwAGANIABgDYANIA0wDZANQA2QDaANQA1ADaANUA2gDbANUA1QDbANYA2wDcANYA1wDdAGcA3QBoAGcABgAFANgABQDeANgA2QDfANoA3wDgANoA2gDgANsA4ADhANsA2wDhANwA4QDiANwA3QDjAGgA4wBpAGgABQAIAN4ACADkAN4A3wDlAOAA5QDmAOAA4ADmAOEA5gDnAOEA4QDnAOIA5wDoAOIA4wDpAGkA6QBqAGkACAAHAOQABwDqAOQA5QDrAOYA6wDsAOYA5gDsAOcA7ADtAOcA5wDtAOgA7QDuAOgA6QDvAGoA7wBrAGoABwAKAOoACgDwAOoA6wDxAOwA8QDyAOwA7ADyAO0A8gDzAO0A7QDzAO4A8wD0AO4A7wD1AGsA9QBsAGsACgAJAPAACQD2APAA8QD3APIA9wD4APIA8gD4APMA+AD5APMA8wD5APQA+QD6APQA9QD7AGwA+wBtAGwACQAMAPYADAD8APYA9wD9APgA/QD+APgA+AD+APkA/gD/APkA+QD/APoA/wAAAfoA+wABAW0AAQFuAG0ADAALAPwACwACAfwA/QADAf4AAwEEAf4A/gAEAf8ABAEFAf8A/wAFAQABBQEGAQABAQEHAW4ABwFvAG4ACwAOAAIBDgAIAQIBAwEJAQQBCQEKAQQBBAEKAQUBCgELAQUBBQELAQYBCwEMAQYBBwENAW8ADQFwAG8ADgANAAgBDQAOAQgBCQEPAQoBDwEQAQoBCgEQAQsBEAERAQsBCwERAQwBEQESAQwBDQETAXAAEwFxAHAADQAQAA4BEAAUAQ4BDwEVARABFQEWARABEAEWAREBFgEXAREBEQEXARIBFwEYARIBEwEZAXEAGQFyAHEAEAAPABQBDwAaARQBFQEbARYBGwEcARYBFgEcARcBHAEdARcBFwEdARgBHQEeARgBGQEfAXIAHwFzAHIADwASABoBEgAgARoBGwEhARwBIQEiARwBHAEiAR0BIgEjAR0BHQEjAR4BIwEkAR4BHwElAXMAJQF0AHMAEgARACABEQAmASABIQEnASIBJwEoASIBIgEoASMBKAEpASMBIwEpASQBKQEqASQBJQErAXQAKwF1AHQAEQAUACYBFAAsASYBJwEtASgBLQEuASgBKAEuASkBLgEvASkBKQEvASoBLwEwASoBKwExAXUAMQF2AHUAFAATACwBEwAyASwBLQEzAS4BMwE0AS4BLgE0AS8BNAE1AS8BLwE1ATABNQE2ATABMQE3AXYANwF3AHYAEwAWADIBFgA4ATIBMwE5ATQBOQE6ATQBNAE6ATUBOgE7ATUBNQE7ATYBOwE8ATYBNwE9AXcAPQF4AHcAFgAVADgBFQA+ATgBOQE/AToBPwFAAToBOgFAATsBQAFBATsBOwFBATwBQQFCATwBPQFDAXgAQwF5AHgAFQAYAD4BGABEAT4BPwFFAUABRQFGAUABQAFGAUEBRgFHAUEBQQFHAUIBRwFIAUIBQwFJAXkASQF6AHkAGAAXAEQBFwBKAUQBRQFLAUYBSwFMAUYBRgFMAUcBTAFNAUcBRwFNAUgBTQFOAUgBSQFPAXoATwF7AHoAFwAaAEoBGgBQAUoBSwFRAUwBUQFSAUwBTAFSAU0BUgFTAU0BTQFTAU4BUwFUAU4BTwFVAXsAVQF8AHsAGgAZAFABGQBWAVABUQFXAVIBVwFYAVIBUgFYAVMBWAFZAVMBUwFZAVQBWQFaAVQBVQFbAXwAWwF9AHwAGQAcAFYBHABcAVYBVwFdAVgBXQFeAVgBWAFeAVkBXgFfAVkBWQFfAVoBXwFgAVoBWwFhAX0AYQF+AH0AHAAbAFwBGwBiAVwBXQFjAV4BYwFkAV4BXgFkAV8BZAFlAV8BXwFlAWABZQFmAWABYQFnAX4AZwF/AH4AGwAeAGIBHgBoAWIBYwFpAWQBaQFqAWQBZAFqAWUBagFrAWUBZQFrAWYBawFsAWYBZwFtAX8AbQGAAH8AHgAdAGgBHQBuAWgBaQFvAWoBbwFwAWoBagFwAWsBcAFxAWsBawFxAWwBcQFyAWwBbQFzAYAAcwGBAIAAHQAgAG4BIAB0AW4BbwF1AXABdQF2AXABcAF2AXEBdgF3AXEBcQF3AXIBdwF4AXIBcwF5AYEAeQGCAIEAIAAfAHQBHwB6AXQBdQF7AXYBewF8AXYBdgF8AXcBfAF9AXcBdwF9AXgBfQF+AXgBeQF/AYIAfwGDAIIAHwAiAHoBIgCAAXoBewGBAXwBgQGCAXwBfAGCAX0BggGDAX0BfQGDAX4BgwGEAX4BfwGFAYMAhQGEAIMAIgAhAIABIQCGAYABgQGHAYIBhwGIAYIBggGIAYMBiAGJAYMBgwGJAYQBiQGKAYQBhQGLAYQAiwGFAIQAIQAkAIYBJACMAYYBhwGNAYgBjQGOAYgBiAGOAYkBjgGPAYkBiQGPAYoBjwGQAYoBiwGRAYUAkQGGAIUAJAAjAIwBIwCSAYwBjQGTAY4BkwGUAY4BjgGUAY8BlAGVAY8BjwGVAZABlQGWAZABkQGXAYYAlwGHAIYAIwAmAJIBJgCYAZIBkwGZAZQBmQGaAZQBlAGaAZUBmgGbAZUBlQGbAZYBmwGcAZYBlwGdAYcAnQGIAIcAJgAlAJgBJQCeAZgBmQGfAZoBnwGgAZoBmgGgAZsBoAGhAZsBmwGhAZwBoQGiAZwBnQGjAYgAowGJAIgAJQAoAJ4BKACkAZ4BnwGlAaABpQGmAaABoAGmAaEBpgGnAaEBoQGnAaIBpwGoAaIBowGpAYkAqQGKAIkAKAAnAKQBJwCqAaQBpQGrAaYBqwGsAaYBpgGsAacBrAGtAacBpwGtAagBrQGuAagBqQGvAYoArwGLAIoAJwAqAKoBKgCwAaoBqwGxAawBsQGyAawBrAGyAa0BsgGzAa0BrQGzAa4BswG0Aa4BrwG1AYsAtQGMAIsAKgApALABKQC2AbABsQG3AbIBtwG4AbIBsgG4AbMBuAG5AbMBswG5AbQBuQG6AbQBtQG7AYwAuwGNAIwAKQAsALYBLAC8AbYBtwG9AbgBvQG+AbgBuAG+AbkBvgG/AbkBuQG/AboBvwHAAboBuwHBAY0AwQGOAI0ALAArALwBKwDCAbwBvQHDAb4BwwHEAb4BvgHEAb8BxAHFAb8BvwHFAcABxQHGAcABwQHHAY4AxwGPAI4AKwAuAMIBLgDIAcIBwwHJAcQByQHKAcQBxAHKAcUBygHLAcUBxQHLAcYBywHMAcYBxwHNAY8AzQGQAI8ALgAtAMgBLQDOAcgByQHPAcoBzwHQAcoBygHQAcsB0AHRAcsBywHRAcwB0QHSAcwBzQHTAZAA0wGRAJAALQAwAM4BMADUAc4BzwHVAdAB1QHWAdAB0AHWAdEB1gHXAdEB0QHXAdIB1wHYAdIB0wHZAZEA2QGSAJEAMAAvANQBLwDaAdQB1QHbAdYB2wHcAdYB1gHcAdcB3AHdAdcB1wHdAdgB3QHeAdgB2QHfAZIA3wGTAJIALwAyANoBMgDgAdoB2wHhAdwB4QHiAdwB3AHiAd0B4gHjAd0B3QHjAd4B4wHkAd4B3wHlAZMA5QGUAJMAMgAxAOABMQDmAeAB4QHnAeIB5wHoAeIB4gHoAeMB6AHpAeMB4wHpAeQB6QHqAeQB5QHrAZQA6wGVAJQAMQA0AOYBNADsAeYB5wHtAegB7QHuAegB6AHuAekB7gHvAekB6QHvAeoB7wHwAeoB6wHxAZUA8QGWAJUANAAzAOwBMwDyAewB7QHzAe4B8wH0Ae4B7gH0Ae8B9AH1Ae8B7wH1AfAB9QH2AfAB8QH3AZYA9wGXAJYAMwA2APIBNgD4AfIB8wH5AfQB+QH6AfQB9AH6AfUB+gH7AfUB9QH7AfYB+wH8AfYB9wH9AZcA/QGYAJcANgA1APgBNQD+AfgB+QH/AfoB/wEAAvoB+gEAAvsBAAIBAvsB+wEBAvwBAQICAvwB/QEDApgAAwKZAJgANQA4AP4BOAAEAv4B/wEFAgACBQIGAgACAAIGAgECBgIHAgECAQIHAgICBwIIAgICAwIJApkACQKaAJkAOAA3AAQCNwAKAgQCBQILAgYCCwIMAgYCBgIMAgcCDAINAgcCBwINAggCDQIOAggCCQIPApoADwKbAJoANwBOAAoCTgAQAgoCCwIRAgwCEQISAgwCDAISAg0CEgITAg0CDQITAg4CEwIUAg4CDwIVApsAFQKxAJsATgBQABACUAAWAhACEQIXAhICFwIYAhICEgIYAhMCGAIZAhMCEwIZAhQCGQIaAhQCFQIbArEAGwKzALEAUAA7ABYCOwAcAhYCFwIdAhgCHQIeAhgCGAIeAhkCHgIfAhkCGQIfAhoCHwIgAhoCGwIhArMAIQKcALMAOwA6ABwCOgAiAhwCHQIjAh4CIwIkAh4CHgIkAh8CJAIlAh8CHwIlAiACJQImAiACIQInApwAJwKdAJwAOgA5ACICOQAoAiICIwIpAiQCKQIqAiQCJAIqAiUCKgIrAiUCJQIrAiYCKwIsAiYCJwItAp0ALQKeAJ0AOQA9ACgCPQAuAigCKQIvAioCLwIwAioCKgIwAisCMAIxAisCKwIxAiwCMQIyAiwCLQIzAp4AMwKfAJ4APQA8AC4CPAA0Ai4CLwI1AjACNQI2AjACMAI2AjECNgI3AjECMQI3AjICNwI4AjICMwI5Ap8AOQKgAJ8APABAADQCQAA6AjQCNQI7AjYCOwI8AjYCNgI8AjcCPAI9AjcCNwI9AjgCPQI+AjgCOQI/AqAAPwKhAKAAQAA/ADoCPwBAAjoCOwJBAjwCQQJCAjwCPAJCAj0CQgJDAj0CPQJDAj4CQwJEAj4CPwJFAqEARQKiAKEAPwA+AEACPgBGAkACQQJHAkICRwJIAkICQgJIAkMCSAJJAkMCQwJJAkQCSQJKAkQCRQJLAqIASwKjAKIAPgBDAEYCQwBMAkYCRwJNAkgCTQJOAkgCSAJOAkkCTgJPAkkCSQJPAkoCTwJQAkoCSwJRAqMAUQKkAKMAQwBCAEwCQgBSAkwCTQJTAk4CUwJUAk4CTgJUAk8CVAJVAk8CTwJVAlACVQJWAlACUQJXAqQAVwKlAKQAQgBBAFICQQBYAlICUwJZAlQCWQJaAlQCVAJaAlUCWgJbAlUCVQJbAlYCWwJcAlYCVwJdAqUAXQKmAKUAQQBFAFgCRQBeAlgCWQJfAloCXwJgAloCWgJgAlsCYAJhAlsCWwJhAlwCYQJiAlwCXQJjAqYAYwKnAKYARQBEAF4CRABkAl4CXwJlAmACZQJmAmACYAJmAmECZgJnAmECYQJnAmICZwJoAmICYwJpAqcAaQKoAKcARABIAGQCSABqAmQCZQJrAmYCawJsAmYCZgJsAmcCbAJtAmcCZwJtAmgCbQJuAmgCaQJvAqgAbwKpAKgASABHAGoCRwBwAmoCawJxAmwCcQJyAmwCbAJyAm0CcgJzAm0CbQJzAm4CcwJ0Am4CbwJ1AqkAdQKqAKkARwBGAHACRgB2AnACcQJ3AnICdwJ4AnICcgJ4AnMCeAJ5AnMCcwJ5AnQCeQJ6AnQCdQJ7AqoAewKrAKoARgBKAHYCSgB8AnYCdwJ9AngCfQJ+AngCeAJ/AnkCfwKAAnkCeQKBAnoCgQKCAnoCewKDAqsAgwKsAKsASgBJAHwCSQCEAnwCfQKFAoYChQKHAoYCiAKHAokChwKKAokCiwKKAoICigKMAoICgwKNAqwAjQKtAKwASQBMAIQCTACOAoQCjwKQApECkAKSApECkQKSApMCkgKUApMCkwKUApUClAKWApUCjQKXAq0AlwKuAK0ATABLAI4CSwCYAo4CkAKZApICmQKaApICkgKaApQCmgKbApQClAKbApYCmwKcApYClwKdAq4AnQKvAK4ASwBUAJgCVACeApgCmQKfApoCnwKgApoCmgKgApsCoAKhApsCmwKhApwCoQKiApwCnQKjAq8AowK3AK8AVABXAJ4CVwCkAp4CnwKlAqACpQKmAqACoAKmAqECpgKnAqECoQKnAqICpwKoAqICowKpArcAqQK6ALcAVwBZAKQCWQCqAqQCpQKrAqYCqwKsAqYCpgKsAqcCrAKtAqcCpwKtAqgCrQKuAqgCqQKvAroArwK8ALoAWQBbAKoCWwCwAqoCqwKxAqwCsQKyAqwCrAKyAq0CsgKzAq0CrQKzAq4CswK0Aq4CrwK1ArwAtQK+ALwAWwBdALACXQC2ArACsQK3ArICtwK4ArICsgK4ArMCuAK5ArMCswK5ArQCuQK6ArQCtQK7Ar4AuwLAAL4AXQBfALYCXwC8ArYCtwK9ArgCvQK+ArgCuAK+ArkCvgK/ArkCuQK/AroCvwLAAroCuwLBAsAAwQLCAMAAXwBhALwCYQDCArwCvQLDAr4CwwLEAr4CvgLEAr8CxALFAr8CvwLFAsACxQLGAsACwQLHAsIAxwLEAMIAYQBiAMICYgDIAsICwwLJAsQCyQLKAsQCxALKAsUCygLLAsUCxQLLAsYCywLMAsYCxwLNAsQAzQLFAMQAYgBgAMgCYADOAsgCyQLPAsoCzwLQAsoCygLQAssC0ALRAssCywLRAswC0QLSAswCzQLTAsUA0wLDAMUAYABeAM4CXgDUAs4CzwLVAtAC1QLWAtAC0ALWAtEC1gLXAtEC0QLXAtIC1wLYAtIC0wLZAsMA2QLBAMMAXgBcANQCXADaAtQC1QLbAtYC2wLcAtYC1gLcAtcC3ALdAtcC1wLdAtgC3QLeAtgC2QLfAsEA3wK/AMEAXABaANoCWgDgAtoC2wLhAtwC4QLiAtwC3ALiAt0C4gLjAt0C3QLjAt4C4wLkAt4C3wLlAr8A5QK9AL8AWgBYAOACWADmAuAC4QLnAuIC5wLoAuIC4gLoAuMC6ALpAuMC4wLpAuQC6QLqAuQC5QLrAr0A6wK7AL0AWABWAOYCVgDsAuYC5wLtAugC7QLuAugC6ALuAukC7gLvAukC6QLvAuoC7wLwAuoC6wLxArsA8QK5ALsAVgBVAOwCVQDyAuwC7QLzAu4C8wL0Au4C7gL0Au8C9AL1Au8C7wL1AvAC9QL2AvAC8QL3ArkA9wK4ALkAVQBTAPICUwD4AvIC8wL5AvQC+QL6AvQC9AL6AvUC+gL7AvUC9QL7AvYC+wL8AvYC9wL9ArgA/QK2ALgAUwBSAPgCUgD+AvgC+QL/AvoC/wIAA/oC+gIAA/sCAAMBA/sC+wIBA/wCAQMCA/wC/QIDA7YAAwO1ALYAUgBRAP4CUQAEA/4C/wIFAwADBQMGAwADAAMGAwEDBgMHAwEDAQMHAwIDBwMIAwIDAwMJA7UACQO0ALUAUQBPAAQDTwAKAwQDBQMLAwYDCwMMAwYDBgMMAwcDDAMNAwcDBwMNAwgDDQMOAwgDCQMPA7QADwOyALQATwBNAAoDTQAQAwoDCwMRAwwDEQMSAwwDDAMSAw0DEgMTAw0DDQMTAw4DEwMUAw4DDwMVA7IAFQOwALIATQACABADAgAWAxADEQMXAxIDFwMYAxIDEgMYAxMDGAMZAxMDEwMZAxQDGQMaAxQDFQMbA7AAGwNjALAAAgABABYDAQAcAxYDFwMdAxgDHQMeAxgDGAMeAxkDHgMfAxkDGQMfAxoDHwMgAxoDGwMhA2MAIQNkAGMAAQAAABwDAADGABwDHQPIAB4DyADKAB4DHgPKAB8DygDMAB8DHwPMACADzADOACADIQPQAGQA0ABlAGQA",Fh="IgMjAyQDJQMmAyIDJwMoAyUDKQMqAycDKwMsAykDLQMuAysDLwMwAy0DMQMyAy8DMwM0AzEDNQM2AzMDNwM4AzUDOQM6AzsDPAM9AzkDPgM/A0ADQQNCAz4DQwNEA0UDRgNHA0MDSANJA0oDSwNMA00DTgNPA0sDUANRA1IDUwNUA1ADVQNWA1MDVwNYA1kDWgNbA1wDXQNeA18DYANhA10DYgNjA2QDZQNmA2cDaANpA2UDagNrA2gDbANtA2oDbgNvA2wDcANxA24DcgNzA3ADdAN1A3IDdgN3A3QDeAN5A3YDegN7A3gDfAN9A3oDfgN/A3wDgAOBA34DggODA4ADhAOFA4IDhgOHA4QDiAOJA4oDiwOMA4gDjQOOA48DkAORA40DkgOTA5QDlQOWA5cDmAOZA5oDmwOcA50DngOfA5sDoAOhA6IDowOkA6UDpgOnA6gDqQOqA6YDqwOsA6kDrQOuA68DsAOxA60DsgOzA7QDtQO2A7IDtwO4A7kDugO7A7wDvQO+A7oDvwPAA70DwQPCA8MDxAPFA8EDxgPHA8QDyAPJA8YDIgMkA8oDJwMlAyIDKwMpAycDLwMtAysDMwMxAy8DNwM1AzMDPAM5AzsDQQM+A0ADQwNFA8sDzANIA0oDSwNNA8wDUANSA80DVQNTA1ADzgNXA1kDYANdA18DYgNkA88DaANlA2cDbANqA2gDcANuA2wDdANyA3ADeAN2A3QDfAN6A3gDgAN+A3wDhAOCA4ADiwOIA4oDkAONA48D0AOSA5QD0QOVA5cDmAOaA9EDngObA50D0gOgA6ID0wOjA6UDqQOmA6gDrwOrA6kDtAOwA60DtQOyA7QDtwO5A9QDugO8A9UDvwO9A7oDxAPBA8MDyAPGA8QDIgPKA9YDKwMnAyIDMwMvAysD1wM3AzMDPAM7A9cDQQNAA9gDRgNDA8sDSwPMA0oDVQNQA80DzgNZA9kDYANfA1oDZwNiA88DbANoA2cDdANwA2wDfAN4A3QDhAOAA3wD2gOLA4oD2wOQA48D0AOUA9sDmAPRA5cDogOeA50D0wOlA9wDrwOpA6gDtQO0A60D1QO3A9QDvwO6A9UDxAPDA90D3gPIA8QDIgPWA98DMwMrAyID4AM8A9cDRgPLA+EDTgNLA0oDVQPNA+IDXAPOA9kDzwNgA1oDbANnA88DfAN0A2wDhgOEA3wDjwPaA4oD0APbA48DnQOYA5cD0wPcA9IDrQOvA6gD3QO/A9UD3gPEA90DIgPfA+MD1wMzAyID2APgA9cD5ANGA+EDTgNKA+UDVQPiA+YDWgNcA9kDbAPPA1oDhgN8A2wDlwPQA48D0wPSA6IDtQOtA6gD3QPVA9QD5wPeA90DIgPjA+gD2APXAyID5APhA+kDTgPlA+oDVQPmA+sDbANaA9kDigOGA2wDnQOXA48D0wOiA50D1AO1A6gD5wPdA9QDIgPoA+wDQQPYAyID6gPkA+kD7QNOA+oDVQPrA+4DbAPZA1UDjwOKA2wD0wOdA48D5wPUA6gDIgPsA+8D6QNBAyID7QPqA+kDVQPuA/ADjwNsA1UDqAPTA48D8QPnA6gDIgPvA/ID7QPpAyIDVQPwA/MD8QOoA48DIgPyA/QD9QPtAyIDjwNVA/MD9gPxA48DIgP0A/cDjwPzA/gD+QP2A48DIgP3A/oDjwP4A/sD/AP5A48DIgP6A/0DjwP7A/4D/QP8A48D9QMiA/0DjwP+A/8D9QP9A48DjwP/AwAEAQT1A48DjwMABAIEAwQBBI8DjwMCBAMEBAQFBAYEBgQHBAgECAQJBAoECgQLBAwEDAQNBA4EDgQPBBAEEAQRBBIEEgQTBBQEFAQVBBYEFgQXBBgEGAQZBBoEGwQcBB0EHQQeBB8EIAQhBCIEIgQjBCQEJQQmBCcEJwQoBCkEKgQrBCwELQQuBC8ELwQwBDEEMgQzBDQENAQ1BDYENgQ3BDgEOQQ6BDsEPAQ9BD4EPwRABEEEQQRCBEMERARFBEYERwRIBEkESQRKBEsESwRMBE0ETQROBE8ETwRQBFEEUQRSBFMEUwRUBFUEVQRWBFcEVwRYBFkEWQRaBFsEWwRcBF0EXQReBF8EXwRgBGEEYQRiBGMEYwRkBGUEZQRmBGcEZwRoBGkEagRrBGwEbARtBG4EbwRwBHEEcQRyBHMEdAR1BHYEdwR4BHkEegR7BHwEfQR+BH8EfwSABIEEggSDBIQEhQSGBIcEiASJBIoEigSLBIwEjASNBI4EjwSQBJEEkQSSBJMElASVBJYElgSXBJgEmQSaBJsEnASdBJ4EngSfBKAEoAShBKIEowSkBKUEpQSmBKcEpwSoBKkEqQSqBKsErAQEBAYEBgQIBAoECgQMBA4EDgQQBBIEEgQUBBYEFgQYBBoEGwQdBB8EIAQiBCQErQQlBCcEKgQsBK4ErgQtBC8ErwQyBDQENAQ2BDgEOQQ7BLAEPwRBBEMEsQREBEYERwRJBEsESwRNBE8ETwRRBFMEUwRVBFcEVwRZBFsEWwRdBF8EXwRhBGMEYwRlBGcEagRsBG4EbwRxBHMEdAR2BLIEdwR5BLMEswR6BHwEfQR/BIEEggSEBLQEhQSHBLUEiASKBIwEjASOBI8EkQSTBJQElASWBJgEtgSZBJsEtwScBJ4EngSgBKIEowSlBKcEpwSpBKsEuASsBAYEBgQKBA4EDgQSBBYEFgQaBLkEuQQbBB8EugQgBCQErQQnBCkEKgSuBC8ErwQ0BDgEuwQ5BLAEPgQ/BEMEsQRGBEcERwRLBE8ETwRTBFcEVwRbBF8EXwRjBGcEagRuBLwEbwRzBL0EvQR0BLIEdwSzBHwEfQSBBIIEvgSFBLUEiASMBI8EkQSUBJgEtgSbBLcEtwSeBKIEvwSjBKcEpwSrBMAEwQS4BAYEBgQOBBYEuQQfBMIEwwStBCkEKgQvBDEExASvBDgEuwSwBDwEPgRDBLEEsQRHBE8ETwRXBF8EXwRnBGkEagS8BG8EbwS9BLIEdwR8BH0EtAS+BLUEiASPBJEEtwSiBL8EvwSnBMAExQTBBAYEBgQWBLkEuQTCBLoEwwQpBMYExwQqBDEEyATEBDgEuwQ8BD4EPgSxBE8ETwRfBGkEbwSyBHcEggS0BLUEiASRBJgEtgS3BL8EvwTABMkEygTFBAYEBgS5BLoEywTDBMYEzATHBDEEzQTIBDgEuwQ+BE8ETwRpBGoEbwR3BH0EfQSCBLUEiASYBLYEtgS/BMkEzgTKBAYEBgS6BCQEywTGBMwEzAQxBM8E0ATNBDgEOAS7BE8ETwRqBG8EbwR9BLUEiAS2BMkE0QTOBAYEBgQkBMsEywTMBM8E0gTQBDgEOARPBG8EbwS1BIgEiATJBNME1ATRBAYEBgTLBM8E1QTSBDgEbwSIBNME1gTUBAYEBgTPBNcE1QQ4BG8EbwTTBNgE2QTWBAYE2gTVBG8EbwTYBNsE3ATZBAYE3QTaBG8EbwTbBN4E3wTcBAYE4ATdBG8EbwTeBN8E3wQGBNcE4QTgBG8EbwTfBNcE4gThBG8EbwTXBOME5ATiBG8EbwTjBOUE5QTkBG8EIgMmA+YEJgPnBOYE6ATpBOoE6QTrBOoE6gTrBOwE6wTtBOwE7ATtBO4E7QTvBO4E8ATxBAYE8QQHBAYEJgMlA+cEJQPyBOcE6QTzBOsE8wT0BOsE6wT0BO0E9AT1BO0E7QT1BO8E9QT2BO8E8QT3BAcE9wQIBAcEJQMoA/IEKAP4BPIE8wT5BPQE+QT6BPQE9AT6BPUE+gT7BPUE9QT7BPYE+wT8BPYE9wT9BAgE/QQJBAgEKAMnA/gEJwP+BPgE+QT/BPoE/wQABfoE+gQABfsEAAUBBfsE+wQBBfwEAQUCBfwE/QQDBQkEAwUKBAkEJwMqA/4EKgMEBf4E/wQFBQAFBQUGBQAFAAUGBQEFBgUHBQEFAQUHBQIFBwUIBQIFAwUJBQoECQULBAoEKgMpAwQFKQMKBQQFBQULBQYFCwUMBQYFBgUMBQcFDAUNBQcFBwUNBQgFDQUOBQgFCQUPBQsEDwUMBAsEKQMsAwoFLAMQBQoFCwURBQwFEQUSBQwFDAUSBQ0FEgUTBQ0FDQUTBQ4FEwUUBQ4FDwUVBQwEFQUNBAwELAMrAxAFKwMWBRAFEQUXBRIFFwUYBRIFEgUYBRMFGAUZBRMFEwUZBRQFGQUaBRQFFQUbBQ0EGwUOBA0EKwMuAxYFLgMcBRYFFwUdBRgFHQUeBRgFGAUeBRkFHgUfBRkFGQUfBRoFHwUgBRoFGwUhBQ4EIQUPBA4ELgMtAxwFLQMiBRwFHQUjBR4FIwUkBR4FHgUkBR8FJAUlBR8FHwUlBSAFJQUmBSAFIQUnBQ8EJwUQBA8ELQMwAyIFMAMoBSIFIwUpBSQFKQUqBSQFJAUqBSUFKgUrBSUFJQUrBSYFKwUsBSYFJwUtBRAELQURBBAEMAMvAygFLwMuBSgFKQUvBSoFLwUwBSoFKgUwBSsFMAUxBSsFKwUxBSwFMQUyBSwFLQUzBREEMwUSBBEELwMyAy4FMgM0BS4FLwU1BTAFNQU2BTAFMAU2BTEFNgU3BTEFMQU3BTIFNwU4BTIFMwU5BRIEOQUTBBIEMgMxAzQFMQM6BTQFNQU7BTYFOwU8BTYFNgU8BTcFPAU9BTcFNwU9BTgFPQU+BTgFOQU/BRMEPwUUBBMEMQM0AzoFNANABToFOwVBBTwFQQVCBTwFPAVCBT0FQgVDBT0FPQVDBT4FQwVEBT4FPwVFBRQERQUVBBQENAMzA0AFMwNGBUAFQQVHBUIFRwVIBUIFQgVIBUMFSAVJBUMFQwVJBUQFSQVKBUQFRQVLBRUESwUWBBUEMwM2A0YFNgNMBUYFRwVNBUgFTQVOBUgFSAVOBUkFTgVPBUkFSQVPBUoFTwVQBUoFSwVRBRYEUQUXBBYENgM1A0wFNQNSBUwFTQVTBU4FUwVUBU4FTgVUBU8FVAVVBU8FTwVVBVAFVQVWBVAFUQVXBRcEVwUYBBcENQM4A1IFOANYBVIFUwVZBVQFWQVaBVQFVAVaBVUFWgVbBVUFVQVbBVYFWwVcBVYFVwVdBRgEXQUZBBgEOAM3A1gFNwNeBVgFWQVfBVoFXwVgBVoFWgVgBVsFYAVhBVsFWwVhBVwFYQViBVwFXQVjBRkEYwUaBBkENwPXA14F1wNkBV4FXwVlBWAFZQVmBWAFYAVmBWEFZgVnBWEFYQVnBWIFZwVoBWIFYwVpBRoEaQW5BBoE1wM7A2QFOwNqBWQFZQVrBWYFawVsBWYFZgVsBWcFbAVtBWcFZwVtBWgFbQVuBWgFaQVvBbkEbwUbBLkEOwM6A2oFOgNwBWoFawVxBWwFcQVyBWwFbAVyBW0FcgVzBW0FbQVzBW4FcwV0BW4FbwV1BRsEdQUcBBsEOgM5A3AFOQN2BXAFcQV3BXIFdwV4BXIFcgV4BXMFeAV5BXMFcwV5BXQFeQV6BXQFdQV7BRwEewUdBBwEOQM9A3YFPQN8BXYFdwV9BXgFfQV+BXgFeAV+BXkFfgV/BXkFeQV/BXoFfwWABXoFewWBBR0EgQUeBB0EPQM8A3wFPAOCBXwFfQWDBX4FgwWEBX4FfgWEBX8FhAWFBX8FfwWFBYAFhQWGBYAFgQWHBR4EhwUfBB4EPAPgA4IF4AOIBYIFgwWJBYQFiQWKBYQFhAWKBYUFigWLBYUFhQWLBYYFiwWMBYYFhwWNBR8EjQXCBB8E4APYA4gF2AOOBYgFiQWPBYoFjwWQBYoFigWQBYsFkAWRBYsFiwWRBYwFkQWSBYwFjQWTBcIEkwW6BMIE2ANAA44FQAOUBY4FjwWVBZAFlQWWBZAFkAWWBZEFlgWXBZEFkQWXBZIFlwWYBZIFkwWZBboEmQUgBLoEQAM/A5QFPwOaBZQFlQWbBZYFmwWcBZYFlgWcBZcFnAWdBZcFlwWdBZgFnQWeBZgFmQWfBSAEnwUhBCAEPwM+A5oFPgOgBZoFmwWhBZwFoQWiBZwFnAWiBZ0FogWjBZ0FnQWjBZ4FowWkBZ4FnwWlBSEEpQUiBCEEPgNCA6AFQgOmBaAFoQWnBaIFpwWoBaIFogWoBaMFqAWpBaMFowWpBaQFqQWqBaQFpQWrBSIEqwUjBCIEQgNBA6YFQQOsBaYFpwWtBagFrQWuBagFqAWuBakFrgWvBakFqQWvBaoFrwWwBaoFqwWxBSMEsQUkBCMEQQPpA6wF6QOyBawFrQWzBa4FswW0Ba4FrgW0Ba8FtAW1Ba8FrwW1BbAFtQW2BbAFsQW3BSQEtwXLBCQE6QPhA7IF4QO4BbIFswW5BbQFuQW6BbQFtAW6BbUFugW7BbUFtQW7BbYFuwW8BbYFtwW9BcsEvQXDBMsE4QPLA7gFywO+BbgFuQW/BboFvwXABboFugXABbsFwAXBBbsFuwXBBbwFwQXCBbwFvQXDBcMEwwWtBMMEywNFA74FRQPEBb4FvwXFBcAFxQXGBcAFwAXGBcEFxgXHBcEFwQXHBcIFxwXIBcIFwwXJBa0EyQUlBK0ERQNEA8QFRAPKBcQFxQXLBcYFywXMBcYFxgXMBccFzAXNBccFxwXNBcgFzQXOBcgFyQXPBSUEzwUmBCUERANDA8oFQwPQBcoFywXRBcwF0QXSBcwFzAXSBc0F0gXTBc0FzQXTBc4F0wXUBc4FzwXVBSYE1QUnBCYEQwNHA9AFRwPWBdAF0QXXBdIF1wXYBdIF0gXYBdMF2AXZBdMF0wXZBdQF2QXaBdQF1QXbBScE2wUoBCcERwNGA9YFRgPcBdYF1wXdBdgF3QXeBdgF2AXeBdkF3gXfBdkF2QXfBdoF3wXgBdoF2wXhBSgE4QUpBCgERgPkA9wF5APiBdwF3QXjBd4F4wXkBd4F3gXkBd8F5AXlBd8F3wXlBeAF5QXmBeAF4QXnBSkE5wXGBCkE5APqA+IF6gPoBeIF4wXpBeQF6QXqBeQF5AXqBeUF6gXrBeUF5QXrBeYF6wXsBeYF5wXtBcYE7QXMBMYE6gPlA+gF5QPuBegF6QXvBeoF7wXwBeoF6gXwBesF8AXxBesF6wXxBewF8QXyBewF7QXzBcwE8wXHBMwE5QNKA+4FSgP0Be4F7wX1BfAF9QX2BfAF8AX2BfEF9gX3BfEF8QX3BfIF9wX4BfIF8wX5BccE+QUqBMcESgNJA/QFSQP6BfQF9QX7BfYF+wX8BfYF9gX8BfcF/AX9BfcF9wX9BfgF/QX+BfgF+QX/BSoE/wUrBCoESQNIA/oFSAMABvoF+wUBBvwFAQYCBvwF/AUCBv0FAgYDBv0F/QUDBv4FAwYEBv4F/wUFBisEBQYsBCsESAPMAwAGzAMGBgAGAQYHBgIGBwYIBgIGAgYIBgMGCAYJBgMGAwYJBgQGCQYKBgQGBQYLBiwECwauBCwEzANNAwYGTQMMBgYGBwYNBggGDQYOBggGCAYOBgkGDgYPBgkGCQYPBgoGDwYQBgoGCwYRBq4EEQYtBK4ETQNMAwwGTAMSBgwGDQYTBg4GEwYUBg4GDgYUBg8GFAYVBg8GDwYVBhAGFQYWBhAGEQYXBi0EFwYuBC0ETANLAxIGSwMYBhIGEwYZBhQGGQYaBhQGFAYaBhUGGgYbBhUGFQYbBhYGGwYcBhYGFwYdBi4EHQYvBC4ESwNPAxgGTwMeBhgGGQYfBhoGHwYgBhoGGgYgBhsGIAYhBhsGGwYhBhwGIQYiBhwGHQYjBi8EIwYwBC8ETwNOAx4GTgMkBh4GHwYlBiAGJQYmBiAGIAYmBiEGJgYnBiEGIQYnBiIGJwYoBiIGIwYpBjAEKQYxBDAETgPtAyQG7QMqBiQGJQYrBiYGKwYsBiYGJgYsBicGLAYtBicGJwYtBigGLQYuBigGKQYvBjEELwbPBDEE7QP1AyoG9QMwBioGKwYxBiwGMQYyBiwGLAYyBi0GMgYzBi0GLQYzBi4GMwY0Bi4GLwY1Bs8ENQbXBM8E9QMBBDAGAQQ2BjAGMQY3BjIGNwY4BjIGMgY4BjMGOAY5BjMGMwY5BjQGOQY6BjQGNQY7BtcEOwbjBNcEAQQDBDYGAwQ8BjYGNwY9BjgGPQY+BjgGOAY+BjkGPgY/BjkGOQY/BjoGPwZABjoGOwZBBuMEQQblBOMEAwQCBDwGAgRCBjwGPQZDBj4GQwZEBj4GPgZEBj8GRAZFBj8GPwZFBkAGRQZGBkAGQQZHBuUERwbkBOUEAgQABEIGAARIBkIGQwZJBkQGSQZKBkQGRAZKBkUGSgZLBkUGRQZLBkYGSwZMBkYGRwZNBuQETQbiBOQEAAT/A0gG/wNOBkgGSQZPBkoGTwZQBkoGSgZQBksGUAZRBksGSwZRBkwGUQZSBkwGTQZTBuIEUwbhBOIE/wP+A04G/gNUBk4GTwZVBlAGVQZWBlAGUAZWBlEGVgZXBlEGUQZXBlIGVwZYBlIGUwZZBuEEWQbgBOEE/gP7A1QG+wNaBlQGVQZbBlYGWwZcBlYGVgZcBlcGXAZdBlcGVwZdBlgGXQZeBlgGWQZfBuAEXwbdBOAE+wP4A1oG+ANgBloGWwZhBlwGYQZiBlwGXAZiBl0GYgZjBl0GXQZjBl4GYwZkBl4GXwZlBt0EZQbaBN0E+APzA2AG8wNmBmAGYQZnBmIGZwZoBmIGYgZoBmMGaAZpBmMGYwZpBmQGaQZqBmQGZQZrBtoEawbVBNoE8wPwA2YG8ANsBmYGZwZtBmgGbQZuBmgGaAZuBmkGbgZvBmkGaQZvBmoGbwZwBmoGawZxBtUEcQbSBNUE8APuA2wG7gNyBmwGbQZzBm4GcwZ0Bm4GbgZ0Bm8GdAZ1Bm8GbwZ1BnAGdQZ2BnAGcQZ3BtIEdwbQBNIE7gPrA3IG6wN4BnIGcwZ5BnQGeQZ6BnQGdAZ6BnUGegZ7BnUGdQZ7BnYGewZ8BnYGdwZ9BtAEfQbNBNAE6wPmA3gG5gN+BngGeQZ/BnoGfwaABnoGegaABnsGgAaBBnsGewaBBnwGgQaCBnwGfQaDBs0EgwbIBM0E5gPiA34G4gOEBn4GfwaFBoAGhQaGBoAGgAaGBoEGhgaHBoEGgQaHBoIGhwaIBoIGgwaJBsgEiQbEBMgE4gPNA4QGzQOKBoQGhQaLBoYGiwaMBoYGhgaMBocGjAaNBocGhwaNBogGjQaOBogGiQaPBsQEjwavBMQEzQNSA4oGUgOQBooGiwaRBowGkQaSBowGjAaSBo0GkgaTBo0GjQaTBo4GkwaUBo4GjwaVBq8ElQYyBK8EUgNRA5AGUQOWBpAGkQaXBpIGlwaYBpIGkgaYBpMGmAaZBpMGkwaZBpQGmQaaBpQGlQabBjIEmwYzBDIEUQNQA5YGUAOcBpYGlwadBpgGnQaeBpgGmAafBpkGnwagBpkGmQahBpoGoQaiBpoGmwajBjMEowY0BDMEUANUA5wGVAOkBpwGnQalBqYGpQanBqYGqAanBqkGpwaqBqkGqwaqBqIGqgasBqIGowatBjQErQY1BDQEVANTA6QGUwOuBqQGrwawBrEGsAayBrEGsQazBrQGswa1BrQGtAa2BrcGtga4BrcGrQa5BjUEuQY2BDUEUwNWA64GVgO6Bq4GsAa7BrwGuwa9BrwGvga9Br8GvQbABr8GwQbABrgGwAbCBrgGuQbDBjYEwwY3BDYEVgNVA7oGVQPEBroGuwbFBr0GxQbGBr0GvQbGBsAGxgbHBsAGwAbHBsIGxwbIBsIGwwbJBjcEyQY4BDcEVQPZA8QG2QPKBsQGxQbLBsYGywbMBsYGxgbMBscGzAbNBscGxwbNBsgGzQbOBsgGyQbPBjgEzwa7BDgE2QNZA8oGWQPQBsoGywbRBswG0QbSBswGzAbSBs0G0gbTBs0GzQbTBs4G0wbUBs4GzwbVBrsE1QY5BLsEWQNYA9AGWAPWBtAG0QbXBtIG1wbYBtIG0gbYBtMG2AbZBtMG0wbZBtQG2QbaBtQG1QbbBjkE2wY6BDkEWANXA9YGVwPcBtYG1wbdBtgG3QbeBtgG2AbeBtkG3gbfBtkG2QbfBtoG3wbgBtoG2wbhBjoE4QY7BDoEVwPOA9wGzgPiBtwG3QbjBt4G4wbkBt4G3gbkBt8G5AblBt8G3wblBuAG5QbmBuAG4QbnBjsE5wawBDsEzgNcA+IGXAPoBuIG4wbpBuQG6QbqBuQG5AbqBuUG6gbrBuUG5QbrBuYG6wbsBuYG5wbtBrAE7QY8BLAEXANbA+gGWwPuBugG6QbvBuoG7wbwBuoG6gbwBusG8AbxBusG6wbxBuwG8QbyBuwG7QbzBjwE8wY9BDwEWwNaA+4GWgP0Bu4G7wb1BvAG9Qb2BvAG8Ab2BvEG9gb3BvEG8Qb3BvIG9wb4BvIG8wb5Bj0E+QY+BD0EWgNfA/QGXwP6BvQG9Qb7BvYG+wb8BvYG9gb8BvcG/Ab9BvcG9wb9BvgG/Qb+BvgG+Qb/Bj4E/wY/BD4EXwNeA/oGXgMAB/oG+wYBB/wGAQcCB/wG/AYCB/0GAgcDB/0G/QYDB/4GAwcEB/4G/wYFBz8EBQdABD8EXgNdAwAHXQMGBwAHAQcHBwIHBwcIBwIHAgcIBwMHCAcJBwMHAwcJBwQHCQcKBwQHBQcLB0AECwdBBEAEXQNhAwYHYQMMBwYHBwcNBwgHDQcOBwgHCAcOBwkHDgcPBwkHCQcPBwoHDwcQBwoHCwcRB0EEEQdCBEEEYQNgAwwHYAMSBwwHDQcTBw4HEwcUBw4HDgcUBw8HFAcVBw8HDwcVBxAHFQcWBxAHEQcXB0IEFwdDBEIEYAPPAxIHzwMYBxIHEwcZBxQHGQcaBxQHFAcaBxUHGgcbBxUHFQcbBxYHGwccBxYHFwcdB0MEHQexBEMEzwNkAxgHZAMeBxgHGQcfBxoHHwcgBxoHGgcgBxsHIAchBxsHGwchBxwHIQciBxwHHQcjB7EEIwdEBLEEZANjAx4HYwMkBx4HHwclByAHJQcmByAHIAcmByEHJgcnByEHIQcnByIHJwcoByIHIwcpB0QEKQdFBEQEYwNiAyQHYgMqByQHJQcrByYHKwcsByYHJgcsBycHLActBycHJwctBygHLQcuBygHKQcvB0UELwdGBEUEYgNnAyoHZwMwByoHKwcxBywHMQcyBywHLAcyBy0HMgczBy0HLQczBy4HMwc0By4HLwc1B0YENQdHBEYEZwNmAzAHZgM2BzAHMQc3BzIHNwc4BzIHMgc4BzMHOAc5BzMHMwc5BzQHOQc6BzQHNQc7B0cEOwdIBEcEZgNlAzYHZQM8BzYHNwc9BzgHPQc+BzgHOAc+BzkHPgc/BzkHOQc/BzoHPwdABzoHOwdBB0gEQQdJBEgEZQNpAzwHaQNCBzwHPQdDBz4HQwdEBz4HPgdEBz8HRAdFBz8HPwdFB0AHRQdGB0AHQQdHB0kERwdKBEkEaQNoA0IHaANIB0IHQwdJB0QHSQdKB0QHRAdKB0UHSgdLB0UHRQdLB0YHSwdMB0YHRwdNB0oETQdLBEoEaANrA0gHawNOB0gHSQdPB0oHTwdQB0oHSgdQB0sHUAdRB0sHSwdRB0wHUQdSB0wHTQdTB0sEUwdMBEsEawNqA04HagNUB04HTwdVB1AHVQdWB1AHUAdWB1EHVgdXB1EHUQdXB1IHVwdYB1IHUwdZB0wEWQdNBEwEagNtA1QHbQNaB1QHVQdbB1YHWwdcB1YHVgdcB1cHXAddB1cHVwddB1gHXQdeB1gHWQdfB00EXwdOBE0EbQNsA1oHbANgB1oHWwdhB1wHYQdiB1wHXAdiB10HYgdjB10HXQdjB14HYwdkB14HXwdlB04EZQdPBE4EbANvA2AHbwNmB2AHYQdnB2IHZwdoB2IHYgdoB2MHaAdpB2MHYwdpB2QHaQdqB2QHZQdrB08EawdQBE8EbwNuA2YHbgNsB2YHZwdtB2gHbQduB2gHaAduB2kHbgdvB2kHaQdvB2oHbwdwB2oHawdxB1AEcQdRBFAEbgNxA2wHcQNyB2wHbQdzB24Hcwd0B24Hbgd0B28HdAd1B28Hbwd1B3AHdQd2B3AHcQd3B1EEdwdSBFEEcQNwA3IHcAN4B3IHcwd5B3QHeQd6B3QHdAd6B3UHegd7B3UHdQd7B3YHewd8B3YHdwd9B1IEfQdTBFIEcANzA3gHcwN+B3gHeQd/B3oHfweAB3oHegeAB3sHgAeBB3sHeweBB3wHgQeCB3wHfQeDB1MEgwdUBFMEcwNyA34HcgOEB34HfweFB4AHhQeGB4AHgAeGB4EHhgeHB4EHgQeHB4IHhweIB4IHgweJB1QEiQdVBFQEcgN1A4QHdQOKB4QHhQeLB4YHiweMB4YHhgeMB4cHjAeNB4cHhweNB4gHjQeOB4gHiQePB1UEjwdWBFUEdQN0A4oHdAOQB4oHiweRB4wHkQeSB4wHjAeSB40HkgeTB40HjQeTB44HkweUB44HjweVB1YElQdXBFYEdAN3A5AHdwOWB5AHkQeXB5IHlweYB5IHkgeYB5MHmAeZB5MHkweZB5QHmQeaB5QHlQebB1cEmwdYBFcEdwN2A5YHdgOcB5YHlwedB5gHnQeeB5gHmAeeB5kHngefB5kHmQefB5oHnwegB5oHmwehB1gEoQdZBFgEdgN5A5wHeQOiB5wHnQejB54HowekB54HngekB58HpAelB58HnwelB6AHpQemB6AHoQenB1kEpwdaBFkEeQN4A6IHeAOoB6IHowepB6QHqQeqB6QHpAeqB6UHqgerB6UHpQerB6YHqwesB6YHpwetB1oErQdbBFoEeAN7A6gHewOuB6gHqQevB6oHrwewB6oHqgewB6sHsAexB6sHqwexB6wHsQeyB6wHrQezB1sEswdcBFsEewN6A64HegO0B64Hrwe1B7AHtQe2B7AHsAe2B7EHtge3B7EHsQe3B7IHtwe4B7IHswe5B1wEuQddBFwEegN9A7QHfQO6B7QHtQe7B7YHuwe8B7YHtge8B7cHvAe9B7cHtwe9B7gHvQe+B7gHuQe/B10EvwdeBF0EfQN8A7oHfAPAB7oHuwfBB7wHwQfCB7wHvAfCB70HwgfDB70HvQfDB74HwwfEB74HvwfFB14ExQdfBF4EfAN/A8AHfwPGB8AHwQfHB8IHxwfIB8IHwgfIB8MHyAfJB8MHwwfJB8QHyQfKB8QHxQfLB18EywdgBF8EfwN+A8YHfgPMB8YHxwfNB8gHzQfOB8gHyAfOB8kHzgfPB8kHyQfPB8oHzwfQB8oHywfRB2AE0QdhBGAEfgOBA8wHgQPSB8wHzQfTB84H0wfUB84HzgfUB88H1AfVB88HzwfVB9AH1QfWB9AH0QfXB2EE1wdiBGEEgQOAA9IHgAPYB9IH0wfZB9QH2QfaB9QH1AfaB9UH2gfbB9UH1QfbB9YH2wfcB9YH1wfdB2IE3QdjBGIEgAODA9gHgwPeB9gH2QffB9oH3wfgB9oH2gfgB9sH4AfhB9sH2wfhB9wH4QfiB9wH3QfjB2ME4wdkBGMEgwOCA94HggPkB94H3wflB+AH5QfmB+AH4AfmB+EH5gfnB+EH4QfnB+IH5wfoB+IH4wfpB2QE6QdlBGQEggOFA+QHhQPqB+QH5QfrB+YH6wfsB+YH5gfsB+cH7AftB+cH5wftB+gH7QfuB+gH6QfvB2UE7wdmBGUEhQOEA+oHhAPwB+oH6wfxB+wH8QfyB+wH7AfyB+0H8gfzB+0H7QfzB+4H8wf0B+4H7wf1B2YE9QdnBGYEhAOHA/AHhwP2B/AH8Qf3B/IH9wf4B/IH8gf4B/MH+Af5B/MH8wf5B/QH+Qf6B/QH9Qf7B2cE+wdoBGcEhwOGA/YHhgP8B/YH9wf9B/gH/Qf+B/gH+Af+B/kH/gf/B/kH+Qf/B/oH/wcACPoH+wcBCGgEAQhpBGgEhgOKA/wHigMCCPwH/QcDCP4HAwgECP4H/gcECP8HBAgFCP8H/wcFCAAIBQgGCAAIAQgHCGkEBwhqBGkEigOJAwIIiQMICAIIAwgJCAQICQgKCAQIBAgKCAUICggLCAUIBQgLCAYICwgMCAYIBwgNCGoEDQhrBGoEiQOIAwgIiAMOCAgICQgPCAoIDwgQCAoICggQCAsIEAgRCAsICwgRCAwIEQgSCAwIDQgTCGsEEwhsBGsEiAOMAw4IjAMUCA4IDwgVCBAIFQgWCBAIEAgWCBEIFggXCBEIEQgXCBIIFwgYCBIIEwgZCGwEGQhtBGwEjAOLAxQIiwMaCBQIFQgbCBYIGwgcCBYIFggcCBcIHAgdCBcIFwgdCBgIHQgeCBgIGQgfCG0EHwhuBG0EiwPaAxoI2gMgCBoIGwghCBwIIQgiCBwIHAgiCB0IIggjCB0IHQgjCB4IIwgkCB4IHwglCG4EJQi8BG4E2gOPAyAIjwMmCCAIIQgnCCIIJwgoCCIIIggoCCMIKAgpCCMIIwgpCCQIKQgqCCQIJQgrCLwEKwhvBLwEjwOOAyYIjgMsCCYIJwgtCCgILQguCCgIKAguCCkILggvCCkIKQgvCCoILwgwCCoIKwgxCG8EMQhwBG8EjgONAywIjQMyCCwILQgzCC4IMwg0CC4ILgg0CC8INAg1CC8ILwg1CDAINQg2CDAIMQg3CHAENwhxBHAEjQORAzIIkQM4CDIIMwg5CDQIOQg6CDQINAg6CDUIOgg7CDUINQg7CDYIOwg8CDYINwg9CHEEPQhyBHEEkQOQAzgIkAM+CDgIOQg/CDoIPwhACDoIOghACDsIQAhBCDsIOwhBCDwIQQhCCDwIPQhDCHIEQwhzBHIEkAPbAz4I2wNECD4IPwhFCEAIRQhGCEAIQAhGCEEIRghHCEEIQQhHCEIIRwhICEIIQwhJCHMESQi9BHME2wOUA0QIlANKCEQIRQhLCEYISwhMCEYIRghMCEcITAhNCEcIRwhNCEgITQhOCEgISQhPCL0ETwh0BL0ElAOTA0oIkwNQCEoISwhRCEwIUQhSCEwITAhSCE0IUghTCE0ITQhTCE4IUwhUCE4ITwhVCHQEVQh1BHQEkwOSA1AIkgNWCFAIUQhXCFIIVwhYCFIIUghYCFMIWAhZCFMIUwhZCFQIWQhaCFQIVQhbCHUEWwh2BHUEkgPQA1YI0ANcCFYIVwhdCFgIXQheCFgIWAheCFkIXghfCFkIWQhfCFoIXwhgCFoIWwhhCHYEYQiyBHYE0AOXA1wIlwNiCFwIXQhjCF4IYwhkCF4IXghkCF8IZAhlCF8IXwhlCGAIZQhmCGAIYQhnCLIEZwh3BLIElwOWA2IIlgNoCGIIYwhpCGQIaQhqCGQIZAhqCGUIaghrCGUIZQhrCGYIawhsCGYIZwhtCHcEbQh4BHcElgOVA2gIlQNuCGgIaQhvCGoIbwhwCGoIaghwCGsIcAhxCGsIawhxCGwIcQhyCGwIbQhzCHgEcwh5BHgElQPRA24I0QN0CG4Ibwh1CHAIdQh2CHAIcAh2CHEIdgh3CHEIcQh3CHIIdwh4CHIIcwh5CHkEeQizBHkE0QOaA3QImgN6CHQIdQh7CHYIewh8CHYIdgh8CHcIfAh9CHcIdwh9CHgIfQh+CHgIeQh/CLMEfwh6BLMEmgOZA3oImQOACHoIewiBCHwIgQiCCHwIfAiCCH0IggiDCH0IfQiDCH4IgwiECH4IfwiFCHoEhQh7BHoEmQOYA4AImAOGCIAIgQiHCIIIhwiICIIIggiICIMIiAiJCIMIgwiJCIQIiQiKCIQIhQiLCHsEiwh8BHsEmAOdA4YInQOMCIYIhwiNCIgIjQiOCIgIiAiOCIkIjgiPCIkIiQiPCIoIjwiQCIoIiwiRCHwEkQh9BHwEnQOcA4wInAOSCIwIjQiTCI4IkwiUCI4IjgiUCI8IlAiVCI8IjwiVCJAIlQiWCJAIkQiXCH0Elwh+BH0EnAObA5IImwOYCJIIkwiZCJQImQiaCJQIlAiaCJUImgibCJUIlQibCJYImwicCJYIlwidCH4EnQh/BH4EmwOfA5gInwOeCJgImQifCJoInwigCJoImgigCJsIoAihCJsImwihCJwIoQiiCJwInQijCH8EowiABH8EnwOeA54IngOkCJ4InwilCKAIpQimCKAIoAimCKEIpginCKEIoQinCKIIpwioCKIIowipCIAEqQiBBIAEngOiA6QIogOqCKQIpQirCKYIqwisCKYIpgisCKcIrAitCKcIpwitCKgIrQiuCKgIqQivCIEErwiCBIEEogOhA6oIoQOwCKoIqwixCKwIsQiyCKwIrAiyCK0IsgizCK0IrQizCK4Iswi0CK4Irwi1CIIEtQiDBIIEoQOgA7AIoAO2CLAIsQi3CLIItwi4CLIIsgi4CLMIuAi5CLMIswi5CLQIuQi6CLQItQi7CIMEuwiEBIMEoAPSA7YI0gO8CLYItwi9CLgIvQi+CLgIuAi+CLkIvgi/CLkIuQi/CLoIvwjACLoIuwjBCIQEwQi0BIQE0gPcA7wI3APCCLwIvQjDCL4IwwjECL4IvgjECL8IxAjFCL8IvwjFCMAIxQjGCMAIwQjHCLQExwi+BLQE3AOlA8IIpQPICMIIwwjJCMQIyQjKCMQIxAjKCMUIygjLCMUIxQjLCMYIywjMCMYIxwjNCL4EzQiFBL4EpQOkA8gIpAPOCMgIyQjPCMoIzwjQCMoIygjQCMsI0AjRCMsIywjRCMwI0QjSCMwIzQjTCIUE0wiGBIUEpAOjA84IowPUCM4IzwjVCNAI1QjWCNAI0AjWCNEI1gjXCNEI0QjXCNII1wjYCNII0wjZCIYE2QiHBIYEowPTA9QI0wPaCNQI1QjbCNYI2wjcCNYI1gjcCNcI3AjdCNcI1wjdCNgI3QjeCNgI2QjfCIcE3wi1BIcE0wOoA9oIqAPgCNoI2wjhCNwI4QjiCNwI3AjiCN0I4gjjCN0I3QjjCN4I4wjkCN4I3wjlCLUE5QiIBLUEqAOnA+AIpwPmCOAI4QjnCOII5wjoCOII4gjoCOMI6AjpCOMI4wjpCOQI6QjqCOQI5QjrCIgE6wiJBIgEpwOmA+YIpgPsCOYI5wjtCOgI7QjuCOgI6AjuCOkI7gjvCOkI6QjvCOoI7wjwCOoI6wjxCIkE8QiKBIkEpgOqA+wIqgPyCOwI7QjzCO4I8wj0CO4I7gj0CO8I9Aj1CO8I7wj1CPAI9Qj2CPAI8Qj3CIoE9wiLBIoEqgOpA/IIqQP4CPII8wj5CPQI+Qj6CPQI9Aj6CPUI+gj7CPUI9Qj7CPYI+wj8CPYI9wj9CIsE/QiMBIsEqQOsA/gIrAP+CPgI+Qj/CPoI/wgACfoI+ggACfsIAAkBCfsI+wgBCfwIAQkCCfwI/QgDCYwEAwmNBIwErAOrA/4IqwMECf4I/wgFCQAJBQkGCQAJAAkGCQEJBgkHCQEJAQkHCQIJBwkICQIJAwkJCY0ECQmOBI0EqwOvAwQJrwMKCQQJBQkLCQYJCwkMCQYJBgkMCQcJDAkNCQcJBwkNCQgJDQkOCQgJCQkPCY4EDwmPBI4ErwOuAwoJrgMQCQoJCwkRCQwJEQkSCQwJDAkSCQ0JEgkTCQ0JDQkTCQ4JEwkUCQ4JDwkVCY8EFQmQBI8ErgOtAxAJrQMWCRAJEQkXCRIJFwkYCRIJEgkYCRMJGAkZCRMJEwkZCRQJGQkaCRQJFQkbCZAEGwmRBJAErQOxAxYJsQMcCRYJFwkdCRgJHQkeCRgJGAkeCRkJHgkfCRkJGQkfCRoJHwkgCRoJGwkhCZEEIQmSBJEEsQOwAxwJsAMiCRwJHQkjCR4JIwkkCR4JHgkkCR8JJAklCR8JHwklCSAJJQkmCSAJIQknCZIEJwmTBJIEsAO0AyIJtAMoCSIJIwkpCSQJKQkqCSQJJAkqCSUJKgkrCSUJJQkrCSYJKwksCSYJJwktCZMELQmUBJMEtAOzAygJswMuCSgJKQkvCSoJLwkwCSoJKgkwCSsJMAkxCSsJKwkxCSwJMQkyCSwJLQkzCZQEMwmVBJQEswOyAy4JsgM0CS4JLwk1CTAJNQk2CTAJMAk2CTEJNgk3CTEJMQk3CTIJNwk4CTIJMwk5CZUEOQmWBJUEsgO2AzQJtgM6CTQJNQk7CTYJOwk8CTYJNgk8CTcJPAk9CTcJNwk9CTgJPQk+CTgJOQk/CZYEPwmXBJYEtgO1AzoJtQNACToJOwlBCTwJQQlCCTwJPAlCCT0JQglDCT0JPQlDCT4JQwlECT4JPwlFCZcERQmYBJcEtQPUA0AJ1ANGCUAJQQlHCUIJRwlICUIJQglICUMJSAlJCUMJQwlJCUQJSQlKCUQJRQlLCZgESwm2BJgE1AO5A0YJuQNMCUYJRwlNCUgJTQlOCUgJSAlOCUkJTglPCUkJSQlPCUoJTwlQCUoJSwlRCbYEUQmZBLYEuQO4A0wJuANSCUwJTQlTCU4JUwlUCU4JTglUCU8JVAlVCU8JTwlVCVAJVQlWCVAJUQlXCZkEVwmaBJkEuAO3A1IJtwNYCVIJUwlZCVQJWQlaCVQJVAlaCVUJWglbCVUJVQlbCVYJWwlcCVYJVwldCZoEXQmbBJoEtwPVA1gJ1QNeCVgJWQlfCVoJXwlgCVoJWglgCVsJYAlhCVsJWwlhCVwJYQliCVwJXQljCZsEYwm3BJsE1QO8A14JvANkCV4JXwllCWAJZQlmCWAJYAlmCWEJZglnCWEJYQlnCWIJZwloCWIJYwlpCbcEaQmcBLcEvAO7A2QJuwNqCWQJZQlrCWYJawlsCWYJZglsCWcJbAltCWcJZwltCWgJbQluCWgJaQlvCZwEbwmdBJwEuwO6A2oJugNwCWoJawlxCWwJcQlyCWwJbAlyCW0JcglzCW0JbQlzCW4Jcwl0CW4Jbwl1CZ0EdQmeBJ0EugO+A3AJvgN2CXAJcQl3CXIJdwl4CXIJcgl4CXMJeAl5CXMJcwl5CXQJeQl6CXQJdQl7CZ4EewmfBJ4EvgO9A3YJvQN8CXYJdwl9CXgJfQl+CXgJeAl+CXkJfgl/CXkJeQl/CXoJfwmACXoJewmBCZ8EgQmgBJ8EvQPAA3wJwAOCCXwJfQmDCX4JgwmECX4JfgmECX8JhAmFCX8JfwmFCYAJhQmGCYAJgQmHCaAEhwmhBKAEwAO/A4IJvwOICYIJgwmJCYQJiQmKCYQJhAmKCYUJigmLCYUJhQmLCYYJiwmMCYYJhwmNCaEEjQmiBKEEvwPdA4gJ3QOOCYgJiQmPCYoJjwmQCYoJigmQCYsJkAmRCYsJiwmRCYwJkQmSCYwJjQmTCaIEkwm/BKIE3QPDA44JwwOUCY4JjwmVCZAJlQmWCZAJkAmWCZEJlgmXCZEJkQmXCZIJlwmYCZIJkwmZCb8EmQmjBL8EwwPCA5QJwgOaCZQJlQmbCZYJmwmcCZYJlgmcCZcJnAmdCZcJlwmdCZgJnQmeCZgJmQmfCaMEnwmkBKMEwgPBA5oJwQOgCZoJmwmhCZwJoQmiCZwJnAmiCZ0JogmjCZ0JnQmjCZ4JowmkCZ4JnwmlCaQEpQmlBKQEwQPFA6AJxQOmCaAJoQmnCaIJpwmoCaIJogmoCaMJqAmpCaMJowmpCaQJqQmqCaQJpQmrCaUEqwmmBKUExQPEA6YJxAOsCaYJpwmtCagJrQmuCagJqAmvCakJrwmwCakJqQmxCaoJsQmyCaoJqwmzCaYEswmnBKYExAPHA6wJxwO0CawJrQm1CbYJtQm3CbYJuAm3CbkJtwm6CbkJuwm6CbIJugm8CbIJswm9CacEvQmoBKcExwPGA7QJxgO+CbQJvwnACcEJwAnCCcEJwQnCCcMJwgnECcMJwwnECcUJxAnGCcUJvQnHCagExwmpBKgExgPJA74JyQPICb4JwAnJCcIJyQnKCcIJwgnKCcQJygnLCcQJxAnLCcYJywnMCcYJxwnNCakEzQmqBKkEyQPIA8gJyAPOCcgJyQnPCcoJzwnQCcoJygnQCcsJ0AnRCcsJywnRCcwJ0QnSCcwJzQnTCaoE0wmrBKoEyAPeA84J3gPUCc4JzwnVCdAJ1QnWCdAJ0AnWCdEJ1gnXCdEJ0QnXCdIJ1wnYCdIJ0wnZCasE2QnABKsE3gPnA9QJ5wPaCdQJ1QnbCdYJ2wncCdYJ1gncCdcJ3AndCdcJ1wndCdgJ3QneCdgJ2QnfCcAE3wnJBMAE5wPxA9oJ8QPgCdoJ2wnhCdwJ4QniCdwJ3AniCd0J4gnjCd0J3QnjCd4J4wnkCd4J3wnlCckE5QnTBMkE8QP2A+AJ9gPmCeAJ4QnnCeIJ5wnoCeIJ4gnoCeMJ6AnpCeMJ4wnpCeQJ6QnqCeQJ5QnrCdME6wnYBNME9gP5A+YJ+QPsCeYJ5wntCegJ7QnuCegJ6AnuCekJ7gnvCekJ6QnvCeoJ7wnwCeoJ6wnxCdgE8QnbBNgE+QP8A+wJ/APyCewJ7QnzCe4J8wn0Ce4J7gn0Ce8J9An1Ce8J7wn1CfAJ9Qn2CfAJ8Qn3CdsE9wneBNsE/AP9A/IJ/QP4CfIJ8wn5CfQJ+Qn6CfQJ9An6CfUJ+gn7CfUJ9Qn7CfYJ+wn8CfYJ9wn9Cd4E/QnfBN4E/QP6A/gJ+gP+CfgJ+Qn/CfoJ/wkACvoJ+gkACvsJAAoBCvsJ+wkBCvwJAQoCCvwJ/QkDCt8EAwrcBN8E+gP3A/4J9wMECv4J/wkFCgAKBQoGCgAKAAoGCgEKBgoHCgEKAQoHCgIKBwoICgIKAwoJCtwECQrZBNwE9wP0AwQK9AMKCgQKBQoLCgYKCwoMCgYKBgoMCgcKDAoNCgcKBwoNCggKDQoOCggKCQoPCtkEDwrWBNkE9APyAwoK8gMQCgoKCwoRCgwKEQoSCgwKDAoSCg0KEgoTCg0KDQoTCg4KEwoUCg4KDwoVCtYEFQrUBNYE8gPvAxAK7wMWChAKEQoXChIKFwoYChIKEgoYChMKGAoZChMKEwoZChQKGQoaChQKFQobCtQEGwrRBNQE7wPsAxYK7AMcChYKFwodChgKHQoeChgKGAoeChkKHgofChkKGQofChoKHwogChoKGwohCtEEIQrOBNEE7APoAxwK6AMiChwKHQojCh4KIwokCh4KHgokCh8KJAolCh8KHwolCiAKJQomCiAKIQonCs4EJwrKBM4E6APjAyIK4wMoCiIKIwopCiQKKQoqCiQKJAoqCiUKKgorCiUKJQorCiYKKwosCiYKJwotCsoELQrFBMoE4wPfAygK3wMuCigKKQovCioKLwowCioKKgowCisKMAoxCisKKwoxCiwKMQoyCiwKLQozCsUEMwrBBMUE3wPWAy4K1gM0Ci4KLwo1CjAKNQo2CjAKMAo2CjEKNgo3CjEKMQo3CjIKNwo4CjIKMwo5CsEEOQq4BMEE1gPKAzQKygM6CjQKNQo7CjYKOwo8CjYKNgo8CjcKPAo9CjcKNwo9CjgKPQo+CjgKOQo/CrgEPwqsBLgEygMkAzoKJANACjoKOwpBCjwKQQpCCjwKPApCCj0KQgpDCj0KPQpDCj4KQwpECj4KPwpFCqwERQoEBKwEJAMjA0AKIwNGCkAKQQpHCkIKRwpICkIKQgpICkMKSApJCkMKQwpJCkQKSQpKCkQKRQpLCgQESwoFBAQEIwMiA0YKIgPmBEYKRwroBEgK6ATqBEgKSArqBEkK6gTsBEkKSQrsBEoK7ATuBEoKSwrwBAUE8AQGBAUE";var Ns=14048386,Ze={exposure:.84,env:.8,key:2,rim:2.4,fill:.6,dome:[[0,.06],[.45,.2],[1,.55]],envTop:16,envStrip:9,envBack:2.2,rimFresnel:.5},Ka={transparent:!0,depthWrite:!1,premultipliedAlpha:!1,blending:$r,blendEquation:Pn,blendSrc:Ss,blendDst:Ms,blendSrcAlpha:ta,blendDstAlpha:Ms},ui=i=>Math.min(1,Math.max(0,i)),We=(i,t,e)=>{let n=ui((e-i)/(t-i));return n*n*(3-2*n)},qa=i=>1-Math.pow(1-i,3),Gh=i=>1-Math.pow(1-i,4),Os=i=>i<.5?4*i*i*i:1-Math.pow(-2*i+2,3)/2;function Nh(i,{w:t=256,h:e=256,radial:n=!0}={}){let s=document.createElement("canvas");s.width=t,s.height=e;let r=s.getContext("2d"),a=n?r.createRadialGradient(t/2,e/2,0,t/2,e/2,Math.min(t,e)/2):r.createLinearGradient(0,0,0,e);for(let[c,l]of i)a.addColorStop(c,`rgb(${Math.round(l*255)},${Math.round(l*255)},${Math.round(l*255)})`);r.fillStyle=a,r.fillRect(0,0,t,e);let o=new Gi(s);return o.colorSpace=qe,o}function Um(i,t=256){let e=new ri;e.add(new de(new xs(40,24,12),new kn({map:Nh(Ze.dome,{w:8,h:256,radial:!1}),side:ye,toneMapped:!1})));let n=(a,o,c,l,u,f=null)=>{let h=new de(new zn(a,o),new kn({color:new yt(l[0]*u,l[1]*u,l[2]*u),side:Ve,toneMapped:!1,map:f?Nh(f,{w:8,h:128,radial:!1}):null}));h.position.set(...c),h.lookAt(0,0,0),e.add(h)};n(9,6,[-2.5,9,3.5],[1,.985,.96],Ze.envTop),n(1.2,9,[-9,1.5,1.5],[.93,.97,1],Ze.envStrip),n(.9,9,[9,1,-2.5],[1,1,1],Ze.envStrip*.8),n(22,9,[5,3.5,13],[1,1,1],Ze.envBack,[[0,1],[.5,.45],[1,.08]]),n(16,3,[0,.5,-14],[.9,.95,1],.9);let s=new qi(i),r=s.fromScene(e,.015,.1,100,{size:t});return s.dispose(),e.traverse(a=>{a.geometry?.dispose?.(),a.material?.map?.dispose?.(),a.material?.dispose?.()}),r}function Za(i,t,{envSize:e=256,rimColor:n=16740250,rim:s=Ze.rim}={}){let r=Um(t,e);i.environment=r.texture,i.environmentIntensity=Ze.env,i.environmentRotation.set(0,.6,0);let a=new oi(16774382,Ze.key);a.position.set(-3,4.2,3.2);let o=new oi(n,s);o.position.set(4.2,1.6,-3.6);let c=new oi(14017535,Ze.fill);return c.position.set(3.6,.6,3.8),i.add(a,o,c),r}var Tl=null,Il=i=>{let t=atob(i),e=new Uint8Array(t.length);for(let n=0;n<t.length;n++)e[n]=t.charCodeAt(n);return e.buffer},Oh=i=>{let t=new Int16Array(Il(i)),e=new Float32Array(t.length);for(let n=0;n<t.length;n++)e[n]=t[n]/32767;return e};function Dm(){return Tl??(Tl={pos:Oh(Rh),nor:Oh(Uh),tab:new Uint16Array(Il(Dh)),stroke:new Uint16Array(Il(Fh))}),Tl}function ja(){let i=Dm(),t=new he(i.pos,3),e=new he(i.nor,3),n=s=>{let r=new Ee;return r.setAttribute("position",t),r.setAttribute("normal",e),r.setIndex(new he(s,1)),r.computeBoundingBox(),r.computeBoundingSphere(),r};return{tab:n(i.tab),stroke:n(i.stroke)}}var Pl=-.4995,Qh=.4999;function kh({R:i=1,zt:t=.085,zb:e=-.085,zf:n=.045,ri:s=.875,bevel:r=.032,scallops:a=44,amp:o=.0055}={}){let c=[],l=(E,A,M,I)=>c.push([E,A,M,I]);l(0,n,0,1),l(.42,n,0,1),l(s-.05,n,0,1);let u=7,f=s-.05,h=s;for(let E=0;E<=u;E++){let A=E/u,M=A*A*(3-2*A),R=6*A*(1-A)*(t-n)/(h-f),N=Math.hypot(1,R);l(f+(h-f)*A,n+(t-n)*M,-R/N,1/N)}l((s+i-r)/2,t+.002,0,1),l(i-r,t,0,1);let p=6;for(let E=1;E<=p;E++){let A=E/p*Math.PI/2;l(i-r+Math.sin(A)*r,t-r+Math.cos(A)*r,Math.sin(A),Math.cos(A))}l(i,e+r,1,0);for(let E=1;E<=p;E++){let A=E/p*Math.PI/2;l(i-r+Math.cos(A)*r,e+r-Math.sin(A)*r,Math.cos(A),-Math.sin(A))}l(0,e,0,-1);let w=a*6,S=c.length,g=(w+1)*S,d=new Float32Array(g*3),b=new Float32Array(g*3),T=new Uint16Array(w*(S-1)*6),y=0;for(let E=0;E<S;E++){let[A,M,I,R]=c[E],N=We(i-r-.012,i-r*.4,A);for(let k=0;k<=w;k++){let B=k/w*Math.PI*2,H=Math.cos(B),K=Math.sin(B),W=A*(1+o*N*Math.cos(a*B)),nt=o*a*Math.sin(a*B)*N*Math.abs(I),J=H*I-K*nt,j=K*I+H*nt,tt=R,Mt=Math.hypot(J,j,tt)||1;J/=Mt,j/=Mt,tt/=Mt,d[y*3]=H*W,d[y*3+1]=K*W,d[y*3+2]=M,b[y*3]=J,b[y*3+1]=j,b[y*3+2]=tt,y++}}let _=0;for(let E=0;E<S-1;E++)for(let A=0;A<w;A++){let M=E*(w+1)+A,I=M+w+1,R=M+1,N=I+1;T[_++]=M,T[_++]=I,T[_++]=R,T[_++]=R,T[_++]=I,T[_++]=N}let x=new Ee;return x.setAttribute("position",new he(d,3)),x.setAttribute("normal",new he(b,3)),x.setIndex(new he(T,1)),x.computeBoundingSphere(),x}function Hh(){return{uBandY:{value:9},uBandW:{value:.028},uBandCol:{value:new yt(Ns).multiplyScalar(2.6)},uBandOn:{value:0},uWideK:{value:.16},uWideW:{value:.16},uWideCol:{value:new yt(Ns).multiplyScalar(2.6)},uGlint:{value:-9},uGlintOn:{value:0},uRim:{value:Ze.rimFresnel},uRimCol:{value:new yt(16744104)},uPulse:{value:0},uPillow:{value:.2},uLPS:{value:1},uLevel:{value:0},uClip:{value:1},uGlass:{value:1},uTint:{value:new yt(2369068)},uGlassA:{value:.45},uRimA:{value:.5},uSpecA:{value:1},uStreak:{value:.1},uDesat:{value:0},uFieldCol:{value:new yt(12140392)},uFieldR:{value:.825},uInlay:{value:new yt(15765424)}}}function zh(i,t,{local:e=!1,clip:n=!1,glass:s=!1,coin:r=!1}={}){let a=i.defines||(i.defines={});return e&&(a.V_LOCAL=1),n&&(a.V_CLIP=1),s&&(a.V_GLASS=1),r&&(a.V_COIN=1),i.onBeforeCompile=o=>{Object.assign(o.uniforms,t),o.vertexShader=o.vertexShader.replace("#include <common>",`#include <common>
varying float vWY; varying vec3 vLN; varying vec3 vTilt; varying vec2 vLP; uniform float uPillow; uniform float uLPS;`).replace("#include <begin_vertex>",`#include <begin_vertex>
vWY = (modelMatrix * vec4(transformed, 1.0)).y; vLN = normal; vLP = position.xy * uLPS; vTilt = normalMatrix * vec3(position.xy, 0.0);`),o.fragmentShader=o.fragmentShader.replace("#include <common>",`#include <common>
varying float vWY; varying vec3 vLN; varying vec3 vTilt; varying vec2 vLP;
uniform float uBandY, uBandW, uBandOn, uWideK, uWideW, uGlint, uGlintOn, uRim, uPulse, uPillow, uLevel, uClip, uGlass, uGlassA, uRimA, uSpecA, uStreak, uDesat, uFieldR;
uniform vec3 uBandCol, uWideCol, uRimCol, uTint, uFieldCol, uInlay;`).replace("#include <clipping_planes_fragment>",`#include <clipping_planes_fragment>
#ifdef V_CLIP
  if (uClip * (vLP.y - uLevel) > 0.0) discard;
#endif`).replace("#include <color_fragment>",`#include <color_fragment>
#ifdef V_COIN
  float cr = length(vLP);
  float cField = 1.0 - smoothstep(uFieldR, uFieldR + 0.012, cr);
  float cIn = exp(-pow((cr - 0.785) / 0.0065, 2.0));
  diffuseColor.rgb = mix(diffuseColor.rgb, mix(uFieldCol, uInlay, cIn), cField * step(0.0, vLN.z));
#endif
#ifdef V_GLASS
  diffuseColor.rgb = mix(diffuseColor.rgb, uTint, uGlass);
#endif`).replace("#include <normal_fragment_begin>",`#include <normal_fragment_begin>
{
  float capMask = smoothstep(0.85, 0.99, abs(vLN.z));
  normal = normalize(normal + vTilt * uPillow * capMask);
#ifdef V_COIN
  float gk = length(vLP) * 110.0, gw = fwidth(gk);
  normal = normalize(normal + normalize(vTilt + 1e-5) * sin(gk) * 0.035 * capMask * cField * (1.0 - smoothstep(0.3, 0.75, gw)));
#endif
}`).replace("#include <opaque_fragment>",`
#ifdef V_LOCAL
  float bdy = vLP.y - uBandY;
#else
  float bdy = vWY - uBandY;
#endif
  float bd = bdy / uBandW, bw = bdy / uWideW;
  outgoingLight += (uBandCol * exp(-bd * bd) + uWideCol * uWideK * exp(-bw * bw)) * uBandOn;
  float gd = (dot(vLP, vec2(0.8, 0.6)) - uGlint) / 0.07;
  outgoingLight += vec3(1.6, 1.45, 1.5) * uGlintOn * exp(-gd * gd) * (0.45 + 0.9 * smoothstep(0.3, 0.9, abs(vLN.z)));
  float fnv = 1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0);
  outgoingLight += uRimCol * (fnv * fnv * fnv * uRim + uPulse);
#ifdef V_GLASS
  // a soft double streak across the flat faces that slides with the view, the way a pane of glass catches a window
  float skd = dot(vLP, vec2(0.8, 0.6)) + normal.x * 1.5;
  float skk = gl_FrontFacing ? smoothstep(0.7, 0.98, abs(vLN.z)) : 0.0;
  vec3 gBody = totalDiffuse;
  vec3 gSp = max(outgoingLight - totalDiffuse, vec3(0.0)) + vec3(1.0, 0.98, 1.0) * uStreak * skk * (exp(-pow((skd - 0.12) / 0.075, 2.0)) + 0.55 * exp(-pow((skd - 0.3) / 0.028, 2.0)));
  gSp = mix(gSp, vec3(dot(gSp, vec3(0.3, 0.55, 0.15))), uDesat);
  float gSl = clamp(max(gSp.r, max(gSp.g, gSp.b)) * uSpecA, 0.0, 1.0);
  float gAb = 1.0 - (1.0 - uGlassA) * (1.0 - fnv * fnv * uRimA);
  float gA = 1.0 - (1.0 - gAb) * (1.0 - gSl);
  // "over" composite of body and reflections, undone by the premultiply three applies afterwards; opaque paint at uGlass 0
  outgoingLight = mix(outgoingLight, (gBody * gAb * (1.0 - gSl) + gSp) / max(gA, 1e-3), uGlass);
  diffuseColor.a = mix(1.0, gA, uGlass);
#endif
#include <opaque_fragment>`)},i.customProgramCacheKey=()=>"vero-v3d-1",i}var Fm={color:Ns,roughness:.3,metalness:0,clearcoat:1,clearcoatRoughness:.045,ior:1.5,specularIntensity:1,sheen:0},Nm={color:1052948,roughness:.26,metalness:.25,clearcoat:1,clearcoatRoughness:.03,ior:1.5,specularIntensity:1,sheen:0},Om=i=>({...i==="ink"?Nm:Fm});function Gs(i,t,e={},n={}){return zh(new ki({...Om(i),side:wn,...n}),t,e)}function Bl(i,t={},e={}){return zh(new ki({color:16777215,roughness:.14,metalness:0,clearcoat:1,clearcoatRoughness:.04,ior:1.5,specularIntensity:1,sheen:0,transparent:!0,premultipliedAlpha:!0,depthWrite:!1,...e}),i,{glass:!0,...t})}function Jh(i,t){return new Ce({side:ye,toneMapped:!1,uniforms:{uLevel:i.uLevel,uCol:{value:new yt(t)},uOn:i.uBandOn},vertexShader:"varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`varying vec2 vP; uniform float uLevel; uniform float uOn; uniform vec3 uCol;
      void main(){ if (vP.y > uLevel) discard; gl_FragColor = vec4(uCol, 1.0); }`})}function Vh(i,{width:t=3.2,height:e=.3}={}){let n=new de(new zn(t,e),new Ce({side:Ve,toneMapped:!1,...Ka,uniforms:{uCol:{value:new yt(i)},uOn:{value:0},uRes:{value:new Bt(1,1)},uCore:{value:.03}},vertexShader:"varying vec2 vU; void main(){ vU = uv - 0.5; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`varying vec2 vU; uniform vec3 uCol; uniform float uOn; uniform vec2 uRes; uniform float uCore;
      void main(){
        float y = vU.y, x = vU.x * 2.0;
        float a = exp(-y * y / (uCore * uCore)) * 0.85 + exp(-y * y / 0.012) * 0.16;
        a *= exp(-x * x * 5.0);
        vec2 q = gl_FragCoord.xy / uRes;
        a *= smoothstep(0.0, 0.14, q.x) * smoothstep(1.0, 0.86, q.x) * smoothstep(0.0, 0.05, q.y) * smoothstep(1.0, 0.95, q.y);
        gl_FragColor = vec4(uCol, a * uOn);
      }`}));return n.renderOrder=5,n.frustumCulled=!1,n}function Wh(i,t){let e=new Ee,n=new Float32Array(i*3),s=new Float32Array(i*4),r=7,a=()=>(r=r*16807%2147483647,r/2147483647);for(let l=0;l<i;l++)n[l*3]=(a()-.5)*5.2,n[l*3+1]=(a()-.5)*2.8,n[l*3+2]=(a()-.2)*3-1,s[l*4]=a()*6.283,s[l*4+1]=.025+a()*.06,s[l*4+2]=.4+a()*1,s[l*4+3]=a();e.setAttribute("position",new he(n,3)),e.setAttribute("aSeed",new he(s,4));let o=new Ce({toneMapped:!1,...Ka,uniforms:{uTime:{value:0},uAlpha:{value:0},uScale:{value:400},uCol:{value:new yt(t)}},vertexShader:`
      attribute vec4 aSeed; uniform float uTime; uniform float uScale; varying float vA; varying float vT;
      void main() {
        vec3 q = position;
        q.y = mod(q.y + 1.4 + uTime * aSeed.y, 2.8) - 1.4;
        q.x += sin(uTime * 0.31 * aSeed.z + aSeed.x) * 0.14;
        q.z += cos(uTime * 0.27 * aSeed.z + aSeed.x * 1.7) * 0.12;
        vec4 mv = modelViewMatrix * vec4(q, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = max(1.5, (0.008 + aSeed.w * aSeed.w * 0.03) * uScale / max(0.5, -mv.z));
        vA = smoothstep(1.4, 0.9, abs(q.y)) * (0.25 + 0.75 * (0.5 + 0.5 * sin(uTime * (0.6 + aSeed.z) + aSeed.x * 3.0)));
        vT = aSeed.w;
      }`,fragmentShader:`
      uniform vec3 uCol; uniform float uAlpha; varying float vA; varying float vT;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        float a = 1.0 - smoothstep(0.0, 1.0, r); a *= a;
        gl_FragColor = vec4(mix(uCol, vec3(1.0), vT * 0.6), a * vA * uAlpha * 0.5);
      }`}),c=new ms(e,o);return c.frustumCulled=!1,c.renderOrder=6,c}function Xh(){let i=document.createElement("canvas");i.width=i.height=96;let t=i.getContext("2d"),e=48,n=t.createRadialGradient(e,e,0,e,e,e);n.addColorStop(0,"rgba(255,255,255,1)"),n.addColorStop(.1,"rgba(255,225,236,.75)"),n.addColorStop(.3,"rgba(255,130,170,.14)"),n.addColorStop(.65,"rgba(255,100,150,0)"),t.fillStyle=n,t.fillRect(0,0,96,96),t.globalCompositeOperation="lighter";for(let[r,a]of[[94,2],[2,56]]){let o=t.createRadialGradient(e,e,0,e,e,Math.max(r,a)/2);o.addColorStop(0,"rgba(255,255,255,.95)"),o.addColorStop(1,"rgba(255,255,255,0)"),t.fillStyle=o,t.fillRect(e-r/2,e-a/2,r,a)}let s=new Gi(i);return s.colorSpace=qe,s}function Yh(i){i.traverse(t=>{t.geometry?.dispose?.(),(Array.isArray(t.material)?t.material:t.material?[t.material]:[]).forEach(n=>{for(let s in n)n[s]?.isTexture&&n[s].dispose();n.dispose()})})}var jn=Math.PI/180,Kh={light:{tint:1513759,glassA:.52,rimA:.55,specA:1.1},dark:{tint:11053496,glassA:.11,rimA:.5,specA:.9},rose:{tint:3478047,glassA:.26,rimA:.35,specA:.9}},ks=class{constructor(t,e){this.inst=t,this.mem=t.mem,this.renderer=e,this.scene=new ri,this.camera=new Be(26,1,.05,100),this.rm=t.reduced,this.dt=0,this.parallax=new Bt,this.pointer=new Bt,this.u=Hh(),this.envRT=null}setPointer(t,e){this.pointer.set(t,e)}parallaxBusy(){return this.parallax.distanceToSquared(this.pointer)>2e-5}stepParallax(t,e=2.5){if(this.rm){this.parallax.set(0,0);return}this.parallax.lerp(this.pointer,1-Math.exp(-t*e))}setGlassTarget(t,e=!1){let n=Kh[t]||Kh.light;this.glassGoal={tint:new yt(n.tint),glassA:n.glassA,rimA:n.rimA,specA:n.specA},e&&this.stepGlass(1e3)}stepGlass(t){let e=this.glassGoal,n=this.u;if(!e)return!1;let s=1-Math.exp(-t*7);return n.uTint.value.lerp(e.tint,s),n.uGlassA.value+=(e.glassA-n.uGlassA.value)*s,n.uRimA.value+=(e.rimA-n.uRimA.value)*s,n.uSpecA.value+=(e.specA-n.uSpecA.value)*s,Math.abs(e.glassA-n.uGlassA.value)>.001}fitDist(t,e,n,s,r){let a=2*Math.tan(this.camera.fov/2*jn);return Math.max(n/(r*a),e/(s*t*a))}dispose(){Yh(this.scene),this.envRT?.dispose(),this.scene.environment=null}},Gm={tab:{delay:0,dur:1.45,from:[-2.1,1.2,1.5],spin:[.9,-1.3,1],from0:.6},stroke:{delay:.12,dur:1.5,from:[2.2,-1.4,-1],spin:[-.7,1.2,-.8],from0:.65}},$a=[-.4,-.075],qh=7,Qm=3,km=9.5,Ll=1.5,Rl=1.7,Ul=2.8,Dl=class extends ks{constructor(t,e){super(t,e);let n=t.tone==="ink";this.ink=n,this.bleed=t.el.dataset.framing==="bleed",this.envRT=Za(this.scene,e,{envSize:256,rimColor:n?16770798:16740250,rim:n?1.6:void 0});let s=this.u;n&&(s.uBandCol.value.setRGB(2.6,2.2,2.35),s.uWideCol.value.setRGB(1.6,1.25,1.4),s.uWideK.value=.035,s.uRimCol.value.set(16763353),s.uRim.value=.3);let r=Gs(t.tone,s,{},{clearcoatRoughness:n?.03:.075});this.mark=new Ge,this.pivot=new Ge,this.pivot.add(this.mark),this.scene.add(this.pivot),this.pieces={};let a=ja();for(let o of["tab","stroke"]){let c=a[o],l=c.boundingBox.getCenter(new F),u=new de(c,r);u.position.copy(l).negate(),u.frustumCulled=!1;let f=new Ge;f.position.copy(l),f.userData.home=l.clone(),f.add(u),this.mark.add(f),this.pieces[o]=f}this.sheet=Vh(n?16773365:15891104),this.sheet.visible=!1,this.scene.add(this.sheet),this.motes=Wh(110,n?16771568:16761556),this.scene.add(this.motes),this.flare=new ps(new Ni({map:Xh(),color:16777215,opacity:0,toneMapped:!1,...Ka})),this.flare.position.set($a[0],$a[1],.14),this.flare.renderOrder=7,this.flare.scale.setScalar(.001),this.mark.add(this.flare),this.target=new F(0,-.01,0),this.camBase=new F,this.right=new F,this.up=new F}resize(t,e,n){let s=this.camera,r=t/Math.max(1,e);s.aspect=r,s.fov=26;let a=-18*jn,o=8*jn,c=1.32*Math.cos(a)+.18*Math.abs(Math.sin(a)),l=this.bleed?Math.max(1.75,this.fitDist(r,c,1,1.2,1.15)):Math.max(1.8,this.fitDist(r,c,1,.74,.74));this.camBase.set(Math.sin(a)*Math.cos(o),Math.sin(o),Math.cos(a)*Math.cos(o)).multiplyScalar(l).add(this.target),s.position.copy(this.camBase),s.lookAt(this.target),this.right.set(1,0,0).applyQuaternion(s.quaternion),this.up.set(0,1,0).applyQuaternion(s.quaternion),this.bleed?s.setViewOffset(t,e,-.17*t,-.2*e,t,e):s.clearViewOffset(),s.updateProjectionMatrix();let u=l*Math.tan(13*jn)*r;this.fromK=Math.min(1.1,Math.max(.55,(u+.5)/2.1));let f=e*n,h=t*e;this.motes.material.uniforms.uScale.value=f*1.9*Math.max(.55,Math.min(1,3.3/l)),this.motes.geometry.setDrawRange(0,Math.round(Math.min(110,Math.max(26,h/7e3))));let p=f/(2*l*Math.tan(13*jn));this.u.uBandW.value=Math.max(.012,1.7/p);let w=this.sheet.material.uniforms;w.uRes.value.set(t*n,e*n),w.uCore.value=Math.max(.008,.9/p)/.3}fps(){return this.rm?0:this.mem.age<3.6||this.parallaxBusy()?60:30}update(t){let e=this.rm,n=this.u;e||(this.mem.age+=t);let s=e?99:this.mem.age;for(let d of["tab","stroke"]){let b=this.pieces[d],T=Gm[d],y=this.fromK,_=ui((s-T.delay)/T.dur),x=1-Gh(_),E=1-qa(_),A=b.userData.home;b.position.set(A.x+T.from[0]*y*x,A.y+T.from[1]*y*x,A.z+T.from[2]*y*x),b.rotation.set(T.spin[0]*E,T.spin[1]*E,T.spin[2]*E),b.scale.setScalar(T.from0+(1-T.from0)*We(0,.6,_))}let r=e?0:We(1.3,3.2,s);this.stepParallax(t);let a=this.parallax.x,o=this.parallax.y,c=e?0:.7*(1-qa(ui(s/2.2)));if(this.mark.rotation.y=e?.16:c+r*Math.sin(Math.max(0,s-1.5)*Math.PI*2/16)*.28+a*.16,this.mark.rotation.x=e?0:o*.06+r*Math.sin(s*.43)*.025,this.mark.position.y=e?0:r*Math.sin(s*.72)*.018,this.mark.scale.setScalar(e?1:1+r*Math.sin(s*1.05)*.008),!e){let d=r*(.5+.5*Math.sin(s*1.05))*.012;this.pieces.tab.position.x-=d*.6,this.pieces.tab.position.y+=d,this.pieces.stroke.position.x+=d*.5,this.pieces.stroke.position.y-=d*.4}this.camera.position.copy(this.camBase).addScaledVector(this.right,a*.08).addScaledVector(this.up,-o*.045),this.camera.lookAt(this.target);let l=0,u=-9;if(!e&&s>Rl){let d=(s-Rl)%km;if(d<Ll){let b=d/Ll;u=-1.1+2.2*Os(b),l=We(0,.08,b)*We(1,.92,b)}}n.uGlint.value=u,n.uGlintOn.value=l;let h=s<Rl+Ll&&l>0?l*Math.exp(-Math.pow((u-($a[0]*.8+$a[1]*.6))/.2,2)):0;this.flare.material.opacity=h*.85,this.flare.scale.setScalar(.04+.34*h);let p=0,w=9;if(!e&&s>Ul){let d=Math.floor((s-Ul)/qh),b=(s-Ul-d*qh)/Qm;if(b<1){let T=Os(b);w=(d%2?-1:1)*(-.66+1.32*T),p=We(0,.1,b)*We(1,.9,b)}}n.uBandY.value=w,n.uBandOn.value=p;let S=this.mark.rotation.y;this.sheet.position.set(Math.sin(S)*.085,w,Math.cos(S)*.085),this.sheet.rotation.set(0,S,0),this.sheet.visible=p>.01,this.sheet.material.uniforms.uOn.value=p*(this.ink?.7:.75),this.scene.environmentRotation.y=.6+(e?0:Math.sin(Math.max(0,s)*Math.PI*2/18)*.12);let g=this.motes.material.uniforms;g.uTime.value=e?3:Math.max(0,s)+5,g.uAlpha.value=e?.55:.75*We(.6,2.4,s),this.motes.position.y=this.mark.position.y*.5}},Hm=1.4,zm=1,Fl=class extends ks{constructor(t,e){super(t,e);let n=t.tone==="ink";this.ink=n,this.envRT=Za(this.scene,e,{envSize:128,rimColor:n?16770798:16740250,rim:n?1.6:void 0});let s=this.u;s.uBandCol.value=n?new yt().setRGB(3.2,2.8,3):new yt().setRGB(3.4,2.1,2.5),s.uWideCol.value=n?new yt().setRGB(1.5,1.2,1.35):new yt(Ns).multiplyScalar(2.2),s.uWideK.value=n?.05:.34,s.uWideW.value=.085,s.uBandOn.value=0,s.uPillow.value=.2,s.uStreak.value=.075,n&&(s.uRimCol.value.set(16763353),s.uRim.value=.3);let r={...s,uClip:{value:1}},a={...s,uClip:{value:-1}},o=Gs(t.tone,r,{local:!0,clip:!0}),c=Jh(s,n?16178405:16229309),l=Bl(a,{local:!0,clip:!0},{side:1}),u=Bl(a,{local:!0,clip:!0},{side:0});this.mark=new Ge,this.scene.add(this.mark);let f=ja();for(let p of[f.tab,f.stroke]){let w=(S,g)=>{let d=new de(p,S);d.renderOrder=g,d.frustumCulled=!1,this.mark.add(d)};w(o,0),w(c,0),w(l,1),w(u,2)}this.setTheme(t.theme,!0);let h=t.value();this.mem.shown==null?(this.mem.shown=0,this.tween=this.rm?null:{from:0,to:h,t0:this.mem.age,dur:Hm},this.rm&&(this.mem.shown=h)):this.mem.shown=h,this.goal=h,this.applyLevel(),this.target=new F(0,0,0),this.camBase=new F,this.right=new F,this.up=new F}setTheme(t,e){this.setGlassTarget(this.ink?"rose":t,e),this.themeBusy=!e,this.inst.invalidate?.()}setValue(t){t!==this.goal&&(this.goal=t,this.rm?(this.mem.shown=t,this.tween=null):this.tween={from:this.mem.shown,to:t,t0:this.mem.age,dur:zm})}applyLevel(){let t=this.mem.shown,e=this.u,n=Pl+(Qh-Pl)*ui(t/100);e.uLevel.value=n,e.uBandY.value=n,e.uBandOn.value=We(0,1.2,t)*We(100,98.8,t)}resize(t,e,n){let s=this.camera,r=t/Math.max(1,e);s.aspect=r,s.fov=24;let a=-20*jn,o=13*jn,c=1.32*Math.cos(a)+.18*Math.abs(Math.sin(a)),l=Math.max(2.6,this.fitDist(r,c,1+.18*Math.sin(o),.86,.84));this.camBase.set(Math.sin(a)*Math.cos(o),Math.sin(o),Math.cos(a)*Math.cos(o)).multiplyScalar(l).add(this.target),s.position.copy(this.camBase),s.lookAt(this.target),this.right.set(1,0,0).applyQuaternion(s.quaternion),this.up.set(0,1,0).applyQuaternion(s.quaternion),s.updateProjectionMatrix();let u=e*n/(2*l*Math.tan(12*jn));this.u.uBandW.value=Math.max(.006,1.25/u)}fps(){return this.rm?0:this.tween||this.themeBusy||this.parallaxBusy()?60:30}update(t){let e=this.rm;e||(this.mem.age+=t);let n=this.mem.age;if(this.tween){let a=this.tween,o=e?1:ui((n-a.t0)/a.dur);this.mem.shown=a.from+(a.to-a.from)*qa(o),o>=1&&(this.tween=null)}this.applyLevel(),this.themeBusy&&(this.themeBusy=this.stepGlass(e?1e3:Math.max(t,.016))),this.stepParallax(t);let s=this.parallax.x,r=this.parallax.y;this.mark.rotation.y=e?.04:Math.sin(n*Math.PI*2/11)*.1+s*.13,this.mark.rotation.x=e?0:Math.sin(n*.41)*.012+r*.05,this.mark.position.y=e?0:Math.sin(n*.67)*.006,this.camera.position.copy(this.camBase).addScaledVector(this.right,s*.05).addScaledVector(this.up,-r*.03),this.camera.lookAt(this.target),this.scene.environmentRotation.y=.6+(e?0:Math.sin(n*Math.PI*2/18)*.1)}},Zn={x:.1,y:-.24},Qs=.8,tu=.62,Zh=.045+.09*Qs*tu-.004,jh=42,$h=7.2,Nl=class extends ks{constructor(t,e){super(t,e),this.envRT=Za(this.scene,e,{envSize:128});let n=this.u;n.uPillow.value=.2,n.uStreak.value=.045,n.uDesat.value=1;let s=t.el.dataset.state==="earned";this.mem.earn=s?1:0,this.goal=s?1:0,this.tween=null,this.rot=this.mem.rot||{x:Zn.x,y:Zn.y,vx:0,vy:0},this.mem.rot=this.rot;let r={glass:!0},a={...n,uPillow:{value:.035}},o=Gs("rose",a,{...r,coin:!0},{transparent:!0,premultipliedAlpha:!0,depthWrite:!0}),c={...n,uLPS:{value:Qs},uPillow:{value:.09}},l=Gs("rose",c,r,{transparent:!0,premultipliedAlpha:!0,depthWrite:!0});this.group=new Ge,this.scene.add(this.group);let u=new de(kh(),o);u.renderOrder=1,u.frustumCulled=!1,this.group.add(u),this.v=new Ge;let f=ja();for(let h of[f.tab,f.stroke]){let p=new de(h,l);p.renderOrder=2,p.frustumCulled=!1,this.v.add(p)}this.v.scale.set(Qs,Qs,Qs*tu),this.v.position.set(.005,0,Zh),this.group.add(this.v),this.setTheme(t.theme,!0),this.applyEarn()}setTheme(t,e){this.setGlassTarget(t==="dark"?"darkSeal":"lightSeal",e),this.themeBusy=!e}setGlassTarget(t,e){let n={lightSeal:{tint:1974310,glassA:.64,rimA:.5,specA:1},darkSeal:{tint:11053494,glassA:.2,rimA:.6,specA:.9}}[t];this.glassGoal={tint:new yt(n.tint),glassA:n.glassA,rimA:n.rimA,specA:n.specA},e&&this.stepGlass(1e3)}setState(t){let e=t==="earned"?1:0;if(e!==this.goal){if(this.goal=e,this.rm){this.mem.earn=e,this.tween=null;return}this.tween={from:this.mem.earn,to:e,t0:this.mem.age,dur:e?1.1:.8},e&&(this.rot.vy+=2.4,this.rot.vx-=.8,this.lastGlint=this.mem.age+.35)}}applyEarn(){let t=this.mem.earn,e=this.u;e.uGlass.value=1-t,e.uRim.value=.5*t}resize(t,e){let n=this.camera,s=t/Math.max(1,e);n.aspect=s,n.fov=22;let r=this.fitDist(s,2.12,2.12,.92,.92);n.position.set(0,0,r),n.lookAt(0,0,0),n.updateProjectionMatrix()}setPointer(t,e,n){this.tx=n?t*.42:0,this.ty=n?e*.34:0}springBusy(){let t=this.rot,e=Zn.y+(this.tx||0),n=Zn.x+(this.ty||0);return Math.abs(t.vx)+Math.abs(t.vy)>.003||Math.abs(t.x-n)+Math.abs(t.y-e)>8e-4}fps(){return this.rm?0:this.tween||this.themeBusy||this.springBusy()?60:this.mem.earn>.5?30:0}update(t){let e=this.rm,n=this.u;e||(this.mem.age+=t);let s=this.mem.age;if(this.tween){let p=this.tween,w=e?1:ui((s-p.t0)/p.dur);this.mem.earn=p.from+(p.to-p.from)*Os(w),w>=1&&(this.tween=null)}this.applyEarn(),this.themeBusy&&(this.themeBusy=this.stepGlass(e?1e3:Math.max(t,.016)));let r=this.mem.earn,a=this.rot,o=e?Zn.x:Zn.x+(this.ty||0),c=e?Zn.y:Zn.y+(this.tx||0);if(e)a.x=o,a.y=c,a.vx=a.vy=0;else{let p=Math.min(t,.1);for(;p>1e-4;){let w=Math.min(p,.011111111111111112);a.vx+=(-jh*(a.x-o)-$h*a.vx)*w,a.x+=a.vx*w,a.vy+=(-jh*(a.y-c)-$h*a.vy)*w,a.y+=a.vy*w,p-=w}}let l=e?.5:.5+.5*Math.sin(s*Math.PI*2/3.4),u=e?0:r*Math.sin(s*Math.PI*2/13)*.035;this.group.rotation.set(a.x+u*.4,a.y+u,0),n.uPulse.value=r*r*l*.055,this.v.position.z=Zh+r*l*.006;let f=0,h=-9;if(!e&&r>.6){this.lastGlint==null&&(this.lastGlint=s+.4);let p=(s-this.lastGlint)/1.1;p>=0&&p<1&&(h=-1.25+2.5*Os(p),f=We(0,.1,p)*We(1,.9,p)),p>=1&&(this.lastGlint=s+4.6)}n.uGlint.value=h,n.uGlintOn.value=f*r,this.scene.environmentRotation.y=.6}},Ol={hero:Dl,fill:Fl,seal:Nl};(()=>{if(window.VeroV3D){window.VeroV3D.scan();return}let i={maxDPR:1.5,disposeMs:2e4,maxContexts:12,maxPixels:24e5},t=new Map,e=new Set,n="[data-v3d]",s=window.matchMedia?window.matchMedia("(prefers-reduced-motion: reduce)"):null,r=()=>!!(s&&s.matches),a=null;function o(){if(a)return a;a={webgl2:!1,software:!1};try{let x=document.createElement("canvas").getContext("webgl2");if(x){a.webgl2=!0;let E=x.getExtension("WEBGL_debug_renderer_info"),A=E?String(x.getParameter(E.UNMASKED_RENDERER_WEBGL)):"";a.software=/swiftshader|llvmpipe|software|basic render/i.test(A),x.getExtension("WEBGL_lose_context")?.loseContext()}}catch{a.webgl2=!1}return a}let c=0,l={x:0,y:0,on:!1,fresh:!1};function u(){!c&&!document.hidden&&(c=requestAnimationFrame(f))}function f(_){c=0;let x=!1,E=l.fresh;l.fresh=!1;for(let A of e)E&&A.pollPointer(),A.tick(_)&&(x=!0);x&&u()}document.addEventListener("visibilitychange",()=>{for(let _ of e)_.last=0;document.hidden||u()});let h=!1;function p(){h||(h=!0,window.addEventListener("pointermove",_=>{_.pointerType!=="touch"&&(l.x=_.clientX,l.y=_.clientY,l.on=!0,l.fresh=!0,u())},{passive:!0}),document.documentElement.addEventListener("pointerleave",()=>{l.on=!1,l.fresh=!0,u()}))}let w=Promise.resolve(),S=()=>new Promise(_=>document.hidden?setTimeout(_,0):requestAnimationFrame(()=>_()));function g(){if(e.size<i.maxContexts)return!0;let _=null;for(let x of e)!x.visible&&(!_||x.hiddenAt<_.hiddenAt)&&(_=x);return _?(_.release(),!0):!1}class d{constructor(x){this.el=x,this.mode=x.dataset.v3d,this.tone=x.dataset.tone==="ink"?"ink":"rose",this.mem={age:0},this.state="off",this.visible=!1,this.dirty=!0,this.last=0,this.frozen=!1,this.retries=0,this.frames=0,this.ms=0,this.w=0,this.h=0,this.theme=this.readTheme(),getComputedStyle(x).position==="static"&&(x.style.position="relative"),b?.observe(x),T?.observe(x),b||this.setVisible(!0)}get reduced(){return r()}value(){let x=parseFloat(this.el.dataset.value);return Number.isFinite(x)?Math.min(100,Math.max(0,x)):0}invalidate(){this.dirty=!0,u()}readTheme(){let x=this.el.closest("[data-theme]"),E=x&&x.getAttribute("data-theme");if(E==="light"||E==="dark")return E;for(let A=this.el;A&&A.nodeType===1;A=A.parentElement){let M=/rgba?\(([^)]+)\)/.exec(getComputedStyle(A).backgroundColor||"");if(!M)continue;let[I,R,N,k=1]=M[1].split(/[ ,/]+/).map(parseFloat);if(k>.5)return(.2126*I+.7152*R+.0722*N)/255>.5?"light":"dark"}return"light"}setVisible(x){x!==this.visible&&(this.visible=x,clearTimeout(this.freeTimer),x?(this.retries=0,this.last=0,this.state==="off"?this.boot():this.invalidate()):(this.hiddenAt=performance.now(),this.freeTimer=setTimeout(()=>{this.visible||this.release()},i.disposeMs)))}size(){return{w:Math.round(this.el.clientWidth),h:Math.round(this.el.clientHeight)}}boot(){this.state!=="off"||this.dead||!o().webgl2||!Ol[this.mode]||navigator.connection?.saveData||(this.state="booting",w=w.then(()=>this.build()).catch(()=>{this.teardown(),this.state="off"}))}async build(){await S();let{w:x,h:E}=this.size();if(this.dead||!this.visible||x<2||E<2){this.state="off";return}if(!g()){this.state="off",this.waiting=!0;return}this.waiting=!1;let A=o(),M=this.pixelRatio(x,E),I=!A.software&&x*E*M*M<22e5,R=document.createElement("canvas");R.setAttribute("aria-hidden","true"),R.style.cssText="position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;opacity:0;"+(r()?"":"transition:opacity .25s linear;");let N={alpha:!0,depth:!0,stencil:!1,antialias:I,premultipliedAlpha:!0,preserveDrawingBuffer:!1,powerPreference:"default"},k=R.getContext("webgl2",N);if(!k){this.state="off";return}this.onLost=H=>{H.preventDefault(),this.lost()},R.addEventListener("webglcontextlost",this.onLost),this.canvas=R,this.gl=k;let B=new Wa({canvas:R,context:k,...N});B.debug.checkShaderErrors=!!window.__v3dDebug,B.outputColorSpace=De,B.toneMapping=Es,B.toneMappingExposure=Ze.exposure,B.setClearColor(0,0),B.setPixelRatio(M),B.setSize(x,E,!1),this.renderer=B,this.pr=M,this.w=x,this.h=E,this.el.appendChild(R),this.world=new Ol[this.mode](this,B),this.world.resize(x,E,M),this.world.update(0);try{await B.compileAsync(this.world.scene,this.world.camera)}catch{}if(!(this.dead||!this.world)){if(this.state="live",this.pendingRebuild){this.pendingRebuild=!1,this.rebuild();return}this.visible||(clearTimeout(this.freeTimer),this.freeTimer=setTimeout(()=>{this.visible||this.release()},i.disposeMs)),this.first=!0,this.dirty=!0,this.last=0,e.add(this),p(),l.on&&this.pollPointer(),u()}}pixelRatio(x,E){let A=parseFloat(this.el.dataset.dpr)||i.maxDPR,M=o().software?1:Math.min(window.devicePixelRatio||1,A);return Math.max(.5,Math.min(M,Math.sqrt(i.maxPixels/Math.max(1,x*E))))}pollPointer(){if(!this.world||r())return;let x=this.mode==="seal",A=(x?this.el:this.el.closest("section,[data-section],[data-v3d-section]")||this.el.parentElement||this.el).getBoundingClientRect(),M=x?24:0,I=l.on&&l.x>=A.left-M&&l.x<=A.right+M&&l.y>=A.top-M&&l.y<=A.bottom+M,R=I?Math.max(-1,Math.min(1,(l.x-(A.left+A.right)/2)/(A.width/2||1))):0,N=I?Math.max(-1,Math.min(1,(l.y-(A.top+A.bottom)/2)/(A.height/2||1))):0;this.world.setPointer(R,N,I)}tick(x){if(this.state!=="live"||!this.visible||!this.world)return!1;let E=this.world;E.rm=r();let A=E.fps();if(A&&o().software&&(A=Math.min(A,20)),this.frozen&&(A=0),!A&&!this.dirty)return!1;if(A&&!this.dirty&&this.last&&x-this.last<1e3/A-2)return!0;let M=this.last?(x-this.last)/1e3:1/60;M>.25&&(M=1/60),M=Math.min(M,.1),this.last=x,E.update(this.frozen?0:M);let I=performance.now();if(this.renderer.render(E.scene,E.camera),this.ms+=performance.now()-I,this.frames++,this.dirty=!1,this.first){this.first=!1;let R=this.canvas;requestAnimationFrame(()=>{this.canvas===R&&(R.style.opacity="1",this.el.classList.add("v3d-live"))})}return!this.frozen&&E.fps()>0}resize(){let{w:x,h:E}=this.size();if(!this.world&&x>=2&&E>=2&&this.visible&&this.state==="off"){this.boot();return}if(!this.world||x<2||E<2||x===this.w&&E===this.h)return;let A=this.pixelRatio(x,E);this.w=x,this.h=E,this.pr=A,this.renderer.setPixelRatio(A),this.renderer.setSize(x,E,!1),this.world.resize(x,E,A),this.state==="live"&&(this.renderer.render(this.world.scene,this.world.camera),this.invalidate())}teardown(x=!0){this.onLost&&this.canvas&&this.canvas.removeEventListener("webglcontextlost",this.onLost),e.delete(this);try{this.world?.dispose()}catch{}try{this.renderer?.dispose()}catch{}try{x&&this.gl?.getExtension("WEBGL_lose_context")?.loseContext()}catch{}this.canvas?.remove(),this.world=this.renderer=this.canvas=this.gl=null,this.el.classList.remove("v3d-live")}release(){if(this.state!=="booting"){this.teardown(),this.state="off";for(let x of t.values())if(x.waiting&&x.visible&&x!==this){x.waiting=!1,x.boot();break}}}lost(){this.teardown(!1),this.state="off",this.visible&&this.retries<2&&(this.retries++,clearTimeout(this.retryTimer),this.retryTimer=setTimeout(()=>{this.visible&&!this.dead&&this.boot()},4e3*this.retries))}rebuild(){let x=this.visible;if(this.mode=this.el.dataset.v3d,this.tone=this.el.dataset.tone==="ink"?"ink":"rose",this.state==="booting"){this.pendingRebuild=!0;return}this.release(),x&&this.boot()}onAttr(x){if(x==="data-v3d"||x==="data-tone"||x==="data-framing"){this.rebuild();return}this.world&&(x==="data-value"&&this.world.setValue&&this.world.setValue(this.value()),x==="data-state"&&this.world.setState&&this.world.setState(this.el.dataset.state),this.invalidate())}themeChanged(){let x=this.readTheme();x!==this.theme&&(this.theme=x,this.world?.setTheme&&(this.world.setTheme(x,r()),this.invalidate()))}destroy(){this.dead=!0,clearTimeout(this.freeTimer),clearTimeout(this.retryTimer),b?.unobserve(this.el),T?.unobserve(this.el),this.teardown(),t.delete(this.el)}}let b=typeof IntersectionObserver=="function"?new IntersectionObserver(_=>{for(let x of _)t.get(x.target)?.setVisible(x.isIntersecting)},{rootMargin:"48px"}):null,T=typeof ResizeObserver=="function"?new ResizeObserver(_=>{for(let x of _)t.get(x.target)?.resize()}):null;function y(){document.querySelectorAll(n).forEach(_=>{t.has(_)||t.set(_,new d(_))});for(let[_,x]of t)!_.isConnected||!_.hasAttribute("data-v3d")?x.destroy():x.canvas&&x.canvas.parentNode!==_&&_.appendChild(x.canvas)}new MutationObserver(_=>{let x=!1,E=!1;for(let A of _)if(A.type==="childList"){for(let M of A.addedNodes)if(M.nodeType===1&&M.nodeName!=="CANVAS"){x=!0;break}for(let M of A.removedNodes)if(M.nodeType===1){x=!0;break}}else A.attributeName==="data-theme"?E=!0:(A.attributeName==="data-v3d"&&(x=!0),t.get(A.target)?.onAttr(A.attributeName));if(x&&y(),E)for(let A of t.values())A.themeChanged()}).observe(document.documentElement,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["data-v3d","data-value","data-state","data-tone","data-framing","data-theme"]}),s?.addEventListener?.("change",()=>{for(let _ of e)_.world.rm=r(),_.invalidate()}),window.VeroV3D={version:"1.0.0",config:i,scan:y,state:_=>t.get(_)?.state||"none",seek(_,x){let E=t.get(_);E&&(E.frozen=x!=null,x!=null&&(E.mem.age=x),E.last=0,E.invalidate())},stats:()=>({elements:t.size,contexts:e.size}),inspect(_){let x=t.get(_);return x&&{state:x.state,frames:x.frames,ms:x.ms,shown:x.mem.shown,earn:x.mem.earn,age:x.mem.age,theme:x.theme}}},y(),document.readyState==="loading"&&document.addEventListener("DOMContentLoaded",y,{once:!0})})();})();
