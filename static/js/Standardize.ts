// sourceURL=https://s.ngonngu.net/static/common.js?20240113
'use strict'
const VOS: { [key: string]: any } = {
  // Initial characters
  C: '[bdđhklmnrstvxBDĐHKLMNRSTVX]',
  // i/y non-standard words usually start with these ones
  Cc: '[hklmstvHKLMSTV]',
  // Inital full collection :p
  //    singles                            ch, nh, th..       gi       ng       ngh          tr
  Cf: '[bcdđghklmnpqrstvxBCDĐGHKLMNPQRSTVX]|[cgknptCGKNPT][hH]|[gG][iI]|[nN][gG]|[nN][gG][hH]|[tT][rR]',
  // Inital can be follow by schwa sounds (o, u)
  Cw: '[bcdđghlmnprstvxBCDĐGHLMNPRSTVX]|[cknptCKNPT][hH]|[gG][iI]|[nN][gG]|[tT][rR]',
  // yY in 6 tones
  Y: ['y', 'ỳ', 'ỷ', 'ỹ', 'ý', 'ỵ', 'Y', 'Ỳ', 'Ỷ', 'Ỹ', 'Ý', 'Ỵ'],
  // yY with tone 1 ONLY
  Y1: ['y', 'y', 'y', 'y', 'y', 'y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
  // iI in 6 tones
  I: ['i', 'ì', 'ỉ', 'ĩ', 'í', 'ị', 'I', 'Ì', 'Ỉ', 'Ĩ', 'Í', 'Ị'],
  // iI with tone marks ONLY (2-3-4-5-6)
  Ix: ['ì', 'ì', 'ỉ', 'ĩ', 'í', 'ị', 'I', 'Ì', 'Ỉ', 'Ĩ', 'Í', 'Ị'],
  // iI in tone 1 only
  I1: ['i', 'i', 'i', 'i', 'i', 'i', 'I', 'I', 'I', 'I', 'I', 'I'],
  // uU in 6 tones
  U: ['u', 'ù', 'ủ', 'ũ', 'ú', 'ụ', 'U', 'Ù', 'Ủ', 'Ũ', 'Ú', 'Ụ'],
  // uU tone marks ONLY (2-3-4-5-6)
  Ux: ['ù', 'ù', 'ủ', 'ũ', 'ú', 'ụ', 'Ù', 'Ù', 'Ủ', 'Ũ', 'Ú', 'Ụ'],
  // uU in tone 1 only
  U1: ['u', 'u', 'u', 'u', 'u', 'u', 'U', 'U', 'U', 'U', 'U', 'U'],
  // oa, oe, uy with tone marks at wrong position
  Tw: ['òa', 'ỏa', 'õa', 'óa', 'ọa', 'òe', 'ỏe', 'õe', 'óe', 'ọe', 'ùy', 'ủy', 'ũy', 'úy', 'ụy', 'ÒA', 'ỎA', 'ÕA', 'ÓA', 'ỌA', 'ÒE', 'ỎE', 'ÕE', 'ÓE', 'ỌE', 'ÙY', 'ỦY', 'ŨY', 'ÚY', 'ỤY', 'Òa', 'Ỏa', 'Õa', 'Óa', 'Ọa', 'Òe', 'Ỏe', 'Õe', 'Óe', 'Ọe', 'Ùy', 'Ủy', 'Ũy', 'Úy', 'Ụy'],
  // oa, oe, uy with tone marks at right position
  Tr: ['oà', 'oả', 'oã', 'oá', 'oạ', 'oè', 'oẻ', 'oẽ', 'oé', 'oẹ', 'uỳ', 'uỷ', 'uỹ', 'uý', 'uỵ', 'OÀ', 'OẢ', 'OÃ', 'OÁ', 'OẠ', 'OÈ', 'OẺ', 'OẼ', 'OÉ', 'OẸ', 'UỲ', 'UỶ', 'UỸ', 'UÝ', 'UỴ', 'Oà', 'Oả', 'Oã', 'Oá', 'Oạ', 'Oè', 'Oẻ', 'Oẽ', 'Oé', 'Oẹ', 'Uỳ', 'Uỷ', 'Uỹ', 'Uý', 'Uỵ']
}
function vosYToI (text: string): string {
  const Cc: string = VOS.Cf
  const Y: string = VOS.Y.join('')
  const I: string = VOS.I.join('')
  const Ux: string = VOS.Ux.join('')
  const U1: string = VOS.U1.join('')
  let result: string = text
  for (let i: number = 0; i < Y.length; i++) {
    // quí- > quý-
    result = result.replaceAll(new RegExp(`(?<=(?:\\P{L}|^)[Qq][Uu])(?:${I[i]}([ptuPTU]|nh|NH|ch|CH)?)(?=^|$|\\P{L})`, 'gui'), `${Y[i]}$1`)
    // qụi- > quỵ-
    result = result.replaceAll(new RegExp(`(?<=(?:\\P{L}|^)[Qq])(?:${Ux[i]}i([ptuPTU]|nh|NH|ch|CH)?)(?=^|$|\\P{L})`, 'gui'), `${U1[i]}${Y[i]}$1`)
    // hy, kỳ, lý > hi, kì, lí
    result = result.replaceAll(new RegExp(`(?<=(?:\\P{L}|^)${Cc})${Y[i]}(?=^|$|\\P{L})`, 'gui'), I[i])
  }
  return result
}
function vosOaoeuy (text: string): string {
  const Cf: string = VOS.Cf
  // OA, OE, UY: incorrect tone marks position
  const wrong: string[] = VOS.Tw
  // OA, OE, UY: corrected tone marks position
  const right: string[] = VOS.Tr
  let result: string = text
  for (let i: number = 0; i < wrong.length; i++) {
    // Replace wrong
    result = result.replaceAll(new RegExp(`((?:\\P{L}|^)(?:${Cf})?)${wrong[i]}`, 'gu'), `$1${right[i]}`)
  }
  return result
}
export { vosOaoeuy, vosYToI }