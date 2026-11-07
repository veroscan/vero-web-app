/**
 * Runs in <head> before first paint (inline, so no request): marks the document as script-enabled,
 * skips the intro loader when this tab has seen it, and picks up the page-transition hand-over
 * the previous page left in sessionStorage.
 */
export const PRE_HYDRATION_SCRIPT = `(function(){var r=document.documentElement;r.classList.add('js');try{if(sessionStorage.getItem('pd-seen'))r.classList.add('no-loader');var t=sessionStorage.getItem('pd-trans');if(t){r.classList.add('is-entering');window.__pdTrans=t;sessionStorage.removeItem('pd-trans')}}catch(e){}})()`;
