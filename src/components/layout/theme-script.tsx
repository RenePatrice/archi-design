/**
 * Applique le thème choisi avant le premier affichage, pour éviter un flash clair
 * quand le visiteur a choisi le mode sombre. Placé dans <head>.
 */
const script = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})()`

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
