(function(){
  const body=document.body;
  const home=document.querySelector("#home");
  const resumeLink=document.querySelector("#resume-link");
  const articles=[...document.querySelectorAll(".chapter")];
  function consolidateR143Steps(){
    const r143Row=document.querySelector('[data-source-id="c10-node-084"]');
    if(!r143Row)return;
    const steps=[...r143Row.querySelectorAll(".step-item")];
    steps.slice(3).forEach(function(step){
      const number=step.querySelector(".step-number");
      if(number)number.remove();
      step.classList.add("r143-eternity-segment");
    });
  }
  consolidateR143Steps();
  const articlesByRoute=new Map(articles.map(function(article){return [article.dataset.route,article];}));
  const articleTexts=articles.map(function(article){return article.textContent.replace(/\s+/g," ").trim();});
  const chapterLinks=[...document.querySelectorAll(".chapter-link")];
  const legacyRoutes=new Map([...document.querySelectorAll("#legacy-routes [data-old]")].map(function(item){
    return [item.dataset.old,{route:item.dataset.route,target:item.dataset.target}];
  }));
  const sidebarReadingProgress=document.querySelector("#sidebar-reading-progress");
  const search=document.querySelector("#guide-search");
  const status=document.querySelector("#search-status");
  const searchReturn=document.querySelector("#search-return");
  const results=document.querySelector("#search-results");
  const menu=document.querySelector("#menu-button");
  const backdrop=document.querySelector("#sidebar-backdrop");
  const sidebarToggle=document.querySelector("#sidebar-toggle");
  const themeToggle=document.querySelector("#theme-toggle");
  const glossaryDialog=document.querySelector("#glossary-dialog");
  const glossaryTriggers=[...document.querySelectorAll(".glossary-trigger")];
  const glossaryCloseButtons=[...document.querySelectorAll("[data-glossary-close]")];
  const railProgress=document.querySelector("#progress-bar");
  const progressLabel=document.querySelector("#progress-label");
  const toast=document.querySelector("#copy-toast");
  const readingKey="ad-guide-reading-v2";
  const legacyReadingKey="ad-guide-reading-v1";
  const sidebarKey="ad-guide-sidebar-collapsed-v1";
  const themeKey="ad-guide-theme-v1";
  let current=0, currentRoute="", toastTimer=null, searchTimer=null, readingTimer=null, resumePosition=null, glossaryReturnFocus=null, searchReturnPosition=null;
  let copyPreview=null, copyPreviewTarget=null, copyPreviewDescriptionTarget=null;

  function decodedFragment(){
    try{return decodeURIComponent(location.hash.slice(1));}catch(error){return location.hash.slice(1);}
  }
  function resolveHash(){
    const fragment=decodedFragment();
    if(!fragment)return {route:"",target:"",legacy:false};
    if(articlesByRoute.has(fragment))return {route:fragment,target:fragment,legacy:false};
    const legacy=legacyRoutes.get(fragment);
    if(legacy)return {route:legacy.route,target:legacy.target,legacy:true};
    const target=document.getElementById(fragment);
    const article=target&&target.closest(".chapter");
    return article?{route:article.dataset.route,target:fragment,legacy:false}:{route:"",target:"",legacy:false};
  }
  function closeMenu(){
    body.classList.remove("menu-open");
    menu.setAttribute("aria-expanded","false");
  }
  function setGlossaryExpanded(expanded){
    glossaryTriggers.forEach(function(trigger){
      trigger.setAttribute("aria-expanded",String(expanded));
    });
  }
  function openGlossary(event){
    glossaryReturnFocus=event.currentTarget;
    closeMenu();
    glossaryDialog.hidden=false;
    body.classList.add("glossary-open");
    setGlossaryExpanded(true);
    const close=glossaryDialog.querySelector(".glossary-close");
    if(close)close.focus();
  }
  function closeGlossary(){
    if(glossaryDialog.hidden)return;
    glossaryDialog.hidden=true;
    body.classList.remove("glossary-open");
    setGlossaryExpanded(false);
    if(glossaryReturnFocus&&document.contains(glossaryReturnFocus))glossaryReturnFocus.focus();
    glossaryReturnFocus=null;
  }
  function storedValue(key){
    try{return localStorage.getItem(key);}catch(error){return null;}
  }
  function setSidebarCollapsed(collapsed){
    document.documentElement.classList.toggle("sidebar-collapsed",collapsed);
    sidebarToggle.setAttribute("aria-expanded",String(!collapsed));
    sidebarToggle.setAttribute("aria-label",collapsed?"展开目录":"收起目录");
    sidebarToggle.title=collapsed?"展开目录":"收起目录";
    sidebarToggle.querySelector("i").className="ph "+(collapsed?"ph-caret-right":"ph-caret-left");
  }
  function setTheme(theme){
    const light=theme==="light";
    document.documentElement.dataset.theme=light?"light":"dark";
    themeToggle.setAttribute("aria-label",light?"切换到黑暗模式":"切换到亮色模式");
    themeToggle.title=light?"切换到黑暗模式":"切换到亮色模式";
    themeToggle.querySelector("i").className="ph "+(light?"ph-moon":"ph-sun");
    themeToggle.querySelector("span").textContent=light?"黑暗模式":"亮色模式";
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.content=light?"#f3f7f5":"#07141d";
  }
  function readPosition(){
    try{
      const saved=JSON.parse(localStorage.getItem(readingKey));
      if(saved&&articlesByRoute.has(saved.route)&&Number.isFinite(saved.scrollY))return saved;
      const old=JSON.parse(localStorage.getItem(legacyReadingKey));
      if(!old||!Number.isInteger(old.chapter)||!Number.isFinite(old.scrollY))return null;
      const mapped=legacyRoutes.get("c"+old.chapter);
      if(!mapped)return null;
      if(old.chapter<=11)return {version:2,route:mapped.route,section:mapped.target,scrollY:0,anchorOnly:true};
      return {version:2,route:mapped.route,scrollY:Math.max(0,old.scrollY)};
    }catch(error){return null;}
  }
  function savePosition(){
    if(current<1||!currentRoute)return;
    const position={version:2,route:currentRoute,scrollY:Math.max(0,window.scrollY)};
    try{localStorage.setItem(readingKey,JSON.stringify(position));}catch(error){}
  }
  function queuePositionSave(){
    clearTimeout(readingTimer);
    readingTimer=setTimeout(savePosition,160);
  }
  function updateResume(saved){
    const valid=saved&&articlesByRoute.has(saved.route);
    resumePosition=valid?saved:null;
    resumeLink.hidden=!valid;
    if(!valid)return;
    const article=articlesByRoute.get(saved.route);
    const number=Number(article.dataset.chapter);
    resumeLink.href="#"+(saved.section||saved.route);
    resumeLink.querySelector("span").textContent="继续第 "+String(number).padStart(2,"0")+" 章 · "+article.dataset.title;
  }
  function setChapter(route,keepScroll){
    if(route!==currentRoute&&current>0)savePosition();
    hideCopyPreview();
    const article=articlesByRoute.get(route);
    current=article?Number(article.dataset.chapter):0;
    currentRoute=article?route:"";
    const isHome=!article;
    home.hidden=!isHome;
    sidebarReadingProgress.hidden=isHome;
    body.classList.toggle("home-view",isHome);
    articles.forEach(function(item){item.hidden=item!==article;});
    chapterLinks.forEach(function(link){
      const active=link.dataset.route===currentRoute;
      link.classList.toggle("active",active);
      if(active)link.setAttribute("aria-current","page");else link.removeAttribute("aria-current");
    });
    if(isHome){
      updateResume(readPosition());
      document.title="AD Guide";
    }else{
      document.title=article.dataset.title+" · AD Guide";
    }
    closeMenu();
    if(!keepScroll)window.scrollTo({top:0,behavior:"auto"});
    updateProgress();
  }
  function updateProgress(){
    if(current===0){railProgress.style.width="0";progressLabel.value="0%";return;}
    const article=articlesByRoute.get(currentRoute);
    if(!article)return;
    const rect=article.getBoundingClientRect();
    const scrollable=Math.max(1,article.offsetHeight-window.innerHeight);
    const passed=Math.min(scrollable,Math.max(0,-rect.top));
    const value=Math.round(passed/scrollable*100);
    railProgress.style.width=value+"%";
    progressLabel.value=value+"%";
  }
  function searchExcerpt(text,q){
    const clean=text.replace(/\s+/g," ").trim();
    const lower=clean.toLocaleLowerCase("zh-CN");
    const index=lower.indexOf(q);
    if(index<0)return clean.slice(0,86);
    const start=Math.max(0,index-30),end=Math.min(clean.length,index+q.length+55);
    return (start?"…":"")+clean.slice(start,end)+(end<clean.length?"…":"");
  }
  function appendHighlighted(container,text,q){
    const lower=text.toLocaleLowerCase("zh-CN");
    let offset=0,index=lower.indexOf(q);
    while(q&&index>=0){
      if(index>offset)container.append(document.createTextNode(text.slice(offset,index)));
      const mark=document.createElement("mark");
      mark.textContent=text.slice(index,index+q.length);
      container.append(mark);
      offset=index+q.length;
      index=lower.indexOf(q,offset);
    }
    if(offset<text.length)container.append(document.createTextNode(text.slice(offset)));
  }
  function searchTarget(article,q){
    const candidates=[...article.querySelectorAll("h1,h2,h3,p,li,tr,pre")];
    return candidates.find(function(element){
      return element.textContent.replace(/\s+/g," ").toLocaleLowerCase("zh-CN").includes(q);
    })||null;
  }
  function jumpToSearchResult(match,event){
    event.preventDefault();
    rememberSearchReturn();
    const route=articles[match.index].dataset.route;
    const target=match.target;
    const scroll=function(){
      if(target)target.scrollIntoView({block:"start"});else window.scrollTo({top:0,behavior:"auto"});
      updateProgress();
    };
    history.pushState(null,"","#"+route);
    if(route!==currentRoute){
      setChapter(route,false);
      setTimeout(scroll,0);
    }else{
      scroll();
    }
  }
  function updateSearchReturn(){
    searchReturn.hidden=!searchReturnPosition;
  }
  function rememberSearchReturn(){
    if(searchReturnPosition)return;
    searchReturnPosition={route:currentRoute,hash:location.hash,scrollY:Math.max(0,window.scrollY)};
    updateSearchReturn();
  }
  function restoreSearchReturn(){
    if(!searchReturnPosition)return;
    const position=searchReturnPosition;
    searchReturnPosition=null;
    updateSearchReturn();
    history.pushState(null,"",position.hash||"#home");
    setChapter(position.route,true);
    setTimeout(function(){window.scrollTo({top:position.scrollY,behavior:"auto"});updateProgress();},0);
  }
  function runSearch(){
    const q=search.value.trim().toLocaleLowerCase("zh-CN");
    if(!q&&searchReturnPosition){searchReturnPosition=null;updateSearchReturn();}
    const matches=[];
    chapterLinks.forEach(function(link,index){
      const articleText=articleTexts[index];
      const hay=(link.innerText+" "+articleText).toLocaleLowerCase("zh-CN");
      const show=!q||hay.includes(q);
      link.hidden=!show;
      if(q&&show)matches.push({link:link,index:index,text:articleText,target:searchTarget(articles[index],q)});
    });
    status.textContent=q?matches.length+" 个章节匹配":"";
    results.replaceChildren();
    results.hidden=!q;
    matches.slice(0,8).forEach(function(match){
      const item=document.createElement("a");
      item.className="search-result";
      item.href="#"+articles[match.index].dataset.route;
      const title=document.createElement("span");
      title.className="search-result-title";
      const number=document.createElement("em");
      number.textContent=String(match.index+1).padStart(2,"0");
      const label=document.createElement("span");
      appendHighlighted(label,articles[match.index].dataset.title,q);
      title.append(number,label);
      const snippet=document.createElement("span");
      snippet.className="search-result-snippet";
      appendHighlighted(snippet,searchExcerpt(match.text,q),q);
      item.append(title,snippet);
      item.addEventListener("click",function(event){jumpToSearchResult(match,event);});
      results.appendChild(item);
    });
  }
  async function copyCode(button){
    const code=button.closest(".code-card").querySelector("code").innerText;
    try{
      await navigator.clipboard.writeText(code);
    }catch(error){
      const area=document.createElement("textarea");
      area.value=code;area.style.position="fixed";area.style.opacity="0";document.body.appendChild(area);area.select();document.execCommand("copy");area.remove();
    }
    button.classList.add("copied");
    button.querySelector("span").textContent="已复制";
    clearTimeout(toastTimer);toast.classList.add("show");
    toastTimer=setTimeout(function(){toast.classList.remove("show");button.classList.remove("copied");button.querySelector("span").textContent="复制";},1700);
  }
  async function copyInlineText(el){
    const code=el.dataset.copy || el.innerText;
    try{await navigator.clipboard.writeText(code);}catch(error){
      const area=document.createElement("textarea"); area.value=code; area.style.position="fixed"; area.style.opacity="0"; document.body.appendChild(area); area.select(); document.execCommand("copy"); area.remove();
    }
    el.classList.add("copied"); clearTimeout(toastTimer); toast.classList.add("show");
    setTimeout(function(){el.classList.remove("copied"); toast.classList.remove("show");},1700);
  }
  function copyPreviewValue(el){return (el.dataset.copy || el.innerText || "").trim();}
  function ensureCopyPreview(){
    if(copyPreview)return copyPreview;
    copyPreview=document.createElement("div");
    copyPreview.id="copy-tree-preview";
    copyPreview.className="copy-tree-preview";
    copyPreview.setAttribute("role","tooltip");
    copyPreview.setAttribute("aria-hidden","true");
    document.body.appendChild(copyPreview);
    return copyPreview;
  }
  function clearCopyPreviewDescription(){
    if(!copyPreviewDescriptionTarget)return;
    const describedBy=copyPreviewDescriptionTarget.getAttribute("aria-describedby");
    if(describedBy){
      const remaining=describedBy.split(/\s+/).filter(function(token){return token&&token!=="copy-tree-preview";});
      if(remaining.length)copyPreviewDescriptionTarget.setAttribute("aria-describedby",remaining.join(" "));
      else copyPreviewDescriptionTarget.removeAttribute("aria-describedby");
    }
    copyPreviewDescriptionTarget=null;
  }
  function updateCopyPreviewPosition(){
    if(!copyPreview || !copyPreviewTarget || !copyPreview.classList.contains("show"))return;
    if(!copyPreviewTarget.isConnected){hideCopyPreview();return;}
    const targetRect=copyPreviewTarget.getBoundingClientRect();
    if(!targetRect.width&&!targetRect.height){hideCopyPreview();return;}
    const margin=8,gap=9;
    const viewportWidth=Math.max(document.documentElement.clientWidth,window.innerWidth||0);
    const viewportHeight=Math.max(document.documentElement.clientHeight,window.innerHeight||0);
    if(targetRect.bottom<0||targetRect.top>viewportHeight||targetRect.right<0||targetRect.left>viewportWidth){hideCopyPreview();return;}
    const previewRect=copyPreview.getBoundingClientRect();
    let left=targetRect.left+(targetRect.width-previewRect.width)/2;
    let top=targetRect.bottom+gap;
    if(top+previewRect.height>viewportHeight-margin&&targetRect.top-gap-previewRect.height>=margin){
      top=targetRect.top-gap-previewRect.height;
    }
    const maxLeft=Math.max(margin,viewportWidth-previewRect.width-margin);
    const maxTop=Math.max(margin,viewportHeight-previewRect.height-margin);
    left=Math.min(Math.max(margin,left),maxLeft);
    top=Math.min(Math.max(margin,top),maxTop);
    copyPreview.style.left=Math.round(left)+"px";
    copyPreview.style.top=Math.round(top)+"px";
  }
  function showCopyPreview(el,fromFocus){
    const value=copyPreviewValue(el);
    if(!value)return;
    if(copyPreviewDescriptionTarget&&copyPreviewDescriptionTarget!==el)clearCopyPreviewDescription();
    const preview=ensureCopyPreview();
    preview.textContent=value;
    copyPreviewTarget=el;
    preview.setAttribute("aria-hidden","false");
    preview.classList.add("show");
    if(fromFocus){
      const describedBy=el.getAttribute("aria-describedby")||"";
      const tokens=describedBy.split(/\s+/).filter(Boolean);
      if(!tokens.includes("copy-tree-preview"))tokens.push("copy-tree-preview");
      el.setAttribute("aria-describedby",tokens.join(" "));
      copyPreviewDescriptionTarget=el;
    }
    updateCopyPreviewPosition();
  }
  function hideCopyPreview(target){
    if(target&&copyPreviewTarget&&target!==copyPreviewTarget)return;
    clearCopyPreviewDescription();
    if(!copyPreview)return;
    copyPreview.classList.remove("show");
    copyPreview.setAttribute("aria-hidden","true");
    copyPreviewTarget=null;
  }
  function bindCopyPreviewTargets(){
    document.querySelectorAll(".inline-copy-text[data-copy]").forEach(function(target){
      target.addEventListener("pointerenter",function(event){
        if(event.pointerType!=="touch")showCopyPreview(target,false);
      });
      target.addEventListener("pointerleave",function(){hideCopyPreview(target);});
      target.addEventListener("focusin",function(){showCopyPreview(target,true);});
      target.addEventListener("focusout",function(event){
        if(event.relatedTarget&&target.contains(event.relatedTarget))return;
        hideCopyPreview(target);
      });
    });
  }
  function inlineTarget(event){return event.target && event.target.closest ? event.target.closest(".inline-copy-text") : null;}
  function handleInlineCopy(event){
    const inline=inlineTarget(event); if(!inline)return;
    if(event.type==="touchend" || event.type==="pointerup")event.preventDefault();
    if(inline.dataset.copyBusy==="1")return;
    inline.dataset.copyBusy="1"; copyInlineText(inline);
    setTimeout(function(){inline.dataset.copyBusy="0";},600);
  }
  document.addEventListener("click",function(event){
    const inline=inlineTarget(event);
    if(inline){handleInlineCopy(event); return;}
    const button=event.target.closest(".copy-button");
    if(button)copyCode(button);
  });
  document.addEventListener("touchend",handleInlineCopy,{passive:false});
  document.addEventListener("pointerup",handleInlineCopy,{passive:false});
  document.addEventListener("keydown",function(event){
    const inline=event.target.closest(".inline-copy-text");
    if(inline && (event.key==="Enter" || event.key===" ")){event.preventDefault(); copyInlineText(inline);}
  });
  menu.addEventListener("click",function(){const open=body.classList.toggle("menu-open");menu.setAttribute("aria-expanded",String(open));});
  backdrop.addEventListener("click",closeMenu);
  chapterLinks.forEach(function(link){
    link.addEventListener("click",function(){link.blur();});
  });
  glossaryTriggers.forEach(function(trigger){trigger.addEventListener("click",openGlossary);});
  glossaryCloseButtons.forEach(function(button){button.addEventListener("click",closeGlossary);});
  sidebarToggle.addEventListener("click",function(){
    const collapsed=!document.documentElement.classList.contains("sidebar-collapsed");
    setSidebarCollapsed(collapsed);
    try{localStorage.setItem(sidebarKey,collapsed?"1":"0");}catch(error){}
  });
  themeToggle.addEventListener("click",function(){
    const theme=document.documentElement.dataset.theme==="light"?"dark":"light";
    setTheme(theme);
    try{localStorage.setItem(themeKey,theme);}catch(error){}
  });
  resumeLink.addEventListener("click",function(event){
    if(!resumePosition)return;
    event.preventDefault();
    const target=resumePosition.section||resumePosition.route;
    history.pushState(null,"","#"+target);
    setChapter(resumePosition.route,true);
    setTimeout(function(){
      if(resumePosition.anchorOnly){
        const section=document.getElementById(resumePosition.section);
        if(section)section.scrollIntoView({block:"start"});
      }else{
        window.scrollTo({top:resumePosition.scrollY,behavior:"auto"});
      }
    },0);
  });
  search.addEventListener("input",function(){clearTimeout(searchTimer);searchTimer=setTimeout(runSearch,120);});
  search.addEventListener("keydown",function(event){
    if(event.key==="Enter"){
      const first=results.querySelector(".search-result");
      if(first){event.preventDefault();first.click();}
    }
  });
  searchReturn.addEventListener("click",restoreSearchReturn);
  function isInteractiveElement(element){
    return Boolean(element&&element.closest("input,textarea,select,button,a,[contenteditable='true'],[role='button']"));
  }
  function changeChapter(offset){
    const route=resolveHash().route||currentRoute;
    const index=route?chapterLinks.findIndex(function(link){return link.dataset.route===route;}):-1;
    if(offset===-1&&index===0){location.hash="#home";return true;}
    const target=chapterLinks[index+offset];
    if(!target)return false;
    location.hash=target.getAttribute("href");
    return true;
  }
  document.addEventListener("keydown",function(event){
    if(event.key==="/"&&!/input|textarea/i.test(document.activeElement.tagName)){event.preventDefault();search.focus();}
    if(event.key==="Escape"){hideCopyPreview();closeGlossary();closeMenu();search.blur();}
    if((event.key==="ArrowLeft"||event.key==="ArrowRight")&&!event.defaultPrevented&&!event.altKey&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.isComposing&&!body.classList.contains("glossary-open")&&!body.classList.contains("menu-open")&&!isInteractiveElement(document.activeElement)){
      const offset=event.key==="ArrowLeft"?-1:1;
      if(changeChapter(offset))event.preventDefault();
    }
  });
  window.addEventListener("hashchange",function(){
    const resolved=resolveHash();
    const changed=resolved.route!==currentRoute;
    if(changed)setChapter(resolved.route,false);
    const target=document.getElementById(resolved.target);
    if(target&&resolved.target!==resolved.route)target.scrollIntoView({block:"start"});
    if(resolved.legacy)history.replaceState(null,"","#"+resolved.target);
  });
  window.addEventListener("scroll",function(){updateProgress();queuePositionSave();updateCopyPreviewPosition();},{passive:true});
  window.addEventListener("resize",function(){updateProgress();updateCopyPreviewPosition();});
  if(window.visualViewport)window.visualViewport.addEventListener("resize",updateCopyPreviewPosition);
  window.addEventListener("blur",hideCopyPreview);
  window.addEventListener("beforeunload",savePosition);
  setSidebarCollapsed(storedValue(sidebarKey)==="1");
  setTheme(storedValue(themeKey)==="light"?"light":"dark");
  const savedPosition=readPosition();
  updateResume(savedPosition);
  const initial=resolveHash();
  setChapter(initial.route,true);
  if(initial.legacy)history.replaceState(null,"","#"+initial.target);
  const initialTarget=document.getElementById(initial.target);
  const chapterOnlyHash=initial.route&&initial.target===initial.route;
  if(initial.route&&savedPosition&&savedPosition.route===initial.route&&chapterOnlyHash&&!savedPosition.anchorOnly){
    setTimeout(function(){window.scrollTo({top:savedPosition.scrollY,behavior:"auto"});},0);
  }else if(initialTarget){
    setTimeout(function(){initialTarget.scrollIntoView({block:"start"});},0);
  }
  bindCopyPreviewTargets();
})();
