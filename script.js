
/* Immediate opening action: defined before the page is interactive. */
window.openWeddingInvitationDirect = function(){
  var screen=document.getElementById("welcomeScreen");
  var transition=document.getElementById("openingTransition");
  var chime=document.getElementById("openChime");
  var audio=document.getElementById("weddingAudio");
  var sound=document.getElementById("sound");

  if(screen){ screen.classList.add("opening-now"); }

  /* IMPORTANT: start background audio NOW, inside the user's click gesture.
     Mobile Safari/Chrome may block play() if it is delayed with setTimeout. */
  try{
    if(audio){
      audio.volume=0.12;
      var bg=audio.play();
      if(bg && bg.then){
        bg.then(function(){
          if(sound){ sound.textContent="Ⅱ"; sound.classList.add("is-playing"); }
        }).catch(function(){
          if(sound){ sound.textContent="♫"; sound.classList.remove("is-playing"); }
        });
      }
    }
  }catch(e){}

  try{
    if(chime){
      chime.currentTime=0;
      chime.volume=0.52;
      var cp=chime.play();
      if(cp && cp.catch){ cp.catch(function(){}); }
    }
  }catch(e){}

  if(transition){
    transition.classList.add("is-active");
    transition.setAttribute("aria-hidden","false");
  }

  setTimeout(function(){
    if(screen){
      screen.classList.add("is-hidden");
      screen.setAttribute("aria-hidden","true");
    }
    document.documentElement.style.overflowY="auto";
    document.body.style.overflowY="auto";
  }, 650);

  setTimeout(function(){
    if(transition){
      transition.classList.remove("is-active");
      transition.setAttribute("aria-hidden","true");
    }
    if(audio && !audio.paused){
      /* soft fade up after the opening animation */
      var target=.42;
      var step=0;
      var fade=setInterval(function(){
        step++;
        audio.volume=Math.min(target, .12 + step*.03);
        if(audio.volume>=target || step>12) clearInterval(fade);
      },70);
    }
  }, 3000);
};




/* ROBUST COUNTDOWN — 17 October 2026, 12:00 Kyiv time. */
(function(){
  const target = new Date(Date.UTC(2026, 9, 17, 9, 0, 0)).getTime();
  const els = {
    d: document.getElementById("d"),
    h: document.getElementById("h"),
    m: document.getElementById("m"),
    s: document.getElementById("s")
  };
  function set(el, value){ if(el) el.textContent = String(value).padStart(2,"0"); }
  function tick(){
    let diff = target - Date.now();
    if(!Number.isFinite(diff)) diff = 0;
    if(diff < 0) diff = 0;
    set(els.d, Math.floor(diff / 86400000));
    set(els.h, Math.floor((diff % 86400000) / 3600000));
    set(els.m, Math.floor((diff % 3600000) / 60000));
    set(els.s, Math.floor((diff % 60000) / 1000));
  }
  tick();
  setInterval(tick, 1000);
  window.updateWeddingCountdown = tick;
})();

const formEl=document.getElementById("form");
const successEl=document.getElementById("success");

function validateRequiredGroups(){
  let ok=true;
  document.querySelectorAll("[data-required-group]").forEach(function(group){
    const checked=group.querySelectorAll('input[type="checkbox"]:checked').length;
    const error=group.querySelector(".group-error");
    if(checked<1){
      group.classList.add("has-error");
      if(error) error.style.display="block";
      ok=false;
    }else{
      group.classList.remove("has-error");
      if(error) error.style.display="none";
    }
  });
  return ok;
}

document.querySelectorAll("[data-required-group] input[type='checkbox']").forEach(function(cb){
  cb.addEventListener("change", validateRequiredGroups);
});

if(formEl){
  formEl.addEventListener("submit", async (e)=>{
    e.preventDefault();

    if(!formEl.reportValidity()) return;
    if(!validateRequiredGroups()){
      const bad=document.querySelector("[data-required-group].has-error");
      if(bad) bad.scrollIntoView({behavior:"smooth",block:"center"});
      return;
    }

    const button=formEl.querySelector('button[type="submit"]');
    if(button){
      button.disabled=true;
      button.dataset.oldText=button.textContent;
      button.textContent="НАДСИЛАЄМО...";
    }

    try{
      const response=await fetch(formEl.action,{
        method:"POST",
        body:new FormData(formEl),
        headers:{Accept:"application/json"}
      });
      if(response.ok){
        if(successEl) successEl.style.display="block";
        formEl.reset();
        validateRequiredGroups();
      }else{
        alert("Не вдалося надіслати відповідь. Спробуйте ще раз.");
      }
    }catch(err){
      alert("Немає з'єднання. Перевірте інтернет і спробуйте ще раз.");
    }finally{
      if(button){
        button.disabled=false;
        button.textContent=button.dataset.oldText || "НАДІСЛАТИ ВІДПОВІДЬ ♡";
      }
    }
  });
}

/* Reliable music — mobile/browser friendly. */
const weddingAudio = document.getElementById("weddingAudio");
const soundBtn = document.getElementById("sound");

