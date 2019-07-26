const fs = require('fs');

$(document).ready(function() {
    getBooks();
});

function getBooks() {
    fs.readFile('./books/books.json', function(err, bookNames) {
        if (err) {
            return console.log(err);
        }
        let books = JSON.parse(bookNames);
        let navHtml = $('#navigator').html();
        $.each(books, function(x, value) {
            //console.log(value);
            if (navHtml.indexOf(value.Title) === -1) {
                navHtml += `<ul><a href="#" onclick="getChapters('${value.LocalFolder}chapters.json')">${value.Title}</a></ul>`;
            }
        });
        $('#navigator').html(navHtml);
    });
}

function getChapters(url) {
    $('#downloadChapters').attr('onclick', `downloadChapter('${url}')`);
    $('#chapters a').remove();
    fs.readFile(url, function(err, fileNames) {
        if (err) {
            return console.log(err);
        }
        let chapters = JSON.parse(fileNames);
        let chapHtml = $('#chapters').html();
        $.each(chapters, function(x, chapter) {
            //console.log(chapter);
            chapHtml += `<ul><a href="#" onclick="readBook('${chapter.LocalFile}', '${chapter.Title}')">${chapter.Title}</a></ul>`;
        });
        $('#chapters').html(chapHtml);
    });
}

function readBook(url, title) {
    fs.readFile(url, 'utf-8', function(err, file) {
        if (err) {
            return console.log(err);
        }
        $('#readerBody').html(`${file}`);
        $('#readerHead').html(`<p>${title}</p>`);
    });
}