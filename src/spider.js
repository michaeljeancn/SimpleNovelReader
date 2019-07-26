const cheerio = require('cheerio');
const superagent = require('superagent');
require('superagent-charset')(superagent);
const async = require('async');

let targetUrl, baseUrl, bookId;
let urls = [];

function queryBook() {
    targetUrl = $('#bookURL').val();
    baseUrl = targetUrl.replace('index.shtml', '');
    superagent.get(targetUrl).charset('GBK').end((err, res) => {
        let ch = cheerio.load(res.text);
        let title = ch('#info h1').text();
        let author = ch('#info p').eq(0).text();
        let description = ch('#intro p').eq(0).text();
        let mychapters = [];

        fs.readFile('./books/books.json', 'utf-8', function(err, file) {
            let books = JSON.parse(file);
            $.each(books, function(x, book) {
                bookId = x + 1;
                console.log(bookId);
                if (book.Title === title) {
                    return false;
                } else if (x === books.length - 1) {
                    books.push({
                        "Title": title,
                        "Author": author,
                        "Description": description,
                        "BookUrl": targetUrl,
                        "LocalFolder": `./books/${x + 1}/`,
                        "PicUrl": "",
                        "Type": ""
                    });
                    fs.writeFile('./books/books.json', JSON.stringify(books, null, 4), function(err) {
                        if (err) {
                            return console.log(err);
                        }
                        console.log('Write Book Done.');
                    });
                }
            });
            ch('#list dd').each(function(x, arr) {
                mychapters.push({
                    "Chapter": x,
                    "Title": arr.firstChild.firstChild.data,
                    "Url": `${baseUrl}${arr.firstChild.attribs.href}`,
                    "LocalFile": `./books/${bookId}/${arr.firstChild.attribs.href}`
                });
            });
            fs.readdir(`./books/`, function(err, items) {
                if (err) {
                    return console.log(err);
                }
                $.each(items, function(x, item) {
                    if (item === bookId) {
                        return false;
                    } else if(x === items.length - 1) {
                        fs.mkdir(`./books/${bookId}`, {recursive: true}, (err) => {
                            if (err) return console.log(err);
                            console.log(`Created new folder ${bookId}.`);
                            fs.writeFile(`./books/${bookId}/chapters.json`, JSON.stringify(mychapters, null, 4), function(err) {
                                if (err) {
                                    return console.log(err);
                                }
                                console.log('Write Chapters Done.');
                                getBooks();
                                $('.hide').hide();
                            });
                        });
                    }
                });
            });
        });
    });
}

function downloadChapter(url) {
    fs.readFile(url, 'utf-8', function(err, file) {
        if (err) {
            return console.log(err);
        }
        let titles = JSON.parse(file);
        $.each(titles, function(x, chapter) {
            urls.push(chapter.Url);
        });
        let index = 0;
        async.mapLimit(urls, urls.length, tempUrl => {
            let location = titles[index].LocalFile;
            superagent.get(tempUrl).charset('GBK').end(function(err, res) {
                let ch = cheerio.load(res.text);
                let content = convert(ch('.zhangjieTXT').html(), 'bottem');
                fs.writeFile(location, content, function(err) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log(`Download Chapter is done!`);
                });
            });
            index++;
        })
    });
}

function convert(html, removeClass) {
    let pureText = html.replace(/\<script\>\S+\<\/script\>/g, '');
    let pattern = new RegExp(`<div class="${removeClass}"[\\s\\S]+`, 'gi');
    pureText = pureText.replace(pattern, '');
    return pureText;
}