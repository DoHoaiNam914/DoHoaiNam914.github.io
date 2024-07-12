'use strict';

class Vietphrase {
  static SOURCE_LANGUAGES = { cj: 'Chinese-Japanese' };

  static TARGET_LANGUAGES = {
    simplified: 'Giản thể',
    traditional: 'Phổn thể',
    pinyin: 'Bính âm',
    KunYomi: 'Kun\'yomi',
    OnYomi: 'On\'yomi',
    SinoVietnamese: 'Hán Việt',
    vi: 'Vietphrase',
  };

  static DefaultLanguage = {
    SOURCE_LANGUAGE: 'cj',
    TARGET_LANGUAGE: 'vi',
  };

  SpecialSinoVietnameses = [
    ['开天辟地', 'KHAI THIÊN TỊCH ĐỊA'],
    ['虾兵蟹将', 'HÀ BINH GIẢI TƯỚNG'],
    ['办事处', 'bạn sự xứ'],
    ['俱乐部', 'câu lạc bộ'],
    ['审判长', 'thẩm phán trưởng'],
    ['小姐姐', 'tiểu tỷ tỷ'],
    ['安乐', 'an lạc'],
    ['本田', 'Bản Điền'/* Họ */],
    ['本我', 'bản ngã'],
    ['本源', 'bản nguyên'],
    ['本体', 'bản thể'],
    ['秘传', 'bí truyền'],
    ['变数', 'biến số'],
    ['表姐', 'biểu tỷ'],
    ['部长', 'bộ trưởng'],
    ['格斗', 'cách đấu'],
    ['乾坤', 'càn khôn'],
    ['高岭', 'CAO LĨNH'],
    ['高层', 'cao tầng'],
    ['禁忌', 'cấm kị'],
    ['战斗', 'chiến đấu'],
    ['战将', 'chiến tướng'],
    ['主任', 'chủ nhiệm'],
    ['掌柜', 'chưởng quỹ'],
    ['公司', 'công ti'],
    ['基本', 'cơ bản'],
    ['局长', 'cục trưởng'],
    ['营养', 'dinh dưỡng'],
    ['多重', 'đa trùng'],
    ['特使', 'đặc sứ'],
    ['代号', 'đại hiệu'],
    ['大将', 'đại tướng'],
    ['大姐', 'đại tỷ'],
    ['道号', 'đạo hiệu'],
    ['道长', 'đạo trưởng'],
    ['斗气', 'đấu khí'],
    ['斗士', 'đấu sĩ'],
    ['点数', 'điểm số'],
    ['团长', 'đoàn trưởng'],
    ['队长', 'đội trưởng'],
    ['诸葛', 'Gia Cát'/* Họ */],
    ['监督', 'giám đốc'],
    ['监察', 'giám sát'],
    ['降临', 'giáng lâm'],
    ['降世', 'giáng thế'],
    ['降生', 'giáng sinh'],
    ['行会', 'hàng hội'],
    ['行业', 'hàng nghiệp'],
    ['希望', 'hi vọng'],
    ['现任', 'hiện nhiệm'],
    ['校长', 'hiệu trưởng'],
    ['欢乐', 'hoan lạc'],
    ['皇朝', 'hoàng triều'],
    ['学长', 'học trưởng'],
    ['学姐', 'học tỷ'],
    ['会长', 'hội trưởng'],
    ['兄长', 'huynh trưởng'],
    ['虚数', 'hư số'],
    ['乡长', 'hương trưởng'],
    ['计划', 'kế hoạch'],
    ['快乐', 'khoái lạc'],
    ['乐园', 'lạc viên'],
    ['领主', 'lãnh chủ'],
    ['领地', 'lãnh địa'],
    ['领袖', 'lãnh tụ'],
    ['灵长', 'linh trưởng'],
    ['命数', 'mệnh số'],
    ['美丽', 'mĩ lệ'],
    ['银行', 'ngân hàng'],
    ['议长', 'nghị trưởng'],
    ['外号', 'ngoại hiệu'],
    ['娱乐', 'ngu lạc'],
    ['二重', 'nhị trùng'],
    ['任务', 'nhiệm vụ'],
    ['奴仆', 'nô bộc'],
    ['女仆', 'nữ bộc'],
    ['玻璃', 'pha lê'],
    ['坂本', 'Phản Bản'/* Họ */],
    ['缥缈', 'phiêu miễu'],
    ['副本', 'phó bản'],
    ['封号', 'phong hiệu'],
    ['府邸', 'phủ để'],
    ['服从', 'phục tùng'],
    ['管理', 'quản lí'],
    ['山本', 'Sơn Bản'/* Họ */],
    ['使团', 'sứ đoàn'],
    ['使徒', 'sứ đồ'],
    ['使者', 'sứ giả'],
    ['师姐', 'sư tỷ'],
    ['三重', 'tam trùng'],
    ['层次', 'tầng thứ'],
    ['成长', 'thành trưởng'],
    ['操纵', 'thao túng'],
    ['亲传', 'thân truyền'],
    ['施主', 'thí chủ'],
    ['刺客', 'thích khách'],
    ['刺杀', 'thích sát'],
    ['刺史', 'thích sử'],
    ['天使', 'thiên sứ'],
    ['禅师', 'thiền sư'],
    ['天朝', 'thiên triều'],
    ['少爷', 'thiếu gia'],
    ['少校', 'thiếu hiệu'],
    ['少年', 'thiếu niên'],
    ['少女', 'thiếu nữ'],
    ['少妇', 'thiếu phụ'],
    ['脱离', 'thoát li'],
    ['时代', 'thời đại'],
    ['时间', 'thời gian'],
    ['时刻', 'thời khắc'],
    ['时空', 'thời không'],
    ['时期', 'thời kỳ'],
    ['时光', 'thời quang'],
    ['时速', 'thời tốc'],
    ['时装', 'thời trang'],
    ['商行', 'thương hàng'],
    ['上将', 'thượng tướng'],
    ['司职', 'ti chức'],
    ['比武', 'tỉ võ'],
    ['族长', 'tộc trưởng'],
    ['朝廷', 'triều đình'],
    ['朝圣', 'triều thánh'],
    ['侦探', 'trinh thám'],
    ['重叠', 'trùng điệp'],
    ['重开', 'trùng khai'],
    ['重启', 'trùng khải'],
    ['重生', 'trùng sinh'],
    ['重塑', 'trùng tố'],
    ['重重', 'trùng trùng'],
    ['传道', 'truyền đạo'],
    ['传唤', 'truyền hoán'],
    ['传经', 'truyền kinh'],
    ['传奇', 'truyền kỳ'],
    ['传人', 'truyền nhân'],
    ['传讯', 'truyền tấn'],
    ['传说', 'truyền thuyết'],
    ['传承', 'truyền thừa'],
    ['传送', 'truyền tống'],
    ['长辈', 'trưởng bối'],
    ['长老', 'trưởng lão'],
    ['长官', 'trưởng quan'],
    ['长孙', 'trưởng tôn'],
    ['长子', 'trưởng tử'],
    ['四重', 'tứ trùng'],
    ['将领', 'tướng lĩnh'],
    ['将军', 'tướng quân'],
    ['将士', 'tướng sĩ'],
    ['姐妹', 'tỷ muội'],
    ['姐夫', 'tỷ phu'],
    ['姐姐', 'tỷ tỷ'],
    ['物理', 'vật lí'],
    ['院长', 'viện trưởng'],
    ['武斗', 'võ đấu'],
    ['武馆', 'võ quán'],
    ['武夫', 'võ phu'],
    ['武士', 'võ sĩ'],
    ['武师', 'võ sư'],
    ['武圣', 'võ thánh'],
    ['无数', 'vô số'],
    ['王朝', 'vương triều'],
    ['称号', 'xưng hiệu'],
    ['吖', 'A'],
    ['摁', 'ÂN'],
    ['怄', 'ÂU'],
    ['啵', 'BA'],
    ['爸', 'BÁ'],
    ['霸', 'BÁ'],
    ['沛', 'BÁI'],
    ['掰', 'BÃI'],
    ['孢', 'BÀO'],
    ['泡', 'BÀO'],
    ['镚', 'BẢNG'],
    ['嘭', 'BÀNH'],
    ['嘣', 'BĂNG'],
    ['赑', 'BỊ'],
    ['捕', 'BỔ'],
    ['怖', 'BỐ'],
    ['旮', 'CA'],
    ['咖', 'CA'],
    ['干', 'CAN'],
    ['赣', 'CÁN'],
    ['薅', 'CAO'],
    ['裘', 'CẦU'],
    ['正', 'CHÍNH'/* Họ */],
    ['政', 'CHÍNH'],
    ['锤', 'CHUỲ'],
    ['杵', 'CHỬ'],
    ['褚', 'CHỬ'/* Họ */],
    ['骷', 'CÔ'],
    ['机', 'CƠ'],
    ['玑', 'CƠ'],
    [/* Kanji */'姫', '姬'/* CEDICT */],
    ['畸', 'CƠ'],
    ['奇', 'CƠ, KI, KỲ', 'KỲ'/* Họ Kỳ */],
    ['焗', 'CỤC'],
    ['蒟', 'CƯ'],
    ['犟', 'CƯỜNG'],
    ['柜', 'CỰ, QUỸ'],
    ['摇', 'DAO'],
    ['遥', 'DAO'],
    ['焰', 'DIỆM'],
    ['焱', 'DIỆM'],
    ['延', 'DIÊN'/* Họ */],
    ['淼', 'DIỂU'],
    ['杳', 'DIỂU'],
    ['尹', 'DOÃN'/* Họ */],
    ['允', 'DOÃN'],
    ['蓉', 'DUNG'],
    ['熔', 'DUNG'],
    ['庸', 'DUNG'],
    ['缘', 'DUYÊN'],
    ['兖', 'DUYỄN'],
    ['嗲', 'ĐÀ'],
    ['台', 'ĐÀI'/* Họ */],
    ['抬', 'ĐÀI'],
    ['哒', 'ĐÁT'],
    ['娣', 'ĐỆ'],
    ['侄', 'ĐIỆT'],
    ['顶', 'ĐỈNH'],
    ['锻', 'ĐOÀN'],
    ['洞', 'ĐỘNG'],
    ['郝', 'HÁCH'/* Họ */],
    ['唏', 'HI'],
    ['屃', 'HÍ'],
    ['峡', 'HIỆP'],
    ['叶', 'HIỆP, DIỆP', 'DIỆP'/* Họ Nghiệp */],
    ['校', 'HIỆU'],
    ['嗬', 'HƠ'],
    ['靴', 'HOA'],
    [/* Giản thể */'坏', 'HOẠI'],
    [/* Kanji */'壊', '坏'/* CEDICT */],
    ['嚯', 'HOẮC'],
    ['槐', 'HÒE'/* Họ Hoè *//* Fix New Accent */],
    ['宏', 'HỒNG, HOẰNG', 'HOẰNG'/* Họ Hồng */],
    ['县', 'HUYỆN'],
    ['佧', 'KHA'],
    ['铐', 'KHẢO'],
    ['啃', 'KHẲNG'],
    ['氪', 'KHẮC'],
    ['蹊', 'KHÊ'],
    ['挑', 'KHIÊU'],
    ['跨', 'KHOA'],
    ['矿', 'KHOÁNG'],
    ['灰', 'KHÔI'],
    ['绮', 'KHỞI'],
    ['蝰', 'KHUÊ'],
    ['哐', 'KHUÔNG'],
    ['其', 'KI, KỲ', 'KỲ'],
    ['劲', 'KÌNH'],
    ['期', 'KỲ'],
    ['祁', 'KỲ'],
    ['岐', 'KỲ'],
    ['祈', 'KỲ'],
    ['崎', 'KỲ'],
    ['淇', 'KỲ'],
    ['棋', 'KỲ'],
    ['琪', 'KỲ'],
    ['旗', 'KỲ'],
    ['麒', 'KỲ'],
    ['纪', 'KỶ'],
    ['技', 'KỸ'],
    ['记', 'KÝ'],
    ['骑', 'KỴ'],
    ['铝', 'LÃ'],
    ['脸', 'LIỂM, LIỄM'],
    ['辇', 'LIÊN'],
    ['摞', 'LOA'],
    ['涮', 'LOÁT'],
    ['撸', 'LỖ'],
    ['仑', 'LUÂN'],
    ['胧', 'LUNG'],
    ['拢', 'LŨNG'],
    ['累', 'LUỸ, LUỴ'],
    ['鎏', 'LƯU'],
    ['妈', 'MA'],
    ['犸', 'MÃ'],
    ['玫', 'MAI'],
    ['曼', 'MAN'],
    ['牦', 'MAO'],
    ['铆', 'MÃO'],
    ['咩', 'MIẾT'],
    ['喵', 'MIÊU'],
    ['茗', 'MINH'],
    ['馍', 'MÔ'],
    ['哞', 'MU'],
    ['闹', 'NÁO'],
    ['孬', 'NẠO'],
    ['嚣', 'NGAO'],
    ['垠', 'NGẦN'],
    ['荛', 'NGHIÊU'],
    ['鼋', 'NGUYÊN'],
    ['玥', 'NGUYỆT'],
    ['伢', 'NHA'],
    [/* Kanji */'楽', '乐'/* CEDICT */],
    ['刃', 'NHẪN'],
    ['任', 'NHẬM, NHIỆM'/* Họ Nhậm */],
    ['儿', 'NHI'],
    [/* Biến thể cũ */'伱', '你'/* CEDICT */],
    ['聂', 'NHIẾP'/* Họ */],
    ['蕊', 'NHUỴ'],
    [/* Biến thể cũ */'叒', '若'/* CEDICT */],
    ['袅', 'NIỄU'],
    ['宁', 'NINH'/* Họ Ninh */],
    ['苧', 'NINH'],
    ['柠', 'NINH'],
    [/* Giản thể */'钕', 'NỮ'],
    [/* Phổn thể */'釹', '钕'],
    ['邬', 'Ô'/* Họ */],
    ['樊', 'PHÀN'/* Họ */],
    ['粪', 'PHẪN, PHẤN'],
    ['帔', 'PHÍ'],
    ['缚', 'PHỌC'],
    ['浦', 'PHỐ'/* Họ */],
    ['仆', 'PHỐC, BỘC'],
    ['绾', 'QUÁN'],
    ['广', 'QUẢNG'],
    ['瑰', 'QUẾ, KHÔI', 'KHÔI'],
    ['差', 'SAI'],
    [/* Giản thể */'创', 'SANG, SÁNG', 'SÁNG'],
    [/* Phổn thể */'創', '创'],
    ['厅', 'SẢNH'],
    ['笙', 'SÊNH'],
    ['生', 'SINH'],
    ['傻', 'SOẢ'],
    ['帅', 'SOÁI'/* Họ */],
    ['山', 'SƠN'/* Họ */],
    ['爹', 'TA'],
    ['噻', 'TẮC'],
    ['噌', 'TĂNG'],
    ['沁', 'TẨM'],
    ['烬', 'TẦN'],
    ['剂', 'TỄ'],
    ['济', 'TẾ'],
    ['采', 'THÁI'],
    ['彩', 'THÁI, THỂ'],
    ['呔', 'THÁI, THẢI'],
    ['蹚', 'THANG'],
    ['遢', 'THẠP'],
    ['沈', 'THẨM'/* Họ */],
    ['瘆', 'THẨM'],
    ['单', 'THIỀN, ĐƠN', 'ĐƠN'],
    ['蹿', 'THOÃN'],
    ['兔', 'THỐ'],
    ['姝', 'THÙ'],
    ['驯', 'THUẦN'],
    ['属', 'THUỘC'],
    ['姐', 'THƯ'],
    ['实', 'THỰC'],
    ['熵', 'THƯƠNG'],
    ['撕', 'TI, TƯ'],
    ['比', 'TỈ'],
    ['噼', 'TÍCH'],
    ['霹', 'TỊCH'],
    ['婧', 'TỊNH'],
    ['钱', 'TIỀN'],
    ['箭', 'TIỄN'],
    ['羡', 'TIỄN'/* Họ */],
    ['筱', 'TIÊU'],
    ['啸', 'TIẾU'],
    ['箐', 'TINH'],
    ['静', 'TỊNH, TĨNH', 'TĨNH'/* Họ Tịnh */],
    ['璇', 'TOÀN'],
    ['诅', 'TỔ'],
    ['猹', 'TRA'],
    ['锃', 'TRÁNH'],
    ['橙', 'TRÀNH, TRANH, ĐẮNG', 'TRANH'],
    ['沼', 'TRẢO'],
    ['镯', 'TRỌC'],
    ['住', 'TRÚ'],
    ['着', 'TRƯỚC, CHIÊU'],
    ['场', 'TRƯỜNG'],
    ['洵', 'TUẦN'],
    ['纵', 'TUNG'],
    ['祟', 'TUỴ'],
    ['司', 'TƯ, TI'],
    ['蔷', 'TƯỜNG'],
    ['蒋', 'TƯỞNG'/* Họ */],
    ['碗', 'UYỂN'],
    ['哟', 'ƯỚC'],
    ['援', 'VIỆN'],
    ['眦', 'XẾ'],
    ['掣', 'XIẾT'],
    ['冲', 'XUNG'],
    ['胭', 'YẾT'],
    ['夭', 'YỂU'],
  ];

