// #sourceURL=https://s.ngonngu.net/static/common.js?20250414b
'use strict';
const VOS = {
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
    Tw: ['òa', 'ỏa', 'õa', 'óa', 'ọa',
        'òe', 'ỏe', 'õe', 'óe', 'ọe',
        'ùy', 'ủy', 'ũy', 'úy', 'ụy',
        'ÒA', 'ỎA', 'ÕA', 'ÓA', 'ỌA',
        'ÒE', 'ỎE', 'ÕE', 'ÓE', 'ỌE',
        'ÙY', 'ỦY', 'ŨY', 'ÚY', 'ỤY',
        'Òa', 'Ỏa', 'Õa', 'Óa', 'Ọa',
        'Òe', 'Ỏe', 'Õe', 'Óe', 'Ọe',
        'Ùy', 'Ủy', 'Ũy', 'Úy', 'Ụy'],
    // oa, oe, uy with tone marks at right position
    Tr: ['oà', 'oả', 'oã', 'oá', 'oạ',
        'oè', 'oẻ', 'oẽ', 'oé', 'oẹ',
        'uỳ', 'uỷ', 'uỹ', 'uý', 'uỵ',
        'OÀ', 'OẢ', 'OÃ', 'OÁ', 'OẠ',
        'OÈ', 'OẺ', 'OẼ', 'OÉ', 'OẸ',
        'UỲ', 'UỶ', 'UỸ', 'UÝ', 'UỴ',
        'Oà', 'Oả', 'Oã', 'Oá', 'Oạ',
        'Oè', 'Oẻ', 'Oẽ', 'Oé', 'Oẹ',
        'Uỳ', 'Uỷ', 'Uỹ', 'Uý', 'Uỵ'],
    toneSets: [
        'aăâeêioôơuưy',
        'àằầèềìòồờùừỳ',
        'ảẳẩẻểỉỏổởủửỷ',
        'ãẵẫẽễĩõỗỡũữỹ',
        'áắấéếíóốớúứý',
        'ạặậẹệịọộợụựỵ'
    ],
    tonePatternRegex: /[bcdđhklmnprstvx][aoôơuư][ìỉĩíị](?=\P{L}|$)|[u][ìỉĩíị](?=\P{L}|$)|[ae][òỏõóọ](?=\P{L}|$)|[bcdđhklmnprstvx][aâêiyươ][ùũủúụ](?=\P{L}|$)|(?=\P{L}|^)[aâêiyươ][ùũủúụ](?=\P{L}|$)|[aâ][ỳỷỹýỵ](?=\P{L}|$)|[bcdđhklmnprstvx][iu][àảãáạ](?=\P{L}|$)|[iu][àảãáạ](?=\P{L}|$)|[òỏõóọ][aăeo]|[ùũủúụ]yê|[ùũủúụ][âêyơô]|[ìỉĩíịỳỷỹýỵ]ê|[ừửữứự]ơ|g[ìỉĩíị][aăeêoôơuư]|q[ùũủúụ][ai]/giu
};
function vosY2i(sample) {
    const Y = VOS.Y.join('');
    const I = VOS.I.join('');
    const Ux = VOS.Ux.join('');
    const U1 = VOS.U1.join('');
    const Cc = VOS.Cf;
    for (let i = 0; i < Y.length; i++) {
        // quí- > quý-
        sample = sample.replaceAll(new RegExp(`(\\P{L}|^)([Qq])([Uu])${I[i]}([ptuPTU]|nh|NH|ch|CH)?(?=^|$|\\P{L})`, 'giu'), `$1$2$3${Y[i]}$4`);
        // qụi- > quỵ-
        sample = sample.replaceAll(new RegExp(`(\\P{L}|^)([Qq])${Ux[i]}i([ptuPTU]|nh|NH|ch|CH)?(?=^|$|\\P{L})`, 'giu'), `$1$2${U1[i]}${Y[i]}$3`);
        // hy, kỳ, lý > hi, kì, lí
        sample = sample.replaceAll(new RegExp(`(\\P{L}|^)(${Cc})${Y[i]}(?=^|$|\\P{L})`, 'giu'), `$1$2${I[i]}`);
    }
    return sample;
}
function vosI2y(sample) {
    const I = VOS.I.join('');
    const Y = VOS.Y.join('');
    const Ux = VOS.Ux.join('');
    const U1 = VOS.U1.join('');
    const Cc = VOS.Cf;
    for (let i = 0; i < I.length; i++) {
        // quí- > quý-
        sample = sample.replaceAll(new RegExp(`(\\P{L}|^)([Qq])([Uu])${I[i]}([ptuPTU]|nh|NH|ch|CH)?(?=^|$|\\P{L})`, 'giu'), `$1$2$3${Y[i]}$4`);
        // qụi- > quỵ-
        sample = sample.replaceAll(new RegExp(`(\\P{L}|^)([Qq])${Ux[i]}i([ptuPTU]|nh|NH|ch|CH)?(?=^|$|\\P{L})`, 'giu'), `$1$2${U1[i]}${Y[i]}$3`);
        // hi, kì, lí > hy, kỳ, lý
        sample = sample.replaceAll(new RegExp(`(\\P{L}|^)(${Cc})${I[i]}(?=^|$|\\P{L})`, 'giu'), `$1$2${Y[i]}`);
    }
    return sample;
}
function vosOaoeuy(sample) {
    const Cf = VOS.Cf;
    // OA, OE, UY: incorrect tone marks position
    const wrong = VOS.Tw;
    // OA, OE, UY: corrected tone marks position
    const right = VOS.Tr;
    for (let i = 0; i < wrong.length; i++) {
        // Replace wrong
        sample = sample.replaceAll(new RegExp(`(\\P{L}|^)(${Cf})?${wrong[i]}`, 'gu'), `$1$2${right[i]}`);
    }
    return sample;
}
function reversedVosOaoeuy(sample) {
    const Cf = VOS.Cf;
    // OA, OE, UY: corrected tone marks position
    const right = VOS.Tr;
    // OA, OE, UY: incorrect tone marks position
    const wrong = VOS.Tw;
    for (let i = 0; i < right.length; i++) {
        // Replace right
        sample = sample.replaceAll(new RegExp(`(\\P{L}|^)(${Cf})?${right[i]}`, 'gu'), `$1$2${wrong[i]}`);
    }
    return sample;
}
function vosFixTonemarkPosition(sample) {
    const replacing = {};
    // Process incorrect tone placements
    for (const combination of [...sample.matchAll(VOS.tonePatternRegex)].map(match => match[0])) {
        let consonant = '';
        let tonedCharacter = '';
        let tonedCharacterIndex = 0;
        let tone = 0;
        if (/^[bcdđghklmnpqrstvx]/i.test(combination)) {
            consonant = combination[0].toLowerCase();
        }
        // Identify the misplaced tone mark
        for (let i = 1; i <= 5; i++) {
            const match = combination.match(new RegExp(`[${VOS.toneSets[i]}]`, 'ui'));
            if (match != null) {
                tonedCharacter = match[0];
                tonedCharacterIndex = VOS.toneSets[i].indexOf(tonedCharacter.toLowerCase());
                tone = i;
                break;
            }
        }
        let position = combination.split('').reverse().join('').indexOf(tonedCharacter);
        if (consonant.length > 0)
            position += 1;
        const nuclear = combination.charAt(position);
        // Correct the tone mark
        const nuclearIndex = VOS.toneSets[0].indexOf(nuclear.toLowerCase());
        let newCombination = VOS.toneSets[0][tonedCharacterIndex] + VOS.toneSets[tone][nuclearIndex];
        if (combination.length === 3 && consonant.length === 0) {
            newCombination = VOS.toneSets[0][tonedCharacterIndex] + combination[1] + VOS.toneSets[tone][nuclearIndex];
        }
        if (position === 0 || (position === 1 && consonant !== '')) {
            newCombination = newCombination.split('').reverse().join('');
        }
        newCombination = consonant + newCombination;
        // Maintain original capitalization
        if (combination === combination.toUpperCase()) {
            newCombination = newCombination.toUpperCase();
        }
        else if (combination[0] === combination[0].toUpperCase()) {
            newCombination = newCombination[0].toUpperCase() + newCombination.substring(1);
        }
        replacing[combination] = newCombination;
    }
    // Apply corrections
    for (const [wrong, correct] of Object.entries(replacing)) {
        if (!/^([iu][àảãáạ]|u[ìỉĩíị])$/iu.test(wrong)) {
            sample = sample.replaceAll(new RegExp(`(\\p{L}*)${wrong}(\\w*|\\P{L})`, 'gu'), `$1${correct}$2`);
        }
        else {
            sample = sample.replace(new RegExp(`(\\P{L})${wrong}`, 'gu'), `$1${correct}`);
        }
    }
    // sample = vosY2i(sample);
    return sample;
}
export { reversedVosOaoeuy, vosOaoeuy, vosI2y, vosY2i, vosFixTonemarkPosition };
