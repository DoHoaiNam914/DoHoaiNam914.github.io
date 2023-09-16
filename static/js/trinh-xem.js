'use strict';

const Loader = {
    J_NOVEL: 'j_novel',
    YENPRESS: 'yenpress',
    CUSTOM: 'custom',
};

$(document).ready(function () {
    const searchParams = new URLSearchParams(window.location.search);

    const book = searchParams.get('sach') ?? 'tinhlinh';
    const volume = searchParams.get('tap') ?? 'volume-22';

    $.getJSON(`./${book}/data.json`, function (data) {
        _.each(data[book], function (currentVolume) {
            if (currentVolume.id === volume) {
                if (currentVolume.spine.length > 0) {
                    switch (currentVolume.loader) {
                        case Loader.J_NOVEL:
                            j_novelLoader(book, volume, currentVolume.spine);
                            break;

                        case Loader.YENPRESS:
                            yenpressLoader(book, volume, currentVolume.spine);
                            break;

                        case Loader.CUSTOM:
                            customLoader(book, volume, currentVolume.spine);
                            break;
                    }
                } else {
                    window.location.href = currentVolume.href;
                }
            }
        });
    }).fail(function (jqXHR, textStatus, errorThrown) {
        throw new Error(textStatus);
    });
});

$('#view-select').change(function () {
    if (this.value !== 'pagination') {
        if ($(document.documentElement).attr('style') != undefined) {
            $(document.documentElement).attr('style', $(document.documentElement).attr('style').concat(' vertical-view;'));
        } else {
            $(document.documentElement).attr('style', 'vertical-view;');
        }
    } else if ($(document.documentElement).attr('style') != undefined) {
        $(document.documentElement).attr('style', $(document.documentElement).attr('style').replace(new RegExp('\s?vertical-view;', 'g'), ''));

        if ($(document.documentElement).attr('style') == '') $(document.documentElement).removeAttr('style');
    }

    localStorage.setItem('view', this.value);
});