function syncSoundButton(){
  if(!soundBtn || !weddingAudio) return;
  soundBtn.textContent = weddingAudio.paused ? "♫" : "Ⅱ";
  soundBtn.classList.toggle("is-playing", !weddingAudio.paused);
}

async function startMelody(volume=0.38){
  if(!weddingAudio) return false;
  try{
    weddingAudio.volume = volume;
    await weddingAudio.play();
    syncSoundButton();
    return true;
  }catch(err){
    syncSoundButton();
    return false;
  }
}

function stopMelody(){
  if(!weddingAudio) return;
  weddingAudio.pause();
  syncSoundButton();
}

if(weddingAudio){
  weddingAudio.addEventListener("play", syncSoundButton);
  weddingAudio.addEventListener("pause", syncSoundButton);
  weddingAudio.addEventListener("ended", syncSoundButton);
  weddingAudio.addEventListener("canplay", syncSoundButton);
}

if(soundBtn){
  soundBtn.addEventListener("click", async function(e){
    e.preventDefault();
    e.stopPropagation();
    if(!weddingAudio) return;
    if(weddingAudio.paused) await startMelody(0.42);
    else stopMelody();
  }, false);
}
syncSoundButton();

/* Opening screen + music after explicit user gesture */
const welcomeScreen=document.getElementById("welcomeScreen");
const openInvitation=document.getElementById("openInvitation");
function openWeddingInvitation(e){
  if(e){ e.preventDefault(); e.stopPropagation(); }
  window.openWeddingInvitationDirect();
  setTimeout(function(){
    var inv=document.getElementById("invitation");
    if(inv) inv.scrollIntoView({behavior:"smooth",block:"start"});
  },100);
  return false;
}
if(openInvitation){
  openInvitation.addEventListener("click",openWeddingInvitation,false);
}
/* Always show the opening invitation on a fresh page load. */
if(welcomeScreen){
  welcomeScreen.classList.remove("is-hidden");
  welcomeScreen.removeAttribute("aria-hidden");
}

/* Gentle reveal animations, without changing content or photo order. */
const revealTargets=[
  ...document.querySelectorAll("main section, .section-head, .story, .timeline, .venue, .couple-gallery, .gallery, .closing-card, .final .wrap")
];
revealTargets.forEach((el,i)=>{
  el.classList.add("reveal-on-scroll");
  if(i%4===1) el.classList.add("delay-1");
  if(i%4===2) el.classList.add("delay-2");
  if(i%4===3) el.classList.add("delay-3");
});
if("IntersectionObserver" in window){
  const io=new IntersectionObserver((entries)=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add("revealed");io.unobserve(entry.target)}
  }),{threshold:.12,rootMargin:"0px 0px -40px 0px"});
  revealTargets.forEach(el=>io.observe(el));
}else revealTargets.forEach(el=>el.classList.add("revealed"));




(function(){
  const track=document.getElementById('venueTrack');
  const dots=[...document.querySelectorAll('#venueDots button')];
  const prev=document.querySelector('.venue-prev');
  const next=document.querySelector('.venue-next');
  if(!track || !prev || !next) return;
  let index=0;
  const slides=[...track.children];
  const count=slides.length;
  const show=(i)=>{
    if(!count) return;
    index=(i+count)%count;
    track.style.opacity='0.45';requestAnimationFrame(()=>{track.style.transform='translate3d(-'+(index*100)+'%,0,0)';setTimeout(()=>{track.style.opacity='1'},160);});
    dots.forEach((d,n)=>d.classList.toggle('active',n===index));
  };
  prev.onclick=()=>show(index-1);
  next.onclick=()=>show(index+1);
  dots.forEach((d,n)=>d.onclick=()=>show(n));
  let startX=0;
  track.addEventListener('touchstart',e=>{startX=e.touches[0].clientX},{passive:true});
  track.addEventListener('touchend',e=>{
    const dx=e.changedTouches[0].clientX-startX;
    if(Math.abs(dx)>40) show(index+(dx<0?1:-1));
  },{passive:true});
  show(0);
})();


document.addEventListener("DOMContentLoaded", function(){
  const openBtn = document.getElementById("openInvitation");
  if(openBtn){
    openBtn.addEventListener("click", function(e){
      e.preventDefault();
      window.openWeddingInvitationDirect();
    });
  }
});


/* Small premium interactions */
document.addEventListener("DOMContentLoaded", function(){
  const track=document.getElementById("venueTrack");
  if(track) track.style.transition="transform .6s cubic-bezier(.2,.7,.2,1), opacity .25s ease";

  document.querySelectorAll(".event").forEach((ev,i)=>{
    ev.style.transitionDelay=(i*90)+"ms";
  });

  const form=document.getElementById("form");
  if(form){
    form.querySelectorAll("input,select").forEach(field=>{
      field.addEventListener("focus",()=>field.closest(".form-field")?.classList.add("is-active"));
      field.addEventListener("blur",()=>field.closest(".form-field")?.classList.remove("is-active"));
    });
  }
});
