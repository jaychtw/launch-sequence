export function beep(mood = "happy") {
  const eyes =
    mood === "cheer"
      ? '<path d="m83 99 10-8 10 8m21 0 10-8 10 8" fill="none" stroke="#79e6d0" stroke-width="5" stroke-linecap="round"/>'
      : '<rect x="85" y="87" width="13" height="22" rx="6" fill="#79e6d0"/><rect x="124" y="87" width="13" height="22" rx="6" fill="#79e6d0"/>';
  return `<svg class="beep-art" viewBox="0 0 220 230" fill="none" aria-hidden="true"><ellipse cx="110" cy="216" rx="66" ry="8" fill="#08152c" opacity=".25"/><path d="M110 45V25" stroke="#678c98" stroke-width="7"/><circle cx="110" cy="18" r="10" fill="#ffcb70"/><path d="m58 153-25 18m129-18 25-20" stroke="#66cbbb" stroke-width="15" stroke-linecap="round"/><circle cx="29" cy="174" r="12" fill="#f3cd7b"/><circle cx="191" cy="129" r="12" fill="#f3cd7b"/><path d="m84 194-3 15m55-15 3 15" stroke="#75cbbb" stroke-width="16" stroke-linecap="round"/><rect x="62" y="128" width="96" height="72" rx="27" fill="#83dcca"/><rect x="76" y="143" width="68" height="43" rx="13" fill="#b6eee0"/><circle cx="110" cy="163" r="12" fill="#ffd782"/><path d="m110 155 2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8z" fill="#f9f0d6"/><rect x="38" y="76" width="18" height="36" rx="8" fill="#f2c46a"/><rect x="164" y="76" width="18" height="36" rx="8" fill="#f2c46a"/><rect x="48" y="43" width="124" height="94" rx="33" fill="#9de8d6"/><path d="M69 52c21-9 58-8 78 0" stroke="#d3f8e7" stroke-width="5" stroke-linecap="round"/><rect x="64" y="68" width="92" height="55" rx="21" fill="#142c41"/>${eyes}<path d="M104 111q7 6 14 0" stroke="#79e6d0" stroke-width="3" stroke-linecap="round"/><circle cx="72" cy="111" r="4" fill="#f5ba94"/><circle cx="148" cy="111" r="4" fill="#f5ba94"/></svg>`;
}

export function rocket(className = "") {
  return `<svg class="rocket-art ${className}" viewBox="0 0 200 360" aria-hidden="true"><defs><linearGradient id="rocket-body" x1="0" x2="1"><stop stop-color="#e1ded9"/><stop offset=".45" stop-color="#fff8e7"/><stop offset="1" stop-color="#e4e3d9"/></linearGradient><linearGradient id="flame" x2="0" y2="1"><stop stop-color="#ffb457"/><stop offset="1" stop-color="#ff794f" stop-opacity="0"/></linearGradient></defs><g class="rocket-flame"><path d="M75 263q-5 47 25 89 31-44 25-89" fill="url(#flame)"/><path d="M88 265q-2 24 12 52 15-29 12-52" fill="#ffe7a5"/></g><path d="M66 181q-35 16-38 76l43-20m63-56q35 16 38 76l-43-20" fill="#f68561"/><path d="M100 20C64 57 55 135 64 227l11 38h50l11-38c9-92 0-170-36-207Z" fill="url(#rocket-body)"/><path d="M100 20c-18 19-30 46-35 70h70c-5-24-17-51-35-70Z" fill="#f58a68"/><path d="M66 225h68l-9 35H75Z" fill="#638e9c"/><circle cx="100" cy="133" r="30" fill="#e5bb70"/><circle cx="100" cy="133" r="23" fill="#28485f"/><circle cx="100" cy="133" r="17" fill="#79d8d0"/><path d="m91 122 13-4" stroke="#d9fff2" stroke-width="5" stroke-linecap="round"/><path d="M100 189v59" stroke="#f58a68" stroke-width="11" stroke-linecap="round"/><circle cx="100" cy="173" r="4" fill="#edc77d"/></svg>`;
}