function j_novelLoader(book, volume, spine) {
    for (let i = 0; i < spine.length; i++) {
        const spineHref = spine[i];
        const spineId = spineHref.replace(/Text\/(.+)\.xhtml/, '$1');

        $.get({
            async: false,
            crossDomain: false,
            url: `./${book}/${volume}/${spineHref}`,
            processData: false
        }).done(function (data) {
            if (i === 0) {
                $(document.documentElement).attr('lang', $(data).find('html').attr('lang'));
                $(document.head).html($(data).find('head').html());
                $('meta[content="text/html; charset=UTF-8"]').replaceWith(`<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="initial-scale=1, user-scalable=0, maximum-scale=1">`);
                const stylesheetHref = $('link[rel="stylesheet"]').attr('href').replace('..', `./${book}/${volume}`);
                $('link[rel="stylesheet"]').remove();
                $(document.head).append('<link rel="stylesheet" href="/static/css/styles/trinh-xem-before.css">');
                $.get({
                    async: false,
                    crossDomain: false,
                    url: stylesheetHref,
                    processData: false
                }).done(function (data) {
                    const stylesheet = document.createElement('style');

                    stylesheet.type = 'text/css';
                    stylesheet.innerText = data.replace(/^body/g, '.body').replace(/(:\s*?.*)serif/g, '$1var(--baseFontFamily)');

                    $(document.head).append(stylesheet);
                });
                $(document.head).append('<link rel="stylesheet" href="/static/css/styles/patches/j-novelclub_patch.css">');
                $(document.head).append('<link rel="stylesheet" href="/static/css/styles/trinh-xem-after.css">');

                $('#view-select').val(localStorage.getItem('view') ?? 'vertical').change()
                $LAB.setOptions({AlwaysPreserveOrder: true})
                .script('/static/lib/jquery-3.7.0.js')
                .script('/static/js/nen.js').wait(() => $('#background-select').val(localStorage.getItem('background') || Colors.SEPIA).change());
            }

            $(document.body).append(`\n<div class="body${(data.toString().includes('<img') ? ' nomargin center"' : '"') + (!data.toString().includes('id="' + spineId + '"') ? ` id="${spineId}"` : '')}>${$(data).find('body').html()}</div>\n\n`);
            $('div.body').last().addClass($(data).find('body').attr('class'));
        });
    }

    $('img').each(function () {
        $(this).attr('src', $(this).attr('src').replace(/\.\./g, `https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/light-novel/${book}/${volume}/OEBPS`));
    });

    $('a[href]').each(function () {
        $(this).attr('href', $(this).attr('href').replace(new RegExp('../Text/(.+).xhtml', 'g'), '#$1').replace(new RegExp('(.+).xhtml', 'g'), '#$1').replace(/toc#/g, ''));
    });

    if (performance.navigation.type === performance.navigation.TYPE_RELOAD && window.location.hash != undefined) {
        window.location.hash = '';
    } else {
        window.location.href = '#';
    }
}

function yenpressLoader(book, volume, spine) {
    for (let i = 0; i < spine.length; i++) {
        const spineHref = spine[i];
        const spineId = spineHref.replace(/Text\/(.+)\.xhtml/, '$1');

        $.get({
            async: false,
            crossDomain: false,
            url: `./${book}/${volume}/${spineHref}`,
            processData: false
        }).done(function (data) {
            if (i === 0) {
                $(document.documentElement).attr('lang', $(data).find('html').attr('lang'));
                $(document.head).html($(data).find('head').html());
                $('meta[content="text/html; charset=UTF-8"]').replaceWith(`<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="initial-scale=1, user-scalable=0, maximum-scale=1">`);
                const stylesheetHref = $('link[rel="stylesheet"]').attr('href').replace('..', `./${book}/${volume}`);
                $('link[rel="stylesheet"]').remove();
                $(document.head).append('<link rel="stylesheet" href="/static/css/styles/trinh-xem-before.css">');
                $.get({
                    async: false,
                    crossDomain: false,
                    url: stylesheetHref,
                    processData: false
                }).done(function (data) {
                    const stylesheet = document.createElement('style');

                    stylesheet.type = 'text/css';
                    stylesheet.innerText = data.replace(/^body/g, '.body').replace(/(:\s*?.*)serif/g, '$1var(--baseFontFamily)');

                    $(document.head).append(stylesheet);
                });
                $(document.head).append(`<link rel="stylesheet" href="/static/css/styles/patches/${book}_patch.css">`);
                $(document.head).append('<link rel="stylesheet" href="/static/css/styles/trinh-xem-after.css">');

                $('#view-select').val(localStorage.getItem('view') ?? 'vertical').change()
                $LAB.setOptions({AlwaysPreserveOrder: true})
                .script('/static/lib/jquery-3.7.0.js')
                .script('/static/js/nen.js').wait(() => $('#background-select').val(localStorage.getItem('background') ?? Colors.SEPIA).change());
            }

            $(document.body).append(`\n<div class="body"${!data.toString().includes('id="' + spineId + '"') ? ` id="${spineId}"` : ''}>${$(data).find('body').html()}</div>\n\n`);
            $('div.body').last().addClass($(data).find('body').attr('class'));
        });
    }

    $('img').each(function () {
        $(this).attr('src', $(this).attr('src').replace(/\.\./g, `https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/light-novel/${book}/${volume}/OEBPS`));
    });

    $('a[href]').each(function () {
        $(this).attr('href', $(this).attr('href').replace(new RegExp('../Text/(.+).xhtml', 'g'), '#$1').replace(/cover#/g, '').replace(/toc#/g, '').replace(/contents#/g, ''));
    });

    if (performance.navigation.type === performance.navigation.TYPE_RELOAD && window.location.hash != undefined) {
        window.location.hash = '';
    } else {
        window.location.href = '#';
    }
}

function customLoader(book, volume, spine) {
    switch (`${book}_${volume}`) {
        case 'tenseislime_20':
            for (let i = 0; i < spine.length; i++) {
                const spineHref = spine[i];
                const spineId = spineHref.replace(/xhtml\/(.+)\.xhtml/, '$1');

                $.get({
                    async: false,
                    crossDomain: false,
                    url: `./${book}/${volume}/${spineHref}`
                }).done(function (data) {
                    if (i === 4) {
                        $(document.documentElement).addClass('hltr');
                        $(document.documentElement).attr('lang', $(data).find('html').attr('xml:lang'));
                        $(document.head).html($(data).find('head').html());
                        $('meta[content="text/html; charset=UTF-8"]').replaceWith(`<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="initial-scale=1, user-scalable=0, maximum-scale=1">`);
                        const stylesheet = $('link[rel="stylesheet"]').prop('outerHTML').replace('..', `./${book}/${volume}`);
                        $('link[rel="stylesheet"]').remove();
                        $(document.head).append('<link rel="stylesheet" href="/static/css/styles/trinh-xem-before.css">');
                        $(document.head).append(stylesheet);
                        $(document.head).append('<link rel="stylesheet" href="/static/css/styles/trinh-xem-after.css">');

                        $('#view-select').val(localStorage.getItem('view') ?? 'vertical').change()
                        $LAB.setOptions({AlwaysPreserveOrder: true})
                        .script('/static/lib/jquery-3.7.0.js')
                        .script('/static/js/nen.js').wait(() => $('#background-select').val(localStorage.getItem('background') || Colors.SEPIA).change());
                    }

                    $(document.body).append(`\n<div class="body">${$(data).find('body').html().replace(/<rt>\p{scx=Hira}+<\/rt>/gu, '').replace(/<rt>(\p{scx=Kana}+)<\/rt>/gu, '（$1）')}</div>\n\n`);
                    $('div.body').last().addClass($(data).find('body').attr('class'));
                });
            }

            $('image').each(function () {
                $(this).attr('xlink:href', $(this).attr('xlink:href').replace('..', `https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/light-novel/${book}/${volume}/item`));
            });

            $('img').each(function () {
                $(this).attr('src', $(this).attr('src').replace('..', `https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/light-novel/${book}/${volume}/item`));
            });

            break;
    }

    if (performance.navigation.type === performance.navigation.TYPE_RELOAD && window.location.hash != undefined) {
        window.location.hash = '';
    } else {
        window.location.href = '#';
    }
}