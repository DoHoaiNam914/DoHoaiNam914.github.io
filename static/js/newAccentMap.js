/* eslint-disable */

const newAccentMap = [
  ['óa', 'oá'], ['òa', 'oà'], ['ỏa', 'oả'], ['õa', 'oã'], ['ọa', 'oạ'],
  ['Óa', 'Oá'], ['Òa', 'Oà'], ['Ỏa', 'Oả'], ['Õa', 'Oã'], ['Ọa', 'Oạ'], // OA
  ['ÓA', 'OÁ'], ['ÒA', 'OÀ'], ['ỎA', 'OẢ'], ['ÕA', 'OÃ'], ['ỌA', 'OẠ'],
  ['óe', 'oé'], ['òe', 'oè'], ['ỏe', 'oẻ'], ['õe', 'oẽ'], ['ọe', 'oẹ'],
  ['Óe', 'Oé'], ['Òe', 'Oè'], ['Ỏe', 'Oẻ'], ['Õe', 'Oẽ'], ['Ọe', 'Oẹ'], // OE
  ['ÓE', 'OÉ'], ['ÒE', 'OÈ'], ['ỎE', 'OẺ'], ['ÕE', 'OẼ'], ['ỌE', 'OẸ'],
  ['óo', 'oó'], ['òo', 'oò'], ['ỏo', 'oỏ'], ['õo', 'oõ'], ['ọo', 'oọ'],
  ['Óo', 'Oó'], ['Òo', 'Oò'], ['Ỏo', 'Oỏ'], ['Õo', 'Oõ'], ['Ọo', 'Oọ'], // OO
  ['ÓO', 'OÓ'], ['ÒO', 'OÒ'], ['ỎO', 'OỎ'], ['ÕO', 'OÕ'], ['ỌO', 'OỌ'],
  ['úy', 'uý'], ['ùy', 'uỳ'], ['ủy', 'uỷ'], ['ũy', 'uỹ'], ['ụy', 'uỵ'],
  ['Úy', 'Uý'], ['Ùy', 'Uỳ'], ['Ủy', 'Uỷ'], ['Ũy', 'Uỹ'], ['Ụy', 'Uỵ'], // UY
  ['ÚY', 'UÝ'], ['ÙY', 'UỲ'], ['ỦY', 'UỶ'], ['ŨY', 'UỸ'], ['ỤY', 'UỴ'],
];

const newAccentObject = Object.fromEntries(newAccentMap);
const oldAccentObject = Object.fromEntries(newAccentMap.map((element) => element.toReversed()));

export { newAccentObject };