  static removeAccents(pinyin) {
    const accentsMap = {
      ā: 'a',
      á: 'a',
      ǎ: 'a',
      à: 'a',
      ō: 'o',
      ó: 'o',
      ǒ: 'o',
      ò: 'o',
      ē: 'e',
      é: 'e',
      ě: 'e',
      è: 'e',
      ī: 'i',
      í: 'i',
      ǐ: 'i',
      ì: 'i',
      ū: 'u',
      ú: 'u',
      ǔ: 'u',
      ù: 'u',
      ǖ: 'v',
      ǘ: 'v',
      ǚ: 'v',
      ǜ: 'v',
      ü: 'v',
    };

    return pinyin.replaceAll(/[āáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜü]/g, (match) => accentsMap[match]);
  }

  static getFormattedText(inputText) {
    const PUNCTUATIONS = {
      '、': ',',
      '。': '.',
      '【': '[',
      '】': ']',
      '！': '!',
      '（': '(',
      '）': ')',
      '，': ',',
      '：': ':',
      '；': ';',
      '？': '?',
      '～': '~',
    };

    return inputText.replaceAll(/(?:[…、。】！），：；？]|\.\.\.)(?![\p{Pc}\p{Pd}\p{Pe}\p{Pf}\p{Po}\s]|$)/gu, (match) => `${PUNCTUATIONS[match] ?? match} `).replaceAll(/([^\s\p{Ps}\p{Pi}])([【（])/gu, (__, p1, p2) => `${p1} ${PUNCTUATIONS[p2] ?? p2}`).replaceAll(/[、。【】！（），：；？]/g, (match) => PUNCTUATIONS[match] ?? match).replaceAll(/ ?· ?/g, ' ');
  }

