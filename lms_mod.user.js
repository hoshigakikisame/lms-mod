// ==UserScript==
// @name         LMS Mod
// @namespace    http://tampermonkey.net/
// @version      2025-11-04
// @description  Floating menu tugas & mata kuliah (Polinema). Non-official. Modern UI.
// @author       ferdirianrk + naufal + claude
// @match        https://lmsslc.polinema.ac.id/*
// @icon         https://lmsslc.polinema.ac.id/theme/image.php/iomadboost/theme/1708847580/favicon
// @grant        none
// @run-at       document-end
// ==/UserScript==

(async function () {
    'use strict';

    let sessionKey;
    let tasks = [];
    let courses = [];

    const sessionExpCookieName = "lms_mod.sessionExp";
    const fontEnhancementCookieName = "lms_mod.fontEnhancement";

    function globalStyle() {
        const style = document.createElement("style");
        style.innerHTML = `
  :root {
    --lm-bg: #ffffff;
    --lm-fg: #1e293b;
    --lm-muted: #64748b;
    --lm-primary: #6366f1;
    --lm-primary-hover: #4f46e5;
    --lm-primary-fg: #ffffff;
    --lm-border: #e2e8f0;
    --lm-hover: #f8fafc;
    --lm-success: #10b981;
    --lm-shadow-sm: 0 1px 3px rgba(0,0,0,.08);
    --lm-shadow: 0 4px 16px rgba(0,0,0,.1);
    --lm-shadow-lg: 0 10px 40px rgba(0,0,0,.15);
    --lm-radius: 16px;
    --lm-radius-sm: 12px;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --lm-bg: #0f172a;
      --lm-fg: #f1f5f9;
      --lm-muted: #94a3b8;
      --lm-primary: #818cf8;
      --lm-primary-hover: #a5b4fc;
      --lm-primary-fg: #0f172a;
      --lm-border: #1e293b;
      --lm-hover: #1e293b;
      --lm-success: #34d399;
      --lm-shadow-sm: 0 1px 3px rgba(0,0,0,.3);
      --lm-shadow: 0 4px 16px rgba(0,0,0,.4);
      --lm-shadow-lg: 0 10px 40px rgba(0,0,0,.5);
    }
  }

  .hoverable {
    transition: all .2s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: var(--lm-radius-sm);
    cursor: pointer;
  }
  .hoverable:hover {
    background-color: var(--lm-hover);
    transform: translateX(4px);
  }
  .hoverable:active {
    transform: translateX(2px) scale(0.98);
  }

  .lms-card {
    background: var(--lm-bg);
    color: var(--lm-fg);
    border: 1px solid var(--lm-border);
    border-radius: var(--lm-radius);
    box-shadow: var(--lm-shadow-lg);
    overflow: hidden;
    backdrop-filter: blur(10px);
  }

  .lms-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    background: linear-gradient(135deg, var(--lm-primary) 0%, #7c3aed 100%);
    color: #fff;
    padding: 16px 20px;
    position: sticky;
    top: 0;
    z-index: 10;
    border-top-left-radius: var(--lm-radius);
    border-top-right-radius: var(--lm-radius);
    box-shadow: 0 2px 8px rgba(0,0,0,.1);
  }
  .lms-banner h2 {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: .05em;
    margin: 0;
    text-transform: uppercase;
  }

  .lms-scroll {
    max-height: min(65vh, 550px);
    overflow-y: auto;
    overflow-x: hidden;
  }

  .lms-scroll::-webkit-scrollbar {
    width: 8px;
  }
  .lms-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .lms-scroll::-webkit-scrollbar-thumb {
    background: var(--lm-border);
    border-radius: 4px;
  }
  .lms-scroll::-webkit-scrollbar-thumb:hover {
    background: var(--lm-muted);
  }

  /* ---------- BUTTONS ---------- */
  .lms-btn {
    all: unset;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    user-select: none;
    -webkit-user-select: none;
    padding: 12px 20px;
    border-radius: var(--lm-radius-sm);
    font-weight: 600;
    font-size: 14px;
    line-height: 1;
    letter-spacing: .3px;
    cursor: pointer;
    box-shadow: var(--lm-shadow);
    text-transform: none;
    transition: all .2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .lms-btn:focus {
    outline: 2px solid var(--lm-primary);
    outline-offset: 2px;
  }

  .lms-btn--primary {
    background: var(--lm-primary);
    color: var(--lm-primary-fg);
    border: 1px solid transparent;
  }
  .lms-btn--primary:hover {
    background: var(--lm-primary-hover);
    transform: translateY(-2px);
    box-shadow: var(--lm-shadow-lg);
  }
  .lms-btn--primary:active {
    transform: translateY(0);
  }

  .lms-btn--ghost {
    background: var(--lm-bg);
    color: var(--lm-fg);
    border: 1px solid var(--lm-border);
  }
  .lms-btn--ghost:hover {
    background: var(--lm-hover);
    border-color: var(--lm-primary);
  }

  .lms-btn--pin {
    margin-top: 12px;
    align-self: flex-end;
    min-width: 140px;
  }

  .lms-row {
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 14px;
    border-bottom: 1px solid var(--lm-border);
  }
  .lms-row:last-child {
    border-bottom: none;
  }
  .lms-row .lms-title {
    font-weight: 600;
    font-size: 14px;
    flex: 1;
    padding: 16px 20px;
  }
  .lms-row .lms-sub {
    font-size: 12px;
    color: var(--lm-muted);
    font-weight: 500;
    background: var(--lm-hover);
    padding: 4px 10px;
    border-radius: 8px;
  }

  .lms-list {
    padding: 12px 20px 18px 32px;
    margin: 0;
  }
  .lms-list li {
    margin: 12px 0;
    line-height: 1.5;
  }
  .lms-list a {
    color: inherit;
    text-decoration: none;
    transition: color .2s;
  }
  .lms-list a:hover {
    color: var(--lm-primary);
  }
  .lms-list a:hover strong {
    text-decoration: underline;
  }
  .lms-list small {
    color: var(--lm-muted);
    font-size: 12px;
  }

  .lms-back {
    padding: 14px 20px;
    font-weight: 600;
    display: flex;
    gap: 8px;
    align-items: center;
    border-bottom: 1px solid var(--lm-border);
  }

  .lms-ico {
    width: 18px;
    height: 18px;
    display: inline-block;
    flex-shrink: 0;
  }

  .lms-empty {
    padding: 24px 20px;
    text-align: center;
    color: var(--lm-muted);
    font-size: 14px;
  }

  .fade-in {
    animation: fadein .25s cubic-bezier(0.4, 0, 0.2, 1) both;
  }
  @keyframes fadein {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  .success-flash {
    animation: successFlash .6s cubic-bezier(0.4, 0, 0.2, 1);
  }
  @keyframes successFlash {
    0%, 100% { background-color: transparent; }
    50% { background-color: var(--lm-success); }
  }
    `;
        return style;
    }

    function banner() {
        const banner = document.createElement("div");
        banner.className = "lms-banner";
        banner.innerHTML = `
      <span class="lms-ico" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <h2 style="color:white">LMS Mod</h2>
    `;
        return banner;
    }

    function isAuthenticated() {
        return document.cookie && document.cookie.includes("SESSIONKEY") && document.cookie.includes("SESSIONSIAK");
    }

    async function authenticate() {
        window.location = `https://slc.polinema.ac.id/spada/?gotourl=${window.location.origin}`;
    }

    async function getSessionKey() {
        if (window.M?.cfg?.sesskey) return window.M.cfg.sesskey;
        const meta = document.querySelector('meta[name="sesskey"][content]');
        if (meta?.content) return meta.content;
        const elWithSesskey = document.querySelector('[data-sesskey]');
        if (elWithSesskey?.dataset?.sesskey) return elWithSesskey.dataset.sesskey;
        const match = document.documentElement.innerHTML.match(/sesskey=([a-zA-Z0-9]{10})/);
        return match ? match[1] : null;
    }

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    async function extendLMSCookieExpiration(hours = 1, days = 0) {
        let sessionCookieNames = ["SESSIONKEY", "SESSIONSIAK"];
        sessionCookieNames.forEach(cookieName => {
            const cookie = document.cookie.match(new RegExp(`${cookieName}=([^;]+)`));
            if (cookie) {
                const expirationDate = new Date();
                expirationDate.setHours(expirationDate.getHours() + hours);
                expirationDate.setDate(expirationDate.getDate() + days);
                document.cookie = `${cookieName}=${cookie[1]}; expires=${expirationDate.toUTCString()}; path=/; domain=polinema.ac.id`;
                document.cookie = `${sessionExpCookieName}=${expirationDate.toUTCString()}; expires=${expirationDate.toUTCString()}; path=/; domain=polinema.ac.id`;
            }
        });
    }

    function formatDateFromEpochSeconds(sec) {
        try {
            return new Date(sec * 1000).toLocaleString("id-ID", {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch {
            return new Date(sec * 1000).toLocaleString();
        }
    }

    async function fetchTasks(sessKey, maxAmount = 25) {
        const epochNow = Math.floor(Date.now() / 1000);
        const epochWeekBefore = epochNow - 604800;
        const epochYearLater = epochNow + 31536000;
        const tasks = [];
        await fetch(`https://lmsslc.polinema.ac.id/lib/ajax/service.php?sesskey=${sessKey}&info=core_calendar_get_action_events_by_timesort`, {
            "credentials": "include",
            "headers": {
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json, text/javascript, */*; q=0.01",
                "Accept-Language": "en-US,en;q=0.5",
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin"
            },
            "referrer": "https://lmsslc.polinema.ac.id/my/",
            "body": `[{\"index\":0,\"methodname\":\"core_calendar_get_action_events_by_timesort\",\"args\":{\"limitnum\":${maxAmount},\"timesortfrom\":${epochWeekBefore},\"timesortto\":${epochYearLater},\"limittononsuspendedevents\":true}}]`,
            "method": "POST",
            "mode": "cors"
        }).then(r => r.json()).then((json) => {
            const events = json?.[0]?.data?.events || [];
            events.forEach(e => {
                tasks.push({
                    "name": e.name,
                    "date": formatDateFromEpochSeconds(e.timesort),
                    "url": e.url,
                    "coursename": e.course?.fullname || "-"
                });
            });
        }).catch((error) => console.error('Error:', error));
        return tasks;
    }

    async function fetchCourses(sessKey) {
        const courses = [];
        await fetch(`https://lmsslc.polinema.ac.id/lib/ajax/service.php?sesskey=${sessKey}&info=core_course_get_enrolled_courses_by_timeline_classification`, {
            "credentials": "include",
            "headers": {
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json, text/javascript, */*; q=0.01",
                "Accept-Language": "en-US,en;q=0.5",
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin"
            },
            "referrer": "https://lmsslc.polinema.ac.id/my/",
            "body": "[{\"index\":0,\"methodname\":\"core_course_get_enrolled_courses_by_timeline_classification\",\"args\":{\"offset\":0,\"limit\":0,\"classification\":\"all\",\"sort\":\"fullname\",\"customfieldname\":\"\",\"customfieldvalue\":\"\"}}]",
            "method": "POST",
            "mode": "cors"
        }).then(r => r.json()).then((json) => {
            const data = json?.[0]?.data?.courses || [];
            data.forEach(course => {
                courses.push({
                    "name": course.fullname,
                    "url": course.viewurl
                });
            });
        }).catch((error) => console.error('Error:', error));
        return courses;
    }

    function mainContainer() {
        const container = document.createElement("div");
        Object.assign(container.style, {
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: "2147483647",
            width: "380px",
            maxWidth: "calc(100vw - 40px)",
            color: "inherit",
            textAlign: "right",
        });
        return container;
    }

    function authenticateButton() {
        const button = document.createElement("button");
        button.className = "lms-btn lms-btn--primary lms-btn--pin";
        button.innerHTML = `
      <span class="lms-ico">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M10 17L15 12L10 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M15 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      Authenticate
    `;
        button.onclick = authenticate;
        return button;
    }

    function menuContainer() {
        const container = document.createElement("div");
        container.id = "menuContainer";
        container.className = "lms-card lms-scroll fade-in";
        container.style.marginBottom = "12px";
        container.style.display = "none";
        return container;
    }

    function menuButton(menuContainer) {
        const button = document.createElement("button");
        button.className = "lms-btn lms-btn--pin lms-btn--primary";
        button.innerHTML = `
      <span class="lms-ico">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M3 12H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M3 6H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </span>
      Open Menu
    `;

        let isOpened = false;
        const appBanner = banner();

        button.onclick = () => {
            if (isOpened) {
                // Close menu
                menuContainer.style.display = "none";
                menuContainer.innerHTML = "";
                button.className = "lms-btn lms-btn--pin lms-btn--primary";
                button.innerHTML = `
          <span class="lms-ico">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M3 12H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M3 6H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </span>
          Open Menu
        `;
                isOpened = false;
            } else {
                // Open menu
                menuContainer.style.display = "block";
                const list = menuList(menuContainer);
                menuContainer.appendChild(appBanner);
                menuContainer.appendChild(list);
                button.className = "lms-btn lms-btn--pin lms-btn--ghost";
                button.innerHTML = `
          <span class="lms-ico">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </span>
          Close
        `;
                isOpened = true;
            }
        };

        return button;
    }

    function menuList(container) {
        const list = document.createElement("div");
        list.id = "menuList";
        list.className = "fade-in";

        list.appendChild(taskOption(container, list, tasks));
        list.appendChild(coursesOption(container, list, courses));
        list.appendChild(extendCookieOption());
        list.appendChild(fontEnhancementOption());

        for (let i = 0; i < list.children.length; i++) {
            list.children[i].classList.add("lms-row", "hoverable");
        }
        return list;
    }

    function taskOption(container, previous, tasksData) {
        const row = document.createElement("div");
        row.style.width = "100%";
        row.innerHTML = `
      <span class="lms-title">📝 Tasks</span>
      <span class="lms-sub">${tasksData?.length || 0}</span>
    `;
        row.onclick = () => {
            const tasksList = document.getElementById("tasksList");
            if (tasksList) {
                tasksList.remove();
            } else {
                previous.style.display = "none";
                const view = tasksListView(previous, tasksData);
                container.appendChild(view);
            }
        };
        return row;
    }

    function tasksListView(previous, tasksData) {
        const wrap = document.createElement("div");
        wrap.id = "tasksList";
        wrap.className = "fade-in";

        const back = backNav(wrap, previous);
        wrap.appendChild(back);

        if (!tasksData?.length) {
            const empty = document.createElement("div");
            empty.className = "lms-empty";
            empty.textContent = "Tidak ada tugas saat ini.";
            wrap.appendChild(empty);
            return wrap;
        }

        const list = document.createElement("ol");
        list.className = "lms-list";
        list.type = "1";

        tasksData.forEach((task) => {
            const li = document.createElement("li");
            li.innerHTML = `
        <a href="${task.url}">
          <strong>${task.name}</strong>
          <br>
          <small>${task.coursename} • ${task.date}</small>
        </a>
      `;
            list.appendChild(li);
        });

        wrap.appendChild(list);
        return wrap;
    }

    function coursesOption(container, previous, coursesData) {
        const row = document.createElement("div");
        row.style.width = "100%";
        row.innerHTML = `
      <span class="lms-title">📚 Courses</span>
      <span class="lms-sub">${coursesData?.length || 0}</span>
    `;
        row.onclick = () => {
            const coursesList = document.getElementById("coursesList");
            if (coursesList) {
                coursesList.remove();
            } else {
                previous.style.display = "none";
                const view = coursesListView(previous, coursesData);
                container.append(view);
            }
        };
        return row;
    }

    function coursesListView(previous, coursesData) {
        const wrap = document.createElement("div");
        wrap.id = "coursesList";
        wrap.className = "fade-in";

        const back = backNav(wrap, previous);
        wrap.appendChild(back);

        if (!coursesData?.length) {
            const empty = document.createElement("div");
            empty.className = "lms-empty";
            empty.textContent = "Belum ada mata kuliah yang terdaftar.";
            wrap.appendChild(empty);
            return wrap;
        }

        const list = document.createElement("ol");
        list.className = "lms-list";
        list.type = "1";

        coursesData.forEach((course) => {
            const li = document.createElement("li");
            li.innerHTML = `<a href="${course.url}"><strong>${course.name}</strong></a>`;
            list.appendChild(li);
        });

        wrap.appendChild(list);
        return wrap;
    }

    function extendCookieOption() {
        const hours = 0;
        const days = 7;

        let expiredInfo = "";
        if (getCookie(sessionExpCookieName)) {
            const expiredDate = new Date(getCookie(sessionExpCookieName));
            const remainingDays = Math.trunc((expiredDate - Date.now()) / 86400000);
            const remainingHours = Math.trunc((expiredDate - Date.now()) / 3600000) % 24;
            expiredInfo = ` (${remainingDays}d ${remainingHours}h)`;
        }

        const div = document.createElement("div");
        div.style.width = "100%";
        div.style.padding = "12";
        div.innerHTML = `
      <span class="lms-title">⏰ Extend Cookie (${days} days)</span>
      <span class="lms-sub">${expiredInfo || 'N/A'}</span>
    `;

        div.onclick = () => {
            extendLMSCookieExpiration(hours, days);
            div.classList.add("success-flash");
            const originalTitle = div.querySelector(".lms-title").textContent;
            div.querySelector(".lms-title").textContent = "✓ Extended!";
            setTimeout(() => {
                div.classList.remove("success-flash");
                div.querySelector(".lms-title").textContent = originalTitle;
            }, 1000);
        };
        return div;
    }

    function enhanceFont() {
        if (document.getElementById("fontEnhancement")) return;
        const link = document.createElement("link");
        link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
        link.rel = "stylesheet";
        document.head.appendChild(link);

        const style = document.createElement("style");
        style.id = "fontEnhancement";
        style.textContent = `
      * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    `;
        document.head.appendChild(style);
    }

    function toggleFontEnhancement() {
        const enabled = document.cookie.includes(`${fontEnhancementCookieName}=true`);
        if (enabled) {
            const el = document.getElementById("fontEnhancement");
            if (el) el.remove();
            document.cookie = `${fontEnhancementCookieName}=false; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
        } else {
            enhanceFont();
            const exp = new Date("2030-01-01T00:00:00Z").toUTCString();
            document.cookie = `${fontEnhancementCookieName}=true; expires=${exp}; path=/;`;
        }
    }

    function fontEnhancementOption() {
        const enabled = document.cookie.includes(`${fontEnhancementCookieName}=true`);
        const div = document.createElement("div");
        div.style.width = "100%";
        div.style.padding = "12";
        div.innerHTML = `
      <span class="lms-title">✨ Font Enhancement</span>
      <span class="lms-sub">${enabled ? 'ON' : 'OFF'}</span>
    `;
        div.onclick = () => {
            toggleFontEnhancement();
            div.classList.add("success-flash");
            const nowEnabled = document.cookie.includes(`${fontEnhancementCookieName}=true`);
            div.querySelector(".lms-sub").textContent = nowEnabled ? 'ON' : 'OFF';
            setTimeout(() => {
                div.classList.remove("success-flash");
            }, 1000);
        };
        return div;
    }

    function backNav(current, previous) {
        const backNav = document.createElement("div");
        backNav.className = "lms-back hoverable";
        backNav.innerHTML = `
      <span class="lms-ico">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      Back
    `;
        backNav.onclick = () => {
            current.remove();
            previous.style.display = "block";
        };
        return backNav;
    }

    async function init() {
        if (document.cookie.includes(`${fontEnhancementCookieName}=true`)) {
            enhanceFont();
        }

        const container = mainContainer();
        document.body.appendChild(container);
        const menu = menuContainer();
        container.appendChild(menu);
        container.appendChild(isAuthenticated() ? menuButton(menu) : authenticateButton());

        document.head.appendChild(globalStyle());

        try {
            sessionKey = await getSessionKey();
            if (sessionKey) {
                [tasks, courses] = await Promise.all([
                    fetchTasks(sessionKey, 25),
                    fetchCourses(sessionKey)
                ]);
            }
        } catch (e) {
            console.error('LMS Mod Error:', e);
        }
    }

    init();
})();