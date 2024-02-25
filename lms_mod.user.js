// ==UserScript==
// @name         LMS Mod
// @namespace    http://tampermonkey.net/
// @version      2024-02-24
// @description  TamperMonkey Script Mod for LMS Polinema, add floating mod menu with tasks and courses list for ease of access. This mod is not affiliated with Polinema or LMS Polinema. Use at your own risk. 
// @author       ferdirianrk
// @match        https://lmsslc.polinema.ac.id/*
// @icon         https://lmsslc.polinema.ac.id/theme/image.php/iomadboost/theme/1708847580/favicon
// @grant        none
// ==/UserScript==

await(async function () {
    'use strict';

    // global style
    function globalStyle() {
        const style = document.createElement("style");
        style.innerHTML = `
        .hoverable:hover {
            background-color: lightgray;
        }`;
        return style;
    }

    // banner
    function banner() {
        const banner = document.createElement("div");
        banner.id = "banner";
        banner.style.width = "100%";
        banner.style.backgroundColor = "black";
        banner.style.color = "white";
        banner.style.textAlign = "center";
        banner.style.padding = "10px";
        banner.style.position = "sticky";
        banner.style.top = "0";
        banner.innerHTML = `<h2 style="color:white">LMS Mod</h2>`;
        return banner;
    }

    // data services
    async function fetchSessionKey() {
        let sessionKey = "";
        await fetch("https://lmsslc.polinema.ac.id/my/", {
            "headers": {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Upgrade-Insecure-Requests": "1",
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "none",
                "Sec-Fetch-User": "?1"
            },
            "method": "GET",
            "mode": "cors"
        }).then(response => response.text()).then(
            (text) => {
                const rawSession = text.match(/<input type="hidden" name="sesskey" value=".*">/g)[0];
                sessionKey = rawSession.match(/[a-zA-Z0-9]{10}/g)[0];
            }
        ).catch((error) => {
            console.error('Error:', error);
        });
        return sessionKey;
    }

    const sessionKey = await fetchSessionKey();

    async function fetchTasks(sessionKey, maxAmount = 25) {
        const epochNow = Math.floor(Date.now() / 1000);
        const epochYearLater = Math.floor(Date.now() / 1000) + 31536000;
        const tasks = [];
        await fetch(`https://lmsslc.polinema.ac.id/lib/ajax/service.php?sesskey=${sessionKey}&info=core_calendar_get_action_events_by_timesort`, {
            "credentials": "include",
            "headers": {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
                "Accept": "application/json, text/javascript, */*; q=0.01",
                "Accept-Language": "en-US,en;q=0.5",
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin"
            },
            "referrer": "https://lmsslc.polinema.ac.id/my/",
            "body": `[{\"index\":0,\"methodname\":\"core_calendar_get_action_events_by_timesort\",\"args\":{\"limitnum\":${maxAmount},\"timesortfrom\":${epochNow},\"timesortto\":${epochYearLater},\"limittononsuspendedevents\":true}}]`,
            "method": "POST",
            "mode": "cors"
        }).then(response => response.json()).then(
            (json) => {
                const events = json[0].data.events;
                events.forEach(e => {
                    tasks.push({
                        "name": e.name,
                        "date": new Date(e.timesort * 1000).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                        "url": e.url,
                        "coursename": e.course.fullname
                    });
                });
            }
        ).catch((error) => {
            console.error('Error:', error);
        });
        return tasks;
    }

    const tasks = await fetchTasks(sessionKey);

    async function fetchCourses() {
        let courses = [];
        await fetch(`https://lmsslc.polinema.ac.id/user/profile.php?showallcourses=1`, {
            "credentials": "include",
            "headers": {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
                "Accept": "text/html, */*; q=0.01",
                "Accept-Language": "en-US,en;q=0.5",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin"
            },
            "referrer": "https://lmsslc.polinema.ac.id/my/",
            "method": "GET",
            "mode": "cors"
        }).then(response => response.text()).then(
            (text) => {
                const rawCourses = text.match(/<dd><ul.*<\/ul><\/dd>/g)[0].match(/<a.*?<\/a>/g);
                const coursesData = rawCourses.map(course => {
                    const courseId = course.match(/course=[0-9]+/g)[0].match(/[0-9]+/g)[0];
                    const courseName = course.match(/>(.*?)</g)[0].match(/[^><]+/g)[0];
                    return { courseId, courseName };
                });
                coursesData.forEach(course => {
                    courses.push(`<a href="https://lmsslc.polinema.ac.id/course/view.php?id=${course.courseId}">${course.courseName}</a>`);
                });
                console.table(coursesData);
            }
        ).catch((error) => {
            console.error('Error:', error);
        });
        return courses;
    }

    const courses = await fetchCourses();

    // UI

    // main container

    function mainContainer() {
        const container = document.createElement("div");
        container.style.position = "fixed";
        container.style.bottom = "20px";
        container.style.right = "20px";
        container.style.zIndex = "1000";
        container.style.backgroundColor = "transparent";
        container.style.color = "black";
        container.style.textAlign = "right";
        container.style.textDecoration = "none";
        container.style.width = "500px";
        return container;
    }

    // menu

    function menuContainer() {
        const container = document.createElement("div");
        container.id = "menuContainer";
        container.style.backgroundColor = "white";
        container.style.color = "black";
        container.style.textDecoration = "none";
        container.style.maxHeight = "500px";
        container.style.overflowY = "scroll";

        addEventListener("DOMNodeInserted", () => {
            if (container.children.length > 1) {
                container.style.border = "1px solid black";
            } else {
                container.style.border = "none";
            }
        });

        container.style.marginBottom = "1rem";
        return container;
    }

    function menuButton(menuContainer) {
        const button = document.createElement("button");
        button.className = "btn btn-primary btn-lg";
        button.innerHTML = "Menu";

        let isOpened = false;
        const appBanner = banner();

        button.onclick = () => {
            if (isOpened) {
                document.getElementById("menuList").remove();
                menuContainer.innerHTML = "";
                button.innerHTML = "Menu";
                isOpened = false;
            } else {
                const list = menuList(menuContainer);
                menuContainer.prepend(appBanner);
                menuContainer.appendChild(list);
                button.innerHTML = "Close";
                isOpened = true;
            }
        }

        return button;
    }

    function menuList(container) {
        const list = document.createElement("div");
        list.id = "menuList";
        list.style.backgroundColor = "white";
        list.style.color = "black";
        list.style.textAlign = "left";
        list.style.textDecoration = "none";
        list.style.marginBottom = "1rem";
        // list.style.padding = "15px 32px";

        // task option
        list.appendChild(taskOption(container, list, tasks));

        // courses option
        list.appendChild(coursesOption(container, list, courses));

        // hover interaction on children
        for (let i = 0; i < list.children.length; i++) {
            list.children[i].classList.add("hoverable");
        }

        return list;
    }

    // task option
    function taskOption(container, previous, tasks) {
        const taskOption = document.createElement("div");
        taskOption.style.width = "100%";
        taskOption.innerHTML = "Tasks";
        taskOption.style.cursor = "pointer";
        taskOption.style.padding = "15px 32px";
        taskOption.onclick = () => {
            const tasksList = document.getElementById("tasksList");
            if (tasksList) {
                tasksList.remove();
            } else {
                previous.style.display = "none";
                const tasksList = tasksListView(previous, tasks);
                container.appendChild(tasksList);
            }
        }

        return taskOption;
    }

    function tasksListView(previous, tasks) {
        const list = document.createElement("ol");
        list.type = "1";
        list.id = "tasksList";
        list.style.backgroundColor = "white";
        list.style.color = "black";
        list.style.padding = "15px 32px";
        list.style.textAlign = "left";
        list.style.textDecoration = "none";

        let counter = 1;
        tasks.forEach(task => {
            const listItem = document.createElement("li");
            listItem.style.marginBottom = counter === tasks.length ? "0" : "10px";
            listItem.innerHTML = `
                <a href="${task.url}" style="color: black;">
                    ${task.name} ${task.date}
                    <br>
                    <small>${task.coursename}</small>
                </a>
            `;
            list.appendChild(listItem);
            counter++;
        });

        list.prepend(backNav(list, previous));

        return list;
    }

    // courses option
    function coursesOption(container, previous, courses) {
        const coursesOption = document.createElement("div");
        coursesOption.style.width = "100%";
        coursesOption.innerHTML = "Courses";
        coursesOption.style.cursor = "pointer";
        coursesOption.style.padding = "15px 32px";

        coursesOption.onclick = () => {
            const coursesList = document.getElementById("coursesList");
            if (coursesList) {
                coursesList.remove();
            } else {
                previous.style.display = "none";
                const coursesList = coursesListView(previous, courses);
                container.append(coursesList);
            }
        }

        return coursesOption;
    }

    function coursesListView(previous, courses) {
        const list = document.createElement("ol");
        list.type = "1";
        list.id = "coursesList";
        list.style.backgroundColor = "white";
        list.style.color = "black";
        list.style.padding = "15px 32px";
        list.style.textAlign = "left";
        list.style.textDecoration = "none";

        let counter = 1;
        courses.forEach(course => {
            const listItem = document.createElement("li");
            listItem.style.marginBottom = counter === courses.length ? "0" : "10px";
            listItem.innerHTML = course;
            list.appendChild(listItem);
            counter++;
        });

        list.prepend(backNav(list, previous));

        return list;
    }

    // utilities
    function backNav(current, previous) {
        const backNav = document.createElement("div");
        backNav.style.width = "100%";
        backNav.style.marginBottom = "10px";
        backNav.innerHTML = "Back";
        backNav.style.textAlign = "left";
        backNav.style.cursor = "pointer";
        backNav.className = "hoverable";
        backNav.onclick = () => {
            current.remove();
            previous.style.display = "block";
        }

        return backNav;
    }

    function init() {
        const container = mainContainer();
        document.body.appendChild(container);
        const menu = menuContainer();
        container.appendChild(menu);
        container.appendChild(menuButton(menu));
        document.head.appendChild(globalStyle());
    }

    init();

})();