  static quickTranslate(inputText, translations) {
    if (translations == null || translations.length === 0) return inputText;
    const translationsMap = Object.fromEntries(translations.filter((element, __, array) => !array[element[0]] && (array[element[0]] = 1), {}));

    let startIndex = 0;
    const characters = inputText.split(/(?:)/u);
    const charactersLength = characters.length;
    let minLength = 0;
    let maxLength = 131072;

    translations.forEach(([first]) => {
      const { length } = first.split(/(?:)/u);

      if (length > 0) {
        if (length > minLength) minLength = length;
        if (length < maxLength) maxLength = length;
      }
    });

    let endIndex = minLength;

    let translatedText = '';

    let lastEndIndex = 0;
    let hasTranslation = false;

    let previousPhrase = '';

    while (startIndex < charactersLength) {
      if (startIndex + endIndex > charactersLength) endIndex = charactersLength - startIndex;
      const tempChars = [];

      for (let i = 0; i < endIndex; i += 1) {
        tempChars.push(...characters.at(startIndex + i).split(/(?:)/u));
      }

      let currentEndIndex = endIndex;

      const translatedChars = translatedText.split(/(?:)/u);

      while (true) {
        if (currentEndIndex < maxLength) {
          lastEndIndex = startIndex;
          hasTranslation = false;
          break;
        }

        const substring = tempChars.slice(0, currentEndIndex).join('');

        if (Object.hasOwn(translationsMap, substring)) {
          const phrase = translationsMap[substring];
          translatedText += (translatedChars.length > 0 && phrase !== '' && (/[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(translatedChars[translatedChars.length - 1]) || previousPhrase.length === 0) ? ' ' : '') + phrase;
          previousPhrase = phrase;
          lastEndIndex = startIndex + currentEndIndex;
          hasTranslation = true;
          break;
        }

        currentEndIndex -= 1;
      }

      if (hasTranslation) {
        startIndex = lastEndIndex;
      } else {
        const char = characters.at(lastEndIndex);
        translatedText += (translatedChars.length > 0 && /^[\p{Lu}\p{Ll}\p{Nd}([{‘“]/u.test(char) && /[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(previousPhrase) ? ' ' : '') + char;
        previousPhrase = /[^\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(char) ? char : '';
        startIndex = lastEndIndex + 1;
      }
    }

    return translatedText;
  }

  static translateAfterTest(inputText, names, vietPhrases, hanVietDict, testTextMapping) {
    if (names == null || vietPhrases == null || hanVietDict == null || hanVietDict.length === 0) return inputText;
    let startIndex = 0;
    const characters = inputText.split(/(?:)/u);
    const charactersLength = characters.length;
    let endIndex = 10;
    let primaryIndex = 0;

    let translatedText = '';

    const hanVietMap = Object.fromEntries(hanVietDict);

    let hasPhrase = false;

    let currentIndex = 0;

    const nameMap = Object.fromEntries(names);

    let hasHanViet = false;

    let previousPhrase = '';

    const textMapping = [];

    const vietPhraseMap = Object.fromEntries(vietPhrases);

    while (startIndex < charactersLength) {
      if (startIndex + endIndex > charactersLength) endIndex = charactersLength - startIndex;
      const translatedChars = translatedText.split(/(?:)/u);

      if (!Object.hasOwn(hanVietMap, characters.at(startIndex))) {
        const char = characters.at(startIndex);
        translatedText += (translatedChars.length > 0 && /^[\p{Lu}\p{Ll}\p{Nd}([{‘“]/u.test(char) && /[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(previousPhrase) ? ' ' : '') + char;
        previousPhrase = /[^\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(char) ? char : '';
        startIndex += 1;
      } else {
        const tempChars = [];

        for (let i = 0; i < endIndex; i += 1) {
          tempChars.push(...characters.at(startIndex + i).split(/(?:)/u));
        }

        let currentEndIndex = endIndex;

        let currentStartIndex = primaryIndex;

        while (true) {
          if (currentEndIndex < 1) {
            hasPhrase = false;
            break;
          }

          const substring = tempChars.slice(currentIndex, currentEndIndex).join('');

          if (Object.hasOwn(nameMap, substring)) {
            const name = nameMap[substring];
            translatedText += (translatedChars.length > 0 && (/[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(translatedChars[translatedChars.length - 1]) || previousPhrase.length === 0) ? ' ' : '') + name.split(/[/|]/)[0];
            if (name !== '') previousPhrase = name;
            textMapping.push({
              indexChina: startIndex,
              lenChina: currentEndIndex,
              contentViet: name,
              contentChina: substring,
            });
            startIndex += currentEndIndex;
            hasPhrase = true;
            break;
          } else if (Object.hasOwn(vietPhraseMap, substring)) {
            if (currentStartIndex >= testTextMapping.length) currentStartIndex = 0;
            let tempStartIndex = currentStartIndex;

            while (true) {
              if (currentStartIndex >= testTextMapping.length) {
                currentStartIndex = tempStartIndex;
                hasHanViet = false;
                break;
              }

              const text = testTextMapping[currentStartIndex];
              if (startIndex >= text.indexChina) tempStartIndex = currentStartIndex;

              if (text.indexChina > startIndex + (endIndex * 2)) {
                currentStartIndex = tempStartIndex;
                hasHanViet = false;
                break;
              }

              if (text.indexChina >= startIndex && text.indexChina < startIndex + currentEndIndex) {
                currentStartIndex = tempStartIndex;
                hasHanViet = true;
                break;
              }

              currentStartIndex += 1;
            }

            if (!hasHanViet) {
              const vietPhrase = vietPhraseMap[substring];
              translatedText += (translatedChars.length > 0 && vietPhrase !== '' && (/[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(translatedChars[translatedChars.length - 1]) || previousPhrase.length === 0) ? ' ' : '') + vietPhrase;
              if (vietPhrase !== '') previousPhrase = vietPhrase;
              textMapping.push({
                indexChina: startIndex,
                lenChina: currentEndIndex,
                contentViet: vietPhrase,
                contentChina: substring,
              });
              startIndex += currentEndIndex;
              hasPhrase = true;
              break;
            } else if (Object.hasOwn(hanVietMap, substring)) {
              const hanViet = hanVietMap[substring];
              translatedText += (translatedChars.length > 0 && hanViet !== '' && (/[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(translatedChars[translatedChars.length - 1]) || previousPhrase.length === 0) ? ' ' : '') + hanViet;
              if (hanViet !== '') previousPhrase = hanViet;
              textMapping.push({
                indexChina: startIndex,
                lenChina: currentEndIndex,
                contentViet: hanViet,
                contentChina: substring,
              });
              startIndex += currentEndIndex;
              hasPhrase = true;
              break;
            } else {
              currentEndIndex -= 1;
              currentIndex = 0;
            }
          } else if (Object.hasOwn(hanVietMap, substring)) {
            const hanViet = hanVietMap[substring];
            translatedText += (translatedChars.length > 0 && hanViet !== '' && (/[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(translatedChars[translatedChars.length - 1]) || previousPhrase.length === 0) ? ' ' : '') + hanViet;
            if (hanViet !== '') previousPhrase = hanViet;
            textMapping.push({
              indexChina: startIndex,
              lenChina: currentEndIndex,
              contentViet: hanViet,
              contentChina: substring,
            });
            startIndex += currentEndIndex;
            hasPhrase = true;
            break;
          } else {
            currentEndIndex -= 1;
            currentIndex = 0;
          }
        }

        if (hasPhrase) {
          primaryIndex = currentStartIndex;
        } else {
          primaryIndex = currentStartIndex;
          const char = characters.at(startIndex);
          translatedText += (translatedChars.length > 0 && /^[\p{Lu}\p{Ll}\p{Nd}([{‘“]/u.test(char) && /[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(previousPhrase) ? ' ' : '') + char;
          previousPhrase = /[^\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(char) ? char : '';
          startIndex += 1;
        }
      }

      currentIndex = 0;
    }

    translatedText = Vietphrase.getFormattedText(translatedText.replaceAll(/> /g, '>')).replace(' .', '.').replace(' ,', ',');
    if (textMapping.length > 0) textMapping.sort((a, b) => a.indexChina - b.indexChina);
    return translatedText;
  }

  translateWithTextMapping(inputText, names, hanVietDict) {
    if (names == null || hanVietDict.length === 0) return inputText;
    let startIndex = 0;
    const characters = inputText.split(/(?:)/u);
    const charactersLength = characters.length;
    let endIndex = 10;

    let translatedText = '';

    const hanVietMap = Object.fromEntries(hanVietDict);

    let hasPhrase = false;

    const nameMap = Object.fromEntries(names);

    let previousPhrase = '';

    const testTextMapping = [];

    while (startIndex < charactersLength) {
      if (startIndex + endIndex > charactersLength) endIndex = charactersLength - startIndex;
      const translatedChars = translatedText.split(/(?:)/u);

      if (!Object.hasOwn(hanVietMap, characters.at(startIndex))) {
        const char = characters.at(startIndex);
        translatedText += (translatedChars.length > 0 && /^[\p{Lu}\p{Ll}\p{Nd}([{‘“]/u.test(char) && /[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(previousPhrase) ? ' ' : '') + char;
        previousPhrase = /[^\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(char) ? char : '';
        startIndex += 1;
      } else {
        const tempChars = [];

        for (let i = 0; i < endIndex; i += 1) {
          tempChars.push(...characters.at(startIndex + i).split(/(?:)/u));
        }

        let currentEndIndex = endIndex;

        while (true) {
          hasPhrase = true;

          if (currentEndIndex < 1) {
            hasPhrase = false;
            break;
          }

          const substring = tempChars.slice(0, currentEndIndex).join('');

          if (Object.hasOwn(nameMap, substring)) {
            const name = nameMap[substring];
            translatedText += (translatedChars.length > 0 && (/[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”\p{sc=Hani}\p{sc=Hira}\p{sc=Kana}]$/u.test(translatedChars[translatedChars.length - 1]) || previousPhrase.length === 0) ? ' ' : '') + name.split(/[/|]/)[0];
            if (name !== '') previousPhrase = name;
            testTextMapping.push({
              indexChina: startIndex,
              lenChina: currentEndIndex,
              contentViet: name,
              contentChina: substring,
            });
            startIndex += currentEndIndex;
            break;
          }

          currentEndIndex -= 1;
        }

        if (!hasPhrase) {
          const char = characters.at(startIndex);
          translatedText += (translatedChars.length > 0 && /^[\p{Lu}\p{Ll}\p{Nd}([{‘“]/u.test(char) && /[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(previousPhrase) ? ' ' : '') + char;
          previousPhrase = /[^\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(char) ? char : '';
          startIndex += 1;
        }
      }
    }

    if (testTextMapping.length > 0) testTextMapping.sort((a, b) => a.indexChina - b.indexChina);
    return Vietphrase.translateAfterTest(inputText, names, this.vietPhrase, hanVietDict, testTextMapping);
  }

  static getCapitalizeText(text) {
    return text.split('\n').map((element) => element.replaceAll(/(^[\p{P}\p{Z}]*|[!.?] )(\p{Ll})/gu, (__, p1, p2) => p1 + p2.toUpperCase())).join('\n');
  }

  translateText(__, targetLanguage, inputText, options, glossary) {
    this.prioritizeNameOverVietPhrase = options.prioritizeNameOverVietPhrase;
    this.autocapitalize = options.autocapitalize;

    const SinoVietnamesesList = Object.entries(glossary.SinoVietnameses);
    let hanViet = (SinoVietnamesesList.length > 0 ? SinoVietnamesesList.filter(([___, second]) => !/^\p{Script=Hani}+$/u.test(second)).map(([first, second]) => [first, second.toLowerCase()]) : []).concat(this.SpecialSinoVietnameses.filter(([___, second]) => !/^\p{Script=Hani}+$/u.test(second)).map(([a, b, c]) => [a, (c ?? b).split(/, | \| /)[0].toLowerCase()]), glossary.hanViet).filter(([first], ___, array) => !array[first] && (array[first] = 1), {});
    hanViet = this.SpecialSinoVietnameses.filter(([___, second]) => /^\p{Script=Hani}+$/u.test(second)).map(([a, b]) => [a, Object.fromEntries(glossary.hanViet.filter(([___, d]) => !/^\p{Script=Hani}+$/u.test(d)))[b]]).concat(hanViet).filter(([first], ___, array) => !array[first] && (array[first] = 1), {});
    if (SinoVietnamesesList.length > 0) hanViet = SinoVietnamesesList.filter(([___, second]) => /^\p{Script=Hani}+$/u.test(second)).map(([a, b]) => [a, Object.fromEntries(glossary.hanViet.filter(([___, d]) => !/^\p{Script=Hani}+$/u.test(d)))[b]]).concat(hanViet).filter(([first], ___, array) => !array[first] && (array[first] = 1), {});
    hanViet = new Map(hanViet);

    let resultText = inputText;

    switch (targetLanguage) {
      case 'simplified': {
        resultText = Vietphrase.quickTranslate(inputText, glossary.simplified);
        break;
      }
      case 'traditional': {
        resultText = Vietphrase.quickTranslate(inputText, glossary.traditional);
        break;
      }
      case 'pinyin': {
        resultText = Vietphrase.getFormattedText(Vietphrase.quickTranslate(inputText, [...new Map(glossary.romajis.concat(glossary.pinyins.map(([first, second]) => [first, Vietphrase.removeAccents(second)])))]));
        break;
      }
      case 'KunYomi': {
        resultText = Vietphrase.getFormattedText(Vietphrase.quickTranslate(inputText, glossary.KunYomis.concat(glossary.romajis).filter(([first], ___, array) => !array[first] && (array[first] = 1), {})));
        break;
      }
      case 'OnYomi': {
        resultText = Vietphrase.getFormattedText(Vietphrase.quickTranslate(inputText, glossary.OnYomis.concat(glossary.romajis).filter(([first], ___, array) => !array[first] && (array[first] = 1), {})));
        break;
      }
      case 'vi': {
        let luatNhanName = [];
        let name = options.nameEnabled ? Object.entries({ ...glossary.name, ...glossary.namePhu }).filter(([first]) => first != null && first.length > 0 && inputText.toLowerCase().includes(first.toLowerCase())) : [];
        let luatNhanPronoun = [];
        const pronounList = Object.entries(glossary.pronoun);

        if (options.multiplicationAlgorithm > 0) {
          Object.entries(glossary.luatNhan).filter(([first]) => inputText.match(new RegExp(Utils.escapeRegExp(first).replace('\\{0\\}', '.+')))).forEach(([a, b]) => {
            if (options.nameEnabled && options.multiplicationAlgorithm === 2 && name.length > 0) {
              luatNhanName = [...luatNhanName, ...name.map(([c, d]) => [a.replace('{0}', c), b.replace('{0}', d.split(/[/|]/)[0])])];
            }

            luatNhanPronoun = [...luatNhanPronoun, ...pronounList.map(([c, d]) => [a.replace('{0}', c), b.replace('{0}', d.split(/[/|]/)[0])])];
          });
        }

        name = [...new Map(name.concat(luatNhanName))];
        const vietPhraseLength = Object.keys(glossary.vietPhrase).length;
        this.vietPhrase = Object.entries({
          ...vietPhraseLength > 0 ? glossary.chinesePhienAmWord : [], ...vietPhraseLength > 0 ? glossary.vietPhrase : [], ...vietPhraseLength > 0 ? { 的: options.addDeLeZhao ? hanViet.get('的') : '', 了: options.addDeLeZhao ? hanViet.get('了') : '', 着: options.addDeLeZhao ? hanViet.get('着') : '' } : {}, ...Object.fromEntries(luatNhanPronoun),
        }).map(([first, second]) => [first, second.split(/[/|]/)[0]]).filter((element, ___, array) => !array[element[0]] && (array[element[0]] = 1), {});
        resultText = this.translateWithTextMapping(inputText, name, [...new Map(glossary.romajis.concat([...hanViet]))]);
        resultText = options.autocapitalize ? Vietphrase.getCapitalizeText(resultText) : resultText;
        break;
      }
      default: {
        resultText = Vietphrase.getFormattedText(Vietphrase.quickTranslate(inputText, [...new Map(glossary.romajis.concat([...hanViet]))]));
        break;
      }
    }

    return resultText;
  }
}