export function planet(key, className = "") {
  const colors = {
    earth: "#6aaec7",
    moon: "#cfcedb",
    mars: "#e78b6d",
    belt: "#b6a18b",
    jupiter: "#dfaa7b",
    saturn: "#e6c58a",
    neptune: "#799cdd",
  };
  let detail = "";
  if (key === "earth")
    detail =
      '<path d="m39 44 17-17 20 4 5 15-17 4-7 16-19-5zm34 37 13-10 14 4 6 18-17 17-10-13z" fill="#9bd0ac"/>';
  if (key === "moon")
    detail =
      '<g fill="#a7a8bd" opacity=".65"><circle cx="45" cy="46" r="12"/><circle cx="83" cy="78" r="17"/><circle cx="46" cy="94" r="7"/><circle cx="90" cy="36" r="6"/></g>';
  if (key === "mars")
    detail =
      '<path d="M22 49q35-19 84 9M27 86q40-13 75 4" stroke="#c66e58" stroke-width="10" opacity=".6"/><circle cx="82" cy="41" r="10" fill="#f3c2a0" opacity=".6"/>';
  if (key === "jupiter")
    detail =
      '<path d="M18 41h95M13 57h105M15 77h101M22 96h86" stroke="#b87e64" stroke-width="9" opacity=".65"/><ellipse cx="86" cy="76" rx="15" ry="9" fill="#d87860"/>';
  if (key === "saturn")
    detail =
      '<path d="M20 51h93M15 73h100M29 91h72" stroke="#cba46b" stroke-width="6" opacity=".45"/>';
  if (key === "neptune")
    detail =
      '<path d="M19 49q38-8 93 1M16 73q52 10 99-1M27 94h73" stroke="#587ac5" stroke-width="7" opacity=".5"/>';
  if (key === "belt")
    return `<svg viewBox="0 0 130 130" class="planet-art ${className}" aria-hidden="true"><g fill="#bca995"><path d="m24 38 15-9 16 15-8 22-26-5z"/><path d="m81 63 18-11 18 18-6 25-25 2-12-16z"/><path d="m50 97 13-5 9 14-12 12-16-7z"/><circle cx="83" cy="24" r="9"/><circle cx="16" cy="93" r="5"/></g><g fill="#837b78"><circle cx="36" cy="46" r="5"/><circle cx="96" cy="78" r="8"/></g></svg>`;
  return `<svg viewBox="0 0 130 130" class="planet-art ${className}" aria-hidden="true"><defs><clipPath id="clip-${key}"><circle cx="65" cy="65" r="49"/></clipPath></defs>${key === "saturn" ? '<ellipse cx="65" cy="68" rx="64" ry="19" transform="rotate(-26 65 68)" fill="none" stroke="#cab7a0" stroke-width="10"/>' : ""}<circle cx="65" cy="65" r="49" fill="${colors[key]}"/><g clip-path="url(#clip-${key})">${detail}<path d="M68 10c-33 29-25 84 21 110h50V10Z" fill="#14233b" opacity=".1"/></g>${key === "saturn" ? '<path d="M9 88q35 14 112-40" fill="none" stroke="#ead9ac" stroke-width="9" stroke-linecap="round"/>' : ""}</svg>`;
}

export function heroScene() {
  return `<div class="space-scene" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><span class="scene-star s1">✧</span><span class="scene-star s2">✦</span><span class="scene-star s3">+</span><span class="scene-star s4">✧</span><div class="scene-moon">${planet("moon")}</div><div class="scene-saturn">${planet("saturn")}</div><div class="scene-rocket">${rocket()}</div><div class="scene-earth">${planet("earth")}</div><div class="scene-dust"></div><div class="scene-caption"><span class="status-dot"></span> LSSA · EXPLORER 01</div></div>`;
}

export const icon = {
  star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2 2.9 6.3 6.9.9-5.1 4.7 1.4 6.8-6.1-3.4-6.1 3.4 1.4-6.8L2.2 9.2l6.9-.9Z"/></svg>',
  arrow:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>',
  settings:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="#101c37"/><circle cx="15" cy="17" r="3" fill="#101c37"/></svg>',
  sound:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m11 4-6 5H2v6h3l6 5V4Zm4 4q5 4 0 8m3-11q8 7 0 14"/></svg>',
  mute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m11 4-6 5H2v6h3l6 5V4Zm5 5 6 6m0-6-6 6"/></svg>',
};
