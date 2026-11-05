/* Shared SVG icons and category colours */
const ICON={
  home:'<path d="M4 10 L12 4 L20 10"/><path d="M6 9.5 V19 H18 V9.5"/><path d="M10 19 V14 H14 V19"/>',
  plate:'<ellipse cx="12" cy="15.5" rx="8" ry="2.6"/><path d="M6 15 A6 3.4 0 0 1 18 15"/><path d="M14 5 L10.5 13"/><path d="M16 6 L12.5 13"/>',
  noodle:'<path d="M4 11 H20 A8 7 0 0 1 4 11Z"/><path d="M6.5 11 C8 7 9 7 10 11"/><path d="M10.5 11 C12 6 13 6 14 11"/><path d="M8 4.5 C8 3.8 8.8 3.8 8.8 3"/><path d="M15 4.5 C15 3.8 15.8 3.8 15.8 3"/>',
  grill:'<path d="M4 14 A8 6 0 0 1 20 14"/><line x1="3" y1="14.2" x2="21" y2="14.2"/><path d="M8 5.5 C8 4.6 9 4.6 9 3.6"/><path d="M12 5 C12 4.1 13 4.1 13 3.1"/><path d="M16 5.5 C16 4.6 17 4.6 17 3.6"/><line x1="7" y1="15" x2="6" y2="19"/><line x1="17" y1="15" x2="18" y2="19"/>',
  beer:'<path d="M7 7 H15 V19 A1.2 1.2 0 0 1 13.8 20.2 H8.2 A1.2 1.2 0 0 1 7 19Z"/><path d="M15 9 H17.2 A2.3 2.3 0 0 1 17.2 15 H15"/><line x1="7" y1="10.5" x2="15" y2="10.5"/><path d="M8 7 Q8 5.4 9.5 5.6 Q10 4 11.5 5 Q13.2 4.6 13.2 6.2 Q14.6 6 14.5 7"/>',
  view:'<circle cx="12" cy="8.5" r="3"/><line x1="12" y1="2.6" x2="12" y2="4"/><line x1="5.6" y1="5.6" x2="6.6" y2="6.6"/><line x1="18.4" y1="5.6" x2="17.4" y2="6.6"/><path d="M3.5 16 Q7 13.5 10 16 T16.5 16 T20.5 16"/><path d="M3 19.5 Q7 17 11 19.5 T19.5 19.5"/>',
  lantern:'<line x1="9" y1="3.5" x2="15" y2="3.5"/><path d="M8 6 Q12 3.8 16 6 Q17.4 10 16 14 Q12 16.2 8 14 Q6.6 10 8 6Z"/><line x1="10.5" y1="6" x2="10.5" y2="14"/><line x1="13.5" y1="6" x2="13.5" y2="14"/><line x1="11" y1="16" x2="11" y2="18"/><line x1="13" y1="16" x2="13" y2="18"/>',
  fish:'<path d="M4 11 H20 A8 7 0 0 1 4 11Z"/><path d="M9 14.2 Q12 12.4 14.5 14.2 Q12 16 9 14.2Z"/><path d="M14.5 14.2 L16.6 13.2 V15.4Z"/><circle cx="10.4" cy="14" r=".5"/>',
  cat:'<path d="M6.5 9 L5.5 4.8 L9.2 7.8"/><path d="M17.5 9 L18.5 4.8 L14.8 7.8"/><path d="M6.5 9 Q4.3 14 12 16 Q19.7 14 17.5 9 Q13.5 7 10.5 7 Q8 7 6.5 9Z"/><circle cx="9.6" cy="11" r=".7" fill="currentColor"/><circle cx="14.4" cy="11" r=".7" fill="currentColor"/><path d="M12 12.4 L11.2 13.4 H12.8Z" fill="currentColor"/><path d="M12 13.4 V14.4"/>',
  flower:'<path d="M6 9.5 H16 V13 A4 4 0 0 1 12 17 H10 A4 4 0 0 1 6 13Z"/><path d="M16 10.5 H18 A2 2 0 0 1 18 14 H16"/><circle cx="11" cy="5.6" r="1.3"/><circle cx="8.6" cy="6.4" r="1.1"/><circle cx="13.4" cy="6.4" r="1.1"/><circle cx="11" cy="7.8" r="1.1"/><circle cx="11" cy="6.6" r=".7" fill="currentColor"/>',
  cup:'<path d="M6 8.5 H16 V13 A4 4 0 0 1 12 17 H10 A4 4 0 0 1 6 13Z"/><path d="M16 9.5 H18 A2 2 0 0 1 18 13 H16"/><path d="M9 3.4 C9 4.4 8 4.4 9 5.8"/><path d="M12 3.4 C12 4.4 11 4.4 12 5.8"/>',
  bowl:'<path d="M4 11 H20 A8 7 0 0 1 4 11Z"/><path d="M8 7 Q9 5 10 7"/><path d="M12 6.5 Q13 4.5 14 6.5"/>'
};
const CAT={food:{c:'var(--c-food)',s:'var(--c-food-soft)'},cafe:{c:'var(--c-cafe)',s:'var(--c-cafe-soft)'},
  mookata:{c:'var(--c-mookata)',s:'var(--c-mookata-soft)'},walk:{c:'var(--c-walk)',s:'var(--c-walk-soft)'},
  home:{c:'var(--primary)',s:'var(--primary-soft)'}};

function ic(kind,stroke){return '<svg viewBox="0 0 24 24" fill="none" stroke="'+stroke+'" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+ICON[kind]+'</svg>';}

const SVG_GO='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>';
const SVG_PHOTO='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="8.5" cy="10" r="1.6"/><path d="M4 17l4.5-4 3 2.5L15 11l5 5"/></svg>';
const SVG_WALK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4.5" r="1.6"/><path d="M13 8 L10 13 L12 15 L11 21"/><path d="M13 9 L16 12 L19 12"/><path d="M12 15 L8 18"/></svg>';
const SVG_CLOCK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>';
const SVG_WARN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 L22 20 H2Z"/><line x1="12" y1="10" x2="12" y2="14"/><circle cx="12" cy="17.2" r=".4" fill="currentColor"/></svg>';
const SUN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/></svg>';
const MOON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5Z"/></svg>';
