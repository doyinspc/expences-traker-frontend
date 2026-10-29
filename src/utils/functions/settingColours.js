const names = { red:'#ff0000', orange:'#ffa500', yellow:'#ffff00', green:'#008000', blue:'#0000ff', purple:'#800080', pink:'#ffc0cb', gray:'#808080', grey:'#808080', black:'#000000', white:'#ffffff', teal:'#008080', cyan:'#00ffff', indigo:'#4b0082', violet:'#ee82ee', lime:'#00ff00', maroon:'#800000', navy:'#000080', olive:'#808000', silver:'#c0c0c0' };
export function settingColour(value) {
  if (typeof value !== 'string') return null;
  const colour = value.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(colour)) return colour;
  if (/^#[0-9a-f]{3}$/.test(colour)) return '#' + colour.slice(1).split('').map(c => c + c).join('');
  return Object.hasOwn(names, colour) ? names[colour] : null;
}
export function colourText(value) {
  const colour = settingColour(value) || '#64748b';
  const rgb = [1,3,5].map(i => parseInt(colour.slice(i, i + 2), 16) / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
  const luminance = .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2];
  return (luminance + .05) / .05 >= 1.05 / (luminance + .05) ? '#000000' : '#ffffff';
}
